import * as XLSX from 'xlsx';

// Excel Template Structures
export interface ExcelClientRow {
  business_name: string;
  area: string;
  category: string;
  gbp_score: number;
  monthly_searches: number;
  current_rank: number;
  contact_email?: string;
  contact_phone?: string;
}

export interface ExcelKeywordRow {
  client_business_name: string;
  keyword: string;
  category?: string;
  search_volume: number;
  current_rank: number;
  target_rank?: number;
  difficulty: string;
  intent: string;
  cpc?: number;
  competitor_1?: number; // Rank of first competitor
  competitor_2?: number; // Rank of second competitor
  competitor_3?: number; // Rank of third competitor
}

export interface ExcelCompetitorRow {
  competitor_name: string;
  area: string;
  category?: string;
  keywords?: string; // Comma-separated keyword names
}

export interface ExcelGlobalKeywordRow {
  keyword: string;
  category: string;
  search_volume: number;
  difficulty: string;
  intent: string;
  seasonal_trend?: string;
  cpc?: number;
  competitor_1?: number;
  competitor_2?: number;
  competitor_3?: number;
}

// Sample data for templates
const sampleClients: ExcelClientRow[] = [
  {
    business_name: 'ABC Plumbing Services',
    area: 'Downtown Los Angeles',
    category: 'plumbing',
    gbp_score: 85,
    monthly_searches: 12500,
    current_rank: 4,
    contact_email: 'contact@abcplumbing.com',
    contact_phone: '(555) 123-4567',
  },
  {
    business_name: 'Elite HVAC Solutions',
    area: 'Santa Monica',
    category: 'hvac',
    gbp_score: 78,
    monthly_searches: 8900,
    current_rank: 6,
    contact_email: 'info@elitehvac.com',
    contact_phone: '(555) 987-6543',
  },
  {
    business_name: 'Precision Electricians',
    area: 'Beverly Hills',
    category: 'electrical',
    gbp_score: 92,
    monthly_searches: 15200,
    current_rank: 2,
    contact_email: 'service@precisionelectric.com',
    contact_phone: '(555) 456-7890',
  },
];

const sampleKeywords: ExcelKeywordRow[] = [
  {
    client_business_name: 'ABC Plumbing Services',
    keyword: 'emergency plumber downtown la',
    category: 'plumbing',
    search_volume: 3200,
    current_rank: 4,
    target_rank: 1,
    difficulty: 'medium',
    intent: 'transactional',
    cpc: 8.50,
    competitor_1: 2,
    competitor_2: 3,
    competitor_3: 7,
  },
  {
    client_business_name: 'ABC Plumbing Services',
    keyword: 'water heater repair los angeles',
    category: 'plumbing',
    search_volume: 1800,
    current_rank: 7,
    target_rank: 3,
    difficulty: 'high',
    intent: 'transactional',
    cpc: 12.75,
    competitor_1: 2,
    competitor_2: 4,
    competitor_3: 6,
  },
  {
    client_business_name: 'Elite HVAC Solutions',
    keyword: 'ac repair santa monica',
    category: 'hvac',
    search_volume: 2400,
    current_rank: 5,
    target_rank: 2,
    difficulty: 'medium',
    intent: 'transactional',
    cpc: 15.00,
    competitor_1: 1,
    competitor_2: 3,
    competitor_3: 4,
  },
];

const sampleCompetitors: ExcelCompetitorRow[] = [
  {
    competitor_name: 'QuickFix Plumbing',
    area: 'Downtown Los Angeles',
    category: 'plumbing',
    keywords: 'emergency plumber downtown la, water heater repair los angeles',
  },
  {
    competitor_name: 'Pro Plumbers LA',
    area: 'Downtown Los Angeles',
    category: 'plumbing',
    keywords: 'emergency plumber downtown la, water heater repair los angeles',
  },
  {
    competitor_name: 'Cool Air Experts',
    area: 'Santa Monica',
    category: 'hvac',
    keywords: 'ac repair santa monica',
  },
];

const sampleGlobalKeywords: ExcelGlobalKeywordRow[] = [
  {
    keyword: 'emergency plumber',
    category: 'plumbing',
    search_volume: 45000,
    difficulty: 'high',
    intent: 'transactional',
    seasonal_trend: 'winter_peak',
    cpc: 5.50,
    competitor_1: 3,
    competitor_2: 5,
    competitor_3: 8,
  },
  {
    keyword: 'ac repair near me',
    category: 'hvac',
    search_volume: 68000,
    difficulty: 'high',
    intent: 'transactional',
    seasonal_trend: 'summer_peak',
    cpc: 7.25,
    competitor_1: 2,
    competitor_2: 4,
    competitor_3: 7,
  },
  {
    keyword: 'electrician near me',
    category: 'electrical',
    search_volume: 52000,
    difficulty: 'medium',
    intent: 'transactional',
    seasonal_trend: 'stable',
    cpc: 6.80,
    competitor_1: 4,
    competitor_2: 6,
    competitor_3: 9,
  },
];

// Generate Excel template with sample data
export const generateTemplate = (type: 'clients' | 'keywords' | 'competitors' | 'global_keywords'): Blob => {
  let data: any[];
  let sheetName: string;

  switch (type) {
    case 'clients':
      data = sampleClients;
      sheetName = 'Clients';
      break;
    case 'keywords':
      data = sampleKeywords;
      sheetName = 'Keywords';
      break;
    case 'competitors':
      data = sampleCompetitors;
      sheetName = 'Competitors';
      break;
    case 'global_keywords':
      data = sampleGlobalKeywords;
      sheetName = 'Global Keywords';
      break;
    default:
      data = [];
      sheetName = 'Data';
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const wscols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Download template
export const downloadTemplate = (type: 'clients' | 'keywords' | 'competitors' | 'global_keywords') => {
  const blob = generateTemplate(type);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}_template_with_examples.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Parse Excel file
export const parseExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
};

// Validate client data
export const validateClientData = (data: any[]): { valid: boolean; errors: string[]; data: ExcelClientRow[] } => {
  const errors: string[] = [];
  const validData: ExcelClientRow[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 for header row and 0-index

    // Normalize keys - handle both snake_case and readable headers
    const normalizedRow = {
      business_name: row.business_name || row['Business Name'] || row.businessName || '',
      area: row.area || row['Area'] || '',
      category: row.category || row['Category'] || '',
      gbp_score: row.gbp_score || row['GBP Score'] || row['Gbp Score'] || row.gbpScore || 0,
      monthly_searches: row.monthly_searches || row['Monthly Searches'] || row.monthlySearches || 0,
      current_rank: row.current_rank || row['Current Rank'] || row.currentRank || 0,
      contact_email: row.contact_email || row['Contact Email'] || row.contactEmail || '',
      contact_phone: row.contact_phone || row['Contact Phone'] || row.contactPhone || '',
    };

    if (!normalizedRow.business_name || normalizedRow.business_name.trim() === '') {
      errors.push(`Row ${rowNum}: Business name is required`);
    }
    if (!normalizedRow.area || normalizedRow.area.trim() === '') {
      errors.push(`Row ${rowNum}: Area is required`);
    }
    if (!normalizedRow.category || normalizedRow.category.trim() === '') {
      errors.push(`Row ${rowNum}: Category is required`);
    }
    if (normalizedRow.gbp_score && (normalizedRow.gbp_score < 0 || normalizedRow.gbp_score > 100)) {
      errors.push(`Row ${rowNum}: GBP Score must be between 0 and 100`);
    }
    if (normalizedRow.current_rank && normalizedRow.current_rank < 1) {
      errors.push(`Row ${rowNum}: Current rank must be at least 1`);
    }

    if (errors.length === 0 || errors.filter(e => e.includes(`Row ${rowNum}`)).length === 0) {
      validData.push({
        business_name: normalizedRow.business_name,
        area: normalizedRow.area,
        category: normalizedRow.category,
        gbp_score: Number(normalizedRow.gbp_score) || 0,
        monthly_searches: Number(normalizedRow.monthly_searches) || 0,
        current_rank: Number(normalizedRow.current_rank) || 0,
        contact_email: normalizedRow.contact_email || '',
        contact_phone: normalizedRow.contact_phone || '',
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    data: validData,
  };
};

// Validate keyword data
export const validateKeywordData = (data: any[]): { valid: boolean; errors: string[]; data: ExcelKeywordRow[] } => {
  const errors: string[] = [];
  const validData: ExcelKeywordRow[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2;

    // Normalize keys - handle multiple column name variations
    const normalizedRow = {
      client_business_name: row.client_business_name || row['Client Business Name'] || row.clientBusinessName || '',
      keyword: row.keyword || row['Keyword'] || '',
      category: row.category || row['Category'] || '',
      search_volume: row.search_volume || row['Search Volume'] || row.searchVolume || 0,
      current_rank: row.current_rank || row['Current Rank'] || row.currentRank || 10, // Default to 10 if not provided
      target_rank: row.target_rank || row['Target Rank'] || row.targetRank || 1, // Default to 1 if not provided
      difficulty: row.difficulty || row['Difficulty'] || 'medium',
      intent: row.intent || row['Intent'] || 'informational',
      cpc: row.cpc || row['CPC'] || row['Cpc'] || 0,
      // Handle multiple column name variations for competitor ranks
      competitor_1: row.competitor_1 ?? row['Competitor 1'] ?? row['competitor_1'] ?? row.Competitor_1 ?? row.competitor1 ?? row.Competitor1 ?? null,
      competitor_2: row.competitor_2 ?? row['Competitor 2'] ?? row['competitor_2'] ?? row.Competitor_2 ?? row.competitor2 ?? row.Competitor2 ?? null,
      competitor_3: row.competitor_3 ?? row['Competitor 3'] ?? row['competitor_3'] ?? row.Competitor_3 ?? row.competitor3 ?? row.Competitor3 ?? null,
    };

    if (!normalizedRow.client_business_name || normalizedRow.client_business_name.trim() === '') {
      errors.push(`Row ${rowNum}: Client business name is required`);
    }
    if (!normalizedRow.keyword || normalizedRow.keyword.trim() === '') {
      errors.push(`Row ${rowNum}: Keyword is required`);
    }
    // Search volume validation removed - allow 0 or missing values
    // Category validation removed - not needed for client keywords
    // Rank validations removed - using defaults instead

    if (errors.length === 0 || errors.filter(e => e.includes(`Row ${rowNum}`)).length === 0) {
      validData.push({
        client_business_name: normalizedRow.client_business_name,
        keyword: normalizedRow.keyword,
        category: normalizedRow.category || '',
        search_volume: Number(normalizedRow.search_volume) || 0,
        current_rank: Number(normalizedRow.current_rank) || 10,
        target_rank: Number(normalizedRow.target_rank) || 1,
        difficulty: normalizedRow.difficulty,
        intent: normalizedRow.intent,
        cpc: Number(normalizedRow.cpc) || 0,
        // Use nullish coalescing to preserve 0 values and convert to number or null
        competitor_1: normalizedRow.competitor_1 !== null && normalizedRow.competitor_1 !== undefined && normalizedRow.competitor_1 !== '' ? Number(normalizedRow.competitor_1) : null,
        competitor_2: normalizedRow.competitor_2 !== null && normalizedRow.competitor_2 !== undefined && normalizedRow.competitor_2 !== '' ? Number(normalizedRow.competitor_2) : null,
        competitor_3: normalizedRow.competitor_3 !== null && normalizedRow.competitor_3 !== undefined && normalizedRow.competitor_3 !== '' ? Number(normalizedRow.competitor_3) : null,
      });
      
      // Debug log for first 3 rows to verify competitor data
      if (validData.length <= 3) {
        console.log(`📊 Excel Validation Row ${rowNum}:`, {
          keyword: normalizedRow.keyword,
          competitor_1_raw: normalizedRow.competitor_1,
          competitor_2_raw: normalizedRow.competitor_2,
          competitor_3_raw: normalizedRow.competitor_3,
          competitor_1_final: validData[validData.length - 1].competitor_1,
          competitor_2_final: validData[validData.length - 1].competitor_2,
          competitor_3_final: validData[validData.length - 1].competitor_3,
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    data: validData,
  };
};

// Validate competitor data
export const validateCompetitorData = (data: any[]): { valid: boolean; errors: string[]; data: ExcelCompetitorRow[] } => {
  const errors: string[] = [];
  const validData: ExcelCompetitorRow[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2;

    // Normalize keys
    const normalizedRow = {
      competitor_name: row.competitor_name || row['Competitor Name'] || row.competitorName || '',
      area: row.area || row['Area'] || '',
      category: row.category || row['Category'] || '',
      keywords: row.keywords || row['Keywords'] || '',
    };

    if (!normalizedRow.competitor_name || normalizedRow.competitor_name.trim() === '') {
      errors.push(`Row ${rowNum}: Competitor name is required`);
    }
    if (!normalizedRow.area || normalizedRow.area.trim() === '') {
      errors.push(`Row ${rowNum}: Area is required`);
    }
    if (!normalizedRow.category || normalizedRow.category.trim() === '') {
      errors.push(`Row ${rowNum}: Category is required`);
    }
    if (!normalizedRow.keywords || normalizedRow.keywords.trim() === '') {
      errors.push(`Row ${rowNum}: Keywords are required`);
    }

    if (errors.length === 0 || errors.filter(e => e.includes(`Row ${rowNum}`)).length === 0) {
      validData.push({
        competitor_name: normalizedRow.competitor_name,
        area: normalizedRow.area,
        category: normalizedRow.category || '',
        keywords: normalizedRow.keywords || '',
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    data: validData,
  };
};

// Validate global keyword data
export const validateGlobalKeywordData = (data: any[]): { valid: boolean; errors: string[]; data: ExcelGlobalKeywordRow[] } => {
  const errors: string[] = [];
  const validData: ExcelGlobalKeywordRow[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2;

    // Normalize keys
    const normalizedRow = {
      keyword: row.keyword || row['Keyword'] || '',
      category: row.category || row['Category'] || '',
      search_volume: row.search_volume || row['Search Volume'] || row.searchVolume || 0,
      difficulty: row.difficulty || row['Difficulty'] || 'medium',
      intent: row.intent || row['Intent'] || 'informational',
      seasonal_trend: row.seasonal_trend || row['Seasonal Trend'] || row.seasonalTrend || '',
      cpc: row.cpc || row['CPC'] || row['Cpc'] || 0,
      // Handle multiple column name variations for competitor ranks
      competitor_1: row.competitor_1 ?? row['Competitor 1'] ?? row['competitor_1'] ?? row.Competitor_1 ?? row.competitor1 ?? row.Competitor1 ?? null,
      competitor_2: row.competitor_2 ?? row['Competitor 2'] ?? row['competitor_2'] ?? row.Competitor_2 ?? row.competitor2 ?? row.Competitor2 ?? null,
      competitor_3: row.competitor_3 ?? row['Competitor 3'] ?? row['competitor_3'] ?? row.Competitor_3 ?? row.competitor3 ?? row.Competitor3 ?? null,
    };

    if (!normalizedRow.keyword || normalizedRow.keyword.trim() === '') {
      errors.push(`Row ${rowNum}: Keyword is required`);
    }
    if (!normalizedRow.category || normalizedRow.category.trim() === '') {
      errors.push(`Row ${rowNum}: Category is required`);
    }
    // Search volume validation removed - allow 0 or missing values for global keywords

    if (errors.length === 0 || errors.filter(e => e.includes(`Row ${rowNum}`)).length === 0) {
      validData.push({
        keyword: normalizedRow.keyword,
        category: normalizedRow.category,
        search_volume: Number(normalizedRow.search_volume) || 0,
        difficulty: normalizedRow.difficulty,
        intent: normalizedRow.intent,
        seasonal_trend: normalizedRow.seasonal_trend || '',
        cpc: Number(normalizedRow.cpc) || 0,
        // Use nullish coalescing to preserve 0 values and convert to number or null
        competitor_1: normalizedRow.competitor_1 !== null && normalizedRow.competitor_1 !== undefined && normalizedRow.competitor_1 !== '' ? Number(normalizedRow.competitor_1) : undefined,
        competitor_2: normalizedRow.competitor_2 !== null && normalizedRow.competitor_2 !== undefined && normalizedRow.competitor_2 !== '' ? Number(normalizedRow.competitor_2) : undefined,
        competitor_3: normalizedRow.competitor_3 !== null && normalizedRow.competitor_3 !== undefined && normalizedRow.competitor_3 !== '' ? Number(normalizedRow.competitor_3) : undefined,
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    data: validData,
  };
};

// Export data to Excel
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Data') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};