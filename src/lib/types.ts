export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  businessName: string;
}

export interface Keyword {
  id: string;
  keyword: string;
  searchVolume: number;
  currentRank: number;
  targetRank: number;
  cpc: number;
  difficulty: number;
  locationId: string;
  category: string;
  competitor1Rank?: number; // Rank of first competitor
  competitor2Rank?: number; // Rank of second competitor
  competitor3Rank?: number; // Rank of third competitor
}

export interface RankingMetrics {
  keywordId: string;
  locationId: string;
  currentRank: number;
  previousRank: number;
  ctr: number;
  estimatedClicks: number;
  estimatedRevenue: number;
  revenueLoss: number;
  conversionRate: number;
}

export interface PerformanceData {
  date: string;
  rank: number;
  clicks: number;
  revenue: number;
}