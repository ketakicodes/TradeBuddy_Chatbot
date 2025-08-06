// lib/sentiment-utils.ts
import fs from 'fs';
import path from 'path';

// Updated interfaces to match your actual JSON structure
export interface Topic {
  topic: string;
  relevance_score: string;
}

export interface TickerSentiment {
  ticker: string;
  relevance_score: string;
  ticker_sentiment_score: string;
  ticker_sentiment_label: string;
}

export interface RawNewsItem {
  title: string;
  time_published: string;
  topics: Topic[];
  ticker_sentiment: TickerSentiment[];
}

// Transformed interface for internal use
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

// Raw data structure from your JSON files
export interface RawSentimentData {
  [date: string]: RawNewsItem[];
}

export class SentimentAnalyzer {
  private julyData: RawSentimentData | null = null;
  private augustData: RawSentimentData | null = null;

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      
      // Load July data
      const julyPath = path.join(dataDir, 'simulated_July_news_2025.json');
      if (fs.existsSync(julyPath)) {
        try {
          const julyContent = fs.readFileSync(julyPath, 'utf-8');
          const parsedJulyData = JSON.parse(julyContent);
          
          // Validate the structure
          if (parsedJulyData && typeof parsedJulyData === 'object') {
            this.julyData = parsedJulyData;
          } else {
            console.warn('July data does not have expected structure');
            this.julyData = null;
          }
        } catch (parseError) {
          console.error('Error parsing July data:', parseError);
          this.julyData = null;
        }
      }

      // Load August data
      const augustPath = path.join(dataDir, 'simulated_August_news_2025.json');
      if (fs.existsSync(augustPath)) {
        try {
          const augustContent = fs.readFileSync(augustPath, 'utf-8');
          const parsedAugustData = JSON.parse(augustContent);
          
          // Validate the structure
          if (parsedAugustData && typeof parsedAugustData === 'object') {
            this.augustData = parsedAugustData;
          } else {
            console.warn('August data does not have expected structure');
            this.augustData = null;
          }
        } catch (parseError) {
          console.error('Error parsing August data:', parseError);
          this.augustData = null;
        }
      }
    } catch (error) {
      console.error('Error loading sentiment data:', error);
    }
  }

  // Transform raw data to our internal format
  private transformRawItem(rawItem: RawNewsItem, date: string, index: number): NewsItem {
    // Calculate overall sentiment from ticker sentiments
    let overallScore = 0;
    let totalRelevance = 0;
    
    if (rawItem.ticker_sentiment && rawItem.ticker_sentiment.length > 0) {
      rawItem.ticker_sentiment.forEach(ticker => {
        const relevance = parseFloat(ticker.relevance_score) || 0;
        const score = parseFloat(ticker.ticker_sentiment_score) || 0;
        overallScore += score * relevance;
        totalRelevance += relevance;
      });
      
      if (totalRelevance > 0) {
        overallScore = overallScore / totalRelevance;
      }
    }

    // Determine sentiment label
    let sentimentLabel: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (overallScore > 0.1) sentimentLabel = 'positive';
    else if (overallScore < -0.1) sentimentLabel = 'negative';

    // Extract stocks from ticker_sentiment
    const stocks = rawItem.ticker_sentiment?.map(t => t.ticker) || [];
    
    // Extract sectors from topics
    const sectors = rawItem.topics?.map(t => t.topic) || [];
    
    // Extract keywords from title (simple approach)
    const keywords = rawItem.title.toLowerCase().split(' ')
      .filter(word => word.length > 3)
      .slice(0, 10);

    return {
      id: `${date}_${index}`,
      title: rawItem.title,
      content: rawItem.title, // Using title as content since content isn't provided
      source: 'financial_news',
      timestamp: this.formatTimestamp(rawItem.time_published),
      sentiment: {
        score: overallScore,
        label: sentimentLabel,
        confidence: totalRelevance > 0 ? Math.min(totalRelevance, 1) : 0.5
      },
      entities: {
        stocks,
        sectors,
        companies: stocks // Using stocks as companies for now
      },
      keywords,
      relevance_score: totalRelevance
    };
  }

  private formatTimestamp(timePublished: string): string {
    // Convert from "20250801T093000" to ISO format
    if (timePublished && timePublished.length >= 8) {
      const year = timePublished.substring(0, 4);
      const month = timePublished.substring(4, 6);
      const day = timePublished.substring(6, 8);
      
      if (timePublished.length > 9) {
        const hour = timePublished.substring(9, 11) || '00';
        const minute = timePublished.substring(11, 13) || '00';
        const second = timePublished.substring(13, 15) || '00';
        return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
      }
      
      return `${year}-${month}-${day}T00:00:00Z`;
    }
    
    return new Date().toISOString();
  }

  public getAllData(): NewsItem[] {
    const allItems: NewsItem[] = [];
    
    // Process July data
    if (this.julyData) {
      Object.entries(this.julyData).forEach(([date, articles]) => {
        if (Array.isArray(articles)) {
          articles.forEach((article, index) => {
            try {
              const transformedItem = this.transformRawItem(article, date, index);
              allItems.push(transformedItem);
            } catch (error) {
              console.warn(`Error transforming article ${index} from ${date}:`, error);
            }
          });
        }
      });
    }
    
    // Process August data
    if (this.augustData) {
      Object.entries(this.augustData).forEach(([date, articles]) => {
        if (Array.isArray(articles)) {
          articles.forEach((article, index) => {
            try {
              const transformedItem = this.transformRawItem(article, date, index);
              allItems.push(transformedItem);
            } catch (error) {
              console.warn(`Error transforming article ${index} from ${date}:`, error);
            }
          });
        }
      });
    }
    
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
      item.entities?.stocks?.some(stock => 
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

    const avgSentiment = stockArticles.reduce((sum, item) => sum + (item.sentiment?.score || 0), 0) / stockArticles.length;
    const positiveCount = stockArticles.filter(item => item.sentiment?.label === 'positive').length;
    const negativeCount = stockArticles.filter(item => item.sentiment?.label === 'negative').length;
    const neutralCount = stockArticles.filter(item => item.sentiment?.label === 'neutral').length;

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
      item.entities?.sectors?.some(sector => 
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

    const avgSentiment = sectorArticles.reduce((sum, item) => sum + (item.sentiment?.score || 0), 0) / sectorArticles.length;
    const positiveCount = sectorArticles.filter(item => item.sentiment?.label === 'positive').length;
    const negativeCount = sectorArticles.filter(item => item.sentiment?.label === 'negative').length;
    const neutralCount = sectorArticles.filter(item => item.sentiment?.label === 'neutral').length;

    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (avgSentiment > 0.1) trend = 'bullish';
    else if (avgSentiment < -0.1) trend = 'bearish';

    // Get top mentioned stocks in this sector
    const stockMentions: { [stock: string]: number } = {};
    sectorArticles.forEach(article => {
      if (article.entities?.stocks) {
        article.entities.stocks.forEach(stock => {
          stockMentions[stock] = (stockMentions[stock] || 0) + 1;
        });
      }
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

    if (allData.length === 0) {
      return {
        totalArticles: 0,
        avgSentiment: 0,
        topSectors: [],
        topStocks: [],
        sentimentDistribution: {
          positive: 0,
          negative: 0,
          neutral: 0
        }
      };
    }

    const avgSentiment = allData.reduce((sum, item) => sum + (item.sentiment?.score || 0), 0) / allData.length;
    
    const sectorStats: { [sector: string]: { sentiment: number; count: number } } = {};
    const stockStats: { [stock: string]: { sentiment: number; count: number } } = {};

    allData.forEach(article => {
      if (article.entities?.sectors) {
        article.entities.sectors.forEach(sector => {
          if (!sectorStats[sector]) sectorStats[sector] = { sentiment: 0, count: 0 };
          sectorStats[sector].sentiment += article.sentiment?.score || 0;
          sectorStats[sector].count += 1;
        });
      }

      if (article.entities?.stocks) {
        article.entities.stocks.forEach(stock => {
          if (!stockStats[stock]) stockStats[stock] = { sentiment: 0, count: 0 };
          stockStats[stock].sentiment += article.sentiment?.score || 0;
          stockStats[stock].count += 1;
        });
      }
    });

    const topSectors = Object.entries(sectorStats)
      .map(([sector, stats]) => ({
        sector,
        sentiment: stats.count > 0 ? stats.sentiment / stats.count : 0,
        count: stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topStocks = Object.entries(stockStats)
      .map(([stock, stats]) => ({
        stock,
        sentiment: stats.count > 0 ? stats.sentiment / stats.count : 0,
        count: stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const sentimentDistribution = {
      positive: allData.filter(item => item.sentiment?.label === 'positive').length,
      negative: allData.filter(item => item.sentiment?.label === 'negative').length,
      neutral: allData.filter(item => item.sentiment?.label === 'neutral').length
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
        item.title?.toLowerCase().includes(lowerQuery) ||
        item.content?.toLowerCase().includes(lowerQuery) ||
        item.entities?.stocks?.some(stock => stock.toLowerCase().includes(lowerQuery)) ||
        item.entities?.sectors?.some(sector => sector.toLowerCase().includes(lowerQuery)) ||
        item.entities?.companies?.some(company => company.toLowerCase().includes(lowerQuery)) ||
        item.keywords?.some(keyword => keyword.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
      .slice(0, limit);
  }

  // Helper method to check if data is loaded properly
  public getDataStatus(): {
    julyDataLoaded: boolean;
    augustDataLoaded: boolean;
    totalItems: number;
    julyDates: string[];
    augustDates: string[];
  } {
    const julyDates = this.julyData ? Object.keys(this.julyData) : [];
    const augustDates = this.augustData ? Object.keys(this.augustData) : [];
    
    return {
      julyDataLoaded: this.julyData !== null,
      augustDataLoaded: this.augustData !== null,
      totalItems: this.getAllData().length,
      julyDates,
      augustDates
    };
  }

  // Get data for a specific date
  public getDataByDate(date: string): NewsItem[] {
    const allItems: NewsItem[] = [];
    
    // Check July data
    if (this.julyData && this.julyData[date]) {
      const articles = this.julyData[date];
      if (Array.isArray(articles)) {
        articles.forEach((article, index) => {
          try {
            const transformedItem = this.transformRawItem(article, date, index);
            allItems.push(transformedItem);
          } catch (error) {
            console.warn(`Error transforming article ${index} from ${date}:`, error);
          }
        });
      }
    }
    
    // Check August data
    if (this.augustData && this.augustData[date]) {
      const articles = this.augustData[date];
      if (Array.isArray(articles)) {
        articles.forEach((article, index) => {
          try {
            const transformedItem = this.transformRawItem(article, date, index);
            allItems.push(transformedItem);
          } catch (error) {
            console.warn(`Error transforming article ${index} from ${date}:`, error);
          }
        });
      }
    }
    
    return allItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}