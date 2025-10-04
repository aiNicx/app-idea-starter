import React, { useState, useEffect } from 'react';
import { Workflow } from '../../types/agents';
import { Language, translations } from '../../lib/translations';

interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
  stepId?: string;
  agentId?: string;
}

interface ExecutionPanelProps {
  workflow?: Workflow;
  executionState: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  onExecute: (workflow: Workflow) => void;
  onStop: () => void;
  language: Language;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  workflow,
  executionState,
  onExecute,
  onStop,
  language
}) => {
  const t = translations[language];
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState({
    totalTime: 0,
    stepTimes: {} as { [stepId: string]: number },
    memoryUsage: 0,
    apiCalls: 0,
    tokensUsed: 0,
    errors: 0
  });
  const [activeTab, setActiveTab] = useState<'progress' | 'logs' | 'metrics'>('progress');

  // Simulate execution progress and logs
  useEffect(() => {
    if (executionState === 'running') {
      const startTime = Date.now();

      // Add initial log
      setLogs([{
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        message: t.executionStarted || 'Execution started',
        stepId: '1'
      }]);

      // Simulate step execution
      const stepInterval = setInterval(() => {
        const stepNumber = Math.floor((Date.now() - startTime) / 2000) + 1;
        if (stepNumber <= (workflow?.agentSequence.length || 3)) {
          setLogs(prev => [...prev, {
            id: `step_${stepNumber}`,
            timestamp: Date.now(),
            level: 'success',
            message: `${t.stepCompleted || 'Step'} ${stepNumber} ${t.completed || 'completed'}`,
            stepId: stepNumber.toString()
          }]);
        }
      }, 2000);

      // Simulate completion
      const completionTimeout = setTimeout(() => {
        setLogs(prev => [...prev, {
          id: 'completed',
          timestamp: Date.now(),
          level: 'success',
          message: t.executionCompleted || 'Execution completed successfully'
        }]);

        setMetrics({
          totalTime: Date.now() - startTime,
          stepTimes: {
            '1': 2000,
            '2': 1800,
            '3': 2200
          },
          memoryUsage: 45 * 1024 * 1024, // 45MB
          apiCalls: 6,
          tokensUsed: 2500,
          errors: 0
        });
      }, 8000);

      return () => {
        clearInterval(stepInterval);
        clearTimeout(completionTimeout);
      };
    } else if (executionState === 'idle') {
      setLogs([]);
      setMetrics({
        totalTime: 0,
        stepTimes: {},
        memoryUsage: 0,
        apiCalls: 0,
        tokensUsed: 0,
        errors: 0
      });
    }
  }, [executionState, workflow, t]);

  const getStatusColor = () => {
    switch (executionState) {
      case 'running': return 'text-blue-600';
      case 'paused': return 'text-yellow-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{t.execution || 'Execution'}</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {t[executionState] || executionState}
          </span>
          {executionState === 'idle' && workflow && (
            <button
              onClick={() => onExecute(workflow)}
              className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {t.startExecution || 'Start Execution'}
            </button>
          )}
          {executionState === 'running' && (
            <button
              onClick={onStop}
              className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {t.stopExecution || 'Stop Execution'}
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'progress'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t.progress || 'Progress'}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'logs'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t.logs || 'Logs'}
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'metrics'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t.metrics || 'Metrics'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'progress' && (
          <div className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{t.progress || 'Progress'}</span>
                <span>{executionState === 'running' ? '50%' : '0%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: executionState === 'running' ? '50%' : '0%' }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">
                {t.steps || 'Steps'}
              </h4>
              <div className="space-y-1">
                {workflow?.agentSequence.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-600">
                      {t.agentStep || 'Agent Step'} {index + 1}
                    </span>
                    <div className="ml-auto">
                      <div className={`w-2 h-2 rounded-full ${
                        executionState === 'running' && index < 2 ? 'bg-green-400' : 'bg-gray-300'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-4 h-full overflow-y-auto">
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="flex items-start space-x-3 p-2 rounded">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    log.level === 'success' ? 'bg-green-400' :
                    log.level === 'error' ? 'bg-red-400' :
                    log.level === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`text-xs font-medium ${
                        log.level === 'success' ? 'text-green-600' :
                        log.level === 'error' ? 'text-red-600' :
                        log.level === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {t.totalTime || 'Total Time'}
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {(metrics.totalTime / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {t.memoryUsage || 'Memory Usage'}
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {t.apiCalls || 'API Calls'}
                </h4>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.apiCalls}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {t.tokensUsed || 'Tokens Used'}
                </h4>
                <p className="text-2xl font-bold text-orange-600">
                  {metrics.tokensUsed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionPanel;