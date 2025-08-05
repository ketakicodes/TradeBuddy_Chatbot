# Video Upload Feature

This chatbot now supports comprehensive video file uploads with the following features:

## Supported Video Formats
- MP4 (.mp4)
- MOV (.mov)
- AVI (.avi)
- WebM (.webm)
- MPEG (.mpeg)
- QuickTime (.mov)

## Features

### 1. **Video Upload & Processing**
- Upload videos through the file attachment button
- Automatic thumbnail generation at 2-second mark
- Video duration extraction and display
- File size validation (25MB limit for transcription)

### 2. **AI Analysis**
- **Visual Analysis**: Google Gemini AI analyzes the video content and describes what it sees
- **Audio Transcription**: OpenAI Whisper automatically transcribes any narration or audio
- **Combined Insights**: The AI provides comprehensive analysis of both visual and audio elements

### 3. **User Interface**
- **Chat Preview**: Video thumbnails with play icon overlay
- **Duration Display**: Shows video length in the chat
- **Progress Indicators**: Real-time upload and transcription progress
- **Transcription Preview**: Shows a snippet of the transcription below the video

### 4. **Video Player Modal**
- **Full Video Playback**: HTML5 video player with standard controls
- **Poster Image**: Uses generated thumbnail as poster
- **Download Option**: Download the original video file
- **Tabbed Transcription View**:
  - Full transcript tab
  - Timed segments tab (when available)
- **Interactive Segments**: Click on timestamps to jump to specific points
- **Active Segment Highlighting**: Shows which segment is currently playing

## How It Works

1. **Select Video**: Click the paperclip icon and choose a video file
2. **Processing**: 
   - Video uploads to Google Gemini
   - Thumbnail generates automatically
   - Audio track transcribes via Whisper API
3. **Display**: Video appears in chat with thumbnail and duration
4. **Interaction**: Click video to open full player with transcription

## Technical Details

### File Size Limits
- **Upload**: Limited by your server configuration
- **Transcription**: 25MB maximum (Whisper API limit)
- Large videos will upload but may not transcribe

### Transcription Features
- Language detection
- Duration information
- Timed segments (when available)
- Synchronized playback

### Error Handling
- Graceful fallback if thumbnail generation fails
- Continues without transcription if file too large
- Clear error messages for unsupported formats

## Tips for Best Results

1. **Video Quality**: Higher quality videos provide better AI analysis
2. **Audio Clarity**: Clear audio results in better transcriptions
3. **File Size**: Keep videos under 25MB for full transcription
4. **Format**: MP4 and WebM work best across all browsers

## Troubleshooting

### Video Won't Upload
- Check file format is supported
- Verify file isn't corrupted
- Ensure stable internet connection

### No Transcription
- File may be over 25MB limit
- Audio track might be missing
- Check OpenAI API key is configured

### Thumbnail Missing
- Browser may not support video format
- Try refreshing the page
- Video might be corrupted

## Future Enhancements
- Video compression before upload
- Multiple quality options
- Frame-by-frame analysis
- Subtitle file generation (.srt)
- Video trimming before upload