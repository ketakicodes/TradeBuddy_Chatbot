import { GoogleGenerativeAI } from "@google/generative-ai"
import { SentimentAnalyzer } from '@/lib/sentiment-utils';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Add this function to detect sentiment-related queries
function detectSentimentQuery(message: string): {
  isFinancialQuery: boolean;
  queryType: 'stock' | 'sector' | 'market' | 'news' | null;
  entities: string[];
} {
  const lowerMessage = message.toLowerCase();
  
  // Stock patterns
  const stockPatterns = [
    /how is ([a-z]+) stock doing/i,
    /what.*sentiment.*([a-z]+)/i,
    /([a-z]+) stock analysis/i,
    /analyze ([a-z]+)/i,
    /([a-z]{2,5}) performance/i // Assuming stock symbols are 2-5 chars
  ];

  // Sector patterns
  const sectorPatterns = [
    /how is.*([a-z]+)\s+(sector|industry)/i,
    /(technology|healthcare|finance|energy|retail|automotive|banking|pharmaceutical|tech|fintech|crypto)\s+(sector|industry|market)/i,
    /([a-z]+)\s+sector\s+(doing|performance|analysis)/i
  ];

  // Market patterns
  const marketPatterns = [
    /market overview/i,
    /overall market/i,
    /market sentiment/i,
    /general market/i
  ];

  // News patterns
  const newsPatterns = [
    /latest news about/i,
    /recent news/i,
    /news on ([a-z]+)/i
  ];

  let queryType: 'stock' | 'sector' | 'market' | 'news' | null = null;
  let entities: string[] = [];
  let isFinancialQuery = false;

  // Check for financial keywords
  const financialKeywords = [
    'stock', 'sector', 'market', 'investment', 'trading', 'bull', 'bear',
    'sentiment', 'analysis', 'performance', 'earnings', 'revenue', 'profit',
    'nasdaq', 'spy', 'dow', 'portfolio', 'finance', 'financial'
  ];

  isFinancialQuery = financialKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );

  if (isFinancialQuery) {
    // Check stock patterns
    for (const pattern of stockPatterns) {
      const match = message.match(pattern);
      if (match) {
        queryType = 'stock';
        entities.push(match[1]);
        break;
      }
    }

    // Check sector patterns
    if (!queryType) {
      for (const pattern of sectorPatterns) {
        const match = message.match(pattern);
        if (match) {
          queryType = 'sector';
          entities.push(match[1]);
          break;
        }
      }
    }

    // Check market patterns
    if (!queryType && marketPatterns.some(pattern => pattern.test(message))) {
      queryType = 'market';
    }

    // Check news patterns
    if (!queryType) {
      for (const pattern of newsPatterns) {
        const match = message.match(pattern);
        if (match) {
          queryType = 'news';
          if (match[1]) entities.push(match[1]);
          break;
        }
      }
    }
  }

  return { isFinancialQuery, queryType, entities };
}

// Add this function to format sentiment data for Gemini
function formatSentimentDataForAI(sentimentData: any, queryType: string, query?: string): string {
  let contextData = '';

  switch (queryType) {
    case 'stock':
      contextData += `STOCK SENTIMENT ANALYSIS FOR: ${query?.toUpperCase()}\n\n`;
      contextData += `Overall Sentiment: ${sentimentData.avgSentiment.toFixed(3)} (${sentimentData.trend})\n`;
      contextData += `Total Articles: ${sentimentData.totalArticles}\n`;
      contextData += `Positive: ${sentimentData.positiveCount}, Negative: ${sentimentData.negativeCount}, Neutral: ${sentimentData.neutralCount}\n\n`;
      
      if (sentimentData.articles.length > 0) {
        contextData += `RECENT NEWS HEADLINES:\n`;
        sentimentData.articles.slice(0, 5).forEach((article: any, index: number) => {
          contextData += `${index + 1}. ${article.title} (Sentiment: ${article.sentiment.score.toFixed(2)})\n`;
        });
      }
      break;

    case 'sector':
      contextData += `SECTOR SENTIMENT ANALYSIS FOR: ${query?.toUpperCase()}\n\n`;
      contextData += `Overall Sentiment: ${sentimentData.avgSentiment.toFixed(3)} (${sentimentData.trend})\n`;
      contextData += `Total Articles: ${sentimentData.totalArticles}\n`;
      contextData += `Positive: ${sentimentData.positiveCount}, Negative: ${sentimentData.negativeCount}, Neutral: ${sentimentData.neutralCount}\n\n`;
      
      if (sentimentData.topStocks.length > 0) {
        contextData += `TOP STOCKS IN SECTOR: ${sentimentData.topStocks.slice(0, 5).join(', ')}\n\n`;
      }
      
      if (sentimentData.articles.length > 0) {
        contextData += `RECENT NEWS HEADLINES:\n`;
        sentimentData.articles.slice(0, 5).forEach((article: any, index: number) => {
          contextData += `${index + 1}. ${article.title} (Sentiment: ${article.sentiment.score.toFixed(2)})\n`;
        });
      }
      break;

    case 'market':
      contextData += `MARKET OVERVIEW & SENTIMENT ANALYSIS\n\n`;
      contextData += `Overall Market Sentiment: ${sentimentData.avgSentiment.toFixed(3)}\n`;
      contextData += `Total Articles Analyzed: ${sentimentData.totalArticles}\n`;
      contextData += `Sentiment Distribution - Positive: ${sentimentData.sentimentDistribution.positive}, Negative: ${sentimentData.sentimentDistribution.negative}, Neutral: ${sentimentData.sentimentDistribution.neutral}\n\n`;
      
      contextData += `TOP SECTORS BY COVERAGE:\n`;
      sentimentData.topSectors.slice(0, 5).forEach((sector: any, index: number) => {
        contextData += `${index + 1}. ${sector.sector}: ${sector.sentiment.toFixed(2)} sentiment (${sector.count} articles)\n`;
      });
      
      contextData += `\nTOP STOCKS BY COVERAGE:\n`;
      sentimentData.topStocks.slice(0, 10).forEach((stock: any, index: number) => {
        contextData += `${index + 1}. ${stock.stock}: ${stock.sentiment.toFixed(2)} sentiment (${stock.count} articles)\n`;
      });
      break;

    case 'news':
      contextData += `RECENT NEWS SEARCH RESULTS FOR: ${query?.toUpperCase()}\n\n`;
      if (sentimentData.articles && sentimentData.articles.length > 0) {
        contextData += `RELEVANT NEWS ARTICLES:\n`;
        sentimentData.articles.slice(0, 10).forEach((article: any, index: number) => {
          contextData += `${index + 1}. ${article.title} (Sentiment: ${article.sentiment.score.toFixed(2)})\n`;
          contextData += `   ${article.content.substring(0, 100)}...\n\n`;
        });
      }
      break;
  }

  return contextData;
}

export async function POST(req: Request) {
  try {
    // Parse request
    const { messages, model = "gemini-2.5-flash-preview-05-20", fileUri, fileMimeType, transcription } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 })
    }

    // Get the generative model with appropriate settings
    const modelConfig: any = { model }
    
    // Add specific configurations for video-capable models
    if (model === "gemini-2.0-flash-exp" && fileMimeType?.startsWith("video/")) {
      // Gemini 2.0 Flash might have different video capabilities
      modelConfig.generationConfig = {
        temperature: 0.4, // Lower temperature for more focused analysis
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    }
    
    const generativeModel = genAI.getGenerativeModel(modelConfig)

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("No user message found", { status: 400 })
    }

    // Convert messages to Gemini format, excluding system messages and initial assistant greeting
    const history = messages
      .filter((m) => m.role !== "system" && m.id !== "welcome-message")
      .slice(0, -1) // Exclude the last message which we'll send separately
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }))
    
    // Ensure history starts with user message or is empty
    if (history.length > 0 && history[0].role !== "user") {
      history.shift() // Remove first message if it's not from user
    }

    // Start chat session with history
    // Use higher token limits for video analysis
    const isVideoAnalysis = fileMimeType?.startsWith("video/")
    const chat = generativeModel.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: isVideoAnalysis ? 8192 : 4096, // Much higher limit for videos
      },
    })

    // Prepare content parts for multimodal input
    const contentParts = []
    
    // Add file if provided
    if (fileUri && fileMimeType) {
      console.log(`Processing file: ${fileMimeType}, URI: ${fileUri}`)
      contentParts.push({
        fileData: {
          mimeType: fileMimeType,
          fileUri: fileUri
        }
      })
    }
    
    // Prepare the message content
    let messageContent = lastMessage.content

    // **NEW: Sentiment Analysis Integration**
    const sentimentQuery = detectSentimentQuery(messageContent);

    if (sentimentQuery.isFinancialQuery && sentimentQuery.queryType) {
      const sentimentAnalyzer = new SentimentAnalyzer();
      let sentimentData;

      try {
        switch (sentimentQuery.queryType) {
          case 'stock':
            if (sentimentQuery.entities.length > 0) {
              sentimentData = sentimentAnalyzer.getStockSentiment(sentimentQuery.entities[0]);
            }
            break;
          case 'sector':
            if (sentimentQuery.entities.length > 0) {
              sentimentData = sentimentAnalyzer.getSectorSentiment(sentimentQuery.entities[0]);
            }
            break;
          case 'market':
            sentimentData = sentimentAnalyzer.getMarketOverview();
            break;
          case 'news':
            if (sentimentQuery.entities.length > 0) {
              const newsResults = sentimentAnalyzer.searchNews(sentimentQuery.entities[0]);
              sentimentData = { articles: newsResults };
            }
            break;
        }

        if (sentimentData) {
          const sentimentContext = formatSentimentDataForAI(
            sentimentData, 
            sentimentQuery.queryType, 
            sentimentQuery.entities[0]
          );
          
          // Add sentiment context to your existing message/prompt
          messageContent += `\n\nCONTEXT DATA FROM SENTIMENT ANALYSIS:\n${sentimentContext}\n\nPlease analyze this data and provide insights based on the sentiment analysis above. Focus on trends, risks, opportunities, and strategic recommendations.`;
          
          console.log(`Added sentiment context for ${sentimentQuery.queryType} query: ${sentimentQuery.entities[0] || 'general'}`);
        }
      } catch (error) {
        console.error('Error fetching sentiment data:', error);
      }
    }
    // **END: Sentiment Analysis Integration**
    
    // If it's a media file and no user input, add appropriate analysis instruction
    if (fileMimeType && !lastMessage.content.trim()) {
      if (fileMimeType.startsWith("audio/")) {
        messageContent = "Please analyze this audio file. Provide insights about the content, context, and any notable aspects you observe."
      } else if (fileMimeType.startsWith("video/")) {
        messageContent = `Please provide a comprehensive analysis of this entire video from start to finish. Include:

1. **Overview**: Brief summary of the video's purpose and content
2. **Visual Analysis**: 
   - Describe all scenes in chronological order with timestamps
   - Note any text, graphics, or visual effects
   - Describe camera movements, transitions, and editing style
3. **Audio Analysis**:
   - Transcribe or summarize any narration, dialogue, or speech
   - Describe background music, sound effects, or audio cues
   - Note the tone and pacing of audio elements
4. **Technical Aspects**: Video quality, aspect ratio, production value
5. **Complete Timeline**: Provide a scene-by-scene breakdown with approximate timestamps
6. **Key Messages**: Main themes or messages conveyed
7. **Overall Assessment**: Style, effectiveness, and notable features

Please ensure you analyze the ENTIRE video duration from beginning to end.`
      } else if (fileMimeType.startsWith("image/")) {
        messageContent = "Please analyze this image. Describe what you see and provide any relevant insights or observations."
      }
    } else if (fileMimeType?.startsWith("video/") && lastMessage.content.trim().toLowerCase().includes("analyze")) {
      // If user asks to analyze a video, ensure comprehensive analysis
      messageContent = lastMessage.content + `

Please ensure your analysis covers:
- The complete video from start to finish
- All visual scenes with timestamps
- Any audio, narration, or dialogue
- Technical aspects and production quality
- A detailed timeline of events
- Key messages and themes

Analyze the ENTIRE video duration, not just the beginning.`
    }
    
    // Add text message
    let finalMessageContent = messageContent
    
    // If we have transcription data for video/audio, include it as context
    if (transcription && transcription.text && (fileMimeType?.startsWith("video/") || fileMimeType?.startsWith("audio/"))) {
      const duration = transcription.duration ? ` (Duration: ${Math.floor(transcription.duration / 60)}:${Math.floor(transcription.duration % 60).toString().padStart(2, '0')})` : ''
      const language = transcription.language ? ` [Language: ${transcription.language}]` : ''
      
      finalMessageContent += `\n\nTranscription of audio track${language}${duration}:\n"${transcription.text}"\n\nPlease incorporate this transcription into your complete analysis.`
      
      console.log(`Including transcription in analysis - Length: ${transcription.text.length} chars`)
    }
    
    contentParts.push({ text: finalMessageContent })
    
    // Send message and get streaming response
    const result = await chat.sendMessageStream(contentParts)

    // Create a TransformStream to convert the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            // Format as data stream for AI SDK v4
            // Escape the text properly for JSON
            const escapedText = text
              .replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t')
            
            const formatted = `0:"${escapedText}"\n`
            controller.enqueue(encoder.encode(formatted))
          }
          // Send the done signal
          controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`))
        } catch (error) {
          console.error("Streaming error:", error)
          // Send error signal
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          const escapedError = errorMessage
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
          controller.enqueue(encoder.encode(`3:{"error":"${escapedError}"}\n`))
        } finally {
          controller.close()
        }
      },
    })

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error("Chat API Error:", error)
    
    // Return error in data stream format
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const escapedError = errorMessage
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
    return new Response(
      `3:{"error":"${escapedError}"}\n`,
      { 
        status: 200, // Keep 200 for data stream compatibility
        headers: { 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        }
      }
    )
  }
}