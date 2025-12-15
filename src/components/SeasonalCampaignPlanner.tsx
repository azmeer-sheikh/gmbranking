import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, TrendingUp, Target, Flame, Snowflake, Sun, Leaf } from 'lucide-react';
import { Keyword } from '../lib/types';

interface SeasonalData {
  month: string;
  multiplier: number;
  season: 'winter' | 'spring' | 'summer' | 'fall';
  icon: React.ReactNode;
  color: string;
}

const seasonalData: SeasonalData[] = [
  { month: 'January', multiplier: 0.85, season: 'winter', icon: <Snowflake className="size-4" />, color: '#60A5FA' },
  { month: 'February', multiplier: 0.88, season: 'winter', icon: <Snowflake className="size-4" />, color: '#60A5FA' },
  { month: 'March', multiplier: 0.95, season: 'spring', icon: <Leaf className="size-4" />, color: '#34D399' },
  { month: 'April', multiplier: 1.05, season: 'spring', icon: <Leaf className="size-4" />, color: '#34D399' },
  { month: 'May', multiplier: 1.15, season: 'spring', icon: <Leaf className="size-4" />, color: '#34D399' },
  { month: 'June', multiplier: 1.25, season: 'summer', icon: <Sun className="size-4" />, color: '#FBBF24' },
  { month: 'July', multiplier: 1.35, season: 'summer', icon: <Sun className="size-4" />, color: '#FBBF24' },
  { month: 'August', multiplier: 1.30, season: 'summer', icon: <Sun className="size-4" />, color: '#FBBF24' },
  { month: 'September', multiplier: 1.10, season: 'fall', icon: <Leaf className="size-4" />, color: '#F97316' },
  { month: 'October', multiplier: 1.05, season: 'fall', icon: <Leaf className="size-4" />, color: '#F97316' },
  { month: 'November', multiplier: 0.90, season: 'fall', icon: <Leaf className="size-4" />, color: '#F97316' },
  { month: 'December', multiplier: 0.80, season: 'winter', icon: <Snowflake className="size-4" />, color: '#60A5FA' },
];

interface SeasonalCampaignPlannerProps {
  keywords: Keyword[];
}

export default function SeasonalCampaignPlanner({ keywords }: SeasonalCampaignPlannerProps) {
  // Remove the selectedMonth state - all cards will be expanded by default
  
  const getKeywordSeasonalVolume = (keyword: Keyword, multiplier: number) => {
    return Math.round(keyword.searchVolume * multiplier);
  };

  const getTopKeywordsForMonth = (multiplier: number) => {
    return keywords
      .map(kw => ({
        ...kw,
        seasonalVolume: getKeywordSeasonalVolume(kw, multiplier)
      }))
      .sort((a, b) => b.seasonalVolume - a.seasonalVolume)
      .slice(0, 5);
  };

  const getPeakSeason = () => {
    const maxMultiplier = Math.max(...seasonalData.map(d => d.multiplier));
    return seasonalData.find(d => d.multiplier === maxMultiplier);
  };

  const getLowestSeason = () => {
    const minMultiplier = Math.min(...seasonalData.map(d => d.multiplier));
    return seasonalData.find(d => d.multiplier === minMultiplier);
  };

  const peakSeason = getPeakSeason();
  const lowestSeason = getLowestSeason();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#0052CC' }}>
                <Calendar className="size-6 text-white" />
              </div>
              <h2 className="text-slate-900">Seasonal Campaign Planner</h2>
            </div>
            <p className="text-sm text-slate-600">Optimize your campaigns based on seasonal search trends</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="size-4 text-orange-600" />
              <p className="text-xs text-slate-500">Peak Season</p>
            </div>
            <p className="text-xl text-slate-900" style={{ fontWeight: 700 }}>{peakSeason?.month}</p>
            <p className="text-sm text-orange-600">+{((peakSeason?.multiplier || 1) * 100 - 100).toFixed(0)}% volume</p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Snowflake className="size-4 text-blue-600" />
              <p className="text-xs text-slate-500">Low Season</p>
            </div>
            <p className="text-xl text-slate-900" style={{ fontWeight: 700 }}>{lowestSeason?.month}</p>
            <p className="text-sm text-blue-600">{((lowestSeason?.multiplier || 1) * 100 - 100).toFixed(0)}% volume</p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="size-4 text-green-600" />
              <p className="text-xs text-slate-500">Tracking</p>
            </div>
            <p className="text-xl text-slate-900" style={{ fontWeight: 700 }}>{keywords.length} Keywords</p>
            <p className="text-sm text-slate-500">Across 12 months</p>
          </div>
        </div>
      </Card>

      {/* Calendar View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {seasonalData.map((data, index) => {
          const topKeywords = getTopKeywordsForMonth(data.multiplier);
          const totalSeasonalVolume = topKeywords.reduce((sum, kw) => sum + kw.seasonalVolume, 0);

          return (
            <Card
              key={data.month}
              className="p-4 transition-all hover:shadow-lg ring-2 shadow-lg"
              style={{ borderColor: data.color, ringColor: data.color }}
            >
              {/* Month Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-slate-900">{data.month}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    {data.icon}
                    <span className="capitalize">{data.season}</span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: data.color + '20',
                    color: data.color,
                    borderColor: data.color,
                    border: '1px solid'
                  }}
                >
                  {data.multiplier >= 1 ? '+' : ''}{((data.multiplier * 100) - 100).toFixed(0)}%
                </Badge>
              </div>

              {/* Volume Bar */}
              <div className="mb-3">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${data.multiplier * 100}%`,
                      backgroundColor: data.color
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{(data.multiplier * 100).toFixed(0)}% of baseline</p>
              </div>

              {/* Always Show Expanded View */}
              <div className="space-y-3 mt-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Total Volume</p>
                  <p className="text-xl text-slate-900" style={{ fontWeight: 700 }}>{totalSeasonalVolume.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">searches/month</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2">Top Performing Keywords:</p>
                  <div className="space-y-2">
                    {topKeywords.map((kw, idx) => (
                      <div key={kw.id} className="p-2 bg-white rounded border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-900">{idx + 1}. {kw.keyword}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            #{kw.currentRank}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{kw.seasonalVolume.toLocaleString()} searches</span>
                          <span style={{ color: data.color }}>
                            {data.multiplier >= 1 ? '+' : ''}{((data.multiplier - 1) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg" style={{ backgroundColor: data.color + '20' }}>
                  <p className="text-xs" style={{ color: data.color, fontWeight: 600 }}>
                    💡 Campaign Strategy:
                  </p>
                  <p className="text-xs text-slate-700 mt-1">
                    {data.multiplier > 1.2 ? 
                      'Peak demand period. Increase budget and bid aggressively on top keywords.' :
                      data.multiplier < 0.9 ?
                      'Low demand period. Focus on long-tail keywords and content marketing.' :
                      'Moderate demand. Maintain steady optimization efforts.'
                    }
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Yearly Overview */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">Annual Trend Overview</h3>
        <div className="relative h-64">
          {/* Bar chart with actual data visualization */}
          <div className="flex items-end justify-between h-full gap-2">
            {seasonalData.map((data, index) => {
              const height = (data.multiplier / 1.35) * 100; // Normalize to max value
              const topKeywords = getTopKeywordsForMonth(data.multiplier);
              const totalVolume = topKeywords.reduce((sum, kw) => sum + kw.seasonalVolume, 0);
              
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center justify-end gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl z-10 whitespace-nowrap">
                    <p className="text-xs mb-1" style={{ fontWeight: 600 }}>{data.month}</p>
                    <p className="text-xs text-slate-300">{(data.multiplier * 100).toFixed(0)}% volume</p>
                    <p className="text-xs text-slate-300">{totalVolume.toLocaleString()} searches</p>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-slate-900" />
                  </div>
                  
                  {/* Bar with gradient and data label */}
                  <div className="relative w-full flex flex-col items-center">
                    <span className="text-xs mb-1" style={{ color: data.color, fontWeight: 600 }}>
                      {(data.multiplier * 100).toFixed(0)}%
                    </span>
                    <div
                      className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer shadow-lg relative overflow-hidden"
                      style={{
                        height: `${height * 2}px`,
                        background: `linear-gradient(to top, ${data.color}, ${data.color}dd)`,
                        minHeight: '40px'
                      }}
                      title={`${data.month}: ${(data.multiplier * 100).toFixed(0)}%`}
                    >
                      {/* Volume label inside bar */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] text-white" style={{ fontWeight: 700 }}>
                          {(totalVolume / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 transform -rotate-45 origin-top-left mt-4">
                    {data.month.substring(0, 3)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between -ml-12 text-xs text-slate-500">
            <span>135%</span>
            <span>100%</span>
            <span>85%</span>
            <span>0%</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Snowflake className="size-5 text-blue-500" />
              <p className="text-sm text-slate-600">Winter</p>
            </div>
            <p className="text-sm text-slate-500">Low demand, focus on optimization</p>
            <p className="text-xs text-blue-600 mt-1" style={{ fontWeight: 600 }}>Avg: 84% volume</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Leaf className="size-5 text-green-500" />
              <p className="text-sm text-slate-600">Spring</p>
            </div>
            <p className="text-sm text-slate-500">Growing demand, increase visibility</p>
            <p className="text-xs text-green-600 mt-1" style={{ fontWeight: 600 }}>Avg: 105% volume</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sun className="size-5 text-yellow-500" />
              <p className="text-sm text-slate-600">Summer</p>
            </div>
            <p className="text-sm text-slate-500">Peak season, maximize budget</p>
            <p className="text-xs text-yellow-600 mt-1" style={{ fontWeight: 600 }}>Avg: 130% volume</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Leaf className="size-5 text-orange-500" />
              <p className="text-sm text-slate-600">Fall</p>
            </div>
            <p className="text-sm text-slate-500">Moderate demand, prepare for winter</p>
            <p className="text-xs text-orange-600 mt-1" style={{ fontWeight: 600 }}>Avg: 102% volume</p>
          </div>
        </div>
      </Card>

      {/* Campaign Recommendations */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <h3 className="text-slate-900 mb-4">Smart Campaign Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-5 text-green-600" />
              <h4 className="text-sm text-slate-900">Next 3 Months</h4>
            </div>
            <p className="text-xs text-slate-600 mb-3">Upcoming high-volume periods to prepare for:</p>
            <div className="space-y-2">
              {seasonalData.slice(new Date().getMonth(), new Date().getMonth() + 3).map(data => (
                <div key={data.month} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">{data.month}</span>
                  <Badge variant="secondary" style={{ backgroundColor: data.color + '20', color: data.color }}>
                    {data.multiplier >= 1 ? '+' : ''}{((data.multiplier - 1) * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="size-5" style={{ color: '#0052CC' }} />
              <h4 className="text-sm text-slate-900">Action Items</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <p className="text-xs text-slate-700">Update GMB posts with seasonal content</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <p className="text-xs text-slate-700">Adjust bidding strategy for peak months</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <p className="text-xs text-slate-700">Create seasonal landing pages</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <p className="text-xs text-slate-700">Schedule review collection campaigns</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}