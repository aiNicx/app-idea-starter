import React, { useState } from 'react';
import { AgentProfile } from '../lib/agentPrompts';
import { Language, translations } from '../lib/translations';
import { CopyIcon, CheckIcon } from './icons';

interface AgentProfileCardProps {
  agent: AgentProfile;
  language: Language;
}

const AgentProfileCard: React.FC<AgentProfileCardProps> = ({ agent, language }) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // We pass dummy data to getPrompt for agents that need it.
    const promptText = agent.getPrompt({ 
        idea: "[Sample Idea]", 
        langInstruction: "[Language Instruction]",
        frontendDoc: agent.id !== 'idea-enhancer' && agent.id !== 'frontend-doc' ? "[Frontend Document Context]" : undefined,
        backendDoc: agent.id === 'db-schema' ? "[Backend Document Context]" : undefined,
    });
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDisplayPrompt = () => {
    const args = {
        idea: "[...idea]",
        langInstruction: "[...language instruction]",
        frontendDoc: "[...frontendDoc]",
        backendDoc: "[...backendDoc]",
    };

    // Simplify the displayed prompt template for clarity
    if (agent.id === 'idea-enhancer' || agent.id === 'frontend-doc') {
        return agent.getPrompt({ idea: args.idea, langInstruction: args.langInstruction });
    }
    if (agent.id === 'css-spec' || agent.id === 'backend-doc') {
        return agent.getPrompt({ idea: args.idea, langInstruction: args.langInstruction, frontendDoc: args.frontendDoc });
    }
     if (agent.id === 'db-schema') {
        return agent.getPrompt({ idea: args.idea, langInstruction: args.langInstruction, frontendDoc: args.frontendDoc, backendDoc: args.backendDoc });
    }
    return agent.getPrompt(args);
  }

  return (
    <div id={agent.id} className="bg-secondary rounded-lg shadow-xl flex flex-col overflow-hidden border border-primary hover:border-accent transition-colors duration-300">
      <div className="p-5">
        <div className="flex items-center space-x-4 mb-3">
          <div className="flex-shrink-0 bg-primary p-3 rounded-full">
            <agent.icon className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-light">{agent.persona(t)}</h3>
            <p className="text-sm font-mono text-dark-text">{agent.name}</p>
          </div>
        </div>
        <p className="text-dark-text text-sm">
            {agent.description(t)}
        </p>
      </div>
      <div className="bg-primary p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-dark-text uppercase tracking-wider">System Prompt</h4>
            <button 
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-1 text-xs bg-secondary hover:bg-accent hover:text-primary rounded-md transition-colors"
                title={t.copyPrompt}
            >
                {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <CopyIcon className="h-4 w-4" />}
                <span>{copied ? t.promptCopied : t.copyPrompt}</span>
            </button>
        </div>
        <pre className="text-xs text-gray-400 whitespace-pre-wrap break-words font-mono bg-black/20 p-3 rounded-md overflow-x-auto flex-grow">
          <code>{getDisplayPrompt()}</code>
        </pre>
      </div>
    </div>
  );
};

export default AgentProfileCard;
