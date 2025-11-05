import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function MapPicker({ latitude, longitude, onLocationSelect, readOnly = false }: MapPickerProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Leaflet library
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Check if Leaflet is already loaded
      if (window.L) {
        console.log('MapPicker: Leaflet already loaded');
        setMapLoaded(true);
        return;
      }

      console.log('MapPicker: Loading Leaflet...');
      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load Leaflet JS from CDN
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        console.log('MapPicker: Leaflet loaded successfully');
        setMapLoaded(true);
      };
      script.onerror = () => {
        console.error('MapPicker: Failed to load Leaflet');
      };
      document.head.appendChild(script);

      return () => {
        // Only remove if we added them
        if (link.parentNode) document.head.removeChild(link);
        if (script.parentNode) document.head.removeChild(script);
      };
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (Platform.OS === 'web' && mapLoaded && window.L && mapContainerRef.current) {
      console.log('MapPicker: Initializing map with coordinates:', { latitude, longitude, readOnly });
      const L = window.L;

      // Clean up existing map instance
      if (mapInstanceRef.current) {
        console.log('MapPicker: Removing existing map instance');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }

      // Create map centered on coordinates or Denmark
      const map = L.map(mapContainerRef.current).setView(
        [latitude || 56.26392, longitude || 9.501785],
        latitude && longitude ? 12 : 7
      );

      mapInstanceRef.current = map;

      console.log('MapPicker: Map created, adding tiles...');

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add marker if coordinates exist
      if (latitude && longitude) {
        console.log('MapPicker: Adding marker at', latitude, longitude);
        markerRef.current = L.marker([latitude, longitude]).addTo(map);
      }

      // Handle map clicks only if not read-only
      if (!readOnly) {
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;

          // Remove old marker
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }

          // Add new marker
          markerRef.current = L.marker([lat, lng]).addTo(map);

          // Call callback
          onLocationSelect(lat, lng);
        });
      }

      console.log('MapPicker: Map initialization complete');

      // Force map to recalculate size after a short delay
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        console.log('MapPicker: Cleaning up map');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapLoaded, latitude, longitude, readOnly]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Kort er kun tilgængeligt på web</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!readOnly && (
        <Text style={styles.instructions}>
          Klik på kortet for at vælge hvor du fangede fisken
        </Text>
      )}
      {!mapLoaded && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Indlæser kort...</Text>
        </View>
      )}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: readOnly ? 250 : 400,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
          display: mapLoaded ? 'block' : 'none',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  fallback: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 16,
  },
  fallbackText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
