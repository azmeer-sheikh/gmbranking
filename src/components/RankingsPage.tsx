import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { Trophy, TrendingUp, Edit2, Check } from 'lucide-react';

const COLORS = ['#0052CC', '#00C47E', '#FF3B30', '#FFA500', '#9333EA', '#EC4899', '#14B8A6', '#F59E0B'];

export function RankingsPage() {
  const { keywords, rankings, updateRanking } = useData();
  const filteredKeywords = useData().getFilteredKeywords();
  const [selectedKeywordId, setSelectedKeywordId] = useState<string>('');
  const [editingRankId, setEditingRankId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const selectedKeyword = keywords.find((k) => k.id === selectedKeywordId);
  const keywordRankings = rankings
    .filter((r) => r.keywordId === selectedKeywordId)
    .sort((a, b) => a.rank - b.rank);

  const handleEditClick = (rankId: string, currentValue: number) => {
    setEditingRankId(rankId);
    setEditValue(currentValue.toString());
  };

  const handleSaveEdit = (rankId: string) => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue) && newValue >= 0 && newValue <= 100) {
      updateRanking(rankId, newValue);
    }
    setEditingRankId(null);
  };

  // Prepare chart data
  const pieChartData = keywordRankings.map((r) => ({
    name: r.gmbName,
    value: r.trafficShare,
  }));

  const revenueData = keywordRankings.map((r) => ({
    name: r.gmbName,
    rank: r.rank,
    revenue: selectedKeyword
      ? (selectedKeyword.monthlySearches * (r.trafficShare / 100) * selectedKeyword.avgJobSize)
      : 0,
  }));

  const yearlyData = keywordRankings.slice(0, 5).map((r) => {
    const monthlyRevenue = selectedKeyword
      ? (selectedKeyword.monthlySearches * (r.trafficShare / 100) * selectedKeyword.avgJobSize)
      : 0;
    return {
      name: r.gmbName,
      rank: r.rank,
      monthly: monthlyRevenue,
      yearly: monthlyRevenue * 12,
    };
  });

  return (
    <div className="min-h-screen bg-[#F7F9FB] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">GMB Rankings Analysis</h1>
          <p className="text-muted-foreground">
            Detailed ranking positions and traffic distribution for each keyword
          </p>
        </div>

        <Card className="p-6 mb-6">
          <label className="block mb-2 text-sm">Select Keyword</label>
          <Select value={selectedKeywordId} onValueChange={setSelectedKeywordId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a keyword to analyze..." />
            </SelectTrigger>
            <SelectContent>
              {filteredKeywords.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.keyword} - {k.city}, {k.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {selectedKeyword && keywordRankings.length > 0 ? (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#0052CC]/10 rounded-lg">
                    <Trophy className="size-5 text-[#0052CC]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Searches</p>
                    <p className="text-2xl">{formatNumber(selectedKeyword.monthlySearches)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#00C47E]/10 rounded-lg">
                    <TrendingUp className="size-5 text-[#00C47E]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Job Size</p>
                    <p className="text-2xl">{formatCurrency(selectedKeyword.avgJobSize)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#FF3B30]/10 rounded-lg">
                    <Trophy className="size-5 text-[#FF3B30]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Competitors Ranked</p>
                    <p className="text-2xl">{keywordRankings.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 mb-6">
              <h3 className="mb-4">Ranking Positions</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>GMB Business Name</TableHead>
                      <TableHead className="text-right">Traffic Share %</TableHead>
                      <TableHead className="text-right">Est. Monthly Traffic</TableHead>
                      <TableHead className="text-right">Est. Monthly Revenue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywordRankings.map((ranking) => {
                      const traffic = selectedKeyword.monthlySearches * (ranking.trafficShare / 100);
                      const revenue = traffic * selectedKeyword.avgJobSize;
                      const isEditing = editingRankId === ranking.id;

                      return (
                        <TableRow
                          key={ranking.id}
                          className={ranking.isMyBusiness ? 'bg-[#0052CC]/5' : ''}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                  ranking.rank <= 3
                                    ? 'bg-[#00C47E] text-white'
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {ranking.rank}
                              </span>
                              {ranking.isMyBusiness && (
                                <span className="text-xs bg-[#0052CC] text-white px-2 py-1 rounded">
                                  YOU
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{ranking.gmbName}</TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-2">
                                <Input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-20 text-right"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                                <span>%</span>
                              </div>
                            ) : (
                              <span>{ranking.trafficShare.toFixed(1)}%</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(traffic)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(revenue)}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(ranking.id)}
                                variant="ghost"
                              >
                                <Check className="size-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleEditClick(ranking.id, ranking.trafficShare)}
                                variant="ghost"
                              >
                                <Edit2 className="size-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card className="p-6">
                <h3 className="mb-4">Traffic Share Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4">Estimated Monthly Revenue by Rank</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rank" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="revenue" fill="#0052CC" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="mb-4">Yearly Revenue Opportunity (Top 5)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="monthly"
                    stroke="#0052CC"
                    name="Monthly Revenue"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="yearly"
                    stroke="#00C47E"
                    name="Yearly Revenue"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </>
        ) : (
          <Card className="p-12 text-center">
            <Trophy className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No Rankings Data</h3>
            <p className="text-muted-foreground">
              {selectedKeyword
                ? 'No ranking data found for this keyword'
                : 'Select a keyword to view its ranking analysis'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
