import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Keyword } from '../lib/types';
import { generateCompetitorsForKeyword, calculateCustomerRevenueLoss, Competitor } from '../lib/competitor-data';
import { Trophy, TrendingUp, Star, DollarSign, Users } from 'lucide-react';

interface CompetitorAnalysisProps {
  keyword: Keyword;
  avgJobValue: number;
  conversionRate: number;
}

export default function CompetitorAnalysis({ keyword, avgJobValue, conversionRate }: CompetitorAnalysisProps) {
  const competitors = generateCompetitorsForKeyword(keyword, avgJobValue, conversionRate);
  const customerMetrics = calculateCustomerRevenueLoss(keyword, avgJobValue, conversionRate);
  
  const totalCompetitorRevenue = competitors.reduce((sum, comp) => sum + comp.estimatedRevenue, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-slate-900 mb-1">{keyword.keyword}</h3>
          <p className="text-sm text-slate-500">{keyword.searchVolume.toLocaleString()} monthly searches</p>
        </div>
        <Badge variant="outline" style={{ borderColor: '#FF3B30', color: '#FF3B30' }}>
          High Opportunity
        </Badge>
      </div>

      {/* Customer Revenue Loss Alert */}
      <Card className="p-6" style={{ backgroundColor: '#FFF5F5', borderColor: '#FF3B30' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#FF3B30' }}>
            <DollarSign className="size-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-slate-900">Your Current Revenue Loss</h4>
            <p className="text-xs text-slate-500">Not ranking in top 3 for this keyword</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Current Position</p>
            <p className="text-slate-900">#{keyword.currentRank}</p>
            <p className="text-xs text-slate-600 mt-1">${customerMetrics.currentRevenue.toLocaleString()}/month</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Potential at Position #3</p>
            <p style={{ color: '#00C47E' }}>#3</p>
            <p className="text-xs" style={{ color: '#00C47E' }}>
              ${customerMetrics.potentialRevenue.toLocaleString()}/month
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Monthly Opportunity</span>
            <span className="text-red-600" style={{ color: '#FF3B30' }}>
              ${customerMetrics.revenueLoss.toLocaleString()}/month
            </span>
          </div>
          <p className="text-xs text-slate-500">
            = ${(customerMetrics.revenueLoss * 12).toLocaleString()}/year in lost revenue
          </p>
        </div>
      </Card>

      {/* Top 3 Competitors Making Money */}
      <div>
        <h4 className="text-sm text-slate-900 mb-3">Who's Winning: Top 3 Competitors</h4>
        <div className="space-y-3">
          {competitors.map((competitor, index) => (
            <Card key={competitor.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Rank Badge */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ 
                    backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                  }}
                >
                  <Trophy className="size-6 text-white" />
                </div>

                {/* Competitor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-slate-900">{competitor.businessName}</p>
                      <p className="text-xs text-slate-500">{competitor.domain}</p>
                    </div>
                    <Badge 
                      className="ml-2"
                      style={{ 
                        backgroundColor: '#00C47E20',
                        color: '#00C47E'
                      }}
                    >
                      Position #{competitor.ranking}
                    </Badge>
                  </div>

                  {/* Reviews */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-slate-700">{competitor.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-slate-400">•</span>
                    <div className="flex items-center gap-1">
                      <Users className="size-3 text-slate-400" />
                      <span className="text-xs text-slate-600">{competitor.reviews.toLocaleString()} reviews</span>
                    </div>
                  </div>

                  {/* Revenue Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-[10px] text-slate-500 mb-1">Monthly Clicks</p>
                      <p className="text-xs text-slate-900">{competitor.estimatedClicks.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: '#00C47E20' }}>
                      <p className="text-[10px] text-slate-500 mb-1">Est. Revenue</p>
                      <p className="text-xs" style={{ color: '#00C47E' }}>
                        ${competitor.estimatedRevenue.toLocaleString()}/mo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Revenue Comparison Summary */}
      <Card className="p-6" style={{ backgroundColor: '#F0F9FF' }}>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="size-5" style={{ color: '#0052CC' }} />
          <h4 className="text-slate-900">Revenue Comparison</h4>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Top 3 Combined Revenue</span>
              <span className="text-slate-900">${totalCompetitorRevenue.toLocaleString()}/mo</span>
            </div>
            <Progress value={100} className="h-2" style={{ backgroundColor: '#00C47E' }} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Your Current Revenue</span>
              <span className="text-slate-900">${customerMetrics.currentRevenue.toLocaleString()}/mo</span>
            </div>
            <Progress 
              value={(customerMetrics.currentRevenue / totalCompetitorRevenue) * 100} 
              className="h-2"
              style={{ backgroundColor: '#FF3B30' }}
            />
          </div>

          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Market Share Gap</span>
              <span style={{ color: '#0052CC' }}>
                {(((totalCompetitorRevenue - customerMetrics.currentRevenue) / totalCompetitorRevenue) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Items */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <h4 className="text-sm text-slate-900 mb-2">💡 Opportunity Highlights</h4>
        <ul className="space-y-1 text-xs text-slate-600">
          <li>• Competitors are earning ${totalCompetitorRevenue.toLocaleString()}/month from this keyword</li>
          <li>• Moving from #{keyword.currentRank} to #3 could capture ${customerMetrics.revenueLoss.toLocaleString()}/month</li>
          <li>• That's ${(customerMetrics.revenueLoss * 12).toLocaleString()}/year in additional revenue</li>
          {competitors.length > 0 && competitors[0]?.estimatedRevenue && (
            <li>• Current market leader earning ${competitors[0].estimatedRevenue.toLocaleString()}/month at position #1</li>
          )}
        </ul>
      </div>
    </div>
  );
}