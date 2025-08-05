import { NextRequest, NextResponse } from "next/server"
import { generateImageWithWaveSpeed } from "@/lib/wavespeed-client"

export async function POST(req: NextRequest) {
  console.log("WaveSpeed image generation API called")
  
  try {
    // Check if API key is configured
    if (!process.env.WAVESPEED_API_KEY) {
      console.error("WAVESPEED_API_KEY not configured")
      return NextResponse.json(
        { 
          error: "WaveSpeed API key not configured",
          details: "Please add WAVESPEED_API_KEY to your .env.local file. Get your API key from https://wavespeed.ai"
        },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await req.json()
    console.log("Request body:", body)
    
    const { 
      prompt, 
      quality = "standard", 
      style = "vivid",
      size = "1024x1024",
    } = body

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    console.log(`Generating image with WaveSpeed: "${prompt.substring(0, 50)}..."`)
    console.log(`Quality: ${quality}, Style: ${style}, Size: ${size}`)

    try {
      // Generate image using WaveSpeed
      const result = await generateImageWithWaveSpeed(prompt, {
        quality,
        style,
        size: size as '1024x1024' | '1792x1024' | '1024x1792',
      })

      console.log(`Successfully generated image`)
      
      return NextResponse.json({
        success: true,
        images: [{
          url: result.imageUrl,
          revisedPrompt: prompt,
          index: 0,
        }],
        metadata: {
          model: "flux-dev-ultra-fast",
          provider: "wavespeed",
          quality,
          style,
          size,
          originalPrompt: prompt,
          imageCount: 1,
        }
      })

    } catch (error: any) {
      console.error("WaveSpeed generation error:", error)
      
      if (error.message?.includes('rate limit')) {
        return NextResponse.json(
          { 
            error: "Rate limit exceeded",
            details: "Too many requests. Please wait a moment and try again."
          },
          { status: 429 }
        )
      }

      if (error.message?.includes('Task failed')) {
        return NextResponse.json(
          { 
            error: "Generation failed",
            details: error.message || "The image generation task failed. Try a different prompt."
          },
          { status: 400 }
        )
      }

      if (error.message?.includes('timed out')) {
        return NextResponse.json(
          { 
            error: "Generation timeout",
            details: "Image generation took too long. Please try again."
          },
          { status: 504 }
        )
      }

      return NextResponse.json(
        { 
          error: "Failed to generate image",
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
  return NextResponse.json({
    status: "ok",
    message: "WaveSpeed image generation API is accessible",
    provider: "wavespeed",
    model: "flux-dev-ultra-fast",
    capabilities: {
      sizes: ["1024x1024", "1792x1024", "1024x1792"],
      quality: ["standard", "hd"],
      style: ["vivid", "natural"]
    }
  })
}
