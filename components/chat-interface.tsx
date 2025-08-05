"use client"

import type React from "react"
import { useChat } from "ai/react"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatMessage from "./chat-message"
import { AI_Prompt } from "@/components/ui/animated-ai-input"
import { useState, useCallback, useRef, useEffect } from "react"
import AgentTaskView from "./agent-task-view"
import { UploadProgress } from "./upload-progress"
import { AnimatePresence } from "framer-motion"
import { generateVideoThumbnail, getVideoDuration } from "@/lib/video-utils"
import { 
  GeneratedImage, 
  generateImageId, 
  isImageGenerationRequest, 
  extractImagePrompt,
  loadGeneratedImages,
  saveGeneratedImages 
} from "@/lib/image-utils"
import { ImageGenerationSettings } from "./image-generation-settings"
import { Button } from "@/components/ui/button"
import { Settings, TrendingUp } from "lucide-react"
import { SentimentDashboard } from './sentiment-dashboard'

interface FileUpload {
  file: File
  preview?: string
  geminiFile?: {
    uri: string
    mimeType: string
    name: string
  }
  transcription?: {
    text: string
    language?: string
    duration?: number
    segments?: any[] // For detailed timing info
  }
  videoThumbnail?: string // Add this for video thumbnail
  videoDuration?: number // Add this for video duration
}

interface ChatInterfaceProps {
  onGeneratedImagesChange?: (images: GeneratedImage[]) => void
  onImageGenerationStart?: () => void
}

export default function ChatInterface({ onGeneratedImagesChange, onImageGenerationStart }: ChatInterfaceProps) {
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash-preview-05-20")
  const [showAgentTasks, setShowAgentTasks] = useState(false)
  const [showSentimentDashboard, setShowSentimentDashboard] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'transcribing' | 'complete' | 'error'>('idle')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  
  // Image generation settings
  const [imageQuality, setImageQuality] = useState<'standard' | 'hd'>('standard')
  const [imageStyle, setImageStyle] = useState<'vivid' | 'natural'>('vivid')
  const [imageSize, setImageSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024')
  const [showImageSettings, setShowImageSettings] = useState(false)
  
  // Store object URLs for cleanup
  const objectURLsRef = useRef<Set<string>>(new Set())
  
  // Load generated images on mount
  useEffect(() => {
    const savedImages = loadGeneratedImages()
    if (savedImages.length > 0) {
      setGeneratedImages(savedImages)
      onGeneratedImagesChange?.(savedImages)
    }
  }, [])

  // Store file attachments for each message
  const [messageAttachments, setMessageAttachments] = useState<Record<string, {
    name: string
    contentType: string
    url?: string
    transcription?: {
      text: string
      language?: string
      duration?: number
      segments?: any[]
    }
    videoThumbnail?: string // Add this
    videoDuration?: number // Add this
  }[]>>({})
  
  // Track pending attachment for the next message
  const pendingAttachmentRef = useRef<{
    name: string
    contentType: string
    url?: string
    transcription?: {
      text: string
      language?: string
      duration?: number
      segments?: any[]
    }
    videoThumbnail?: string // Add this
    videoDuration?: number // Add this
  } | null>(null)

  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, error, stop, append } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
      fileUri: selectedFile?.geminiFile?.uri,
      fileMimeType: selectedFile?.geminiFile?.mimeType,
      transcription: selectedFile?.transcription, // Include transcription data
    },
    initialMessages: [
      {
        id: "welcome-message",
        role: "assistant",
        content: "Hello! I'm your TradeBuddy powered by Gemini. How can I help you today?",
      },
    ],
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  // Watch for new messages and attach pending files
  useEffect(() => {
    if (messages.length > 0 && pendingAttachmentRef.current) {
      const lastMessage = messages[messages.length - 1]
      
      // Check if this is a new user message without attachments
      if (lastMessage.role === 'user' && !messageAttachments[lastMessage.id] && pendingAttachmentRef.current) {
        console.log('Attaching file to message:', lastMessage.id, pendingAttachmentRef.current)
        
        const attachment = pendingAttachmentRef.current
        setMessageAttachments(prev => ({
          ...prev,
          [lastMessage.id]: [attachment]
        }))
        
        // Clear the pending attachment
        pendingAttachmentRef.current = null
      }
    }
  }, [messages, messageAttachments])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      // Delay cleanup to ensure URLs are still valid when needed
      setTimeout(() => {
        for (const url of objectURLsRef.current) {
          URL.revokeObjectURL(url)
        }
      }, 5000) // 5 second delay
    }
  }, [])

  // Clear local messages when real messages change (to prevent duplicates)
  // But preserve image generation success messages
  useEffect(() => {
    if (messages.length > 1) { // Keep initial welcome message check
      setLocalMessages(prev => prev.filter(msg => 
        msg.id.startsWith('img-success-') || 
        msg.id.startsWith('img-error-')
      ))
    }
  }, [messages.length])
  
  const handleFileSelect = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus('uploading')
    
    try {
      // Create preview for images, audio, and video files
      let preview: string | undefined
      let videoThumbnail: string | undefined
      let videoDuration: number | undefined
      
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file)
        objectURLsRef.current.add(preview)
      } else if (file.type.startsWith("audio/")) {
        preview = URL.createObjectURL(file)
        objectURLsRef.current.add(preview)
      } else if (file.type.startsWith("video/")) {
        // For video files, create object URL and generate thumbnail
        preview = URL.createObjectURL(file)
        objectURLsRef.current.add(preview)
        
        try {
          // Generate thumbnail at 2 seconds (or 0 if video is shorter)
          videoThumbnail = await generateVideoThumbnail(file, 2.0)
          videoDuration = await getVideoDuration(file)
          console.log('Video thumbnail generated, duration:', videoDuration)
        } catch (thumbError) {
          console.error('Failed to generate video thumbnail:', thumbError)
          // Continue without thumbnail
        }
      }
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      
      // Upload to Gemini
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (!response.ok) {
        throw new Error("Failed to upload file")
      }
      
      const data = await response.json()
      
      // Transcribe audio and video files with Whisper
      let transcription: FileUpload['transcription'] = undefined
      if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
        try {
          setUploadStatus('transcribing')
          setUploadProgress(0)
          
          // Simulate transcription progress
          const transcribeProgressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 80) {
                clearInterval(transcribeProgressInterval)
                return 80
              }
              return prev + 20
            })
          }, 300)
          
          const transcribeFormData = new FormData()
          transcribeFormData.append("file", file)
          
          const transcribeResponse = await fetch("/api/transcribe", {
            method: "POST",
            body: transcribeFormData,
          })
          
          clearInterval(transcribeProgressInterval)
          setUploadProgress(100)
          
          if (transcribeResponse.ok) {
            const transcribeData = await transcribeResponse.json()
            transcription = {
              text: transcribeData.transcription.text,
              language: transcribeData.transcription.language,
              duration: transcribeData.transcription.duration || videoDuration,
              segments: transcribeData.transcription.segments,
            }
            console.log('Transcription successful:', transcription)
          } else {
            const errorData = await transcribeResponse.json()
            console.error('Transcription failed:', errorData)
            // Show user-friendly error but continue
            if (errorData.details?.includes("25MB")) {
              console.warn('File too large for transcription')
              // You might want to show a toast notification here
            }
          }
        } catch (transcribeError) {
          console.error("Transcription error:", transcribeError)
          // Continue without transcription
        }
      }
      
      setSelectedFile({
        file,
        preview,
        geminiFile: data.file,
        transcription,
        videoThumbnail,
        videoDuration,
      })
      
      setUploadStatus('complete')
      // Hide success message after 2 seconds
      setTimeout(() => {
        setUploadStatus('idle')
        setUploadProgress(0)
      }, 2000)
      
    } catch (error) {
      console.error("File upload error:", error)
      setUploadStatus('error')
      setTimeout(() => {
        setUploadStatus('idle')
        setUploadProgress(0)
      }, 3000)
    } finally {
      setIsUploading(false)
    }
  }, [])
  
  const handleFileRemove = useCallback(() => {
    // Don't revoke the URL immediately as it might still be needed
    setSelectedFile(null)
    pendingAttachmentRef.current = null
    setUploadStatus('idle')
    setUploadProgress(0)
  }, [])
  
  // Local messages for image generation feedback
  const [localMessages, setLocalMessages] = useState<Array<{id: string, role: string, content: string}>>([])
  
  const handleImageGeneration = useCallback(async (originalPrompt: string) => {
    setIsGeneratingImage(true)
    
    // Add user's message to local messages immediately
    const userMessage = {
      id: `img-user-${Date.now()}`,
      role: "user",
      content: originalPrompt,
    }
    setLocalMessages(prev => [...prev, userMessage])
    
    // Switch to Images tab when starting generation
    onImageGenerationStart?.()
    
    try {
      console.log('Generating image with original prompt:', originalPrompt)
      
      // Extract the cleaned prompt for the API, but keep the original for display
      const cleanedPrompt = extractImagePrompt(originalPrompt)
      console.log('Cleaned prompt for API:', cleanedPrompt)
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: cleanedPrompt,  // Use cleaned prompt for API
          originalPrompt: originalPrompt,  // Send original too
          quality: imageQuality,
          style: imageStyle,
          size: imageSize,
          n: 1,
        }),
      }).catch(error => {
        console.error('Network error:', error)
        throw new Error('Failed to connect to the server. Make sure the development server is running.')
      })
      
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        throw new Error('Invalid response from image generation API')
      }
      
      if (!response.ok) {
        console.error('Image generation failed. Status:', response.status)
        console.error('Response data:', data)
        
        // Provide more detailed error message
        const errorMessage = data?.error || data?.details || `Failed to generate image (Status: ${response.status})`
        throw new Error(errorMessage)
      }
      
      console.log('Image generation response:', data)
      
      // Create GeneratedImage objects from the response
      const newImages: GeneratedImage[] = data.images.map((img: any) => ({
        id: generateImageId(),
        url: img.url,
        prompt: data.metadata.originalPrompt,
        revisedPrompt: img.revisedPrompt,
        timestamp: new Date(),
        quality: data.metadata.quality,
        style: data.metadata.style,
        size: data.metadata.size,
        model: data.metadata.model,
      }))
      
      // Update state
      const updatedImages = [...generatedImages, ...newImages]
      setGeneratedImages(updatedImages)
      saveGeneratedImages(updatedImages)
      onGeneratedImagesChange?.(updatedImages)
      
      // Add success message to local messages
      const successMessage = {
        id: `img-success-${Date.now()}`,
        role: "assistant" as const,
        content: `✨ **I've successfully generated your image!**

**Prompt:** "${newImages[0].prompt}"
**Quality:** ${newImages[0].quality.toUpperCase()}
**Style:** ${newImages[0].style || imageStyle}
**Size:** ${newImages[0].size || imageSize}

You can view it in the **Images** tab on the right.`,
      }
      setLocalMessages(prev => [...prev, successMessage])
      
    } catch (error) {
      console.error("Image generation error:", error)
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      
      // Check if it's a network error
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        const errorMsg = {
          id: `img-error-${Date.now()}`,
          role: "assistant",
          content: `❌ I couldn't connect to the image generation service.\n\nPlease check:\n\n1. **Is your development server running?**\n   Run: \`npm run dev\` or \`pnpm dev\`\n\n2. **Did the server crash?**\n   Check your terminal for errors\n\n3. **Is the server running on the correct port?**\n   Should be: http://localhost:3000`,
        }
        setLocalMessages(prev => [...prev, errorMsg])
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        const errorMsg = {
          id: `img-error-${Date.now()}`,
          role: "assistant",
          content: `⏳ Rate limit reached.\n\nThe WaveSpeed API has a rate limit to prevent abuse.\n\n**Solution:** Wait a few seconds and try again.\n\nThis is a fast, high-quality image generation service with reasonable limits.`,
        }
        setLocalMessages(prev => [...prev, errorMsg])
      } else if (errorMessage.includes('timeout')) {
        const errorMsg = {
          id: `img-error-${Date.now()}`,
          role: "assistant",
          content: `⏱️ Image generation timed out.\n\nThe generation took longer than expected (>30 seconds).\n\n**Solutions:**\n1. Try a simpler prompt\n2. Try again - it might work on the next attempt\n3. Check if the service is experiencing high load`,
        }
        setLocalMessages(prev => [...prev, errorMsg])
      } else {
        const errorMsg = {
          id: `img-error-${Date.now()}`,
          role: "assistant",
          content: `❌ I couldn't generate the image.\n\n**Error:** ${errorMessage}\n\nPlease try again or check the console for more details.`,
        }
        setLocalMessages(prev => [...prev, errorMsg])
      }
    } finally {
      setIsGeneratingImage(false)
    }
  }, [generatedImages, onGeneratedImagesChange, onImageGenerationStart])
  
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    // Prevent default form submission
    if (e) {
      e.preventDefault()
    }
    
    // Check if we have input or a file
    if (!input.trim() && !selectedFile) {
      return
    }
    
    // Check if this is an image generation request
    if (input.trim() && isImageGenerationRequest(input)) {
      // Pass the original input, not the extracted prompt
      handleImageGeneration(input)
      // Clear the input
      handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
      // Don't call originalHandleSubmit for image generation
      return
    }
    
    // For demo purposes, show the agent task view when submitting a message
    if (input.toLowerCase().includes("agent") || input.toLowerCase().includes("task")) {
      setShowAgentTasks(true)
    }
    
    // Store the attachment info before submission
    if (selectedFile) {
      pendingAttachmentRef.current = {
        name: selectedFile.file.name,
        contentType: selectedFile.file.type,
        url: selectedFile.preview || '',
        transcription: selectedFile.transcription,
        videoThumbnail: selectedFile.videoThumbnail,
        videoDuration: selectedFile.videoDuration,
      }
      console.log('Pending attachment set:', pendingAttachmentRef.current)
    }
    
    // Only call originalHandleSubmit if we have a valid message
    if (input.trim() || selectedFile) {
      originalHandleSubmit(e)
    }
    
    // Clear file after submission
    setSelectedFile(null)
  }, [input, selectedFile, originalHandleSubmit, handleImageGeneration, handleInputChange])

  const handleSendMessage = useCallback((message: string) => {
    append({
      content: message,
      role: 'user',
    })
    setShowSentimentDashboard(false)
  }, [append])

  return (
    <div className="flex flex-col h-full border-r border-[#333333] bg-[#2B2B2B]">
      <div className="p-4 border-b border-[#333333] bg-[#2B2B2B]">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">TradeBuddy</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSentimentDashboard(!showSentimentDashboard)}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Market Sentiment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageSettings(true)}
              className="text-gray-400 hover:text-white"
              title="Image Generation Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500 font-medium">Error: {error.message}</p>
            <p className="text-xs text-red-400 mt-1">The assistant will continue to work in local mode.</p>
          </div>
        )}
      </div>

      {showSentimentDashboard ? (
        <div className="flex-1 p-4">
          <SentimentDashboard onSendMessage={handleSendMessage} />
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col space-y-4">
              {messages.map((message) => {
                const attachments = messageAttachments[message.id];
                return (
                  <ChatMessage 
                    key={message.id} 
                    message={{
                      id: message.id,
                      role: message.role,
                      content: message.content,
                      createdAt: message.createdAt,
                      experimental_attachments: attachments
                    }} 
                  />
                );
              })}
              {/* Render local messages (for image generation feedback) */}
              {localMessages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={{
                    id: message.id,
                    role: message.role as "user" | "assistant" | "system",
                    content: message.content,
                    createdAt: new Date(),
                  }} 
                />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-xl px-4 py-3 bg-[#3C3C3C]">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.1s]"
                        />
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"
                        />
                      </div>
                      <span className="text-sm text-[#B0B0B0]">Gemini is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              {isGeneratingImage && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-xl px-4 py-3 bg-[#3C3C3C]">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.2s]"
                        />
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.4s]"
                        />
                      </div>
                      <span className="text-sm text-[#B0B0B0]">Generating image with WaveSpeed AI...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-[#333333]">
            <AnimatePresence>
              <UploadProgress 
                progress={uploadProgress} 
                status={uploadStatus} 
                fileName={selectedFile?.file.name}
                fileSize={selectedFile?.file.size}
              />
            </AnimatePresence>
            <div className="p-4">
              <AI_Prompt
                value={input}
                onChange={(value) => handleInputChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
                onSubmit={handleSubmit}
                onStop={stop}
                isLoading={isLoading}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onFileRemove={handleFileRemove}
              />
            </div>
          </div>
        </>
      )}

      {showAgentTasks && (
        <div className="absolute inset-0 z-50">
          <AgentTaskView isVisible={showAgentTasks} onClose={() => setShowAgentTasks(false)} />
        </div>
      )}
      
      <ImageGenerationSettings
        open={showImageSettings}
        onOpenChange={setShowImageSettings}
        quality={imageQuality}
        onQualityChange={setImageQuality}
        style={imageStyle}
        onStyleChange={setImageStyle}
        size={imageSize}
        onSizeChange={setImageSize}
      />
    </div>
  )
}