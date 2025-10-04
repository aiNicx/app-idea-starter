import React from 'react';
import { Agent, Workflow } from '../../types/agents';
import { Language } from '../../lib/translations';
import AgentEditor from './AgentEditor';
import WorkflowDesigner from './WorkflowDesigner';
import ExecutionPanel from './ExecutionPanel';
import PreviewPanel from './PreviewPanel';

interface AgentHubMainContentProps {
  language: Language;
  selectedAgent?: Agent;
  selectedWorkflow?: Workflow;
  availableAgents: Agent[];
  executionState: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  previewData?: any;
  onAgentSave: (agent: Agent) => void;
  onAgentCancel: () => void;
  onWorkflowSave: (workflow: Workflow) => void;
  onWorkflowCancel: () => void;
  onExecute: (workflow: Workflow) => void;
  onStop: () => void;
}

const AgentHubMainContent: React.FC<AgentHubMainContentProps> = ({
  language,
  selectedAgent,
  selectedWorkflow,
  availableAgents,
  executionState,
  previewData,
  onAgentSave,
  onAgentCancel,
  onWorkflowSave,
  onWorkflowCancel,
  onExecute,
  onStop
}) => {
  const getMainContent = () => {
    if (executionState !== 'idle') {
      return (
        <div className="flex h-full">
          <div className="flex-1">
            <ExecutionPanel
              workflow={selectedWorkflow}
              executionState={executionState}
              onExecute={onExecute}
              onStop={onStop}
              language={language}
            />
          </div>
          <div className="w-96 border-l border-gray-200">
            <PreviewPanel
              data={previewData}
              executionState={executionState}
              language={language}
            />
          </div>
        </div>
      );
    }

    if (selectedAgent) {
      return (
        <AgentEditor
          agent={selectedAgent}
          onSave={onAgentSave}
          onCancel={onAgentCancel}
          language={language}
        />
      );
    }

    if (selectedWorkflow) {
      return (
        <WorkflowDesigner
          workflow={selectedWorkflow}
          availableAgents={availableAgents}
          onSave={onWorkflowSave}
          onCancel={onWorkflowCancel}
          language={language}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Select an Agent or Workflow</h3>
          <p className="text-gray-300">Choose an agent to edit or a workflow to design from the sidebar.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {getMainContent()}
    </div>
  );
};

export default AgentHubMainContent;
