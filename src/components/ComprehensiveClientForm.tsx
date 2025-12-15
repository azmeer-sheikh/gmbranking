import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Building2,
  MapPin,
  Hash,
  BarChart3,
  FileSearch,
  Share2,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import type { GlobalKeyword } from '../types/database';

interface ServiceArea {
  area_name: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  is_primary: boolean;
}

interface SEOFormData {
  technical_seo_score: number;
  on_page_seo_score: number;
  local_seo_score: number;
  backlinks_score: number;
  mobile_responsive: boolean;
  page_speed_score: number;
  ssl_valid: boolean;
  sitemap_exists: boolean;
  robots_txt_valid: boolean;
  meta_titles_optimized: boolean;
  meta_descriptions_optimized: boolean;
  header_tags_proper: boolean;
  image_alt_text_percentage: number;
  internal_linking_score: number;
  nap_consistency_score: number;
  local_citations_count: number;
  gmb_complete: boolean;
  review_rating: number;
  review_count: number;
  total_backlinks: number;
  referring_domains: number;
  domain_authority: number;
  high_quality_links_percentage: number;
  toxic_links_percentage: number;
}

interface SocialMediaData {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  followers: number;
  engagement_rate: number;
  total_reach: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_saves: number;
  best_posting_time: string;
  best_posting_days: string;
}

interface SocialPost {
  post_title: string;
  post_date: string;
  likes: number;
  comments: number;
  shares: number;
  is_viral: boolean;
}

interface AnalyticsMetric {
  metric_name: string;
  metric_value: number;
  metric_type: 'traffic' | 'conversion' | 'revenue' | 'engagement';
  period_start: string;
  period_end: string;
}

interface Demographics {
  age_group: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  percentage: number;
}

interface DeviceKeywordData {
  keyword_id: string;
  mobile_volume: number;
  desktop_volume: number;
  mobile_ctr: number;
  desktop_ctr: number;
  mobile_conversion_rate: number;
  desktop_conversion_rate: number;
}

interface DevicePerformance {
  mobile_traffic_percentage: number;
  desktop_traffic_percentage: number;
  mobile_conversion_rate: number;
  desktop_conversion_rate: number;
  avg_job_value: number;
}

export interface ComprehensiveFormData {
  // Step 1: Basic Info
  businessName: string;
  area: string;
  location: string;
  category: string;
  phoneNumber: string;
  address: string;
  gbpScore: number;
  avgJobPrice?: number;
  manualTop3Count?: number; // Manual top 3 rankings count
  manualTop10Count?: number; // Manual top 10 rankings count
  
  // Step 2: Service Areas (Map View)
  serviceAreas: ServiceArea[];
  
  // Step 3: Keywords
  selectedKeywordIds: string[];
  keywordCpcOverrides?: { [keywordId: string]: number }; // Client-specific CPC values
  
  // Step 4: Analytics
  analyticsMetrics: AnalyticsMetric[];
  deviceKeywordData: DeviceKeywordData[];
  devicePerformance: DevicePerformance;
  
  // Step 5: SEO Analysis
  seoData: SEOFormData;
  
  // Step 6: Social Media
  socialMedia: SocialMediaData[];
  socialPosts: { [platform: string]: SocialPost[] };
  demographics: Demographics[];
  genderFemalePercentage: number;
  genderMalePercentage: number;
}

interface Props {
  globalKeywords: GlobalKeyword[];
  onSubmit: (data: ComprehensiveFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ComprehensiveFormData>;
}

const STEPS = [
  { id: 1, name: 'Basic Info', icon: Building2 },
  { id: 2, name: 'Service Areas', icon: MapPin },
  { id: 3, name: 'Keywords', icon: Hash },
  { id: 4, name: 'Analytics', icon: BarChart3 },
  { id: 5, name: 'SEO Analysis', icon: FileSearch },
  { id: 6, name: 'Social Media', icon: Share2 },
];

export default function ComprehensiveClientForm({ globalKeywords, onSubmit, onCancel, initialData }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keywordSearch, setKeywordSearch] = useState('');

  // Form data state
  const [formData, setFormData] = useState<ComprehensiveFormData>({
    businessName: initialData?.businessName || '',
    area: initialData?.area || '',
    location: initialData?.location || '',
    category: initialData?.category || '',
    phoneNumber: initialData?.phoneNumber || '',
    address: initialData?.address || '',
    gbpScore: initialData?.gbpScore || 85,
    avgJobPrice: initialData?.avgJobPrice,
    manualTop3Count: initialData?.manualTop3Count,
    manualTop10Count: initialData?.manualTop10Count,
    serviceAreas: initialData?.serviceAreas || [],
    selectedKeywordIds: initialData?.selectedKeywordIds || [],
    keywordCpcOverrides: initialData?.keywordCpcOverrides || {},
    analyticsMetrics: initialData?.analyticsMetrics || [],
    deviceKeywordData: initialData?.deviceKeywordData || [],
    devicePerformance: initialData?.devicePerformance || {
      mobile_traffic_percentage: 50,
      desktop_traffic_percentage: 50,
      mobile_conversion_rate: 2.5,
      desktop_conversion_rate: 2.5,
      avg_job_value: 1000,
    },
    seoData: initialData?.seoData || {
      technical_seo_score: 90,
      on_page_seo_score: 85,
      local_seo_score: 78,
      backlinks_score: 94,
      mobile_responsive: true,
      page_speed_score: 85,
      ssl_valid: true,
      sitemap_exists: true,
      robots_txt_valid: true,
      meta_titles_optimized: true,
      meta_descriptions_optimized: true,
      header_tags_proper: false,
      image_alt_text_percentage: 92,
      internal_linking_score: 88,
      nap_consistency_score: 78,
      local_citations_count: 47,
      gmb_complete: true,
      review_rating: 4.7,
      review_count: 234,
      total_backlinks: 342,
      referring_domains: 156,
      domain_authority: 58,
      high_quality_links_percentage: 89,
      toxic_links_percentage: 3,
    },
    socialMedia: initialData?.socialMedia || [],
    socialPosts: initialData?.socialPosts || {},
    demographics: initialData?.demographics || [
      { age_group: '25-34', percentage: 38 },
      { age_group: '35-44', percentage: 32 },
      { age_group: '45-54', percentage: 20 },
      { age_group: '55+', percentage: 10 },
    ],
    genderFemalePercentage: initialData?.genderFemalePercentage || 58,
    genderMalePercentage: initialData?.genderMalePercentage || 42,
  });

  const [newServiceArea, setNewServiceArea] = useState<ServiceArea>({
    area_name: '',
    latitude: 0,
    longitude: 0,
    radius_km: 5,
    is_primary: false,
  });

  const [newMetric, setNewMetric] = useState<AnalyticsMetric>({
    metric_name: '',
    metric_value: 0,
    metric_type: 'traffic',
    period_start: '',
    period_end: '',
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const addServiceArea = () => {
    if (newServiceArea.area_name && newServiceArea.latitude && newServiceArea.longitude) {
      setFormData({
        ...formData,
        serviceAreas: [...formData.serviceAreas, { ...newServiceArea }],
      });
      setNewServiceArea({
        area_name: '',
        latitude: 0,
        longitude: 0,
        radius_km: 5,
        is_primary: false,
      });
    }
  };

  const removeServiceArea = (index: number) => {
    setFormData({
      ...formData,
      serviceAreas: formData.serviceAreas.filter((_, i) => i !== index),
    });
  };

  const addAnalyticsMetric = () => {
    if (newMetric.metric_name && newMetric.period_start && newMetric.period_end) {
      setFormData({
        ...formData,
        analyticsMetrics: [...formData.analyticsMetrics, { ...newMetric }],
      });
      setNewMetric({
        metric_name: '',
        metric_value: 0,
        metric_type: 'traffic',
        period_start: '',
        period_end: '',
      });
    }
  };

  const removeAnalyticsMetric = (index: number) => {
    setFormData({
      ...formData,
      analyticsMetrics: formData.analyticsMetrics.filter((_, i) => i !== index),
    });
  };

  const toggleKeyword = (keywordId: string) => {
    const isSelected = formData.selectedKeywordIds.includes(keywordId);
    setFormData({
      ...formData,
      selectedKeywordIds: isSelected
        ? formData.selectedKeywordIds.filter(id => id !== keywordId)
        : [...formData.selectedKeywordIds, keywordId],
    });
  };

  const addSocialPlatform = (platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin') => {
    if (!formData.socialMedia.find(sm => sm.platform === platform)) {
      setFormData({
        ...formData,
        socialMedia: [
          ...formData.socialMedia,
          {
            platform,
            followers: 0,
            engagement_rate: 0,
            total_reach: 0,
            total_likes: 0,
            total_comments: 0,
            total_shares: 0,
            total_saves: 0,
            best_posting_time: '',
            best_posting_days: '',
          },
        ],
      });
    }
  };

  const updateSocialMedia = (platform: string, field: string, value: any) => {
    setFormData({
      ...formData,
      socialMedia: formData.socialMedia.map(sm =>
        sm.platform === platform ? { ...sm, [field]: value } : sm
      ),
    });
  };

  const removeSocialPlatform = (platform: string) => {
    setFormData({
      ...formData,
      socialMedia: formData.socialMedia.filter(sm => sm.platform !== platform),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-6xl bg-white my-8">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl" style={{ fontWeight: 700, color: '#0052CC' }}>
              {initialData ? 'Edit Client' : 'Add New Client'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="size-5 text-slate-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep === step.id
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : currentStep > step.id
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="size-6" />
                    ) : (
                      <step.icon className="size-6" />
                    )}
                  </div>
                  <span className={`text-xs ${currentStep >= step.id ? 'text-blue-600' : 'text-slate-400'}`}>
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg" style={{ fontWeight: 600 }}>Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Business Name *</Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Plumber, Restaurant"
                  />
                </div>
                <div>
                  <Label>Area *</Label>
                  <Input
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="City or Area"
                  />
                </div>
                <div>
                  <Label>Location (Full Address)</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Complete address"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <Label>GBP Score (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.gbpScore}
                    onChange={(e) => setFormData({ ...formData, gbpScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Average Job Price ($)</Label>
                  <Input
                    type="number"
                    value={formData.avgJobPrice}
                    onChange={(e) => setFormData({ ...formData, avgJobPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Manual Top 3 Count (Optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.manualTop3Count || ''}
                    onChange={(e) => setFormData({ ...formData, manualTop3Count: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Leave empty for auto-calculate"
                  />
                </div>
                <div>
                  <Label>Manual Top 10 Count (Optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.manualTop10Count || ''}
                    onChange={(e) => setFormData({ ...formData, manualTop10Count: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Leave empty for auto-calculate"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Service Areas (Map View) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg" style={{ fontWeight: 600 }}>Service Areas for Map Highlighting</h3>
              <p className="text-sm text-slate-600">Add multiple service areas with radius to display on the map</p>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label>Area Name *</Label>
                    <Input
                      value={newServiceArea.area_name}
                      onChange={(e) => setNewServiceArea({ ...newServiceArea, area_name: e.target.value })}
                      placeholder="e.g., Downtown, North Side"
                    />
                  </div>
                  <div>
                    <Label>Radius (KM) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newServiceArea.radius_km}
                      onChange={(e) => setNewServiceArea({ ...newServiceArea, radius_km: parseFloat(e.target.value) || 0 })}
                      placeholder="5.0"
                    />
                  </div>
                  <div>
                    <Label>Latitude *</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={newServiceArea.latitude}
                      onChange={(e) => setNewServiceArea({ ...newServiceArea, latitude: parseFloat(e.target.value) || 0 })}
                      placeholder="40.7128"
                    />
                  </div>
                  <div>
                    <Label>Longitude *</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={newServiceArea.longitude}
                      onChange={(e) => setNewServiceArea({ ...newServiceArea, longitude: parseFloat(e.target.value) || 0 })}
                      placeholder="-74.0060"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newServiceArea.is_primary}
                      onChange={(e) => setNewServiceArea({ ...newServiceArea, is_primary: e.target.checked })}
                      className="size-4"
                    />
                    <Label>Primary Service Area</Label>
                  </div>
                </div>
                <Button onClick={addServiceArea} className="w-full gap-2">
                  <Plus className="size-4" />
                  Add Service Area
                </Button>
              </Card>

              <div className="space-y-2">
                {formData.serviceAreas.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="text-left p-3 border" style={{ fontWeight: 600 }}>Area Name</th>
                          <th className="text-left p-3 border" style={{ fontWeight: 600 }}>Coordinates</th>
                          <th className="text-left p-3 border" style={{ fontWeight: 600 }}>Radius (KM)</th>
                          <th className="text-left p-3 border" style={{ fontWeight: 600 }}>Status</th>
                          <th className="text-center p-3 border" style={{ fontWeight: 600 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.serviceAreas.map((area, index) => (
                          <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
                            <td className="p-3 border">
                              <p style={{ fontWeight: 600 }}>{area.area_name}</p>
                            </td>
                            <td className="p-3 border text-sm text-slate-600">
                              {area.latitude.toFixed(6)}, {area.longitude.toFixed(6)}
                            </td>
                            <td className="p-3 border">
                              <Badge variant="outline" className="bg-blue-50">{area.radius_km} km</Badge>
                            </td>
                            <td className="p-3 border">
                              {area.is_primary ? (
                                <Badge className="bg-green-500">Primary</Badge>
                              ) : (
                                <Badge variant="outline">Secondary</Badge>
                              )}
                            </td>
                            <td className="p-3 border text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeServiceArea(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {formData.serviceAreas.length === 0 && (
                  <Card className="p-6 text-center bg-slate-50">
                    <MapPin className="size-12 mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-600">No service areas added yet. Add your first service area above.</p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Keywords */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg" style={{ fontWeight: 600 }}>Select Keywords & Set CPC</h3>
              <p className="text-sm text-slate-600">
                Selected: {formData.selectedKeywordIds.length} keywords
                {formData.category && (
                  <span className="ml-2">
                    • Showing keywords for: <Badge className="ml-1 bg-blue-100 text-blue-700">{formData.category}</Badge>
                  </span>
                )}
              </p>
              
              <Input
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                placeholder="🔍 Search keywords..."
                className="mb-3"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {(() => {
                  // Filter keywords by category first, then by search term
                  const filteredKeywords = globalKeywords
                    .filter(keyword => {
                      // If a category is selected, only show keywords matching that category
                      if (formData.category) {
                        const keywordCategory = keyword.category?.toLowerCase() || '';
                        const selectedCategory = formData.category.toLowerCase();
                        if (keywordCategory !== selectedCategory) {
                          return false;
                        }
                      }
                      // Then filter by search term
                      return keyword.keyword.toLowerCase().includes(keywordSearch.toLowerCase());
                    });
                  
                  if (filteredKeywords.length === 0) {
                    return (
                      <Card className="col-span-2 p-8 text-center bg-slate-50">
                        <Hash className="size-12 mx-auto mb-2 text-slate-400" />
                        <p className="text-slate-600">
                          {formData.category 
                            ? `No keywords found for category "${formData.category}". Please add global keywords for this category in the Admin Panel.`
                            : 'No keywords available. Please select a category in Step 1.'
                          }
                        </p>
                      </Card>
                    );
                  }
                  
                  return filteredKeywords.map((keyword) => {
                    const isSelected = formData.selectedKeywordIds.includes(keyword.id);
                    const currentCpc = formData.keywordCpcOverrides?.[keyword.id] ?? keyword.cpc;
                    
                    return (
                      <Card
                        key={keyword.id}
                        className={`p-3 transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div 
                          className="flex items-start justify-between gap-2 cursor-pointer"
                          onClick={() => toggleKeyword(keyword.id)}
                        >
                          <div className="flex-1">
                            <p style={{ fontWeight: 600 }}>{keyword.keyword}</p>
                            <p className="text-xs text-slate-600">
                              Volume: {keyword.search_volume.toLocaleString()}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="size-5 text-blue-600 mt-1 flex-shrink-0" />
                          )}
                        </div>
                        
                        {/* CPC Editor - Only show for selected keywords */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-blue-200" onClick={(e) => e.stopPropagation()}>
                            <Label className="text-xs mb-1">Custom CPC ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={currentCpc}
                              onChange={(e) => {
                                const newCpc = parseFloat(e.target.value) || 0;
                                setFormData({
                                  ...formData,
                                  keywordCpcOverrides: {
                                    ...formData.keywordCpcOverrides,
                                    [keyword.id]: newCpc
                                  }
                                });
                              }}
                              placeholder="5.00"
                              className="h-8 text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              Default CPC: ${keyword.cpc.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </Card>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Step 4: Analytics */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg mb-4" style={{ fontWeight: 600 }}>Device Performance Settings</h3>
                
                <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Mobile Traffic %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.devicePerformance.mobile_traffic_percentage}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormData({
                            ...formData,
                            devicePerformance: {
                              ...formData.devicePerformance,
                              mobile_traffic_percentage: val,
                              desktop_traffic_percentage: 100 - val,
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Desktop Traffic %</Label>
                      <Input
                        type="number"
                        value={formData.devicePerformance.desktop_traffic_percentage}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Average Job Value ($)</Label>
                      <Input
                        type="number"
                        value={formData.devicePerformance.avg_job_value}
                        onChange={(e) => setFormData({
                          ...formData,
                          devicePerformance: {
                            ...formData.devicePerformance,
                            avg_job_value: parseFloat(e.target.value) || 0,
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Mobile Conversion Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.devicePerformance.mobile_conversion_rate}
                        onChange={(e) => setFormData({
                          ...formData,
                          devicePerformance: {
                            ...formData.devicePerformance,
                            mobile_conversion_rate: parseFloat(e.target.value) || 0,
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Desktop Conversion Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.devicePerformance.desktop_conversion_rate}
                        onChange={(e) => setFormData({
                          ...formData,
                          devicePerformance: {
                            ...formData.devicePerformance,
                            desktop_conversion_rate: parseFloat(e.target.value) || 0,
                          }
                        })}
                      />
                    </div>
                  </div>
                </Card>

                {formData.selectedKeywordIds.length > 0 && (
                  <div>
                    <h4 className="mb-3" style={{ fontWeight: 600 }}>Device-Specific Keyword Performance</h4>
                    <p className="text-sm text-slate-600 mb-3">Set mobile and desktop metrics for each selected keyword</p>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {formData.selectedKeywordIds.map((keywordId) => {
                        const keyword = globalKeywords.find(k => k.id === keywordId);
                        if (!keyword) return null;

                        const existingData = formData.deviceKeywordData.find(d => d.keyword_id === keywordId);
                        const mobileVolume = existingData?.mobile_volume || Math.round(keyword.search_volume * 0.65);
                        const desktopVolume = existingData?.desktop_volume || Math.round(keyword.search_volume * 0.35);
                        const mobileCtr = existingData?.mobile_ctr || 3.5;
                        const desktopCtr = existingData?.desktop_ctr || 2.8;
                        const mobileConversion = existingData?.mobile_conversion_rate || formData.devicePerformance.mobile_conversion_rate;
                        const desktopConversion = existingData?.desktop_conversion_rate || formData.devicePerformance.desktop_conversion_rate;

                        const updateDeviceData = (field: string, value: number) => {
                          const existing = formData.deviceKeywordData.find(d => d.keyword_id === keywordId);
                          if (existing) {
                            setFormData({
                              ...formData,
                              deviceKeywordData: formData.deviceKeywordData.map(d =>
                                d.keyword_id === keywordId ? { ...d, [field]: value } : d
                              ),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              deviceKeywordData: [
                                ...formData.deviceKeywordData,
                                {
                                  keyword_id: keywordId,
                                  mobile_volume: mobileVolume,
                                  desktop_volume: desktopVolume,
                                  mobile_ctr: mobileCtr,
                                  desktop_ctr: desktopCtr,
                                  mobile_conversion_rate: mobileConversion,
                                  desktop_conversion_rate: desktopConversion,
                                  [field]: value,
                                },
                              ],
                            });
                          }
                        };

                        return (
                          <Card key={keywordId} className="p-3">
                            <p className="mb-3" style={{ fontWeight: 600 }}>{keyword.keyword}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                              <div>
                                <Label className="text-xs">Mobile Volume</Label>
                                <Input
                                  type="number"
                                  value={mobileVolume}
                                  onChange={(e) => updateDeviceData('mobile_volume', parseInt(e.target.value) || 0)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Desktop Volume</Label>
                                <Input
                                  type="number"
                                  value={desktopVolume}
                                  onChange={(e) => updateDeviceData('desktop_volume', parseInt(e.target.value) || 0)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Mobile CTR %</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={mobileCtr}
                                  onChange={(e) => updateDeviceData('mobile_ctr', parseFloat(e.target.value) || 0)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Desktop CTR %</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={desktopCtr}
                                  onChange={(e) => updateDeviceData('desktop_ctr', parseFloat(e.target.value) || 0)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Mobile Conv %</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={mobileConversion}
                                  onChange={(e) => updateDeviceData('mobile_conversion_rate', parseFloat(e.target.value) || 0)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Desktop Conv %</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={desktopConversion}
                                  onChange={(e) => updateDeviceData('desktop_conversion_rate', parseFloat(e.target.value) || 0)}
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg mb-3" style={{ fontWeight: 600 }}>General Analytics Metrics</h3>

                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label>Metric Name *</Label>
                      <Input
                        value={newMetric.metric_name}
                        onChange={(e) => setNewMetric({ ...newMetric, metric_name: e.target.value })}
                        placeholder="e.g., Monthly Traffic"
                      />
                    </div>
                    <div>
                      <Label>Value *</Label>
                      <Input
                        type="number"
                        value={newMetric.metric_value}
                        onChange={(e) => setNewMetric({ ...newMetric, metric_value: parseFloat(e.target.value) || 0 })}
                        placeholder="10000"
                      />
                    </div>
                    <div>
                      <Label>Type *</Label>
                      <select
                        value={newMetric.metric_type}
                        onChange={(e) => setNewMetric({ ...newMetric, metric_type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      >
                        <option value="traffic">Traffic</option>
                        <option value="conversion">Conversion</option>
                        <option value="revenue">Revenue</option>
                        <option value="engagement">Engagement</option>
                      </select>
                    </div>
                    <div>
                      <Label>Period Start *</Label>
                      <Input
                        type="date"
                        value={newMetric.period_start}
                        onChange={(e) => setNewMetric({ ...newMetric, period_start: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Period End *</Label>
                      <Input
                        type="date"
                        value={newMetric.period_end}
                        onChange={(e) => setNewMetric({ ...newMetric, period_end: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={addAnalyticsMetric} className="w-full gap-2">
                    <Plus className="size-4" />
                    Add Metric
                  </Button>
                </Card>

                <div className="space-y-2 mt-4">
                  {formData.analyticsMetrics.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-green-100 to-teal-100">
                            <th className="text-left p-3 border" style={{ fontWeight: 600 }}>Metric Name</th>
                            <th className="text-left p-3 border" style={{ fontWeight: 600 }}>Value</th>
                            <th className="text-left p-3 border" style={{ fontWeight: 600 }}>Type</th>
                            <th className="text-left p-3 border" style={{ fontWeight: 600 }}>Period</th>
                            <th className="text-center p-3 border" style={{ fontWeight: 600 }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.analyticsMetrics.map((metric, index) => (
                            <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-green-50/30'} hover:bg-green-100 transition-colors`}>
                              <td className="p-3 border">
                                <p style={{ fontWeight: 600 }}>{metric.metric_name}</p>
                              </td>
                              <td className="p-3 border">
                                <Badge className="bg-blue-500">{metric.metric_value.toLocaleString()}</Badge>
                              </td>
                              <td className="p-3 border">
                                <Badge 
                                  variant="outline" 
                                  className={`capitalize ${
                                    metric.metric_type === 'revenue' ? 'bg-green-50 border-green-500' :
                                    metric.metric_type === 'traffic' ? 'bg-blue-50 border-blue-500' :
                                    metric.metric_type === 'conversion' ? 'bg-purple-50 border-purple-500' :
                                    'bg-orange-50 border-orange-500'
                                  }`}
                                >
                                  {metric.metric_type}
                                </Badge>
                              </td>
                              <td className="p-3 border text-sm text-slate-600">
                                {metric.period_start} to {metric.period_end}
                              </td>
                              <td className="p-3 border text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAnalyticsMetric(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {formData.analyticsMetrics.length === 0 && (
                    <Card className="p-6 text-center bg-slate-50">
                      <BarChart3 className="size-12 mx-auto mb-2 text-slate-400" />
                      <p className="text-slate-600">No metrics added yet. Add your first metric above.</p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: SEO Analysis */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg" style={{ fontWeight: 600 }}>SEO Analysis Data</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Technical SEO Score (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.seoData.technical_seo_score}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoData: { ...formData.seoData, technical_seo_score: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>On-Page SEO Score (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.seoData.on_page_seo_score}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoData: { ...formData.seoData, on_page_seo_score: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Local SEO Score (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.seoData.local_seo_score}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoData: { ...formData.seoData, local_seo_score: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Backlinks Score (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.seoData.backlinks_score}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoData: { ...formData.seoData, backlinks_score: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Page Speed Score (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.seoData.page_speed_score}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoData: { ...formData.seoData, page_speed_score: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Domain Authority (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.seoData.domain_authority}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoData: { ...formData.seoData, domain_authority: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Total Backlinks</Label>
                  <Input
                    type="number"
                    value={formData.seoData.total_backlinks}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoData: { ...formData.seoData, total_backlinks: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Review Rating (0-5)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.seoData.review_rating}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoData: { ...formData.seoData, review_rating: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Review Count</Label>
                  <Input
                    type="number"
                    value={formData.seoData.review_count}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoData: { ...formData.seoData, review_count: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Local Citations Count</Label>
                  <Input
                    type="number"
                    value={formData.seoData.local_citations_count}
                    onChange={(e) => setFormData({
                      ...formData,
                      seoData: { ...formData.seoData, local_citations_count: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'mobile_responsive', label: 'Mobile Responsive' },
                  { key: 'ssl_valid', label: 'SSL Valid' },
                  { key: 'sitemap_exists', label: 'Sitemap Exists' },
                  { key: 'robots_txt_valid', label: 'Robots.txt Valid' },
                  { key: 'meta_titles_optimized', label: 'Meta Titles Optimized' },
                  { key: 'meta_descriptions_optimized', label: 'Meta Descriptions Optimized' },
                  { key: 'header_tags_proper', label: 'Header Tags Proper' },
                  { key: 'gmb_complete', label: 'GMB Complete' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2 p-2 border rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.seoData[key as keyof SEOFormData] as boolean}
                      onChange={(e) => setFormData({
                        ...formData,
                        seoData: { ...formData.seoData, [key]: e.target.checked }
                      })}
                      className="size-4"
                    />
                    <Label className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Social Media */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg" style={{ fontWeight: 600 }}>Social Media Presence</h3>

              <div className="flex gap-2 flex-wrap">
                {['facebook', 'instagram', 'twitter', 'linkedin'].map((platform) => (
                  <Button
                    key={platform}
                    onClick={() => addSocialPlatform(platform as any)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={!!formData.socialMedia.find(sm => sm.platform === platform)}
                  >
                    <Plus className="size-4" />
                    Add {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                {formData.socialMedia.map((social) => (
                  <Card key={social.platform} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 style={{ fontWeight: 600 }} className="capitalize">{social.platform}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSocialPlatform(social.platform)}
                        className="text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Followers</Label>
                        <Input
                          type="number"
                          value={social.followers}
                          onChange={(e) => updateSocialMedia(social.platform, 'followers', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Engagement Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={social.engagement_rate}
                          onChange={(e) => updateSocialMedia(social.platform, 'engagement_rate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Total Reach</Label>
                        <Input
                          type="number"
                          value={social.total_reach}
                          onChange={(e) => updateSocialMedia(social.platform, 'total_reach', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Total Likes</Label>
                        <Input
                          type="number"
                          value={social.total_likes}
                          onChange={(e) => updateSocialMedia(social.platform, 'total_likes', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Total Comments</Label>
                        <Input
                          type="number"
                          value={social.total_comments}
                          onChange={(e) => updateSocialMedia(social.platform, 'total_comments', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Total Shares</Label>
                        <Input
                          type="number"
                          value={social.total_shares}
                          onChange={(e) => updateSocialMedia(social.platform, 'total_shares', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Best Posting Time</Label>
                        <Input
                          value={social.best_posting_time}
                          onChange={(e) => updateSocialMedia(social.platform, 'best_posting_time', e.target.value)}
                          placeholder="2:00 PM - 4:00 PM"
                        />
                      </div>
                      <div>
                        <Label>Best Days</Label>
                        <Input
                          value={social.best_posting_days}
                          onChange={(e) => updateSocialMedia(social.platform, 'best_posting_days', e.target.value)}
                          placeholder="Tuesday, Thursday"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3" style={{ fontWeight: 600 }}>Demographics</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label>Female (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.genderFemalePercentage}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          genderFemalePercentage: val,
                          genderMalePercentage: 100 - val
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Male (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.genderMalePercentage}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 flex items-center justify-between bg-slate-50">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <div className="text-sm text-slate-600">
            Step {currentStep} of {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-green-600 hover:bg-green-700">
              {loading ? 'Saving...' : 'Complete & Save'}
              <Check className="size-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}