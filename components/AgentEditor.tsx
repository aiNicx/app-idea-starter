import React, { useState } from 'react';
import { Agent } from '../types/agents';
import { Language, translations } from '../lib/translations';
import { OPENROUTER_MODELS } from '../services/openRouterService';

interface AgentEditorProps {
  agent?: Agent;
  language: Language;
  onSave: (agent: Partial<Agent>) => void;
  onCancel: () => void;
}

// Genera dinamicamente i modelli disponibili da OPENROUTER_MODELS
const AVAILABLE_MODELS = Object.entries(OPENROUTER_MODELS).map(([id, name]) => ({
  id,
  name
}));

const AgentEditor: React.FC<AgentEditorProps> = ({
  agent,
  language,
  onSave,
  onCancel
}) => {
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: agent?.name || '',
    description: agent?.description || '',
    systemPrompt: agent?.systemPrompt || '',
    modelId: agent?.modelId || 'google/gemini-2.0-flash-exp:free',
    temperature: agent?.temperature || 0.7,
    maxTokens: agent?.maxTokens || 2000
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {agent ? t.editAgent || 'Edit Agent' : t.createAgent || 'Create Agent'}
          </h2>
          <p className="text-gray-400">
            {t.agentEditorDescription || 'Configure your AI agent with a name, system prompt, and model settings.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t.agentName || 'Agent Name'} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.agentNamePlaceholder || 'e.g., Content Writer, Code Reviewer...'}
            />
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t.description || 'Description'}
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.description || 'Brief description of what this agent does...'}
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t.systemPrompt || 'System Prompt'} *
            </label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              required
              rows={8}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.systemPromptPlaceholder || 'You are a helpful AI assistant that...'}
            />
            <p className="mt-2 text-sm text-gray-400">
              {t.systemPromptHelp || 'Define the behavior and personality of your agent. Use {{input}} to reference the user input.'}
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t.model || 'Model'} *
            </label>
            <select
              value={formData.modelId}
              onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t.temperature || 'Temperature'}: {formData.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{t.deterministic || 'Precise'}</span>
              <span>{t.creative || 'Creative'}</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t.maxTokens || 'Max Tokens'}
            </label>
            <input
              type="number"
              min="100"
              max="8000"
              step="100"
              value={formData.maxTokens}
              onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              {t.save || 'Save'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-semibold transition-colors"
            >
              {t.cancel || 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentEditor;
