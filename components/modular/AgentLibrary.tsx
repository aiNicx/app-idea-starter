import React from 'react';
import { Agent } from '../../types/agents';
import { Language, translations } from '../../lib/translations';
import AgentCard from './AgentCard';

interface AgentLibraryProps {
  agents: Agent[];
  onAgentSelect: (agent: Agent) => void;
  language: Language;
}

const AgentLibrary: React.FC<AgentLibraryProps> = ({
  agents,
  onAgentSelect,
  language
}) => {
  const t = translations[language];

  const systemAgents = agents.filter(agent => agent.isSystem);
  const customAgents = agents.filter(agent => !agent.isSystem);

  return (
    <div className="p-4 space-y-6">
      {/* System Agents */}
      {systemAgents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white mb-3">
            {t.systemAgents || 'System Agents'}
          </h4>
          <div className="space-y-2">
            {systemAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onSelect={() => onAgentSelect(agent)}
                language={language}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Agents */}
      {customAgents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white mb-3">
            {t.customAgents || 'Custom Agents'}
          </h4>
          <div className="space-y-2">
            {customAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onSelect={() => onAgentSelect(agent)}
                language={language}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {agents.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-sm text-gray-300">
            {t.noAgentsFound || 'No agents found'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentLibrary;
