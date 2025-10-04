import React, { useState } from 'react';
import { Agent, Workflow } from '../../types/agents';
import { Language, translations } from '../../lib/translations';
import AgentLibrary from './AgentLibrary';
import WorkflowLibrary from './WorkflowLibrary';
import QuickActions from './QuickActions';
import SearchBar from './SearchBar';

interface AgentHubSidebarProps {
  language: Language;
  agents: Agent[];
  workflows: Workflow[];
  onAgentSelect: (agent: Agent) => void;
  onWorkflowSelect: (workflow: Workflow) => void;
  onCreateAgent: () => void;
  onCreateWorkflow: () => void;
  onSearch: (query: string) => void;
}

const AgentHubSidebar: React.FC<AgentHubSidebarProps> = ({
  language,
  agents,
  workflows,
  onAgentSelect,
  onWorkflowSelect,
  onCreateAgent,
  onCreateWorkflow,
  onSearch
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'workflows'>('agents');
  const t = translations[language];

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">{t.agentHubTitle}</h2>
        <SearchBar onSearch={onSearch} placeholder={t.searchAgentsAndWorkflows || 'Search agents and workflows...'} language={language} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-700">
        <QuickActions 
          onCreateAgent={onCreateAgent}
          onCreateWorkflow={onCreateWorkflow}
          language={language}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('agents')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'agents'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/30'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          {t.agents || 'Agents'}
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'workflows'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/30'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          {t.workflows || 'Workflows'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'agents' ? (
          <AgentLibrary
            agents={agents}
            onAgentSelect={onAgentSelect}
            language={language}
          />
        ) : (
          <WorkflowLibrary
            workflows={workflows}
            onWorkflowSelect={onWorkflowSelect}
            language={language}
          />
        )}
      </div>
    </div>
  );
};

export default AgentHubSidebar;
