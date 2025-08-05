import { GoogleAIFileManager } from "@google/generative-ai/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import path from "node:path"
import fs from "node:fs/promises"
import os from "node:os"

// Initialize the File Manager
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "")

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const supportedTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      // Audio
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/webm",
      "audio/mp4",
      "audio/m4a",
      // Video
      "video/mp4",
      "video/mpeg",
      "video/mov",
      "video/avi",
      "video/x-flv",
      "video/mpg",
      "video/webm",
      "video/wmv",
      "video/3gpp",
      "video/quicktime"
    ]

    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload an image (JPEG, PNG, WebP), audio file (MP3, WAV, etc.), or video file (MP4, MOV, etc.)" },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to Gemini
    try {
      // Create a temporary file to upload (Gemini SDK requires file path)
      const tempDir = os.tmpdir()
      const tempPath = path.join(tempDir, `gemini_upload_${Date.now()}_${file.name}`)
      
      // Write buffer to temp file
      await fs.writeFile(tempPath, buffer)
      
      // Upload the file
      const uploadResponse = await fileManager.uploadFile(tempPath, {
        mimeType: file.type,
        displayName: file.name,
      })
      
      // Clean up temp file
      await fs.unlink(tempPath)

      // Wait for file to be processed
      let fileInfo = await fileManager.getFile(uploadResponse.file.name)
      
      console.log(`File upload - Initial state: ${fileInfo.state}, Type: ${file.type}, Size: ${file.size} bytes`)
      
      while (fileInfo.state === "PROCESSING") {
        await new Promise(resolve => setTimeout(resolve, 1000))
        fileInfo = await fileManager.getFile(uploadResponse.file.name)
      }

      if (fileInfo.state === "FAILED") {
        console.error(`File processing failed for ${file.name}`)
        throw new Error("File processing failed")
      }

      console.log(`File upload successful - URI: ${fileInfo.uri}, State: ${fileInfo.state}`)

      // Return file info
      return NextResponse.json({
        success: true,
        file: {
          uri: fileInfo.uri,
          mimeType: fileInfo.mimeType,
          displayName: fileInfo.displayName,
          name: fileInfo.name,
          sizeBytes: fileInfo.sizeBytes
        }
      })
    } catch (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload file to Gemini" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: 500 }
    )
  }
}