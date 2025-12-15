import React, { useState, useMemo, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Hash,
  Search,
  Filter,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import * as api from '../services/database-api';
import { toast } from 'sonner@2.0.3';

interface ClientKeyword {
  id: string;
  client_id: string;
  keyword_id: string;
  current_rank: number;
  target_rank: number;
  search_volume: number;
  cpc: number;
  competitor_1: number | null;
  competitor_2: number | null;
  competitor_3: number | null;
  global_keywords: {
    keyword: string;
    category: string;
    competition: string;
  };
  clients: {
    business_name: string;
    category: string;
  };
}

interface ClientKeywordsManagementProps {
  onRefresh: () => void;
}

export default function ClientKeywordsManagement({ onRefresh }: ClientKeywordsManagementProps) {
  const [clientKeywords, setClientKeywords] = useState<ClientKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<ClientKeyword | null>(null);
  const [editForm, setEditForm] = useState({
    currentRank: 0,
    targetRank: 1,
    cpc: 0,
    competitor1: null as number | null,
    competitor2: null as number | null,
    competitor3: null as number | null,
  });

  useEffect(() => {
    loadClientKeywords();
  }, []);

  const loadClientKeywords = async () => {
    setLoading(true);
    const data = await api.getClientKeywords();
    setClientKeywords(data);
    setLoading(false);
  };

  // Get unique categories and clients
  const categories = useMemo(() => {
    const cats = new Set(
      clientKeywords
        .map(ck => ck.global_keywords?.category)
        .filter(Boolean)
    );
    return Array.from(cats).sort();
  }, [clientKeywords]);

  const clients = useMemo(() => {
    const clientNames = new Set(
      clientKeywords.map(ck => ck.clients?.business_name).filter(Boolean)
    );
    return Array.from(clientNames).sort();
  }, [clientKeywords]);

  // Filter keywords
  const filteredKeywords = useMemo(() => {
    return clientKeywords.filter(ck => {
      const keyword = ck.global_keywords?.keyword || '';
      const category = ck.global_keywords?.category || '';
      const clientName = ck.clients?.business_name || '';

      const matchesSearch =
        searchTerm === '' ||
        keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === '' || category === categoryFilter;
      const matchesClient = clientFilter === '' || clientName === clientFilter;
      
      return matchesSearch && matchesCategory && matchesClient;
    });
  }, [clientKeywords, searchTerm, categoryFilter, clientFilter]);

  // Paginate keywords
  const paginatedKeywords = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredKeywords.slice(start, end);
  }, [filteredKeywords, page, perPage]);

  const totalPages = Math.ceil(filteredKeywords.length / perPage);

  // Calculate profit potential based on competitor rank
  const calculateProfit = (keyword: ClientKeyword, competitorRank: number | null) => {
    if (!competitorRank || !keyword.cpc || !keyword.search_volume) return 0;
    
    // CTR estimates based on rank
    const ctrByRank: { [key: number]: number } = {
      1: 0.316, 2: 0.158, 3: 0.110, 4: 0.084,
      5: 0.068, 6: 0.058, 7: 0.051, 8: 0.045,
      9: 0.041, 10: 0.037,
    };
    
    const currentCtr = ctrByRank[keyword.current_rank] || 0.02;
    const competitorCtr = ctrByRank[competitorRank] || 0.02;
    
    const currentClicks = keyword.search_volume * currentCtr;
    const competitorClicks = keyword.search_volume * competitorCtr;
    
    const profitDiff = (competitorClicks - currentClicks) * keyword.cpc * 0.15; // 15% conversion
    return Math.round(profitDiff);
  };

  // Handle edit
  const handleEdit = (keyword: ClientKeyword) => {
    setEditingKeyword(keyword);
    setEditForm({
      currentRank: keyword.current_rank,
      targetRank: keyword.target_rank,
      cpc: keyword.cpc,
      competitor1: keyword.competitor_1,
      competitor2: keyword.competitor_2,
      competitor3: keyword.competitor_3,
    });
    setShowEditDialog(true);
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editingKeyword) return;
    
    setLoading(true);
    const result = await api.updateClientKeyword(editingKeyword.id, {
      currentRank: editForm.currentRank,
      targetRank: editForm.targetRank,
      cpc: editForm.cpc,
      competitor1: editForm.competitor1,
      competitor2: editForm.competitor2,
      competitor3: editForm.competitor3,
    });
    
    if (result.success) {
      toast.success('Keyword updated successfully!');
      await loadClientKeywords();
      onRefresh();
      setShowEditDialog(false);
      setEditingKeyword(null);
    } else {
      toast.error(result.message || 'Failed to update keyword');
    }
    setLoading(false);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this keyword assignment?')) return;
    
    setLoading(true);
    const success = await api.deleteClientKeyword(id);
    
    if (success) {
      toast.success('Keyword deleted successfully!');
      await loadClientKeywords();
      onRefresh();
    } else {
      toast.error('Failed to delete keyword');
    }
    setLoading(false);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Please select keywords to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} keyword(s)?`)) {
      return;
    }

    setLoading(true);
    for (const id of selectedIds) {
      await api.deleteClientKeyword(id);
    }
    
    toast.success(`Deleted ${selectedIds.length} keywords`);
    await loadClientKeywords();
    onRefresh();
    setSelectedIds([]);
    setLoading(false);
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
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <Label htmlFor="search" className="mb-2 flex items-center gap-2">
              <Search className="size-4" />
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search keywords or clients..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Category Filter */}
          <div>
            <Label htmlFor="category" className="mb-2 flex items-center gap-2">
              <Filter className="size-4" />
              Category
            </Label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
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

          {/* Client Filter */}
          <div>
            <Label htmlFor="client" className="mb-2 flex items-center gap-2">
              <Filter className="size-4" />
              Client
            </Label>
            <select
              id="client"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              value={clientFilter}
              onChange={(e) => {
                setClientFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setClientFilter('');
                setPage(1);
              }}
              className="w-full"
            >
              <X className="size-4 mr-2" />
              Clear
            </Button>
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="w-full"
              >
                <Trash2 className="size-4 mr-2" />
                Delete ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-slate-600">
            Showing {paginatedKeywords.length} of {filteredKeywords.length} keywords
            {filteredKeywords.length !== clientKeywords.length && ` (${clientKeywords.length} total)`}
          </p>
        </div>
      </Card>

      {/* Keywords Table */}
      {loading && <p className="text-center text-slate-500">Loading...</p>}
      
      {!loading && clientKeywords.length === 0 && (
        <Card className="p-12 text-center">
          <Hash className="size-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">No client keywords yet</p>
          <p className="text-sm text-slate-400">Import keywords via Excel or add them to clients</p>
        </Card>
      )}

      {!loading && paginatedKeywords.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginatedKeywords.length && paginatedKeywords.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 uppercase">Keyword</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600 uppercase">Rank</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600 uppercase">Vol</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600 uppercase">CPC</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600 uppercase">Comp #1</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600 uppercase">Comp #2</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600 uppercase">Comp #3</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedKeywords.map((kw) => {
                  const profit1 = calculateProfit(kw, kw.competitor_1);
                  const profit2 = calculateProfit(kw, kw.competitor_2);
                  const profit3 = calculateProfit(kw, kw.competitor_3);
                  
                  return (
                    <tr key={kw.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(kw.id)}
                          onChange={() => handleSelect(kw.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-900">
                          {kw.clients?.business_name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700">{kw.global_keywords?.keyword}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                          {kw.global_keywords?.category || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: kw.current_rank <= 3 ? '#DCFCE7' : kw.current_rank <= 10 ? '#FEF3C7' : '#FEE2E2',
                            color: kw.current_rank <= 3 ? '#16A34A' : kw.current_rank <= 10 ? '#D97706' : '#DC2626',
                          }}
                        >
                          #{kw.current_rank}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-600">
                        {kw.search_volume.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-slate-900">
                        ${kw.cpc.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.competitor_1 ? (
                          <div>
                            <Badge className="bg-amber-100 text-amber-700 text-xs mb-1">
                              #{kw.competitor_1}
                            </Badge>
                            {profit1 !== 0 && (
                              <div className="text-xs text-green-600 font-medium">
                                +${Math.abs(profit1).toLocaleString()}/mo
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.competitor_2 ? (
                          <div>
                            <Badge className="bg-amber-100 text-amber-700 text-xs mb-1">
                              #{kw.competitor_2}
                            </Badge>
                            {profit2 !== 0 && (
                              <div className="text-xs text-green-600 font-medium">
                                +${Math.abs(profit2).toLocaleString()}/mo
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.competitor_3 ? (
                          <div>
                            <Badge className="bg-amber-100 text-amber-700 text-xs mb-1">
                              #{kw.competitor_3}
                            </Badge>
                            {profit3 !== 0 && (
                              <div className="text-xs text-green-600 font-medium">
                                +${Math.abs(profit3).toLocaleString()}/mo
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(kw)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(kw.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-2"
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="gap-2"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Edit Dialog */}
      {showEditDialog && editingKeyword && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Keyword: {editingKeyword.global_keywords?.keyword}</DialogTitle>
              <p className="text-sm text-slate-500">
                Client: {editingKeyword.clients?.business_name}
              </p>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 my-4">
              <div>
                <Label htmlFor="currentRank">Current Rank</Label>
                <Input
                  id="currentRank"
                  type="number"
                  min="1"
                  max="100"
                  value={editForm.currentRank}
                  onChange={(e) => setEditForm({ ...editForm, currentRank: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="targetRank">Target Rank</Label>
                <Input
                  id="targetRank"
                  type="number"
                  min="1"
                  max="100"
                  value={editForm.targetRank}
                  onChange={(e) => setEditForm({ ...editForm, targetRank: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <Label htmlFor="cpc">CPC ($)</Label>
                <Input
                  id="cpc"
                  type="number"
                  step="0.01"
                  value={editForm.cpc}
                  onChange={(e) => setEditForm({ ...editForm, cpc: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="competitor1">Competitor #1 Rank</Label>
                <Input
                  id="competitor1"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter rank or leave empty"
                  value={editForm.competitor1 || ''}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    competitor1: e.target.value === '' ? null : parseInt(e.target.value) || null 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="competitor2">Competitor #2 Rank</Label>
                <Input
                  id="competitor2"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter rank or leave empty"
                  value={editForm.competitor2 || ''}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    competitor2: e.target.value === '' ? null : parseInt(e.target.value) || null 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="competitor3">Competitor #3 Rank</Label>
                <Input
                  id="competitor3"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter rank or leave empty"
                  value={editForm.competitor3 || ''}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    competitor3: e.target.value === '' ? null : parseInt(e.target.value) || null 
                  })}
                />
              </div>
            </div>

            {/* Profit Preview */}
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Profit Potential Preview:</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Competitor #1', rank: editForm.competitor1 },
                  { label: 'Competitor #2', rank: editForm.competitor2 },
                  { label: 'Competitor #3', rank: editForm.competitor3 },
                ].map(({ label, rank }, idx) => {
                  const profit = calculateProfit(
                    { ...editingKeyword, current_rank: editForm.currentRank, cpc: editForm.cpc },
                    rank
                  );
                  return (
                    <div key={idx} className="bg-white rounded p-2 text-center">
                      <p className="text-xs text-slate-600">{label}</p>
                      {rank ? (
                        <>
                          <p className="text-sm font-medium text-slate-900">Rank #{rank}</p>
                          <p className="text-xs text-green-600 font-medium">
                            +${Math.abs(profit).toLocaleString()}/mo
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400">Not set</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={loading}
                style={{ backgroundColor: '#00C47E' }}
              >
                Update Keyword
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
