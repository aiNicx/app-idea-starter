import React from 'react';
import { Workflow } from '../../types/agents';
import { Language, translations } from '../../lib/translations';

interface WorkflowCardProps {
  workflow: Workflow;
  onSelect: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onExecute?: () => void;
  language: Language;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onExecute,
  language
}) => {
  const t = translations[language];

  return (
    <div
      onClick={onSelect}
      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all duration-200 group"
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-900 truncate">
              {workflow.name}
            </h5>
            <div className="flex items-center space-x-1">
              {workflow.isActive ? (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              ) : (
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {workflow.description}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {workflow.agentSequence.length} {t.steps || 'steps'}
            </span>
            
            {/* Action buttons - shown on hover */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onExecute && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExecute();
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title={t.execute || 'Execute'}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title={t.edit || 'Edit'}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;