import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, DollarSign, Target, Trophy } from 'lucide-react';
import { Keyword } from '../lib/types';

interface CompetitorProfitCardsProps {
  keywords: Keyword[];
  avgJobPrice?: number;
}

interface CompetitorStats {
  name: string;
  totalProfit: number;
  rankingsWon: number;
  avgRank: number;
  keywordsTracked: number;
}

export default function CompetitorProfitCards({ keywords, avgJobPrice = 0 }: CompetitorProfitCardsProps) {
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
      'Competitor 1': { profit: 0, ranks: [], keywords: 0 },
      'Competitor 2': { profit: 0, ranks: [], keywords: 0 },
      'Competitor 3': { profit: 0, ranks: [], keywords: 0 },
    };

    keywords.forEach(kw => {
      // Competitor 1
      if (kw.competitor1Rank && kw.competitor1Rank > 0 && kw.competitor1Rank <= 20) {
        competitorData['Competitor 1'].keywords++;
        competitorData['Competitor 1'].ranks.push(kw.competitor1Rank);
        
        // Calculate revenue based on competitor's rank position
        const ctr = getCTRByRank(kw.competitor1Rank);
        const conversionRate = 0.005; // 0.5% conversion rate
        const clicks = kw.searchVolume * ctr;
        const conversions = clicks * conversionRate;
        const monthlyRevenue = conversions * avgJobPrice;
        competitorData['Competitor 1'].profit += monthlyRevenue;
      }

      // Competitor 2
      if (kw.competitor2Rank && kw.competitor2Rank > 0 && kw.competitor2Rank <= 20) {
        competitorData['Competitor 2'].keywords++;
        competitorData['Competitor 2'].ranks.push(kw.competitor2Rank);
        
        const ctr = getCTRByRank(kw.competitor2Rank);
        const conversionRate = 0.005;
        const clicks = kw.searchVolume * ctr;
        const conversions = clicks * conversionRate;
        const monthlyRevenue = conversions * avgJobPrice;
        competitorData['Competitor 2'].profit += monthlyRevenue;
      }

      // Competitor 3
      if (kw.competitor3Rank && kw.competitor3Rank > 0 && kw.competitor3Rank <= 20) {
        competitorData['Competitor 3'].keywords++;
        competitorData['Competitor 3'].ranks.push(kw.competitor3Rank);
        
        const ctr = getCTRByRank(kw.competitor3Rank);
        const conversionRate = 0.005;
        const clicks = kw.searchVolume * ctr;
        const conversions = clicks * conversionRate;
        const monthlyRevenue = conversions * avgJobPrice;
        competitorData['Competitor 3'].profit += monthlyRevenue;
      }
    });

    // Convert to array and calculate averages
    const competitors: CompetitorStats[] = Object.entries(competitorData)
      .filter(([_, data]) => data.keywords > 0) // Only include competitors with data
      .map(([name, data]) => ({
        name,
        totalProfit: Math.round(data.profit),
        rankingsWon: data.ranks.filter(r => r <= 3).length, // Count top 3 rankings
        avgRank: data.ranks.length > 0 ? Math.round(data.ranks.reduce((sum, r) => sum + r, 0) / data.ranks.length) : 0,
        keywordsTracked: data.keywords,
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit); // Sort by profit (highest first)

    return competitors;
  };

  const competitors = calculateCompetitorProfits();

  // Show placeholder section if no competitor data exists yet
  if (competitors.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-900">Top Competitors Performance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Competitor 1', 'Competitor 2', 'Competitor 3'].map((name, index) => (
            <Card 
              key={name}
              className="p-6 relative overflow-hidden opacity-50"
              style={{
                borderTop: `4px solid ${index === 0 ? '#FCD34D' : index === 1 ? '#94A3B8' : '#F59E0B'}`,
              }}
            >
              <div className="absolute top-4 right-4">
                <Trophy className="size-5 text-slate-300" />
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs bg-slate-100">
                    #{index + 1}
                  </Badge>
                  <span className="text-xs text-slate-400">Position</span>
                </div>
                <h4 className="text-slate-400" style={{ fontWeight: 600 }}>
                  {name}
                </h4>
              </div>

              <div className="mb-4 p-4 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="size-4 text-slate-400" />
                  <span className="text-xs text-slate-500">Estimated Monthly Gain</span>
                </div>
                <p className="text-3xl text-slate-300" style={{ fontWeight: 700 }}>
                  $0
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-400">Avg Rank</p>
                  <p className="text-lg text-slate-300" style={{ fontWeight: 700 }}>-</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-400">Top 3</p>
                  <p className="text-lg text-slate-300" style={{ fontWeight: 700 }}>0</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-400">Keywords</p>
                  <p className="text-lg text-slate-300" style={{ fontWeight: 700 }}>0</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {competitors.slice(0, 3).map((comp, index) => (
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
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="size-4 text-red-600" />
                <span className="text-xs text-slate-600">Estimated Monthly Gain</span>
              </div>
              <p className="text-3xl" style={{ fontWeight: 700, color: '#DC2626' }}>
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
    </div>
  );
}