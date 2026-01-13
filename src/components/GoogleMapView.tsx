import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Keyword } from '../lib/types';
import { BusinessCategory } from '../lib/business-categories';
import { calculateCustomerRevenueLoss } from '../lib/competitor-data';
import { MapPin, TrendingDown, Eye, Target, DollarSign, Search, AlertCircle, CheckCircle, Lock, Hash, Phone, Settings, Percent, ArrowRight, AlertTriangle } from 'lucide-react';
import { loadGoogleMapsAPI } from '../lib/google-maps-loader';
import CompetitorProfitCards from './CompetitorProfitCards';

interface GoogleMapViewProps {
  category: BusinessCategory | undefined;
  keywords: Keyword[];
  clientLocation?: string;
  clientAddress?: string;
  avgJobPrice?: number;
  manualGmbScore?: number; // Manual GMB score input
  manualTop3Count?: number; // Manual top 3 rankings input
  manualTop10Count?: number; // Manual top 10 rankings input
  competitor1Name?: string | null;
  competitor2Name?: string | null;
  competitor3Name?: string | null;
  serviceAreas?: any; // Service areas data
}

const GoogleMapView = React.memo(function GoogleMapView({ category, keywords, clientLocation, clientAddress, avgJobPrice, manualGmbScore, manualTop3Count, manualTop10Count, competitor1Name, competitor2Name, competitor3Name, serviceAreas }: GoogleMapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [showAllKeywords, setShowAllKeywords] = useState(false);
    const [avgCustomerValue, setAvgCustomerValue] = useState(500);
    const [closingRate, setClosingRate] = useState(20);
  
  // Use ref for the map container to prevent React from removing it
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const isInitializedRef = useRef(false);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null); // Add ref for radius circle

  // Initialize Google Map using global loader
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        await loadGoogleMapsAPI();
        
        if (!isMounted) return;

        // Skip if map already initialized
        if (isInitializedRef.current && mapInstanceRef.current) {
          setMap(mapInstanceRef.current);
          setMapsLoaded(true);
          return;
        }

        // Create map container imperatively to isolate from React
        if (!mapContainerRef.current && mapWrapperRef.current) {
          const mapDiv = document.createElement('div');
          mapDiv.id = 'google-map-container-singleton';
          mapDiv.style.width = '100%';
          mapDiv.style.height = '500px';
          mapDiv.style.borderRadius = '8px';
          mapDiv.style.backgroundColor = '#F7F9FB';
          mapWrapperRef.current.appendChild(mapDiv);
          mapContainerRef.current = mapDiv;
        }

        if (!mapContainerRef.current) return;

        // Default center (Los Angeles)
        const center = { lat: 34.0522, lng: -118.2437 };

        const googleMap = new google.maps.Map(mapContainerRef.current, {
          zoom: 12,
          center,
          mapId: 'GMB_RANKINGS_MAP', // Add Map ID to enable Advanced Markers
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        if (isMounted) {
          mapInstanceRef.current = googleMap;
          isInitializedRef.current = true;
          setMap(googleMap);
          setMapsLoaded(true);
        }
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        if (isMounted) {
          setMapsError('Failed to initialize map');
        }
      }
    };

    if (!isInitializedRef.current && !mapsError) {
      initMap();
    }

    return () => {
      isMounted = false;
      // Never clean up - let the map live forever
    };
  }, [mapsError]);

  // Add markers for keywords
  useEffect(() => {
    if (!map || !clientLocation) return;

    // Clear existing markers safely using ref
    markersRef.current.forEach(marker => {
      try {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      } catch (error) {        console.error('Error removing marker:', error);
      }
    });
    markersRef.current = [];

    // Geocode the client location
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: clientLocation }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const locationResult = results[0].geometry.location;
        
        // Convert to LatLngLiteral to ensure we have .lat and .lng properties
        const location = {
          lat: typeof locationResult.lat === 'function' ? locationResult.lat() : locationResult.lat,
          lng: typeof locationResult.lng === 'function' ? locationResult.lng() : locationResult.lng
        };

        // Clear existing radius circle if it exists
        if (radiusCircleRef.current) {
          radiusCircleRef.current.setMap(null);
        }

        // Create dashed circle path (50km radius)
        const radius = 50000; // 50 kilometers in meters
        const numPoints = 100; 
        const circleCoords = [];
        
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i * 360 / numPoints) * Math.PI / 180;
          const dx = radius * Math.cos(angle);
          const dy = radius * Math.sin(angle);
          
          // Calculate offset in lat/lng
          const newLat = location.lat + (dy / 111320); // 111320 meters per degree latitude
          const newLng = location.lng + (dx / (111320 * Math.cos(location.lat * Math.PI / 180)));
          
          circleCoords.push({ lat: newLat, lng: newLng });
        }

        // Create polyline with dashed pattern for red dotted boundary
        const dashedCircle = new google.maps.Polyline({
          path: circleCoords,
          strokeColor: '#DC2626', // Red color
          strokeOpacity: 0.8,
          strokeWeight: 3,
          icons: [{
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              scale: 3
            },
            offset: '0',
            repeat: '15px' // Dash pattern: 15px dash, 15px gap
          }],
          map: map,
          clickable: false
        });

        // Store the polyline in ref
        radiusCircleRef.current = dashedCircle as any;

        // Create bounds manually from circle coordinates
        const bounds = new google.maps.LatLngBounds();
        circleCoords.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds);
        
        map.setCenter(location);

        // Create custom marker element for the business
        const markerElement = document.createElement('div');
        markerElement.style.width = '32px';
        markerElement.style.height = '32px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.backgroundColor = '#0052CC';
        markerElement.style.border = '3px solid #ffffff';
        markerElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        markerElement.style.cursor = 'pointer';

        // Try to use AdvancedMarkerElement if available, otherwise use standard Marker
        let mainMarker;
        
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          // Use new AdvancedMarkerElement
          mainMarker = new google.maps.marker.AdvancedMarkerElement({
            position: location,
            map,
            title: `Your Business - ${clientLocation}`,
            content: markerElement,
          });
        } else {
          // Fallback to standard Marker
          mainMarker = new google.maps.Marker({
            position: location,
            map,
            title: `Your Business - ${clientLocation}`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#0052CC',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
          });
        }

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0; color: #0052CC; font-weight: 700;">Your GMB Location</h3>
              <p style="margin: 0 0 8px 0; color: #475569;">${clientLocation}</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px;">
                <div style="background: #F1F5F9; padding: 8px; border-radius: 6px;">
                  <p style="margin: 0; font-size: 11px; color: #64748B;">Keywords</p>
                  <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #0052CC;">${keywords.length}</p>
                </div>
                <div style="background: #FEF2F2; padding: 8px; border-radius: 6px;">
                  <p style="margin: 0; font-size: 11px; color: #64748B;">Avg Rank</p>
                  <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #FF3B30;">#${Math.round(keywords.reduce((sum, k) => sum + k.currentRank, 0) / keywords.length)}</p>
                </div>
              </div>
            </div>
          `,
        });

        // Add click listener based on marker type
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          markerElement.addEventListener('click', () => {
            infoWindow.open(map, mainMarker);
          });
        } else {
          mainMarker.addListener('click', () => {
            infoWindow.open(map, mainMarker);
          });
        }

        // Auto-open info window
        setTimeout(() => infoWindow.open(map, mainMarker), 500);

        // Store in ref instead of state
        markersRef.current = [mainMarker];
        
        // Add keyword ranking markers for nearby cities
        const nearbyLocations = [
          { name: 'Kansas City', lat: location.lat + 0.08, lng: location.lng - 0.12 },
          { name: 'North Kansas City', lat: location.lat + 0.13, lng: location.lng + 0.04 },
          { name: 'Parkville', lat: location.lat + 0.10, lng: location.lng + 0.10 },
          { name: 'Fairview', lat: location.lat - 0.07, lng: location.lng + 0.13 },
          { name: 'Overland Park', lat: location.lat - 0.10, lng: location.lng - 0.08 },
          { name: 'Olathe', lat: location.lat - 0.13, lng: location.lng + 0.02 },
          { name: 'Lenexa', lat: location.lat - 0.04, lng: location.lng - 0.15 },
          { name: 'Shawnee', lat: location.lat + 0.04, lng: location.lng - 0.10 },
        ];
        
        // Distribute keywords across locations
        nearbyLocations.forEach((loc, locIndex) => {
          // Get keywords for this location (distribute evenly)
          const locationKeywords = keywords
            .filter((_, idx) => idx % nearbyLocations.length === locIndex)
            .slice(0, 6); // Max 6 keywords per location
          
          if (locationKeywords.length === 0) return;
          
          locationKeywords.forEach((keyword, kwIndex) => {
            // Calculate position with slight offset for multiple keywords
            const offsetAngle = (kwIndex * 360 / locationKeywords.length) * Math.PI / 180;
            const offsetDistance = 0.015; // Small offset for clustering
            const kwLat = loc.lat + offsetDistance * Math.cos(offsetAngle);
            const kwLng = loc.lng + offsetDistance * Math.sin(offsetAngle);
            
            const rank = keyword.currentRank;
            const rankColor = getRankColor(rank);
            
            // Create custom marker element with rank display
            const kwMarkerElement = document.createElement('div');
            kwMarkerElement.style.position = 'relative';
            kwMarkerElement.style.width = '45px';
            kwMarkerElement.style.height = '45px';
            kwMarkerElement.style.cursor = 'pointer';
            
            // Circle background
            const circle = document.createElement('div');
            circle.style.width = '100%';
            circle.style.height = '100%';
            circle.style.borderRadius = '50%';
            circle.style.backgroundColor = rankColor;
            circle.style.border = `3px solid #ffffff`;
            circle.style.display = 'flex';
            circle.style.alignItems = 'center';
            circle.style.justifyContent = 'center';
            circle.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            
            // Rank number inside circle
            const rankLabel = document.createElement('div');
            rankLabel.textContent = rank > 20 ? '20+' : rank.toString();
            rankLabel.style.color = '#ffffff';
            rankLabel.style.fontWeight = '700';
            rankLabel.style.fontSize = '13px';
            rankLabel.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
            
            circle.appendChild(rankLabel);
            kwMarkerElement.appendChild(circle);
            
            // Create keyword marker
            let kwMarker;
            if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
              kwMarker = new google.maps.marker.AdvancedMarkerElement({
                position: { lat: kwLat, lng: kwLng },
                map,
                title: keyword.keyword,
                content: kwMarkerElement,
              });
            } else {
              // Fallback for standard marker
              kwMarker = new google.maps.Marker({
                position: { lat: kwLat, lng: kwLng },
                map,
                title: keyword.keyword,
                label: {
                  text: rank > 20 ? '20+' : rank.toString(),
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '12px',
                },
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 18,
                  fillColor: rankColor,
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                },
              });
            }
            
            // Create info window for keyword
            const potentialConversions = keyword.searchVolume * 0.005;
            const revenueLoss = avgJobPrice ? potentialConversions * avgJobPrice : 0;
            const rankBadge = getRankBadge(rank);
            
            const kwInfoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 12px; max-width: 280px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${rankBadge.color}20; color: ${rankBadge.color}; font-weight: 600;">
                      ${loc.name}
                    </span>
                    <span style="font-size: 12px; padding: 2px 8px; border-radius: 12px; background: ${rankColor}; color: #ffffff; font-weight: 700;">
                      Rank #${rank}
                    </span>
                  </div>
                  <h4 style="margin: 0 0 8px 0; color: #0052CC; font-weight: 700; font-size: 14px;">${keyword.keyword}</h4>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                    <div style="background: #F1F5F9; padding: 6px; border-radius: 4px;">
                      <p style="margin: 0; font-size: 10px; color: #64748B;">Searches/mo</p>
                      <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 700; color: #0052CC;">${keyword.searchVolume.toLocaleString()}</p>
                    </div>
                    <div style="background: #FEF2F2; padding: 6px; border-radius: 4px;">
                      <p style="margin: 0; font-size: 10px; color: #64748B;">Loss/mo</p>
                      <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 700; color: #FF3B30;">$${revenueLoss.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              `,
            });
            
            // Add click listener
            if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
              kwMarkerElement.addEventListener('click', () => {
                kwInfoWindow.open(map, kwMarker);
              });
            } else {
              kwMarker.addListener('click', () => {
                kwInfoWindow.open(map, kwMarker);
              });
            }
            
            // Store marker
            markersRef.current.push(kwMarker);
          });
        });
      }
    });
  }, [map, clientLocation, keywords, avgJobPrice]);

  // Calculate metrics using avgJobPrice prop with realistic 0.5% conversion rate
  const totalRevenueLoss = keywords.reduce((sum, kw) => {
    // Calculate revenue loss: (search volume * 0.5%) * avg job price
    // This represents very conservative missed opportunity calculation
    const potentialConversions = kw.searchVolume * 0.005; // Ultra-realistic 0.5% conversion rate
    const revenueLoss = avgJobPrice ? potentialConversions * avgJobPrice : 0;
    return sum + revenueLoss;
  }, 0);

  const avgRank = keywords.length > 0
    ? Math.round(keywords.reduce((sum, kw) => sum + kw.currentRank, 0) / keywords.length)
    : 0;

  const top3Count = manualTop3Count !== undefined ? manualTop3Count : keywords.filter(k => k.currentRank <= 3).length;
  const top10Count = manualTop10Count !== undefined ? manualTop10Count : keywords.filter(k => k.currentRank <= 10).length;

  // Debug logging
  console.log('🔍 GoogleMapView Debug:', {
    totalKeywords: keywords.length,
    keywordsSample: keywords.slice(0, 3).map(k => ({ keyword: k.keyword, rank: k.currentRank })),
    top3Count,
    top10Count,
    manualTop3Count,
    manualTop10Count,
  });

  const getRankColor = (rank: number) => {
    if (rank <= 3) return '#00C47E';
    if (rank <= 10) return '#FFA500';
    return '#FF3B30';
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return { label: 'Top 3', color: '#00C47E' };
    if (rank <= 10) return { label: 'Page 1', color: '#FFA500' };
    return { label: 'Page 2+', color: '#FF3B30' };
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Total Keywords</span>
            <Search className="size-4 text-blue-600" />
          </div>
          <p className="text-3xl mb-1" style={{ fontWeight: 700, color: '#0052CC' }}>{keywords.length}</p>
          <p className="text-xs text-slate-500">Tracked on map</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Average Rank</span>
            <Target className="size-4 text-orange-600" />
          </div>
          <p className="text-3xl mb-1" style={{ fontWeight: 700, color: '#0052CC' }}>#{avgRank}</p>
          <p className="text-xs text-slate-500">Across all keywords</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Top Rankings</span>
            {top10Count > 0 ? (
              <CheckCircle className="size-4 text-green-600" />
            ) : (
              <AlertCircle className="size-4 text-red-600" />
            )}
          </div>
          <p className="text-3xl mb-1" style={{ fontWeight: 700, color: top10Count > 0 ? '#00C47E' : '#FF3B30' }}>
            {top10Count || 0}
          </p>
          <p className="text-xs text-slate-500">{top3Count} in top 3 | $0 loss</p>
        </Card>

        <Card className="p-6" style={{ backgroundColor: '#FFF5F5' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Revenue Loss</span>
            <DollarSign className="size-4" style={{ color: '#FF3B30' }} />
          </div>
          <p className="text-3xl mb-1" style={{ fontWeight: 700, color: '#FF3B30' }}>
            ${totalRevenueLoss.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">Monthly opportunity</p>
        </Card>
      </div>

      {/* Google Map */}
      <Card className="p-0 overflow-hidden">
        {mapsError ? (
          <div className="p-8 text-center" style={{ height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F9FB' }}>
            <AlertCircle className="size-12 mb-4" style={{ color: '#FF3B30' }} />
            <h3 className="mb-2" style={{ fontWeight: 600, color: '#1e293b' }}>Google Maps API Key Required</h3>
            <p className="text-sm text-slate-600 mb-4 max-w-md">
              To display the interactive Google Maps with GMB locations, please add your Google Maps API key.
            </p>
            <div className="bg-white p-4 rounded-lg border border-slate-200 text-left max-w-md">
              <p className="text-xs mb-2" style={{ fontWeight: 600 }}>How to get a Google Maps API key:</p>
              <ol className="text-xs text-slate-600 space-y-1 ml-4" style={{ listStyleType: 'decimal' }}>
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                <li>Create a new project or select existing one</li>
                <li>Enable "Maps JavaScript API"</li>
                <li>Create credentials → API key</li>
                <li>Copy the API key and add it above ↑</li>
              </ol>
            </div>
            <div className="mt-6">
              <Button 
                onClick={() => window.location.reload()} 
                style={{ backgroundColor: '#0052CC' }}
              >
                Reload After Adding Key
              </Button>
            </div>
          </div>
        ) : (
          <div 
            id="google-map" 
            ref={mapWrapperRef}
            style={{ 
              width: '100%', 
              height: '500px',
              borderRadius: '8px',
              backgroundColor: '#F7F9FB'
            }}
          >
            {!mapsLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0052CC' }}></div>
                  <p className="text-sm text-slate-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Top Competitors Performance */}
      <CompetitorProfitCards 
        keywords={keywords} 
        avgJobPrice={avgJobPrice} 
        competitor1Name={competitor1Name}
        competitor2Name={competitor2Name}
        competitor3Name={competitor3Name}
      />

      {/* Profit Estimator Section */}
      <Card className="overflow-hidden border-2 border-slate-400 shadow-xl">
        {/* Header */}
        <div className="bg-slate-100 text-slate-600 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <DollarSign className="size-6" />
            </div>
            <h2 className="text-2xl font-bold">Profit Estimator</h2>
          </div>
          <p className=" text-sm">
            Adjust your business metrics below to see your potential monthly revenue opportunity
          </p>
        </div>

        <div className="p-8">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* LEFT COLUMN - Static "Truth" Data */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="size-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">Market Data (Locked)</h3>
              </div>
              
              {/* Search Volume Card */}
              <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Search className="size-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-600">Total Search Volume</span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                    Scraped Data
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {keywords.reduce((sum, kw) => sum + kw.searchVolume, 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">searches per month</p>
              </div>

              {/* Current Rank Card */}
              <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Hash className="size-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-600">Average Current Rank</span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                    Scraped Data
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  #{(keywords.reduce((sum, kw) => sum + kw.currentRank, 0) / keywords.length).toFixed(1)}
                </p>
                <p className="text-xs text-slate-500 mt-1">across all keywords</p>
              </div>

              {/* Competitor Calls Card */}
              <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="size-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-600">Competitor Leads (Top 3)</span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                    Calculated
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {(() => {
                    const totalVolume = keywords.reduce((sum, kw) => sum + kw.searchVolume, 0);
                    const estimatedCalls = Math.round(totalVolume * 0.03); // 3% CTR estimate
                    return estimatedCalls.toLocaleString();
                  })()}
                </p>
                <p className="text-xs text-slate-500 mt-1">calls per month (est. 3% CTR)</p>
              </div>
            </div>

            {/* RIGHT COLUMN - Interactive Sliders - DARK CONTROL PANEL */}
            <div className="space-y-6">
              <div className="control-panel-dark p-6 shadow-2xl" style={{ backgroundColor: '#1e293b', borderRadius: '0.75rem' }}>
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="size-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Your Business Metrics</h3>
                </div>

                {/* Average Customer Value Slider */}
                <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600 mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="size-5 text-yellow-400" />
                    <label className="text-sm font-semibold text-white">
                      What is a new customer worth to you?
                    </label>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold text-yellow-400 font-mono">
                        ${avgCustomerValue.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-300">per customer</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="50"
                    value={avgCustomerValue}
                    onChange={(e) => setAvgCustomerValue(Number(e.target.value))}
                    className="w-full h-3 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${((avgCustomerValue - 100) / 4900) * 100}%, #475569 ${((avgCustomerValue - 100) / 4900) * 100}%, #475569 100%)`
                    }}
                  />
                  
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>$100</span>
                    <span>$5,000</span>
                  </div>
                </div>

                {/* Closing Rate Slider */}
                <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600">
                  <div className="flex items-center gap-2 mb-3">
                    <Percent className="size-5 text-green-400" />
                    <label className="text-sm font-semibold text-white">
                      What % of calls do you close?
                    </label>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold text-green-400 font-mono">
                        {closingRate}%
                      </span>
                      <span className="text-sm text-slate-300">closing rate</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={closingRate}
                    onChange={(e) => setClosingRate(Number(e.target.value))}
                    className="w-full h-3 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #00C47E 0%, #00C47E ${((closingRate - 5) / 45) * 100}%, #475569 ${((closingRate - 5) / 45) * 100}%, #475569 100%)`
                    }}
                  />
                  
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>

              {/* Visual Connection Arrow */}
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="size-8 text-yellow-500 animate-pulse" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Big Red Revenue Loss Number - MEDICAL REPORT STYLE */}
          <div className="audit-card p-8 relative overflow-hidden shadow-2xl" style={{ backgroundColor: '#FEF2F2', borderRadius: '0.75rem' }}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-200/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-100/20 rounded-full blur-3xl -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <AlertTriangle className="size-8 text-red-600" />
                  <p className="text-sm font-bold text-red-700 uppercase tracking-wider">
                    Monthly Revenue Opportunity
                  </p>
                  <AlertTriangle className="size-8 text-red-600" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-6xl md:text-7xl text-red-600 mb-3" style={{ fontWeight: 700 }}>
                  ${(() => {
                    const totalVolume = keywords.reduce((sum, kw) => sum + kw.searchVolume, 0);
                    const estimatedCalls = Math.round(totalVolume * 0.03); // 3% CTR
                    const closedDeals = Math.round(estimatedCalls * (closingRate / 100));
                    const monthlyRevenue = closedDeals * avgCustomerValue;
                    return monthlyRevenue.toLocaleString();
                  })()}
                </p>
                
                <div className="bg-white border-2 border-red-200 rounded-lg p-4 inline-block">
                  <p className="text-sm text-slate-700 mb-1 font-semibold">
                    Calculation Breakdown:
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-600 font-mono">
                    <span>
                      {(() => {
                        const totalVolume = keywords.reduce((sum, kw) => sum + kw.searchVolume, 0);
                        const estimatedCalls = Math.round(totalVolume * 0.03);
                        return estimatedCalls.toLocaleString();
                      })()} calls
                    </span>
                    <span>×</span>
                    <span>{closingRate}% close rate</span>
                    <span>×</span>
                    <span>${avgCustomerValue.toLocaleString()} per customer</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-red-700 font-semibold">
                  ⚠️ This represents potential revenue currently being captured by competitors
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      {/* Location Info & Keywords */}
      {clientLocation && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="size-5" style={{ color: '#0052CC' }} />
            <h3 className="text-slate-900">GMB Location Details</h3>
          </div>
          <div className="mb-6">
            <p className="text-sm text-slate-600 mb-1">Business Location</p>
            <p style={{ fontWeight: 600, color: '#0052CC' }}>{clientLocation}</p>
            {clientAddress && (
              <p className="text-sm text-slate-500 mt-1">{clientAddress}</p>
            )}
          </div>

          <div>
            <h4 className="text-sm mb-3" style={{ fontWeight: 600 }}>Keywords for this Location ({keywords.length})</h4>
            <div className="space-y-2">
              {keywords.slice(0, showAllKeywords ? keywords.length : 10).map((keyword) => {
                // Calculate revenue loss: (search volume * 0.5%) * avg job price
                const potentialConversions = keyword.searchVolume * 0.005; // Ultra-realistic 0.5% conversion rate
                const revenueLoss = avgJobPrice ? potentialConversions * avgJobPrice : 0;
                const rankBadge = getRankBadge(keyword.currentRank);

                return (
                  <div 
                    key={keyword.id} 
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm" style={{ fontWeight: 600 }}>{keyword.keyword}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {keyword.searchVolume.toLocaleString()} searches/mo
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-600">Rank</p>
                        <Badge 
                          variant="secondary"
                          className="mt-1"
                          style={{ 
                            backgroundColor: rankBadge.color + '20',
                            color: rankBadge.color,
                            borderColor: rankBadge.color
                          }}
                        >
                          #{keyword.currentRank}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600">Loss/mo</p>
                        <p className="text-sm mt-1" style={{ fontWeight: 600, color: '#FF3B30' }}>
                          -${revenueLoss.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {keywords.length > 10 && !showAllKeywords && (
                <button
                  onClick={() => setShowAllKeywords(true)}
                  className="w-full text-sm text-center pt-3 pb-1 text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                >
                  + {keywords.length - 10} more keywords
                </button>
              )}
              {showAllKeywords && keywords.length > 10 && (
                <button
                  onClick={() => setShowAllKeywords(false)}
                  className="w-full text-sm text-center pt-3 pb-1 text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                >
                  Show less keywords
                </button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Map Legend */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#0052CC' }}></div>
              <span className="text-sm text-slate-600">Your GMB Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-dashed" style={{ borderColor: '#DC2626', backgroundColor: 'transparent' }}></div>
              <span className="text-sm text-slate-600">50km Service Area</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#00C47E' }}></div>
              <span className="text-sm text-slate-600">Top 3 Rank</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FFA500' }}></div>
              <span className="text-sm text-slate-600">Top 10 Rank</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FF3B30' }}></div>
              <span className="text-sm text-slate-600">Below Top 10</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {mapsError && (
        <Card className="p-4 bg-red-100 text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5" />
            <p className="text-sm">{mapsError}</p>
          </div>
        </Card>
      )}
    </div>
  );
});

export default GoogleMapView;