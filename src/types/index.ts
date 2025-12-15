export interface Keyword {
  id: string;
  state: string;
  city: string;
  keyword: string;
  monthlySearches: number;
  competition: string;
  cpc: number;
  avgJobSize: number;
}

export interface GMBRanking {
  id: string;
  keywordId: string;
  rank: number;
  gmbName: string;
  trafficShare: number;
  isMyBusiness?: boolean;
}

export interface DefaultTrafficShare {
  [rank: number]: number;
}

export const DEFAULT_TRAFFIC_SHARES: DefaultTrafficShare = {
  1: 15,
  2: 12,
  3: 8,
  4: 5,
  5: 3,
  6: 2,
  7: 1,
  8: 0.5,
};

export interface KeywordWithRankings extends Keyword {
  rankings: GMBRanking[];
}

export interface DashboardFilters {
  state: string;
  city: string;
  keyword: string;
}
