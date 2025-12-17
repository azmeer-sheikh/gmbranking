import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, DollarSign, Award, Target } from 'lucide-react';

interface KeywordData {
  keyword: string;
  search_volume: number;
  cpc: number;
  competitor_1: number | null;
  competitor_2: number | null;
  competitor_3: number | null;
}

interface CompetitorPerformanceProps {
  keywords: KeywordData[];
  avgJobPrice: number;
  competitor1Name?: string;
  competitor2Name?: string;
  competitor3Name?: string;
}

// Click-through rates by position (industry standard)
const getCTRByPosition = (position: number): number => {
  const ctrMap: { [key: number]: number } = {
    1: 0.316,  // 31.6% CTR for position 1
    2: 0.158,  // 15.8% CTR for position 2
    3: 0.107,  // 10.7% CTR for position 3
    4: 0.074,  // 7.4% CTR for position 4
    5: 0.055,  // 5.5% CTR for position 5
    6: 0.042,  // 4.2% CTR for position 6
    7: 0.034,  // 3.4% CTR for position 7
    8: 0.028,  // 2.8% CTR for position 8
    9: 0.024,  // 2.4% CTR for position 9
    10: 0.021, // 2.1% CTR for position 10
  };
  
  return ctrMap[position] || 0.01; // Default 1% for positions beyond 10
};

const calculateCompetitorProfit = (
  keywords: KeywordData[],
  competitorNumber: 1 | 2 | 3,
  avgJobPrice: number,
  conversionRate: number = 0.035 // 3.5% conversion rate
): { revenue: number; cost: number; profit: number; topKeywords: string[] } => {
  let totalRevenue = 0;
  let totalCost = 0;
  const keywordProfits: { keyword: string; profit: number }[] = [];

  keywords.forEach((kw) => {
    const competitorRank = competitorNumber === 1 
      ? kw.competitor_1 
      : competitorNumber === 2 
      ? kw.competitor_2 
      : kw.competitor_3;

    if (!competitorRank || competitorRank > 10) return; // Only calculate for top 10 positions

    const monthlySearches = kw.search_volume;
    const ctr = getCTRByPosition(competitorRank);
    const clicks = monthlySearches * ctr;
    
    // Calculate revenue
    const conversions = clicks * conversionRate;
    const revenue = conversions * avgJobPrice;
    
    // Calculate cost
    const cost = clicks * kw.cpc;
    
    const profit = revenue - cost;
    
    totalRevenue += revenue;
    totalCost += cost;
    keywordProfits.push({ keyword: kw.keyword, profit });
  });

  // Get top 3 keywords by profit
  const topKeywords = keywordProfits
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 3)
    .map(k => k.keyword);

  return {
    revenue: totalRevenue,
    cost: totalCost,
    profit: totalRevenue - totalCost,
    topKeywords,
  };
};

export default function CompetitorPerformance({ keywords, avgJobPrice, competitor1Name, competitor2Name, competitor3Name }: CompetitorPerformanceProps) {
  // Calculate performance for all 3 competitors
  const competitor1 = calculateCompetitorProfit(keywords, 1, avgJobPrice);
  const competitor2 = calculateCompetitorProfit(keywords, 2, avgJobPrice);
  const competitor3 = calculateCompetitorProfit(keywords, 3, avgJobPrice);

  // Debug logging
  console.log('🎯 CompetitorPerformance Props:', {
    competitor1Name,
    competitor2Name,
    competitor3Name,
    avgJobPrice,
    keywordsCount: keywords.length
  });

  // Sort competitors by profit
  const competitors = [
    { name: competitor1Name || 'Competitor #1', data: competitor1, color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
    { name: competitor2Name || 'Competitor #2', data: competitor2, color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
    { name: competitor3Name || 'Competitor #3', data: competitor3, color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
  ].sort((a, b) => b.data.profit - a.data.profit);

  // Check if we have any competitor data
  const hasData = competitors.some(c => c.data.profit > 0);

  if (!hasData) {
    return (
      <Card className="p-6 bg-slate-50 border-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Target className="size-5 text-slate-500" />
          </div>
          <div>
            <h3 className="text-slate-900 mb-1" style={{ fontWeight: 600 }}>
              Top Competitors Performance
            </h3>
            <p className="text-sm text-slate-500">
              No competitor ranking data available. Import keywords with competitor rankings to see profit analysis.
            </p>
          </div>
        </div>
      </Card>
    );
  }
}