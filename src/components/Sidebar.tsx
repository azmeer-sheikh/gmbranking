import React from 'react';
import {
  LayoutDashboard,
  Search,
  TrendingUp,
  Users,
  Target,
  Upload,
} from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'keywords', label: 'Keywords', icon: Search },
    { id: 'rankings', label: 'Rankings', icon: TrendingUp },
    { id: 'competitors', label: 'Competitors', icon: Users },
    { id: 'simulator', label: 'ROI Simulator', icon: Target },
    { id: 'data', label: 'Upload Data', icon: Upload },
  ];

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4 hidden md:block">
      <div className="mb-8 px-2">
        <h2 className="text-[#0052CC]">GMB Revenue Dashboard</h2>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="size-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="mt-8 p-4 bg-gradient-to-br from-[#0052CC] to-[#0052CC]/80 rounded-lg text-white">
        <h4 className="mb-2">Ready to Rank?</h4>
        <p className="text-sm opacity-90 mb-3">
          See how much revenue you're missing and get started today.
        </p>
      </div>
    </div>
  );
}
