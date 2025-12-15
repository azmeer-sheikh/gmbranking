import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { DEFAULT_TRAFFIC_SHARES } from '../types';
import { formatCurrency, formatNumber, calculateKeywordMetrics } from '../utils/calculations';
import { TrendingUp, DollarSign, Target, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';

export function ROISimulator() {
  const { keywords, rankings } = useData();
  const filteredKeywords = useData().getFilteredKeywords();
  const [selectedKeywordId, setSelectedKeywordId] = useState<string>('');
  const [targetRank, setTargetRank] = useState<number>(1);

  const selectedKeyword = keywords.find((k) => k.id === selectedKeywordId);
  const currentMetrics = selectedKeyword
    ? calculateKeywordMetrics(selectedKeyword, rankings)
    : null;

  // Calculate projected metrics
  const projectedTrafficShare = DEFAULT_TRAFFIC_SHARES[targetRank] || 0;
  const projectedTraffic = selectedKeyword
    ? selectedKeyword.monthlySearches * (projectedTrafficShare / 100)
    : 0;
  const projectedMonthlyRevenue = selectedKeyword
    ? projectedTraffic * selectedKeyword.avgJobSize
    : 0;
  const projectedYearlyRevenue = projectedMonthlyRevenue * 12;

  // Calculate gains
  const currentMonthlyRevenue = currentMetrics ? currentMetrics.myTraffic * (selectedKeyword?.avgJobSize || 0) : 0;
  const monthlyGain = projectedMonthlyRevenue - currentMonthlyRevenue;
  const yearlyGain = monthlyGain * 12;
  const trafficGain = projectedTraffic - (currentMetrics?.myTraffic || 0);
  const percentageIncrease =
    currentMonthlyRevenue > 0
      ? ((monthlyGain / currentMonthlyRevenue) * 100)
      : 100;

  return (
    <div className="min-h-screen bg-[#F7F9FB] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">ROI Simulator</h1>
          <p className="text-muted-foreground">
            Project your revenue growth by simulating different ranking positions
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm">Select Keyword</label>
              <Select value={selectedKeywordId} onValueChange={setSelectedKeywordId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a keyword..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredKeywords.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.keyword} - {k.city}, {k.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm">Target Ranking Position</label>
              <Select value={targetRank.toString()} onValueChange={(v) => setTargetRank(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((rank) => (
                    <SelectItem key={rank} value={rank.toString()}>
                      Rank #{rank} ({DEFAULT_TRAFFIC_SHARES[rank]}% traffic share)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {selectedKeyword && currentMetrics ? (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2">
                  <Target className="size-5 text-[#FF3B30]" />
                  Current Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-muted-foreground">Current Rank</span>
                    <span>
                      {currentMetrics.myRanking ? (
                        <Badge variant="outline">#{currentMetrics.myRanking.rank}</Badge>
                      ) : (
                        <Badge variant="secondary">Not Ranked</Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-muted-foreground">Traffic Share</span>
                    <span>{currentMetrics.myRankShare.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-muted-foreground">Monthly Traffic</span>
                    <span>{formatNumber(currentMetrics.myTraffic)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-muted-foreground">Monthly Revenue</span>
                    <span className="text-[#0052CC]">
                      {formatCurrency(currentMonthlyRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Yearly Revenue</span>
                    <span className="text-[#0052CC]">
                      {formatCurrency(currentMonthlyRevenue * 12)}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-[#0052CC] to-[#0052CC]/80 text-white">
                <h3 className="mb-4 flex items-center gap-2">
                  <TrendingUp className="size-5" />
                  Projected at Rank #{targetRank}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="opacity-90">Target Rank</span>
                    <span>
                      <Badge className="bg-white text-[#0052CC]">#{targetRank}</Badge>
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="opacity-90">Traffic Share</span>
                    <span>{projectedTrafficShare.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="opacity-90">Monthly Traffic</span>
                    <span>{formatNumber(projectedTraffic)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="opacity-90">Monthly Revenue</span>
                    <span className="text-[#00C47E]">
                      {formatCurrency(projectedMonthlyRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Yearly Revenue</span>
                    <span className="text-[#00C47E]">
                      {formatCurrency(projectedYearlyRevenue)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <Card className="p-6 bg-[#00C47E] text-white">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="size-8" />
                  <div>
                    <p className="text-sm opacity-90">Monthly Gain</p>
                    <p className="text-2xl">{formatCurrency(monthlyGain)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-[#00C47E] text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="size-8" />
                  <div>
                    <p className="text-sm opacity-90">Yearly Gain</p>
                    <p className="text-2xl">{formatCurrency(yearlyGain)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-[#0052CC] text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="size-8" />
                  <div>
                    <p className="text-sm opacity-90">Traffic Increase</p>
                    <p className="text-2xl">+{formatNumber(trafficGain)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-[#0052CC] text-white">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="size-8" />
                  <div>
                    <p className="text-sm opacity-90">% Increase</p>
                    <p className="text-2xl">
                      {percentageIncrease > 0 ? '+' : ''}
                      {percentageIncrease.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-8 bg-gradient-to-r from-[#0052CC]/10 to-[#00C47E]/10 border-2 border-[#0052CC]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-2">Investment Opportunity</h3>
                  <p className="text-muted-foreground mb-4">
                    By ranking at position #{targetRank} for "{selectedKeyword.keyword}", you could gain:
                  </p>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div>
                      <p className="text-sm text-muted-foreground">Additional Monthly</p>
                      <p className="text-3xl text-[#00C47E]">{formatCurrency(monthlyGain)}</p>
                    </div>
                    <ArrowRight className="size-8 text-[#0052CC]" />
                    <div>
                      <p className="text-sm text-muted-foreground">Additional Yearly</p>
                      <p className="text-3xl text-[#00C47E]">{formatCurrency(yearlyGain)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h3 className="mb-4">Compare All Ranking Positions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Rank</th>
                      <th className="text-right py-3">Traffic Share</th>
                      <th className="text-right py-3">Monthly Traffic</th>
                      <th className="text-right py-3">Monthly Revenue</th>
                      <th className="text-right py-3">Yearly Revenue</th>
                      <th className="text-right py-3">Gain vs Current</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((rank) => {
                      const share = DEFAULT_TRAFFIC_SHARES[rank] || 0;
                      const traffic = selectedKeyword.monthlySearches * (share / 100);
                      const monthly = traffic * selectedKeyword.avgJobSize;
                      const yearly = monthly * 12;
                      const gain = monthly - currentMonthlyRevenue;
                      const isTarget = rank === targetRank;

                      return (
                        <tr
                          key={rank}
                          className={`border-b ${isTarget ? 'bg-[#0052CC]/5' : ''}`}
                        >
                          <td className="py-3">
                            <Badge variant={isTarget ? 'default' : 'outline'}>
                              Rank #{rank}
                            </Badge>
                          </td>
                          <td className="text-right">{share.toFixed(1)}%</td>
                          <td className="text-right">{formatNumber(traffic)}</td>
                          <td className="text-right">{formatCurrency(monthly)}</td>
                          <td className="text-right">{formatCurrency(yearly)}</td>
                          <td className="text-right">
                            <span className={gain > 0 ? 'text-[#00C47E]' : 'text-[#FF3B30]'}>
                              {gain > 0 ? '+' : ''}
                              {formatCurrency(gain)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-12 text-center">
            <TrendingUp className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">Ready to Simulate</h3>
            <p className="text-muted-foreground">
              Select a keyword and target rank to see your potential revenue growth
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
