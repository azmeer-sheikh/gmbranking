import React from 'react';
import { useData } from '../context/DataContext';
import { KPICard } from './KPICard';
import {
  calculateKeywordMetrics,
  formatCurrency,
  formatNumber,
} from '../utils/calculations';
import {
  Search,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  Calendar,
  BarChart3,
  Target,
} from 'lucide-react';

export function HomeDashboard() {
  const { rankings } = useData();
  const filteredKeywords = useData().getFilteredKeywords();

  // Calculate aggregate metrics
  const totalMonthlySearches = filteredKeywords.reduce(
    (sum, k) => sum + k.monthlySearches,
    0
  );

  const totalRevenueOpportunity = filteredKeywords.reduce((sum, k) => {
    const metrics = calculateKeywordMetrics(k, rankings);
    return sum + metrics.totalRevenuePotential;
  }, 0);

  const totalMyTraffic = filteredKeywords.reduce((sum, k) => {
    const metrics = calculateKeywordMetrics(k, rankings);
    return sum + metrics.myTraffic;
  }, 0);

  const totalLostMonthlyRevenue = filteredKeywords.reduce((sum, k) => {
    const metrics = calculateKeywordMetrics(k, rankings);
    return sum + metrics.lostMonthlyRevenue;
  }, 0);

  const totalLostYearlyRevenue = totalLostMonthlyRevenue * 12;

  // Count unique competitors
  const competitors = new Set(
    rankings
      .filter((r) => !r.isMyBusiness)
      .filter((r) => filteredKeywords.some((k) => k.id === r.keywordId))
      .map((r) => r.gmbName)
  );

  const competitorsCapturing = competitors.size;

  // Calculate average difficulty score (based on competition)
  const avgDifficulty =
    filteredKeywords.length > 0
      ? (filteredKeywords.filter((k) => k.competition === 'High').length /
          filteredKeywords.length) *
        100
      : 0;

  // Calculate top competitor strength (how many top 3 positions they have)
  const competitorStrength = new Map<string, number>();
  rankings
    .filter((r) => !r.isMyBusiness && r.rank <= 3)
    .filter((r) => filteredKeywords.some((k) => k.id === r.keywordId))
    .forEach((r) => {
      competitorStrength.set(r.gmbName, (competitorStrength.get(r.gmbName) || 0) + 1);
    });
  const topCompetitorStrength = Math.max(...Array.from(competitorStrength.values()), 0);

  const myTrafficSharePercent =
    totalMonthlySearches > 0
      ? ((totalMyTraffic / totalMonthlySearches) * 100).toFixed(1)
      : '0';

  return (
    <div className="min-h-screen bg-[#F7F9FB] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">GMB Revenue Opportunity Dashboard</h1>
          <p className="text-muted-foreground">
            Your complete overview of lost revenue and ranking opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Monthly Searches"
            value={formatNumber(totalMonthlySearches)}
            icon={Search}
            subtitle="Potential impressions"
          />
          <KPICard
            title="Revenue Opportunity"
            value={formatCurrency(totalRevenueOpportunity)}
            icon={DollarSign}
            subtitle="Top 3 monthly potential"
            variant="primary"
          />
          <KPICard
            title="Competitors Capturing"
            value={competitorsCapturing}
            icon={Users}
            subtitle="Unique businesses"
          />
          <KPICard
            title="My Current Traffic Share"
            value={`${myTrafficSharePercent}%`}
            icon={TrendingUp}
            subtitle={`${formatNumber(totalMyTraffic)} searches/mo`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Lost Monthly Revenue"
            value={formatCurrency(totalLostMonthlyRevenue)}
            icon={AlertTriangle}
            subtitle="Missing each month"
            variant="danger"
          />
          <KPICard
            title="Lost Yearly Revenue"
            value={formatCurrency(totalLostYearlyRevenue)}
            icon={Calendar}
            subtitle="Annual opportunity cost"
            variant="danger"
          />
          <KPICard
            title="Ranking Difficulty"
            value={`${avgDifficulty.toFixed(0)}%`}
            icon={BarChart3}
            subtitle="Based on competition"
          />
          <KPICard
            title="Top Competitor Strength"
            value={topCompetitorStrength}
            icon={Target}
            subtitle="Top 3 positions held"
          />
        </div>

        {filteredKeywords.length === 0 && (
          <div className="bg-white rounded-lg border-2 border-dashed p-12 text-center">
            <Search className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Upload keyword and ranking data to see your revenue opportunities
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
