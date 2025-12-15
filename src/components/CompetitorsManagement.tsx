import React, { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Target,
  Search,
  Filter,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type { Competitor } from '../types/database';

interface CompetitorsManagementProps {
  competitors: Competitor[];
  onEdit: (comp: Competitor) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export default function CompetitorsManagement({
  competitors,
  onEdit,
  onDelete,
  loading,
}: CompetitorsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(competitors.map(comp => comp.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [competitors]);

  // Filter competitors
  const filteredCompetitors = useMemo(() => {
    return competitors.filter(comp => {
      const matchesSearch = searchTerm === '' || 
        comp.competitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.area.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === '' || comp.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [competitors, searchTerm, categoryFilter]);

  // Paginate competitors
  const paginatedCompetitors = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredCompetitors.slice(start, end);
  }, [filteredCompetitors, page, perPage]);

  const totalPages = Math.ceil(filteredCompetitors.length / perPage);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Please select competitors to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} competitor(s)?`)) {
      return;
    }

    // Delete each selected competitor
    for (const id of selectedIds) {
      await onDelete(id);
    }
    
    setSelectedIds([]);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedCompetitors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCompetitors.map(comp => comp.id));
    }
  };

  // Handle individual select
  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Label htmlFor="competitor-search" className="mb-2 block text-sm">Search Competitors</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="competitor-search"
                type="text"
                placeholder="Search by name or area..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-64">
            <Label htmlFor="category-filter" className="mb-2 block text-sm">Filter by Category</Label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" />
              <select
                id="category-filter"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {selectedIds.length} competitor(s) selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="size-4" />
              Delete Selected
            </Button>
          </div>
        )}
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {paginatedCompetitors.length} of {filteredCompetitors.length} competitors
          {(searchTerm || categoryFilter) && ` (filtered from ${competitors.length} total)`}
        </p>
        {paginatedCompetitors.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="text-sm"
          >
            {selectedIds.length === paginatedCompetitors.length ? 'Deselect All' : 'Select All on Page'}
          </Button>
        )}
      </div>

      {/* Competitors List */}
      {loading && <p className="text-center text-slate-500">Loading...</p>}
      
      {!loading && filteredCompetitors.length === 0 && competitors.length === 0 && (
        <Card className="p-12 text-center">
          <Target className="size-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">No competitors yet</p>
          <p className="text-sm text-slate-400">Click "Add Competitor" to create your first competitor</p>
        </Card>
      )}

      {!loading && filteredCompetitors.length === 0 && competitors.length > 0 && (
        <Card className="p-12 text-center">
          <Search className="size-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">No competitors match your filters</p>
          <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
        </Card>
      )}

      {!loading && paginatedCompetitors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedCompetitors.map((comp) => (
            <Card 
              key={comp.id} 
              className={`p-4 hover:shadow-lg transition-all cursor-pointer ${
                selectedIds.includes(comp.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleSelect(comp.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(comp.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelect(comp.id);
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h4 className="text-slate-900 mb-1" style={{ fontWeight: 600 }}>
                      {comp.competitor_name}
                    </h4>
                    <p className="text-sm text-slate-500">{comp.area}</p>
                  </div>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(comp)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(comp.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {comp.category && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                    {comp.category}
                  </Badge>
                )}

                <div className="pt-2 border-t">
                  <p className="text-xs text-slate-500 mb-1">Keywords</p>
                  <p className="text-2xl" style={{ fontWeight: 700, color: '#0052CC' }}>
                    {comp.competitor_keywords?.length || 0}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="gap-2"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="gap-2"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
