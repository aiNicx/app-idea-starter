import React, { useState } from 'react';
import { Agent, Workflow, AgentConfiguration } from '../../types/agents';
import { Language, translations } from '../../lib/translations';
import ConfigurationPanel from './ConfigurationPanel';
import TemplateEditor from './TemplateEditor';
import ValidationPanel from './ValidationPanel';
import HistoryPanel from './HistoryPanel';

interface AgentHubRightPanelProps {
  language: Language;
  selectedAgent?: Agent;
  selectedWorkflow?: Workflow;
  configurations: AgentConfiguration[];
  onConfigurationUpdate: (config: AgentConfiguration) => void;
  onTemplateUpdate: (template: string) => void;
}

const AgentHubRightPanel: React.FC<AgentHubRightPanelProps> = ({
  language,
  selectedAgent,
  selectedWorkflow,
  configurations,
  onConfigurationUpdate,
  onTemplateUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'template' | 'validation' | 'history'>('config');
  const t = translations[language];

  const getActiveConfiguration = () => {
    if (!selectedAgent) return undefined;
    return configurations.find(config => 
      config.agentId === selectedAgent.id && config.isActive
    );
  };

  const getValidationData = () => {
    if (selectedAgent) {
      return {
        type: 'agent' as const,
        data: selectedAgent
      };
    }
    if (selectedWorkflow) {
      return {
        type: 'workflow' as const,
        data: selectedWorkflow
      };
    }
    return null;
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">
          {selectedAgent ? selectedAgent.name : selectedWorkflow?.name || 'Settings'}
        </h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 px-3 py-2 text-xs font-medium ${
            activeTab === 'config'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/30'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          {t.configuration || 'Config'}
        </button>
        <button
          onClick={() => setActiveTab('template')}
          className={`flex-1 px-3 py-2 text-xs font-medium ${
            activeTab === 'template'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/30'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          {t.template || 'Template'}
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          className={`flex-1 px-3 py-2 text-xs font-medium ${
            activeTab === 'validation'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/30'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          {t.validation || 'Validation'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-3 py-2 text-xs font-medium ${
            activeTab === 'history'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/30'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          {t.history || 'History'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'config' && (
          <ConfigurationPanel
            configuration={getActiveConfiguration()}
            agent={selectedAgent}
            onUpdate={onConfigurationUpdate}
            language={language}
          />
        )}
        
        {activeTab === 'template' && selectedAgent && (
          <TemplateEditor
            template={selectedAgent.promptTemplate}
            onUpdate={onTemplateUpdate}
            language={language}
          />
        )}
        
        {activeTab === 'validation' && (
          <ValidationPanel
            data={getValidationData()}
            language={language}
          />
        )}
        
        {activeTab === 'history' && (
          <HistoryPanel
            agent={selectedAgent}
            workflow={selectedWorkflow}
            language={language}
          />
        )}
      </div>
    </div>
  );
};

export default AgentHubRightPanel;
