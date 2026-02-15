/**
 * React Hooks for Geolocation
 * Provides easy-to-use location tracking for components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import geolocationService, {
  Coordinates,
  GeoPoint,
  GeolocationOptions,
} from '@/services/geolocation.service';

// =============================================================================
// useCurrentLocation
// =============================================================================

interface UseCurrentLocationResult {
  coords: Coordinates | null;
  error: Error | null;
  loading: boolean;
  refresh: () => void;
}

/**
 * Hook to get the current location once
 */
export const useCurrentLocation = (options?: GeolocationOptions): UseCurrentLocationResult => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const optionsRef = useRef(options);

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const location = await geolocationService.getCurrentLocation(optionsRef.current);
      setCoords(location);
    } catch (err) {
      setError(err as Error);
      setCoords(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { coords, error, loading, refresh: fetchLocation };
};

// =============================================================================
// useWatchLocation
// =============================================================================

interface UseWatchLocationResult {
  coords: Coordinates | null;
  error: Error | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

/**
 * Hook to continuously watch location changes
 */
export const useWatchLocation = (options?: GeolocationOptions): UseWatchLocationResult => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (watchIdRef.current !== null) return;

    setIsTracking(true);
    watchIdRef.current = geolocationService.watchPosition(
      (position) => {
        setCoords(position);
        setError(null);
      },
      (err) => {
        setError(err);
      },
      options
    );
  }, [options]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      geolocationService.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        geolocationService.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { coords, error, isTracking, startTracking, stopTracking };
};

// =============================================================================
// useGeofence
// =============================================================================

interface UseGeofenceResult {
  isInside: boolean;
  distance: number;
  currentLocation: Coordinates | null;
}

/**
 * Hook to determine if the current user is within a geofence
 */
export const useGeofence = (
  center: GeoPoint,
  radiusMeters: number,
  autoWatch = true
): UseGeofenceResult => {
  const [isInside, setIsInside] = useState<boolean>(false);
  const [distance, setDistance] = useState<number>(0);
  const { coords, startTracking, stopTracking } = useWatchLocation({ enableHighAccuracy: true });

  useEffect(() => {
    if (autoWatch) {
      startTracking();
    }
    return () => {
      stopTracking();
    };
  }, [autoWatch, startTracking, stopTracking]);

  useEffect(() => {
    if (coords && center) {
      try {
        const dist = geolocationService.calculateDistance(coords, center);
        setDistance(dist);
        setIsInside(dist <= radiusMeters);
      } catch (err) {
        console.error('Error calculating geofence status', err);
      }
    }
  }, [coords, center, radiusMeters]);

  return { isInside, distance, currentLocation: coords };
};

// =============================================================================
// useDistanceCalculator
// =============================================================================

interface UseDistanceCalculatorResult {
  calculateDistance: (point1: GeoPoint, point2: GeoPoint) => number;
  calculateDistanceKm: (point1: GeoPoint, point2: GeoPoint) => number;
  formatDistance: (meters: number) => string;
}

/**
 * Hook providing distance calculation utilities
 */
export const useDistanceCalculator = (): UseDistanceCalculatorResult => {
  const calculateDistance = useCallback((point1: GeoPoint, point2: GeoPoint): number => {
    return geolocationService.calculateDistance(point1, point2);
  }, []);

  const calculateDistanceKm = useCallback((point1: GeoPoint, point2: GeoPoint): number => {
    return geolocationService.calculateDistanceKm(point1, point2);
  }, []);

  const formatDistance = useCallback((meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  }, []);

  return { calculateDistance, calculateDistanceKm, formatDistance };
};

// =============================================================================
// useGeocode
// =============================================================================

interface UseGeocodeResult {
  geocode: (address: string) => Promise<Coordinates | null>;
  reverseGeocode: (coords: Coordinates) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for geocoding addresses
 */
export const useGeocode = (): UseGeocodeResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const geocode = useCallback(async (address: string): Promise<Coordinates | null> => {
    try {
      setLoading(true);
      setError(null);
      const coords = await geolocationService.geocodeAddress(address);
      return coords;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (coords: Coordinates): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const address = await geolocationService.reverseGeocode(coords);
      return address.formatted || null;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { geocode, reverseGeocode, loading, error };
};

// =============================================================================
// useLocationTracking
// =============================================================================

interface UseLocationTrackingOptions {
  entityType: string;
  entityId: string;
  intervalMs?: number;
  autoStart?: boolean;
}

interface UseLocationTrackingResult {
  isTracking: boolean;
  lastLocation: Coordinates | null;
  startTracking: () => void;
  stopTracking: () => void;
  error: Error | null;
}

/**
 * Hook for tracking and recording location to server
 */
export const useLocationTracking = ({
  entityType,
  entityId,
  intervalMs = 30000,
  autoStart = false,
}: UseLocationTrackingOptions): UseLocationTrackingResult => {
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const recordLocation = useCallback(async (coords: Coordinates) => {
    try {
      await geolocationService.recordLocation(entityType, entityId, coords);
      setLastLocation(coords);
    } catch (err) {
      console.error('Failed to record location:', err);
    }
  }, [entityType, entityId]);

  const startTracking = useCallback(() => {
    if (isTracking) return;

    setIsTracking(true);
    setError(null);

    // Get initial location
    geolocationService.getCurrentLocation({ enableHighAccuracy: true })
      .then(recordLocation)
      .catch((err) => setError(err));

    // Watch for significant location changes
    watchIdRef.current = geolocationService.watchPosition(
      (coords) => {
        setLastLocation(coords);
      },
      (err) => setError(err),
      { enableHighAccuracy: true }
    );

    // Also record location at regular intervals
    intervalRef.current = setInterval(async () => {
      try {
        const coords = await geolocationService.getCurrentLocation();
        await recordLocation(coords);
      } catch (err) {
        console.error('Interval location recording failed:', err);
      }
    }, intervalMs);
  }, [isTracking, intervalMs, recordLocation]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      geolocationService.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    if (autoStart) {
      startTracking();
    }
    return () => {
      stopTracking();
    };
  }, [autoStart, startTracking, stopTracking]);

  return { isTracking, lastLocation, startTracking, stopTracking, error };
};

// =============================================================================
// useNearbyEntities
// =============================================================================

interface UseNearbyEntitiesOptions<T> {
  fetchFn: (location: Coordinates, radius: number) => Promise<T[]>;
  radiusMeters: number;
  autoFetch?: boolean;
}

interface UseNearbyEntitiesResult<T> {
  entities: T[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Hook for fetching entities near current location
 */
export function useNearbyEntities<T>({
  fetchFn,
  radiusMeters,
  autoFetch = true,
}: UseNearbyEntitiesOptions<T>): UseNearbyEntitiesResult<T> {
  const [entities, setEntities] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { coords } = useCurrentLocation();

  const refresh = useCallback(async () => {
    if (!coords) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn(coords, radiusMeters);
      setEntities(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [coords, fetchFn, radiusMeters]);

  useEffect(() => {
    if (autoFetch && coords) {
      refresh();
    }
  }, [autoFetch, coords, refresh]);

  return { entities, loading, error, refresh };
}

// =============================================================================
// Export all hooks
// =============================================================================

export default {
  useCurrentLocation,
  useWatchLocation,
  useGeofence,
  useDistanceCalculator,
  useGeocode,
  useLocationTracking,
  useNearbyEntities,
};
