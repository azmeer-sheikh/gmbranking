import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../services/database-api';
import type { Client, ClientDetails, ClientKeyword } from '../types/database';

interface ClientContextType {
  // Client list and selection
  clients: Client[];
  selectedClientId: string;
  selectedClient: Client | null;
  selectedClientData: ClientDetails | null;
  selectedClientServiceAreas: any[];
  setSelectedClientId: (id: string) => void;
  
  // Loading states
  loading: boolean;
  dbInitialized: boolean;
  
  // Client management
  loadClients: () => Promise<void>;
  loadClientData: (clientId: string) => Promise<void>;
  refreshClients: () => Promise<void>;
  
  // Search functionality
  searchQuery: string;
  searchResults: Client[];
  showSearchResults: boolean;
  isSearching: boolean;
  handleSearchChange: (value: string) => void;
  handleSelectBusiness: (client: Client) => void;
  handleClearSearch: () => void;
  
  // Location filtering
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  locations: string[];
  filteredClients: Client[];
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientData, setSelectedClientData] = useState<ClientDetails | null>(null);
  const [selectedClientServiceAreas, setSelectedClientServiceAreas] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [locations, setLocations] = useState<string[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  // Initialize database and load clients on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Load client data when selection changes
  useEffect(() => {
    if (selectedClientId) {
      loadClientData(selectedClientId);
    }
  }, [selectedClientId]);

  // Extract unique locations from clients
  useEffect(() => {
    const uniqueLocations = Array.from(new Set(clients.map(c => c.area).filter(Boolean)));
    setLocations(uniqueLocations);
  }, [clients]);

  // Filter clients based on selected location
  useEffect(() => {
    if (selectedLocation) {
      const filtered = clients.filter(c => c.area === selectedLocation);
      setFilteredClients(filtered);

      // Auto-select first filtered client if current selection doesn't match filter
      if (filtered.length > 0 && !filtered.find(c => c.id === selectedClientId)) {
        setSelectedClientId(filtered[0].id);
      }
    } else {
      setFilteredClients(clients);
    }
  }, [selectedLocation, clients]);

  const initializeApp = async () => {
    setLoading(true);

    // Initialize database
    const initResult = await api.initializeDatabase();
    if (initResult.success) {
      setDbInitialized(true);

      // Load clients
      await loadClients();
    } else {
      console.error('Failed to initialize database:', initResult.message);
    }

    setLoading(false);
  };

  const loadClients = async () => {
    const clientsData = await api.getClients();
    setClients(clientsData);

    // Auto-select first client if available and nothing is selected
    if (clientsData.length > 0 && !selectedClientId) {
      setSelectedClientId(clientsData[0].id);
    }
  };

  const loadClientData = async (clientId: string) => {
    setLoading(true);

    // Fetch real-time data from database
    const data = await api.getClient(clientId);
    setSelectedClientData(data);
    
    // Fetch service areas
    const serviceAreas = await api.getClientServiceAreas(clientId);
    setSelectedClientServiceAreas(serviceAreas);

    // Also refresh the client list to get latest stats
    const clientsData = await api.getClients();
    setClients(clientsData);

    setLoading(false);
  };

  const refreshClients = async () => {
    await loadClients();
    if (selectedClientId) {
      await loadClientData(selectedClientId);
    }
  };

  // Predictive search handler (real-time search as you type)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Clear existing debounce timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // If empty search, clear results but keep selected business
    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    // Show searching state
    setIsSearching(true);

    // Debounce search for performance (300ms delay)
    const timer = setTimeout(() => {
      const query = value.toLowerCase();
      const results = clients.filter(client =>
        client.business_name.toLowerCase().includes(query) ||
        client.area?.toLowerCase().includes(query) ||
        client.address?.toLowerCase().includes(query) ||
        client.category?.toLowerCase().includes(query)
      );

      setSearchResults(results);
      setShowSearchResults(true);
      setIsSearching(false);
    }, 300);

    setSearchDebounceTimer(timer);
  };

  // Handle business selection from search results
  const handleSelectBusiness = (client: Client) => {
    setSelectedClientId(client.id);
    // Keep search query to show what was selected
    setSearchQuery(client.business_name);
    setShowSearchResults(false);
  };

  // Clear search and selected business
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setIsSearching(false);
    setSelectedClientId('');
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
  };

  const value: ClientContextType = {
    clients,
    selectedClientId,
    selectedClient,
    selectedClientData,
    selectedClientServiceAreas,
    setSelectedClientId,
    loading,
    dbInitialized,
    loadClients,
    loadClientData,
    refreshClients,
    searchQuery,
    searchResults,
    showSearchResults,
    isSearching,
    handleSearchChange,
    handleSelectBusiness,
    handleClearSearch,
    selectedLocation,
    setSelectedLocation,
    locations,
    filteredClients,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};