import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Flame, Snowflake } from 'lucide-react';
import { Keyword } from '../lib/types';

const seasonalData = [
  { month: 'Jan', multiplier: 0.85, color: '#60A5FA' },
  { month: 'Feb', multiplier: 0.88, color: '#60A5FA' },
  { month: 'Mar', multiplier: 0.95, color: '#34D399' },
  { month: 'Apr', multiplier: 1.05, color: '#34D399' },
  { month: 'May', multiplier: 1.15, color: '#34D399' },
  { month: 'Jun', multiplier: 1.25, color: '#FBBF24' },
  { month: 'Jul', multiplier: 1.35, color: '#FBBF24' },
  { month: 'Aug', multiplier: 1.30, color: '#FBBF24' },
  { month: 'Sep', multiplier: 1.10, color: '#F97316' },
  { month: 'Oct', multiplier: 1.05, color: '#F97316' },
  { month: 'Nov', multiplier: 0.90, color: '#F97316' },
  { month: 'Dec', multiplier: 0.80, color: '#60A5FA' },
];

interface SeasonalCampaignPlannerProps {
  keywords: Keyword[];
}

export default function SeasonalCampaignPlanner({ keywords }: SeasonalCampaignPlannerProps) {
  const peakSeason = seasonalData.reduce((max, d) => d.multiplier > max.multiplier ? d : max);
  const lowestSeason = seasonalData.reduce((min, d) => d.multiplier < min.multiplier ? d : min);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="size-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Seasonal Trends</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-orange-50 rounded-lg">
          <Flame className="size-4 text-orange-600 mb-1" />
          <p className="text-xs text-slate-600">Peak</p>
          <p className="text-lg font-bold text-slate-900">{peakSeason.month}</p>
          <p className="text-xs text-orange-600">+{((peakSeason.multiplier - 1) * 100).toFixed(0)}%</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Snowflake className="size-4 text-blue-600 mb-1" />
          <p className="text-xs text-slate-600">Low</p>
          <p className="text-lg font-bold text-slate-900">{lowestSeason.month}</p>
          <p className="text-xs text-blue-600">{((lowestSeason.multiplier - 1) * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="flex gap-1">
        {seasonalData.map((data) => (
          <div key={data.month} className="flex-1">
            <div 
              className="h-16 rounded-t transition-all hover:opacity-80"
              style={{ 
                backgroundColor: data.color,
                height: `${data.multiplier * 50}px`,
                opacity: 0.7
              }}
            />
            <p className="text-xs text-center text-slate-600 mt-1">{data.month}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
