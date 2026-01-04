import React, { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';

interface Activity {
  id: number;
  action: string;
  module: string;
  user: string;
  timestamp: string;
}

interface ActivityTimelineProps {
  title: string;
}

export default function ActivityTimeline({ title }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('http://localhost:8100/api/v1/activity-log', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await response.json();
      setActivities(data.data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No recent activities</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Clock className="w-5 h-5 text-gray-400" />
                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {activity.module}
                  </span>
                  <span className="text-sm text-gray-900">{activity.action}</span>
                </div>
                <p className="text-sm text-gray-600">by {activity.user}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
