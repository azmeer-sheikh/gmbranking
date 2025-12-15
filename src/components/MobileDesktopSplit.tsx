import React, { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Smartphone, Monitor, TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';
import { Keyword } from '../lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface MobileDesktopSplitProps {
  keywords: Keyword[];
  avgJobValue: number;
  conversionRate: number;
}

export default function MobileDesktopSplit({ keywords, avgJobValue, conversionRate }: MobileDesktopSplitProps) {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop' | 'both'>('both');

  // Generate device-specific data
  const getDeviceData = () => {
    return keywords.map(kw => {
      // Mobile typically has 60-70% of search volume for local searches
      const mobilePercentage = 0.65 + Math.random() * 0.1;
      const mobileVolume = Math.round(kw.searchVolume * mobilePercentage);
      const desktopVolume = kw.searchVolume - mobileVolume;

      // Mobile conversion rate typically higher for local searches
      const mobileConversion = conversionRate * 1.15;
      const desktopConversion = conversionRate * 0.95;

      // CTR varies by device and rank
      const getCTR = (rank: number) => {
        if (rank <= 3) return 0.35;
        if (rank <= 10) return 0.08;
        return 0.02;
      };

      const mobileCTR = getCTR(kw.currentRank) * 1.1; // Mobile CTR slightly higher
      const desktopCTR = getCTR(kw.currentRank);

      const mobileClicks = mobileVolume * mobileCTR;
      const desktopClicks = desktopVolume * desktopCTR;

      const mobileRevenue = mobileClicks * mobileConversion * avgJobValue;
      const desktopRevenue = desktopClicks * desktopConversion * avgJobValue;

      return {
        keyword: kw.keyword,
        currentRank: kw.currentRank,
        mobile: {
          volume: mobileVolume,
          clicks: Math.round(mobileClicks),
          conversion: mobileConversion,
          revenue: Math.round(mobileRevenue),
          ctr: mobileCTR
        },
        desktop: {
          volume: desktopVolume,
          clicks: Math.round(desktopClicks),
          conversion: desktopConversion,
          revenue: Math.round(desktopRevenue),
          ctr: desktopCTR
        }
      };
    });
  };

  const deviceData = getDeviceData();

  // Calculate totals
  const totals = deviceData.reduce((acc, item) => {
    return {
      mobile: {
        volume: acc.mobile.volume + item.mobile.volume,
        clicks: acc.mobile.clicks + item.mobile.clicks,
        revenue: acc.mobile.revenue + item.mobile.revenue
      },
      desktop: {
        volume: acc.desktop.volume + item.desktop.volume,
        clicks: acc.desktop.clicks + item.desktop.clicks,
        revenue: acc.desktop.revenue + item.desktop.revenue
      }
    };
  }, {
    mobile: { volume: 0, clicks: 0, revenue: 0 },
    desktop: { volume: 0, clicks: 0, revenue: 0 }
  });

  // Prepare chart data
  const volumeChartData = deviceData.slice(0, 8).map(item => ({
    name: (item.keyword || 'Unknown').substring(0, 20),
    Mobile: item.mobile.volume,
    Desktop: item.desktop.volume
  }));

  const revenueChartData = deviceData.slice(0, 8).map(item => ({
    name: (item.keyword || 'Unknown').substring(0, 20),
    Mobile: item.mobile.revenue,
    Desktop: item.desktop.revenue
  }));

  const mobilePercentage = ((totals.mobile.volume / (totals.mobile.volume + totals.desktop.volume)) * 100).toFixed(1);
  const desktopPercentage = (100 - parseFloat(mobilePercentage)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-600">
                  <Smartphone className="size-5 text-white" />
                </div>
                <div className="p-2 rounded-lg bg-purple-600">
                  <Monitor className="size-5 text-white" />
                </div>
              </div>
              <h2 className="text-slate-900">Mobile vs Desktop Performance</h2>
            </div>
            <p className="text-sm text-slate-600">Analyze ranking and revenue differences across devices</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === 'mobile' ? 'default' : 'outline'}
              onClick={() => setViewMode('mobile')}
              className="gap-2"
            >
              <Smartphone className="size-4" />
              Mobile
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'desktop' ? 'default' : 'outline'}
              onClick={() => setViewMode('desktop')}
              className="gap-2"
            >
              <Monitor className="size-4" />
              Desktop
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'both' ? 'default' : 'outline'}
              onClick={() => setViewMode('both')}
            >
              Both
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-6">
          {/* Mobile Summary */}
          <div className="p-5 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-indigo-100">
                <Smartphone className="size-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-slate-900">Mobile</h3>
                <p className="text-sm text-slate-500">{mobilePercentage}% of total traffic</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Search Volume</p>
                <p className="text-lg text-slate-900" style={{ fontWeight: 700 }}>{totals.mobile.volume.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Est. Clicks</p>
                <p className="text-lg text-slate-900" style={{ fontWeight: 700 }}>{totals.mobile.clicks.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Revenue</p>
                <p className="text-lg text-indigo-600" style={{ fontWeight: 700 }}>${totals.mobile.revenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs text-indigo-900">
                <strong>💡 Insight:</strong> Mobile users convert {(conversionRate * 1.15 * 100).toFixed(1)}% of the time
              </p>
            </div>
          </div>

          {/* Desktop Summary */}
          <div className="p-5 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Monitor className="size-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-slate-900">Desktop</h3>
                <p className="text-sm text-slate-500">{desktopPercentage}% of total traffic</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Search Volume</p>
                <p className="text-lg text-slate-900" style={{ fontWeight: 700 }}>{totals.desktop.volume.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Est. Clicks</p>
                <p className="text-lg text-slate-900" style={{ fontWeight: 700 }}>{totals.desktop.clicks.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Revenue</p>
                <p className="text-lg text-purple-600" style={{ fontWeight: 700 }}>${totals.desktop.revenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-900">
                <strong>💡 Insight:</strong> Desktop users have longer research time
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Comparison */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Search Volume by Device</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={volumeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                formatter={(value: number) => value.toLocaleString()}
              />
              <Legend />
              <Bar dataKey="Mobile" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Desktop" fill="#A855F7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Comparison */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Revenue by Device</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="Mobile" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Desktop" fill="#A855F7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Keyword Breakdown */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">Keyword Performance by Device</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm text-slate-600">Keyword</th>
                <th className="text-center py-3 px-4 text-sm text-slate-600">Rank</th>
                <th className="text-right py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center justify-end gap-2">
                    <Smartphone className="size-4 text-indigo-600" />
                    Mobile Volume
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center justify-end gap-2">
                    <Monitor className="size-4 text-purple-600" />
                    Desktop Volume
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center justify-end gap-2">
                    <Smartphone className="size-4 text-indigo-600" />
                    Mobile Revenue
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center justify-end gap-2">
                    <Monitor className="size-4 text-purple-600" />
                    Desktop Revenue
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm text-slate-600">Winner</th>
              </tr>
            </thead>
            <tbody>
              {deviceData.map((item, index) => {
                const mobileWins = item.mobile.revenue > item.desktop.revenue;
                
                return (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-900">{item.keyword}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary" className="text-xs">
                        #{item.currentRank}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-slate-900">{item.mobile.volume.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-sm text-slate-900">{item.desktop.volume.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-sm text-indigo-600" style={{ fontWeight: 600 }}>
                      ${item.mobile.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-purple-600" style={{ fontWeight: 600 }}>
                      ${item.desktop.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {mobileWins ? (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                          <Smartphone className="size-3 mr-1" />
                          Mobile
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                          <Monitor className="size-3 mr-1" />
                          Desktop
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Strategy Recommendations */}
      <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
        <h3 className="text-slate-900 mb-4">Device-Specific Optimization Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="size-5 text-indigo-600" />
              <h4 className="text-sm text-slate-900">Mobile Optimization</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                <p className="text-xs text-slate-700">Optimize for "near me" searches - mobile users search locally</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                <p className="text-xs text-slate-700">Ensure click-to-call buttons are prominent in GMB listing</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                <p className="text-xs text-slate-700">Add photos optimized for mobile viewing</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                <p className="text-xs text-slate-700">Mobile users convert faster - focus on immediate call-to-actions</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="size-5 text-purple-600" />
              <h4 className="text-sm text-slate-900">Desktop Optimization</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                <p className="text-xs text-slate-700">Desktop users research more - add detailed service descriptions</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                <p className="text-xs text-slate-700">Include pricing information and service area details</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                <p className="text-xs text-slate-700">Add more photos and videos to GMB gallery</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                <p className="text-xs text-slate-700">Optimize website experience for form submissions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-5 text-green-600" />
            <h4 className="text-sm text-slate-900">Key Takeaway</h4>
          </div>
          <p className="text-sm text-slate-700">
            Mobile accounts for <strong>{mobilePercentage}%</strong> of your searches and generates{' '}
            <strong>${totals.mobile.revenue.toLocaleString()}</strong> in revenue. Prioritize mobile-first optimization 
            to maximize your local search performance.
          </p>
        </div>
      </Card>
    </div>
  );
}