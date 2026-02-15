import { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  ClipboardList,
  Factory,
  ShoppingCart,
  TrendingUp,
  CheckSquare,
  Settings,
  BarChart3
} from 'lucide-react';
import { DashboardCard, KPICard, ActivityTimeline, NotificationPanel } from './components';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    activeManufacturingUnits: 0,
    totalProductionOrders: 0,
    pendingInspections: 0,
    openNCRs: 0,
    totalKPIs: 0,
  });

  const [kpiData, setKpiData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchKPIData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:8100/api/v1/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchKPIData = async () => {
    try {
      const response = await fetch('http://localhost:8100/api/v1/dashboard/widgets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await response.json();
      setKpiData(data.widgets || []);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 fixed left-0 top-0">
          <div className="mb-8">
            <h1 className="text-xl font-bold">ERP DryMix</h1>
            <p className="text-gray-400 text-sm">Enterprise Resource Planning</p>
          </div>

          <nav className="space-y-2">
            <a href="/dashboard" className="flex items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <BarChart3 className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </a>
            <a href="/organizations" className="flex items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <Building2 className="w-5 h-5 mr-3" />
              <span>Organizations</span>
            </a>
            <a href="/users" className="flex items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <Users className="w-5 h-5 mr-3" />
              <span>Users</span>
            </a>
            <a href="/products" className="flex items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <Factory className="w-5 h-5 mr-3" />
              <span>Products</span>
            </a>
            <a href="/customers" className="flex items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <ShoppingCart className="w-5 h-5 mr-3" />
              <span>Customers</span>
            </a>
            <a href="/suppliers" className="flex items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <ClipboardList className="w-5 h-5 mr-3" />
              <span>Suppliers</span>
            </a>
            <a href="/qaqc" className="flex items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <CheckSquare className="w-5 h-5 mr-3" />
              <span>QA/QC</span>
            </a>
            <a href="/inventory" className="flex items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <TrendingUp className="w-5 h-5 mr-3" />
              <span>Inventory</span>
            </a>
            <a href="/production" className="flex items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <Factory className="w-5 h-5 mr-3" />
              <span>Production</span>
            </a>
            <a href="/settings" className="flex items-center px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <Settings className="w-5 h-5 mr-3" />
              <span>Settings</span>
            </a>
          </nav>
        </aside>

        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard Overview
              </h1>
              <p className="text-gray-600">
                Welcome to ERP DryMix Products Management System
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard
                title="Total Organizations"
                value={stats.totalOrganizations}
                icon={Building2}
                color="blue"
                link="/organizations"
              />
              <DashboardCard
                title="Active Users"
                value={stats.totalUsers}
                icon={Users}
                color="green"
                link="/users"
              />
              <DashboardCard
                title="Manufacturing Units"
                value={stats.activeManufacturingUnits}
                icon={Factory}
                color="purple"
                link="/units"
              />
              <DashboardCard
                title="Production Orders"
                value={stats.totalProductionOrders}
                icon={Factory}
                color="orange"
                link="/production"
              />
              <DashboardCard
                title="Pending Inspections"
                value={stats.pendingInspections}
                icon={CheckSquare}
                color="yellow"
                link="/inspections"
              />
              <DashboardCard
                title="Open NCRs"
                value={stats.openNCRs}
                icon={ClipboardList}
                color="red"
                link="/ncr"
              />
              <DashboardCard
                title="Active KPIs"
                value={stats.totalKPIs}
                icon={TrendingUp}
                color="indigo"
                link="/kpi"
              />
            </div>

            {kpiData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <KPICard
                  title="Organizations by Status"
                  type="pie"
                  data={kpiData.find(k => k.title === 'Organizations by Status')}
                />
                <KPICard
                  title="User Growth"
                  type="line"
                  data={kpiData.find(k => k.title === 'User Growth')}
                />
                <KPICard
                  title="KPI Achievement"
                  type="bar"
                  data={kpiData.find(k => k.title === 'KPI Achievement')}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityTimeline title="Recent Activities" />
              <NotificationPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
