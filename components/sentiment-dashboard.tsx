'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  BarChart3, 
  PieChart, 
  Calendar,
  ExternalLink 
} from 'lucide-react';

interface SentimentDashboardProps {
  onSendMessage: (message: string) => void;
}

export function SentimentDashboard({ onSendMessage }: SentimentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchMarketOverview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sentiment?action=overview');
      const result = await response.json();
      if (result.success) {
        setMarketData(result.data);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketOverview();
  }, []);

  const handleQuickAnalysis = (query: string) => {
    onSendMessage(query);
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.1) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (sentiment < -0.1) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (sentiment < -0.1) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  };

  const quickQueries = [
    "How is the tech sector doing?",
    "Give me market overview",
    "Analyze AAPL stock sentiment",
    "What's the sentiment on cryptocurrency?",
    "How is the healthcare sector performing?",
    "Show me recent financial news"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Market Sentiment Analysis
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          AI-powered financial sentiment analysis based on news data
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Quick Analysis
          </CardTitle>
          <CardDescription>
            Click any query below to get instant analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto py-2 px-3"
                onClick={() => handleQuickAnalysis(query)}
              >
                {query}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      {marketData && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="stocks">Top Stocks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {marketData.avgSentiment.toFixed(3)}
                    </span>
                    {getSentimentIcon(marketData.avgSentiment)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {marketData.totalArticles} articles
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {marketData.totalArticles.toLocaleString()}
                    </span>
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    July & August 2025
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sentiment Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Positive</span>
                      <span>{marketData.sentimentDistribution.positive}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Negative</span>
                      <span>{marketData.sentimentDistribution.negative}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-600">Neutral</span>
                      <span>{marketData.sentimentDistribution.neutral}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Sectors by Coverage</CardTitle>
                <CardDescription>
                  Sectors with the most news coverage and their sentiment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData.topSectors.map((sector: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium min-w-0 flex-1">
                          {sector.sector}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {sector.count} articles
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(sector.sentiment)}
                        <span className="text-sm font-mono">
                          {sector.sentiment.toFixed(3)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => handleQuickAnalysis(`How is the ${sector.sector} sector doing?`)}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stocks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Stocks by Coverage</CardTitle>
                <CardDescription>
                  Most mentioned stocks and their sentiment scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData.topStocks.map((stock: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium font-mono">
                          {stock.stock}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {stock.count} articles
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(stock.sentiment)}
                        <span className="text-sm font-mono">
                          {stock.sentiment.toFixed(3)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => handleQuickAnalysis(`Analyze ${stock.stock} stock sentiment`)}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading market data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Custom Analysis
          </CardTitle>
          <CardDescription>
            Ask specific questions about stocks, sectors, or market conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., How is AAPL performing? or Analyze tech sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleQuickAnalysis(searchQuery);
                  setSearchQuery('');
                }
              }}
              className="flex-1"
            />
            <Button 
              onClick={() => {
                if (searchQuery.trim()) {
                  handleQuickAnalysis(searchQuery);
                  setSearchQuery('');
                }
              }}
              disabled={!searchQuery.trim()}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Available Analysis Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Stock Analysis</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• "How is AAPL stock doing?"</li>
                <li>• "Analyze TSLA sentiment"</li>
                <li>• "MSFT performance analysis"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sector Analysis</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• "How is tech sector performing?"</li>
                <li>• "Healthcare industry sentiment"</li>
                <li>• "Energy sector analysis"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Market Overview</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• "Give me market overview"</li>
                <li>• "Overall market sentiment"</li>
                <li>• "Market conditions analysis"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">News Search</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• "Latest news about Tesla"</li>
                <li>• "Recent crypto news"</li>
                <li>• "AI industry updates"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}