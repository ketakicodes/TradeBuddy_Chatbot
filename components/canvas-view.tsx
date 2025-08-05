"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Code, ImageIcon, FileText, Eye, Monitor, Video, Music } from "lucide-react"
import { ImageGallery } from "@/components/image-gallery"
import { GeneratedImage } from "@/lib/image-utils"

interface CanvasViewProps {
  generatedImages?: GeneratedImage[]
  onImagesChange?: (images: GeneratedImage[]) => void
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function CanvasView({ 
  generatedImages = [], 
  onImagesChange,
  activeTab: controlledActiveTab,
  onTabChange 
}: CanvasViewProps) {
  const [internalActiveTab, setInternalActiveTab] = useState("preview")
  
  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab || internalActiveTab
  const setActiveTab = onTabChange || setInternalActiveTab

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1E1E1E]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b border-[#333333] bg-[#1E1E1E]">
          <h2 className="text-lg font-semibold text-white mr-auto">Canvas</h2>
          <div className="flex-1 flex justify-center">
            <TabsList className="bg-[#2B2B2B]">
              <TabsTrigger value="preview" className="data-[state=active]:bg-[#3C3C3C] data-[state=active]:text-white">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="data-[state=active]:bg-[#3C3C3C] data-[state=active]:text-white">
                <Code className="h-4 w-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger value="browser" className="data-[state=active]:bg-[#3C3C3C] data-[state=active]:text-white">
                <Monitor className="h-4 w-4 mr-2" />
                Browser
              </TabsTrigger>
              <TabsTrigger value="video" className="data-[state=active]:bg-[#3C3C3C] data-[state=active]:text-white">
                <Video className="h-4 w-4 mr-2" />
                Video
              </TabsTrigger>
              <TabsTrigger value="audio" className="data-[state=active]:bg-[#3C3C3C] data-[state=active]:text-white">
                <Music className="h-4 w-4 mr-2" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="images" className="data-[state=active]:bg-[#3C3C3C] data-[state=active]:text-white">
                <ImageIcon className="h-4 w-4 mr-2" />
                Images
              </TabsTrigger>
              <TabsTrigger value="docs" className="data-[state=active]:bg-[#3C3C3C] data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                Docs
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto bg-[#1E1E1E]">
          <TabsContent value="preview" className="h-full mt-0">
            <div className="flex items-center justify-center h-full">
              <Card className="w-full h-full flex items-center justify-center bg-[#1A1A1A] border-[#333333]">
                <div className="text-center p-8">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-[#2B2B2B] flex items-center justify-center mb-6">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20 36.6667C29.2048 36.6667 36.6667 29.2048 36.6667 20C36.6667 10.7953 29.2048 3.33334 20 3.33334C10.7953 3.33334 3.33337 10.7953 3.33337 20C3.33337 29.2048 10.7953 36.6667 20 36.6667Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20 26.6667C23.6819 26.6667 26.6667 23.6819 26.6667 20C26.6667 16.3181 23.6819 13.3333 20 13.3333C16.3181 13.3333 13.3334 16.3181 13.3334 20C13.3334 23.6819 16.3181 26.6667 20 26.6667Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Canvas Preview</h3>
                  <p className="text-[#B0B0B0] max-w-md">
                    AI-generated content will appear here. Ask the assistant to create something for you.
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="code" className="h-full mt-0">
            <Card className="w-full h-full bg-[#1A1A1A] border-[#333333] p-6">
              <div className="rounded-lg bg-[#1E1E1E] p-6 h-full overflow-auto">
                <pre className="text-sm text-[#B0B0B0]">
                  <code>{`// Generated code will appear here
function greeting() {
  console.log("Hello, world!");
}

greeting();`}</code>
                </pre>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="browser" className="h-full mt-0">
            <Card className="w-full h-full bg-[#1A1A1A] border-[#333333] p-4">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 pb-4 border-b border-[#333333]">
                  <div className="flex items-center w-full px-4 py-2 bg-[#2B2B2B] rounded-lg">
                    <Monitor className="h-4 w-4 text-[#B0B0B0] mr-3" />
                    <span className="text-sm text-[#B0B0B0] truncate">https://</span>
                  </div>
                </div>
                <div className="flex-1 mt-6 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-[#2B2B2B] flex items-center justify-center mb-6">
                      <Monitor className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Web Browser</h3>
                    <p className="text-[#B0B0B0] max-w-md">
                      The AI assistant can browse the web to find information and perform tasks for you.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="h-full mt-0">
            <Card className="w-full h-full flex items-center justify-center bg-[#1A1A1A] border-[#333333]">
              <div className="text-center p-8">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-[#2B2B2B] flex items-center justify-center mb-6">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Video Generation</h3>
                <p className="text-[#B0B0B0] max-w-md">
                  AI-generated videos will appear here. Ask the assistant to create a video for you.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="h-full mt-0">
            <Card className="w-full h-full flex items-center justify-center bg-[#1A1A1A] border-[#333333]">
              <div className="text-center p-8">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-[#2B2B2B] flex items-center justify-center mb-6">
                  <Music className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Audio Generation</h3>
                <p className="text-[#B0B0B0] max-w-md">
                  AI-generated audio files like voice overs will appear here. Ask the assistant to create audio content
                  for you.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="h-full mt-0">
            <Card className="w-full h-full bg-[#1A1A1A] border-[#333333] overflow-hidden">
              <ImageGallery 
                images={generatedImages} 
                onImagesChange={onImagesChange}
              />
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="h-full mt-0">
            <Card className="w-full h-full bg-[#1A1A1A] border-[#333333] p-6">
              <div className="prose prose-invert max-w-none">
                <h1 className="text-white">Documentation</h1>
                <p className="text-[#B0B0B0]">Generated documentation will appear here.</p>
                <h2 className="text-white">Getting Started</h2>
                <p className="text-[#B0B0B0]">This is a placeholder for AI-generated documentation content.</p>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
