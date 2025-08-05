/**
 * Generate a thumbnail from a video file
 * @param videoFile The video file to generate thumbnail from
 * @param seekTime Time in seconds to capture the thumbnail (default: 1 second)
 * @returns Promise with base64 data URL of the thumbnail
 */
export async function generateVideoThumbnail(
  videoFile: File, 
  seekTime: number = 1.0
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create video element
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Create object URL for the video
    const videoUrl = URL.createObjectURL(videoFile);
    
    // Set up video element
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    // Handle video metadata loaded
    video.onloadedmetadata = () => {
      // Seek to the specified time
      video.currentTime = Math.min(seekTime, video.duration);
    };
    
    // Handle seek complete
    video.onseeked = () => {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Cleanup
      URL.revokeObjectURL(videoUrl);
      video.remove();
      canvas.remove();
      
      resolve(thumbnailUrl);
    };
    
    // Handle errors
    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      video.remove();
      canvas.remove();
      reject(new Error('Failed to load video'));
    };
    
    // Set video source and load
    video.src = videoUrl;
    video.load();
  });
}

/**
 * Get video duration in seconds
 * @param videoFile The video file
 * @returns Promise with duration in seconds
 */
export async function getVideoDuration(videoFile: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const videoUrl = URL.createObjectURL(videoFile);
    
    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(videoUrl);
      video.remove();
      resolve(duration);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      video.remove();
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = videoUrl;
    video.load();
  });
}

/**
 * Format video duration to readable string
 * @param seconds Duration in seconds
 * @returns Formatted duration string (e.g., "1:23:45" or "2:34")
 */
export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}