import { Keyword, GMBRanking } from '../types';

export const calculateTopThreeOpportunity = (monthlySearches: number): number => {
  return monthlySearches * 0.35;
};

export const calculateMyCurrentTraffic = (
  monthlySearches: number,
  myRankShare: number
): number => {
  return monthlySearches * (myRankShare / 100);
};

export const calculateLostTraffic = (
  monthlySearches: number,
  myRankShare: number
): number => {
  const opportunity = calculateTopThreeOpportunity(monthlySearches);
  const myTraffic = calculateMyCurrentTraffic(monthlySearches, myRankShare);
  return opportunity - myTraffic;
};

export const calculateLostRevenue = (
  lostTraffic: number,
  avgJobSize: number
): number => {
  return lostTraffic * avgJobSize;
};

export const calculateYearlyRevenue = (monthlyRevenue: number): number => {
  return monthlyRevenue * 12;
};

export const getMyRankingForKeyword = (
  keywordId: string,
  rankings: GMBRanking[]
): GMBRanking | undefined => {
  return rankings.find((r) => r.keywordId === keywordId && r.isMyBusiness);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
};

export const calculateKeywordMetrics = (
  keyword: Keyword,
  rankings: GMBRanking[]
) => {
  const myRanking = getMyRankingForKeyword(keyword.id, rankings);
  const myRankShare = myRanking?.trafficShare || 0;

  const opportunity = calculateTopThreeOpportunity(keyword.monthlySearches);
  const myTraffic = calculateMyCurrentTraffic(keyword.monthlySearches, myRankShare);
  const lostTraffic = calculateLostTraffic(keyword.monthlySearches, myRankShare);
  const lostMonthlyRevenue = calculateLostRevenue(lostTraffic, keyword.avgJobSize);
  const lostYearlyRevenue = calculateYearlyRevenue(lostMonthlyRevenue);
  const totalRevenuePotential = opportunity * keyword.avgJobSize;

  return {
    opportunity,
    myTraffic,
    myRankShare,
    lostTraffic,
    lostMonthlyRevenue,
    lostYearlyRevenue,
    totalRevenuePotential,
    myRanking,
  };
};

/**
 * Calculate total revenue loss for a client based on keyword search volumes
 * Formula: 35% of total selected search volume * avg job price
 * @param totalSearchVolume - Total search volume of selected keywords
 * @param avgJobPrice - Average price per job for the client
 * @returns Monthly revenue loss
 */
export const calculateTotalRevenueLoss = (
  totalSearchVolume: number,
  avgJobPrice: number = 0
): number => {
  if (!avgJobPrice) return 0;
  const potentialConversions = totalSearchVolume * 0.35; // 35% of search volume
  return potentialConversions * avgJobPrice;
};

/**
 * Calculate revenue loss from selected keywords for a client
 * @param keywords - Array of keywords with search volumes
 * @param avgJobPrice - Average price per job for the client
 * @returns Object with revenue calculations
 */
export const calculateKeywordRevenueLoss = (
  keywords: Array<{ search_volume: number; cpc?: number }>,
  avgJobPrice: number = 0
) => {
  const totalSearchVolume = keywords.reduce((sum, kw) => sum + (kw.search_volume || 0), 0);
  const monthlyRevenueLoss = calculateTotalRevenueLoss(totalSearchVolume, avgJobPrice);
  const yearlyRevenueLoss = monthlyRevenueLoss * 12;
  const potentialConversions = totalSearchVolume * 0.35;
  
  return {
    totalSearchVolume,
    potentialConversions,
    monthlyRevenueLoss,
    yearlyRevenueLoss,
    avgJobPrice,
  };
};