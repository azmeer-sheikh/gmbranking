import React, { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Hash,
  Search,
  Filter,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type { GlobalKeyword } from '../types/database';

interface KeywordsManagementProps {
  globalKeywords: GlobalKeyword[];
  onEdit: (kw: GlobalKeyword) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => Promise<boolean>;
  loading: boolean;
}

export default function KeywordsManagement({
  globalKeywords,
  onEdit,
  onDelete,
  onBulkDelete,
  loading,
}: KeywordsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(globalKeywords.map(kw => kw.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [globalKeywords]);

  // Filter keywords
  const filteredKeywords = useMemo(() => {
    return globalKeywords.filter(kw => {
      const matchesSearch = searchTerm === '' || 
        kw.keyword.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === '' || kw.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [globalKeywords, searchTerm, categoryFilter]);

  // Paginate keywords
  const paginatedKeywords = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredKeywords.slice(start, end);
  }, [filteredKeywords, page, perPage]);

  const totalPages = Math.ceil(filteredKeywords.length / perPage);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Please select keywords to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} keyword(s)?`)) {
      return;
    }

    // Use the bulk delete API
    const result = await onBulkDelete(selectedIds);
    if (result) {
      setSelectedIds([]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedKeywords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedKeywords.map(kw => kw.id));
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
            <Label htmlFor="keyword-search" className="mb-2 block text-sm">Search Keywords</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="keyword-search"
                type="text"
                placeholder="Search by keyword..."
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
              {selectedIds.length} keyword(s) selected
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
          Showing {paginatedKeywords.length} of {filteredKeywords.length} keywords
          {(searchTerm || categoryFilter) && ` (filtered from ${globalKeywords.length} total)`}
        </p>
        {paginatedKeywords.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="text-sm"
          >
            {selectedIds.length === paginatedKeywords.length ? 'Deselect All' : 'Select All on Page'}
          </Button>
        )}
      </div>

      {/* Keywords List */}
      {loading && <p className="text-center text-slate-500">Loading...</p>}
      
      {!loading && filteredKeywords.length === 0 && globalKeywords.length === 0 && (
        <Card className="p-12 text-center">
          <Hash className="size-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">No keywords yet</p>
          <p className="text-sm text-slate-400">Click "Add Keyword" to create your first global keyword</p>
        </Card>
      )}

      {!loading && filteredKeywords.length === 0 && globalKeywords.length > 0 && (
        <Card className="p-12 text-center">
          <Search className="size-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">No keywords match your filters</p>
          <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
        </Card>
      )}

      {!loading && paginatedKeywords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {paginatedKeywords.map((kw) => (
            <Card 
              key={kw.id} 
              className={`p-3 hover:shadow-md transition-all cursor-pointer ${
                selectedIds.includes(kw.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleSelect(kw.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(kw.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelect(kw.id);
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm text-slate-900 mb-1" style={{ fontWeight: 600 }}>
                        {kw.keyword}
                      </h4>
                      {kw.category && (
                        <Badge variant="outline" className="text-xs">
                          {kw.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(kw)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mr-1"
                  >
                    <Edit2 className="size-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(kw.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 -mr-2"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>Vol: {kw.search_volume.toLocaleString()}</p>
                <p>CPC: ${kw.cpc.toFixed(2)}</p>
                <p>Comp: {kw.competition}</p>
                {(kw.competitor_1 || kw.competitor_2 || kw.competitor_3) && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-600 mb-1">Competitors:</p>
                    <div className="flex gap-2">
                      {kw.competitor_1 && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          #1: {kw.competitor_1}
                        </Badge>
                      )}
                      {kw.competitor_2 && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          #2: {kw.competitor_2}
                        </Badge>
                      )}
                      {kw.competitor_3 && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          #3: {kw.competitor_3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
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