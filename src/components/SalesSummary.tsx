import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Keyword } from '../lib/types';
import { BusinessCategory } from '../lib/business-categories';
import { calculateCustomerRevenueLoss, generateCompetitorsForKeyword } from '../lib/competitor-data';
import { DollarSign, TrendingUp, Trophy, AlertTriangle, Target, Zap } from 'lucide-react';

interface SalesSummaryProps {
  category: BusinessCategory;
  keywords: Keyword[];
  customerName?: string;
}

export default function SalesSummary({ category, keywords, customerName = 'Your Business' }: SalesSummaryProps) {
  // Calculate total metrics
  let totalRevenueLoss = 0;
  let totalPotentialRevenue = 0;
  let totalCurrentRevenue = 0;
  let totalCompetitorRevenue = 0;

  keywords.forEach(kw => {
    const metrics = calculateCustomerRevenueLoss(kw, category.avgJobValue, category.conversionRate);
    totalRevenueLoss += metrics.revenueLoss;
    totalCurrentRevenue += metrics.currentRevenue;
    totalPotentialRevenue += metrics.potentialRevenue;
    
    const competitors = generateCompetitorsForKeyword(kw, category.avgJobValue, category.conversionRate);
    totalCompetitorRevenue += competitors.reduce((sum, comp) => sum + comp.estimatedRevenue, 0);
  });

  const poorRankingKeywords = keywords.filter(kw => kw.currentRank > 10).length;
  const avgRank = keywords.reduce((sum, kw) => sum + kw.currentRank, 0) / keywords.length;

  return (
    <Card className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h2 className="text-slate-900 mb-2">📊 GMB Revenue Opportunity Report</h2>
          <p className="text-slate-600">{customerName} - {category.name}</p>
          <p className="text-sm text-slate-500 mt-2">
            Analysis of {keywords.length} high-value keywords in your market
          </p>
        </div>

        {/* Critical Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center" style={{ backgroundColor: '#FFF5F5', borderColor: '#FF3B30' }}>
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#FF3B30' }}>
              <AlertTriangle className="size-8 text-white" />
            </div>
            <p className="text-sm text-slate-600 mb-2">Monthly Revenue Loss</p>
            <p className="text-slate-900" style={{ fontSize: '32px' }}>
              ${totalRevenueLoss.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              = ${(totalRevenueLoss * 12).toLocaleString()}/year
            </p>
            <Badge className="mt-3" style={{ backgroundColor: '#FF3B30' }}>
              Critical Opportunity
            </Badge>
          </Card>

          <Card className="p-6 text-center" style={{ backgroundColor: '#F0F9FF', borderColor: '#0052CC' }}>
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#0052CC' }}>
              <Trophy className="size-8 text-white" />
            </div>
            <p className="text-sm text-slate-600 mb-2">Competitors Earning</p>
            <p className="text-slate-900" style={{ fontSize: '32px' }}>
              ${totalCompetitorRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              per month from these keywords
            </p>
            <Badge className="mt-3" style={{ backgroundColor: '#0052CC' }}>
              Market Opportunity
            </Badge>
          </Card>

          <Card className="p-6 text-center" style={{ backgroundColor: '#F0FDF4', borderColor: '#00C47E' }}>
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#00C47E' }}>
              <TrendingUp className="size-8 text-white" />
            </div>
            <p className="text-sm text-slate-600 mb-2">Potential Revenue</p>
            <p className="text-slate-900" style={{ fontSize: '32px' }}>
              ${totalPotentialRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              if ranking in top 3 positions
            </p>
            <Badge className="mt-3" style={{ backgroundColor: '#00C47E' }}>
              Growth Potential
            </Badge>
          </Card>
        </div>

        {/* Current Situation */}
        <div>
          <h3 className="text-slate-900 mb-4 flex items-center gap-2">
            <Target className="size-5" style={{ color: '#FF3B30' }} />
            Current Situation Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-slate-50">
              <p className="text-xs text-slate-500 mb-1">Average Keyword Rank</p>
              <p className="text-slate-900">#{avgRank.toFixed(1)}</p>
              <p className="text-xs text-red-600 mt-1">Below competitive threshold</p>
            </Card>
            <Card className="p-4 bg-slate-50">
              <p className="text-xs text-slate-500 mb-1">Keywords Below Top 10</p>
              <p className="text-slate-900">{poorRankingKeywords} of {keywords.length}</p>
              <p className="text-xs text-red-600 mt-1">Losing to competitors</p>
            </Card>
            <Card className="p-4 bg-slate-50">
              <p className="text-xs text-slate-500 mb-1">Current Monthly Revenue</p>
              <p className="text-slate-900">${totalCurrentRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">From these keywords</p>
            </Card>
            <Card className="p-4 bg-slate-50">
              <p className="text-xs text-slate-500 mb-1">Market Share Gap</p>
              <p className="text-slate-900">
                {((totalRevenueLoss / totalPotentialRevenue) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-red-600 mt-1">Revenue left on table</p>
            </Card>
          </div>
        </div>

        {/* Top 3 Opportunities */}
        <div>
          <h3 className="text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="size-5" style={{ color: '#FFA500' }} />
            Top 3 Revenue Opportunities
          </h3>
          <div className="space-y-3">
            {keywords
              .map(kw => ({
                ...kw,
                metrics: calculateCustomerRevenueLoss(kw, category.avgJobValue, category.conversionRate),
                competitors: generateCompetitorsForKeyword(kw, category.avgJobValue, category.conversionRate)
              }))
              .sort((a, b) => b.metrics.revenueLoss - a.metrics.revenueLoss)
              .slice(0, 3)
              .map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                      style={{ backgroundColor: '#FF3B30' }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 mb-2">{item.keyword}</p>
                      <div className="grid grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-slate-500">Current Rank</p>
                          <p className="text-slate-900">#{item.currentRank}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Top Competitor</p>
                          <p className="text-slate-900">{item.competitors[0]?.businessName}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">They're Making</p>
                          <p style={{ color: '#00C47E' }}>
                            ${item.competitors[0]?.estimatedRevenue.toLocaleString()}/mo
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Your Loss</p>
                          <p style={{ color: '#FF3B30' }}>
                            -${item.metrics.revenueLoss.toLocaleString()}/mo
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* Bottom Line */}
        <Card className="p-6" style={{ backgroundColor: '#0052CC', color: 'white' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white mb-2">💰 Bottom Line</h3>
              <p className="text-blue-100 text-sm">
                Your competitors are capturing <span className="text-white">${totalRevenueLoss.toLocaleString()}/month</span> that should be yours.
              </p>
              <p className="text-blue-100 text-sm mt-1">
                That's <span className="text-white">${(totalRevenueLoss * 12).toLocaleString()}/year</span> in lost revenue.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">ROI Potential</p>
              <p className="text-white" style={{ fontSize: '36px' }}>
                {((totalRevenueLoss / totalCurrentRevenue) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Action Items */}
        <div className="border-t pt-6">
          <h3 className="text-slate-900 mb-4">✅ Recommended Next Steps</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0052CC' }}>
                <span className="text-white text-xs">1</span>
              </div>
              <p>Optimize GMB listings for top {keywords.length} keywords to capture ${totalRevenueLoss.toLocaleString()}/month</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0052CC' }}>
                <span className="text-white text-xs">2</span>
              </div>
              <p>Focus on {poorRankingKeywords} keywords currently ranking below position #10</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0052CC' }}>
                <span className="text-white text-xs">3</span>
              </div>
              <p>Implement competitive strategy to match top performers in your market</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
