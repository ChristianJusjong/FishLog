import { useState, useEffect } from 'react';
import { getSecureItem, TOKEN_KEYS } from '../lib/secureStorage';
import { api } from '../lib/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

export type Species = {
  id: string;
  name: string;
  scientificName: string | null;
  rarity: string | null;
};

export type HeatmapPoint = {
  longitude: number;
  latitude: number;
  intensity: number;
  species: string[];
  avgWeight: number;
  uniqueAnglers: number;
};

export type TopSpot = {
  id: string;
  longitude: number;
  latitude: number;
  catchCount: number;
  species: string[];
  avgWeight: number;
  maxWeight: number;
};

export type HotSpot = {
  latitude: number;
  longitude: number;
  totalAnglers: number;
  totalCatches: number;
  totalScore: number;
  topAnglers: Array<{ name: string; score: number; catches: number }>;
  fishSpecies: string[];
  userRank?: number;
  userStats?: { catches: number; score: number };
};

export type FavoriteSpot = {
  latitude: number;
  longitude: number;
  visitCount: number;
  catchCount: number;
  totalScore: number;
  biggestFish?: { species: string; weight: number };
  longestFish?: { species: string; length: number };
  fishSpecies: string[];
  recentCatches: Array<{ species: string; weight: number; date: string }>;
};

let cachedFredningsbaelter: any[] = [];

export function useMapData(
  selectedSpecies: string[],
  selectedSeason: string,
  showFredningsbaelter: boolean,
  userLocation: { latitude: number; longitude: number } | null
) {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [topSpots, setTopSpots] = useState<TopSpot[]>([]);
  const [hotSpots, setHotSpots] = useState<HotSpot[]>([]);
  const [favoriteSpots, setFavoriteSpots] = useState<FavoriteSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [allSpecies, setAllSpecies] = useState<Species[]>([]);
  const [fredningsbaelterPolygons, setFredningsbaelterPolygons] = useState<any[]>(cachedFredningsbaelter);
  const [loadingFredningsbaelter, setLoadingFredningsbaelter] = useState(false);

  const fetchSpecies = async () => {
    try {
      const { data } = await api.get('/species');
      setAllSpecies(data);
    } catch (error) {
      console.error('Failed to fetch species:', error);
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      const params = new URLSearchParams();
      params.append('gridSize', '0.02');

      if (selectedSpecies.length > 0) {
        selectedSpecies.forEach(species => {
          params.append('species', species);
        });
      }

      if (selectedSeason) {
        params.append('season', selectedSeason);
      }

      const url = `${API_URL}/spots/heatmap?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHeatmapData(data.points);
      } else {
        console.error('Failed to fetch heatmap');
      }
    } catch (error) {
      console.error('Heatmap fetch error:', error);
    }
  };

  const fetchTopSpots = async () => {
    try {
      const accessToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      const params = new URLSearchParams();
      params.append('limit', '20');

      if (selectedSpecies.length > 0) {
        selectedSpecies.forEach(species => {
          params.append('species', species);
        });
      }

      const url = `${API_URL}/spots/top?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopSpots(data.spots);
      } else {
        console.error('Failed to fetch top spots');
      }
    } catch (error) {
      console.error('Top spots fetch error:', error);
    }
  };

  const fetchHotSpots = async () => {
    try {
      if (!userLocation) return;

      const { data } = await api.get(
        `/hot-spots/discover?near=${userLocation.latitude},${userLocation.longitude}`
      );

      if (data.hotSpots) {
        setHotSpots(data.hotSpots);
      }
    } catch (error) {
      console.error('Hot spots fetch error:', error);
    }
  };

  const fetchFavoriteSpots = async () => {
    try {
      const { data } = await api.get('/hot-spots/my-favorites');

      if (data.favoriteSpots) {
        setFavoriteSpots(data.favoriteSpots);
      }
    } catch (error) {
      console.error('Favorite spots fetch error:', error);
    }
  };

  const fetchFredningsbaelter = async () => {
    if (cachedFredningsbaelter.length > 0) {
      setFredningsbaelterPolygons(cachedFredningsbaelter);
      return;
    }
    try {
      setLoadingFredningsbaelter(true);
      const url = 'https://services-eu1.arcgis.com/c3o7qz6F0HswtuVz/arcgis/rest/services/Fredningsbælter/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json';

      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const polygons = data.features.map((feature: any, index: number) => {
          if (feature.geometry && feature.geometry.rings) {
            return {
              id: index,
              coordinates: feature.geometry.rings[0].map((coord: number[]) => ({
                latitude: coord[1],
                longitude: coord[0],
              })),
              attributes: feature.attributes,
            };
          }
          return null;
        }).filter(Boolean);

        cachedFredningsbaelter = polygons;
        setFredningsbaelterPolygons(polygons);
      }
    } catch (error) {
      console.error('Fredningsbælter fetch error:', error);
    } finally {
      setLoadingFredningsbaelter(false);
    }
  };

  useEffect(() => {
    fetchSpecies();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchHeatmapData(),
        fetchTopSpots(),
        fetchHotSpots(),
        fetchFavoriteSpots(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [selectedSpecies, selectedSeason]);

  useEffect(() => {
    if (userLocation) {
      fetchHotSpots();
    }
  }, [userLocation]);

  useEffect(() => {
    if (showFredningsbaelter && fredningsbaelterPolygons.length === 0) {
      fetchFredningsbaelter();
    }
  }, [showFredningsbaelter]);

  return {
    heatmapData,
    topSpots,
    hotSpots,
    favoriteSpots,
    loading,
    allSpecies,
    fredningsbaelterPolygons,
    loadingFredningsbaelter,
    refetchHotSpots: fetchHotSpots,
    refetchFavoriteSpots: fetchFavoriteSpots,
  };
}
