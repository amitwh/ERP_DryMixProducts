import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Camera,
  CloudSun,
  Save,
  Loader2
} from 'lucide-react';
import { useCurrentLocation } from '@/hooks/useGeolocation';
import api from '@/services/api';

interface Project {
  id: number;
  name: string;
  code: string;
  site_latitude?: number;
  site_longitude?: number;
  geofence_radius_meters?: number;
}

const inspectionTypes = [
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'safety_audit', label: 'Safety Audit' },
  { value: 'progress_review', label: 'Progress Review' },
  { value: 'handover', label: 'Handover Inspection' },
];

const weatherOptions = [
  'Clear', 'Partly Cloudy', 'Cloudy', 'Overcast',
  'Light Rain', 'Heavy Rain', 'Windy', 'Foggy', 'Hot', 'Cold'
];

export default function CreateSiteInspectionPage() {
  const navigate = useNavigate();
  const { coords, loading: locationLoading, error: locationError, refresh: refreshLocation } = useCurrentLocation({
    enableHighAccuracy: true,
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [locationValid, setLocationValid] = useState<boolean | null>(null);
  const [distanceFromSite, setDistanceFromSite] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    projectId: '',
    inspectionType: 'site_visit',
    weatherConditions: '',
    siteConditions: '',
    observations: '',
    recommendations: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.projectId && coords) {
      validateLocation();
    }
  }, [formData.projectId, coords]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const validateLocation = async () => {
    if (!formData.projectId || !coords) return;

    try {
      setValidating(true);
      const response = await api.post(`/geolocation/site-inspections/${formData.projectId}/validate-location`, {
        location: {
          lat: coords.lat,
          lng: coords.lng,
        },
      });
      setLocationValid(response.data.isValid);
      setDistanceFromSite(response.data.distance);
    } catch (error) {
      console.error('Failed to validate location:', error);
      setLocationValid(null);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) {
      alert('Location is required for site inspection');
      return;
    }

    if (!formData.projectId) {
      alert('Please select a project');
      return;
    }

    try {
      setLoading(true);
      await api.post('/geolocation/site-inspections', {
        projectId: parseInt(formData.projectId),
        inspectionType: formData.inspectionType,
        gpsLocation: {
          lat: coords.lat,
          lng: coords.lng,
        },
        weatherConditions: formData.weatherConditions,
        siteConditions: formData.siteConditions,
        observations: formData.observations,
        recommendations: formData.recommendations,
      });
      navigate('/geolocation/inspections');
    } catch (error) {
      console.error('Failed to create inspection:', error);
      alert('Failed to create inspection');
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find(p => p.id.toString() === formData.projectId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Site Inspection</h1>
          <p className="text-gray-600">Create a GPS-verified site inspection report</p>
        </div>
      </div>

      {/* GPS Status Card */}
      <Card className={locationError ? 'border-red-300' : locationValid === true ? 'border-green-300' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            GPS Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                {locationLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Acquiring GPS signal...</span>
                  </div>
                ) : locationError ? (
                  <div className="text-red-600">
                    <p className="font-medium">Location Error</p>
                    <p className="text-sm">{locationError.message}</p>
                  </div>
                ) : coords ? (
                  <div>
                    <p className="font-mono text-lg">
                      {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                    </p>
                    {coords.accuracy && (
                      <p className="text-sm text-gray-500">
                        Accuracy: ±{Math.round(coords.accuracy)}m
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Waiting for location...</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={refreshLocation}>
                Refresh Location
              </Button>
            </div>

            {/* Location Validation Status */}
            {formData.projectId && coords && (
              <div className={`p-3 rounded-lg ${
                validating ? 'bg-gray-50' :
                locationValid === true ? 'bg-green-50' :
                locationValid === false ? 'bg-yellow-50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  {validating ? (
                    <>
                      <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                      <span className="text-gray-600">Validating location...</span>
                    </>
                  ) : locationValid === true ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Within Site Geofence</p>
                        <p className="text-sm text-green-600">
                          {distanceFromSite !== null && `${Math.round(distanceFromSite)}m from site center`}
                        </p>
                      </div>
                    </>
                  ) : locationValid === false ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Outside Geofence</p>
                        <p className="text-sm text-yellow-600">
                          {distanceFromSite !== null && `${Math.round(distanceFromSite)}m from site - inspection will be flagged`}
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inspection Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Inspection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                required
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </option>
                ))}
              </select>
              {selectedProject && (
                <p className="text-sm text-gray-500 mt-1">
                  Site: {selectedProject.site_latitude?.toFixed(4)}, {selectedProject.site_longitude?.toFixed(4)}
                  {selectedProject.geofence_radius_meters && ` (${selectedProject.geofence_radius_meters}m radius)`}
                </p>
              )}
            </div>

            {/* Inspection Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inspection Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {inspectionTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.inspectionType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData({ ...formData, inspectionType: type.value })}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weather Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CloudSun className="w-4 h-4 inline mr-1" />
                Weather Conditions
              </label>
              <div className="flex flex-wrap gap-2">
                {weatherOptions.map((weather) => (
                  <button
                    key={weather}
                    type="button"
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.weatherConditions === weather
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setFormData({ ...formData, weatherConditions: weather })}
                  >
                    {weather}
                  </button>
                ))}
              </div>
            </div>

            {/* Site Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Conditions
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                value={formData.siteConditions}
                onChange={(e) => setFormData({ ...formData, siteConditions: e.target.value })}
                placeholder="Describe current site conditions..."
              />
            </div>

            {/* Observations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observations
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Enter your observations during the inspection..."
              />
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recommendations
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                placeholder="Enter recommendations or action items..."
              />
            </div>

            {/* Photos Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Camera className="w-4 h-4 inline mr-1" />
                Photos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Click to add photos or drag and drop</p>
                <p className="text-sm text-gray-400">Photos will be geotagged automatically</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !coords}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Inspection
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
