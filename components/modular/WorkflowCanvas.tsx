import React, { useState, useRef, useCallback } from 'react';
import { Agent, Workflow } from '../../types/agents';
import { Language, translations } from '../../lib/translations';

interface WorkflowCanvasProps {
  workflow: Workflow;
  availableAgents: Agent[];
  onUpdate: (workflow: Workflow) => void;
  language: Language;
}

interface WorkflowStep {
  id: string;
  agentId: string;
  order: number;
  isActive: boolean;
  conditions?: string;
  parallel?: boolean;
  retryCount?: number;
  timeout?: number;
  x: number;
  y: number;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  availableAgents,
  onUpdate,
  language
}) => {
  const t = translations[language];
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedAgent, setDraggedAgent] = useState<Agent | null>(null);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  // Convert workflow agentSequence to steps with positions
  React.useEffect(() => {
    const workflowSteps: WorkflowStep[] = workflow.agentSequence.map((seq, index) => ({
      id: `step_${index}`,
      agentId: seq.agentId,
      order: seq.order,
      isActive: seq.isActive,
      conditions: seq.conditions,
      parallel: false,
      retryCount: 3,
      timeout: 30000,
      x: 100 + (index * 200),
      y: 100
    }));
    setSteps(workflowSteps);
  }, [workflow.agentSequence]);

  const handleDragStart = (agent: Agent) => {
    setDraggedAgent(agent);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedAgent || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      agentId: draggedAgent.id,
      order: steps.length,
      isActive: true,
      parallel: false,
      retryCount: 3,
      timeout: 30000,
      x,
      y
    };

    const newSteps = [...steps, newStep];
    setSteps(newSteps);

    // Update workflow
    const updatedWorkflow = {
      ...workflow,
      agentSequence: newSteps.map(step => ({
        agentId: step.agentId as any,
        order: step.order,
        isActive: step.isActive,
        conditions: step.conditions
      }))
    };
    onUpdate(updatedWorkflow);

    setDraggedAgent(null);
  };

  const handleStepClick = (step: WorkflowStep) => {
    setSelectedStep(step);
  };

  const handleStepUpdate = (updatedStep: WorkflowStep) => {
    const newSteps = steps.map(step => 
      step.id === updatedStep.id ? updatedStep : step
    );
    setSteps(newSteps);

    // Update workflow
    const updatedWorkflow = {
      ...workflow,
      agentSequence: newSteps.map(step => ({
        agentId: step.agentId as any,
        order: step.order,
        isActive: step.isActive,
        conditions: step.conditions
      }))
    };
    onUpdate(updatedWorkflow);
  };

  const handleStepDelete = (stepId: string) => {
    const newSteps = steps.filter(step => step.id !== stepId);
    setSteps(newSteps);

    // Update workflow
    const updatedWorkflow = {
      ...workflow,
      agentSequence: newSteps.map(step => ({
        agentId: step.agentId as any,
        order: step.order,
        isActive: step.isActive,
        conditions: step.conditions
      }))
    };
    onUpdate(updatedWorkflow);
    setSelectedStep(null);
  };

  const getAgentById = (agentId: string) => {
    return availableAgents.find(agent => agent.id === agentId);
  };

  return (
    <div className="flex h-full">
      {/* Canvas */}
      <div className="flex-1 relative">
        <div
          ref={canvasRef}
          className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Steps */}
          {steps.map((step, index) => {
            const agent = getAgentById(step.agentId);
            if (!agent) return null;

            return (
              <div
                key={step.id}
                className={`absolute cursor-pointer p-3 bg-white border-2 rounded-lg shadow-sm hover:shadow-md transition-all ${
                  selectedStep?.id === step.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
                style={{
                  left: step.x,
                  top: step.y,
                  minWidth: '150px'
                }}
                onClick={() => handleStepClick(step)}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {agent.name}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-2">
                  {agent.description}
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    step.isActive ? 'bg-green-400' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-xs text-gray-500">
                    {step.isActive ? t.active || 'Active' : t.inactive || 'Inactive'}
                  </span>
                </div>

                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-400 transform -translate-y-1/2">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-400 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Drop Zone Indicator */}
          {draggedAgent && (
            <div className="absolute inset-0 bg-blue-50 bg-opacity-50 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center">
              <div className="text-blue-600 font-medium">
                {t.dropAgentHere || 'Drop agent here'}
              </div>
            </div>
          )}

          {/* Empty State */}
          {steps.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg font-medium mb-2">
                  {t.dragAgentsHere || 'Drag agents here to build your workflow'}
                </p>
                <p className="text-sm">
                  {t.workflowEmpty || 'Your workflow is empty. Start by dragging agents from the sidebar.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step Properties Panel */}
      {selectedStep && (
        <div className="w-80 border-l border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t.stepProperties || 'Step Properties'}
            </h3>
            <button
              onClick={() => setSelectedStep(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.agent || 'Agent'}
              </label>
              <select
                value={selectedStep.agentId}
                onChange={(e) => handleStepUpdate({
                  ...selectedStep,
                  agentId: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.order || 'Order'}
              </label>
              <input
                type="number"
                value={selectedStep.order}
                onChange={(e) => handleStepUpdate({
                  ...selectedStep,
                  order: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={selectedStep.isActive}
                onChange={(e) => handleStepUpdate({
                  ...selectedStep,
                  isActive: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                {t.active || 'Active'}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.conditions || 'Conditions'}
              </label>
              <textarea
                value={selectedStep.conditions || ''}
                onChange={(e) => handleStepUpdate({
                  ...selectedStep,
                  conditions: e.target.value
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder={t.conditionsPlaceholder || 'Enter conditions for this step...'}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="parallel"
                checked={selectedStep.parallel || false}
                onChange={(e) => handleStepUpdate({
                  ...selectedStep,
                  parallel: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="parallel" className="ml-2 block text-sm text-gray-700">
                {t.parallelExecution || 'Parallel Execution'}
              </label>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleStepDelete(selectedStep.id)}
                className="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {t.delete || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowCanvas;
