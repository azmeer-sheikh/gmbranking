import React from 'react';
import {
  LayoutDashboard,
  Search,
  TrendingUp,
  Users,
  Target,
  Upload,
  X,
} from 'lucide-react';
import { Button } from './ui/button';

interface MobileMenuProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function MobileMenu({ currentPage, onNavigate, onClose, isOpen }: MobileMenuProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'keywords', label: 'Keywords', icon: Search },
    { id: 'rankings', label: 'Rankings', icon: TrendingUp },
    { id: 'competitors', label: 'Competitors', icon: Users },
    { id: 'simulator', label: 'ROI Simulator', icon: Target },
    { id: 'data', label: 'Upload Data', icon: Upload },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-72 bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[#0052CC]">GMB Dashboard</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="size-5" />
          </Button>
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
                onClick={() => handleNavigate(item.id)}
              >
                <Icon className="size-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="mt-8 p-4 bg-gradient-to-br from-[#0052CC] to-[#0052CC]/80 rounded-lg text-white">
          <h4 className="mb-2">Ready to Rank?</h4>
          <p className="text-sm opacity-90">
            See how much revenue you're missing and get started today.
          </p>
        </div>
      </div>
    </div>
  );
}
