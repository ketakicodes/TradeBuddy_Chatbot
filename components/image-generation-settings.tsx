import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageGenerationSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quality: 'standard' | 'hd'
  onQualityChange: (quality: 'standard' | 'hd') => void
  style: 'vivid' | 'natural'
  onStyleChange: (style: 'vivid' | 'natural') => void
  size: '1024x1024' | '1792x1024' | '1024x1792'
  onSizeChange: (size: '1024x1024' | '1792x1024' | '1024x1792') => void
}

export function ImageGenerationSettings({
  open,
  onOpenChange,
  quality,
  onQualityChange,
  style,
  onStyleChange,
  size,
  onSizeChange,
}: ImageGenerationSettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2B2B2B] border-[#4A4A4A] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Image Generation Settings
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure how AI generates images (Powered by WaveSpeed AI)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Quality Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Quality</Label>
            <RadioGroup value={quality} onValueChange={(value) => onQualityChange(value as 'standard' | 'hd')}>
              <div className="flex gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="cursor-pointer">Standard (Faster)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hd" id="hd" />
                  <Label htmlFor="hd" className="cursor-pointer">HD (Better Quality)</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Style Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Style</Label>
            <RadioGroup value={style} onValueChange={(value) => onStyleChange(value as 'vivid' | 'natural')}>
              <div className="flex gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vivid" id="vivid" />
                  <Label htmlFor="vivid" className="cursor-pointer">Vivid (More Dramatic)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="natural" id="natural" />
                  <Label htmlFor="natural" className="cursor-pointer">Natural (More Realistic)</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Size Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Size</Label>
            <RadioGroup value={size} onValueChange={(value) => onSizeChange(value as any)}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1024x1024" id="square" />
                  <Label htmlFor="square" className="cursor-pointer">1024×1024 (Square)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1792x1024" id="landscape" />
                  <Label htmlFor="landscape" className="cursor-pointer">1792×1024 (Landscape)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1024x1792" id="portrait" />
                  <Label htmlFor="portrait" className="cursor-pointer">1024×1792 (Portrait)</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="text-xs text-gray-400 bg-[#1E1E1E] p-3 rounded-lg">
            <p>🚀 Images are generated using WaveSpeed AI's Flux Dev Ultra Fast model</p>
            <p className="mt-1">⚡ High-quality generation in seconds</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="bg-[#4A4A4A] hover:bg-[#5A5A5A]">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
