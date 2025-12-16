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
  
  // Use REAL competitor rankings from database instead of generating random data
  const competitorRanks = [
    { rank: keyword.competitor1Rank, name: 'Competitor #1' },
    { rank: keyword.competitor2Rank, name: 'Competitor #2' },
    { rank: keyword.competitor3Rank, name: 'Competitor #3' }
  ];
  
  // Only include competitors that have actual rankings from database
  competitorRanks.forEach((comp, index) => {
    if (comp.rank && comp.rank > 0) {
      const ctr = ctrByRank[comp.rank] || 0.01; // Use actual rank position for CTR
      const estimatedClicks = Math.round(keyword.searchVolume * ctr);
      const estimatedRevenue = Math.round(estimatedClicks * conversionRate * avgJobValue);
      
      competitors.push({
        id: `comp-${keyword.id}-${index + 1}`,
        businessName: comp.name,
        ranking: comp.rank, // Use REAL rank from database
        domain: `competitor${index + 1}.com`,
        reviews: 150 + (index * 50), // Static placeholder
        rating: 4.5 - (index * 0.1), // Static placeholder
        estimatedRevenue,
        estimatedClicks
      });
    }
  });
  
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
