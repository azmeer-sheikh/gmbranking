import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, BarChart3, Search, Building2, Star, Hash, TrendingUp, Wrench, FileSearch, Share2, CheckCircle, AlertTriangle, Globe, Facebook, Instagram, Twitter, Linkedin, ThumbsUp, MessageCircle, Users, Calendar, X, Loader2, Settings, DollarSign, Phone, Percent, Lock, ArrowRight, LogOut } from 'lucide-react';
import MapView from '../components/MapView';
import GoogleMapView from '../components/GoogleMapView';
import KeywordsView from '../components/KeywordsView';
import AnalyticsView from '../components/AnalyticsView';
import SeasonalCampaignPlanner from '../components/SeasonalCampaignPlanner';
import MobileDesktopSplit from '../components/MobileDesktopSplit';

import { businessCategories, getCategoryById } from '../lib/business-categories';
import { generateKeywordsForCategory } from '../lib/sample-data';
import { calculateCustomerRevenueLoss } from '../lib/competitor-data';
import { useClient } from '../context/ClientContext';
import type { Keyword } from '../lib/types';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const logoImage = 'https://hivetechsol.com/wp-content/uploads/2025/02/Hive-Tech-Logo-Black-e1727446783577-removebg-preview.webp';

export default function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [selectedCategory, setSelectedCategory] = useState('junk_removal');
  const [keywords, setKeywords] = useState(generateKeywordsForCategory('junk_removal', 'loc1'));
  const [categories, setCategories] = useState(businessCategories);
  const [categorySearch, setCategorySearch] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Profit Simulator state
  const [avgCustomerValue, setAvgCustomerValue] = useState(500);
  const [closingRate, setClosingRate] = useState(20);
  
  // Use ClientContext for all client-related state
  const {
    clients,
    selectedClientId,
    selectedClient,
    selectedClientData,
    selectedClientServiceAreas,
    loading,
    dbInitialized,
    searchQuery,
    searchResults,
    showSearchResults,
    isSearching,
    handleSearchChange,
    handleSelectBusiness,
    handleClearSearch,
    selectedLocation,
    setSelectedLocation,
    locations,
    filteredClients,
  } = useClient();
  
  const category = getCategoryById(selectedCategory);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-dc7dce20/categories${categorySearch ? `?search=${encodeURIComponent(categorySearch)}` : ''}`,
          {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          }
        );
        const data = await response.json();
        if (data.categories) {
          // Transform database format to frontend format
          const transformedCategories = data.categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            avgJobValue: cat.avg_job_value,
            conversionRate: cat.conversion_rate,
            description: ''
          }));
          setCategories(transformedCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Keep using hardcoded categories as fallback
      } finally {
        setLoadingCategories(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [categorySearch]);

  // Load client data and update keywords when client changes
  useEffect(() => {
    if (selectedClientData && selectedClientData.keywords.length > 0) {
      // Convert database keywords to Keyword format
      const clientKeywords: Keyword[] = selectedClientData.keywords.map(kw => {
        // Prioritize client_keywords table for competitor ranks, then fall back to global_keywords
        const comp1 = kw.competitor_1 ?? kw.global_keywords?.competitor_1 ?? undefined;
        const comp2 = kw.competitor_2 ?? kw.global_keywords?.competitor_2 ?? undefined;
        const comp3 = kw.competitor_3 ?? kw.global_keywords?.competitor_3 ?? undefined;
        
        // Debug log to see what we're getting from the database
        console.log('🔍 Keyword mapping debug:', {
          keyword: kw.global_keywords?.keyword || kw.keyword_id,
          from_client_keywords: { comp1: kw.competitor_1, comp2: kw.competitor_2, comp3: kw.competitor_3 },
          from_global_keywords: { 
            comp1: kw.global_keywords?.competitor_1, 
            comp2: kw.global_keywords?.competitor_2, 
            comp3: kw.global_keywords?.competitor_3 
          },
          final: { comp1, comp2, comp3 }
        });
        
        return {
          id: kw.id,
          keyword: kw.global_keywords?.keyword || kw.keyword_id,
          locationId: selectedClientData.client.area || 'loc1',
          searchVolume: kw.global_keywords?.search_volume || kw.search_volume,
          currentRank: kw.current_rank,
          targetRank: kw.target_rank || 1, // Add target rank with fallback
          previousRank: kw.current_rank + 2,
          cpc: kw.global_keywords?.cpc || kw.cpc || 0,
          difficulty: 50,
          category: kw.category || selectedClientData.client.category || selectedCategory,
          // Use competitor ranks from client_keywords table (primary) or global_keywords table (fallback)
          competitor1Rank: comp1,
          competitor2Rank: comp2,
          competitor3Rank: comp3,
        };
      });
      setKeywords(clientKeywords);
      
      // Update category to match client's category
      if (selectedClientData.client.category) {
        setSelectedCategory(selectedClientData.client.category);
      }
    }  
  }, [selectedClientData]);
  
  // Calculate total revenue loss for header
  const calculateTotalRevenueLoss = () => {
    // Use client's avg_job_price if available
    const avgJobPrice = selectedClient?.avg_job_price || 0;
    if (!avgJobPrice) return 0;
    
    let total = 0;
    keywords.forEach(kw => {
      // Use 0.5% conversion rate (same as Analytics and Map View)
      const potentialConversions = kw.searchVolume * 0.005;
      total += potentialConversions * avgJobPrice;
    });
    return total;
  };

  // Calculate average rank
  const calculateAverageRank = () => {
    if (selectedClientData && selectedClientData.keywords.length > 0) {
      const sum = selectedClientData.keywords.reduce((acc, kw) => acc + kw.current_rank, 0);
      return Math.round(sum / selectedClientData.keywords.length);
    }
    if (keywords.length === 0) return 0;
    const sum = keywords.reduce((acc, kw) => acc + kw.currentRank, 0);
    return Math.round(sum / keywords.length);
  };

  // Calculate yearly revenue potential
  const calculateYearlyRevenue = () => {
    return calculateTotalRevenueLoss() * 12;
  };

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    // Don't regenerate keywords if we have real client data
    if (!selectedClientData || selectedClientData.keywords.length === 0) {
      const newKeywords = generateKeywordsForCategory(newCategory, 'loc1');
      setKeywords(newKeywords);
    }
  };

  const totalKeywords = selectedClientData?.keywords.length || keywords.length;

  // Get GBP Score styling based on value
  const getGbpScoreStyle = (score: number) => {
    if (score >= 80) {
      return {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        iconColor: 'text-green-600',
        textColor: 'text-green-700'
      };
    } else if (score >= 65) {
      return {
        bg: 'from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-700'
      };
    } else {
      return {
        bg: 'from-red-50 to-rose-50',
        border: 'border-red-200',
        iconColor: 'text-red-600',
        textColor: 'text-red-700'
      };
    }
  };

  const gbpScore = selectedClient?.gbp_score || 54;
  const gbpStyle = getGbpScoreStyle(gbpScore);

  // Check if SEO data exists
  const hasSeoData = selectedClientData?.seo_data && Object.keys(selectedClientData.seo_data).length > 0;
  
  // Check if social media data exists
  const hasSocialData = selectedClientData?.social_media && selectedClientData.social_media.length > 0;

  // Handle login
  const handleLogin = (username: string, password: string) => {
    setIsAuthenticated(true);
    setAuthenticatedUser(username);
    // Store in localStorage to persist session
    localStorage.setItem('hiverecap_auth', JSON.stringify({ username, timestamp: Date.now() }));
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthenticatedUser(null);
    localStorage.removeItem('hiverecap_auth');
  };

  // Check authentication on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('hiverecap_auth');
    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        // Check if session is still valid (within 24 hours)
        if (Date.now() - auth.timestamp < 24 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
          setAuthenticatedUser(auth.username);
        } else {
          localStorage.removeItem('hiverecap_auth');
        }
      } catch (e) {
        localStorage.removeItem('hiverecap_auth');
      }
    }
  }, []);


  return (
    <div className="min-h-screen bg-white">
      {/* Executive Audit Header - Bank Statement Style */}
      <header className="bg-white border-b-2 border-slate-300 py-6 px-8">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-center justify-between">
            {/* Left: Logo + Confidential Badge */}
            <div className="flex items-center gap-4">
              <img 
                src={logoImage} 
                alt="Hive Recap" 
                className="h-12"
              />
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 px-4 py-1.5 text-xs uppercase tracking-wider border border-slate-300">
                Financial Audit Report
              </Badge>
            </div>
            
            {/* Right: Prepared For + Date + Logout */}
            <div className="flex items-center gap-6">
              <div className="text-right font-mono">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Prepared For</p>
                <p className="text-lg font-semibold text-slate-900">{selectedClient?.business_name || 'Select a Business'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Report Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              {/* Logout Section */}
              <div className="pl-6 border-l border-slate-300 flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Logged In As</p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">{authenticatedUser}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Client Selector Bar */}
      <div className="bg-slate-50 border-b border-slate-200 py-4 px-8">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-center gap-4">
            {/* Search/Select Client */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search business name..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-10 bg-white border-slate-300"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
                >
                  <X className="size-4 text-slate-500" />
                </button>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 shadow-2xl border-2">
                  {searchResults.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => handleSelectBusiness(client)}
                      className="w-full p-3 text-left hover:bg-slate-50 border-b last:border-b-0 transition-colors"
                    >
                      <p className="font-semibold text-slate-900">{client.business_name}</p>
                      {client.category_name && (
                        <p className="text-xs text-slate-500 mt-0.5">{client.category_name}</p>
                      )}
                    </button>
                  ))}
                </Card>
              )}
            </div>
            
            {/* Admin Link */}
            {/* <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="size-4" />
                Admin Panel
              </Button>
            </Link> */}
          </div>
        </div>
      </div>

      {/* Control Panel - Business Category & Search */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
            {/* Business Category */}
            <div className="lg:col-span-3">
              <label className="block text-xs uppercase tracking-wider text-slate-600 mb-2.5" style={{ fontWeight: 600 }}>
                Business Category
              </label>
              <div className="relative">
                {loadingCategories && (
                  <Loader2 className="size-4 text-blue-500 absolute right-3 top-3.5 animate-spin" />
                )}
              </div>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {categories.length === 0 && (
                    <div className="px-2 py-6 text-center text-sm text-slate-500">
                      No categories found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Business Search */}
            <div className="lg:col-span-6 relative">
              <label className="block text-xs uppercase tracking-wider text-slate-600 mb-2.5" style={{ fontWeight: 600 }}>
                Search Business
              </label>
              <div className="relative">
                {isSearching ? (
                  <Loader2 className="size-4 text-blue-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none animate-spin" />
                ) : (
                  <Search className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
                <Input
                  type="text"
                  placeholder={selectedClientId ? "Search to switch businesses..." : "Start typing to search businesses..."}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchQuery) {
                      // Re-trigger search when focusing with existing query
                      handleSearchChange(searchQuery);
                    }
                  }}
                  className="pl-11 pr-10 h-11 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors"
                  disabled={loading}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Clear search"
                  >
                    <X className="size-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xl max-h-[32rem] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchResults.length > 0 ? (
                    <>
                      {/* Results Header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-100 sticky top-0">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#0052CC' }}>
                            <Building2 className="size-3.5 text-white" />
                          </div>
                          <p className="text-sm" style={{ fontWeight: 700, color: '#0052CC' }}>
                            {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''} Found
                          </p>
                        </div>
                        <button
                          onClick={() => setShowSearchResults(false)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Close"
                        >
                          <X className="size-4 text-slate-500 hover:text-slate-700" />
                        </button>
                      </div>
                      
                      {/* Results List */}
                      <div className="overflow-y-auto max-h-[28rem] p-2">
                        {searchResults.map((client) => {
                          // Calculate average rank for this client
                          const avgRank = client.avg_rank || 'N/A';
                          const rankColor = typeof avgRank === 'number' 
                            ? (avgRank <= 3 ? '#00C47E' : avgRank <= 10 ? '#FF9500' : '#FF3B30')
                            : '#94A3B8';
                          const isSelected = selectedClientId === client.id;
                          
                          return (
                            <button
                              key={client.id}
                              onClick={() => handleSelectBusiness(client)}
                              className={`w-full p-4 rounded-xl text-left transition-all border-2 mb-2 group ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-400 shadow-md' 
                                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 border-transparent hover:border-blue-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                {/* Business Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                                      <Building2 className="size-3.5" style={{ color: '#0052CC' }} />
                                    </div>
                                    <p className="text-sm truncate" style={{ fontWeight: 700, color: '#0052CC' }}>
                                      {client.business_name}
                                    </p>
                                    {isSelected && (
                                      <Badge className="bg-green-500 text-white text-[10px] px-2 py-0">
                                        ✓ Active
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                      <MapPin className="size-3.5" style={{ color: '#00C47E' }} />
                                      <span>{client.area}</span>
                                    </div>
                                    {client.category && (
                                      <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                        {client.category}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {client.address && (
                                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">{client.address}</p>
                                  )}
                                </div>
                                
                                {/* Rank Badge */}
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ backgroundColor: `${rankColor}15` }}>
                                    <TrendingUp className="size-3.5" style={{ color: rankColor }} />
                                    <span className="text-sm" style={{ fontWeight: 700, color: rankColor }}>
                                      #{avgRank}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-500">Avg Rank</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Search className="size-8 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>No businesses found</p>
                      <p className="text-xs text-slate-500 mt-1">Try searching with different keywords</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Business Metrics */}
            <div className="lg:col-span-3">
              {category && (
                <Card className="px-5 py-3 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-600">Avg Job</p>
                      <p className="text-base text-slate-900 mt-1" style={{ fontWeight: 600 }}>${category.avgJobValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-600">Conv Rate</p>
                      <p className="text-base text-slate-900 mt-1" style={{ fontWeight: 600 }}>{(category.conversionRate * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {selectedClient && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 border-b-2 border-yellow-700 shadow-lg">
          <div className="container mx-auto px-8 py-5">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-5">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                  <Building2 className="size-5.5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-95 mb-0.5" style={{ fontWeight: 600 }}>Active Client</p>
                  <p className="text-lg" style={{ fontWeight: 700 }}>{selectedClient.business_name}</p>
                </div>
                <div className="h-10 w-px bg-white/30 mx-1" />
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm">
                    <MapPin className="size-4" />
                    <span style={{ fontWeight: 600 }}>{selectedClient.area}</span>
                  </div>
                  {selectedClient.category && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm">
                      <Hash className="size-4" />
                      <span style={{ fontWeight: 600 }}>{selectedClient.category}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm">
                    <TrendingUp className="size-4" />
                    <span style={{ fontWeight: 600 }}>Rank: #{calculateAverageRank()}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleClearSearch}
                variant="outline"
                size="sm"
                className="gap-2 bg-white/20 border-white/40 text-white hover:bg-white/30 hover:border-white/60 h-10 px-5 backdrop-blur-sm shadow-lg transition-all hover:scale-105"
              >
                <X className="size-4" />
                View All Businesses
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-8 py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          {/* Advanced Tabs Navigation */}
          <div className="relative flex flex-col items-center py-6">
            {/* Decorative Top Element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full opacity-60" />
            
            <TabsList className="grid w-full max-w-7xl grid-cols-5 h-16 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 p-2.5 rounded-2xl shadow-xl relative">
              <TabsTrigger value="map" className="gap-2.5 h-full rounded-xl data-[state=active]:shadow-2xl">
                <MapPin className="size-5" />
                <span className="hidden sm:inline text-sm">Map View</span>
                <span className="sm:hidden text-sm">Map</span>
              </TabsTrigger>
              <TabsTrigger value="keywords" className="gap-2.5 h-full rounded-xl data-[state=active]:shadow-2xl">
                <Search className="size-5" />
                <span className="hidden sm:inline text-sm">Keywords</span>
                <span className="sm:hidden text-sm">KWs</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2.5 h-full rounded-xl data-[state=active]:shadow-2xl">
                <BarChart3 className="size-5" />
                <span className="hidden sm:inline text-sm">Analytics</span>
                <span className="sm:hidden text-sm">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-2.5 h-full rounded-xl data-[state=active]:shadow-2xl">
                <FileSearch className="size-5" />
                <span className="hidden sm:inline text-sm">SEO Analysis</span>
                <span className="sm:hidden text-sm">SEO</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-2.5 h-full rounded-xl data-[state=active]:shadow-2xl">
                <Share2 className="size-5" />
                <span className="hidden sm:inline text-sm">Social Media</span>
                <span className="sm:hidden text-sm">Social</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Keep GoogleMapView always mounted, show/hide with CSS to prevent removeChild errors */}
          <div 
            className="space-y-6" 
            style={{ 
              visibility: activeTab === 'map' ? 'visible' : 'hidden',
              height: activeTab === 'map' ? 'auto' : '0',
              overflow: 'hidden',
              position: activeTab === 'map' ? 'relative' : 'absolute',
              pointerEvents: activeTab === 'map' ? 'auto' : 'none'
            }}
          >
            <GoogleMapView 
              category={category} 
              keywords={keywords}
              clientLocation={selectedClient?.area}
              clientAddress={selectedClient?.address}
              avgJobPrice={selectedClient?.avg_job_price || undefined}
              manualGmbScore={selectedClient?.gbp_score}
              manualTop3Count={selectedClient?.manual_top3_count}
              manualTop10Count={selectedClient?.manual_top10_count}
              serviceAreas={selectedClientServiceAreas}
              competitor1Name={selectedClient?.competitor_1_name}
              competitor2Name={selectedClient?.competitor_2_name}
              competitor3Name={selectedClient?.competitor_3_name}
            />
          </div>

          {/* Profit Estimator Section */}
          <div 
            style={{ 
              visibility: activeTab === 'map' ? 'visible' : 'hidden',
              height: activeTab === 'map' ? 'auto' : '0',
              overflow: 'hidden',
              position: activeTab === 'map' ? 'relative' : 'absolute',
              pointerEvents: activeTab === 'map' ? 'auto' : 'none'
            }}
          >
            <Card className="overflow-hidden border-2 border-yellow-400 shadow-xl mb-10">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                    <DollarSign className="size-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Profit Estimator</h2>
                </div>
                <p className="text-white/90 text-sm">
                  Adjust your business metrics below to see your potential monthly revenue opportunity
                </p>
              </div>

              <div className="p-8">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* LEFT COLUMN - Static "Truth" Data */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="size-5 text-slate-400" />
                      <h3 className="text-lg font-semibold text-slate-900">Market Data (Locked)</h3>
                    </div>
                    
                    {/* Search Volume Card */}
                    <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Search className="size-5 text-slate-500" />
                          <span className="text-sm font-medium text-slate-600">Total Search Volume</span>
                        </div>
                        <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                          Scraped Data
                        </Badge>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">
                        {keywords.reduce((sum, kw) => sum + kw.searchVolume, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">searches per month</p>
                    </div>

                    {/* Current Rank Card */}
                    <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Hash className="size-5 text-slate-500" />
                          <span className="text-sm font-medium text-slate-600">Average Current Rank</span>
                        </div>
                        <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                          Scraped Data
                        </Badge>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">
                        #{(keywords.reduce((sum, kw) => sum + kw.currentRank, 0) / keywords.length).toFixed(1)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">across all keywords</p>
                    </div>

                    {/* Competitor Calls Card */}
                    <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="size-5 text-slate-500" />
                          <span className="text-sm font-medium text-slate-600">Competitor Leads (Top 3)</span>
                        </div>
                        <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                          Calculated
                        </Badge>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">
                        {(() => {
                          const totalVolume = keywords.reduce((sum, kw) => sum + kw.searchVolume, 0);
                          const estimatedCalls = Math.round(totalVolume * 0.03); // 3% CTR estimate
                          return estimatedCalls.toLocaleString();
                        })()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">calls per month (est. 3% CTR)</p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN - Interactive Sliders - DARK CONTROL PANEL */}
                  <div className="space-y-6">
                    <div className="control-panel-dark p-6 shadow-2xl">
                      <div className="flex items-center gap-2 mb-6">
                        <Settings className="size-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold text-white">Your Business Metrics</h3>
                      </div>

                      {/* Average Customer Value Slider */}
                      <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600 mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="size-5 text-yellow-400" />
                          <label className="text-sm font-semibold text-white">
                            What is a new customer worth to you?
                          </label>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl font-bold text-yellow-400 font-mono">
                              ${avgCustomerValue.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-300">per customer</span>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="100"
                          max="5000"
                          step="50"
                          value={avgCustomerValue}
                          onChange={(e) => setAvgCustomerValue(Number(e.target.value))}
                          className="w-full h-3 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${((avgCustomerValue - 100) / 4900) * 100}%, #475569 ${((avgCustomerValue - 100) / 4900) * 100}%, #475569 100%)`
                          }}
                        />
                        
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                          <span>$100</span>
                          <span>$5,000</span>
                        </div>
                      </div>

                      {/* Closing Rate Slider */}
                      <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600">
                        <div className="flex items-center gap-2 mb-3">
                          <Percent className="size-5 text-green-400" />
                          <label className="text-sm font-semibold text-white">
                            What % of calls do you close?
                          </label>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl font-bold text-green-400 font-mono">
                              {closingRate}%
                            </span>
                            <span className="text-sm text-slate-300">closing rate</span>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="5"
                          max="50"
                          step="1"
                          value={closingRate}
                          onChange={(e) => setClosingRate(Number(e.target.value))}
                          className="w-full h-3 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #00C47E 0%, #00C47E ${((closingRate - 5) / 45) * 100}%, #475569 ${((closingRate - 5) / 45) * 100}%, #475569 100%)`
                          }}
                        />
                        
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                          <span>5%</span>
                          <span>50%</span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Connection Arrow */}
                    <div className="flex items-center justify-center py-2">
                      <ArrowRight className="size-8 text-yellow-500 animate-pulse" strokeWidth={3} />
                    </div>
                  </div>
                </div>

                {/* Big Red Revenue Loss Number - MEDICAL REPORT STYLE */}
                <div className="audit-card p-8 relative overflow-hidden shadow-2xl">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-200/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-100/20 rounded-full blur-3xl -ml-24 -mb-24"></div>
                  
                  <div className="relative z-10">
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <AlertTriangle className="size-8 text-red-600" />
                        <p className="text-sm font-bold text-red-700 uppercase tracking-wider">
                          Monthly Revenue Opportunity
                        </p>
                        <AlertTriangle className="size-8 text-red-600" />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="audit-number text-6xl md:text-7xl text-red-600 mb-3">
                        ${(() => {
                          const totalVolume = keywords.reduce((sum, kw) => sum + kw.searchVolume, 0);
                          const estimatedCalls = Math.round(totalVolume * 0.03); // 3% CTR
                          const closedDeals = Math.round(estimatedCalls * (closingRate / 100));
                          const monthlyRevenue = closedDeals * avgCustomerValue;
                          return monthlyRevenue.toLocaleString();
                        })()}
                      </p>
                      
                      <div className="bg-white border-2 border-red-200 rounded-lg p-4 inline-block">
                        <p className="text-sm text-slate-700 mb-1 font-semibold">
                          Calculation Breakdown:
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-slate-600 font-mono">
                          <span>
                            {(() => {
                              const totalVolume = keywords.reduce((sum, kw) => sum + kw.searchVolume, 0);
                              const estimatedCalls = Math.round(totalVolume * 0.03);
                              return estimatedCalls.toLocaleString();
                            })()} calls
                          </span>
                          <span>×</span>
                          <span>{closingRate}% close rate</span>
                          <span>×</span>
                          <span>${avgCustomerValue.toLocaleString()} per customer</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-red-700 font-semibold">
                        ⚠️ This represents potential revenue currently being captured by competitors
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="mt-6 text-center">
                  <p className="text-slate-600 text-sm">
                    💡 <span className="font-semibold">Pro Tip:</span> The search volume and competitor data are real market facts. 
                    Your closing rate and customer value make this <span className="font-bold text-slate-900">YOUR personalized opportunity.</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <TabsContent value="keywords" className="space-y-6">
            <KeywordsView category={category} keywords={keywords} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsView 
              category={category} 
              keywords={keywords} 
              avgJobPrice={selectedClient?.avg_job_price || undefined}
            />
          </TabsContent>

          {/* SEO Analysis Tab */}
          <TabsContent value="seo" className="space-y-6">
            {!hasSeoData ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 rounded-full bg-slate-100 mb-4">
                    <FileSearch className="size-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl mb-2" style={{ fontWeight: 600, color: '#1e293b' }}>
                    No SEO Data Available
                  </h3>
                  <p className="text-slate-500 max-w-md">
                    SEO analysis data hasn't been added for this client yet.
                  </p>
                </div>
              </Card>
            ) : (
              <>
            {/* SEO Score Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-slate-900 mb-2">SEO Health Score</h3>
                  <p className="text-sm text-slate-500">Comprehensive analysis of your local SEO performance</p>
                </div>
                <div className="text-center px-6 py-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <p className="text-5xl mb-1" style={{ fontWeight: 700, color: '#00C47E' }}>87</p>
                  <p className="text-sm text-green-700">Overall Score</p>
                  <Badge className="mt-2 bg-green-600">Excellent</Badge>
                </div>
              </div>

              {/* SEO Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600">Technical SEO</p>
                    <CheckCircle className="size-4 text-green-600" />
                  </div>
                  <p className="text-2xl" style={{ fontWeight: 700, color: '#0052CC' }}>92/100</p>
                  <p className="text-xs text-slate-500 mt-1">Great performance</p>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600">On-Page SEO</p>
                    <CheckCircle className="size-4 text-green-600" />
                  </div>
                  <p className="text-2xl" style={{ fontWeight: 700, color: '#0052CC' }}>85/100</p>
                  <p className="text-xs text-slate-500 mt-1">Good optimization</p>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600">Local SEO</p>
                    <AlertTriangle className="size-4 text-yellow-600" />
                  </div>
                  <p className="text-2xl" style={{ fontWeight: 700, color: '#0052CC' }}>78/100</p>
                  <p className="text-xs text-slate-500 mt-1">Needs improvement</p>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600">Backlinks</p>
                    <CheckCircle className="size-4 text-green-600" />
                  </div>
                  <p className="text-2xl" style={{ fontWeight: 700, color: '#0052CC' }}>94/100</p>
                  <p className="text-xs text-slate-500 mt-1">Excellent authority</p>
                </div>
              </div>
            </Card>

            {/* Technical SEO Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#0052CC' }}>
                    <Globe className="size-4 text-white" />
                  </div>
                  <h3 className="text-slate-900">Technical Audit</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="size-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Mobile Responsive</p>
                      <p className="text-xs text-slate-600">Website is fully optimized for mobile devices</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="size-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Page Speed</p>
                      <p className="text-xs text-slate-600">Load time: 1.2s - Excellent performance</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <AlertTriangle className="size-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>SSL Certificate</p>
                      <p className="text-xs text-slate-600">Valid but expires in 30 days</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="size-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Sitemap</p>
                      <p className="text-xs text-slate-600">XML sitemap found and submitted</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="size-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Robots.txt</p>
                      <p className="text-xs text-slate-600">Properly configured</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#00C47E' }}>
                    <FileSearch className="size-4 text-white" />
                  </div>
                  <h3 className="text-slate-900">On-Page Optimization</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="size-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Meta Titles</p>
                      <p className="text-xs text-slate-600">All pages have unique, optimized titles</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="size-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Meta Descriptions</p>
                      <p className="text-xs text-slate-600">Compelling descriptions on all pages</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <AlertTriangle className="size-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Header Tags</p>
                      <p className="text-xs text-slate-600">5 pages missing proper H1 tags</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="size-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Image Alt Text</p>
                      <p className="text-xs text-slate-600">92% of images have descriptive alt text</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="size-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Internal Linking</p>
                      <p className="text-xs text-slate-600">Strong internal link structure</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Local SEO & Backlinks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-slate-900 mb-4">Local SEO Signals</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>NAP Consistency</p>
                      <p className="text-xs text-slate-600">Name, Address, Phone across directories</p>
                    </div>
                    <Badge className="bg-yellow-500">78%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Local Citations</p>
                      <p className="text-xs text-slate-600">Listed in 47 local directories</p>
                    </div>
                    <Badge className="bg-green-600">Good</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Google My Business</p>
                      <p className="text-xs text-slate-600">Profile complete and verified</p>
                    </div>
                    <Badge className="bg-green-600">100%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Reviews</p>
                      <p className="text-xs text-slate-600">4.7 stars from 234 reviews</p>
                    </div>
                    <Badge className="bg-green-600">Excellent</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-slate-900 mb-4">Backlink Profile</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-2xl" style={{ fontWeight: 700, color: '#0052CC' }}>342</p>
                      <p className="text-xs text-slate-600">Total Links</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-2xl text-green-700" style={{ fontWeight: 700 }}>67</p>
                      <p className="text-xs text-slate-600">Referring Domains</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <p className="text-2xl text-purple-700" style={{ fontWeight: 700 }}>58</p>
                      <p className="text-xs text-slate-600">Domain Authority</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">High Quality Links</span>
                      <span style={{ fontWeight: 600, color: '#0052CC' }}>89%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-600" style={{ width: '89%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Toxic Links</span>
                      <span style={{ fontWeight: 600, color: '#FF3B30' }}>3%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: '3%', backgroundColor: '#FF3B30' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Items */}
            <Card className="p-6 border-2" style={{ borderColor: '#0052CC' }}>
              <h3 className="text-slate-900 mb-4">Priority Action Items</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <AlertTriangle className="size-5 text-yellow-600" />
                  <div className="flex-1">
                    <p style={{ fontWeight: 600 }}>Fix NAP Inconsistencies</p>
                    <p className="text-sm text-slate-600">Update business address on 8 directory listings</p>
                  </div>
                  <Badge className="bg-yellow-500">High Priority</Badge>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <FileSearch className="size-5" style={{ color: '#0052CC' }} />
                  <div className="flex-1">
                    <p style={{ fontWeight: 600 }}>Add Missing H1 Tags</p>
                    <p className="text-sm text-slate-600">5 pages need proper header structure</p>
                  </div>
                  <Badge style={{ backgroundColor: '#0052CC' }}>Medium Priority</Badge>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="size-5 text-green-600" />
                  <div className="flex-1">
                    <p style={{ fontWeight: 600 }}>Renew SSL Certificate</p>
                    <p className="text-sm text-slate-600">Certificate expires in 30 days - renew soon</p>
                  </div>
                  <Badge className="bg-green-600">Low Priority</Badge>
                </div>
              </div>
            </Card>
            </>
            )}
          </TabsContent>

          {/* Social Media Presence Tab */}
          <TabsContent value="social" className="space-y-6">
            {!hasSocialData ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 rounded-full bg-slate-100 mb-4">
                    <Share2 className="size-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl mb-2" style={{ fontWeight: 600, color: '#1e293b' }}>
                    No Social Media Presence
                  </h3>
                  <p className="text-slate-500 max-w-md">
                    Social media data hasn't been added for this client yet.
                  </p>
                </div>
              </Card>
            ) : (
              <>
            {/* Social Overview */}
            <Card className="p-6">
              <h3 className="text-slate-900 mb-6">Social Media Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-600">
                      <Facebook className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Facebook</p>
                      <p style={{ fontWeight: 700, color: '#0052CC' }}>2,847</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Engagement</span>
                    <span className="text-green-600" style={{ fontWeight: 600 }}>+12.5%</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2 border-pink-200 bg-pink-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                      <Instagram className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Instagram</p>
                      <p style={{ fontWeight: 700, color: '#0052CC' }}>4,231</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Engagement</span>
                    <span className="text-green-600" style={{ fontWeight: 600 }}>+18.3%</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2 border-sky-200 bg-sky-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-sky-500">
                      <Twitter className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Twitter</p>
                      <p style={{ fontWeight: 700, color: '#0052CC' }}>1,563</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Engagement</span>
                    <span className="text-red-600" style={{ fontWeight: 600 }}>-3.2%</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2 border-blue-300 bg-blue-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-700">
                      <Linkedin className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">LinkedIn</p>
                      <p style={{ fontWeight: 700, color: '#0052CC' }}>892</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Engagement</span>
                    <span className="text-green-600" style={{ fontWeight: 600 }}>+7.8%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsUp className="size-5" style={{ color: '#0052CC' }} />
                  <h3 className="text-slate-900">Engagement Metrics (Last 30 Days)</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-600">Total Reach</p>
                      <TrendingUp className="size-4 text-green-600" />
                    </div>
                    <p className="text-3xl mb-1" style={{ fontWeight: 700, color: '#0052CC' }}>127,845</p>
                    <p className="text-xs text-green-600">+24% from last month</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">Likes</p>
                      <p className="text-xl" style={{ fontWeight: 700, color: '#0052CC' }}>3,247</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">Comments</p>
                      <p className="text-xl" style={{ fontWeight: 700, color: '#0052CC' }}>892</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">Shares</p>
                      <p className="text-xl" style={{ fontWeight: 700, color: '#0052CC' }}>456</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">Saves</p>
                      <p className="text-xl" style={{ fontWeight: 700, color: '#0052CC' }}>234</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-slate-600">Engagement Rate</span>
                      <span style={{ fontWeight: 600, color: '#00C47E' }}>6.8%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="size-5" style={{ color: '#0052CC' }} />
                  <h3 className="text-slate-900">Best Times to Post</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm" style={{ fontWeight: 600 }}>Peak Engagement Time</p>
                      <Badge className="bg-green-600">Best</Badge>
                    </div>
                    <p className="text-2xl mb-1" style={{ fontWeight: 700, color: '#00C47E' }}>2:00 PM - 4:00 PM</p>
                    <p className="text-xs text-slate-600">Tuesday & Thursday</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        <span className="text-sm">Monday 9-11 AM</span>
                      </div>
                      <span className="text-xs text-slate-600">Good</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        <span className="text-sm">Wednesday 2-4 PM</span>
                      </div>
                      <span className="text-xs text-slate-600">Excellent</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                        <span className="text-sm">Friday 5-7 PM</span>
                      </div>
                      <span className="text-xs text-slate-600">Average</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        <span className="text-sm">Weekend Mornings</span>
                      </div>
                      <span className="text-xs text-slate-600">Low</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Post Performance & Audience */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="size-5" style={{ color: '#0052CC' }} />
                  <h3 className="text-slate-900">Top Performing Posts</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm" style={{ fontWeight: 600 }}>Before & After Kitchen Renovation</p>
                      <Badge style={{ backgroundColor: '#00C47E' }}>Viral</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg" style={{ fontWeight: 700, color: '#0052CC' }}>1,247</p>
                        <p className="text-xs text-slate-600">Likes</p>
                      </div>
                      <div>
                        <p className="text-lg" style={{ fontWeight: 700, color: '#0052CC' }}>89</p>
                        <p className="text-xs text-slate-600">Comments</p>
                      </div>
                      <div>
                        <p className="text-lg" style={{ fontWeight: 700, color: '#0052CC' }}>234</p>
                        <p className="text-xs text-slate-600">Shares</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm" style={{ fontWeight: 600 }}>5 Tips for Winter Home Maintenance</p>
                      <Badge className="bg-blue-500">Popular</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg" style={{ fontWeight: 700, color: '#0052CC' }}>892</p>
                        <p className="text-xs text-slate-600">Likes</p>
                      </div>
                      <div>
                        <p className="text-lg" style={{ fontWeight: 700, color: '#0052CC' }}>56</p>
                        <p className="text-xs text-slate-600">Comments</p>
                      </div>
                      <div>
                        <p className="text-lg" style={{ fontWeight: 700, color: '#0052CC' }}>123</p>
                        <p className="text-xs text-slate-600">Shares</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm" style={{ fontWeight: 600 }}>Customer Testimonial Video</p>
                      <Badge className="bg-purple-500">Engaging</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg" style={{ fontWeight: 700, color: '#0052CC' }}>567</p>
                        <p className="text-xs text-slate-600">Likes</p>
                      </div>
                      <div>
                        <p className="text-lg" style={{ fontWeight: 700, color: '#0052CC' }}>34</p>
                        <p className="text-xs text-slate-600">Comments</p>
                      </div>
                      <div>
                        <p className="text-lg" style={{ fontWeight: 700, color: '#0052CC' }}>67</p>
                        <p className="text-xs text-slate-600">Shares</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="size-5" style={{ color: '#0052CC' }} />
                  <h3 className="text-slate-900">Audience Demographics</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-3" style={{ fontWeight: 600 }}>Age Distribution</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">25-34 years</span>
                          <span style={{ fontWeight: 600, color: '#0052CC' }}>38%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full" style={{ width: '38%', backgroundColor: '#0052CC' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">35-44 years</span>
                          <span style={{ fontWeight: 600, color: '#0052CC' }}>32%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full" style={{ width: '32%', backgroundColor: '#0052CC' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">45-54 years</span>
                          <span style={{ fontWeight: 600, color: '#0052CC' }}>20%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full" style={{ width: '20%', backgroundColor: '#0052CC' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">55+ years</span>
                          <span style={{ fontWeight: 600, color: '#0052CC' }}>10%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full" style={{ width: '10%', backgroundColor: '#0052CC' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-3" style={{ fontWeight: 600 }}>Gender Split</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                        <p className="text-2xl mb-1" style={{ fontWeight: 700, color: '#0052CC' }}>58%</p>
                        <p className="text-xs text-slate-600">Female</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                        <p className="text-2xl mb-1" style={{ fontWeight: 700, color: '#0052CC' }}>42%</p>
                        <p className="text-xs text-slate-600">Male</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-2" style={{ fontWeight: 600 }}>Top Locations</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Los Angeles, CA</span>
                        <span style={{ fontWeight: 600, color: '#0052CC' }}>24%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">San Diego, CA</span>
                        <span style={{ fontWeight: 600, color: '#0052CC' }}>18%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">San Francisco, CA</span>
                        <span style={{ fontWeight: 600, color: '#0052CC' }}>15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="p-6 border-2" style={{ borderColor: '#00C47E' }}>
              <h3 className="text-slate-900 mb-4">Social Media Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-blue-600">
                      <TrendingUp className="size-4 text-white" />
                    </div>
                    <p style={{ fontWeight: 600 }}>Increase Posting</p>
                  </div>
                  <p className="text-sm text-slate-600">Post 2-3 times per day on Instagram during peak hours to maximize reach</p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-purple-600">
                      <MessageCircle className="size-4 text-white" />
                    </div>
                    <p style={{ fontWeight: 600 }}>Engage More</p>
                  </div>
                  <p className="text-sm text-slate-600">Respond to comments within 2 hours to boost engagement rate by 45%</p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-green-600">
                      <Share2 className="size-4 text-white" />
                    </div>
                    <p style={{ fontWeight: 600 }}>Video Content</p>
                  </div>
                  <p className="text-sm text-slate-600">Videos get 3x more engagement - create 2 videos per week for better results</p>
                </div>
              </div>
            </Card>
            </>
            )}
          </TabsContent>
        </Tabs>

        {/* Advanced Tools Section */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#0052CC' }}>
              <Wrench className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-slate-900">Advanced GMB Tools</h2>
              <p className="text-sm text-slate-500">Professional tools to optimize your local SEO strategy</p>
            </div>
          </div>

          <Tabs defaultValue="seasonal" className="space-y-8">
            {/* Advanced GMB Tools Sub-Tabs */}
            <div className="relative flex flex-col items-center py-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full opacity-50" />
              
              <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 h-14 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 p-2 rounded-xl shadow-lg relative">
                <TabsTrigger value="seasonal" className="gap-2.5 h-full rounded-lg data-[state=active]:shadow-xl">
                  <span className="hidden lg:inline text-sm">Seasonal Planner</span>
                  <span className="lg:hidden text-sm">Seasonal</span>
                </TabsTrigger>
                <TabsTrigger value="devices" className="gap-2.5 h-full rounded-lg data-[state=active]:shadow-xl">
                  <span className="hidden lg:inline text-sm">Mobile vs Desktop</span>
                  <span className="lg:hidden text-sm">Devices</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="seasonal" className="space-y-6">
              <SeasonalCampaignPlanner keywords={keywords} />
            </TabsContent>

            <TabsContent value="devices" className="space-y-6">
              <MobileDesktopSplit 
                keywords={keywords} 
                avgJobValue={category?.avgJobValue || 500}
                conversionRate={category?.conversionRate || 0.05}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}