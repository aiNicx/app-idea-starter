import React from 'react';
import { Agent } from '../../types/agents';
import { Language, translations } from '../../lib/translations';

interface AgentCardProps {
  agent: Agent;
  onSelect: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onExecute?: () => void;
  language: Language;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onExecute,
  language
}) => {
  const t = translations[language];

  const getIconComponent = (iconName: string) => {
    // Placeholder per le icone - in futuro si può implementare un sistema di icone dinamico
    return (
      <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center">
        <span className="text-blue-300 font-semibold text-sm">
          {agent.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div
      onClick={onSelect}
      className="p-3 border border-gray-700 rounded-lg hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all duration-200 group bg-gray-800/50"
    >
      <div className="flex items-start space-x-3">
        {getIconComponent(agent.icon)}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-white truncate">
              {agent.name}
            </h5>
            <div className="flex items-center space-x-1">
              {agent.isSystem && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-300">
                  {t.system || 'System'}
                </span>
              )}
              {agent.isActive ? (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              ) : (
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-300 mt-1 line-clamp-2">
            {agent.description}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {agent.isSystem ? t.predefined || 'Predefined' : t.custom || 'Custom'}
            </span>
            
            {/* Action buttons - shown on hover */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onExecute && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExecute();
                  }}
                  className="p-1 text-gray-400 hover:text-blue-400"
                  title={t.execute || 'Execute'}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
              {onEdit && !agent.isSystem && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1 text-gray-400 hover:text-blue-400"
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

export default AgentCard;