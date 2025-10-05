import React, { useState } from 'react';
import { Agent, Workflow, WorkflowStep } from '../types/agents';
import { Language, translations } from '../lib/translations';

interface WorkflowBuilderProps {
  workflow?: Workflow;
  agents: Agent[];
  language: Language;
  onSave: (workflow: Partial<Workflow>) => void;
  onCancel: () => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  agents,
  language,
  onSave,
  onCancel
}) => {
  const t = translations[language];
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow?.steps || []);
  const addAgentToWorkflow = (agent: Agent) => {
    const newStep: WorkflowStep = {
      agentId: agent._id,
      order: steps.length,
      executeInParallel: false,
      useOutputFrom: steps.length > 0 ? steps.length - 1 : undefined
    };

    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Ricalcola gli order
    setSteps(newSteps.map((step, i) => ({ ...step, order: i })));
  };

  const toggleParallel = (index: number) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      executeInParallel: !newSteps[index].executeInParallel
    };
    setSteps(newSteps);
  };

  const setOutputSource = (index: number, sourceOrder: number | undefined) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      useOutputFrom: sourceOrder
    };
    setSteps(newSteps);
  };

  const handleSave = () => {
    if (!name.trim() || steps.length === 0) return;
    onSave({ name, description, steps, isActive: true });
  };

  const getAgentById = (agentId: string) => {
    return agents.find(a => a._id === agentId);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Panel - Available Agents */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-white">
          {t.availableAgents || 'Available Agents'}
        </h3>
        <div className="space-y-2">
          {agents.map(agent => (
            <div
              key={agent._id}
              className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{agent.name}</p>
                  <p className="text-xs text-gray-300 mt-1">{agent.modelId}</p>
                </div>
                <button
                  onClick={() => addAgentToWorkflow(agent)}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  {t.addToWorkflow || 'Aggiungi'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel - Workflow Builder */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <input
              type="text"
              placeholder={t.workflowName || 'Workflow Name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <textarea
              placeholder={t.workflowDescription || 'Workflow Description'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="min-h-96 border-2 border-dashed border-gray-700 rounded-lg p-8 bg-gray-800/50">
            {steps.length === 0 ? (
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-lg font-medium text-white mb-2">
                  {t.noStepsYet || 'Nessun passaggio ancora'}
                </p>
                <p className="text-sm">
                  {t.addAgentsFromLeft || 'Aggiungi agenti dal pannello di sinistra per iniziare a costruire il tuo workflow'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const agent = getAgentById(step.agentId);
                  if (!agent) return null;

                  return (
                    <div key={index} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-white">{agent.name}</p>
                            <p className="text-xs text-gray-300">{agent.modelId}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeStep(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={step.executeInParallel}
                            onChange={() => toggleParallel(index)}
                            className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-300">
                            {t.executeInParallel || 'Execute in parallel'}
                          </span>
                        </label>

                        {index > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">{t.useOutputFrom || 'Use output from'}:</span>
                            <select
                              value={step.useOutputFrom ?? ''}
                              onChange={(e) => setOutputSource(index, e.target.value ? parseInt(e.target.value) : undefined)}
                              className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                            >
                              <option value="">{t.userInput || 'User input'}</option>
                              {steps.slice(0, index).map((_, i) => (
                                <option key={i} value={i}>
                                  Step {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Actions */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-4 text-white">
          {t.workflowInfo || 'Workflow Info'}
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-300 space-y-2">
              <p><span className="font-medium text-white">{t.steps || 'Steps'}:</span> {steps.length}</p>
              <p><span className="font-medium text-white">{t.parallelSteps || 'Parallel'}:</span> {steps.filter(s => s.executeInParallel).length}</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSave}
              disabled={!name.trim() || steps.length === 0}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {t.saveWorkflow || 'Save Workflow'}
            </button>
            <button
              onClick={onCancel}
              className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
            >
              {t.cancel || 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
