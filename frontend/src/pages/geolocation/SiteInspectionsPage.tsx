import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  MapPin,
  ClipboardCheck,
  Plus,
  Search,
  Calendar,
  User,
  Building,
  CheckCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useCurrentLocation } from '@/hooks/useGeolocation';
import api from '@/services/api';

interface SiteInspection {
  id: number;
  projectId: number;
  inspectionNumber: string;
  inspectorId: number;
  inspectionType: string;
  inspectionDate: string;
  gpsLocation: { lat: number; lng: number };
  isWithinGeofence: boolean;
  distanceFromSite: number | null;
  weatherConditions: string;
  siteConditions: string;
  observations: string;
  recommendations: string;
  photos: string[];
  status: string;
}

interface Project {
  id: number;
  name: string;
  code: string;
}

const inspectionTypeLabels: Record<string, string> = {
  site_visit: 'Site Visit',
  quality_check: 'Quality Check',
  safety_audit: 'Safety Audit',
  progress_review: 'Progress Review',
  handover: 'Handover',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function SiteInspectionsPage() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<SiteInspection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const { coords, loading: locationLoading, error: locationError } = useCurrentLocation();

  useEffect(() => {
    fetchData();
  }, [selectedProject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes] = await Promise.all([
        api.get('/projects'),
      ]);
      setProjects(projectsRes.data.data || projectsRes.data);

      if (selectedProject) {
        const inspectionsRes = await api.get(`/geolocation/site-inspections/project/${selectedProject}`);
        setInspections(inspectionsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInspections = inspections.filter(i =>
    i.inspectionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inspectionTypeLabels[i.inspectionType]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Inspections</h1>
          <p className="text-gray-600">GPS-verified site inspections and audits</p>
        </div>
        <Button onClick={() => navigate('/geolocation/inspections/create')}>
          <Plus className="w-4 h-4 mr-2" />
          New Inspection
        </Button>
      </div>

      {/* Current Location Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${coords ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <MapPin className={`w-6 h-6 ${coords ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {locationLoading ? 'Getting your location...' :
                 locationError ? 'Location unavailable' :
                 coords ? 'Location acquired' : 'Waiting for location...'}
              </p>
              {coords && (
                <p className="text-sm text-gray-500 font-mono">
                  {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                  {coords.accuracy && ` (±${Math.round(coords.accuracy)}m)`}
                </p>
              )}
              {locationError && (
                <p className="text-sm text-red-500">{locationError.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">Select a project...</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.code} - {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search inspections..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      {selectedProject && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Inspections</p>
                  <p className="text-2xl font-bold text-gray-900">{inspections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verified Location</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inspections.filter(i => i.isWithinGeofence).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Outside Geofence</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inspections.filter(i => !i.isWithinGeofence).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inspections.filter(i => {
                      const date = new Date(i.inspectionDate);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inspections List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inspections</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedProject ? (
            <div className="p-8 text-center text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select a project to view inspections</p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredInspections.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No inspections found for this project</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/geolocation/inspections/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Inspection
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Inspection #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInspections.map((inspection) => (
                    <tr key={inspection.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900">
                          {inspection.inspectionNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-700">
                          {inspectionTypeLabels[inspection.inspectionType] || inspection.inspectionType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {formatDate(inspection.inspectionDate)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {inspection.isWithinGeofence ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className={inspection.isWithinGeofence ? 'text-green-700' : 'text-yellow-700'}>
                            {inspection.isWithinGeofence ? 'Verified' :
                              `${Math.round(inspection.distanceFromSite || 0)}m away`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={statusColors[inspection.status]}>
                          {inspection.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/geolocation/inspections/${inspection.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
