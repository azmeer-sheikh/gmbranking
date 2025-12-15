import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingUp, Search, Eye, DollarSign, BarChart2, Target } from 'lucide-react';
import { Keyword } from '../lib/types';
import { BusinessCategory } from '../lib/business-categories';
import { calculateCustomerRevenueLoss } from '../lib/competitor-data';

interface TopKeywordsProps {
  keywords: Keyword[];
  category: BusinessCategory | undefined;
  onViewCompetitors?: (keyword: Keyword) => void;
}

export default function TopKeywords({ keywords, category, onViewCompetitors }: TopKeywordsProps) {
  if (!category) return null;

  // Get top 6 keywords by search volume
  const topKeywords = [...keywords]
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 6);

  const getRankColor = (rank: number) => {
    if (rank <= 3) return '#00C47E';
    if (rank <= 10) return '#FFA500';
    return '#FF3B30';
  };

  const getRankBadgeStyle = (rank: number) => {
    if (rank <= 3) return 'bg-green-100 text-green-700 border-green-200';
    if (rank <= 10) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <TrendingUp className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-slate-900 text-2xl" style={{ fontWeight: 700 }}>Top Performing Keywords</h2>
            <p className="text-sm text-slate-500 mt-1">Your highest search volume keywords and their revenue potential</p>
          </div>
        </div>
        <Badge className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md">
          {topKeywords.length} Keywords
        </Badge>
      </div>

      {/* Keywords Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topKeywords.map((keyword, index) => {
          const metrics = calculateCustomerRevenueLoss(keyword, category.avgJobValue, category.conversionRate);
          const rankColor = getRankColor(keyword.currentRank);
          
          return (
            <Card 
              key={keyword.id} 
              className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-slate-200 hover:border-blue-300 group"
            >
              {/* Header with Rank */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm">
                      <span className="text-sm text-slate-700" style={{ fontWeight: 700 }}>#{index + 1}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`px-3 py-1 text-xs border-2 ${getRankBadgeStyle(keyword.currentRank)}`}
                      style={{ fontWeight: 600 }}
                    >
                      Rank #{keyword.currentRank}
                    </Badge>
                  </div>
                  <h3 className="text-slate-900 text-base leading-tight" style={{ fontWeight: 600 }}>
                    {keyword.keyword}
                  </h3>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="space-y-3 mb-5">
                {/* Search Volume */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="size-4 text-blue-600" />
                    <span className="text-xs text-blue-900" style={{ fontWeight: 600 }}>Search Volume</span>
                  </div>
                  <p className="text-2xl text-blue-900" style={{ fontWeight: 700 }}>
                    {keyword.searchVolume.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">searches per month</p>
                </div>

                {/* Revenue Loss */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="size-4 text-red-600" />
                    <span className="text-xs text-red-900" style={{ fontWeight: 600 }}>Monthly Loss</span>
                  </div>
                  <p className="text-2xl text-red-600" style={{ fontWeight: 700 }}>
                    ${metrics.revenueLoss.toLocaleString()}
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">${(metrics.revenueLoss * 12).toLocaleString()}/year</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BarChart2 className="size-3 text-slate-500" />
                      <span className="text-xs text-slate-600" style={{ fontWeight: 600 }}>Clicks</span>
                    </div>
                    <p className="text-sm text-slate-900" style={{ fontWeight: 700 }}>
                      {metrics.currentClicks}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="size-3 text-slate-500" />
                      <span className="text-xs text-slate-600" style={{ fontWeight: 600 }}>Potential</span>
                    </div>
                    <p className="text-sm text-slate-900" style={{ fontWeight: 700 }}>
                      {metrics.top3Clicks}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {onViewCompetitors && (
                <Button 
                  className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-md group-hover:shadow-lg transition-all"
                  onClick={() => onViewCompetitors(keyword)}
                >
                  <Eye className="size-4 mr-2" />
                  View Competitors
                </Button>
              )}

              {/* Rank Indicator Bar */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-600" style={{ fontWeight: 600 }}>Ranking Progress</span>
                  <span className="text-slate-500">#{keyword.currentRank} → #1</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${((20 - keyword.currentRank) / 20) * 100}%`,
                      backgroundColor: rankColor
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Search className="size-5 text-blue-600" />
              <p className="text-sm text-slate-600" style={{ fontWeight: 600 }}>Total Volume</p>
            </div>
            <p className="text-3xl text-slate-900 mb-1" style={{ fontWeight: 800 }}>
              {topKeywords.reduce((sum, kw) => sum + kw.searchVolume, 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">searches/month</p>
          </div>

          <div className="text-center p-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="size-5 text-red-600" />
              <p className="text-sm text-slate-600" style={{ fontWeight: 600 }}>Total Loss</p>
            </div>
            <p className="text-3xl text-red-600 mb-1" style={{ fontWeight: 800 }}>
              ${topKeywords.reduce((sum, kw) => {
                const metrics = calculateCustomerRevenueLoss(kw, category.avgJobValue, category.conversionRate);
                return sum + metrics.revenueLoss;
              }, 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">per month</p>
          </div>

          <div className="text-center p-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="size-5 text-green-600" />
              <p className="text-sm text-slate-600" style={{ fontWeight: 600 }}>Avg Rank</p>
            </div>
            <p className="text-3xl text-slate-900 mb-1" style={{ fontWeight: 800 }}>
              #{Math.round(topKeywords.reduce((sum, kw) => sum + kw.currentRank, 0) / topKeywords.length)}
            </p>
            <p className="text-xs text-slate-500">across top keywords</p>
          </div>

          <div className="text-center p-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="size-5 text-purple-600" />
              <p className="text-sm text-slate-600" style={{ fontWeight: 600 }}>Potential</p>
            </div>
            <p className="text-3xl text-purple-600 mb-1" style={{ fontWeight: 800 }}>
              ${topKeywords.reduce((sum, kw) => {
                const metrics = calculateCustomerRevenueLoss(kw, category.avgJobValue, category.conversionRate);
                return sum + metrics.revenueLoss;
              }, 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">monthly recovery</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
