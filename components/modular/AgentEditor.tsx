import React, { useState, useEffect } from 'react';
import { Agent } from '../../types/agents';
import { Language, translations } from '../../lib/translations';

interface AgentEditorProps {
  agent?: Agent;
  onSave: (agent: Agent) => void;
  onCancel: () => void;
  language: Language;
}

const AgentEditor: React.FC<AgentEditorProps> = ({
  agent,
  onSave,
  onCancel,
  language
}) => {
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    persona: '',
    icon: 'WandIcon',
    promptTemplate: '',
    isActive: true
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.description,
        persona: agent.persona,
        icon: agent.icon,
        promptTemplate: agent.promptTemplate,
        isActive: agent.isActive
      });
    }
  }, [agent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedAgent: Agent = {
      ...agent!,
      ...formData,
      updatedAt: Date.now()
    };
    
    onSave(updatedAgent);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">
          {agent ? t.editAgent || 'Edit Agent' : t.createAgent || 'Create Agent'}
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t.cancel || 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t.save || 'Save'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {t.name || 'Name'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {t.icon || 'Icon'}
              </label>
              <select
                value={formData.icon}
                onChange={(e) => handleChange('icon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
              >
                <option value="WandIcon">Wand</option>
                <option value="CogIcon">Cog</option>
                <option value="LightBulbIcon">Light Bulb</option>
                <option value="CodeIcon">Code</option>
                <option value="DocumentIcon">Document</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t.description || 'Description'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t.persona || 'Persona'}
            </label>
            <textarea
              value={formData.persona}
              onChange={(e) => handleChange('persona', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white placeholder-gray-400"
              placeholder={t.personaPlaceholder || 'Describe the agent\'s personality and behavior...'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t.promptTemplate || 'Prompt Template'}
            </label>
            <textarea
              value={formData.promptTemplate}
              onChange={(e) => handleChange('promptTemplate', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-gray-800 text-white placeholder-gray-400"
              placeholder={t.promptTemplatePlaceholder || 'Enter the prompt template with variables like {{idea}}, {{frontendDoc}}, etc...'}
              required
            />
            <p className="mt-1 text-xs text-gray-300">
              {t.promptTemplateHelp || 'Use variables like {{idea}}, {{frontendDoc}}, {{backendDoc}} in your template.'}
            </p>
          </div>

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
        </form>
      </div>
    </div>
  );
};

export default AgentEditor;