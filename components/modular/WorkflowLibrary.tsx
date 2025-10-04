import React from 'react';
import { Workflow } from '../../types/agents';
import { Language, translations } from '../../lib/translations';
import WorkflowCard from './WorkflowCard';

interface WorkflowLibraryProps {
  workflows: Workflow[];
  onWorkflowSelect: (workflow: Workflow) => void;
  language: Language;
}

const WorkflowLibrary: React.FC<WorkflowLibraryProps> = ({
  workflows,
  onWorkflowSelect,
  language
}) => {
  const t = translations[language];

  return (
    <div className="p-4 space-y-4">
      {workflows.length > 0 ? (
        <div className="space-y-2">
          {workflows.map(workflow => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onSelect={() => onWorkflowSelect(workflow)}
              language={language}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            {t.noWorkflowsFound || 'No workflows found'}
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkflowLibrary;
