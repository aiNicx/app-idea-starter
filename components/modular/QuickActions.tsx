import React from 'react';
import { Language, translations } from '../../lib/translations';

interface QuickActionsProps {
  onCreateAgent: () => void;
  onCreateWorkflow: () => void;
  language: Language;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateAgent,
  onCreateWorkflow,
  language
}) => {
  const t = translations[language];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-white">
        {t.quickActions || 'Quick Actions'}
      </h3>
      
      <div className="space-y-2">
        <button
          onClick={onCreateAgent}
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-blue-300 bg-blue-900/30 border border-blue-600 rounded-lg hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{t.createAgent || 'Create Agent'}</span>
        </button>
        
        <button
          onClick={onCreateWorkflow}
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-purple-300 bg-purple-900/30 border border-purple-600 rounded-lg hover:bg-purple-900/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>{t.createWorkflow || 'Create Workflow'}</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;