import React, { useState, useEffect, useRef } from 'react';
import { Language, translations } from '../../lib/translations';

interface AdvancedTemplateEditorProps {
  template: string;
  onUpdate: (template: string) => void;
  language: Language;
  className?: string;
}

const AdvancedTemplateEditor: React.FC<AdvancedTemplateEditorProps> = ({
  template,
  onUpdate,
  language,
  className = ''
}) => {
  const t = translations[language];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const availableVariables = [
    '{{idea}}',
    '{{frontendDoc}}',
    '{{backendDoc}}',
    '{{langInstruction}}',
    '{{userName}}',
    '{{projectName}}',
    '{{currentDate}}',
    '{{currentTime}}'
  ];

  const conditionalBlocks = [
    '{{#if variable}}...{{/if}}',
    '{{#unless variable}}...{{/unless}}',
    '{{#each items}}...{{/each}}'
  ];

  const insertVariable = (variable: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newTemplate = template.substring(0, start) + variable + template.substring(end);
      onUpdate(newTemplate);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + variable.length, start + variable.length);
        }
      }, 0);
    }
  };

  const insertConditional = (block: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newTemplate = template.substring(0, start) + block + template.substring(end);
      onUpdate(newTemplate);
      
      // Set cursor position inside the conditional block
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const cursorPos = start + block.indexOf('...');
          textareaRef.current.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart || 0;
      const end = textareaRef.current?.selectionEnd || 0;
      const newTemplate = template.substring(0, start) + '  ' + template.substring(end);
      onUpdate(newTemplate);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start + 2, start + 2);
        }
      }, 0);
    }
  };

  const validateTemplate = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for unclosed conditionals
    const ifCount = (template.match(/\{\{#if/g) || []).length;
    const endIfCount = (template.match(/\{\{\/if\}/g) || []).length;
    if (ifCount !== endIfCount) {
      errors.push('Unclosed {{#if}} blocks');
    }

    const unlessCount = (template.match(/\{\{#unless/g) || []).length;
    const endUnlessCount = (template.match(/\{\{\/unless\}/g) || []).length;
    if (unlessCount !== endUnlessCount) {
      errors.push('Unclosed {{#unless}} blocks');
    }

    const eachCount = (template.match(/\{\{#each/g) || []).length;
    const endEachCount = (template.match(/\{\{\/each\}/g) || []).length;
    if (eachCount !== endEachCount) {
      errors.push('Unclosed {{#each}} blocks');
    }

    // Check for undefined variables
    const variableMatches = template.match(/\{\{([^}]+)\}\}/g) || [];
    variableMatches.forEach((match: string) => {
      const variable = match.replace(/\{\{|\}\}/g, '');
      if (!variable.startsWith('#') && !variable.startsWith('/') && !availableVariables.includes(match)) {
        warnings.push(`Variable ${match} might be undefined`);
      }
    });

    return { errors, warnings };
  };

  const { errors, warnings } = validateTemplate();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Variable Palette */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t.availableVariables || 'Available Variables'}
          </span>
          <div className="text-xs text-gray-500">
            {t.clickToInsert || 'Click to insert'}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {availableVariables.map(variable => (
            <button
              key={variable}
              onClick={() => insertVariable(variable)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
            >
              {variable}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {conditionalBlocks.map(block => (
            <button
              key={block}
              onClick={() => insertConditional(block)}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors"
            >
              {block}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={template}
          onChange={(e) => onUpdate(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={12}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder={t.templatePlaceholder || 'Enter your template here...'}
        />
        
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 border-r border-gray-200 rounded-l-md pointer-events-none">
          {template.split('\n').map((_, index) => (
            <div key={index} className="text-xs text-gray-400 text-center leading-6">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Validation */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="space-y-2">
          {errors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-1">
                {t.errors || 'Errors'}
              </h4>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="text-xs text-red-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-600 mb-1">
                {t.warnings || 'Warnings'}
              </h4>
              <div className="space-y-1">
                {warnings.map((warning, index) => (
                  <div key={index} className="text-xs text-yellow-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        {t.templateHelp || 'Use variables like {{idea}}, {{frontendDoc}} in your template. You can also use conditional logic with {{#if}} and {{#unless}}.'}
      </div>
    </div>
  );
};

export default AdvancedTemplateEditor;
