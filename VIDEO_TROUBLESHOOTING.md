# Video Analysis Troubleshooting Guide

## Common Issues with Video Analysis

### 1. Incomplete or Truncated Analysis

**Problem**: The AI only analyzes the beginning of the video and cuts off.

**Causes & Solutions**:

1. **Token Limit Exceeded**
   - **Solution**: The system now uses 8192 tokens for video analysis (vs 4096 for other content)
   - For very long videos, consider breaking them into segments

2. **Generic Analysis Prompt**
   - **Solution**: When uploading a video, the system now uses a comprehensive prompt that specifically requests:
     - Complete timeline with timestamps
     - Scene-by-scene breakdown
     - Audio transcription
     - Technical analysis
     - Full duration coverage

3. **Model Limitations**
   - Some Gemini models may have restrictions on video duration
   - Try using different models if available

### 2. Video Upload Failures

**Problem**: Video fails to upload or process.

**Solutions**:
1. **Check File Size**: Ensure video is under server limits
2. **Check Format**: Supported formats are MP4, MOV, AVI, WebM, MPEG
3. **Check Internet Connection**: Large videos need stable connection
4. **Check Console Logs**: Look for specific error messages

### 3. Missing Transcription

**Problem**: Video uploads but audio is not transcribed.

**Solutions**:
1. **File Size**: Transcription limited to 25MB (Whisper API limit)
2. **Audio Track**: Ensure video has an audio track
3. **API Key**: Verify OPENAI_API_KEY is set correctly

## How to Get Complete Video Analysis

### Option 1: Let the System Auto-Analyze
When you upload a video without typing anything, the system automatically uses a comprehensive analysis prompt.

### Option 2: Custom Analysis Request
When typing "Analyze the video" or similar, the system now adds instructions for complete analysis.

### Option 3: Specific Analysis Request
For best results, be specific about what you want:
```
"Analyze this video completely, including:
- All scenes from start to finish
- Complete transcription of narration
- Visual elements and transitions
- Timeline with timestamps
- Technical quality assessment"
```

### Option 4: Segment Analysis
For very long videos, request analysis of specific segments:
```
"Analyze the first 5 minutes of this video"
"Analyze from 2:00 to 4:00 in detail"
```

## Debug Information

When a video is uploaded, the system logs:
1. File type and size
2. Upload state and progress
3. Gemini file URI
4. Processing status

Check browser console for these logs to diagnose issues.

## Model-Specific Token Limits

- **Video Analysis**: 8192 tokens (increased from 2048)
- **Other Content**: 4096 tokens
- **Estimated Coverage**: 
  - 8192 tokens ≈ 6000-8000 words
  - Sufficient for 5-10 minute videos with detailed analysis

## Best Practices

1. **Optimal Video Length**: 1-5 minutes for most detailed analysis
2. **Clear Audio**: Better transcription = better analysis
3. **Good Lighting**: Helps with visual scene detection
4. **Stable Video**: Reduces processing complexity

## If Analysis is Still Incomplete

1. **Refresh and Retry**: Sometimes helps with processing issues
2. **Try Different Model**: Switch between Gemini models
3. **Reduce Video Size**: Compress or trim video
4. **Check Server Logs**: Look for backend errors
5. **Report Issue**: Note the video size, format, and duration