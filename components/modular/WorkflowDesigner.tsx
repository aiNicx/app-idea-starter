import React, { useState } from 'react';
import { Workflow, Agent } from '../../types/agents';
import { Language, translations } from '../../lib/translations';

interface WorkflowDesignerProps {
  workflow?: Workflow;
  availableAgents: Agent[];
  onSave: (workflow: Workflow) => void;
  onCancel: () => void;
  language: Language;
}

const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  workflow,
  availableAgents,
  onSave,
  onCancel,
  language
}) => {
  const t = translations[language];
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow>(workflow || {
    id: `workflow_${Date.now()}` as any,
    userId: 'system' as any,
    name: 'New Workflow',
    description: 'A new custom workflow',
    agentSequence: [],
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const handleWorkflowUpdate = (updatedWorkflow: Workflow) => {
    setCurrentWorkflow(updatedWorkflow);
  };

  const handleSave = () => {
    onSave(currentWorkflow);
  };

  const addAgentToWorkflow = (agent: Agent) => {
    const newStep = {
      agentId: agent.id as any,
      order: currentWorkflow.agentSequence.length + 1,
      isActive: true,
      conditions: '',
      parallelExecution: false,
    };
    
    const updatedWorkflow = {
      ...currentWorkflow,
      agentSequence: [...currentWorkflow.agentSequence, newStep],
    };
    
    setCurrentWorkflow(updatedWorkflow);
  };

  const removeAgentFromWorkflow = (index: number) => {
    const updatedSequence = currentWorkflow.agentSequence.filter((_, i) => i !== index);
    const reorderedSequence = updatedSequence.map((step, i) => ({
      ...step,
      order: i + 1
    }));
    
    setCurrentWorkflow({
      ...currentWorkflow,
      agentSequence: reorderedSequence
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {workflow ? t.editWorkflow || 'Edit Workflow' : t.createWorkflow || 'Create Workflow'}
          </h2>
          <input
            type="text"
            value={currentWorkflow.name}
            onChange={(e) => setCurrentWorkflow({
              ...currentWorkflow,
              name: e.target.value
            })}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t.workflowName || 'Workflow name'}
          />
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t.cancel || 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t.save || 'Save'}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-3 border-b border-gray-200">
        <textarea
          value={currentWorkflow.description}
          onChange={(e) => setCurrentWorkflow({
            ...currentWorkflow,
            description: e.target.value
          })}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t.workflowDescription || 'Describe your workflow...'}
        />
      </div>

      {/* Designer */}
      <div className="flex-1 flex">
        {/* Agent Palette */}
        <div className="w-80 border-r border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {t.availableAgents || 'Available Agents'}
          </h3>
          <div className="space-y-2">
            {availableAgents.map(agent => (
              <div
                key={agent.id}
                onClick={() => addAgentToWorkflow(agent)}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xs">
                      {agent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {agent.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Canvas */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {t.workflowSequence || 'Workflow Sequence'}
          </h3>
          <div className="space-y-3">
            {currentWorkflow.agentSequence.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">
                  {t.dragAgentsHere || 'Drag agents here to build your workflow'}
                </p>
              </div>
            ) : (
              currentWorkflow.agentSequence.map((step, index) => {
                const agent = availableAgents.find(a => a.id === step.agentId);
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {agent?.name || 'Unknown Agent'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {agent?.description || 'Agent not found'}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAgentFromWorkflow(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDesigner;