import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  MapPin,
  Tag,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Trash2,
  Edit,
  Navigation,
  Camera
} from 'lucide-react';
import { useCurrentLocation, useDistanceCalculator } from '@/hooks/useGeolocation';
import api from '@/services/api';

interface GeoTag {
  id: number;
  taggableType: string;
  taggableId: string;
  name: string;
  description: string;
  location: { lat: number; lng: number };
  address: string;
  tagType: string;
  metadata: Record<string, any> | null;
  taggedAt: string;
  verified?: boolean;
  distance?: number;
}

const tagTypeColors: Record<string, string> = {
  asset: 'bg-blue-100 text-blue-800',
  site: 'bg-green-100 text-green-800',
  event: 'bg-purple-100 text-purple-800',
  checkpoint: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800',
};

const tagTypeLabels: Record<string, string> = {
  asset: 'Asset',
  site: 'Site',
  event: 'Event',
  checkpoint: 'Checkpoint',
  other: 'Other',
};

export default function GeoTagsPage() {
  const [geoTags, setGeoTags] = useState<GeoTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showNearby, setShowNearby] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(1000); // meters
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { coords, loading: locationLoading } = useCurrentLocation();
  const { formatDistance } = useDistanceCalculator();

  const fetchGeoTags = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/geolocation/geo-tags';
      let params: Record<string, any> = {};

      if (showNearby && coords) {
        url = '/geolocation/geo-tags/nearby';
        params = {
          lat: coords.latitude,
          lng: coords.longitude,
          radius: nearbyRadius,
        };
      }

      if (selectedType) {
        params.tagType = selectedType;
      }

      const response = await api.get(url, { params });
      setGeoTags(response.data);
    } catch (error) {
      console.error('Failed to fetch geo tags:', error);
    } finally {
      setLoading(false);
    }
  }, [showNearby, coords, nearbyRadius, selectedType]);

  useEffect(() => {
    if (!showNearby || (showNearby && coords)) {
      fetchGeoTags();
    }
  }, [fetchGeoTags, showNearby, coords]);

  const handleVerify = async (id: number) => {
    try {
      await api.post(`/geolocation/geo-tags/${id}/verify`);
      fetchGeoTags();
    } catch (error) {
      console.error('Failed to verify geo tag:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this geo tag?')) return;

    try {
      await api.delete(`/geolocation/geo-tags/${id}`);
      fetchGeoTags();
    } catch (error) {
      console.error('Failed to delete geo tag:', error);
    }
  };

  const filteredTags = geoTags.filter(tag =>
    tag.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Geo Tags</h1>
          <p className="text-gray-600">Manage location tags for assets, sites, and events</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Geo Tag
        </Button>
      </div>

      {/* Current Location */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${coords ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Navigation className={`w-6 h-6 ${coords ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {locationLoading ? 'Getting location...' :
                   coords ? 'Your Location' : 'Location unavailable'}
                </p>
                {coords && (
                  <p className="text-sm text-gray-500 font-mono">
                    {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={showNearby ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowNearby(!showNearby)}
                disabled={!coords}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {showNearby ? 'Showing Nearby' : 'Show Nearby'}
              </Button>
              {showNearby && (
                <select
                  className="border rounded-lg px-3 py-1.5 text-sm"
                  value={nearbyRadius}
                  onChange={(e) => setNearbyRadius(parseInt(e.target.value))}
                >
                  <option value={100}>100m</option>
                  <option value={500}>500m</option>
                  <option value={1000}>1km</option>
                  <option value={5000}>5km</option>
                  <option value={10000}>10km</option>
                </select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search tags..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Types</option>
            {Object.entries(tagTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <Button variant="outline" className="w-full" onClick={fetchGeoTags}>
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(tagTypeLabels).map(([type, label]) => (
          <Card key={type}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tagTypeColors[type].replace('text-', 'text-').split(' ')[0]}`}>
                  <Tag className={`w-4 h-4 ${tagTypeColors[type].split(' ')[1]}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{label}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {geoTags.filter(t => t.tagType === type).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Loading...</div>
        ) : filteredTags.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No geo tags found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Geo Tag
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredTags.map((tag) => (
            <Card key={tag.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Map Preview Placeholder */}
                <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-blue-400" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{tag.name || 'Unnamed Tag'}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{tag.description || '-'}</p>
                    </div>
                    <Badge className={tagTypeColors[tag.tagType]}>
                      {tagTypeLabels[tag.tagType]}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span className="font-mono text-xs">
                        {tag.location.lat.toFixed(4)}, {tag.location.lng.toFixed(4)}
                      </span>
                    </div>
                    {tag.address && (
                      <p className="text-xs line-clamp-1">{tag.address}</p>
                    )}
                    {tag.distance !== undefined && (
                      <p className="text-xs font-medium text-blue-600">
                        {formatDistance(tag.distance)} away
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-gray-400">
                      {formatDate(tag.taggedAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      {!tag.verified && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerify(tag.id)}
                          title="Verify"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tag.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal would go here */}
      {showCreateModal && (
        <CreateGeoTagModal
          coords={coords}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchGeoTags();
          }}
        />
      )}
    </div>
  );
}

// Simple Create Modal Component
interface CreateGeoTagModalProps {
  coords: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onCreated: () => void;
}

function CreateGeoTagModal({ coords, onClose, onCreated }: CreateGeoTagModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tagType: 'site',
    taggableType: 'manual',
    taggableId: Date.now().toString(),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) {
      alert('Location not available');
      return;
    }

    try {
      setLoading(true);
      await api.post('/geolocation/geo-tags', {
        ...formData,
        location: {
          lat: coords.latitude,
          lng: coords.longitude,
        },
      });
      onCreated();
    } catch (error) {
      console.error('Failed to create geo tag:', error);
      alert('Failed to create geo tag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Create Geo Tag</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter tag name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={formData.tagType}
              onChange={(e) => setFormData({ ...formData, tagType: e.target.value })}
            >
              {Object.entries(tagTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Location</p>
            {coords ? (
              <p className="font-mono text-sm">
                {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
              </p>
            ) : (
              <p className="text-sm text-red-500">Location not available</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !coords}>
              {loading ? 'Creating...' : 'Create Geo Tag'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
