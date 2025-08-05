/**
 * WaveSpeed AI Client for image generation and editing
 * Using flux-dev-ultra-fast model
 */

// Get API key from environment
const getApiKey = () => {
  const apiKey = process.env.WAVESPEED_API_KEY;
  
  if (!apiKey) {
    console.error("WAVESPEED_API_KEY not found in environment variables.");
    throw new Error(
      "WaveSpeed API key is not configured. Please add WAVESPEED_API_KEY to your .env.local file. " +
      "Get your API key from https://wavespeed.ai"
    );
  }
  
  return apiKey;
}

interface WaveSpeedResponse {
  data: {
    id: string;
    status?: string;
    outputs?: string[];
    error?: string;
  };
}

/**
 * Convert image URL to base64 (if needed)
 */
async function imageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    console.log('Converting image URL to base64...');
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix to get just base64
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    throw new Error('Failed to process image URL');
  }
}

/**
 * Submit image generation task to WaveSpeed
 */
async function submitImageTask(
  prompt: string,
  options: {
    size?: string;
    guidanceScale?: number;
    numInferenceSteps?: number;
    seed?: number;
    enableSafetyChecker?: boolean;
    initImageUrl?: string; // For image-to-image editing
    strength?: number; // How much to modify the original image (0.0-1.0)
    useBase64?: boolean; // Whether to convert image to base64
  } = {}
): Promise<string> {
  const {
    size = "1024*1024",
    guidanceScale = 3.5,
    numInferenceSteps = 28,
    seed = -1,
    enableSafetyChecker = true,
    initImageUrl,
    strength = 0.8,
    useBase64 = false,
  } = options;

  const url = "https://api.wavespeed.ai/api/v3/wavespeed-ai/flux-dev-ultra-fast";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getApiKey()}`
  };

  const payload: any = {
    enable_base64_output: false,
    enable_safety_checker: enableSafetyChecker,
    guidance_scale: guidanceScale,
    num_images: 1,
    num_inference_steps: numInferenceSteps,
    prompt,
    seed,
    size,
    strength,
  };

  // Add image for image-to-image editing
  if (initImageUrl) {
    console.log('Setting up image-to-image with URL:', initImageUrl);
    payload.image = initImageUrl;
  }

  console.log('Submitting to WaveSpeed API...');
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    console.error(`WaveSpeed API Error Response:`, responseText);
    console.error(`Status Code:`, response.status);
    console.error(`Request payload (truncated):`, {
      ...payload,
      image: payload.image ? '[IMAGE_DATA]' : undefined,
      init_image: payload.init_image ? '[IMAGE_URL]' : undefined,
    });
    
    // Parse error for more specific information
    try {
      const errorData = JSON.parse(responseText);
      if (errorData.error?.includes('parameter') || errorData.message?.includes('parameter')) {
        throw new Error(`Invalid parameters. The API might not support image-to-image editing or uses different parameter names. Error: ${responseText}`);
      }
    } catch (e) {
      // If parsing fails, use the raw error
    }
    
    throw new Error(`Failed to submit task: ${response.status} - ${responseText}`);
  }

  try {
    const result: WaveSpeedResponse = JSON.parse(responseText);
    console.log('Task submitted successfully:', result.data.id);
    return result.data.id;
  } catch (error) {
    console.error('Failed to parse response:', responseText);
    throw new Error('Invalid response from WaveSpeed API');
  }
}

/**
 * Poll for task completion
 */
async function waitForTaskCompletion(
  requestId: string,
  maxAttempts: number = 600, // 60 seconds with 100ms intervals
  intervalMs: number = 100
): Promise<string> {
  const url = `https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`;
  const headers = {
    "Authorization": `Bearer ${getApiKey()}`
  };

  console.log(`Polling for task completion: ${requestId}`);
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get result: ${response.status} - ${error}`);
      }

      const result: WaveSpeedResponse = await response.json();
      const status = result.data.status;

      if (status === "completed" && result.data.outputs?.[0]) {
        console.log('Task completed successfully');
        return result.data.outputs[0];
      } else if (status === "failed") {
        console.error('Task failed:', result.data.error);
        throw new Error(`Task failed: ${result.data.error || 'Unknown error'}`);
      }

      // Show progress every 50 attempts (5 seconds)
      if (i % 50 === 0 && i > 0) {
        console.log(`Still processing... (${i / 10}s elapsed)`);
      }

      // Still processing, wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      // On last attempt, throw the error
      if (i === maxAttempts - 1) {
        throw error;
      }
      // Otherwise, continue polling
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error('Task timed out after 60 seconds');
}

/**
 * Generate an image using WaveSpeed AI
 */
export async function generateImageWithWaveSpeed(
  prompt: string,
  options: {
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
    size?: '1024x1024' | '1792x1024' | '1024x1792';
  } = {}
) {
  const {
    quality = 'standard',
    style = 'vivid',
    size = '1024x1024',
  } = options;

  // Map our size format to WaveSpeed format
  const wavespeedSize = size.replace('x', '*');
  
  // Map quality to inference steps
  const numInferenceSteps = quality === 'hd' ? 50 : 28;
  
  // Map style to guidance scale
  const guidanceScale = style === 'vivid' ? 4.5 : 3.0;

  try {
    console.log(`Submitting image generation task: "${prompt.substring(0, 50)}..."`);
    
    // Submit the task
    const requestId = await submitImageTask(prompt, {
      size: wavespeedSize,
      guidanceScale,
      numInferenceSteps,
      seed: -1, // Random seed
      enableSafetyChecker: true,
    });

    console.log(`Task submitted with ID: ${requestId}`);

    // Wait for completion
    const imageUrl = await waitForTaskCompletion(requestId);
    
    console.log('Image generation completed successfully');

    return {
      success: true,
      imageUrl,
      prompt,
      requestId,
    };
  } catch (error) {
    console.error("WaveSpeed image generation error:", error);
    throw error;
  }
}

/**
 * Edit an existing image using WaveSpeed AI image-to-image
 */
export async function editImageWithWaveSpeed(
  imageUrl: string,
  editPrompt: string,
  options: {
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
    strength?: number; // 0.0-1.0, how much to change the image
    size?: '1024x1024' | '1792x1024' | '1024x1792';
  } = {}
) {
  const {
    quality = 'standard',
    style = 'vivid',
    strength = 0.7, // Default to 70% modification
    size = '1024x1024',
  } = options;

  // Map our size format to WaveSpeed format
  const wavespeedSize = size.replace('x', '*');
  
  // Map quality to inference steps
  const numInferenceSteps = quality === 'hd' ? 50 : 28;
  
  // Map style to guidance scale
  const guidanceScale = style === 'vivid' ? 4.5 : 3.0;

  try {
    console.log(`Submitting image edit task: "${editPrompt.substring(0, 50)}..."`);
    console.log(`Original image: ${imageUrl}`);
    console.log(`Strength: ${strength}`);
    
    // Submit the task with image URL
    const requestId = await submitImageTask(editPrompt, {
      size: wavespeedSize,
      guidanceScale,
      numInferenceSteps,
      seed: -1, // Random seed
      enableSafetyChecker: true,
      initImageUrl: imageUrl,
      strength,
    });

    console.log(`Edit task submitted with ID: ${requestId}`);

    // Wait for completion
    const editedImageUrl = await waitForTaskCompletion(requestId);
    
    console.log('Image editing completed successfully');

    return {
      success: true,
      imageUrl: editedImageUrl,
      originalImageUrl: imageUrl,
      prompt: editPrompt,
      strength,
      requestId,
    };
  } catch (error) {
    console.error("WaveSpeed image editing error:", error);
    throw error;
  }
}

/**
 * Map quality settings to WaveSpeed parameters
 */
export function mapQualityToSteps(quality: 'standard' | 'hd'): number {
  return quality === 'hd' ? 50 : 28;
}
