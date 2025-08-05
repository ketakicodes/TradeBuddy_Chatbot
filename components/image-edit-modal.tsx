"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Wand2, Info } from "lucide-react"
import type { GeneratedImage } from "@/lib/image-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImageEditModalProps {
  isOpen: boolean
  onClose: () => void
  image: GeneratedImage | null
  onEditComplete: (editedImage: GeneratedImage) => void
}

export function ImageEditModal({ isOpen, onClose, image, onEditComplete }: ImageEditModalProps) {
  const [editPrompt, setEditPrompt] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEdit = async () => {
    if (!image || !editPrompt.trim()) return

    setIsEditing(true)
    setError(null)

    try {
      const response = await fetch("/api/edit-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: image.url,
          prompt: editPrompt,
          quality: image.quality || "standard",
          style: image.style || "vivid",
          size: image.size || "1024x1024",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to edit image")
      }

      // Create edited image object
      const editedImage: GeneratedImage = {
        id: `edited-${Date.now()}`,
        url: data.images[0].url,
        prompt: editPrompt,
        revisedPrompt: data.images[0].revisedPrompt,
        timestamp: new Date(),
        quality: data.metadata.quality,
        style: data.metadata.style,
        size: data.metadata.size,
        model: data.metadata.model,
        originalImageId: image.id,
      }

      onEditComplete(editedImage)
      onClose()
      setEditPrompt("")
    } catch (error) {
      console.error("Edit error:", error)
      setError(error instanceof Error ? error.message : "Failed to edit image")
    } finally {
      setIsEditing(false)
    }
  }

  if (!image) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#2B2B2B] border-[#333333]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Edit Image with GPT-Image-1
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original Image Preview */}
          <div className="relative rounded-lg overflow-hidden bg-black">
            <img
              src={image.url}
              alt="Original content to be edited"
              className="w-full h-auto max-h-[40vh] object-contain"
            />
          </div>

          {/* Edit Prompt */}
          <div className="space-y-2">
            <Label htmlFor="edit-prompt" className="text-white">
              Describe how you want to edit this image
            </Label>
            <Textarea
              id="edit-prompt"
              placeholder="e.g., 'Transform into a sunset scene', 'Add a rainbow in the sky', 'Change to winter with snow'"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="min-h-[100px] bg-[#1E1E1E] border-[#333333] text-white placeholder:text-gray-500"
              disabled={isEditing}
            />
          </div>

          {/* Model Info */}
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              GPT-Image-1 uses GPT-4o's native multimodal capabilities to understand your instructions and transform
              images with advanced context awareness. It excels at style changes, scene modifications, and creative
              transformations while maintaining the core composition of your original image.
            </AlertDescription>
          </Alert>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-500 font-medium mb-1">
                {error.includes("Content not allowed") ? "Content Policy Violation" : "Edit Failed"}
              </p>
              <p className="text-sm text-red-400">{error}</p>
              {error.includes("Content not allowed") && (
                <div className="mt-2 text-xs text-gray-400">
                  <p className="font-medium mb-1">Suggestions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Try using more generic descriptions (e.g., "superhero" instead of character names)</li>
                    <li>Avoid references to copyrighted characters or brands</li>
                    <li>Use different wording for your edit request</li>
                    <li>Try editing a different image</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isEditing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!editPrompt.trim() || isEditing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Editing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Apply Edit
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
