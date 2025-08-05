import { NextRequest, NextResponse } from "next/server"
import { smartEditWithGPTImage1, checkGPTImage1Available } from "@/lib/openai-image-client"

export async function POST(req: NextRequest) {
  console.log("GPT-Image-1 editing API called")

  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured")
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          details: "Please add OPENAI_API_KEY to your .env.local file. Get your API key from https://platform.openai.com/api-keys"
        },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await req.json()
    console.log("Request body:", body)

    const {
      imageUrl,
      prompt,
      quality = "standard",
      style = "vivid",
      size = "1024x1024",
      mask, // Optional mask for inpainting
    } = body

    // Convert quality parameter from standard/hd to GPT-Image-1's low/medium/high
    let gptQuality: 'low' | 'medium' | 'high' = 'medium';
    if (quality === 'standard') {
      gptQuality = 'medium';
    } else if (quality === 'hd') {
      gptQuality = 'high';
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      )
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Edit prompt is required" },
        { status: 400 }
      )
    }

    // Validate size for GPT-Image-1
    const validSizes = ['1024x1024', '1536x1024', '1024x1536'];
    const actualSize = validSizes.includes(size) ? size : '1024x1024'; // Default to 1024x1024 if invalid

    if (!validSizes.includes(size)) {
      console.log(`Invalid size ${size} for GPT-Image-1, using default: 1024x1024`);
    }

    console.log(`Editing image with GPT-Image-1: "${prompt.substring(0, 50)}..."`)
    console.log(`Original image: ${imageUrl.substring(0, 50)}...`)
    console.log(`Quality: ${gptQuality} (from ${quality}), Style: ${style}, Size: ${actualSize} (requested: ${size})`)
    if (mask) {
      console.log(`Using mask for inpainting: ${mask.substring(0, 50)}...`)
    }

    try {
      // Edit image using GPT-Image-1
      const result = await smartEditWithGPTImage1(imageUrl, prompt, {
        size: actualSize as '1024x1024' | '1536x1024' | '1024x1536',
        quality: gptQuality,
        style: style as 'vivid' | 'natural',
        mask,
      })

      console.log(`Successfully edited image using ${result.model || 'GPT-Image-1'}`)

      return NextResponse.json({
        success: true,
        images: [{
          url: result.imageUrl,
          originalUrl: result.originalImageUrl || imageUrl,
          revisedPrompt: result.revisedPrompt || prompt,
          index: 0,
        }],
        metadata: {
          model: result.model || 'gpt-image-1',
          provider: "openai",
          quality: quality, // Return original quality parameter
          style,
          size,
          originalPrompt: prompt,
          editMode: true,
          method: result.method || 'image-to-image',
          imageCount: 1,
          note: result.model?.includes('fallback') ? 'Using fallback model due to GPT-Image-1 availability' : undefined,
        }
      })

    } catch (error: any) {
      console.error("GPT-Image-1 editing error:", error)
      console.error("Error details:", error.message)
      console.error("Error code:", error.code)
      console.error("Error type:", error.type)

      if (error.message?.includes('invalid_request_error')) {
        return NextResponse.json(
          {
            error: "Invalid request",
            details: "The request format or parameters are invalid. " + error.message
          },
          { status: 400 }
        )
      }

      if (error.message?.includes('rate_limit_exceeded')) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            details: "Too many requests to OpenAI. Please wait a moment and try again."
          },
          { status: 429 }
        )
      }

      if (error.message?.includes('safety system') || error.code === 'moderation_blocked' || error.type === 'image_generation_user_error') {
        return NextResponse.json(
          {
            error: "Content not allowed",
            details: "The image or edit request was rejected by OpenAI's safety system. This may happen with copyrighted characters, inappropriate content, or certain types of modifications. Try using different wording or editing a different image."
          },
          { status: 400 }
        )
      }

      if (error.message?.includes('model_not_found')) {
        return NextResponse.json(
          {
            error: "Model not available",
            details: "GPT-Image-1 model not found. Please ensure your OpenAI organization is verified and you have access to GPT-4o's image generation capabilities."
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          error: "Failed to edit image",
          details: error.message || "An unexpected error occurred"
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error("General error:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check if GPT-Image-1 is available
    const isAvailable = await checkGPTImage1Available();

    return NextResponse.json({
      status: "ok",
      message: "GPT-Image-1 editing API is accessible",
      provider: "openai",
      model: "gpt-image-1",
      available: isAvailable,
      capabilities: {
        features: [
          "Native Multimodal Image Generation",
          "Advanced Image-to-Image Editing",
          "Inpainting with Alpha Channel Masks",
          "Multi-Image Composition (up to 10 images)",
          "Conversational Editing with Context",
          "Accurate Text Rendering in Images"
        ],
        sizes: ["1024x1024", "1536x1024", "1024x1536"],
        quality: ["low", "medium", "high"],
        style: ["vivid", "natural"],
        mode: "multimodal",
        description: "GPT-Image-1 is GPT-4o's native image generation capability with advanced multimodal features"
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: "GPT-Image-1 API not configured or accessible",
      error: error.message
    }, { status: 500 })
  }
}
