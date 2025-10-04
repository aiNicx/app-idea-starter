import React, { useState } from 'react';
import { Language, translations } from '../../lib/translations';

interface TemplateEditorProps {
  template: string;
  onUpdate: (template: string) => void;
  language: Language;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onUpdate,
  language
}) => {
  const t = translations[language];
  const [localTemplate, setLocalTemplate] = useState(template);

  const handleChange = (value: string) => {
    setLocalTemplate(value);
    onUpdate(value);
  };

  const insertVariable = (variable: string) => {
    const newTemplate = localTemplate + `{{${variable}}}`;
    setLocalTemplate(newTemplate);
    onUpdate(newTemplate);
  };

  const availableVariables = [
    'idea',
    'frontendDoc',
    'backendDoc',
    'userInput',
    'context',
    'language',
    'previousResult'
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {t.templateEditor || 'Template Editor'}
        </h3>
        <p className="text-sm text-gray-500">
          {t.editPromptTemplate || 'Edit the prompt template for this agent.'}
        </p>
      </div>

      {/* Variables Palette */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {t.availableVariables || 'Available Variables'}
        </h4>
        <div className="flex flex-wrap gap-2">
          {availableVariables.map(variable => (
            <button
              key={variable}
              onClick={() => insertVariable(variable)}
              className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {`{{${variable}}}`}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4">
          <textarea
            value={localTemplate}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
            placeholder={t.templatePlaceholder || 'Enter your template here...'}
          />
        </div>

        {/* Help Text */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {t.templateHelp || 'Template Help'}
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• {t.useVariables || 'Use variables like {{idea}} to insert dynamic content'}</li>
            <li>• {t.conditionalLogic || 'Use {{#if condition}}...{{/if}} for conditional logic'}</li>
            <li>• {t.loops || 'Use {{#each items}}...{{/each}} for loops'}</li>
            <li>• {t.comments || 'Use {{!-- comment --}} for comments'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;