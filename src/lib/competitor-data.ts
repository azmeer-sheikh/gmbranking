import { Keyword } from './types';
import { ctrByRank } from './sample-data';

export interface Competitor {
  id: string;
  businessName: string;
  ranking: number;
  domain: string;
  reviews: number;
  rating: number;
  estimatedRevenue: number;
  estimatedClicks: number;
}

export interface KeywordCompetitors {
  keywordId: string;
  keyword: string;
  searchVolume: number;
  competitors: Competitor[];
}

// Generate realistic competitor names
const competitorNames = [
  'ProPlus Services', 'Elite Solutions', 'Quick Response Pro', '24/7 Experts',
  'Premier Services', 'Rapid Repair Co', 'Top Rated Pros', 'Quality First',
  'Trusted Local Services', 'Metro Professionals', 'City Wide Solutions',
  'Fast Fix Experts', 'Premium Care Services', 'Local Heroes', 'Swift Solutions'
];

export const generateCompetitorsForKeyword = (
  keyword: Keyword,
  avgJobValue: number,
  conversionRate: number
): Competitor[] => {
  const competitors: Competitor[] = [];
  
  // Generate top 3 competitors
  for (let rank = 1; rank <= 3; rank++) {
    const ctr = ctrByRank[rank] || 0.1;
    const estimatedClicks = Math.round(keyword.searchVolume * ctr);
    const estimatedRevenue = Math.round(estimatedClicks * conversionRate * avgJobValue);
    
    // Use deterministic but varied competitor names
    const nameIndex = (parseInt(keyword.id.replace(/\D/g, '')) + rank) % competitorNames.length;
    
    competitors.push({
      id: `comp-${keyword.id}-${rank}`,
      businessName: competitorNames[nameIndex],
      ranking: rank,
      domain: `${competitorNames[nameIndex].toLowerCase().replace(/\s+/g, '')}.com`,
      reviews: Math.floor(Math.random() * 300) + 100,
      rating: 4.2 + Math.random() * 0.7,
      estimatedRevenue,
      estimatedClicks
    });
  }
  
  return competitors;
};

export const calculateCustomerRevenueLoss = (
  keyword: Keyword,
  avgJobValue: number,
  conversionRate: number,
  targetRank: number = 3
): {
  currentRevenue: number;
  potentialRevenue: number;
  revenueLoss: number;
  currentClicks: number;
  potentialClicks: number;
} => {
  const currentCTR = keyword.currentRank <= 21 ? (ctrByRank[keyword.currentRank] || 0.001) : 0.001;
  const targetCTR = ctrByRank[targetRank] || 0.11;
  
  const currentClicks = Math.round(keyword.searchVolume * currentCTR);
  const potentialClicks = Math.round(keyword.searchVolume * targetCTR);
  
  const currentRevenue = Math.round(currentClicks * conversionRate * avgJobValue);
  const potentialRevenue = Math.round(potentialClicks * conversionRate * avgJobValue);
  
  const revenueLoss = potentialRevenue - currentRevenue;
  
  return {
    currentRevenue,
    potentialRevenue,
    revenueLoss,
    currentClicks,
    potentialClicks
  };
};

export const calculateCompetitorTotalRevenue = (competitors: Competitor[]): number => {
  return competitors.reduce((sum, comp) => sum + comp.estimatedRevenue, 0);
};
