import { cn, formatDuration, getFileExtension, formatVideoDuration } from "@/lib/utils"
import { FileAudio, Image as ImageIcon, Video } from "lucide-react"
import { useState } from "react"
import { FilePreviewModal } from "./file-preview-modal"

interface MessageAttachment {
  name: string
  contentType: string
  url?: string
  transcription?: {
    text: string
    language?: string
    duration?: number
    segments?: any[]
  }
  videoThumbnail?: string
  videoDuration?: number
}

interface ChatMessageProps {
  message: {
    id: string
    role: "user" | "assistant" | "system" | "function" | "data" | "tool"
    content: string
    createdAt?: Date
    experimental_attachments?: MessageAttachment[]
  }
}

// Simple markdown parser for bold text and line breaks
function parseSimpleMarkdown(text: string) {
  // Split by double asterisks to handle bold text
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove asterisks and make bold
      const boldText = part.slice(2, -2)
      return <strong key={index} className="font-semibold">{boldText}</strong>
    }
    
    // Handle line breaks
    const lines = part.split('\n')
    return lines.map((line, lineIndex) => (
      <span key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    ))
  })
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const attachments = message.experimental_attachments
  const [selectedFile, setSelectedFile] = useState<MessageAttachment | null>(null)

  return (
    <>
      <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "max-w-[85%] rounded-xl px-4 py-3",
            isUser ? "bg-[#3C3C3C] text-white" : "bg-[#2B2B2B] text-white",
            "sm:max-w-[80%] md:max-w-[85%]"
          )}
        >
          {attachments && attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((attachment) => {
                const fileType = attachment.contentType || ''
                const key = `${message.id}-${attachment.name}`
                const fileExtension = getFileExtension(attachment.name)
                
                return (
                  <div 
                    key={key}
                    className="file-attachment cursor-pointer hover:bg-black/40 transition-colors"
                    onClick={() => setSelectedFile(attachment)}
                    title={`${attachment.name}\nClick to preview`}
                  >
                    {fileType.startsWith("image/") ? (
                      <>
                        {attachment.url && attachment.url !== '' ? (
                          <img 
                            src={attachment.url} 
                            alt={attachment.name}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              console.error('Image failed to load:', attachment.url);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-black/30 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </>
                    ) : fileType.startsWith("video/") ? (
                      <>
                        {attachment.videoThumbnail ? (
                          <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={attachment.videoThumbnail} 
                              alt={`${attachment.name} thumbnail`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Video className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-black/30 flex items-center justify-center flex-shrink-0">
                            <Video className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </>
                    ) : fileType.startsWith("audio/") ? (
                      <div className="w-10 h-10 rounded bg-black/30 flex items-center justify-center flex-shrink-0">
                        <FileAudio className="w-5 h-5 text-gray-400" />
                      </div>
                    ) : null}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-xs font-medium truncate-filename">
                        {attachment.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span className="uppercase">{fileExtension}</span>
                        {attachment.videoDuration && (
                          <>
                            <span>•</span>
                            <span>{formatVideoDuration(attachment.videoDuration)}</span>
                          </>
                        )}
                        {!attachment.videoDuration && attachment.transcription?.duration && (
                          <>
                            <span>•</span>
                            <span>{formatDuration(attachment.transcription.duration)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        <div className="text-sm whitespace-pre-wrap">{parseSimpleMarkdown(message.content)}</div>
      </div>
    </div>
    
    {selectedFile && (
      <FilePreviewModal
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        file={selectedFile}
      />
    )}
  </>
  )
}