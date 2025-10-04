import React from 'react';
import { Agent, Workflow } from '../../types/agents';
import { Language, translations } from '../../lib/translations';

interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'agent' | 'workflow';
  action: 'created' | 'updated' | 'executed' | 'deleted';
  name: string;
  details?: string;
  userId: string;
}

interface HistoryPanelProps {
  agent?: Agent;
  workflow?: Workflow;
  language: Language;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  agent,
  workflow,
  language
}) => {
  const t = translations[language];

  // Mock history data - in a real app this would come from the database
  const mockHistory: HistoryEntry[] = [
    {
      id: '1',
      timestamp: Date.now() - 3600000, // 1 hour ago
      type: 'agent',
      action: 'executed',
      name: agent?.name || 'Test Agent',
      details: 'Successfully executed with 2.3s response time',
      userId: 'user1'
    },
    {
      id: '2',
      timestamp: Date.now() - 7200000, // 2 hours ago
      type: 'agent',
      action: 'updated',
      name: agent?.name || 'Test Agent',
      details: 'Updated prompt template and temperature settings',
      userId: 'user1'
    },
    {
      id: '3',
      timestamp: Date.now() - 86400000, // 1 day ago
      type: 'agent',
      action: 'created',
      name: agent?.name || 'Test Agent',
      details: 'Created with initial configuration',
      userId: 'user1'
    }
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'updated':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'executed':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'deleted':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'executed': return 'bg-purple-100 text-purple-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
      return t.justNow || 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${t.minutesAgo || 'minutes ago'}`;
    } else if (diff < 86400000) { // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${t.hoursAgo || 'hours ago'}`;
    } else {
      const days = Math.floor(diff / 86400000);
      return `${days} ${t.daysAgo || 'days ago'}`;
    }
  };

  const filteredHistory = mockHistory.filter(entry => {
    if (agent && entry.type === 'agent') {
      return entry.name === agent.name;
    }
    if (workflow && entry.type === 'workflow') {
      return entry.name === workflow.name;
    }
    return false;
  });

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t.history || 'History'}
        </h3>
        <p className="text-sm text-gray-500">
          {t.activityHistory || 'Activity history for the selected item.'}
        </p>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            {t.noHistoryFound || 'No history found for this item'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map(entry => (
            <div key={entry.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0 mt-1">
                {getActionIcon(entry.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionColor(entry.action)}`}>
                      {t[entry.action] || entry.action}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                
                {entry.details && (
                  <p className="text-sm text-gray-600 mt-1">
                    {entry.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredHistory.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {t.summary || 'Summary'}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t.totalActivities || 'Total Activities'}:</span>
              <span className="ml-2 font-medium text-gray-900">{filteredHistory.length}</span>
            </div>
            <div>
              <span className="text-gray-600">{t.lastActivity || 'Last Activity'}:</span>
              <span className="ml-2 font-medium text-gray-900">
                {formatTimestamp(filteredHistory[0].timestamp)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;