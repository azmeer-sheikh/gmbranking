import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { locations } from '../lib/sample-data';
import { Keyword } from '../lib/types';
import { BusinessCategory } from '../lib/business-categories';
import { calculateCustomerRevenueLoss, generateCompetitorsForKeyword } from '../lib/competitor-data';
import CompetitorAnalysis from './CompetitorAnalysis';
import CompetitorPerformance from './CompetitorPerformance';
import { Search, Plus, TrendingUp, TrendingDown, DollarSign, Target, MapPin, Filter, ArrowUpDown, Eye, Users } from 'lucide-react';
import { useClient } from '../context/ClientContext';

interface KeywordsViewProps {
  category: BusinessCategory | undefined;
  keywords: Keyword[];
}

export default function KeywordsView({ category, keywords }: KeywordsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'volume' | 'loss'>('loss');
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null);
  const [isCompetitorDialogOpen, setIsCompetitorDialogOpen] = useState(false);
  
  // Get client data from context
  const { selectedClient } = useClient();

  const filteredKeywords = keywords
    .filter(kw => {
      const matchesSearch = kw.keyword?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = filterLocation === 'all' || kw.locationId === filterLocation;
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      if (!category) return 0;
      const metricsA = calculateCustomerRevenueLoss(a, category.avgJobValue, category.conversionRate);
      const metricsB = calculateCustomerRevenueLoss(b, category.avgJobValue, category.conversionRate);
      
      switch (sortBy) {
        case 'rank':
          return a.currentRank - b.currentRank;
        case 'volume':
          return b.searchVolume - a.searchVolume;
        case 'loss':
          return metricsB.revenueLoss - metricsA.revenueLoss;
        default:
          return 0;
      }
    });

  const totalRevenueLoss = category ? filteredKeywords.reduce((sum, kw) => {
    const metrics = calculateCustomerRevenueLoss(kw, category.avgJobValue, category.conversionRate);
    return sum + metrics.revenueLoss;
  }, 0) : 0;

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return { label: 'Top 3', color: '#00C47E' };
    if (rank <= 10) return { label: 'Page 1', color: '#FFA500' };
    return { label: 'Page 2+', color: '#FF3B30' };
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty >= 70) return { label: 'Hard', color: '#FF3B30' };
    if (difficulty >= 50) return { label: 'Medium', color: '#FFA500' };
    return { label: 'Easy', color: '#00C47E' };
  };

  const handleViewCompetitors = (keyword: Keyword) => {
    setSelectedKeyword(keyword);
    setIsCompetitorDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 md:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Total Keywords</span>
            <Search className="size-4 text-blue-600" />
          </div>
          <p className="text-slate-900">{filteredKeywords.length}</p>
          <p className="text-xs text-slate-500 mt-1">Tracked keywords</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Total Search Volume</span>
            <TrendingUp className="size-4" style={{ color: '#0052CC' }} />
          </div>
          <p className="text-slate-900">
            {filteredKeywords.reduce((sum, kw) => sum + kw.searchVolume, 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Searches per month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Avg Current Rank</span>
            <Target className="size-4 text-orange-600" />
          </div>
          <p className="text-slate-900">
            {(filteredKeywords.reduce((sum, kw) => sum + kw.currentRank, 0) / filteredKeywords.length).toFixed(1)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across all keywords</p>
        </Card>

        <Card className="p-6" style={{ backgroundColor: '#FFF5F5' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Revenue Loss</span>
            <DollarSign className="size-4" style={{ color: '#FF3B30' }} />
          </div>
          <p className="text-slate-900">${totalRevenueLoss.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Per month opportunity</p>
        </Card>
      </div>

      {/* Top Competitors Performance */}
      <CompetitorPerformance 
        keywords={filteredKeywords.map(kw => ({
          keyword: kw.keyword,
          search_volume: kw.searchVolume,
          cpc: kw.cpc,
          competitor_1: kw.competitor1Rank || null,
          competitor_2: kw.competitor2Rank || null,
          competitor_3: kw.competitor3Rank || null,
        }))}
        avgJobPrice={selectedClient?.avg_job_price || 500}
      />

      {/* Filters & Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-[180px]">
              <MapPin className="size-4 mr-2" />
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc.id} value={loc.id}>{loc.city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="size-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="loss">Revenue Loss</SelectItem>
              <SelectItem value="volume">Search Volume</SelectItem>
              <SelectItem value="rank">Current Rank</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isCompetitorDialogOpen} onOpenChange={setIsCompetitorDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: '#0052CC' }}>
                <Plus className="size-4 mr-2" />
                Add Keyword
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Keyword</DialogTitle>
              </DialogHeader>
              <AddKeywordForm onClose={() => setIsCompetitorDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Keywords Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Keyword</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Location</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Search Volume</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Current Rank</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Revenue Loss</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Top Competitors</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords.length > 0 ? (
                filteredKeywords.map(keyword => {
                  const location = locations.find(loc => loc.id === keyword.locationId);
                  const defaultAvgJobValue = 500;
                  const defaultConversionRate = 0.05;
                  const metrics = category 
                    ? calculateCustomerRevenueLoss(keyword, category.avgJobValue, category.conversionRate) 
                    : calculateCustomerRevenueLoss(keyword, defaultAvgJobValue, defaultConversionRate);
                  const competitors = category 
                    ? generateCompetitorsForKeyword(keyword, category.avgJobValue, category.conversionRate) 
                    : generateCompetitorsForKeyword(keyword, defaultAvgJobValue, defaultConversionRate);
                  const rankBadge = getRankBadge(keyword.currentRank);

                  return (
                    <tr key={keyword.id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-slate-900 font-medium">{keyword.keyword}</p>
                          <p className="text-xs text-slate-500">{keyword.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="size-3 text-slate-400" />
                          <span className="text-sm text-slate-700">{location?.city || keyword.locationId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900 font-medium">{keyword.searchVolume.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">searches/mo</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant="secondary"
                            className="border w-fit"
                            style={{ 
                              backgroundColor: rankBadge.color + '20',
                              color: rankBadge.color,
                              borderColor: rankBadge.color
                            }}
                          >
                            #{keyword.currentRank}
                          </Badge>
                          <span className="text-xs text-slate-500">{rankBadge.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold" style={{ color: '#FF3B30' }}>
                          -${metrics?.revenueLoss.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-slate-500">per month</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <Users className="size-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-900 font-medium">{competitors[0]?.businessName || 'N/A'}</p>
                            {competitors[0] && (
                              <>
                                <p className="text-[10px] text-slate-500">Rank #{competitors[0].ranking}</p>
                                <p className="text-[10px] font-medium" style={{ color: '#00C47E' }}>
                                  ${competitors[0]?.estimatedRevenue.toLocaleString()}/mo
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewCompetitors(keyword)}
                          className="text-xs"
                        >
                          <Eye className="size-3 mr-1" />
                          View All
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="size-12 text-slate-300" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">No keywords found</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {searchQuery ? 'Try adjusting your search or filters' : 'Add keywords to get started'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Competitor Analysis Dialog */}
      {selectedKeyword && (
        <Dialog open={isCompetitorDialogOpen} onOpenChange={setIsCompetitorDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Competitor Analysis & Revenue Opportunity</DialogTitle>
            </DialogHeader>
            <CompetitorAnalysis 
              keyword={selectedKeyword}
              avgJobValue={category?.avgJobValue || 500}
              conversionRate={category?.conversionRate || 0.05}
            />
            <CompetitorPerformance 
              keyword={selectedKeyword}
              avgJobValue={category?.avgJobValue || 500}
              conversionRate={category?.conversionRate || 0.05}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AddKeywordForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-4">
      <div>
        <Label htmlFor="keyword">Keyword *</Label>
        <Input id="keyword" placeholder="e.g., emergency plumber near me" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location *</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(loc => (
                <SelectItem key={loc.id} value={loc.id}>{loc.city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Input id="category" placeholder="e.g., Emergency Services" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="searchVolume">Search Volume *</Label>
          <Input id="searchVolume" type="number" placeholder="0" required />
        </div>

        <div>
          <Label htmlFor="currentRank">Current Rank *</Label>
          <Input id="currentRank" type="number" placeholder="1-100" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cpc">CPC ($)</Label>
          <Input id="cpc" type="number" step="0.01" placeholder="0.00" />
        </div>

        <div>
          <Label htmlFor="difficulty">Difficulty (0-100)</Label>
          <Input id="difficulty" type="number" placeholder="50" />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1" style={{ backgroundColor: '#0052CC' }}>
          Add Keyword
        </Button>
      </div>
    </form>
  );
}