import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileAudio, Download, Music, Video, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDuration, formatFileSize, formatVideoDuration } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  file: {
    name: string
    contentType: string
    url?: string
    transcription?: {
      text: string
      language?: string
      duration?: number
      segments?: Array<{
        start: number
        end: number
        text: string
      }>
    }
    videoThumbnail?: string
    videoDuration?: number
  }
}

export function FilePreviewModal({ isOpen, onClose, file }: FilePreviewModalProps) {
  const isImage = file.contentType?.startsWith("image/")
  const isAudio = file.contentType?.startsWith("audio/")
  const isVideo = file.contentType?.startsWith("video/")
  
  const [currentTime, setCurrentTime] = useState(0)
  const [activeSegment, setActiveSegment] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Update active segment based on current playback time
  useEffect(() => {
    if (file.transcription?.segments) {
      const segment = file.transcription.segments.findIndex(
        seg => currentTime >= seg.start && currentTime <= seg.end
      )
      setActiveSegment(segment >= 0 ? segment : null)
    }
  }, [currentTime, file.transcription?.segments])

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime)
  }
  const seekToSegment = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime
    } else if (audioRef.current) {
      audioRef.current.currentTime = startTime
    }
  }

  // Debug logging
  console.log('FilePreviewModal - file data:', {
    name: file.name,
    contentType: file.contentType,
    hasUrl: !!file.url,
    url: file.url,
    transcription: file.transcription,
    videoThumbnail: file.videoThumbnail,
    videoDuration: file.videoDuration
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#2B2B2B] border-[#333333]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {isVideo && <Video className="h-5 w-5" />}
            {isAudio && <Music className="h-5 w-5" />}
            {file.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isImage && file.url && (
            <div className="flex flex-col items-center">
              <img 
                src={file.url} 
                alt={file.name} 
                className="max-w-full rounded-lg" 
              />
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = file.url!
                  a.download = file.name
                  a.click()
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Image
              </Button>
            </div>
          )}          
          {isVideo && (
            <div className="space-y-4">
              {/* Video Player Section */}
              {file.url ? (
                <div className="bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full max-h-[500px]"
                    preload="metadata"
                    onTimeUpdate={handleTimeUpdate}
                    poster={file.videoThumbnail}
                  >
                    <source src={file.url} type={file.contentType} />
                    Your browser does not support the video element.
                  </video>
                  
                  <div className="p-4 bg-black/60 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-300">
                        <span>{file.contentType}</span>
                        {file.videoDuration && (
                          <span className="ml-2">• {formatVideoDuration(file.videoDuration)}</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const a = document.createElement('a')
                          a.href = file.url!
                          a.download = file.name
                          a.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Video
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black/20 rounded-lg p-12 text-center">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Video preview not available</p>
                  <p className="text-sm text-gray-500 mt-1">The video file URL is missing</p>
                </div>
              )}              
              {/* Transcription Section */}
              {file.transcription && (
                <Tabs defaultValue="full" className="w-full">
                  <TabsList className="bg-[#333333] w-full">
                    <TabsTrigger value="full" className="flex-1 data-[state=active]:bg-[#4A4A4A]">
                      Full Transcript
                    </TabsTrigger>
                    {file.transcription.segments && file.transcription.segments.length > 0 && (
                      <TabsTrigger value="timed" className="flex-1 data-[state=active]:bg-[#4A4A4A]">
                        Timed Segments
                      </TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="full" className="mt-4">
                    <div className="bg-black/20 rounded-lg">
                      <div className="p-4 border-b border-gray-700">
                        <h3 className="text-sm font-medium text-gray-300">
                          Full Transcription
                          {file.transcription.language && ` (${file.transcription.language})`}
                          {file.transcription.duration && ` • ${formatDuration(file.transcription.duration)}`}
                        </h3>
                      </div>
                      <div className="p-4 max-h-[300px] overflow-y-auto">
                        <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {file.transcription.text}
                        </p>
                      </div>
                    </div>
                  </TabsContent>                  
                  {file.transcription.segments && file.transcription.segments.length > 0 && (
                    <TabsContent value="timed" className="mt-4">
                      <div className="bg-black/20 rounded-lg">
                        <div className="p-4 border-b border-gray-700">
                          <h3 className="text-sm font-medium text-gray-300">
                            Timed Transcript Segments
                            <span className="text-xs text-gray-500 ml-2">
                              (Click timestamp to jump to that point)
                            </span>
                          </h3>
                        </div>
                        <div className="p-2 max-h-[300px] overflow-y-auto">
                          {file.transcription.segments.map((segment, index) => (
                            <div
                              key={index}
                              className={cn(
                                "p-3 rounded-lg mb-2 cursor-pointer transition-all hover:bg-black/30",
                                activeSegment === index && "bg-blue-900/30 border-l-2 border-blue-500"
                              )}
                              onClick={() => seekToSegment(segment.start)}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  className="text-xs text-blue-400 hover:text-blue-300 font-mono whitespace-nowrap pt-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    seekToSegment(segment.start)
                                  }}
                                >
                                  {formatDuration(segment.start)}
                                </button>
                                <p className="text-sm text-gray-200 flex-1">
                                  {segment.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              )}
            </div>
          )}          
          {isAudio && (
            <div className="space-y-6">
              {/* Audio Player Section - Keep existing audio implementation */}
              {file.url ? (
                <div className="bg-black/20 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-lg bg-black/30 flex items-center justify-center flex-shrink-0">
                      <FileAudio className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{file.name}</h3>
                      <p className="text-sm text-gray-400">
                        {file.contentType}
                        {file.transcription?.duration && ` • ${formatDuration(file.transcription.duration)}`}
                      </p>
                    </div>
                  </div>
                  
                  <audio 
                    ref={audioRef}
                    controls 
                    className="w-full"
                    preload="metadata"
                    onTimeUpdate={handleTimeUpdate}
                  >
                    <source src={file.url} type={file.contentType} />
                    Your browser does not support the audio element.
                  </audio>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = file.url!
                        a.download = file.name
                        a.click()
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Audio
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-black/20 rounded-lg p-6 text-center">
                  <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Audio preview not available</p>
                  <p className="text-sm text-gray-500 mt-1">The audio file URL is missing</p>
                </div>
              )}              
              {/* Transcription Section */}
              {file.transcription && (
                <div className="bg-black/10 rounded-lg">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300">
                      Transcription
                      {file.transcription.language && ` (${file.transcription.language})`}
                      {file.transcription.duration && ` • ${formatDuration(file.transcription.duration)}`}
                    </h3>
                  </div>
                  <div className="p-4 max-h-[400px] overflow-y-auto">
                    <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {file.transcription.text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Fallback for other file types */}
          {!isImage && !isAudio && !isVideo && (
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 rounded-lg bg-black/30 flex items-center justify-center mb-4">
                <FileAudio className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-400">Preview not available for this file type</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}