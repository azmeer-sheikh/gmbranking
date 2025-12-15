export interface BusinessCategory {
  id: string;
  name: string;
  icon: string;
  avgJobValue: number;
  conversionRate: number;
  description: string;
}

export const businessCategories: BusinessCategory[] = [
  {
    id: 'plumbing',
    name: 'Plumbing Services',
    icon: '🔧',
    avgJobValue: 450,
    conversionRate: 0.08,
    description: 'Emergency repairs, installations, maintenance'
  },
  {
    id: 'hvac',
    name: 'HVAC Services',
    icon: '❄️',
    avgJobValue: 850,
    conversionRate: 0.06,
    description: 'Heating, cooling, air conditioning services'
  },
  {
    id: 'dental',
    name: 'Dental Clinics',
    icon: '🦷',
    avgJobValue: 320,
    conversionRate: 0.12,
    description: 'General dentistry, cosmetic procedures'
  },
  {
    id: 'legal',
    name: 'Law Firms',
    icon: '⚖️',
    avgJobValue: 2500,
    conversionRate: 0.05,
    description: 'Legal services, consultations, representation'
  },
  {
    id: 'roofing',
    name: 'Roofing Contractors',
    icon: '🏠',
    avgJobValue: 6500,
    conversionRate: 0.04,
    description: 'Roof repair, replacement, installation'
  },
  {
    id: 'locksmith',
    name: 'Locksmith Services',
    icon: '🔑',
    avgJobValue: 180,
    conversionRate: 0.15,
    description: 'Emergency lockouts, rekeying, installations'
  },
  {
    id: 'electrician',
    name: 'Electricians',
    icon: '⚡',
    avgJobValue: 380,
    conversionRate: 0.09,
    description: 'Electrical repairs, installations, upgrades'
  },
  {
    id: 'carpet-cleaning',
    name: 'Carpet Cleaning',
    icon: '🧹',
    avgJobValue: 220,
    conversionRate: 0.11,
    description: 'Professional carpet and upholstery cleaning'
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    icon: '🐜',
    avgJobValue: 280,
    conversionRate: 0.10,
    description: 'Pest inspection, treatment, prevention'
  },
  {
    id: 'auto-repair',
    name: 'Auto Repair',
    icon: '🚗',
    avgJobValue: 550,
    conversionRate: 0.07,
    description: 'Vehicle maintenance and repair services'
  }
];

export const getCategoryById = (id: string): BusinessCategory | undefined => {
  return businessCategories.find(cat => cat.id === id);
};
