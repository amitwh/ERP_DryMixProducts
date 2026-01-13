import React from 'react';

interface KPICardProps {
  title: string;
  type: 'pie' | 'line' | 'bar';
  data?: any;
}

function KPICardComponent({ title, type, data }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="h-64 flex items-center justify-center">
        {data ? (
          <div className="text-center">
            {type === 'pie' && (
              <div className="w-48 h-48">
                <div className="flex items-center justify-center h-full">
                  <svg className="animate-spin w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 8"></path>
                  </svg>
                  <p className="mt-4 text-gray-600">Loading chart data...</p>
                </div>
              </div>
            )}
            {type === 'line' && (
              <div className="w-full h-48">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  <path
                    d="M0 200 L50 180 L100 160 L150 140 L200 120 L250 100 L300 80 L350 60 L400 40"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                  />
                </svg>
                <p className="text-center text-gray-600">Trend visualization</p>
              </div>
            )}
            {type === 'bar' && (
              <div className="w-full h-48">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  <rect x="50" y="150" width="40" height="50" fill="#10B981" />
                  <rect x="150" y="100" width="40" height="100" fill="#3B82F6" />
                  <rect x="250" y="75" width="40" height="125" fill="#F59E0B" />
                </svg>
                <p className="text-center text-gray-600">Achievement comparison</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export both named and default for compatibility
export { KPICardComponent as KPICard };
export default KPICardComponent;
