// Global Google Maps API loader singleton
// Ensures the script is loaded only once across the entire application

const GOOGLE_MAPS_API_KEY = 'AIzaSyB6nUgBkEzMntoiQtTRBELEYAgQYXXy7wQ';

let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;
let loadCallbacks: Array<() => void> = [];

// Global callback for Google Maps API
declare global {
  interface Window {
    initGoogleMaps?: () => void;
  }
}

export function loadGoogleMapsAPI(): Promise<void> {
  // If already loaded, return immediately
  if (isLoaded && window.google && window.google.maps && window.google.maps.Map) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Check if script already exists in DOM
  const existingScript = document.querySelector('script[data-google-maps-script="true"]');
  
  if (window.google && window.google.maps && window.google.maps.Map) {
    isLoaded = true;
    return Promise.resolve();
  }

  // If script exists but not loaded yet, wait for it
  if (existingScript) {
    if (loadPromise) {
      return loadPromise;
    }

    loadPromise = new Promise((resolve) => {
      const checkLoaded = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          isLoaded = true;
          isLoading = false;
          resolve();
        } else {
          setTimeout(checkLoaded, 50);
        }
      };
      checkLoaded();
    });

    return loadPromise;
  }

  // Start loading
  isLoading = true;

  loadPromise = new Promise((resolve, reject) => {
    try {
      // Set up global callback
      window.initGoogleMaps = () => {
        isLoaded = true;
        isLoading = false;
        loadCallbacks.forEach(cb => cb());
        loadCallbacks = [];
        resolve();
      };

      // Create script with callback
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-google-maps-script', 'true');

      script.onerror = () => {
        isLoading = false;
        reject(new Error('Failed to load Google Maps API'));
      };

      // Append to head - this will stay forever, never removed
      document.head.appendChild(script);
    } catch (error) {
      isLoading = false;
      reject(error);
    }
  });

  return loadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded && !!(window.google && window.google.maps && window.google.maps.Map);
}