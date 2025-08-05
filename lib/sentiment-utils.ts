// lib/sentiment-utils.ts
import fs from 'fs';
import path from 'path';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: string;
  sentiment: {
    score: number; // -1 to 1 (negative to positive)
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  entities: {
    stocks: string[];
    sectors: string[];
    companies: string[];
  };
  keywords: string[];
  relevance_score: number;
}

export interface SentimentData {
  month: string;
  year: number;
  news_items: NewsItem[];
  metadata: {
    total_items: number;
    date_range: {
      start: string;
      end: string;
    };
  };
}

export class SentimentAnalyzer {
  private julyData: SentimentData | null = null;
  private augustData: SentimentData | null = null;

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      
      // Load July data
      const julyPath = path.join(dataDir, 'simulated_July_news_2025.json');
      if (fs.existsSync(julyPath)) {
        this.julyData = JSON.parse(fs.readFileSync(julyPath, 'utf-8'));
      }

      // Load August data
      const augustPath = path.join(dataDir, 'simulated_August_news_2025.json');
      if (fs.existsSync(augustPath)) {
        this.augustData = JSON.parse(fs.readFileSync(augustPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading sentiment data:', error);
    }
  }

  public getAllData(): NewsItem[] {
    const allItems: NewsItem[] = [];
    if (this.julyData) allItems.push(...this.julyData.news_items);
    if (this.augustData) allItems.push(...this.augustData.news_items);
    return allItems;
  }

  public getStockSentiment(stockSymbol: string): {
    articles: NewsItem[];
    avgSentiment: number;
    totalArticles: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  } {
    const allData = this.getAllData();
    const stockArticles = allData.filter(item => 
      item.entities.stocks.some(stock => 
        stock.toLowerCase().includes(stockSymbol.toLowerCase())
      )
    );

    if (stockArticles.length === 0) {
      return {
        articles: [],
        avgSentiment: 0,
        totalArticles: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        trend: 'neutral'
      };
    }

    const avgSentiment = stockArticles.reduce((sum, item) => sum + item.sentiment.score, 0) / stockArticles.length;
    const positiveCount = stockArticles.filter(item => item.sentiment.label === 'positive').length;
    const negativeCount = stockArticles.filter(item => item.sentiment.label === 'negative').length;
    const neutralCount = stockArticles.filter(item => item.sentiment.label === 'neutral').length;

    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (avgSentiment > 0.1) trend = 'bullish';
    else if (avgSentiment < -0.1) trend = 'bearish';

    return {
      articles: stockArticles.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      avgSentiment,
      totalArticles: stockArticles.length,
      positiveCount,
      negativeCount,
      neutralCount,
      trend
    };
  }

  public getSectorSentiment(sectorName: string): {
    articles: NewsItem[];
    avgSentiment: number;
    totalArticles: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    topStocks: string[];
  } {
    const allData = this.getAllData();
    const sectorArticles = allData.filter(item => 
      item.entities.sectors.some(sector => 
        sector.toLowerCase().includes(sectorName.toLowerCase())
      )
    );

    if (sectorArticles.length === 0) {
      return {
        articles: [],
        avgSentiment: 0,
        totalArticles: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        trend: 'neutral',
        topStocks: []
      };
    }

    const avgSentiment = sectorArticles.reduce((sum, item) => sum + item.sentiment.score, 0) / sectorArticles.length;
    const positiveCount = sectorArticles.filter(item => item.sentiment.label === 'positive').length;
    const negativeCount = sectorArticles.filter(item => item.sentiment.label === 'negative').length;
    const neutralCount = sectorArticles.filter(item => item.sentiment.label === 'neutral').length;

    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (avgSentiment > 0.1) trend = 'bullish';
    else if (avgSentiment < -0.1) trend = 'bearish';

    // Get top mentioned stocks in this sector
    const stockMentions: { [stock: string]: number } = {};
    sectorArticles.forEach(article => {
      article.entities.stocks.forEach(stock => {
        stockMentions[stock] = (stockMentions[stock] || 0) + 1;
      });
    });

    const topStocks = Object.entries(stockMentions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([stock]) => stock);

    return {
      articles: sectorArticles.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      avgSentiment,
      totalArticles: sectorArticles.length,
      positiveCount,
      negativeCount,
      neutralCount,
      trend,
      topStocks
    };
  }

  public getMarketOverview(): {
    totalArticles: number;
    avgSentiment: number;
    topSectors: Array<{ sector: string; sentiment: number; count: number }>;
    topStocks: Array<{ stock: string; sentiment: number; count: number }>;
    sentimentDistribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
  } {
    const allData = this.getAllData();

    const avgSentiment = allData.reduce((sum, item) => sum + item.sentiment.score, 0) / allData.length;
    
    const sectorStats: { [sector: string]: { sentiment: number; count: number } } = {};
    const stockStats: { [stock: string]: { sentiment: number; count: number } } = {};

    allData.forEach(article => {
      article.entities.sectors.forEach(sector => {
        if (!sectorStats[sector]) sectorStats[sector] = { sentiment: 0, count: 0 };
        sectorStats[sector].sentiment += article.sentiment.score;
        sectorStats[sector].count += 1;
      });

      article.entities.stocks.forEach(stock => {
        if (!stockStats[stock]) stockStats[stock] = { sentiment: 0, count: 0 };
        stockStats[stock].sentiment += article.sentiment.score;
        stockStats[stock].count += 1;
      });
    });

    const topSectors = Object.entries(sectorStats)
      .map(([sector, stats]) => ({
        sector,
        sentiment: stats.sentiment / stats.count,
        count: stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topStocks = Object.entries(stockStats)
      .map(([stock, stats]) => ({
        stock,
        sentiment: stats.sentiment / stats.count,
        count: stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const sentimentDistribution = {
      positive: allData.filter(item => item.sentiment.label === 'positive').length,
      negative: allData.filter(item => item.sentiment.label === 'negative').length,
      neutral: allData.filter(item => item.sentiment.label === 'neutral').length
    };

    return {
      totalArticles: allData.length,
      avgSentiment,
      topSectors,
      topStocks,
      sentimentDistribution
    };
  }

  public searchNews(query: string, limit: number = 20): NewsItem[] {
    const allData = this.getAllData();
    const lowerQuery = query.toLowerCase();
    
    return allData
      .filter(item => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery) ||
        item.entities.stocks.some(stock => stock.toLowerCase().includes(lowerQuery)) ||
        item.entities.sectors.some(sector => sector.toLowerCase().includes(lowerQuery)) ||
        item.entities.companies.some(company => company.toLowerCase().includes(lowerQuery)) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);
  }
}