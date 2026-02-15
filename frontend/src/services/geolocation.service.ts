/**
 * Geolocation Service for ERP DryMix Products
 * Provides location tracking, geotagging, and spatial utilities
 */

import api from './api';

// =============================================================================
// TYPES
// =============================================================================

export interface Coordinates {
  lat: number;
  lng: number;
  altitude?: number | null;
  accuracy?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export type GeoPoint = Coordinates;

export interface GeoPolygon {
  points: GeoPoint[];
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export interface GeoRoute {
  waypoints: GeoPoint[];
  distance: number; // in meters
  duration: number; // in seconds
  geometry?: string; // Encoded polyline string
}

export interface LocationTrackingData {
  id: string;
  entityId: string;
  entityType: string;
  timestamp: Date;
  location: GeoPoint;
  speed?: number;
  heading?: number;
}

export interface GeoTaggedEntity {
  id: string;
  type: 'site' | 'vehicle' | 'warehouse' | 'asset' | 'customer' | 'supplier';
  name: string;
  location: GeoPoint;
  address?: string;
  metadata?: Record<string, unknown>;
}

export interface DeliveryWaypoint extends GeoTaggedEntity {
  sequenceOrder: number;
  estimatedArrival?: Date;
  actualArrival?: Date;
  status: 'pending' | 'arrived' | 'completed' | 'skipped';
  notes?: string;
}

export interface SiteLocation extends GeoTaggedEntity {
  type: 'site';
  radius: number; // Geofence radius in meters
  timezone?: string;
  boundary?: GeoPolygon;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  formatted?: string;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export type WatchId = number;

export interface DeliveryTracking {
  id: string;
  salesOrderId: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  originLocation?: GeoPoint;
  destinationLocation?: GeoPoint;
  currentLocation?: GeoPoint;
  routePath?: GeoPoint[];
  estimatedDistanceKm?: number;
  actualDistanceKm?: number;
  estimatedArrival?: Date;
  actualArrival?: Date;
  status: 'scheduled' | 'dispatched' | 'in_transit' | 'nearby' | 'delivered' | 'failed' | 'returned';
  dispatchedAt?: Date;
  deliveredAt?: Date;
}

export interface SiteInspection {
  id: string;
  projectId: string;
  inspectionNumber: string;
  inspectorId: string;
  inspectionType: 'site_visit' | 'quality_check' | 'safety_audit' | 'progress_review' | 'handover';
  inspectionDate: Date;
  gpsLocation: GeoPoint;
  isWithinGeofence: boolean;
  distanceFromSite?: number;
  weatherConditions?: string;
  siteConditions?: string;
  observations?: string;
  recommendations?: string;
  photos?: string[];
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
}

export interface GeoTag {
  id: string;
  taggableType: string;
  taggableId: string;
  name?: string;
  description?: string;
  location: GeoPoint;
  address?: string;
  tagType: 'asset' | 'site' | 'event' | 'checkpoint' | 'other';
  metadata?: Record<string, unknown>;
  taggedAt: Date;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class GeolocationError extends Error {
  constructor(message: string, public code?: number) {
    super(message);
    this.name = 'GeolocationError';
  }
}

// =============================================================================
// GEOLOCATION SERVICE CLASS
// =============================================================================

class GeolocationService {
  private watchIds: Map<string, WatchId> = new Map();

  /**
   * Validates if coordinates are within valid Earth ranges
   */
  private validateCoordinates(point: GeoPoint): void {
    if (point.lat < -90 || point.lat > 90) {
      throw new GeolocationError(`Invalid latitude: ${point.lat}`);
    }
    if (point.lng < -180 || point.lng > 180) {
      throw new GeolocationError(`Invalid longitude: ${point.lng}`);
    }
  }

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get current device location
   */
  async getCurrentLocation(options?: GeolocationOptions): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new GeolocationError('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          };
          resolve(coords);
        },
        (error) => {
          reject(new GeolocationError(error.message, error.code));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          ...options,
        }
      );
    });
  }

  /**
   * Watch for position changes
   */
  watchPosition(
    callback: (position: Coordinates) => void,
    errorCallback?: (error: Error) => void,
    options?: GeolocationOptions
  ): WatchId {
    if (!this.isSupported()) {
      const error = new GeolocationError('Geolocation is not supported');
      if (errorCallback) errorCallback(error);
      return -1;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        };
        callback(coords);
      },
      (error) => {
        if (errorCallback) {
          errorCallback(new GeolocationError(error.message, error.code));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
        ...options,
      }
    );

    return id;
  }

  /**
   * Stop watching a position
   */
  clearWatch(watchId: WatchId): void {
    if (this.isSupported() && watchId !== -1) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in meters
   */
  calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    this.validateCoordinates(point1);
    this.validateCoordinates(point2);

    const R = 6371e3; // Earth radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Calculate distance in kilometers
   */
  calculateDistanceKm(point1: GeoPoint, point2: GeoPoint): number {
    return this.calculateDistance(point1, point2) / 1000;
  }

  /**
   * Check if a point is within a specific radius of a center point
   */
  isWithinRadius(point: GeoPoint, center: GeoPoint, radiusInMeters: number): boolean {
    const distance = this.calculateDistance(point, center);
    return distance <= radiusInMeters;
  }

  /**
   * Check if point is within polygon
   */
  isPointInPolygon(point: GeoPoint, polygon: GeoPolygon): boolean {
    const { points } = polygon;
    let inside = false;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].lng, yi = points[i].lat;
      const xj = points[j].lng, yj = points[j].lat;

      const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
        (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);

      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Calculate bearing between two points
   */
  calculateBearing(from: GeoPoint, to: GeoPoint): number {
    const φ1 = (from.lat * Math.PI) / 180;
    const φ2 = (to.lat * Math.PI) / 180;
    const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    return ((θ * 180) / Math.PI + 360) % 360;
  }

  /**
   * Calculate bounding box for a set of points
   */
  calculateBounds(points: GeoPoint[]): GeoPolygon['bounds'] | null {
    if (points.length === 0) return null;

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    for (const p of points) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }

    return { minLat, maxLat, minLng, maxLng };
  }

  /**
   * Get center point of multiple coordinates
   */
  getCenterPoint(points: GeoPoint[]): GeoPoint | null {
    if (points.length === 0) return null;

    const total = points.reduce(
      (acc, point) => ({
        lat: acc.lat + point.lat,
        lng: acc.lng + point.lng,
      }),
      { lat: 0, lng: 0 }
    );

    return {
      lat: total.lat / points.length,
      lng: total.lng / points.length,
    };
  }

  // ==========================================================================
  // API METHODS
  // ==========================================================================

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<Coordinates> {
    try {
      const response = await api.post<{ lat: number; lng: number }>('/geolocation/geocode', { address });
      return response.data;
    } catch (error) {
      console.error('Geocoding failed:', error);
      throw new GeolocationError('Failed to geocode address');
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(coords: Coordinates): Promise<Address> {
    try {
      this.validateCoordinates(coords);
      const response = await api.post<Address>('/geolocation/reverse-geocode', coords);
      return response.data;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      throw new GeolocationError('Failed to reverse geocode');
    }
  }

  /**
   * Get route between two points
   */
  async getRoute(origin: Coordinates, destination: Coordinates): Promise<GeoRoute> {
    try {
      this.validateCoordinates(origin);
      this.validateCoordinates(destination);
      const response = await api.post<GeoRoute>('/geolocation/route', { origin, destination });
      return response.data;
    } catch (error) {
      console.error('Route calculation failed:', error);
      throw new GeolocationError('Failed to calculate route');
    }
  }

  /**
   * Record location for tracking
   */
  async recordLocation(
    entityType: string,
    entityId: string,
    location: Coordinates
  ): Promise<void> {
    try {
      await api.post('/geolocation/record-location', {
        entityType,
        entityId,
        location,
        recordedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to record location:', error);
    }
  }

  /**
   * Get location history for an entity
   */
  async getLocationHistory(
    entityType: string,
    entityId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<LocationTrackingData[]> {
    try {
      const params: Record<string, string> = { entityType, entityId };
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await api.get<LocationTrackingData[]>(`/geolocation/location-history/${entityType}/${entityId}`, {
        params: {
          ...(startDate && { startDate: startDate.toISOString() }),
          ...(endDate && { endDate: endDate.toISOString() }),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get location history:', error);
      return [];
    }
  }

  // ==========================================================================
  // DELIVERY TRACKING
  // ==========================================================================

  /**
   * Create delivery tracking
   */
  async createDeliveryTracking(data: Partial<DeliveryTracking>): Promise<DeliveryTracking> {
    const response = await api.post<DeliveryTracking>('/geolocation/delivery-tracking', data);
    return response.data;
  }

  /**
   * Update delivery tracking
   */
  async updateDeliveryTracking(id: string, data: Partial<DeliveryTracking>): Promise<DeliveryTracking> {
    const response = await api.put<DeliveryTracking>(`/geolocation/delivery-tracking/${id}`, data);
    return response.data;
  }

  /**
   * Get delivery tracking by sales order
   */
  async getDeliveryTracking(salesOrderId: string): Promise<DeliveryTracking | null> {
    try {
      const response = await api.get<DeliveryTracking>(`/geolocation/delivery-tracking/order/${salesOrderId}`);
      return response.data;
    } catch {
      return null;
    }
  }

  /**
   * Update delivery current location
   */
  async updateDeliveryLocation(trackingId: string, location: Coordinates): Promise<void> {
    await api.post(`/geolocation/delivery-tracking/${trackingId}/location`, { location });
  }

  // ==========================================================================
  // SITE INSPECTIONS
  // ==========================================================================

  /**
   * Create site inspection with geolocation
   */
  async createSiteInspection(data: Partial<SiteInspection>): Promise<SiteInspection> {
    const response = await api.post<SiteInspection>('/geolocation/site-inspections', data);
    return response.data;
  }

  /**
   * Get site inspections for a project
   */
  async getProjectInspections(projectId: string): Promise<SiteInspection[]> {
    const response = await api.get<SiteInspection[]>(`/geolocation/site-inspections/project/${projectId}`);
    return response.data;
  }

  /**
   * Validate inspection is within geofence
   */
  async validateInspectionLocation(
    projectId: string,
    location: Coordinates
  ): Promise<{ isValid: boolean; distance: number }> {
    const response = await api.post<{ isValid: boolean; distance: number }>(
      `/geolocation/site-inspections/${projectId}/validate-location`,
      { location }
    );
    return response.data;
  }

  // ==========================================================================
  // GEOTAGGING
  // ==========================================================================

  /**
   * Create a geotag
   */
  async createGeoTag(data: Partial<GeoTag>): Promise<GeoTag> {
    const response = await api.post<GeoTag>('/geolocation/geo-tags', data);
    return response.data;
  }

  /**
   * Get geotags for an entity
   */
  async getGeoTags(taggableType: string, taggableId: string): Promise<GeoTag[]> {
    const response = await api.get<GeoTag[]>('/geolocation/geo-tags', {
      params: { taggableType, taggableId },
    });
    return response.data;
  }

  /**
   * Get nearby geotags
   */
  async getNearbyGeoTags(
    location: Coordinates,
    radiusMeters: number,
    tagType?: string
  ): Promise<GeoTag[]> {
    const params: Record<string, unknown> = {
      lat: location.lat,
      lng: location.lng,
      radius: radiusMeters,
    };
    if (tagType) params.tagType = tagType;

    const response = await api.get<GeoTag[]>('/geolocation/geo-tags/nearby', { params });
    return response.data;
  }
}

// =============================================================================
// MAP UTILITIES
// =============================================================================

/**
 * Convert to Leaflet [lat, lng] format
 */
export const toLeafletLatLng = (coords: Coordinates): [number, number] => {
  return [coords.lat, coords.lng];
};

export const toLeafletLatLngArray = (points: GeoPoint[]): [number, number][] => {
  return points.map(toLeafletLatLng);
};

/**
 * Convert to MapLibre/GeoJSON [lng, lat] format
 */
export const toMapLibreLngLat = (coords: Coordinates): [number, number] => {
  return [coords.lng, coords.lat];
};

export const toMapLibreLngLatArray = (points: GeoPoint[]): [number, number][] => {
  return points.map(toMapLibreLngLat);
};

/**
 * Create GeoJSON Point feature
 */
export const toGeoJSONPoint = (point: GeoPoint) => ({
  type: 'Feature' as const,
  geometry: {
    type: 'Point' as const,
    coordinates: [point.lng, point.lat],
  },
  properties: {
    altitude: point.altitude,
    accuracy: point.accuracy,
  },
});

/**
 * Create GeoJSON Polygon feature
 */
export const toGeoJSONPolygon = (polygon: GeoPolygon) => {
  const ring = polygon.points.map((p) => [p.lng, p.lat]);
  // Close the ring
  if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
    ring.push([ring[0][0], ring[0][1]]);
  }

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [ring],
    },
    properties: {},
  };
};

/**
 * Create GeoJSON LineString feature
 */
export const toGeoJSONLineString = (points: GeoPoint[]) => ({
  type: 'Feature' as const,
  geometry: {
    type: 'LineString' as const,
    coordinates: points.map((p) => [p.lng, p.lat]),
  },
  properties: {},
});

/**
 * Format coordinates for display
 */
export const formatCoordinates = (coords: Coordinates, precision = 6): string => {
  return `${coords.lat.toFixed(precision)}, ${coords.lng.toFixed(precision)}`;
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

// Export singleton instance
export const geolocationService = new GeolocationService();
export default geolocationService;
