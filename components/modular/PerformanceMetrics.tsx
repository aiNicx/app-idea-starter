import React from 'react';
import { Language, translations } from '../../lib/translations';

interface PerformanceMetricsProps {
  metrics: {
    totalTime: number;
    stepTimes: { [stepId: string]: number };
    memoryUsage: number;
    apiCalls: number;
    tokensUsed: number;
    errors: number;
  };
  language: Language;
  className?: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics,
  language,
  className = ''
}) => {
  const t = translations[language];

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">
        {t.performanceMetrics || 'Performance Metrics'}
      </h3>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t.totalTime || 'Total Time'}
              </p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.totalTime, { good: 5000, warning: 15000 })}`}>
                {formatTime(metrics.totalTime)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t.apiCalls || 'API Calls'}
              </p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.apiCalls, { good: 5, warning: 15 })}`}>
                {metrics.apiCalls}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t.memoryUsage || 'Memory Usage'}
              </p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.memoryUsage, { good: 50 * 1024 * 1024, warning: 100 * 1024 * 1024 })}`}>
                {formatBytes(metrics.memoryUsage)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t.tokensUsed || 'Tokens Used'}
              </p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.tokensUsed, { good: 1000, warning: 5000 })}`}>
                {metrics.tokensUsed.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Step Times Chart */}
      {Object.keys(metrics.stepTimes).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            {t.stepTimes || 'Step Times'}
          </h4>
          <div className="space-y-2">
            {Object.entries(metrics.stepTimes).map(([stepId, time]) => (
              <div key={stepId} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {t.step || 'Step'} {stepId}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((time / Math.max(...Object.values(metrics.stepTimes))) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${getPerformanceColor(time, { good: 2000, warning: 5000 })}`}>
                    {formatTime(time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Rate */}
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600">
              {t.errors || 'Errors'}
            </p>
            <p className={`text-2xl font-bold ${metrics.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.errors}
            </p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
