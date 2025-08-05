# Gemini AI Chatbot with Multimodal Support

A modern, feature-rich AI chatbot application built with Next.js 15, React 19, and Google Gemini AI. This application supports text conversations, image analysis, audio transcription, and comprehensive video analysis with a beautiful dark-themed UI.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-blue?style=flat-square&logo=google)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?style=flat-square&logo=tailwindcss)

## ✨ Features

### 🤖 AI Capabilities

- **Multiple AI Models**: Support for Gemini 2.5 Flash, 2.5 Pro, and 2.0 Flash
- **Image Generation**: Create images using WaveSpeed AI's Flux Dev Ultra Fast model
- **Image Editing**: Edit images using OpenAI's GPT-Image-1 multimodal model
- **Streaming Responses**: Real-time AI responses with typing indicators
- **Context Awareness**: Maintains conversation history
- **Smart Token Management**: 8192 tokens for video analysis, 4096 for general content

### 📁 Multimodal Support

- **Images**: Upload and analyze images (JPEG, PNG, WebP, HEIC/HEIF)
- **Audio**: Upload audio files with automatic transcription via OpenAI Whisper
- **Video**: Comprehensive video analysis with scene detection and audio transcription
  - Automatic thumbnail generation
  - Timeline with timestamps
  - Full audio narration transcription
  - Scene-by-scene breakdown
- **AI Image Generation**: Generate images from text prompts
  - Multiple quality levels (low, medium, high)
  - Gallery view with search and filters
  - Download and management features
- **AI Image Editing**: Edit existing images with GPT-Image-1
  - Advanced multimodal image-to-image transformation
  - Enhanced instruction following
  - High-resolution outputs (up to 1536×1024)
  - Accurate text rendering in images
  - Future support for inpainting with masks

### 🎨 User Interface

- **Modern Dark Theme**: Sleek, professional dark UI
- **Resizable Panels**: Adjustable chat and canvas view
- **Rich Media Previews**: Inline previews for all uploaded files
- **Interactive Modals**: Full-screen previews for media content
- **Progress Indicators**: Real-time upload and transcription progress
- **Responsive Design**: Works on desktop and mobile devices

### 🎥 Video Features

- **Supported Formats**: MP4, MOV, AVI, WebM, MPEG
- **Thumbnail Generation**: Automatic preview at 2-second mark
- **Duration Display**: Shows video length in UI
- **Transcription**: Full audio track transcription (up to 25MB)
- **Interactive Player**:
  - Full video controls
  - Tabbed transcription view
  - Timed segments with click-to-seek
  - Active segment highlighting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (Required for Next.js 15)
- npm or pnpm
- Google Gemini API key
- OpenAI API key (for audio/video transcription)
- WaveSpeed API key (for image generation)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/geminichatbot.git
   cd geminichatbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory by copying the example:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and add your API keys:

   ```env
   # Google Gemini API Key (Required)
   GEMINI_API_KEY=your_gemini_api_key_here

   # OpenAI API Key (Optional - for audio/video transcription)
   OPENAI_API_KEY=your_openai_api_key_here

   # WaveSpeed API Key (Optional - for image generation)
   WAVESPEED_API_KEY=your_wavespeed_api_key_here
   ```

   **🔒 Security Note**: Never commit `.env.local` or any file containing API keys to version control. The `.gitignore` file is already configured to exclude these files.

4. **Verify your API keys**

   ```bash
   npm run check-api-keys
   ```

   This will show you which API keys are configured and which features are available.

5. **Run the development server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Configuration

### API Keys

1. **Google Gemini API Key**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add to `.env.local` as `GEMINI_API_KEY`

2. **OpenAI API Key** (for transcription)
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Add to `.env.local` as `OPENAI_API_KEY`

3. **WaveSpeed API Key** (for image generation)
   - Get your API key from [WaveSpeed AI](https://wavespeed.ai)
   - Add to `.env.local` as `WAVESPEED_API_KEY`

### Model Selection

You can switch between different Gemini models in the chat interface:

- **Gemini 2.5 Flash**: Fast responses, good for general use
- **Gemini 2.5 Pro**: Advanced reasoning, better for complex tasks
- **Gemini 2.0 Flash**: Experimental features, optimized for video

## 🎯 Usage

### Basic Chat

1. Type your message in the input field
2. Press Enter or click the send button
3. AI responds in real-time with streaming text

### Image Analysis

1. Click the paperclip icon
2. Select an image file
3. Optionally add a question about the image
4. Send to get AI analysis

### Audio Processing

1. Upload an audio file (MP3, WAV, etc.)
2. Automatic transcription via Whisper AI
3. Preview transcription before sending
4. AI analyzes both content and context

### Video Analysis

1. Upload a video file (MP4, MOV, etc.)
2. Thumbnail generates automatically
3. Audio track transcribes if present
4. Send for comprehensive analysis including:
   - Visual scene descriptions
   - Audio/narration transcription
   - Timeline with timestamps
   - Technical quality assessment

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **AI Integration**:
  - Google Gemini AI (Visual analysis)
  - OpenAI Whisper (Audio transcription)
  - OpenAI GPT-Image-1 (Image editing)
  - WaveSpeed AI (Image generation)
- **State Management**: React Hooks
- **Streaming**: Server-Sent Events (SSE)

### Project Structure

```text
geminichatbot/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/         # Chat endpoint
│   │   ├── upload/       # File upload
│   │   └── transcribe/   # Audio transcription
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── chat-interface.tsx
│   ├── chat-message.tsx
│   └── file-preview-modal.tsx
├── lib/                   # Utilities
│   ├── utils.ts
│   └── video-utils.ts
├── public/               # Static assets
└── styles/              # Global styles
```

## 🔧 API Reference

### Chat Endpoint

`POST /api/chat`

- Handles chat messages with optional file attachments
- Supports streaming responses
- Token limits: 8192 for video, 4096 for general

### Upload Endpoint

`POST /api/upload`

- Uploads files to Google Gemini
- Validates file types and sizes
- Returns file URI for chat integration

### Transcribe Endpoint

`POST /api/transcribe`

- Transcribes audio/video files using Whisper
- 25MB file size limit
- Returns text, language, duration, and segments

## 🚨 Troubleshooting

### Common Issues

1. **Video analysis truncated**
   - Fixed: Token limit increased to 8192
   - Comprehensive prompts ensure full analysis

2. **Transcription fails**
   - Check file size (< 25MB)
   - Verify OpenAI API key
   - Ensure audio track exists

3. **Upload errors**
   - Check file format support
   - Verify Gemini API key
   - Check internet connection

4. **Node.js version error**
   - Requires Node.js 18+
   - Update Node.js: `nvm install 18`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Google Gemini AI](https://deepmind.google/technologies/gemini/) - Multimodal AI model
- [OpenAI Whisper](https://openai.com/research/whisper) - Speech recognition
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ using Next.js and Gemini AI
