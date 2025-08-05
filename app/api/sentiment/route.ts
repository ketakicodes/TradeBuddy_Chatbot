// app/api/sentiment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SentimentAnalyzer } from '@/lib/sentiment-utils';

const sentimentAnalyzer = new SentimentAnalyzer();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '20');

    switch (action) {
      case 'stock':
        if (!query) {
          return NextResponse.json({ error: 'Stock symbol required' }, { status: 400 });
        }
        const stockData = sentimentAnalyzer.getStockSentiment(query);
        return NextResponse.json({
          success: true,
          data: stockData,
          type: 'stock'
        });

      case 'sector':
        if (!query) {
          return NextResponse.json({ error: 'Sector name required' }, { status: 400 });
        }
        const sectorData = sentimentAnalyzer.getSectorSentiment(query);
        return NextResponse.json({
          success: true,
          data: sectorData,
          type: 'sector'
        });

      case 'overview':
        const overviewData = sentimentAnalyzer.getMarketOverview();
        return NextResponse.json({
          success: true,
          data: overviewData,
          type: 'overview'
        });

      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Search query required' }, { status: 400 });
        }
        const searchResults = sentimentAnalyzer.searchNews(query, limit);
        return NextResponse.json({
          success: true,
          data: searchResults,
          type: 'search'
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: stock, sector, overview, or search' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Sentiment API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, limit = 20 } = body;

    // Handle batch requests or complex queries
    if (action === 'batch') {
      const { requests } = body;
      const results = [];

      for (const req of requests) {
        switch (req.type) {
          case 'stock':
            results.push({
              type: 'stock',
              query: req.query,
              data: sentimentAnalyzer.getStockSentiment(req.query)
            });
            break;
          case 'sector':
            results.push({
              type: 'sector',
              query: req.query,
              data: sentimentAnalyzer.getSectorSentiment(req.query)
            });
            break;
        }
      }

      return NextResponse.json({
        success: true,
        data: results,
        type: 'batch'
      });
    }

    return NextResponse.json({ 
      error: 'Invalid POST action' 
    }, { status: 400 });

  } catch (error) {
    console.error('Sentiment API POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}