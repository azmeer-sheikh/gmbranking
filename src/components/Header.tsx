import React from 'react';
import { useData } from '../context/DataContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card } from './ui/card';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { filters, setFilters, getStates, getCities, getKeywordNames } = useData();

  const states = getStates();
  const cities = getCities();
  const keywordNames = getKeywordNames();

  const handleStateChange = (state: string) => {
    setFilters({ state: state === 'all' ? '' : state, city: '', keyword: '' });
  };

  const handleCityChange = (city: string) => {
    setFilters({ ...filters, city: city === 'all' ? '' : city, keyword: '' });
  };

  const handleKeywordChange = (keyword: string) => {
    setFilters({ ...filters, keyword: keyword === 'all' ? '' : keyword });
  };

  const clearFilters = () => {
    setFilters({ state: '', city: '', keyword: '' });
  };

  const hasFilters = filters.state || filters.city || filters.keyword;

  return (
    <div className="bg-white border-b p-4">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="size-5" />
        </Button>
        <h3 className="md:hidden">GMB Dashboard</h3>
      </div>

      {states.length > 0 && (
        <Card className="p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm">Filter Data</h4>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm text-muted-foreground">
                State
              </label>
              <Select value={filters.state || 'all'} onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm text-muted-foreground">
                City
              </label>
              <Select
                value={filters.city || 'all'}
                onValueChange={handleCityChange}
                disabled={!filters.state && cities.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm text-muted-foreground">
                Keyword
              </label>
              <Select value={filters.keyword || 'all'} onValueChange={handleKeywordChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Keywords" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Keywords</SelectItem>
                  {keywordNames.map((keyword) => (
                    <SelectItem key={keyword} value={keyword}>
                      {keyword}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.state && (
                <span className="text-xs bg-[#0052CC] text-white px-2 py-1 rounded">
                  State: {filters.state}
                </span>
              )}
              {filters.city && (
                <span className="text-xs bg-[#0052CC] text-white px-2 py-1 rounded">
                  City: {filters.city}
                </span>
              )}
              {filters.keyword && (
                <span className="text-xs bg-[#0052CC] text-white px-2 py-1 rounded">
                  Keyword: {filters.keyword}
                </span>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}