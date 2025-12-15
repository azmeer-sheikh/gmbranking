import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  calculateKeywordMetrics,
  formatCurrency,
  formatNumber,
} from '../utils/calculations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card } from './ui/card';
import { Search, ArrowUpDown } from 'lucide-react';
import { Button } from './ui/button';

type SortField =
  | 'keyword'
  | 'monthlySearches'
  | 'totalRevenuePotential'
  | 'myTrafficShare'
  | 'lostMonthlyRevenue'
  | 'lostYearlyRevenue';

export function KeywordsPage() {
  const { rankings } = useData();
  const filteredKeywords = useData().getFilteredKeywords();
  const [sortField, setSortField] = useState<SortField>('lostMonthlyRevenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const keywordsWithMetrics = filteredKeywords
    .map((keyword) => {
      const metrics = calculateKeywordMetrics(keyword, rankings);
      return {
        ...keyword,
        ...metrics,
      };
    })
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'keyword') {
        return multiplier * a.keyword.localeCompare(b.keyword);
      }
      return multiplier * (a[sortField] - b[sortField]);
    });

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 -ml-3"
    >
      {label}
      <ArrowUpDown className="ml-2 size-4" />
    </Button>
  );

  return (
    <div className="min-h-screen bg-[#F7F9FB] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Keywords Analysis</h1>
          <p className="text-muted-foreground">
            Detailed breakdown of search volume, revenue potential, and lost opportunities
          </p>
        </div>

        {keywordsWithMetrics.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No Keywords Found</h3>
            <p className="text-muted-foreground">
              Upload keyword data or adjust your filters to see results
            </p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortButton field="keyword" label="Keyword" />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortButton field="monthlySearches" label="Monthly Searches" />
                    </TableHead>
                    <TableHead className="text-right">Avg Job Size</TableHead>
                    <TableHead className="text-right">
                      <SortButton
                        field="totalRevenuePotential"
                        label="Revenue Potential"
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortButton field="myTrafficShare" label="My Traffic %" />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortButton
                        field="lostMonthlyRevenue"
                        label="Lost Revenue (Monthly)"
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortButton
                        field="lostYearlyRevenue"
                        label="Lost Revenue (Yearly)"
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keywordsWithMetrics.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div>{item.keyword}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.city}, {item.state}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.monthlySearches)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.avgJobSize)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-[#00C47E]">
                          {formatCurrency(item.totalRevenuePotential)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            item.myRankShare > 0
                              ? 'text-[#0052CC]'
                              : 'text-muted-foreground'
                          }
                        >
                          {item.myRankShare.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-[#FF3B30]">
                          {formatCurrency(item.lostMonthlyRevenue)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-[#FF3B30]">
                          {formatCurrency(item.lostYearlyRevenue)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
