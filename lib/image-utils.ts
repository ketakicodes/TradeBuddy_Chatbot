/**
 * Image generation and management utilities
 */

export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  revisedPrompt?: string
  timestamp: Date
  quality: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  size?: string
  model: string
  originalImageId?: string // For edited images, reference to the original
  editStrength?: number // Strength used for editing (0.0-1.0)
}

/**
 * Generate a unique ID for an image
 */
export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Download an image from URL
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)
  } catch (error) {
    console.error('Failed to download image:', error)
    throw new Error('Failed to download image')
  }
}

/**
 * Convert image URL to base64 (for persistence)
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Failed to convert image to base64:', error)
    throw error
  }
}

/**
 * Get quality badge color
 */
export function getQualityBadgeColor(quality: string): string {
  switch (quality) {
    case 'hd':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'standard':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

/**
 * Save generated images to localStorage
 */
export function saveGeneratedImages(images: GeneratedImage[]): void {
  try {
    // Convert dates to strings for storage
    const serialized = images.map(img => ({
      ...img,
      timestamp: img.timestamp.toISOString()
    }))
    localStorage.setItem('generatedImages', JSON.stringify(serialized))
  } catch (error) {
    console.error('Failed to save images:', error)
  }
}

/**
 * Load generated images from localStorage
 */
export function loadGeneratedImages(): GeneratedImage[] {
  try {
    const stored = localStorage.getItem('generatedImages')
    if (!stored) return []
    
    // Parse and convert date strings back to Date objects
    const parsed = JSON.parse(stored)
    return parsed.map((img: any) => ({
      ...img,
      timestamp: new Date(img.timestamp)
    }))
  } catch (error) {
    console.error('Failed to load images:', error)
    return []
  }
}

/**
 * Detect if a message is requesting image generation
 */
export function isImageGenerationRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  
  // Check for common patterns
  const patterns = [
    /generate\s+(a|an|the)?\s*\w*\s*(image|picture|illustration|artwork|art|photo|drawing)/i,
    /create\s+(a|an|the)?\s*\w*\s*(image|picture|illustration|artwork|art|photo|drawing)/i,
    /make\s+(a|an|the)?\s*\w*\s*(image|picture|illustration|artwork|art|photo|drawing)/i,
    /draw\s+(a|an|the)?\s*\w*\s*(image|picture|illustration|artwork|art|photo|drawing)/i,
    /design\s+(a|an|the)?\s*\w*\s*(image|picture|illustration|artwork|art|photo|drawing)/i,
    /show\s+me\s+(a|an|the)?\s*\w*\s*(image|picture|illustration|artwork|art|photo|drawing)/i,
    /(image|picture|illustration|artwork|photo|drawing)\s+of/i,
    /visualize/i,
    /generate:|create:|draw:|make:/i
  ]
  
  // Check if any pattern matches
  return patterns.some(pattern => pattern.test(lowerMessage))
}

/**
 * Extract image generation prompt from message
 */
export function extractImagePrompt(message: string): string {
  // Remove common prefixes using regex
  const patterns = [
    /^(generate|create|make|draw|design|show\s+me)\s+(a|an|the)?\s*/i,
    /^(image|picture|illustration|artwork|photo|drawing)\s+of\s*/i,
    /^visualize\s*/i,
  ]
  
  let prompt = message
  for (const pattern of patterns) {
    prompt = prompt.replace(pattern, '')
  }
  
  // Remove trailing "image", "picture", etc. if they appear at the start
  prompt = prompt.replace(/^(image|picture|illustration|artwork|photo|drawing)\s*/i, '')
  
  // Clean up any remaining artifacts
  prompt = prompt.replace(/\s+/g, ' ').trim()
  
  // If the prompt is empty or too short, use the original message
  if (prompt.length < 3) {
    prompt = message.replace(/^(generate|create|make|draw)\s+(a|an|the)?\s*/i, '').trim()
  }
  
  return prompt
}

/**
 * Format timestamp for display
 */
export function formatImageTimestamp(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}