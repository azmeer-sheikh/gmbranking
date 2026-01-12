import { Keyword, GMBRanking } from '../types';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-dc7dce20`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// Transform database keywords to frontend format
const transformDbKeywordToFrontend = (dbKeyword: any): Keyword => ({
  id: dbKeyword.id,
  state: dbKeyword.state,
  city: dbKeyword.city,
  keyword: dbKeyword.keyword,
  monthlySearches: dbKeyword.monthly_searches,
  competition: dbKeyword.competition,
  cpc: parseFloat(dbKeyword.cpc),
  avgJobSize: parseFloat(dbKeyword.avg_job_size),
});

// Transform database rankings to frontend format
const transformDbRankingToFrontend = (dbRanking: any): GMBRanking => ({
  id: dbRanking.id,
  keywordId: dbRanking.keyword_id,
  rank: dbRanking.rank,
  gmbName: dbRanking.gmb_name,
  trafficShare: parseFloat(dbRanking.traffic_share),
  isMyBusiness: dbRanking.is_my_business,
});

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Initialize database
export const initializeDatabase = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/init-db`, {
      method: 'POST',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Database initialization failed:', data);
      return { success: false, message: data.error || data.message };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, message: `Failed to initialize database: ${error}` };
  }
};

// Fetch all keywords
export const fetchKeywords = async (): Promise<Keyword[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/keywords`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching keywords:', errorData);
      throw new Error(errorData.error || 'Failed to fetch keywords');
    }

    const data = await response.json();
    return (data.keywords || []).map(transformDbKeywordToFrontend);
  } catch (error) {
    console.error('Error fetching keywords:', error);
    throw error;
  }
};

// Save keywords to database
export const saveKeywords = async (keywords: Keyword[]): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/keywords`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ keywords }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error saving keywords:', errorData);
      throw new Error(errorData.error || 'Failed to save keywords');
    }

    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error saving keywords:', error);
    throw error;
  }
};

// Fetch all rankings
export const fetchRankings = async (): Promise<GMBRanking[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rankings`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching rankings:', errorData);
      throw new Error(errorData.error || 'Failed to fetch rankings');
    }

    const data = await response.json();
    return (data.rankings || []).map(transformDbRankingToFrontend);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    throw error;
  }
};

// Save rankings to database
export const saveRankings = async (rankings: GMBRanking[]): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rankings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rankings }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error saving rankings:', errorData);
      throw new Error(errorData.error || 'Failed to save rankings');
    }

    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error saving rankings:', error);
    throw error;
  }
};

// Update ranking traffic share
export const updateRankingTrafficShare = async (
  id: string,
  trafficShare: number
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rankings/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ trafficShare }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error updating ranking:', errorData);
      throw new Error(errorData.error || 'Failed to update ranking');
    }

    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error updating ranking:', error);
    throw error;
  }
};

// Reset all data
export const resetAllData = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reset`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error resetting data:', errorData);
      throw new Error(errorData.error || 'Failed to reset data');
    }

    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
};

// Seed keywords
export const seedKeywords = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/seed-keywords`, {
      method: 'POST',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Seed keywords failed:', data);
      return { success: false, message: data.error || data.message };
    }

    return { success: true, message: data.message, details: data.details };
  } catch (error) {
    console.error('Error seeding keywords:', error);
    return { success: false, message: `Failed to seed keywords: ${error}` };
  }
};

// Get clients
export const getClients = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching clients:', errorData);
      throw new Error(errorData.error || 'Failed to fetch clients');
    }

    const data = await response.json();
    return data.clients || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};