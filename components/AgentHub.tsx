
import React from 'react';
import { Language, translations } from '../lib/translations';
import { agentProfiles } from '../lib/agentPrompts';
import WorkflowDiagram from './WorkflowDiagram';
import AgentProfileCard from './AgentProfileCard';

interface AgentHubProps {
  language: Language;
}

const AgentHub: React.FC<AgentHubProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-primary">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-light mb-4">{t.agentHubTitle}</h1>
          <p className="text-lg sm:text-xl text-dark-text max-w-3xl mx-auto">
            {t.agentHubDescription}
          </p>
        </header>

        <section id="workflow" className="mb-16">
          <h2 className="text-3xl font-bold text-accent mb-8 text-center">{t.workflowTitle}</h2>
          <WorkflowDiagram language={language} />
        </section>

        <section id="profiles">
          <h2 className="text-3xl font-bold text-accent mb-8 text-center">{t.agentProfilesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agentProfiles.map(agent => (
              <AgentProfileCard key={agent.id} agent={agent} language={language} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AgentHub;
