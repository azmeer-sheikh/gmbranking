import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Users,
  Plus,
  Trash2,
  Building,
  Hash,
  Target,
  Save,
  X,
  ArrowLeft,
  Settings,
  Upload,
  RefreshCw,
  Edit2,
  Database,
  Zap,
  CheckCircle,
  Eye,
  MapPin,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as api from '../services/database-api';
import type { Client, GlobalKeyword, Competitor } from '../types/database';
import ExcelImport from '../components/ExcelImport';
import ComprehensiveClientForm from '../components/ComprehensiveClientForm';
import KeywordsManagement from '../components/KeywordsManagement';
import ClientKeywordsManagement from '../components/ClientKeywordsManagement';
import CompetitorsManagement from '../components/CompetitorsManagement';
import { useClient } from '../context/ClientContext';

export default function AdminPanel() {
  // Use ClientContext for refreshing main app data
  const { refreshClients } = useClient();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [globalKeywords, setGlobalKeywords] = useState<GlobalKeyword[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showKeywordForm, setShowKeywordForm] = useState(false);
  const [showCompetitorForm, setShowCompetitorForm] = useState(false);
  const [showComprehensiveForm, setShowComprehensiveForm] = useState(false);

  // Edit mode state
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [editingCompetitorId, setEditingCompetitorId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editingClientData, setEditingClientData] = useState<any | null>(null);

  // Client form state
  const [clientForm, setClientForm] = useState({
    businessName: '',
    websiteUrl: '',
    area: '',
    location: '',
    category: '',
    phoneNumber: '',
    selectedKeywordIds: [] as string[],
  });

  // Keyword form state
  const [keywordForm, setKeywordForm] = useState({
    keyword: '',
    category: '',
    searchVolume: 0,
    competition: 'medium',
    cpc: 0,
    competitor1: null as number | null,
    competitor2: null as number | null,
    competitor3: null as number | null,
  });

  // Competitor form state
  const [competitorForm, setCompetitorForm] = useState({
    competitorName: '',
    area: '',
    category: '',
    clientId: '',
    selectedKeywordIds: [] as string[],
  });

  // Keywords filtering, pagination, and bulk delete state
  const [keywordSearchTerm, setKeywordSearchTerm] = useState('');
  const [keywordCategoryFilter, setKeywordCategoryFilter] = useState('');
  const [keywordPage, setKeywordPage] = useState(1);
  const [keywordPerPage] = useState(20);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);

  // Competitors filtering, pagination, and bulk delete state
  const [competitorSearchTerm, setCompetitorSearchTerm] = useState('');
  const [competitorCategoryFilter, setCompetitorCategoryFilter] = useState('');
  const [competitorPage, setCompetitorPage] = useState(1);
  const [competitorPerPage] = useState(20);
  const [selectedCompetitorIds, setSelectedCompetitorIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [clientsData, keywordsData, competitorsData, categoriesData] = await Promise.all([
      api.getClients(),
      api.getGlobalKeywords(),
      api.getCompetitors(),
      api.getCategories(),
    ]);
    setClients(clientsData);
    setGlobalKeywords(keywordsData);
    setCompetitors(competitorsData);
    setCategories(categoriesData);
    setLoading(false);
  };

  const handleSeedDemoClient = async () => {
    setLoading(true);
    toast.loading('Creating demo client "Geter Done 2"...');
    
    try {
      const result = await api.seedDemoClient();
      
      if (result.success) {
        toast.dismiss();
        toast.success(result.message || 'Demo client created successfully!');
        
        // Wait a moment for the database to commit, then reload
        setTimeout(async () => {
          await loadData();
          toast.success('✅ Client data refreshed. Check the Clients tab!');
        }, 1000);
      } else {
        toast.dismiss();
        toast.error(result.message || 'Failed to create demo client');
        console.error('Seed error:', result);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Error creating demo client');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client operations
  const handleAddClient = async () => {
    setLoading(true);
    const result = await api.createClient({
      businessName: clientForm.businessName,
      area: clientForm.area,
      location: clientForm.location,
      category: clientForm.category,
      phoneNumber: clientForm.phoneNumber,
      keywordIds: clientForm.selectedKeywordIds,
      websiteUrl: clientForm.websiteUrl,
    });

    if (result.success) {
      await loadData();
      setShowClientForm(false);
      setClientForm({
        businessName: '',
        websiteUrl: '',
        area: '',
        location: '',
        category: '',
        phoneNumber: '',
        selectedKeywordIds: [],
      });
      toast.success('Client added successfully!');
    } else {
      toast.error(result.message || 'Failed to add client.');
    }
    setLoading(false);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    setLoading(true);
    await api.deleteClient(id);
    await loadData();
    setLoading(false);
    toast.success('Client deleted successfully!');
  };

  const handleEditClient = async (client: Client) => {
    setEditingClientId(client.id);
    setLoading(true);
    
    try {
      // Fetch comprehensive client data
      const comprehensiveData = await api.getComprehensiveClient(client.id);
      
      if (comprehensiveData) {
        // Transform the data for the comprehensive form
        const keywordIds = comprehensiveData.keywords?.map((kw: any) => kw.keyword_id) || [];
        
        // Build keywordCpcOverrides from client_keywords data
        const keywordCpcOverrides: { [key: string]: number } = {};
        comprehensiveData.keywords?.forEach((kw: any) => {
          if (kw.cpc !== undefined) {
            keywordCpcOverrides[kw.keyword_id] = kw.cpc;
          }
        });
        
        setEditingClientData({
          businessName: client.business_name,
          area: client.area,
          location: client.location,
          category: client.category,
          phoneNumber: client.phone_number || '',
          address: client.website_url || '',
          gbpScore: client.gbp_score || 85,
          avgJobPrice: client.avg_job_price,
          manualTop3Count: client.manual_top3_count,
          manualTop10Count: client.manual_top10_count,
          competitor1Name: client.competitor_1_name,
          competitor2Name: client.competitor_2_name,
          competitor3Name: client.competitor_3_name,
          serviceAreas: comprehensiveData.service_areas || [],
          selectedKeywordIds: keywordIds,
          keywordCpcOverrides: keywordCpcOverrides,
          analyticsMetrics: comprehensiveData.analytics || [],
          deviceKeywordData: comprehensiveData.device_keyword_data || [],
          devicePerformance: comprehensiveData.device_performance || null,
          seoData: comprehensiveData.seo_data || null,
          socialMedia: comprehensiveData.social_media || [],
          demographics: comprehensiveData.demographics?.age_groups || [],
          genderFemalePercentage: comprehensiveData.demographics?.gender_female_percentage || 50,
          genderMalePercentage: comprehensiveData.demographics?.gender_male_percentage || 50,
        });
        
        setShowComprehensiveForm(true);
      }
    } catch (error) {
      console.error('Error loading client data:', error);
      toast.error('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClientId) return;
    setLoading(true);
    const result = await api.updateClient(editingClientId, {
      businessName: clientForm.businessName,
      area: clientForm.area,
      location: clientForm.location,
      category: clientForm.category,
      phoneNumber: clientForm.phoneNumber,
    });

    if (result) {
      await loadData();
      setShowClientForm(false);
      setEditingClientId(null);
      setClientForm({
        businessName: '',
        websiteUrl: '',
        area: '',
        location: '',
        category: '',
        phoneNumber: '',
        selectedKeywordIds: [],
      });
      toast.success('Client updated successfully!');
    } else {
      toast.error('Failed to update client.');
    }
    setLoading(false);
  };

  const handleCancelClientEdit = () => {
    setEditingClientId(null);
    setClientForm({
      businessName: '',
      websiteUrl: '',
      area: '',
      location: '',
      category: '',
      phoneNumber: '',
      selectedKeywordIds: [],
    });
    setShowClientForm(false);
  };

  // Keyword operations
  const handleDeleteKeyword = async (id: string) => {
    if (!confirm('Are you sure you want to delete this keyword?')) return;
    setLoading(true);
    await api.deleteGlobalKeyword(id);
    await loadData();
    setLoading(false);
    toast.success('Keyword deleted successfully!');
  };

  const handleBulkDeleteKeywords = async (ids: string[]) => {
    setLoading(true);
    const result = await api.bulkDeleteGlobalKeywords(ids);
    if (result.success) {
      await loadData();
      toast.success(result.message || `${result.count} keyword(s) deleted successfully!`);
      return true;
    } else {
      toast.error(result.message || 'Failed to delete keywords');
      setLoading(false);
      return false;
    }
  };

  const handleAddKeyword = async () => {
    setLoading(true);
    const result = await api.addGlobalKeyword({
      keyword: keywordForm.keyword,
      category: keywordForm.category,
      searchVolume: keywordForm.searchVolume,
      competition: keywordForm.competition,
      cpc: keywordForm.cpc,
      competitor1: keywordForm.competitor1,
      competitor2: keywordForm.competitor2,
      competitor3: keywordForm.competitor3,
    });

    if (result.success) {
      await loadData();
      setShowKeywordForm(false);
      setKeywordForm({
        keyword: '',
        category: '',
        searchVolume: 0,
        competition: 'medium',
        cpc: 0,
        competitor1: null,
        competitor2: null,
        competitor3: null,
      });
      toast.success('Keyword added successfully!');
    } else {
      toast.error(result.message || 'Failed to add keyword.');
    }
    setLoading(false);
  };

  const handleEditKeyword = (kw: GlobalKeyword) => {
    setEditingKeywordId(kw.id);
    setKeywordForm({
      keyword: kw.keyword,
      category: kw.category || '',
      searchVolume: kw.search_volume,
      competition: kw.competition,
      cpc: kw.cpc,
      competitor1: (kw as any).competitor_1 || null,
      competitor2: (kw as any).competitor_2 || null,
      competitor3: (kw as any).competitor_3 || null,
    });
    setShowKeywordForm(true);
  };

  const handleUpdateKeyword = async () => {
    if (!editingKeywordId) return;
    setLoading(true);
    const result = await api.updateGlobalKeyword(editingKeywordId, {
      keyword: keywordForm.keyword,
      category: keywordForm.category,
      searchVolume: keywordForm.searchVolume,
      competition: keywordForm.competition,
      cpc: keywordForm.cpc,
      competitor1: keywordForm.competitor1,
      competitor2: keywordForm.competitor2,
      competitor3: keywordForm.competitor3,
    });

    if (result.success) {
      await loadData();
      setShowKeywordForm(false);
      setEditingKeywordId(null);
      setKeywordForm({
        keyword: '',
        category: '',
        searchVolume: 0,
        competition: 'medium',
        cpc: 0,
        competitor1: null,
        competitor2: null,
        competitor3: null,
      });
      toast.success('Keyword updated successfully!');
    } else {
      toast.error(result.message || 'Failed to update keyword.');
    }
    setLoading(false);
  };

  const handleCancelKeywordEdit = () => {
    setEditingKeywordId(null);
    setKeywordForm({
      keyword: '',
      category: '',
      searchVolume: 0,
      competition: 'medium',
      cpc: 0,
    });
    setShowKeywordForm(false);
  };

  // Competitor operations
  const handleDeleteCompetitor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competitor?')) return;
    setLoading(true);
    await api.deleteCompetitor(id);
    await loadData();
    setLoading(false);
    toast.success('Competitor deleted successfully!');
  };

  const handleAddCompetitor = async () => {
    setLoading(true);
    const result = await api.createCompetitor({
      competitorName: competitorForm.competitorName,
      area: competitorForm.area,
      category: competitorForm.category,
      clientId: competitorForm.clientId,
      keywordIds: competitorForm.selectedKeywordIds,
    });

    if (result.success) {
      await loadData();
      setShowCompetitorForm(false);
      setCompetitorForm({
        competitorName: '',
        area: '',
        category: '',
        clientId: '',
        selectedKeywordIds: [],
      });
      toast.success('Competitor added successfully!');
    } else {
      toast.error('Failed to add competitor.');
    }
    setLoading(false);
  };

  const handleEditCompetitor = (comp: Competitor) => {
    setEditingCompetitorId(comp.id);
    const keywordIds = comp.competitor_keywords?.map((ck: any) => ck.keyword_id) || [];
    
    setCompetitorForm({
      competitorName: comp.competitor_name,
      area: comp.area,
      category: comp.category || '',
      clientId: comp.client_id || '',
      selectedKeywordIds: keywordIds,
    });
    setShowCompetitorForm(true);
  };

  const handleUpdateCompetitor = async () => {
    if (!editingCompetitorId) return;
    setLoading(true);
    const result = await api.updateCompetitor(editingCompetitorId, {
      competitorName: competitorForm.competitorName,
      area: competitorForm.area,
      category: competitorForm.category,
      keywordIds: competitorForm.selectedKeywordIds,
    });

    if (result.success) {
      await loadData();
      setShowCompetitorForm(false);
      setEditingCompetitorId(null);
      setCompetitorForm({
        competitorName: '',
        area: '',
        category: '',
        clientId: '',
        selectedKeywordIds: [],
      });
      toast.success('Competitor updated successfully!');
    } else {
      toast.error(result.message || 'Failed to update competitor.');
    }
    setLoading(false);
  };

  const handleCancelCompetitorEdit = () => {
    setEditingCompetitorId(null);
    setCompetitorForm({
      competitorName: '',
      area: '',
      category: '',
      clientId: '',
      selectedKeywordIds: [],
    });
    setShowCompetitorForm(false);
  };

  const toggleKeywordSelection = (
    keywordId: string,
    selectedIds: string[],
    setSelectedIds: (ids: string[]) => void
  ) => {
    if (selectedIds.includes(keywordId)) {
      setSelectedIds(selectedIds.filter(id => id !== keywordId));
    } else {
      setSelectedIds([...selectedIds, keywordId]);
    }
  };

  // Bulk import handlers
  const handleBulkImportClients = async (data: any[]) => {
    try {
      const result = await api.bulkImportClients(data);
      if (result.success) {
        await loadData();
        await refreshClients(); // Refresh MainApp data
        toast.success('Clients imported successfully!');
      } else {
        toast.error(result.message || 'Failed to import clients.');
      }
      return result;
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error('Failed to import data.');
      return { success: false, message: 'Failed to import data' };
    }
  };

  const handleBulkImportKeywords = async (data: any[]) => {
    try {
      const result = await api.bulkImportKeywords(data);
      if (result.success) {
        await loadData(); // Reload admin panel data
        await refreshClients(); // Refresh MainApp data
        toast.success('Keywords imported successfully!');
      } else {
        toast.error(result.message || 'Failed to import keywords.');
      }
      return result;
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error('Failed to import data.');
      return { success: false, message: 'Failed to import data' };
    }
  };

  const handleBulkImportCompetitors = async (data: any[]) => {
    try {
      const result = await api.bulkImportCompetitors(data);
      if (result.success) {
        await loadData();
        toast.success('Competitors imported successfully!');
      } else {
        toast.error(result.message || 'Failed to import competitors.');
      }
      return result;
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error('Failed to import data.');
      return { success: false, message: 'Failed to import data' };
    }
  };

  const handleBulkImportGlobalKeywords = async (data: any[]) => {
    try {
      const result = await api.bulkImportGlobalKeywords(data);
      if (result.success) {
        await loadData();
        toast.success('Global Keywords imported successfully!');
      } else {
        toast.error(result.message || 'Failed to import global keywords.');
      }
      return result;
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error('Failed to import data.');
      return { success: false, message: 'Failed to import data' };
    }
  };

  // Comprehensive client handler
  const handleComprehensiveSubmit = async (formData: any) => {
    setLoading(true);
    
    let result;
    if (editingClientId) {
      // Update existing client
      result = await api.updateComprehensiveClient(editingClientId, formData);
      
      if (result.success) {
        toast.success('Client updated successfully!');
        setShowComprehensiveForm(false);
        setEditingClientId(null);
        setEditingClientData(null);
        await loadData(); // Reload clients list
      } else {
        toast.error(result.message || 'Failed to update client');
      }
    } else {
      // Create new client
      result = await api.createComprehensiveClient(formData);
      
      if (result.success) {
        toast.success('Client created successfully with all data!');
        setShowComprehensiveForm(false);
        await loadData(); // Reload clients list
      } else {
        toast.error(result.message || 'Failed to create client');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F9FB' }}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#0052CC' }}>
                <Settings className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900">Admin Panel</h1>
                <p className="text-sm text-slate-500">Manage clients, keywords, and competitors</p>
              </div>
            </div>

            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Main App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-4 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 p-1">
            <TabsTrigger value="clients" className="gap-2 h-10">
              <Building className="size-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="keywords" className="gap-2 h-10">
              <Hash className="size-4" />
              <span className="hidden sm:inline">Global Keywords</span>
            </TabsTrigger>
            <TabsTrigger value="competitors" className="gap-2 h-10">
              <Target className="size-4" />
              <span className="hidden sm:inline">Competitors</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2 h-10">
              <Upload className="size-4" />
              <span className="hidden sm:inline">Bulk Import</span>
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-900">Client Management</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={loadData}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setShowClientForm(!showClientForm)}
                  className="gap-2"
                  style={{ backgroundColor: '#0052CC' }}
                >
                  <Plus className="size-4" />
                  Quick Add
                </Button>
                <Button
                  onClick={() => {
                    setEditingClientData(null); // Clear any previous data
                    setEditingClientId(null);
                    setShowComprehensiveForm(true);
                  }}
                  className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
                >
                  <Plus className="size-4" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs leading-tight">Comprehensive</span>
                  </div>
                </Button>
                <Button
                  onClick={handleSeedDemoClient}
                  className="gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Plus className="size-4" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs leading-tight">Demo Client</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Client Form */}
            {showClientForm && (
              <Card className="p-6 border-2" style={{ borderColor: '#0052CC' }}>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-slate-900" style={{ fontWeight: 600 }}>New Client</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowClientForm(false)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={clientForm.businessName}
                      onChange={(e) => setClientForm({ ...clientForm, businessName: e.target.value })}
                      placeholder="e.g., Hussain Business"
                    />
                  </div>

                  <div>
                    <Label htmlFor="area">Area *</Label>
                    <Input
                      id="area"
                      value={clientForm.area}
                      onChange={(e) => setClientForm({ ...clientForm, area: e.target.value })}
                      placeholder="e.g., Gulshan"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={clientForm.location}
                      onChange={(e) => setClientForm({ ...clientForm, location: e.target.value })}
                      placeholder="e.g., Karachi"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                      value={clientForm.category}
                      onChange={(e) => setClientForm({ ...clientForm, category: e.target.value })}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={clientForm.phoneNumber}
                      onChange={(e) => setClientForm({ ...clientForm, phoneNumber: e.target.value })}
                      placeholder="e.g., +92 300 1234567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      value={clientForm.websiteUrl}
                      onChange={(e) => setClientForm({ ...clientForm, websiteUrl: e.target.value })}
                      placeholder="e.g., https://example.com"
                    />
                  </div>
                </div>

                {/* Keyword Selection */}
                <div className="mb-4">
                  <Label>Assign Keywords{clientForm.category && ` (${clientForm.category})`}</Label>
                  <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {globalKeywords.length === 0 ? (
                      <p className="text-sm text-slate-400">No keywords available. Add global keywords first.</p>
                    ) : (() => {
                      // Filter keywords by selected category
                      const filteredKeywords = clientForm.category
                        ? globalKeywords.filter(kw => kw.category && kw.category.toLowerCase() === clientForm.category.toLowerCase())
                        : globalKeywords;
                      
                      if (filteredKeywords.length === 0) {
                        return (
                          <p className="text-sm text-slate-400">
                            No keywords available for category &quot;{clientForm.category}&quot;. Select a different category or add keywords for this category.
                          </p>
                        );
                      }
                      
                      return (
                        <div className="flex flex-wrap gap-2">
                          {filteredKeywords.map((kw) => (
                            <Badge
                              key={kw.id}
                              className="cursor-pointer px-3 py-1.5"
                              style={{
                                backgroundColor: clientForm.selectedKeywordIds.includes(kw.id) ? '#0052CC' : '#E2E8F0',
                                color: clientForm.selectedKeywordIds.includes(kw.id) ? 'white' : '#64748B',
                              }}
                              onClick={() => toggleKeywordSelection(
                                kw.id,
                                clientForm.selectedKeywordIds,
                                (ids) => setClientForm({ ...clientForm, selectedKeywordIds: ids })
                              )}
                            >
                              {kw.keyword}
                            </Badge>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingClientId ? handleUpdateClient : handleAddClient}
                    disabled={!clientForm.businessName || !clientForm.area || !clientForm.location || !clientForm.category || loading}
                    className="gap-2"
                    style={{ backgroundColor: '#00C47E' }}
                  >
                    <Save className="size-4" />
                    {editingClientId ? 'Update Client' : 'Save Client'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={editingClientId ? handleCancelClientEdit : () => setShowClientForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Clients List */}
            {loading && <p className="text-center text-slate-500">Loading...</p>}
            
            {!loading && clients.length === 0 && (
              <Card className="p-12 text-center">
                <Building className="size-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">No clients yet</p>
                <p className="text-sm text-slate-400">Click "Add Client" to create your first client</p>
              </Card>
            )}

            {!loading && clients.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client) => (
                  <Card key={client.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900 mb-1" style={{ fontWeight: 600 }}>
                          {client.business_name}
                        </h4>
                        <p className="text-sm text-slate-500">{client.area}, {client.location}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClient(client)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                        {client.category}
                      </Badge>

                      {client.phone_number && (
                        <p className="text-xs text-slate-500">📞 {client.phone_number}</p>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div 
                          className="text-center p-2 rounded"
                          style={{
                            backgroundColor: client.gbp_score < 50 ? '#FEE2E2' : client.gbp_score < 70 ? '#FEF3C7' : '#DCFCE7'
                          }}
                        >
                          <p 
                            className="text-xs"
                            style={{ color: client.gbp_score < 50 ? '#DC2626' : client.gbp_score < 70 ? '#D97706' : '#16A34A' }}
                          >
                            GBP Score
                          </p>
                          <p 
                            className="text-lg" 
                            style={{ 
                              fontWeight: 700,
                              color: client.gbp_score < 50 ? '#DC2626' : client.gbp_score < 70 ? '#D97706' : '#16A34A'
                            }}
                          >
                            {client.gbp_score}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <p className="text-xs text-red-600">Damage</p>
                          <p className="text-lg text-red-700" style={{ fontWeight: 700 }}>
                            {client.damage_score}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Global Keywords Tab */}
          <TabsContent value="keywords" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-900">Global Keywords Management</h3>
              <Button
                onClick={() => setShowKeywordForm(!showKeywordForm)}
                className="gap-2"
                style={{ backgroundColor: '#0052CC' }}
              >
                <Plus className="size-4" />
                Add Keyword
              </Button>
            </div>

            {/* Keyword Form */}
            {showKeywordForm && (
              <Dialog open={showKeywordForm} onOpenChange={setShowKeywordForm}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingKeywordId ? 'Edit Global Keyword' : 'New Global Keyword'}</DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div>
                      <Label htmlFor="keyword">Keyword *</Label>
                      <Input
                        id="keyword"
                        value={keywordForm.keyword}
                        onChange={(e) => setKeywordForm({ ...keywordForm, keyword: e.target.value })}
                        placeholder="e.g., plumber service"
                      />
                    </div>

                    <div>
                      <Label htmlFor="keywordCategory">Category</Label>
                      <Input
                        id="keywordCategory"
                        value={keywordForm.category}
                        onChange={(e) => setKeywordForm({ ...keywordForm, category: e.target.value })}
                        placeholder="e.g., Plumbing"
                      />
                    </div>

                    <div>
                      <Label htmlFor="searchVolume">Search Volume</Label>
                      <Input
                        id="searchVolume"
                        type="number"
                        value={keywordForm.searchVolume}
                        onChange={(e) => setKeywordForm({ ...keywordForm, searchVolume: parseInt(e.target.value) || 0 })}
                        placeholder="e.g., 1000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cpc">CPC ($)</Label>
                      <Input
                        id="cpc"
                        type="number"
                        step="0.01"
                        value={keywordForm.cpc}
                        onChange={(e) => setKeywordForm({ ...keywordForm, cpc: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 5.50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="competitor1">Competitor #1 Rank</Label>
                      <Input
                        id="competitor1"
                        type="number"
                        min="1"
                        max="100"
                        value={keywordForm.competitor1 || ''}
                        onChange={(e) => setKeywordForm({ ...keywordForm, competitor1: e.target.value === '' ? null : parseInt(e.target.value) || null })}
                        placeholder="e.g., 3"
                      />
                    </div>

                    <div>
                      <Label htmlFor="competitor2">Competitor #2 Rank</Label>
                      <Input
                        id="competitor2"
                        type="number"
                        min="1"
                        max="100"
                        value={keywordForm.competitor2 || ''}
                        onChange={(e) => setKeywordForm({ ...keywordForm, competitor2: e.target.value === '' ? null : parseInt(e.target.value) || null })}
                        placeholder="e.g., 5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="competitor3">Competitor #3 Rank</Label>
                      <Input
                        id="competitor3"
                        type="number"
                        min="1"
                        max="100"
                        value={keywordForm.competitor3 || ''}
                        onChange={(e) => setKeywordForm({ ...keywordForm, competitor3: e.target.value === '' ? null : parseInt(e.target.value) || null })}
                        placeholder="e.g., 8"
                      />
                    </div>
                  </div>

                  {/* Competitor Revenue Calculations */}
                  {(keywordForm.competitor1 || keywordForm.competitor2 || keywordForm.competitor3) && keywordForm.searchVolume > 0 && (
                    <div className="my-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="text-sm font-semibold mb-3 text-slate-700">Competitor Revenue Estimates</h4>
                      <p className="text-xs text-slate-500 mb-3">Based on 0.5% conversion rate and $500 avg job price</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {keywordForm.competitor1 && (
                          <div className="bg-white p-3 rounded border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-600">Competitor #1</span>
                              <Badge 
                                variant="secondary"
                                className="border text-xs"
                                style={{ 
                                  backgroundColor: keywordForm.competitor1 <= 3 ? '#00C47E20' : keywordForm.competitor1 <= 10 ? '#FFA50020' : '#FF3B3020',
                                  color: keywordForm.competitor1 <= 3 ? '#00C47E' : keywordForm.competitor1 <= 10 ? '#FFA500' : '#FF3B30',
                                  borderColor: keywordForm.competitor1 <= 3 ? '#00C47E' : keywordForm.competitor1 <= 10 ? '#FFA500' : '#FF3B30'
                                }}
                              >
                                Rank #{keywordForm.competitor1}
                              </Badge>
                            </div>
                            <p className="text-lg font-semibold" style={{ color: '#00C47E' }}>
                              ${(() => {
                                const getCTR = (rank: number) => {
                                  if (rank === 1) return 0.30;
                                  if (rank === 2) return 0.15;
                                  if (rank === 3) return 0.10;
                                  if (rank <= 10) return 0.05;
                                  return 0.02;
                                };
                                const ctr = getCTR(keywordForm.competitor1);
                                const clicks = keywordForm.searchVolume * ctr;
                                const conversions = clicks * 0.005;
                                const revenue = conversions * 500;
                                return Math.round(revenue).toLocaleString();
                              })()}
                            </p>
                            <p className="text-xs text-slate-500">per month</p>
                          </div>
                        )}
                        {keywordForm.competitor2 && (
                          <div className="bg-white p-3 rounded border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-600">Competitor #2</span>
                              <Badge 
                                variant="secondary"
                                className="border text-xs"
                                style={{ 
                                  backgroundColor: keywordForm.competitor2 <= 3 ? '#00C47E20' : keywordForm.competitor2 <= 10 ? '#FFA50020' : '#FF3B3020',
                                  color: keywordForm.competitor2 <= 3 ? '#00C47E' : keywordForm.competitor2 <= 10 ? '#FFA500' : '#FF3B30',
                                  borderColor: keywordForm.competitor2 <= 3 ? '#00C47E' : keywordForm.competitor2 <= 10 ? '#FFA500' : '#FF3B30'
                                }}
                              >
                                Rank #{keywordForm.competitor2}
                              </Badge>
                            </div>
                            <p className="text-lg font-semibold" style={{ color: '#00C47E' }}>
                              ${(() => {
                                const getCTR = (rank: number) => {
                                  if (rank === 1) return 0.30;
                                  if (rank === 2) return 0.15;
                                  if (rank === 3) return 0.10;
                                  if (rank <= 10) return 0.05;
                                  return 0.02;
                                };
                                const ctr = getCTR(keywordForm.competitor2);
                                const clicks = keywordForm.searchVolume * ctr;
                                const conversions = clicks * 0.005;
                                const revenue = conversions * 500;
                                return Math.round(revenue).toLocaleString();
                              })()}
                            </p>
                            <p className="text-xs text-slate-500">per month</p>
                          </div>
                        )}
                        {keywordForm.competitor3 && (
                          <div className="bg-white p-3 rounded border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-600">Competitor #3</span>
                              <Badge 
                                variant="secondary"
                                className="border text-xs"
                                style={{ 
                                  backgroundColor: keywordForm.competitor3 <= 3 ? '#00C47E20' : keywordForm.competitor3 <= 10 ? '#FFA50020' : '#FF3B3020',
                                  color: keywordForm.competitor3 <= 3 ? '#00C47E' : keywordForm.competitor3 <= 10 ? '#FFA500' : '#FF3B30',
                                  borderColor: keywordForm.competitor3 <= 3 ? '#00C47E' : keywordForm.competitor3 <= 10 ? '#FFA500' : '#FF3B30'
                                }}
                              >
                                Rank #{keywordForm.competitor3}
                              </Badge>
                            </div>
                            <p className="text-lg font-semibold" style={{ color: '#00C47E' }}>
                              ${(() => {
                                const getCTR = (rank: number) => {
                                  if (rank === 1) return 0.30;
                                  if (rank === 2) return 0.15;
                                  if (rank === 3) return 0.10;
                                  if (rank <= 10) return 0.05;
                                  return 0.02;
                                };
                                const ctr = getCTR(keywordForm.competitor3);
                                const clicks = keywordForm.searchVolume * ctr;
                                const conversions = clicks * 0.005;
                                const revenue = conversions * 500;
                                return Math.round(revenue).toLocaleString();
                              })()}
                            </p>
                            <p className="text-xs text-slate-500">per month</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={editingKeywordId ? handleCancelKeywordEdit : () => setShowKeywordForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={editingKeywordId ? handleUpdateKeyword : handleAddKeyword}
                      disabled={!keywordForm.keyword || loading}
                      className="gap-2"
                      style={{ backgroundColor: '#00C47E' }}
                    >
                      <Save className="size-4" />
                      {editingKeywordId ? 'Update Keyword' : 'Save Keyword'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Keywords List with Search, Filters, Pagination */}
            <KeywordsManagement
              globalKeywords={globalKeywords}
              onEdit={handleEditKeyword}
              onDelete={handleDeleteKeyword}
              onBulkDelete={handleBulkDeleteKeywords}
              loading={loading}
            />
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-900">Competitor Management</h3>
              <Button
                onClick={() => setShowCompetitorForm(!showCompetitorForm)}
                className="gap-2"
                style={{ backgroundColor: '#0052CC' }}
              >
                <Plus className="size-4" />
                Add Competitor
              </Button>
            </div>

            {/* Competitor Form */}
            {showCompetitorForm && (
              <Card className="p-6 border-2" style={{ borderColor: '#0052CC' }}>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-slate-900" style={{ fontWeight: 600 }}>New Competitor</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCompetitorForm(false)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="competitorName">Competitor Name *</Label>
                    <Input
                      id="competitorName"
                      value={competitorForm.competitorName}
                      onChange={(e) => setCompetitorForm({ ...competitorForm, competitorName: e.target.value })}
                      placeholder="e.g., Fahid Plumbing"
                    />
                  </div>

                  <div>
                    <Label htmlFor="competitorArea">Area *</Label>
                    <Input
                      id="competitorArea"
                      value={competitorForm.area}
                      onChange={(e) => setCompetitorForm({ ...competitorForm, area: e.target.value })}
                      placeholder="e.g., Gulshan"
                    />
                  </div>

                  <div>
                    <Label htmlFor="competitorCategory">Category</Label>
                    <Input
                      id="competitorCategory"
                      value={competitorForm.category}
                      onChange={(e) => setCompetitorForm({ ...competitorForm, category: e.target.value })}
                      placeholder="e.g., Plumbing"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientIdSelect">Associate with Client</Label>
                    <select
                      id="clientIdSelect"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                      value={competitorForm.clientId}
                      onChange={(e) => setCompetitorForm({ ...competitorForm, clientId: e.target.value })}
                    >
                      <option value="">-- None --</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.business_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Keyword Selection */}
                <div className="mb-4">
                  <Label>Assign Keywords{competitorForm.category && ` (${competitorForm.category})`}</Label>
                  <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {globalKeywords.length === 0 ? (
                      <p className="text-sm text-slate-400">No keywords available. Add global keywords first.</p>
                    ) : (() => {
                      // Filter keywords by selected category
                      const filteredKeywords = competitorForm.category
                        ? globalKeywords.filter(kw => kw.category && kw.category.toLowerCase() === competitorForm.category.toLowerCase())
                        : globalKeywords;
                      
                      if (filteredKeywords.length === 0 && competitorForm.category) {
                        return (
                          <p className="text-sm text-slate-400">
                            No keywords available for category &quot;{competitorForm.category}&quot;. Select a different category or add keywords for this category.
                          </p>
                        );
                      }
                      
                      return (
                        <div className="flex flex-wrap gap-2">
                          {filteredKeywords.map((kw) => (
                            <Badge
                              key={kw.id}
                              className="cursor-pointer px-3 py-1.5"
                              style={{
                                backgroundColor: competitorForm.selectedKeywordIds.includes(kw.id) ? '#FF3B30' : '#E2E8F0',
                                color: competitorForm.selectedKeywordIds.includes(kw.id) ? 'white' : '#64748B',
                              }}
                              onClick={() => toggleKeywordSelection(
                                kw.id,
                                competitorForm.selectedKeywordIds,
                                (ids) => setCompetitorForm({ ...competitorForm, selectedKeywordIds: ids })
                              )}
                            >
                              {kw.keyword}
                            </Badge>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingCompetitorId ? handleUpdateCompetitor : handleAddCompetitor}
                    disabled={!competitorForm.competitorName || !competitorForm.area || loading}
                    className="gap-2"
                    style={{ backgroundColor: '#00C47E' }}
                  >
                    <Save className="size-4" />
                    {editingCompetitorId ? 'Update Competitor' : 'Save Competitor'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={editingCompetitorId ? handleCancelCompetitorEdit : () => setShowCompetitorForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Competitors List with Search, Filters, Pagination */}
            <CompetitorsManagement
              competitors={competitors}
              onEdit={handleEditCompetitor}
              onDelete={handleDeleteCompetitor}
              loading={loading}
            />
          </TabsContent>

          {/* Bulk Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-slate-900 mb-2">Bulk Import Data</h3>
              <p className="text-sm text-slate-500">
                Import large datasets using Excel files with pre-filled examples. After successful import, switch to other tabs to view your data.
              </p>
            </div>

            {/* Clients Import */}
            <ExcelImport
              type="clients"
              onImport={handleBulkImportClients}
            />

            {/* Keywords Import */}
            <ExcelImport
              type="keywords"
              onImport={handleBulkImportKeywords}
            />

            {/* Competitors Import */}
            <ExcelImport
              type="competitors"
              onImport={handleBulkImportCompetitors}
            />

            {/* Global Keywords Import */}
            <ExcelImport
              type="global_keywords"
              onImport={handleBulkImportGlobalKeywords}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Comprehensive Client Form Modal */}
      {showComprehensiveForm && (
        <ComprehensiveClientForm
          globalKeywords={globalKeywords}
          onSubmit={handleComprehensiveSubmit}
          onCancel={() => {
            setShowComprehensiveForm(false);
            setEditingClientData(null);
            setEditingClientId(null);
          }}
          initialData={editingClientData}
        />
      )}

      {/* Footer - Database Management */}
      <footer className="bg-white border-t border-slate-200 mt-12" style={{ backgroundColor: '#FFDD00' }}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h4 className="text-slate-900 mb-1 flex items-center gap-2" style={{ fontWeight: 700 }}>
                <Database className="size-5" />
                Database Management
              </h4>
              <p className="text-sm text-slate-700">
                Manually seed keywords and demo client data
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={async () => {
                  setLoading(true);
                  toast.loading('Initializing database...');
                  try {
                    const result = await api.initializeDatabase();
                    toast.dismiss();
                    if (result.success) {
                      toast.success('Database initialized successfully!');
                    } else {
                      toast.error(result.message || 'Failed to initialize database');
                    }
                  } catch (error) {
                    toast.dismiss();
                    toast.error('Error initializing database');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Database className="size-4" />
                Initialize DB
              </Button>

              <Button
                onClick={async () => {
                  setLoading(true);
                  toast.loading('Seeding keywords...');
                  try {
                    const result = await api.seedKeywords();
                    toast.dismiss();
                    if (result.success) {
                      toast.success(`${result.message}`);
                      await loadData();
                    } else {
                      toast.error(result.message || 'Failed to seed keywords');
                    }
                  } catch (error) {
                    toast.dismiss();
                    toast.error('Error seeding keywords');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Zap className="size-4" />
                Seed Keywords (47)
              </Button>

              <Button
                onClick={handleSeedDemoClient}
                disabled={loading}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="size-4" />
                Create Demo Client
              </Button>

              <Button
                onClick={async () => {
                  setLoading(true);
                  toast.loading('Reloading schema...');
                  try {
                    const result = await api.reloadSchema();
                    toast.dismiss();
                    if (result.success) {
                      toast.success('Schema reloaded successfully!');
                    } else {
                      toast.error(result.message || 'Failed to reload schema');
                    }
                  } catch (error) {
                    toast.dismiss();
                    toast.error('Error reloading schema');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <RefreshCw className="size-4" />
                Reload Schema
              </Button>

              <Button
                onClick={loadData}
                disabled={loading}
                variant="outline"
                className="gap-2 border-slate-900 text-slate-900 hover:bg-slate-100"
              >
                <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-300">
            <p className="text-xs text-slate-700 text-center">
              Total: <span style={{ fontWeight: 600 }}>{clients.length}</span> Clients | 
              <span style={{ fontWeight: 600 }}> {globalKeywords.length}</span> Keywords | 
              <span style={{ fontWeight: 600 }}> {competitors.length}</span> Competitors
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}