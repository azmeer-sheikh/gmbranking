import { Location, Keyword, RankingMetrics } from './types';

// GMB Location data for multi-location management
export const gmbLocations = [
  {
    id: 'gmb1',
    name: 'Los Angeles Downtown',
    category: 'plumbing',
    keywords: 12,
    avgRank: 8,
    monthlyLoss: 15420,
    yearlyRevenue: 185040,
    status: 'active' as const
  },
  {
    id: 'gmb2',
    name: 'Santa Monica Westside',
    category: 'plumbing',
    keywords: 8,
    avgRank: 12,
    monthlyLoss: 9800,
    yearlyRevenue: 117600,
    status: 'active' as const
  },
  {
    id: 'gmb3',
    name: 'Beverly Hills Premium',
    category: 'hvac',
    keywords: 15,
    avgRank: 6,
    monthlyLoss: 22100,
    yearlyRevenue: 265200,
    status: 'active' as const
  },
  {
    id: 'gmb4',
    name: 'Pasadena Northeast',
    category: 'electrician',
    keywords: 10,
    avgRank: 14,
    monthlyLoss: 7500,
    yearlyRevenue: 90000,
    status: 'active' as const
  },
  {
    id: 'gmb5',
    name: 'Long Beach Harbor',
    category: 'roofing',
    keywords: 9,
    avgRank: 11,
    monthlyLoss: 12300,
    yearlyRevenue: 147600,
    status: 'active' as const
  },
  {
    id: 'gmb6',
    name: 'Glendale Central',
    category: 'landscaping',
    keywords: 7,
    avgRank: 9,
    monthlyLoss: 5200,
    yearlyRevenue: 62400,
    status: 'active' as const
  },
];

export const locations: Location[] = [
  {
    id: 'loc1',
    name: 'Downtown Office',
    city: 'Los Angeles',
    state: 'California',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    address: '123 Main St, Los Angeles, CA 90012',
    businessName: 'Your Business'
  },
  {
    id: 'loc2',
    name: 'West Side Branch',
    city: 'Santa Monica',
    state: 'California',
    coordinates: { lat: 34.0195, lng: -118.4912 },
    address: '456 Ocean Ave, Santa Monica, CA 90401',
    businessName: 'Your Business'
  },
  {
    id: 'loc3',
    name: 'Valley Location',
    city: 'Burbank',
    state: 'California',
    coordinates: { lat: 34.1808, lng: -118.3090 },
    address: '789 Valley Blvd, Burbank, CA 91502',
    businessName: 'Your Business'
  },
  {
    id: 'loc4',
    name: 'South Bay Office',
    city: 'Long Beach',
    state: 'California',
    coordinates: { lat: 33.7701, lng: -118.1937 },
    address: '321 Beach Blvd, Long Beach, CA 90802',
    businessName: 'Your Business'
  },
];

// Keyword templates by business category
export const keywordTemplatesByCategory: { [key: string]: Array<{ keyword: string; volume: number; difficulty: number; cpc: number }> } = {
  plumbing: [
    { keyword: 'emergency plumber near me', volume: 8900, difficulty: 68, cpc: 45.50 },
    { keyword: 'plumber [city]', volume: 12400, difficulty: 72, cpc: 38.20 },
    { keyword: 'water heater repair', volume: 5600, difficulty: 65, cpc: 42.00 },
    { keyword: 'drain cleaning service', volume: 4200, difficulty: 58, cpc: 35.80 },
    { keyword: 'toilet repair', volume: 3200, difficulty: 55, cpc: 32.50 },
    { keyword: 'pipe repair', volume: 2800, difficulty: 62, cpc: 44.20 },
    { keyword: 'leaky faucet repair', volume: 2400, difficulty: 52, cpc: 28.90 },
    { keyword: 'sewer line repair', volume: 1900, difficulty: 70, cpc: 52.30 },
  ],
  hvac: [
    { keyword: 'ac repair near me', volume: 15200, difficulty: 70, cpc: 58.40 },
    { keyword: 'hvac services [city]', volume: 9800, difficulty: 68, cpc: 48.20 },
    { keyword: 'furnace repair', volume: 7400, difficulty: 64, cpc: 44.80 },
    { keyword: 'air conditioning installation', volume: 6200, difficulty: 72, cpc: 65.50 },
    { keyword: 'heating repair', volume: 5100, difficulty: 62, cpc: 42.30 },
    { keyword: 'hvac maintenance', volume: 4800, difficulty: 58, cpc: 38.90 },
  ],
  dental: [
    { keyword: 'dentist near me', volume: 22400, difficulty: 75, cpc: 42.80 },
    { keyword: 'emergency dentist', volume: 8900, difficulty: 72, cpc: 56.20 },
    { keyword: 'teeth whitening [city]', volume: 6800, difficulty: 68, cpc: 38.50 },
    { keyword: 'dental implants', volume: 5400, difficulty: 78, cpc: 72.40 },
    { keyword: 'root canal treatment', volume: 4200, difficulty: 65, cpc: 48.90 },
    { keyword: 'cosmetic dentistry', volume: 3800, difficulty: 70, cpc: 52.30 },
  ],
  legal: [
    { keyword: 'personal injury lawyer', volume: 18200, difficulty: 82, cpc: 125.50 },
    { keyword: 'car accident attorney', volume: 12400, difficulty: 80, cpc: 98.20 },
    { keyword: 'workers compensation lawyer', volume: 8900, difficulty: 78, cpc: 85.40 },
    { keyword: 'divorce attorney [city]', volume: 7200, difficulty: 75, cpc: 72.80 },
    { keyword: 'criminal defense lawyer', volume: 6800, difficulty: 79, cpc: 88.60 },
  ],
  roofing: [
    { keyword: 'roof repair near me', volume: 11200, difficulty: 68, cpc: 82.40 },
    { keyword: 'roofing contractor [city]', volume: 8900, difficulty: 72, cpc: 68.20 },
    { keyword: 'roof replacement', volume: 7400, difficulty: 70, cpc: 92.80 },
    { keyword: 'emergency roof repair', volume: 4800, difficulty: 65, cpc: 75.50 },
    { keyword: 'roof inspection', volume: 3600, difficulty: 58, cpc: 48.30 },
  ],
};

export const generateKeywordsForCategory = (categoryId: string, locationId: string): Keyword[] => {
  const templates = keywordTemplatesByCategory[categoryId] || keywordTemplatesByCategory.plumbing;
  const location = locations.find(loc => loc.id === locationId);
  
  return templates.slice(0, 6).map((template, index) => {
    // Add some variance to the data
    const variance = 0.8 + Math.random() * 0.4;
    const currentRank = Math.floor(Math.random() * 20) + 1;
    
    return {
      id: `kw-${categoryId}-${locationId}-${index}`,
      keyword: template.keyword.replace('[city]', location?.city || 'Los Angeles'),
      searchVolume: Math.round(template.volume * variance),
      currentRank,
      targetRank: 3,
      cpc: template.cpc,
      difficulty: template.difficulty,
      locationId,
      category: categoryId
    };
  });
};

// Default keywords for initial load (plumbing category)
export const keywords: Keyword[] = generateKeywordsForCategory('plumbing', 'loc1');

// CTR by ranking position (industry standard for local search)
export const ctrByRank: { [key: number]: number } = {
  1: 0.355,
  2: 0.165,
  3: 0.11,
  4: 0.08,
  5: 0.065,
  6: 0.05,
  7: 0.04,
  8: 0.032,
  9: 0.027,
  10: 0.022,
  11: 0.018,
  12: 0.015,
  13: 0.012,
  14: 0.01,
  15: 0.008,
  16: 0.006,
  17: 0.005,
  18: 0.004,
  19: 0.003,
  20: 0.002,
  21: 0.001,
};

export const calculateMetrics = (keyword: Keyword): RankingMetrics => {
  const currentCTR = ctrByRank[keyword.currentRank] || 0.001;
  const targetCTR = ctrByRank[keyword.targetRank] || 0.11;
  const conversionRate = 0.08; // 8% conversion rate for local services
  const avgJobValue = 450; // Average plumbing job value

  const currentClicks = keyword.searchVolume * currentCTR;
  const targetClicks = keyword.searchVolume * targetCTR;
  
  const currentRevenue = currentClicks * conversionRate * avgJobValue;
  const targetRevenue = targetClicks * conversionRate * avgJobValue;
  
  const revenueLoss = targetRevenue - currentRevenue;

  return {
    keywordId: keyword.id,
    locationId: keyword.locationId,
    currentRank: keyword.currentRank,
    previousRank: keyword.currentRank + Math.floor(Math.random() * 3) - 1,
    ctr: currentCTR,
    estimatedClicks: Math.round(currentClicks),
    estimatedRevenue: Math.round(currentRevenue),
    revenueLoss: Math.round(revenueLoss),
    conversionRate: conversionRate,
  };
};

export const rankingMetrics: RankingMetrics[] = keywords.map(calculateMetrics);