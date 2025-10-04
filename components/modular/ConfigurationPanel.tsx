import React, { useState } from 'react';
import { Agent, AgentConfiguration } from '../../types/agents';
import { Language, translations } from '../../lib/translations';

interface ConfigurationPanelProps {
  configuration?: AgentConfiguration;
  agent?: Agent;
  onUpdate: (config: AgentConfiguration) => void;
  language: Language;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  configuration,
  agent,
  onUpdate,
  language
}) => {
  const t = translations[language];
  const [formData, setFormData] = useState({
    modelId: configuration?.modelId || 'openai/gpt-4',
    temperature: configuration?.temperature || 0.7,
    maxTokens: configuration?.maxTokens || 2000,
    customPrompt: configuration?.customPrompt || '',
    isActive: configuration?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agent) return;

    const updatedConfig: AgentConfiguration = {
      id: configuration?.id || `config_${Date.now()}` as any,
      agentId: agent.id,
      userId: agent.userId,
      modelId: formData.modelId,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
      customPrompt: formData.customPrompt || undefined,
      isActive: formData.isActive,
      createdAt: configuration?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    onUpdate(updatedConfig);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Importa i modelli da OpenRouter per consistenza
  const models = [
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' },
    { id: 'alibaba/tongyi-deepresearch-30b-a3b:free', name: 'Tongyi DeepResearch (Free)' },
    { id: 'openai/gpt-4', name: 'GPT-4' },
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet' },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
    { id: 'google/gemini-pro', name: 'Gemini Pro' },
    { id: 'meta/llama-2-70b', name: 'Llama 2 70B' }
  ];

  return (
    <div className="p-4 space-y-6 bg-gray-900 text-white">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {t.modelSettings || 'Model Settings'}
        </h3>
        <p className="text-sm text-gray-300">
          {t.configureModelForAgent || 'Configure the AI model settings for this agent.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {t.model || 'Model'}
          </label>
          <select
            value={formData.modelId}
            onChange={(e) => handleChange('modelId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {t.temperature || 'Temperature'} ({formData.temperature})
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-dark"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{t.deterministic || 'Deterministic'}</span>
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
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
          />
          <p className="text-xs text-gray-300 mt-1">
            {t.maxTokensHelp || 'Maximum number of tokens in the response (100-8000)'}
          </p>
        </div>

        {/* Custom Prompt */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {t.customPrompt || 'Custom Prompt'}
          </label>
          <textarea
            value={formData.customPrompt}
            onChange={(e) => handleChange('customPrompt', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white placeholder-gray-400"
            placeholder={t.customPromptPlaceholder || 'Override the default prompt template...'}
          />
          <p className="text-xs text-gray-300 mt-1">
            {t.customPromptHelp || 'Optional: Override the agent\'s default prompt template'}
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-white">
            {t.active || 'Active'}
          </label>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t.saveConfiguration || 'Save Configuration'}
          </button>
        </div>
      </form>

      {/* Current Configuration Info */}
      {configuration && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">
            {t.currentConfiguration || 'Current Configuration'}
          </h4>
          <div className="space-y-1 text-xs text-gray-300">
            <p><span className="font-medium">{t.model || 'Model'}:</span> {configuration.modelId}</p>
            <p><span className="font-medium">{t.temperature || 'Temperature'}:</span> {configuration.temperature}</p>
            <p><span className="font-medium">{t.maxTokens || 'Max Tokens'}:</span> {configuration.maxTokens}</p>
            <p><span className="font-medium">{t.status || 'Status'}:</span> 
              <span className={`ml-1 ${configuration.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                {configuration.isActive ? t.active || 'Active' : t.inactive || 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;