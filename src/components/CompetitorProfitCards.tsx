import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, DollarSign, Target, Trophy } from 'lucide-react';
import { Keyword } from '../lib/types';

interface CompetitorProfitCardsProps {
  keywords: Keyword[];
  avgJobPrice?: number;
  competitor1Name?: string | null;
  competitor2Name?: string | null;
  competitor3Name?: string | null;
}

interface CompetitorStats {
  name: string;
  totalProfit: number;
  rankingsWon: number;
  avgRank: number;
  keywordsTracked: number;
}

export default function CompetitorProfitCards({ keywords, avgJobPrice = 0, competitor1Name, competitor2Name, competitor3Name }: CompetitorProfitCardsProps) {
  // Use provided names or fall back to defaults
  const comp1Name = competitor1Name || 'Competitor 1';
  const comp2Name = competitor2Name || 'Competitor 2';
  const comp3Name = competitor3Name || 'Competitor 3';

  // Debug logging
  console.log('🔍 CompetitorProfitCards Debug:', {
    keywordsCount: keywords.length,
    avgJobPrice,
    sampleKeywords: keywords.slice(0, 3).map(k => ({
      keyword: k.keyword,
      competitor1Rank: k.competitor1Rank,
      competitor2Rank: k.competitor2Rank,
      competitor3Rank: k.competitor3Rank,
      searchVolume: k.searchVolume,
    })),
    competitor1Name: comp1Name,
    competitor2Name: comp2Name,
    competitor3Name: comp3Name,
  });

  // CTR based on rank position (same as used in revenue calculations)
  const getCTRByRank = (rank: number): number => {
    if (rank === 1) return 0.30;
    if (rank === 2) return 0.15;
    if (rank === 3) return 0.10;
    if (rank <= 5) return 0.05;
    if (rank <= 10) return 0.02;
    return 0.005;
  };

  // Calculate competitor profits
  const calculateCompetitorProfits = (): CompetitorStats[] => {
    const competitorData: { [key: string]: { profit: number; ranks: number[]; keywords: number } } = {
      [comp1Name]: { profit: 0, ranks: [], keywords: 0 },
      [comp2Name]: { profit: 0, ranks: [], keywords: 0 },
      [comp3Name]: { profit: 0, ranks: [], keywords: 0 },
    };

    keywords.forEach(kw => {
      // Competitor 1 - check for valid rank (including 0)
      if (kw.competitor1Rank !== undefined && kw.competitor1Rank !== null && kw.competitor1Rank >= 0 && kw.competitor1Rank <= 20) {
        competitorData[comp1Name].keywords++;
        if (kw.competitor1Rank > 0) {
          competitorData[comp1Name].ranks.push(kw.competitor1Rank);
        }
        
        // Calculate revenue based on competitor's rank position
        if (kw.competitor1Rank > 0) {
          const ctr = getCTRByRank(kw.competitor1Rank);
          const conversionRate = 0.005; // 0.5% conversion rate
          const clicks = kw.searchVolume * ctr;
          const conversions = clicks * conversionRate;
          const monthlyRevenue = conversions * avgJobPrice;
          competitorData[comp1Name].profit += monthlyRevenue;
        }
      }

      // Competitor 2 - check for valid rank (including 0)
      if (kw.competitor2Rank !== undefined && kw.competitor2Rank !== null && kw.competitor2Rank >= 0 && kw.competitor2Rank <= 20) {
        competitorData[comp2Name].keywords++;
        if (kw.competitor2Rank > 0) {
          competitorData[comp2Name].ranks.push(kw.competitor2Rank);
        }
        
        if (kw.competitor2Rank > 0) {
          const ctr = getCTRByRank(kw.competitor2Rank);
          const conversionRate = 0.005;
          const clicks = kw.searchVolume * ctr;
          const conversions = clicks * conversionRate;
          const monthlyRevenue = conversions * avgJobPrice;
          competitorData[comp2Name].profit += monthlyRevenue;
        }
      }

      // Competitor 3 - check for valid rank (including 0)
      if (kw.competitor3Rank !== undefined && kw.competitor3Rank !== null && kw.competitor3Rank >= 0 && kw.competitor3Rank <= 20) {
        competitorData[comp3Name].keywords++;
        if (kw.competitor3Rank > 0) {
          competitorData[comp3Name].ranks.push(kw.competitor3Rank);
        }
        
        if (kw.competitor3Rank > 0) {
          const ctr = getCTRByRank(kw.competitor3Rank);
          const conversionRate = 0.005;
          const clicks = kw.searchVolume * ctr;
          const conversions = clicks * conversionRate;
          const monthlyRevenue = conversions * avgJobPrice;
          competitorData[comp3Name].profit += monthlyRevenue;
        }
      }
    });

    // Always return all 3 competitors in original order, regardless of data
    const competitors: CompetitorStats[] = [comp1Name, comp2Name, comp3Name].map(name => {
      const data = competitorData[name];
      return {
        name,
        totalProfit: Math.round(data.profit),
        rankingsWon: data.ranks.filter(r => r <= 3).length, // Count top 3 rankings
        avgRank: data.ranks.length > 0 ? Math.round(data.ranks.reduce((sum, r) => sum + r, 0) / data.ranks.length) : 0,
        keywordsTracked: data.keywords,
      };
    });

    console.log('📊 Competitor Calculations:', {
      competitorData,
      competitors,
    });

    return competitors;
  };

  const competitors = calculateCompetitorProfits();

  // Check if we have any data at all
  const hasAnyData = competitors.some(c => c.keywordsTracked > 0);

  const getPositionIcon = (index: number) => {
    if (index === 0) return <Trophy className="size-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="size-5 text-slate-400" />;
    if (index === 2) return <Trophy className="size-5 text-amber-600" />;
    return <Target className="size-5 text-slate-400" />;
  };

  const getPositionColor = (index: number) => {
    if (index === 0) return '#FCD34D'; // Gold
    if (index === 1) return '#94A3B8'; // Silver
    if (index === 2) return '#F59E0B'; // Bronze
    return '#64748B';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900">Top Competitors Performance</h3>
        <Badge variant="outline" className="text-sm">
          Based on {keywords.length} keywords
        </Badge>
      </div>

      {!hasAnyData && (
        <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> No competitor ranking data available yet. Import keywords with competitor rankings from Excel to see performance analysis.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {competitors.map((comp, index) => (
          <Card 
            key={comp.name}
            className="p-6 hover:shadow-lg transition-all relative overflow-hidden"
            style={{
              borderTop: `4px solid ${getPositionColor(index)}`,
            }}
          >
            {/* Position Badge */}
            <div className="absolute top-4 right-4">
              {getPositionIcon(index)}
            </div>

            {/* Competitor Name */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{
                    backgroundColor: `${getPositionColor(index)}20`,
                    borderColor: getPositionColor(index),
                    color: index === 0 ? '#854D0E' : index === 1 ? '#475569' : '#92400E',
                  }}
                >
                  #{index + 1}
                </Badge>
                <span className="text-xs text-slate-500">Position</span>
              </div>
              <h4 className="text-slate-900" style={{ fontWeight: 600 }}>
                {comp.name}
              </h4>
            </div>

            {/* Profit */}
            <div className="text-start p-2 bg-green-50 rounded relative">
              {/* Trending Icon - Top Right */}
              <div className="absolute top-2 right-2">
                <TrendingUp className="size-4 text-green-600" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="size-4 text-green-600" />
                <span className="text-xs text-slate-600">Estimated Monthly Gain</span>
              </div>
              <p className="text-3xl text-green-600" style={{ fontWeight: 700 }}>
                ${comp.totalProfit.toLocaleString()}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-slate-50 rounded">
                <p className="text-xs text-slate-600">Avg Rank</p>
                <p className="text-lg" style={{ fontWeight: 700, color: '#0052CC' }}>
                  #{comp.avgRank}
                </p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="text-xs text-green-600">Top 3</p>
                <p className="text-lg" style={{ fontWeight: 700, color: '#00C47E' }}>
                  {comp.rankingsWon}
                </p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <p className="text-xs text-blue-600">Keywords</p>
                <p className="text-lg" style={{ fontWeight: 700, color: '#0052CC' }}>
                  {comp.keywordsTracked}
                </p>
              </div>
            </div>

            {/* Trend Indicator */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <TrendingUp className="size-3" />
                <span>Gaining from better rankings</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Box */}
      
    </div>
  );
}