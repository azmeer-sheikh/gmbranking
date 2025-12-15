import React, { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { keywords, locations, rankingMetrics } from '../lib/sample-data';
import { Keyword } from '../lib/types';
import { BusinessCategory } from '../lib/business-categories';
import { calculateCustomerRevenueLoss } from '../lib/competitor-data';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Search, MapPin, Target, AlertCircle } from 'lucide-react';

interface AnalyticsViewProps {
  category: BusinessCategory | undefined;
  keywords: Keyword[];
  avgJobPrice?: number;
}

export default function AnalyticsView({ category, keywords, avgJobPrice }: AnalyticsViewProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const filteredKeywords = selectedLocation === 'all' 
    ? keywords 
    : keywords.filter(kw => kw.locationId === selectedLocation);

  // Calculate revenue loss with 0.5% conversion rate (same as Map View)
  const calculateRevenueLoss = (keyword: Keyword) => {
    const potentialConversions = keyword.searchVolume * 0.005; // 0.5% conversion rate
    return avgJobPrice ? potentialConversions * avgJobPrice : 0;
  };

  // Calculate overall metrics
  const totalRevenueLoss = filteredKeywords.reduce((sum, kw) => sum + calculateRevenueLoss(kw), 0);
  const totalSearchVolume = filteredKeywords.reduce((sum, kw) => sum + kw.searchVolume, 0);
  
  // Est. Monthly Clicks = Total Search Volume / 35%
  const totalClicks = Math.round(totalSearchVolume / 0.35);
  
  const avgRank = filteredKeywords.length > 0 
    ? filteredKeywords.reduce((sum, kw) => sum + kw.currentRank, 0) / filteredKeywords.length 
    : 0;

  // Ranking distribution data
  const rankingDistribution = [
    { range: 'Rank 1-3', count: filteredKeywords.filter(kw => kw.currentRank <= 3).length, color: '#00C47E' },
    { range: 'Rank 4-10', count: filteredKeywords.filter(kw => kw.currentRank > 3 && kw.currentRank <= 10).length, color: '#FFA500' },
    { range: 'Rank 11-20', count: filteredKeywords.filter(kw => kw.currentRank > 10 && kw.currentRank <= 20).length, color: '#FF3B30' },
    { range: 'Rank 21+', count: filteredKeywords.filter(kw => kw.currentRank > 20).length, color: '#DC143C' },
  ];

  // Revenue loss by category
  const categoryData = Array.from(new Set(filteredKeywords.map(kw => kw.category))).map(category => {
    const categoryKeywords = filteredKeywords.filter(kw => kw.category === category);
    const categoryMetrics = rankingMetrics.filter(m => 
      categoryKeywords.some(kw => kw.id === m.keywordId)
    );
    
    return {
      category,
      revenueLoss: categoryMetrics.reduce((sum, m) => sum + m.revenueLoss, 0),
      keywords: categoryKeywords.length,
      avgRank: categoryKeywords.reduce((sum, kw) => sum + kw.currentRank, 0) / categoryKeywords.length,
    };
  }).sort((a, b) => b.revenueLoss - a.revenueLoss);

  // Location comparison
  const locationData = locations.map(location => {
    const locationKeywords = keywords.filter(kw => kw.locationId === location.id);
    const locationMetrics = rankingMetrics.filter(m => 
      locationKeywords.some(kw => kw.id === m.keywordId)
    );
    
    return {
      city: location.city,
      revenueLoss: locationMetrics.reduce((sum, m) => sum + m.revenueLoss, 0),
      keywords: locationKeywords.length,
      clicks: locationMetrics.reduce((sum, m) => sum + m.estimatedClicks, 0),
    };
  }).sort((a, b) => b.revenueLoss - a.revenueLoss);

  // Top opportunities (highest revenue loss)
  const topOpportunities = filteredKeywords
    .map(kw => {
      return {
        keyword: kw.keyword,
        currentRank: kw.currentRank,
        targetRank: kw.targetRank,
        revenueLoss: calculateRevenueLoss(kw),
        searchVolume: kw.searchVolume,
      };
    })
    .sort((a, b) => b.revenueLoss - a.revenueLoss)
    .slice(0, 5);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-slate-500" />
            <span className="text-sm">Location:</span>
          </div>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc.id} value={loc.id}>{loc.city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6" style={{ backgroundColor: '#FFF5F5' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FF3B30' }}>
              <DollarSign className="size-5 text-white" />
            </div>
            <Badge variant="secondary" className="gap-1" style={{ color: '#FF3B30' }}>
              Critical
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-1">Total Revenue Loss</p>
          <p className="text-slate-900">${totalRevenueLoss.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">Monthly opportunity</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="size-5" style={{ color: '#0052CC' }} />
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="size-3" />
              +12%
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-1">Search Volume</p>
          <p className="text-slate-900">{totalSearchVolume.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">Searches per month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#00C47E20' }}>
              <TrendingUp className="size-5" style={{ color: '#00C47E' }} />
            </div>
            <Badge variant="secondary">
              {totalClicks.toLocaleString()} clicks
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-1">Est. Monthly Clicks</p>
          <p className="text-slate-900">{totalClicks.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">Current traffic</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="size-5 text-orange-600" />
            </div>
            <Badge variant="secondary" className="gap-1 text-orange-600">
              <AlertCircle className="size-3" />
              Improve
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-1">Avg Current Rank</p>
          <p className="text-slate-900">{avgRank.toFixed(1)}</p>
          <p className="text-xs text-slate-500 mt-2">Needs optimization</p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking Distribution */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Ranking Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rankingDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, count }) => `${range}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {rankingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Loss by Category */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Revenue Loss by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
              />
              <Bar dataKey="revenueLoss" fill="#FF3B30" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Performance */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Location Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="city" type="category" tick={{ fontSize: 12 }} width={100} />
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
              />
              <Bar dataKey="revenueLoss" fill="#0052CC" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Average Rank */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Average Rank by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                reversed 
                tick={{ fontSize: 12 }}
                label={{ value: 'Rank Position', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => `Rank ${value.toFixed(1)}`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
              />
              <Line 
                type="monotone" 
                dataKey="avgRank" 
                stroke="#00C47E" 
                strokeWidth={3}
                dot={{ fill: '#00C47E', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Opportunities */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">Top Revenue Opportunities</h3>
        <div className="space-y-3">
          {topOpportunities.map((opportunity, index) => (
            <div key={opportunity.keyword} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FF3B30' }}
              >
                <span className="text-white">{index + 1}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 mb-1">{opportunity.keyword}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{opportunity.searchVolume.toLocaleString()} searches/mo</span>
                  <span>Current: #{opportunity.currentRank}</span>
                  <span>Target: #{opportunity.targetRank}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm text-red-600">-${opportunity.revenueLoss.toLocaleString()}</p>
                <p className="text-xs text-slate-500">per month</p>
              </div>

              <div className="flex-shrink-0">
                <Badge 
                  style={{ 
                    backgroundColor: '#FF3B3020',
                    color: '#FF3B30',
                    borderColor: '#FF3B30'
                  }}
                  className="border"
                >
                  High Priority
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}