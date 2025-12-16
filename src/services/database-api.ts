import { projectId, publicAnonKey } from '../utils/supabase/info';
import {
  GlobalKeyword,
  Client,
  ClientDetails,
  Competitor,
  SocialMediaStats,
} from '../types/database';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dc7dce20`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// Initialize database
export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/init-db`, {
      method: 'POST',
      headers,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, message: 'Failed to initialize database' };
  }
}

// Seed database with keywords
export async function seedKeywords(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const response = await fetch(`${API_BASE}/seed-keywords`, {
      method: 'POST',
      headers,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error seeding keywords:', error);
    return { success: false, message: 'Failed to seed keywords' };
  }
}

// Seed demo client "Geter Done 2"
export async function seedDemoClient(): Promise<{ success: boolean; message: string; clientId?: string }> {
  try {
    const response = await fetch(`${API_BASE}/seed-demo-client`, {
      method: 'POST',
      headers,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error seeding demo client:', error);
    return { success: false, message: 'Failed to seed demo client' };
  }
}

// Reload schema cache
export async function reloadSchema(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/reload-schema`, {
      method: 'POST',
      headers,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error reloading schema:', error);
    return { success: false, message: 'Failed to reload schema' };
  }
}

// Get business categories
export async function getCategories(): Promise<Array<{ id: string; name: string; avgJobValue: number; conversionRate: number }>> {
  try {
    const response = await fetch(`${API_BASE}/categories`, { headers });
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// ============ GLOBAL KEYWORDS ============

export async function getGlobalKeywords(): Promise<GlobalKeyword[]> {
  try {
    const response = await fetch(`${API_BASE}/global-keywords`, { headers });
    const data = await response.json();
    return data.keywords || [];
  } catch (error) {
    console.error('Error fetching global keywords:', error);
    return [];
  }
}

export async function addGlobalKeyword(keyword: {
  keyword: string;
  category?: string;
  searchVolume?: number;
  competition?: string;
  cpc?: number;
  competitor1?: number | null;
  competitor2?: number | null;
  competitor3?: number | null;
}): Promise<{ success: boolean; keyword?: GlobalKeyword; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/global-keywords`, {
      method: 'POST',
      headers,
      body: JSON.stringify(keyword),
    });
    const data = await response.json();
    
    if (!response.ok || data.error) {
      console.error('Error adding global keyword:', data.error || 'Unknown error');
      return { success: false, message: data.error || 'Failed to add keyword' };
    }
    
    return { success: true, keyword: data.keyword };
  } catch (error) {
    console.error('Error adding global keyword:', error);
    return { success: false, message: 'Failed to add keyword' };
  }
}

export async function deleteGlobalKeyword(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/global-keywords/${id}`, {
      method: 'DELETE',
      headers,
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting global keyword:', error);
    return false;
  }
}

export async function bulkDeleteGlobalKeywords(ids: string[]): Promise<{ success: boolean; message?: string; count?: number }> {
  try {
    const response = await fetch(`${API_BASE}/global-keywords/bulk-delete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ids }),
    });
    const data = await response.json();
    
    if (!response.ok || data.error) {
      console.error('Error bulk deleting global keywords:', data.error || 'Unknown error');
      return { success: false, message: data.error || 'Failed to delete keywords' };
    }
    
    return { success: true, count: data.count, message: data.message };
  } catch (error) {
    console.error('Error bulk deleting global keywords:', error);
    return { success: false, message: 'Failed to delete keywords' };
  }
}

export async function updateGlobalKeyword(
  id: string,
  updates: {
    keyword?: string;
    category?: string;
    searchVolume?: number;
    competition?: string;
    cpc?: number;
    competitor1?: number | null;
    competitor2?: number | null;
    competitor3?: number | null;
  }
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/global-keywords/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    
    if (!response.ok || data.error) {
      console.error('Error updating global keyword:', data.error || 'Unknown error');
      return { success: false, message: data.error || 'Failed to update keyword' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating global keyword:', error);
    return { success: false, message: 'Failed to update keyword' };
  }
}

// ============ CLIENTS ============

export async function getClients(): Promise<Client[]> {
  try {
    const response = await fetch(`${API_BASE}/clients`, { headers });
    const data = await response.json();
    return data.clients || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
}

export async function getClient(id: string): Promise<ClientDetails | null> {
  try {
    const response = await fetch(`${API_BASE}/clients/${id}`, { headers });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
}

export async function createClient(client: {
  businessName: string;
  area: string;
  location: string;
  category: string;
  phoneNumber?: string;
  websiteUrl?: string;
  keywordIds?: string[];
}): Promise<{ success: boolean; client?: Client }> {
  try {
    const response = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify(client),
    });
    const data = await response.json();
    
    // Check if there was an error in the response
    if (!response.ok || data.error) {
      console.error('Error creating client on server:', data.error || 'Unknown error');
      return { success: false };
    }
    
    return { success: true, client: data.client };
  } catch (error) {
    console.error('Error creating client:', error);
    return { success: false };
  }
}

export async function updateClient(
  id: string,
  updates: {
    businessName?: string;
    area?: string;
    location?: string;
    category?: string;
    phoneNumber?: string;
    gbpScore?: number;
    damageScore?: number;
  }
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating client:', error);
    return false;
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'DELETE',
      headers,
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting client:', error);
    return false;
  }
}

// ============ COMPETITORS ============

export async function getCompetitors(): Promise<Competitor[]> {
  try {
    const response = await fetch(`${API_BASE}/competitors`, { headers });
    const data = await response.json();
    return data.competitors || [];
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return [];
  }
}

export async function createCompetitor(competitor: {
  competitorName: string;
  area: string;
  category?: string;
  clientId?: string;
  keywordIds?: string[];
}): Promise<{ success: boolean; competitor?: Competitor }> {
  try {
    const response = await fetch(`${API_BASE}/competitors`, {
      method: 'POST',
      headers,
      body: JSON.stringify(competitor),
    });
    const data = await response.json();
    return { success: true, competitor: data.competitor };
  } catch (error) {
    console.error('Error creating competitor:', error);
    return { success: false };
  }
}

export async function deleteCompetitor(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/competitors/${id}`, {
      method: 'DELETE',
      headers,
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting competitor:', error);
    return false;
  }
}

export async function updateCompetitor(
  id: string,
  updates: {
    competitorName?: string;
    area?: string;
    category?: string;
    keywordIds?: string[];
  }
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/competitors/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    
    if (!response.ok || data.error) {
      console.error('Error updating competitor:', data.error || 'Unknown error');
      return { success: false, message: data.error || 'Failed to update competitor' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating competitor:', error);
    return { success: false, message: 'Failed to update competitor' };
  }
}

// ============ SOCIAL MEDIA STATS ============

export async function getSocialStats(clientId: string): Promise<SocialMediaStats[]> {
  try {
    const response = await fetch(`${API_BASE}/social-stats/${clientId}`, { headers });
    const data = await response.json();
    return data.stats || [];
  } catch (error) {
    console.error('Error fetching social stats:', error);
    return [];
  }
}

export async function saveSocialStats(stats: {
  clientId: string;
  platform: string;
  followers?: number;
  engagementRate?: number;
  likes?: number;
  reach?: number;
  impressions?: number;
  date?: string;
}): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/social-stats`, {
      method: 'POST',
      headers,
      body: JSON.stringify(stats),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving social stats:', error);
    return false;
  }
}

// ============ BULK IMPORT ============

export async function bulkImportClients(data: any[]): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/bulk-import/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ clients: data }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error bulk importing clients:', error);
    return { success: false, message: 'Failed to import clients' };
  }
}

export async function bulkImportKeywords(data: any[]): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/bulk-import/keywords`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ keywords: data }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error bulk importing keywords:', error);
    return { success: false, message: 'Failed to import keywords' };
  }
}

export async function bulkImportCompetitors(data: any[]): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/bulk-import/competitors`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ competitors: data }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error bulk importing competitors:', error);
    return { success: false, message: 'Failed to import competitors' };
  }
}

export async function bulkImportGlobalKeywords(data: any[]): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/bulk-import/global-keywords`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ keywords: data }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error bulk importing global keywords:', error);
    return { success: false, message: 'Failed to import global keywords' };
  }
}

// ============ CLIENT KEYWORDS ============

export async function getClientKeywords(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/client-keywords`, { headers });
    const result = await response.json();
    return result.client_keywords || [];
  } catch (error) {
    console.error('Error fetching client keywords:', error);
    return [];
  }
}

export async function updateClientKeyword(id: string, data: {
  currentRank?: number;
  targetRank?: number;
  cpc?: number;
  competitor1?: number | null;
  competitor2?: number | null;
  competitor3?: number | null;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/client-keywords/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return { success: !result.error, message: result.message || result.error };
  } catch (error) {
    console.error('Error updating client keyword:', error);
    return { success: false, message: 'Failed to update client keyword' };
  }
}

export async function deleteClientKeyword(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/client-keywords/${id}`, {
      method: 'DELETE',
      headers,
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting client keyword:', error);
    return false;
  }
}

// ============ COMPREHENSIVE CLIENT DATA ============

export async function createComprehensiveClient(data: any): Promise<{ success: boolean; clientId?: string; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/comprehensive-clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    
    if (!response.ok || result.error) {
      console.error('Error creating comprehensive client:', result.error || 'Unknown error');
      return { success: false, message: result.error || 'Failed to create client' };
    }
    
    return { success: true, clientId: result.clientId };
  } catch (error) {
    console.error('Error creating comprehensive client:', error);
    return { success: false, message: 'Failed to create comprehensive client' };
  }
}

export async function getComprehensiveClient(clientId: string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE}/comprehensive-clients/${clientId}`, { headers });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching comprehensive client:', error);
    return null;
  }
}

export async function updateComprehensiveClient(clientId: string, data: any): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/comprehensive-clients/${clientId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    
    if (!response.ok || result.error) {
      console.error('Error updating comprehensive client:', result.error || 'Unknown error');
      return { success: false, message: result.error || 'Failed to update client' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating comprehensive client:', error);
    return { success: false, message: 'Failed to update comprehensive client' };
  }
}

// Get service areas for a client (for map display)
export async function getClientServiceAreas(clientId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/service-areas/${clientId}`, { headers });
    const data = await response.json();
    return data.areas || [];
  } catch (error) {
    console.error('Error fetching service areas:', error);
    return [];
  }
}