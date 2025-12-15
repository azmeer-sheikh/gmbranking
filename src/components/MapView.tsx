import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { locations } from '../lib/sample-data';
import { Location, Keyword } from '../lib/types';
import { BusinessCategory } from '../lib/business-categories';
import { calculateCustomerRevenueLoss } from '../lib/competitor-data';
import CompetitorAnalysis from './CompetitorAnalysis';
import TopKeywords from './TopKeywords';
import { MapPin, TrendingDown, Filter, Eye, ChevronDown, Target, TrendingUp } from 'lucide-react';

interface MapViewProps {
  category: BusinessCategory | undefined;
  keywords: Keyword[];
}

export default function MapView({ category, keywords }: MapViewProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(locations[0]);
  const [filterState, setFilterState] = useState<string>('all');
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null);
  const [showCompetitorAnalysis, setShowCompetitorAnalysis] = useState(false);

  const getLocationKeywords = (locationId: string) => {
    return keywords.filter(kw => kw.locationId === locationId);
  };

  const getLocationMetrics = (locationId: string) => {
    if (!category) return { keywordCount: 0, totalRevenueLoss: 0, totalClicks: 0, avgRank: 0 };
    
    const locationKeywords = getLocationKeywords(locationId);
    
    let totalRevenueLoss = 0;
    let totalClicks = 0;
    
    locationKeywords.forEach(kw => {
      const metrics = calculateCustomerRevenueLoss(kw, category.avgJobValue, category.conversionRate);
      totalRevenueLoss += metrics.revenueLoss;
      totalClicks += metrics.currentClicks;
    });
    
    const avgRank = locationKeywords.length > 0
      ? locationKeywords.reduce((sum, kw) => sum + kw.currentRank, 0) / locationKeywords.length
      : 0;
    
    return {
      keywordCount: locationKeywords.length,
      totalRevenueLoss,
      totalClicks,
      avgRank: Math.round(avgRank * 10) / 10,
    };
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return '#00C47E';
    if (rank <= 10) return '#FFA500';
    return '#FF3B30';
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return { label: 'Top 3', color: '#00C47E' };
    if (rank <= 10) return { label: 'Page 1', color: '#FFA500' };
    return { label: 'Page 2+', color: '#FF3B30' };
  };

  const filteredLocations = filterState === 'all' 
    ? locations 
    : locations.filter(loc => loc.state === filterState);

  const handleViewCompetitors = (keyword: Keyword) => {
    setSelectedKeyword(keyword);
    setShowCompetitorAnalysis(true);
  };

  // Calculate stats for bottom banner
  const totalKeywords = keywords.length;
  const top3Rankings = keywords.filter(k => k.currentRank <= 3).length;
  const top10Rankings = keywords.filter(k => k.currentRank <= 10).length;
  const totalMarkets = locations.length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-slate-500" />
              <span className="text-sm">Filter by State:</span>
            </div>
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="California">California</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{filteredLocations.length} locations</span>
          </div>
        </div>
      </Card>

      {/* Map and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Canvas */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-4">
            <h2 className="text-slate-900">GMB Locations Map</h2>
            <p className="text-sm text-slate-500">Interactive map showing keyword rankings across locations</p>
          </div>

          {/* Map Visualization with Dotted Connections */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg border-2 border-slate-700 overflow-hidden" style={{ height: '600px' }}>
            {/* Dotted Grid Background */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="rgba(148, 163, 184, 0.3)" />
                </pattern>
              </defs>
              
              {/* Draw connecting lines between locations */}
              {filteredLocations.map((loc, idx) => {
                if (idx === 0) return null;
                const positions = [
                  { x: 200, y: 200 },
                  { x: 450, y: 150 },
                  { x: 320, y: 350 },
                  { x: 550, y: 300 },
                ];
                const from = positions[idx - 1];
                const to = positions[idx];
                
                return (
                  <line
                    key={`line-${idx}`}
                    x1={from.x + 32}
                    y1={from.y + 32}
                    x2={to.x + 32}
                    y2={to.y + 32}
                    stroke="url(#dots)"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity="0.6"
                  />
                );
              })}
            </svg>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-3">Ranking Status</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00C47E' }} />
                  <span className="text-xs text-slate-300">Top 3</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFA500' }} />
                  <span className="text-xs text-slate-300">Page 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF3B30' }} />
                  <span className="text-xs text-slate-300">Page 2+</span>
                </div>
              </div>
            </div>

            {/* Location Markers */}
            {filteredLocations.map((location, index) => {
              const metrics = getLocationMetrics(location.id);
              const badge = getRankBadge(metrics.avgRank);
              const isSelected = selectedLocation?.id === location.id;
              
              const positions = [
                { x: 200, y: 200 },
                { x: 450, y: 150 },
                { x: 320, y: 350 },
                { x: 550, y: 300 },
              ];
              const pos = positions[index] || { x: 300, y: 300 };

              return (
                <div
                  key={location.id}
                  className="absolute cursor-pointer group"
                  style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                  onClick={() => setSelectedLocation(location)}
                >
                  {/* Glow effect */}
                  {isSelected && (
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-xl opacity-50 animate-pulse"
                      style={{ backgroundColor: badge.color }}
                    />
                  )}

                  {/* Location Marker */}
                  <div className="relative flex flex-col items-center z-10">
                    <div 
                      className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border-4 ${isSelected ? 'scale-110 border-white' : 'border-slate-700 hover:scale-105'}`}
                      style={{ 
                        backgroundColor: badge.color,
                        boxShadow: `0 0 30px ${badge.color}40`
                      }}
                    >
                      <MapPin className="size-8 text-white drop-shadow-lg" />
                    </div>
                    
                    {/* Location Card */}
                    <div className="mt-3 bg-slate-800/95 backdrop-blur-md px-4 py-2.5 rounded-lg shadow-xl border border-slate-700">
                      <p className="text-sm text-white whitespace-nowrap">{location.city}, {location.state}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-slate-400">{metrics.keywordCount} KWs</span>
                        <span className="text-xs text-slate-600">•</span>
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] px-2 py-0 border-0"
                          style={{ 
                            backgroundColor: badge.color + '30',
                            color: badge.color
                          }}
                        >
                          #{Math.round(metrics.avgRank)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Stats Banner at Bottom */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-md px-8 py-4 rounded-xl shadow-2xl border border-slate-700">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl text-green-400" style={{ fontWeight: 700 }}>{top3Rankings}</p>
                  <p className="text-xs text-slate-400 mt-1">Top 3 Rankings</p>
                </div>
                <div className="w-px h-12 bg-slate-700" />
                <div className="text-center">
                  <p className="text-3xl text-orange-400" style={{ fontWeight: 700 }}>{top10Rankings}</p>
                  <p className="text-xs text-slate-400 mt-1">Top 10 Rankings</p>
                </div>
                <div className="w-px h-12 bg-slate-700" />
                <div className="text-center">
                  <p className="text-3xl text-blue-400" style={{ fontWeight: 700 }}>{totalMarkets}</p>
                  <p className="text-xs text-slate-400 mt-1">Total Markets</p>
                </div>
                <div className="w-px h-12 bg-slate-700" />
                <div className="text-center">
                  <p className="text-3xl text-purple-400" style={{ fontWeight: 700 }}>{totalKeywords}</p>
                  <p className="text-xs text-slate-400 mt-1">Total Keywords</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Location Details */}
        <Card className="p-6">
          {selectedLocation ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-slate-900 mb-1">{selectedLocation.city}</h3>
                    <p className="text-sm text-slate-600">{selectedLocation.businessName}</p>
                  </div>
                  <MapPin className="size-5" style={{ color: '#0052CC' }} />
                </div>
                <p className="text-xs text-slate-500">{selectedLocation.address}</p>
              </div>

              <div className="pt-4 border-t space-y-4">
                {(() => {
                  const metrics = getLocationMetrics(selectedLocation.id);
                  return (
                    <>
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF5F5' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-600">Monthly Revenue Loss</span>
                          <TrendingDown className="size-4" style={{ color: '#FF3B30' }} />
                        </div>
                        <p className="text-slate-900" style={{ fontWeight: 700, fontSize: '24px' }}>${metrics.totalRevenueLoss.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-1">Opportunity to capture</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Keywords</p>
                          <p className="text-slate-900" style={{ fontWeight: 600 }}>{metrics.keywordCount}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Avg Rank</p>
                          <p className="text-slate-900" style={{ fontWeight: 600 }}>{metrics.avgRank}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Est. Monthly Clicks</p>
                        <p className="text-slate-900" style={{ fontWeight: 600 }}>{metrics.totalClicks.toLocaleString()}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm text-slate-900 mb-3">Top Keywords</h4>
                <div className="space-y-2">
                  {getLocationKeywords(selectedLocation.id).slice(0, 3).map(keyword => {
                    if (!category) return null;
                    const metric = calculateCustomerRevenueLoss(keyword, category.avgJobValue, category.conversionRate);
                    const badge = getRankBadge(keyword.currentRank);
                    
                    return (
                      <div key={keyword.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs text-slate-900 flex-1 pr-2">{keyword.keyword}</p>
                          <Badge 
                            variant="secondary" 
                            className="text-[10px] px-2 py-0 border flex-shrink-0"
                            style={{ 
                              backgroundColor: badge.color + '20',
                              color: badge.color,
                              borderColor: badge.color
                            }}
                          >
                            #{keyword.currentRank}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] mb-2">
                          <span className="text-slate-500">{keyword.searchVolume.toLocaleString()} searches/mo</span>
                          <span className="text-red-600">-${metric.revenueLoss.toLocaleString()}/mo</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full text-xs h-7"
                          onClick={() => handleViewCompetitors(keyword)}
                        >
                          <Eye className="size-3 mr-1" />
                          View Competitors
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="size-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-2">No location selected</p>
              <p className="text-sm text-slate-500">Click a marker to view details</p>
            </div>
          )}
        </Card>
      </div>

      {/* Competitor Analysis - Inline Section */}
      {showCompetitorAnalysis && selectedKeyword && category && (
        <Collapsible open={showCompetitorAnalysis} onOpenChange={setShowCompetitorAnalysis}>
          <Card className="overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#0052CC' + '20' }}>
                    <Target className="size-5" style={{ color: '#0052CC' }} />
                  </div>
                  <div>
                    <h3 className="text-slate-900">Competitor Analysis & Revenue Opportunity</h3>
                    <p className="text-sm text-slate-500">Keyword: {selectedKeyword.keyword}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ChevronDown className={`size-5 transition-transform ${showCompetitorAnalysis ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-6">
                <CompetitorAnalysis 
                  keyword={selectedKeyword}
                  avgJobValue={category.avgJobValue}
                  conversionRate={category.conversionRate}
                />
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Top Keywords Section */}
      <TopKeywords 
        keywords={keywords}
        category={category}
        onViewCompetitors={handleViewCompetitors}
      />
    </div>
  );
}