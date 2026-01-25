<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LocationHistory;
use App\Models\DeliveryTracking;
use App\Models\DeliveryWaypoint;
use App\Models\SiteInspection;
use App\Models\GeoTag;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class GeolocationController extends Controller
{
    /**
     * Geocode an address to coordinates
     */
    public function geocode(Request $request): JsonResponse
    {
        $request->validate([
            'address' => 'required|string|max:500',
        ]);

        try {
            // Using OpenStreetMap Nominatim API (free, no API key required)
            $response = Http::get('https://nominatim.openstreetmap.org/search', [
                'q' => $request->address,
                'format' => 'json',
                'limit' => 1,
            ]);

            if ($response->successful() && count($response->json()) > 0) {
                $result = $response->json()[0];
                return response()->json([
                    'lat' => (float) $result['lat'],
                    'lng' => (float) $result['lon'],
                    'display_name' => $result['display_name'] ?? null,
                ]);
            }

            return response()->json([
                'error' => 'Address not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Geocoding service unavailable',
            ], 503);
        }
    }

    /**
     * Reverse geocode coordinates to address
     */
    public function reverseGeocode(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        try {
            $response = Http::get('https://nominatim.openstreetmap.org/reverse', [
                'lat' => $request->lat,
                'lon' => $request->lng,
                'format' => 'json',
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $address = $result['address'] ?? [];

                return response()->json([
                    'street' => $address['road'] ?? null,
                    'city' => $address['city'] ?? $address['town'] ?? $address['village'] ?? null,
                    'state' => $address['state'] ?? null,
                    'postalCode' => $address['postcode'] ?? null,
                    'country' => $address['country'] ?? null,
                    'formatted' => $result['display_name'] ?? null,
                ]);
            }

            return response()->json([
                'error' => 'Location not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Reverse geocoding service unavailable',
            ], 503);
        }
    }

    /**
     * Calculate route between two points
     */
    public function getRoute(Request $request): JsonResponse
    {
        $request->validate([
            'origin.lat' => 'required|numeric|between:-90,90',
            'origin.lng' => 'required|numeric|between:-180,180',
            'destination.lat' => 'required|numeric|between:-90,90',
            'destination.lng' => 'required|numeric|between:-180,180',
        ]);

        try {
            // Using OSRM (Open Source Routing Machine)
            $origin = $request->origin;
            $destination = $request->destination;

            $response = Http::get("https://router.project-osrm.org/route/v1/driving/{$origin['lng']},{$origin['lat']};{$destination['lng']},{$destination['lat']}", [
                'overview' => 'full',
                'geometries' => 'geojson',
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $route = $result['routes'][0] ?? null;

                if ($route) {
                    $coordinates = $route['geometry']['coordinates'] ?? [];
                    $waypoints = array_map(function ($coord) {
                        return [
                            'lat' => $coord[1],
                            'lng' => $coord[0],
                        ];
                    }, $coordinates);

                    return response()->json([
                        'waypoints' => $waypoints,
                        'distance' => $route['distance'] ?? 0, // in meters
                        'duration' => $route['duration'] ?? 0, // in seconds
                    ]);
                }
            }

            // Fallback: return direct line
            return response()->json([
                'waypoints' => [
                    ['lat' => $origin['lat'], 'lng' => $origin['lng']],
                    ['lat' => $destination['lat'], 'lng' => $destination['lng']],
                ],
                'distance' => $this->calculateDistance(
                    $origin['lat'], $origin['lng'],
                    $destination['lat'], $destination['lng']
                ),
                'duration' => 0,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Routing service unavailable',
            ], 503);
        }
    }

    /**
     * Record location history
     */
    public function recordLocation(Request $request): JsonResponse
    {
        $request->validate([
            'entityType' => 'required|string|max:50',
            'entityId' => 'required|string',
            'location.lat' => 'required|numeric|between:-90,90',
            'location.lng' => 'required|numeric|between:-180,180',
            'location.altitude' => 'nullable|numeric',
            'location.accuracy' => 'nullable|numeric',
            'location.speed' => 'nullable|numeric',
            'location.heading' => 'nullable|numeric',
        ]);

        $location = $request->location;

        $history = LocationHistory::create([
            'organization_id' => Auth::user()->organization_id,
            'entity_type' => $request->entityType,
            'entity_id' => $request->entityId,
            'latitude' => $location['lat'],
            'longitude' => $location['lng'],
            'altitude' => $location['altitude'] ?? null,
            'accuracy' => $location['accuracy'] ?? null,
            'speed' => $location['speed'] ?? null,
            'heading' => $location['heading'] ?? null,
            'recorded_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'id' => $history->id,
        ], 201);
    }

    /**
     * Get location history for an entity
     */
    public function getLocationHistory(Request $request): JsonResponse
    {
        $request->validate([
            'entityType' => 'required|string',
            'entityId' => 'required|string',
            'startDate' => 'nullable|date',
            'endDate' => 'nullable|date',
        ]);

        $query = LocationHistory::where('organization_id', Auth::user()->organization_id)
            ->where('entity_type', $request->entityType)
            ->where('entity_id', $request->entityId);

        if ($request->startDate) {
            $query->where('recorded_at', '>=', $request->startDate);
        }
        if ($request->endDate) {
            $query->where('recorded_at', '<=', $request->endDate);
        }

        $history = $query->orderBy('recorded_at', 'desc')
            ->limit(1000)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'entityId' => $item->entity_id,
                    'entityType' => $item->entity_type,
                    'timestamp' => $item->recorded_at,
                    'location' => [
                        'lat' => $item->latitude,
                        'lng' => $item->longitude,
                        'altitude' => $item->altitude,
                        'accuracy' => $item->accuracy,
                    ],
                    'speed' => $item->speed,
                    'heading' => $item->heading,
                ];
            });

        return response()->json($history);
    }

    /**
     * Delivery Tracking CRUD
     */
    public function createDeliveryTracking(Request $request): JsonResponse
    {
        $request->validate([
            'salesOrderId' => 'required|exists:sales_orders,id',
            'vehicleNumber' => 'nullable|string|max:50',
            'driverName' => 'nullable|string|max:100',
            'driverPhone' => 'nullable|string|max:50',
            'originLocation.lat' => 'nullable|numeric|between:-90,90',
            'originLocation.lng' => 'nullable|numeric|between:-180,180',
            'destinationLocation.lat' => 'nullable|numeric|between:-90,90',
            'destinationLocation.lng' => 'nullable|numeric|between:-180,180',
            'estimatedArrival' => 'nullable|date',
        ]);

        $tracking = DeliveryTracking::create([
            'organization_id' => Auth::user()->organization_id,
            'sales_order_id' => $request->salesOrderId,
            'vehicle_number' => $request->vehicleNumber,
            'driver_name' => $request->driverName,
            'driver_phone' => $request->driverPhone,
            'origin_latitude' => $request->input('originLocation.lat'),
            'origin_longitude' => $request->input('originLocation.lng'),
            'destination_latitude' => $request->input('destinationLocation.lat'),
            'destination_longitude' => $request->input('destinationLocation.lng'),
            'estimated_arrival' => $request->estimatedArrival,
            'status' => 'scheduled',
        ]);

        return response()->json($this->formatDeliveryTracking($tracking), 201);
    }

    public function updateDeliveryTracking(Request $request, $id): JsonResponse
    {
        $tracking = DeliveryTracking::where('organization_id', Auth::user()->organization_id)
            ->findOrFail($id);

        $request->validate([
            'vehicleNumber' => 'nullable|string|max:50',
            'driverName' => 'nullable|string|max:100',
            'driverPhone' => 'nullable|string|max:50',
            'status' => 'nullable|in:scheduled,dispatched,in_transit,nearby,delivered,failed,returned',
            'estimatedArrival' => 'nullable|date',
        ]);

        $tracking->update($request->only([
            'vehicle_number', 'driver_name', 'driver_phone',
            'status', 'estimated_arrival'
        ]));

        if ($request->status === 'dispatched' && !$tracking->dispatched_at) {
            $tracking->dispatched_at = now();
            $tracking->save();
        }

        if ($request->status === 'delivered' && !$tracking->delivered_at) {
            $tracking->delivered_at = now();
            $tracking->actual_arrival = now();
            $tracking->save();
        }

        return response()->json($this->formatDeliveryTracking($tracking));
    }

    public function updateDeliveryLocation(Request $request, $id): JsonResponse
    {
        $tracking = DeliveryTracking::where('organization_id', Auth::user()->organization_id)
            ->findOrFail($id);

        $request->validate([
            'location.lat' => 'required|numeric|between:-90,90',
            'location.lng' => 'required|numeric|between:-180,180',
        ]);

        $tracking->current_latitude = $request->input('location.lat');
        $tracking->current_longitude = $request->input('location.lng');

        // Check if near destination (within 500 meters)
        if ($tracking->destination_latitude && $tracking->destination_longitude) {
            $distance = $this->calculateDistance(
                $tracking->current_latitude,
                $tracking->current_longitude,
                $tracking->destination_latitude,
                $tracking->destination_longitude
            );

            if ($distance < 500 && $tracking->status === 'in_transit') {
                $tracking->status = 'nearby';
            }
        }

        $tracking->save();

        // Record in history
        LocationHistory::create([
            'organization_id' => Auth::user()->organization_id,
            'entity_type' => 'delivery',
            'entity_id' => $tracking->id,
            'latitude' => $request->input('location.lat'),
            'longitude' => $request->input('location.lng'),
            'recorded_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    public function getDeliveryTrackingByOrder($salesOrderId): JsonResponse
    {
        $tracking = DeliveryTracking::where('organization_id', Auth::user()->organization_id)
            ->where('sales_order_id', $salesOrderId)
            ->first();

        if (!$tracking) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json($this->formatDeliveryTracking($tracking));
    }

    /**
     * List all active deliveries
     */
    public function listActiveDeliveries(Request $request): JsonResponse
    {
        $query = DeliveryTracking::where('organization_id', Auth::user()->organization_id)
            ->whereIn('status', ['scheduled', 'dispatched', 'in_transit', 'nearby']);

        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $deliveries = $query->orderBy('dispatched_at', 'desc')
            ->limit(100)
            ->get()
            ->map(fn($d) => $this->formatDeliveryTracking($d));

        return response()->json($deliveries);
    }

    /**
     * Site Inspections
     */
    public function createSiteInspection(Request $request): JsonResponse
    {
        $request->validate([
            'projectId' => 'required|exists:projects,id',
            'inspectionType' => 'required|in:site_visit,quality_check,safety_audit,progress_review,handover',
            'gpsLocation.lat' => 'required|numeric|between:-90,90',
            'gpsLocation.lng' => 'required|numeric|between:-180,180',
            'weatherConditions' => 'nullable|string|max:100',
            'siteConditions' => 'nullable|string',
            'observations' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'photos' => 'nullable|array',
        ]);

        $project = Project::findOrFail($request->projectId);

        // Check if within geofence
        $isWithinGeofence = false;
        $distanceFromSite = null;

        if ($project->site_latitude && $project->site_longitude) {
            $distanceFromSite = $this->calculateDistance(
                $request->input('gpsLocation.lat'),
                $request->input('gpsLocation.lng'),
                $project->site_latitude,
                $project->site_longitude
            );
            $isWithinGeofence = $distanceFromSite <= ($project->geofence_radius_meters ?? 500);
        }

        $inspectionNumber = 'SI-' . date('Ymd') . '-' . str_pad(
            SiteInspection::whereDate('created_at', today())->count() + 1,
            4, '0', STR_PAD_LEFT
        );

        $inspection = SiteInspection::create([
            'organization_id' => Auth::user()->organization_id,
            'project_id' => $request->projectId,
            'inspection_number' => $inspectionNumber,
            'inspector_id' => Auth::id(),
            'inspection_type' => $request->inspectionType,
            'inspection_date' => now(),
            'gps_latitude' => $request->input('gpsLocation.lat'),
            'gps_longitude' => $request->input('gpsLocation.lng'),
            'is_within_geofence' => $isWithinGeofence,
            'distance_from_site' => $distanceFromSite,
            'weather_conditions' => $request->weatherConditions,
            'site_conditions' => $request->siteConditions,
            'observations' => $request->observations,
            'recommendations' => $request->recommendations,
            'photos' => $request->photos ? json_encode($request->photos) : null,
            'status' => 'draft',
        ]);

        return response()->json($this->formatSiteInspection($inspection), 201);
    }

    public function getProjectInspections($projectId): JsonResponse
    {
        $inspections = SiteInspection::where('organization_id', Auth::user()->organization_id)
            ->where('project_id', $projectId)
            ->orderBy('inspection_date', 'desc')
            ->get()
            ->map(fn($i) => $this->formatSiteInspection($i));

        return response()->json($inspections);
    }

    public function validateInspectionLocation(Request $request, $projectId): JsonResponse
    {
        $request->validate([
            'location.lat' => 'required|numeric|between:-90,90',
            'location.lng' => 'required|numeric|between:-180,180',
        ]);

        $project = Project::where('organization_id', Auth::user()->organization_id)
            ->findOrFail($projectId);

        if (!$project->site_latitude || !$project->site_longitude) {
            return response()->json([
                'isValid' => true,
                'distance' => 0,
                'message' => 'Project has no site location configured',
            ]);
        }

        $distance = $this->calculateDistance(
            $request->input('location.lat'),
            $request->input('location.lng'),
            $project->site_latitude,
            $project->site_longitude
        );

        $radius = $project->geofence_radius_meters ?? 500;

        return response()->json([
            'isValid' => $distance <= $radius,
            'distance' => round($distance, 2),
            'radius' => $radius,
        ]);
    }

    /**
     * GeoTags
     */
    public function createGeoTag(Request $request): JsonResponse
    {
        $request->validate([
            'taggableType' => 'required|string|max:100',
            'taggableId' => 'required|string',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'location.lat' => 'required|numeric|between:-90,90',
            'location.lng' => 'required|numeric|between:-180,180',
            'address' => 'nullable|string',
            'tagType' => 'nullable|in:asset,site,event,checkpoint,other',
            'metadata' => 'nullable|array',
        ]);

        $geoTag = GeoTag::create([
            'organization_id' => Auth::user()->organization_id,
            'taggable_type' => $request->taggableType,
            'taggable_id' => $request->taggableId,
            'name' => $request->name,
            'description' => $request->description,
            'latitude' => $request->input('location.lat'),
            'longitude' => $request->input('location.lng'),
            'address' => $request->address,
            'tag_type' => $request->tagType ?? 'other',
            'metadata' => $request->metadata ? json_encode($request->metadata) : null,
            'tagged_by' => Auth::id(),
            'tagged_at' => now(),
        ]);

        return response()->json($this->formatGeoTag($geoTag), 201);
    }

    public function getGeoTags(Request $request): JsonResponse
    {
        $request->validate([
            'taggableType' => 'nullable|string',
            'taggableId' => 'nullable|string',
        ]);

        $query = GeoTag::where('organization_id', Auth::user()->organization_id);

        if ($request->taggableType) {
            $query->where('taggable_type', $request->taggableType);
        }
        if ($request->taggableId) {
            $query->where('taggable_id', $request->taggableId);
        }

        $tags = $query->orderBy('tagged_at', 'desc')
            ->limit(100)
            ->get()
            ->map(fn($t) => $this->formatGeoTag($t));

        return response()->json($tags);
    }

    public function getNearbyGeoTags(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radius' => 'required|numeric|min:0|max:100000',
            'tagType' => 'nullable|string',
        ]);

        // Using Haversine formula in SQL
        $lat = $request->lat;
        $lng = $request->lng;
        $radius = $request->radius;

        $query = GeoTag::where('organization_id', Auth::user()->organization_id)
            ->selectRaw("*,
                (6371000 * acos(
                    cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
                    sin(radians(?)) * sin(radians(latitude))
                )) AS distance", [$lat, $lng, $lat])
            ->having('distance', '<=', $radius)
            ->orderBy('distance');

        if ($request->tagType) {
            $query->where('tag_type', $request->tagType);
        }

        $tags = $query->limit(50)
            ->get()
            ->map(function ($t) {
                $formatted = $this->formatGeoTag($t);
                $formatted['distance'] = round($t->distance, 2);
                return $formatted;
            });

        return response()->json($tags);
    }

    /**
     * Update a GeoTag
     */
    public function updateGeoTag(Request $request, $id): JsonResponse
    {
        $geoTag = GeoTag::where('organization_id', Auth::user()->organization_id)
            ->findOrFail($id);

        $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'location.lat' => 'nullable|numeric|between:-90,90',
            'location.lng' => 'nullable|numeric|between:-180,180',
            'address' => 'nullable|string',
            'tagType' => 'nullable|in:asset,site,event,checkpoint,other',
            'metadata' => 'nullable|array',
        ]);

        $updateData = [];
        if ($request->has('name')) $updateData['name'] = $request->name;
        if ($request->has('description')) $updateData['description'] = $request->description;
        if ($request->has('location.lat')) $updateData['latitude'] = $request->input('location.lat');
        if ($request->has('location.lng')) $updateData['longitude'] = $request->input('location.lng');
        if ($request->has('address')) $updateData['address'] = $request->address;
        if ($request->has('tagType')) $updateData['tag_type'] = $request->tagType;
        if ($request->has('metadata')) $updateData['metadata'] = json_encode($request->metadata);

        $geoTag->update($updateData);

        return response()->json($this->formatGeoTag($geoTag));
    }

    /**
     * Delete a GeoTag
     */
    public function deleteGeoTag($id): JsonResponse
    {
        $geoTag = GeoTag::where('organization_id', Auth::user()->organization_id)
            ->findOrFail($id);

        $geoTag->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Verify a GeoTag
     */
    public function verifyGeoTag($id): JsonResponse
    {
        $geoTag = GeoTag::where('organization_id', Auth::user()->organization_id)
            ->findOrFail($id);

        $geoTag->update([
            'verified' => true,
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        return response()->json($this->formatGeoTag($geoTag));
    }

    /**
     * Check if a point is within a geofence
     */
    public function checkGeofence(Request $request): JsonResponse
    {
        $request->validate([
            'point.lat' => 'required|numeric|between:-90,90',
            'point.lng' => 'required|numeric|between:-180,180',
            'center.lat' => 'required|numeric|between:-90,90',
            'center.lng' => 'required|numeric|between:-180,180',
            'radiusMeters' => 'required|numeric|min:1|max:100000',
        ]);

        $distance = $this->calculateDistance(
            $request->input('point.lat'),
            $request->input('point.lng'),
            $request->input('center.lat'),
            $request->input('center.lng')
        );

        $isInside = $distance <= $request->radiusMeters;

        return response()->json([
            'isInside' => $isInside,
            'distance' => round($distance, 2),
            'radiusMeters' => $request->radiusMeters,
        ]);
    }

    /**
     * Get entities within a radius of a point
     */
    public function getEntitiesInRadius(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radiusMeters' => 'required|numeric|min:1|max:100000',
            'entityTypes' => 'nullable|array',
        ]);

        $lat = $request->lat;
        $lng = $request->lng;
        $radius = $request->radiusMeters;
        $entityTypes = $request->entityTypes ?? ['delivery', 'inspection', 'geotag'];

        $results = [];

        // Search deliveries in transit
        if (in_array('delivery', $entityTypes)) {
            $deliveries = DeliveryTracking::where('organization_id', Auth::user()->organization_id)
                ->whereIn('status', ['dispatched', 'in_transit', 'nearby'])
                ->whereNotNull('current_latitude')
                ->whereNotNull('current_longitude')
                ->selectRaw("*,
                    (6371000 * acos(
                        cos(radians(?)) * cos(radians(current_latitude)) * cos(radians(current_longitude) - radians(?)) +
                        sin(radians(?)) * sin(radians(current_latitude))
                    )) AS distance", [$lat, $lng, $lat])
                ->having('distance', '<=', $radius)
                ->orderBy('distance')
                ->limit(20)
                ->get()
                ->map(function ($d) {
                    return [
                        'type' => 'delivery',
                        'id' => $d->id,
                        'name' => "Delivery #{$d->id} - {$d->vehicle_number}",
                        'location' => [
                            'lat' => $d->current_latitude,
                            'lng' => $d->current_longitude,
                        ],
                        'distance' => round($d->distance, 2),
                        'status' => $d->status,
                    ];
                });

            $results = array_merge($results, $deliveries->toArray());
        }

        // Search GeoTags
        if (in_array('geotag', $entityTypes)) {
            $geoTags = GeoTag::where('organization_id', Auth::user()->organization_id)
                ->selectRaw("*,
                    (6371000 * acos(
                        cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
                        sin(radians(?)) * sin(radians(latitude))
                    )) AS distance", [$lat, $lng, $lat])
                ->having('distance', '<=', $radius)
                ->orderBy('distance')
                ->limit(30)
                ->get()
                ->map(function ($t) {
                    return [
                        'type' => 'geotag',
                        'id' => $t->id,
                        'name' => $t->name ?? "GeoTag #{$t->id}",
                        'location' => [
                            'lat' => $t->latitude,
                            'lng' => $t->longitude,
                        ],
                        'distance' => round($t->distance, 2),
                        'tagType' => $t->tag_type,
                    ];
                });

            $results = array_merge($results, $geoTags->toArray());
        }

        // Sort all results by distance
        usort($results, fn($a, $b) => $a['distance'] <=> $b['distance']);

        return response()->json($results);
    }

    /**
     * Helper: Calculate distance using Haversine formula
     */
    private function calculateDistance($lat1, $lng1, $lat2, $lng2): float
    {
        $R = 6371000; // Earth radius in meters
        $φ1 = deg2rad($lat1);
        $φ2 = deg2rad($lat2);
        $Δφ = deg2rad($lat2 - $lat1);
        $Δλ = deg2rad($lng2 - $lng1);

        $a = sin($Δφ / 2) * sin($Δφ / 2) +
            cos($φ1) * cos($φ2) *
            sin($Δλ / 2) * sin($Δλ / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $R * $c;
    }

    /**
     * Format helpers
     */
    private function formatDeliveryTracking($tracking): array
    {
        return [
            'id' => $tracking->id,
            'salesOrderId' => $tracking->sales_order_id,
            'vehicleNumber' => $tracking->vehicle_number,
            'driverName' => $tracking->driver_name,
            'driverPhone' => $tracking->driver_phone,
            'originLocation' => $tracking->origin_latitude ? [
                'lat' => $tracking->origin_latitude,
                'lng' => $tracking->origin_longitude,
            ] : null,
            'destinationLocation' => $tracking->destination_latitude ? [
                'lat' => $tracking->destination_latitude,
                'lng' => $tracking->destination_longitude,
            ] : null,
            'currentLocation' => $tracking->current_latitude ? [
                'lat' => $tracking->current_latitude,
                'lng' => $tracking->current_longitude,
            ] : null,
            'estimatedDistanceKm' => $tracking->estimated_distance_km,
            'actualDistanceKm' => $tracking->actual_distance_km,
            'estimatedArrival' => $tracking->estimated_arrival,
            'actualArrival' => $tracking->actual_arrival,
            'status' => $tracking->status,
            'dispatchedAt' => $tracking->dispatched_at,
            'deliveredAt' => $tracking->delivered_at,
        ];
    }

    private function formatSiteInspection($inspection): array
    {
        return [
            'id' => $inspection->id,
            'projectId' => $inspection->project_id,
            'inspectionNumber' => $inspection->inspection_number,
            'inspectorId' => $inspection->inspector_id,
            'inspectionType' => $inspection->inspection_type,
            'inspectionDate' => $inspection->inspection_date,
            'gpsLocation' => [
                'lat' => $inspection->gps_latitude,
                'lng' => $inspection->gps_longitude,
            ],
            'isWithinGeofence' => $inspection->is_within_geofence,
            'distanceFromSite' => $inspection->distance_from_site,
            'weatherConditions' => $inspection->weather_conditions,
            'siteConditions' => $inspection->site_conditions,
            'observations' => $inspection->observations,
            'recommendations' => $inspection->recommendations,
            'photos' => $inspection->photos ? json_decode($inspection->photos) : [],
            'status' => $inspection->status,
        ];
    }

    private function formatGeoTag($tag): array
    {
        return [
            'id' => $tag->id,
            'taggableType' => $tag->taggable_type,
            'taggableId' => $tag->taggable_id,
            'name' => $tag->name,
            'description' => $tag->description,
            'location' => [
                'lat' => $tag->latitude,
                'lng' => $tag->longitude,
            ],
            'address' => $tag->address,
            'tagType' => $tag->tag_type,
            'metadata' => $tag->metadata ? json_decode($tag->metadata) : null,
            'taggedAt' => $tag->tagged_at,
        ];
    }
}
