"use client"

import type React from "react"

import { ArrowRight, Bot, Check, ChevronDown, Paperclip, Square, X, FileAudio, Image as ImageIcon, Video, Sparkles } from "lucide-react"
import { useRef, useCallback, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn, formatFileSize, formatDuration, formatVideoDuration } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AnimatePresence, motion } from "framer-motion"

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`

      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY))

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight],
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const OPENAI_ICON = (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 256 260"
      aria-label="OpenAI Icon"
      className="w-4 h-4"
    >
      <title>OpenAI Icon</title>
      <path
        fill="#FFFFFF"
        d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.530c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
      />
    </svg>
  </>
)

interface AIPromptProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e?: React.FormEvent) => void
  onStop?: () => void
  isLoading?: boolean
  selectedModel?: string
  onModelChange?: (model: string) => void
  onFileSelect?: (file: File) => void
  selectedFile?: { 
    file: File
    preview?: string
    transcription?: {
      text: string
      language?: string
      duration?: number
    }
    videoThumbnail?: string // Add this
    videoDuration?: number // Add this
  } | null
  onFileRemove?: () => void
  onGenerateImage?: () => void // Add this for quick image generation
}

export function AI_Prompt({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading = false,
  selectedModel = "gemini-2.5-flash-preview-05-20",
  onModelChange,
  onFileSelect,
  selectedFile,
  onFileRemove,
}: AIPromptProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 80,
    maxHeight: 300,
  })

  const AI_MODELS = ["gemini-2.5-pro-preview-05-06", "gemini-2.5-flash-preview-05-20", "gemini-2.0-flash-exp"]

  const MODEL_ICONS: Record<string, React.ReactNode> = {
    "Claude Opus 4": (
      <>
        <svg
          fill="#FFFFFF"
          fillRule="evenodd"
          className="w-4 h-4"
          viewBox="0 0 24 24"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Anthropic Icon</title>
          <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
        </svg>
      </>
    ),
    "Claude Sonnet 4": (
      <>
        <svg
          fill="#FFFFFF"
          fillRule="evenodd"
          className="w-4 h-4"
          viewBox="0 0 24 24"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Anthropic Icon</title>
          <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
        </svg>
      </>
    ),
    "gemini-2.5-flash-preview-05-20": (
      <svg height="1em" className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>Gemini</title>
        <defs>
          <linearGradient id="lobe-icons-gemini-fill" x1="0%" x2="68.73%" y1="100%" y2="30.395%">
            <stop offset="0%" stopColor="#1C7DFF" />
            <stop offset="52.021%" stopColor="#1C69FF" />
            <stop offset="100%" stopColor="#F0DCD6" />
          </linearGradient>
        </defs>
        <path
          d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
          fill="url(#lobe-icons-gemini-fill)"
          fillRule="nonzero"
        />
      </svg>
    ),
    "gemini-2.5-pro-preview-05-06": (
      <svg height="1em" className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>Gemini</title>
        <defs>
          <linearGradient id="lobe-icons-gemini-fill-pro" x1="0%" x2="68.73%" y1="100%" y2="30.395%">
            <stop offset="0%" stopColor="#1C7DFF" />
            <stop offset="52.021%" stopColor="#1C69FF" />
            <stop offset="100%" stopColor="#F0DCD6" />
          </linearGradient>
        </defs>
        <path
          d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
          fill="url(#lobe-icons-gemini-fill-pro)"
          fillRule="nonzero"
        />
      </svg>
    ),
    "gemini-2.0-flash-exp": (
      <svg height="1em" className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>Gemini</title>
        <defs>
          <linearGradient id="lobe-icons-gemini-fill-flash" x1="0%" x2="68.73%" y1="100%" y2="30.395%">
            <stop offset="0%" stopColor="#1C7DFF" />
            <stop offset="52.021%" stopColor="#1C69FF" />
            <stop offset="100%" stopColor="#F0DCD6" />
          </linearGradient>
        </defs>
        <path
          d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
          fill="url(#lobe-icons-gemini-fill-flash)"
          fillRule="nonzero"
        />
      </svg>
    ),
    "GPT-4o": OPENAI_ICON,
    "GPT-4o Mini": OPENAI_ICON,
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault()
      onSubmit()
      adjustHeight(true)
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    if (!value.trim() || isLoading) return
    onSubmit()
    adjustHeight(true)
  }

  return (
    <div className="w-full py-4">
      <div className="bg-[#2B2B2B] rounded-2xl p-1.5 border border-[#4A4A4A] focus-within:ring-2 focus-within:ring-[#4A4A4A] focus-within:ring-offset-2 focus-within:ring-offset-[#1E1E1E] transition-all duration-200">
        {selectedFile && (
          <div className="mx-4 mt-2 mb-2 bg-[#333333] rounded-lg max-w-[350px]">
            <div className="flex items-center gap-2 p-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedFile.file.type.startsWith("image/") ? (
                  <>
                    {selectedFile.preview && (
                      <img 
                        src={selectedFile.preview} 
                        alt="Preview" 
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <ImageIcon className="w-4 h-4 text-[#B0B0B0] flex-shrink-0" />
                  </>
                ) : selectedFile.file.type.startsWith("video/") ? (
                  <>
                    {selectedFile.videoThumbnail ? (
                      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={selectedFile.videoThumbnail} 
                          alt="Video thumbnail" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-black/30 flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-[#B0B0B0]" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-10 h-10 rounded bg-black/30 flex items-center justify-center flex-shrink-0">
                    <FileAudio className="w-5 h-5 text-[#B0B0B0]" />
                  </div>
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm text-[#B0B0B0] truncate" title={selectedFile.file.name}>
                    {selectedFile.file.name}
                  </p>
                  <p className="text-xs text-[#808080]">
                    {formatFileSize(selectedFile.file.size)}
                    {selectedFile.file.type.startsWith("audio/") && selectedFile.preview && " • Ready to play"}
                    {selectedFile.file.type.startsWith("video/") && selectedFile.videoDuration && 
                      ` • ${formatVideoDuration(selectedFile.videoDuration)}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onFileRemove}
                className="p-1 hover:bg-[#4A4A4A] rounded flex-shrink-0"
                aria-label="Remove file"
              >
                <X className="w-4 h-4 text-[#B0B0B0]" />
              </button>
            </div>
            {/* Show transcription preview for audio and video files */}
            {(selectedFile.file.type.startsWith("audio/") || selectedFile.file.type.startsWith("video/")) && 
             selectedFile.transcription && (
              <div className="px-2 pb-2">
                <div className="p-2 bg-black/20 rounded">
                  <p className="text-xs text-gray-400 mb-1">
                    Transcription {selectedFile.transcription.language ? `(${selectedFile.transcription.language})` : ''}
                    {selectedFile.transcription.duration ? ` • ${formatDuration(selectedFile.transcription.duration)}` : ''}
                  </p>
                  <p className="text-xs text-gray-300 italic line-clamp-2">
                    "{selectedFile.transcription.text}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="relative">
          <div className="relative flex flex-col">
            <div className="overflow-y-auto max-h-[400px]">
              <Textarea
                id="ai-input-15"
                value={value}
                placeholder={"What can I do for you?"}
                className={cn(
                  "w-full rounded-xl rounded-b-none px-4 py-3 bg-[#2B2B2B] border-none text-white placeholder:text-[#B0B0B0] resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  "min-h-[72px]",
                )}
                ref={textareaRef}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  onChange(e.target.value)
                  adjustHeight()
                }}
                disabled={isLoading}
              />
            </div>

            <div className="h-14 bg-[#2B2B2B] rounded-b-xl flex items-center">
              <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md text-white bg-[#3C3C3C] hover:bg-[#4A4A4A] focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-[#4A4A4A]"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedModel}
                            initial={{
                              opacity: 0,
                              y: -5,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              y: 5,
                            }}
                            transition={{
                              duration: 0.15,
                            }}
                            className="flex items-center gap-1"
                          >
                            {MODEL_ICONS[selectedModel]}
                            {selectedModel}
                            <ChevronDown className="w-3 h-3 opacity-50" />
                          </motion.div>
                        </AnimatePresence>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className={cn("min-w-[10rem]", "border-[#333333]", "bg-[#2B2B2B]")}>
                      {AI_MODELS.map((model) => (
                        <DropdownMenuItem
                          key={model}
                          onSelect={() => onModelChange?.(model)}
                          className="flex items-center justify-between gap-2 hover:bg-[#3C3C3C]"
                        >
                          <div className="flex items-center gap-2">
                            {MODEL_ICONS[model] || <Bot className="w-4 h-4 opacity-50" />}
                            <span className="text-white">{model}</span>
                          </div>
                          {selectedModel === model && <Check className="w-4 h-4 text-white" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="h-4 w-px bg-[#333333] mx-0.5" />
                  <label
                    className={cn(
                      "rounded-lg p-2 cursor-pointer",
                      "hover:bg-[#4A4A4A] focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-[#4A4A4A]",
                      "text-[#B0B0B0] hover:text-white",
                      selectedFile && "text-white bg-[#4A4A4A]"
                    )}
                    aria-label="Attach file"
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif,audio/mpeg,audio/mp3,audio/wav,audio/webm,audio/mp4,audio/m4a,video/mp4,video/mpeg,video/mov,video/avi,video/webm,video/quicktime"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file && onFileSelect) {
                          onFileSelect(file)
                        }
                      }}
                    />
                    <Paperclip className="w-4 h-4 transition-colors" />
                  </label>
                </div>
                <button
                  type="button"
                  className={cn(
                    "rounded-xl transition-all duration-200 ease-out",
                    "focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0",
                    "active:scale-95",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                    isLoading
                      ? "bg-white hover:bg-gray-100 px-4 py-2 flex items-center gap-2"
                      : value.trim()
                        ? "bg-white hover:bg-gray-100 p-2"
                        : "bg-[#2B2B2B] hover:bg-[#333333] p-2 border border-[#333333]",
                  )}
                  aria-label={isLoading ? "Stop generation" : "Send message"}
                  disabled={!value.trim() && !isLoading}
                  onClick={isLoading ? onStop : handleSubmit}
                >
                  {isLoading ? (
                    <>
                      <Square className="w-4 h-4 text-black fill-black" />
                      <span className="text-black text-sm font-medium">Stop</span>
                    </>
                  ) : (
                    <ArrowRight
                      className={cn(
                        "w-4 h-4 transition-all duration-200",
                        value.trim() ? "text-black transform hover:translate-x-0.5" : "text-[#666666]",
                      )}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
