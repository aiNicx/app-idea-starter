import React from 'react';
import { Language, translations } from '../../lib/translations';

interface ValidationData {
  type: 'agent' | 'workflow';
  data: any;
}

interface ValidationPanelProps {
  data?: ValidationData | null;
  language: Language;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  data,
  language
}) => {
  const t = translations[language];

  const validateAgent = (agent: any) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!agent.name || agent.name.trim() === '') {
      errors.push(t.nameRequired || 'Name is required');
    }

    if (!agent.description || agent.description.trim() === '') {
      warnings.push(t.descriptionRecommended || 'Description is recommended');
    }

    if (!agent.promptTemplate || agent.promptTemplate.trim() === '') {
      errors.push(t.promptTemplateRequired || 'Prompt template is required');
    }

    // Template validation
    if (agent.promptTemplate) {
      const template = agent.promptTemplate;
      
      // Check for unclosed variables
      const openBraces = (template.match(/\{\{/g) || []).length;
      const closeBraces = (template.match(/\}\}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        errors.push(t.unclosedVariables || 'Unclosed variables in template');
      }

      // Check for common issues
      if (template.includes('{{}}')) {
        warnings.push(t.emptyVariables || 'Empty variables found in template');
      }

      // Check for potential issues
      if (template.length < 50) {
        warnings.push(t.templateTooShort || 'Template seems too short');
      }

      if (template.length > 5000) {
        warnings.push(t.templateTooLong || 'Template seems too long');
      }
    }

    return { errors, warnings };
  };

  const validateWorkflow = (workflow: any) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!workflow.name || workflow.name.trim() === '') {
      errors.push(t.nameRequired || 'Name is required');
    }

    if (!workflow.description || workflow.description.trim() === '') {
      warnings.push(t.descriptionRecommended || 'Description is recommended');
    }

    // Agent sequence validation
    if (!workflow.agentSequence || workflow.agentSequence.length === 0) {
      errors.push(t.workflowNeedsAgents || 'Workflow needs at least one agent');
    } else {
      workflow.agentSequence.forEach((step: any, index: number) => {
        if (!step.agentId) {
          errors.push(`${t.step || 'Step'} ${index + 1}: ${t.agentIdRequired || 'Agent ID is required'}`);
        }
        if (!step.order || step.order <= 0) {
          errors.push(`${t.step || 'Step'} ${index + 1}: ${t.invalidOrder || 'Invalid order'}`);
        }
      });
    }

    return { errors, warnings };
  };

  const getValidationResults = () => {
    if (!data) {
      return { errors: [], warnings: [] };
    }

    if (data.type === 'agent') {
      return validateAgent(data.data);
    } else if (data.type === 'workflow') {
      return validateWorkflow(data.data);
    }

    return { errors: [], warnings: [] };
  };

  const validationResults = getValidationResults();

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t.validation || 'Validation'}
        </h3>
        <p className="text-sm text-gray-500">
          {t.validationResults || 'Validation results for the selected item.'}
        </p>
      </div>

      {!data ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            {t.selectItemToValidate || 'Select an agent or workflow to validate'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Errors */}
          {validationResults.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-sm font-medium text-red-800">
                  {t.errors || 'Errors'} ({validationResults.errors.length})
                </h4>
              </div>
              <ul className="space-y-1">
                {validationResults.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start space-x-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validationResults.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h4 className="text-sm font-medium text-yellow-800">
                  {t.warnings || 'Warnings'} ({validationResults.warnings.length})
                </h4>
              </div>
              <ul className="space-y-1">
                {validationResults.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start space-x-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success */}
          {validationResults.errors.length === 0 && validationResults.warnings.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h4 className="text-sm font-medium text-green-800">
                  {t.validationPassed || 'Validation Passed'}
                </h4>
              </div>
              <p className="text-sm text-green-700 mt-1">
                {t.noIssuesFound || 'No issues found. The item is valid.'}
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {t.summary || 'Summary'}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">{t.errors || 'Errors'}:</span>
                <span className={`ml-2 font-medium ${validationResults.errors.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {validationResults.errors.length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">{t.warnings || 'Warnings'}:</span>
                <span className={`ml-2 font-medium ${validationResults.warnings.length > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {validationResults.warnings.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;