import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, TrendingUp, TrendingDown, ChevronRight, Plus } from 'lucide-react';
import { businessCategories } from '../lib/business-categories';

interface GMBLocation {
  id: string;
  name: string;
  category: string;
  keywords: number;
  avgRank: number;
  monthlyLoss: number;
  yearlyRevenue: number;
  status: 'active' | 'inactive';
}

interface GMBLocationSwitcherProps {
  locations: GMBLocation[];
  selectedLocationId: string;
  onLocationChange: (locationId: string) => void;
  onCategoryFilter: (category: string) => void;
}

export default function GMBLocationSwitcher({ 
  locations, 
  selectedLocationId, 
  onLocationChange,
  onCategoryFilter 
}: GMBLocationSwitcherProps) {
  const [filterCategory, setFilterCategory] = React.useState<string>('all');

  const filteredLocations = filterCategory === 'all'
    ? locations
    : locations.filter(loc => loc.category === filterCategory);

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);

  const handleCategoryFilterChange = (category: string) => {
    setFilterCategory(category);
    onCategoryFilter(category);
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return '#00C47E';
    if (rank <= 10) return '#FFA500';
    return '#FF3B30';
  };

  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-900 mb-1">Multiple GMB Locations</h3>
            <p className="text-sm text-slate-500">Manage and switch between your business locations</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterCategory} onValueChange={handleCategoryFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {businessCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" style={{ backgroundColor: '#0052CC' }}>
              <Plus className="size-4 mr-1" />
              Add Location
            </Button>
          </div>
        </div>
      </Card>

      {/* Selected Location Summary */}
      {selectedLocation && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2" style={{ borderColor: '#0052CC' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-slate-900">{selectedLocation.name}</h3>
                <Badge 
                  variant="secondary" 
                  style={{ backgroundColor: '#00C47E', color: 'white', borderRadius: '6px' }}
                >
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="size-4" />
                <span>{businessCategories.find(c => c.id === selectedLocation.category)?.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Current Tracking</p>
              <p className="text-2xl text-slate-900 mt-1" style={{ fontWeight: 700 }}>{selectedLocation.keywords} Keywords</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRankColor(selectedLocation.avgRank) }} />
                <p className="text-xs text-slate-500">Avg Rank</p>
              </div>
              <p className="text-xl text-slate-900" style={{ fontWeight: 700 }}>#{selectedLocation.avgRank}</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="size-3 text-red-600" />
                <p className="text-xs text-slate-500">Monthly Loss</p>
              </div>
              <p className="text-xl text-red-600" style={{ fontWeight: 700 }}>-${selectedLocation.monthlyLoss.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-3 text-green-600" />
                <p className="text-xs text-slate-500">Yearly Potential</p>
              </div>
              <p className="text-xl text-green-600" style={{ fontWeight: 700 }}>${selectedLocation.yearlyRevenue.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-xs text-slate-500 mb-2">Recovery Timeline</p>
              <p className="text-xl text-slate-900" style={{ fontWeight: 700 }}>6-9 months</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="size-5 text-green-700" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm text-green-900 mb-1">Revenue Recovery Projection</h4>
                <p className="text-sm text-green-700">
                  With our GMB ranking service, we can recover <strong>${selectedLocation.monthlyLoss.toLocaleString()}/month</strong> in lost revenue. 
                  That's <strong>${selectedLocation.yearlyRevenue.toLocaleString()} in the first year</strong> of optimization.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* All Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map(location => {
          const isSelected = location.id === selectedLocationId;
          const category = businessCategories.find(c => c.id === location.category);
          
          return (
            <Card 
              key={location.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-slate-300'
              }`}
              onClick={() => onLocationChange(location.id)}
              style={isSelected ? { borderColor: '#0052CC' } : {}}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-slate-900">{location.name}</h4>
                    {location.status === 'active' && (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{category?.icon}</span>
                    <span>{category?.name}</span>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ 
                    backgroundColor: getRankColor(location.avgRank) + '20',
                    color: getRankColor(location.avgRank),
                    borderColor: getRankColor(location.avgRank),
                    border: '1px solid'
                  }}
                >
                  Rank #{location.avgRank}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Keywords:</span>
                  <span className="text-slate-900" style={{ fontWeight: 600 }}>{location.keywords}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Monthly Loss:</span>
                  <span className="text-red-600" style={{ fontWeight: 600 }}>-${location.monthlyLoss.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Yearly Potential:</span>
                  <span className="text-green-600" style={{ fontWeight: 600 }}>${location.yearlyRevenue.toLocaleString()}</span>
                </div>
              </div>

              <Button 
                size="sm" 
                variant={isSelected ? "default" : "outline"}
                className="w-full"
                style={isSelected ? { backgroundColor: '#0052CC' } : {}}
              >
                {isSelected ? 'Currently Selected' : 'Switch to Location'}
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">Portfolio Overview</h3>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Locations</p>
            <p className="text-3xl text-slate-900" style={{ fontWeight: 700 }}>{locations.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Keywords</p>
            <p className="text-3xl text-slate-900" style={{ fontWeight: 700 }}>
              {locations.reduce((sum, loc) => sum + loc.keywords, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Monthly Loss</p>
            <p className="text-3xl text-red-600" style={{ fontWeight: 700 }}>
              -${locations.reduce((sum, loc) => sum + loc.monthlyLoss, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Yearly Potential</p>
            <p className="text-3xl text-green-600" style={{ fontWeight: 700 }}>
              ${locations.reduce((sum, loc) => sum + loc.yearlyRevenue, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
