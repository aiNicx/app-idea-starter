import React, { useState } from 'react';
import { Agent, Workflow } from '../types/agents';
import { Language, translations } from '../lib/translations';
import WorkflowBuilder from './WorkflowBuilder';
import AgentEditor from './AgentEditor';

interface SimpleAgentHubProps {
  language: Language;
  agents: Agent[];
  workflows: Workflow[];
  onCreateAgent: (agent: Partial<Agent>) => void;
  onCreateWorkflow: (workflow: Omit<Workflow, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onEditAgent: (agent: Agent) => void;
  onEditWorkflow: (workflow: Workflow) => void;
}

const SimpleAgentHub: React.FC<SimpleAgentHubProps> = ({
  language,
  agents,
  workflows,
  onCreateAgent,
  onCreateWorkflow,
  onEditAgent,
  onEditWorkflow
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'agents' | 'workflows'>('agents');
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [showAgentEditor, setShowAgentEditor] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateWorkflow = (workflow: Omit<Workflow, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    onCreateWorkflow(workflow);
    setShowWorkflowBuilder(false);
    setSelectedWorkflow(undefined);
  };

  const handleEditWorkflow = (workflow: Omit<Workflow, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (selectedWorkflow) {
      onEditWorkflow({ ...selectedWorkflow, ...workflow } as Workflow);
    }
    setShowWorkflowBuilder(false);
    setSelectedWorkflow(undefined);
  };

  const handleSaveAgent = (agent: Partial<Agent>) => {
    if (selectedAgent) {
      onEditAgent({ ...selectedAgent, ...agent } as Agent);
    } else {
      onCreateAgent(agent);
    }
    setShowAgentEditor(false);
    setSelectedAgent(undefined);
  };

  const handleEditAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentEditor(true);
  };

  const handleEditWorkflowClick = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setShowWorkflowBuilder(true);
  };

  const handleCreateAgentClick = () => {
    setSelectedAgent(undefined);
    setShowAgentEditor(true);
  };

  const handleCreateWorkflowClick = () => {
    setSelectedWorkflow(undefined);
    setShowWorkflowBuilder(true);
  };

  if (showAgentEditor) {
    return (
      <AgentEditor
        agent={selectedAgent}
        language={language}
        onSave={handleSaveAgent}
        onCancel={() => {
          setShowAgentEditor(false);
          setSelectedAgent(undefined);
        }}
      />
    );
  }

  if (showWorkflowBuilder) {
    return (
      <WorkflowBuilder
        workflow={selectedWorkflow}
        agents={agents}
        language={language}
        onSave={selectedWorkflow ? handleEditWorkflow : handleCreateWorkflow}
        onCancel={() => {
          setShowWorkflowBuilder(false);
          setSelectedWorkflow(undefined);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            {t.agentHub || 'Agent Hub'}
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder={t.searchAgentsAndWorkflows || 'Search agents and workflows...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-8 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-700">
          <div className="space-y-2">
            <button
              onClick={handleCreateAgentClick}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.createAgent || 'Create Agent'}
            </button>
            <button
              onClick={handleCreateWorkflowClick}
              className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {t.createWorkflow || 'Create Workflow'}
            </button>
          </div>
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
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'agents' ? (
            <div className="space-y-3">
              {filteredAgents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-300">
                    {t.noAgentsFound || 'No agents found'}
                  </p>
                </div>
              ) : (
                filteredAgents.map(agent => (
                  <div
                    key={agent._id}
                    onClick={() => handleEditAgentClick(agent)}
                    className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {agent.name}
                        </p>
                        <p className="text-xs text-gray-300 truncate">
                          {agent.modelId}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            agent.isSystem 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-blue-900/30 text-blue-400'
                          }`}>
                            {agent.isSystem ? t.system || 'System' : t.custom || 'Custom'}
                          </span>
                          {agent.isActive && (
                            <span className="ml-2 w-2 h-2 bg-green-400 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorkflows.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-300">
                    {t.noWorkflowsFound || 'No workflows found'}
                  </p>
                </div>
              ) : (
                filteredWorkflows.map(workflow => (
                  <div
                    key={workflow._id}
                    onClick={() => handleEditWorkflowClick(workflow)}
                    className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        W
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {workflow.name}
                        </p>
                        <p className="text-xs text-gray-300 truncate">
                          {workflow.description}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-400">
                            {t.agents || 'Agents'}: {workflow.steps.length}
                          </span>
                          {workflow.isActive && (
                            <span className="ml-2 w-2 h-2 bg-green-400 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {t.selectAgentOrWorkflow || 'Select an Agent or Workflow'}
          </h3>
          <p className="text-gray-300 mb-6">
            {t.selectDescription || 'Choose an agent or workflow from the sidebar to view and edit its configuration.'}
          </p>
          <div className="space-y-2">
            <button
              onClick={handleCreateAgentClick}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.createAgent || 'Create Agent'}
            </button>
            <button
              onClick={handleCreateWorkflowClick}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {t.createWorkflow || 'Create Workflow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAgentHub;

