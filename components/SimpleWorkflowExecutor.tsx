import React, { useState } from 'react';
import { Workflow } from '../types/agents';
import { Language, translations } from '../lib/translations';

interface SimpleWorkflowExecutorProps {
  language: Language;
  workflows: Workflow[];
  onExecuteWorkflow: (workflow: Workflow, input: string) => Promise<void>;
  isExecuting?: boolean;
}

const SimpleWorkflowExecutor: React.FC<SimpleWorkflowExecutorProps> = ({
  language,
  workflows,
  onExecuteWorkflow,
  isExecuting = false
}) => {
  const t = translations[language];
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    // CRITICAL: Previeni esecuzioni multiple
    if (!selectedWorkflow || !input.trim() || isExecuting) return;

    setError(null);
    try {
      await onExecuteWorkflow(selectedWorkflow, input);
    } catch (error) {
      console.error('Error executing workflow:', error);

      // Mostra messaggio di errore più informativo
      if (error instanceof Error) {
        if (error.message.includes('Rate limit exceeded')) {
          setError('Limite di richieste superato. Attendi qualche minuto prima di riprovare.');
        } else if (error.message.includes('API key')) {
          setError('Chiave API non valida. Controlla OPENROUTER_API_KEY nel file .env.local');
        } else {
          setError('Errore durante l\'esecuzione del workflow. Riprova più tardi.');
        }
      } else {
        setError('Errore sconosciuto. Riprova più tardi.');
      }
    }
  };

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsOpen(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">
        {t.executeWorkflow || 'Execute Workflow'}
      </h3>

      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          {t.yourIdea || 'Your Idea'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.describeYourIdea || 'Describe your idea or input...'}
          rows={4}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}


      {/* Workflow Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          {t.selectWorkflow || 'Select Workflow'}
        </label>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <span className="truncate">
              {selectedWorkflow ? selectedWorkflow.name : t.chooseWorkflow || 'Choose a workflow...'}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {workflows.length === 0 ? (
                <div className="p-3 text-sm text-gray-400">
                  {t.noWorkflowsAvailable || 'No workflows available'}
                </div>
              ) : (
                workflows.map((workflow) => (
                  <button
                    key={workflow._id}
                    onClick={() => handleWorkflowSelect(workflow)}
                    className="w-full p-3 text-left hover:bg-gray-600 text-white border-b border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium">{workflow.name}</div>
                    <div className="text-sm text-gray-300 truncate">{workflow.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {t.agents || 'Agents'}: {workflow.steps.length}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Workflow Info */}
      {selectedWorkflow && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">
            {selectedWorkflow.name}
          </h4>
          <p className="text-sm text-gray-300 mb-3">
            {selectedWorkflow.description}
          </p>
          <div className="text-xs text-gray-400">
            <p>
              {t.workflowSteps || 'Workflow Steps'}: {selectedWorkflow.steps.length}
            </p>
            <p>
              {t.status || 'Status'}: 
              <span className={`ml-1 ${selectedWorkflow.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                {selectedWorkflow.isActive ? t.active || 'Active' : t.inactive || 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={!selectedWorkflow || !input.trim() || isExecuting}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
          !selectedWorkflow || !input.trim() || isExecuting
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isExecuting ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t.executing || 'Executing...'}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
            </svg>
            {t.executeWorkflow || 'Execute Workflow'}
          </div>
        )}
      </button>

      {/* Overlay per chiudere il dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SimpleWorkflowExecutor;

