import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  MapPin,
  Truck,
  RefreshCw,
  Phone,
  Clock,
  Navigation,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import api from '@/services/api';

interface DeliveryTracking {
  id: number;
  salesOrderId: number;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  originLocation: { lat: number; lng: number } | null;
  destinationLocation: { lat: number; lng: number } | null;
  currentLocation: { lat: number; lng: number } | null;
  estimatedArrival: string;
  actualArrival: string | null;
  status: string;
  dispatchedAt: string;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-gray-100 text-gray-800',
  dispatched: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-yellow-100 text-yellow-800',
  nearby: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  returned: 'bg-purple-100 text-purple-800',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  dispatched: 'Dispatched',
  in_transit: 'In Transit',
  nearby: 'Nearby',
  delivered: 'Delivered',
  failed: 'Failed',
  returned: 'Returned',
};

export default function DeliveryTrackingPage() {
  const [deliveries, setDeliveries] = useState<DeliveryTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryTracking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDeliveries = useCallback(async () => {
    try {
      const response = await api.get('/geolocation/delivery-tracking');
      setDeliveries(response.data);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchDeliveries, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDeliveries]);

  const filteredDeliveries = deliveries.filter(d =>
    d.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.salesOrderId.toString().includes(searchQuery)
  );

  const activeDeliveries = filteredDeliveries.filter(d =>
    ['dispatched', 'in_transit', 'nearby'].includes(d.status)
  );

  const completedToday = filteredDeliveries.filter(d => d.status === 'delivered');

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', {
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
          <h1 className="text-2xl font-bold text-gray-900">Delivery Tracking</h1>
          <p className="text-gray-600">Monitor active deliveries in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={autoRefresh ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchDeliveries}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{activeDeliveries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Navigation className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredDeliveries.filter(d => d.status === 'in_transit').length}
                </p>
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
                <p className="text-sm text-gray-600">Delivered Today</p>
                <p className="text-2xl font-bold text-gray-900">{completedToday.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nearby Destination</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredDeliveries.filter(d => d.status === 'nearby').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Active Deliveries</CardTitle>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by vehicle, driver, or order..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : activeDeliveries.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No active deliveries found
                </div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {activeDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedDelivery?.id === delivery.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedDelivery(delivery)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Truck className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {delivery.vehicleNumber || 'No Vehicle'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Order #{delivery.salesOrderId}
                            </p>
                          </div>
                        </div>
                        <Badge className={statusColors[delivery.status]}>
                          {statusLabels[delivery.status]}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{delivery.driverName || 'No Driver'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>ETA: {formatTime(delivery.estimatedArrival)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map & Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Map integration available</p>
                  <p className="text-sm text-gray-400">
                    Connect with Leaflet, MapLibre, or Google Maps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Delivery Details */}
          {selectedDelivery && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Delivery Details</CardTitle>
                  <Badge className={statusColors[selectedDelivery.status]}>
                    {statusLabels[selectedDelivery.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Number</p>
                      <p className="font-medium">{selectedDelivery.vehicleNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Driver</p>
                      <p className="font-medium">{selectedDelivery.driverName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a
                          href={`tel:${selectedDelivery.driverPhone}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {selectedDelivery.driverPhone || '-'}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Sales Order</p>
                      <p className="font-medium">#{selectedDelivery.salesOrderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dispatched At</p>
                      <p className="font-medium">{formatDateTime(selectedDelivery.dispatchedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estimated Arrival</p>
                      <p className="font-medium">{formatDateTime(selectedDelivery.estimatedArrival)}</p>
                    </div>
                  </div>
                </div>
                {selectedDelivery.currentLocation && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Current Location</p>
                    <p className="font-mono text-sm">
                      {selectedDelivery.currentLocation.lat.toFixed(6)}, {selectedDelivery.currentLocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
