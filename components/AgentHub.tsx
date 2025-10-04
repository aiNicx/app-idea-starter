
import React, { useState, useEffect } from 'react';
import { Language, translations } from '../lib/translations';
import { useDynamicAgents } from '../hooks/useDynamicAgents';
import { Agent, Workflow, AgentConfiguration } from '../types/agents';
import AgentHubSidebar from './modular/AgentHubSidebar';
import AgentHubMainContent from './modular/AgentHubMainContent';
import AgentHubRightPanel from './modular/AgentHubRightPanel';

interface AgentHubProps {
  language: Language;
  userId: string;
}

const AgentHub: React.FC<AgentHubProps> = ({ language, userId }) => {
  const t = translations[language];
  const {
    agents: rawAgents,
    workflows: rawWorkflows,
    configurations: rawConfigurations,
    createAgent,
    updateAgent,
    deleteAgent,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeAgent,
    executeWorkflow
  } = useDynamicAgents(userId);

  // Map Convex data to our types
  const agents = rawAgents.map(agent => ({
    ...agent,
    id: agent._id
  }));

  const workflows = rawWorkflows.map(workflow => ({
    ...workflow,
    id: workflow._id
  }));

  const configurations = rawConfigurations.map(config => ({
    ...config,
    id: config._id
  }));

  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | undefined>();
  const [executionState, setExecutionState] = useState<'idle' | 'running' | 'paused' | 'completed' | 'error'>('idle');
  const [previewData, setPreviewData] = useState<any>();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter agents and workflows based on search query
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setSelectedWorkflow(undefined);
    setExecutionState('idle');
  };

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setSelectedAgent(undefined);
    setExecutionState('idle');
  };

  const handleCreateAgent = () => {
    const newAgent: Agent = {
      id: `agent_${Date.now()}` as any,
      userId: userId as any,
      name: 'New Agent',
      description: 'A new custom agent',
      persona: 'I am a helpful AI assistant',
      icon: 'WandIcon',
      promptTemplate: 'You are a helpful assistant. Help the user with: {{idea}}',
      isActive: true,
      isSystem: false,
      order: agents.length,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    createAgent(newAgent);
    setSelectedAgent(newAgent);
  };

  const handleCreateWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `workflow_${Date.now()}` as any,
      userId: userId as any,
      name: 'New Workflow',
      description: 'A new custom workflow',
      agentSequence: [],
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    createWorkflow(newWorkflow);
    setSelectedWorkflow(newWorkflow);
  };

  const handleAgentSave = (agent: Agent) => {
    updateAgent({
      agentId: agent._id || agent.id,
      name: agent.name,
      description: agent.description,
      persona: agent.persona,
      icon: agent.icon,
      promptTemplate: agent.promptTemplate,
      isActive: agent.isActive,
      isSystem: agent.isSystem,
      order: agent.order
    });
    setSelectedAgent(undefined);
  };

  const handleAgentCancel = () => {
    setSelectedAgent(undefined);
  };

  const handleWorkflowSave = (workflow: Workflow) => {
    updateWorkflow({
      workflowId: workflow._id || workflow.id,
      name: workflow.name,
      description: workflow.description,
      isActive: workflow.isActive,
      agentSequence: workflow.agentSequence
    });
    setSelectedWorkflow(undefined);
  };

  const handleWorkflowCancel = () => {
    setSelectedWorkflow(undefined);
  };

  const handleExecute = async (workflow: Workflow) => {
    setExecutionState('running');
    try {
      const context = {
        idea: 'Test idea for workflow execution',
        language: language,
        userId: userId as any,
        variables: {},
        previousResults: {}
      };
      const result = await executeWorkflow(workflow, context);
      setPreviewData(result);
      setExecutionState('completed');
    } catch (error) {
      console.error('Execution error:', error);
      setExecutionState('error');
    }
  };

  const handleStop = () => {
    setExecutionState('idle');
    setPreviewData(undefined);
  };

  const handleConfigurationUpdate = (config: AgentConfiguration) => {
    // Update configuration logic here
    console.log('Configuration updated:', config);
  };

  const handleTemplateUpdate = (template: string) => {
    if (selectedAgent) {
      const updatedAgent = { ...selectedAgent, promptTemplate: template };
      setSelectedAgent(updatedAgent);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <AgentHubSidebar
        language={language}
        agents={filteredAgents}
        workflows={filteredWorkflows}
        onAgentSelect={handleAgentSelect}
        onWorkflowSelect={handleWorkflowSelect}
        onCreateAgent={handleCreateAgent}
        onCreateWorkflow={handleCreateWorkflow}
        onSearch={setSearchQuery}
      />

      {/* Main Content */}
      <AgentHubMainContent
        language={language}
        selectedAgent={selectedAgent}
        selectedWorkflow={selectedWorkflow}
        availableAgents={agents}
        executionState={executionState}
        previewData={previewData}
        onAgentSave={handleAgentSave}
        onAgentCancel={handleAgentCancel}
        onWorkflowSave={handleWorkflowSave}
        onWorkflowCancel={handleWorkflowCancel}
        onExecute={handleExecute}
        onStop={handleStop}
      />

      {/* Right Panel */}
      <AgentHubRightPanel
        language={language}
        selectedAgent={selectedAgent}
        selectedWorkflow={selectedWorkflow}
        configurations={configurations}
        onConfigurationUpdate={handleConfigurationUpdate}
        onTemplateUpdate={handleTemplateUpdate}
      />
    </div>
  );
};

export default AgentHub;
