import React from 'react';
import { useData } from '../context/DataContext';
import { Card } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { Users, Trophy, Target, DollarSign } from 'lucide-react';
import { Badge } from './ui/badge';

export function CompetitorHeatmap() {
  const { keywords, rankings } = useData();
  const filteredKeywords = useData().getFilteredKeywords();

  // Build competitor analytics
  const competitorMap = new Map<
    string,
    {
      name: string;
      totalKeywords: number;
      top3Keywords: number;
      top5Keywords: number;
      estimatedRevenue: number;
      avgRank: number;
      rankings: Array<{ keyword: string; rank: number; trafficShare: number }>;
    }
  >();

  rankings
    .filter((r) => !r.isMyBusiness)
    .filter((r) => filteredKeywords.some((k) => k.id === r.keywordId))
    .forEach((ranking) => {
      const keyword = keywords.find((k) => k.id === ranking.keywordId);
      if (!keyword) return;

      if (!competitorMap.has(ranking.gmbName)) {
        competitorMap.set(ranking.gmbName, {
          name: ranking.gmbName,
          totalKeywords: 0,
          top3Keywords: 0,
          top5Keywords: 0,
          estimatedRevenue: 0,
          avgRank: 0,
          rankings: [],
        });
      }

      const competitor = competitorMap.get(ranking.gmbName)!;
      competitor.totalKeywords++;
      if (ranking.rank <= 3) competitor.top3Keywords++;
      if (ranking.rank <= 5) competitor.top5Keywords++;

      const traffic = keyword.monthlySearches * (ranking.trafficShare / 100);
      const revenue = traffic * keyword.avgJobSize;
      competitor.estimatedRevenue += revenue;

      competitor.rankings.push({
        keyword: keyword.keyword,
        rank: ranking.rank,
        trafficShare: ranking.trafficShare,
      });
    });

  // Calculate average rank and strength score for each competitor
  const competitors = Array.from(competitorMap.values())
    .map((comp) => {
      const totalRank = comp.rankings.reduce((sum, r) => sum + r.rank, 0);
      comp.avgRank = totalRank / comp.rankings.length;

      // Strength score: weighted by top 3 positions (higher is stronger)
      const strengthScore = comp.top3Keywords * 10 + comp.top5Keywords * 5;

      return { ...comp, strengthScore };
    })
    .sort((a, b) => b.strengthScore - a.strengthScore);

  const getStrengthBadge = (score: number) => {
    if (score >= 50) return { label: 'Dominant', variant: 'default' as const };
    if (score >= 30) return { label: 'Strong', variant: 'default' as const };
    if (score >= 15) return { label: 'Moderate', variant: 'secondary' as const };
    return { label: 'Weak', variant: 'outline' as const };
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Competitor Heatmap</h1>
          <p className="text-muted-foreground">
            Analyze which competitors dominate your market and capture the most revenue
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0052CC]/10 rounded-lg">
                <Users className="size-5 text-[#0052CC]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Competitors</p>
                <p className="text-2xl">{competitors.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00C47E]/10 rounded-lg">
                <Trophy className="size-5 text-[#00C47E]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Performer</p>
                <p className="text-sm truncate">
                  {competitors[0]?.name || 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFA500]/10 rounded-lg">
                <Target className="size-5 text-[#FFA500]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Top 3 Spots</p>
                <p className="text-2xl">
                  {competitors.reduce((sum, c) => sum + c.top3Keywords, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FF3B30]/10 rounded-lg">
                <DollarSign className="size-5 text-[#FF3B30]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl">
                  {formatCurrency(
                    competitors.reduce((sum, c) => sum + c.estimatedRevenue, 0)
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {competitors.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No Competitor Data</h3>
            <p className="text-muted-foreground">
              Upload ranking data to see competitor analysis
            </p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Competitor Name</TableHead>
                    <TableHead className="text-center">Keywords Ranked</TableHead>
                    <TableHead className="text-center">Top 3 Positions</TableHead>
                    <TableHead className="text-center">Top 5 Positions</TableHead>
                    <TableHead className="text-right">Avg Rank</TableHead>
                    <TableHead className="text-right">Est. Monthly Revenue</TableHead>
                    <TableHead className="text-center">Strength</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitors.map((competitor, index) => {
                    const strength = getStrengthBadge(competitor.strengthScore);
                    return (
                      <TableRow key={competitor.name}>
                        <TableCell>
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0
                                ? 'bg-[#FFD700] text-white'
                                : index === 1
                                ? 'bg-[#C0C0C0] text-white'
                                : index === 2
                                ? 'bg-[#CD7F32] text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {index + 1}
                          </span>
                        </TableCell>
                        <TableCell>{competitor.name}</TableCell>
                        <TableCell className="text-center">
                          {competitor.totalKeywords}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#00C47E] text-white">
                            {competitor.top3Keywords}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0052CC] text-white">
                            {competitor.top5Keywords}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {competitor.avgRank.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-[#00C47E]">
                            {formatCurrency(competitor.estimatedRevenue)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={strength.variant}>{strength.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {competitors.length > 0 && (
          <Card className="p-6 mt-6">
            <h3 className="mb-4">Competitor Keyword Details</h3>
            <div className="space-y-6">
              {competitors.slice(0, 5).map((competitor) => (
                <div key={competitor.name} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4>{competitor.name}</h4>
                    <Badge variant="outline">
                      {competitor.totalKeywords} keyword
                      {competitor.totalKeywords !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {competitor.rankings.map((r, i) => (
                      <div
                        key={i}
                        className="bg-muted/50 p-3 rounded-lg flex items-center justify-between"
                      >
                        <span className="text-sm truncate mr-2">{r.keyword}</span>
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            r.rank <= 3
                              ? 'bg-[#00C47E] text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {r.rank}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
