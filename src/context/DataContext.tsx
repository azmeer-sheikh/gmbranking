import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Keyword, GMBRanking, DashboardFilters } from '../types';
import {
  fetchKeywords,
  saveKeywords,
  fetchRankings,
  saveRankings,
  updateRankingTrafficShare,
  initializeDatabase,
} from '../services/api';

interface DataContextType {
  keywords: Keyword[];
  rankings: GMBRanking[];
  filters: DashboardFilters;
  isLoading: boolean;
  error: string | null;
  setKeywords: (keywords: Keyword[]) => void;
  setRankings: (rankings: GMBRanking[]) => void;
  setFilters: (filters: DashboardFilters) => void;
  addKeywords: (keywords: Keyword[]) => Promise<void>;
  addRankings: (rankings: GMBRanking[]) => Promise<void>;
  updateRanking: (id: string, trafficShare: number) => Promise<void>;
  loadDataFromBackend: () => Promise<void>;
  getFilteredKeywords: () => Keyword[];
  getStates: () => string[];
  getCities: (state?: string) => string[];
  getKeywordNames: (state?: string, city?: string) => string[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [rankings, setRankings] = useState<GMBRanking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
    state: '',
    city: '',
    keyword: '',
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database and load data on mount
  React.useEffect(() => {
    const initAndLoad = async () => {
      if (isInitialized) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Initialize database tables
        const initResult = await initializeDatabase();
        if (!initResult.success) {
          console.log('Database initialization:', initResult.message);
        }

        // Load existing data
        await loadDataFromBackend();
        setIsInitialized(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };

    initAndLoad();
  }, []);

  const loadDataFromBackend = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [loadedKeywords, loadedRankings] = await Promise.all([
        fetchKeywords(),
        fetchRankings(),
      ]);
      
      setKeywords(loadedKeywords);
      setRankings(loadedRankings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading data from backend:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addKeywords = async (newKeywords: Keyword[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Save to backend
      await saveKeywords(newKeywords);
      
      // Update local state
      setKeywords((prev) => {
        const keywordMap = new Map(prev.map(k => [`${k.state}-${k.city}-${k.keyword}`, k]));
        newKeywords.forEach(k => {
          keywordMap.set(`${k.state}-${k.city}-${k.keyword}`, k);
        });
        return Array.from(keywordMap.values());
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save keywords';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addRankings = async (newRankings: GMBRanking[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Save to backend
      await saveRankings(newRankings);
      
      // Update local state
      setRankings((prev) => {
        const rankingMap = new Map(prev.map(r => [`${r.keywordId}-${r.rank}-${r.gmbName}`, r]));
        newRankings.forEach(r => {
          rankingMap.set(`${r.keywordId}-${r.rank}-${r.gmbName}`, r);
        });
        return Array.from(rankingMap.values());
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save rankings';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRanking = async (id: string, trafficShare: number) => {
    setError(null);
    
    try {
      // Update in backend
      await updateRankingTrafficShare(id, trafficShare);
      
      // Update local state
      setRankings((prev) =>
        prev.map((r) => (r.id === id ? { ...r, trafficShare } : r))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ranking';
      setError(errorMessage);
      throw err;
    }
  };

  const getFilteredKeywords = () => {
    return keywords.filter((k) => {
      if (filters.state && k.state !== filters.state) return false;
      if (filters.city && k.city !== filters.city) return false;
      if (filters.keyword && k.keyword !== filters.keyword) return false;
      return true;
    });
  };

  const getStates = () => {
    return Array.from(new Set(keywords.map((k) => k.state))).filter(Boolean).sort();
  };

  const getCities = (state?: string) => {
    const targetState = state || filters.state;
    return Array.from(
      new Set(
        keywords
          .filter((k) => !targetState || k.state === targetState)
          .map((k) => k.city)
      )
    )
      .filter(Boolean)
      .sort();
  };

  const getKeywordNames = (state?: string, city?: string) => {
    const targetState = state || filters.state;
    const targetCity = city || filters.city;
    return Array.from(
      new Set(
        keywords
          .filter((k) => {
            if (targetState && k.state !== targetState) return false;
            if (targetCity && k.city !== targetCity) return false;
            return true;
          })
          .map((k) => k.keyword)
      )
    )
      .filter(Boolean)
      .sort();
  };

  return (
    <DataContext.Provider
      value={{
        keywords,
        rankings,
        filters,
        isLoading,
        error,
        setKeywords,
        setRankings,
        setFilters,
        addKeywords,
        addRankings,
        updateRanking,
        loadDataFromBackend,
        getFilteredKeywords,
        getStates,
        getCities,
        getKeywordNames,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};