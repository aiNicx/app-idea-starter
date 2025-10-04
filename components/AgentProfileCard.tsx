import React, { useState } from 'react';
import { AgentProfile } from '../lib/agentPrompts';
import { Language, translations } from '../lib/translations';
import { CopyIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, SparklesIcon } from './icons';

interface AgentProfileCardProps {
  agent: AgentProfile;
  language: Language;
}

const AgentProfileCard: React.FC<AgentProfileCardProps> = ({ agent, language }) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

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
  };

  const categorizeAgent = (agentId: string) => {
    if (agentId === 'idea-enhancer') return { category: 'Stratega', color: 'text-purple-400', bgColor: 'bg-purple-500/10' };
    if (agentId === 'doc-orchestrator') return { category: 'Orchestratore', color: 'text-blue-400', bgColor: 'bg-blue-500/10' };
    if (agentId === 'frontend-doc') return { category: 'Frontend', color: 'text-green-400', bgColor: 'bg-green-500/10' };
    if (agentId === 'css-spec') return { category: 'Design', color: 'text-pink-400', bgColor: 'bg-pink-500/10' };
    if (agentId === 'backend-doc') return { category: 'Backend', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
    if (agentId === 'db-schema') return { category: 'Database', color: 'text-red-400', bgColor: 'bg-red-500/10' };
    return { category: 'Specialista', color: 'text-gray-400', bgColor: 'bg-gray-500/10' };
  };

  const agentCategory = categorizeAgent(agent.id);
  const isInWorkflow = agent.id !== 'doc-orchestrator';

  return (
    <div id={agent.id} className="bg-secondary rounded-xl shadow-xl overflow-hidden border border-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20">
      {/* Agent Header */}
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Agent Icon */}
          <div className="flex-shrink-0 relative">
            <div className={`${agentCategory.bgColor} p-4 rounded-xl border border-accent/20`}>
              <agent.icon className={`h-8 w-8 ${agentCategory.color}`} />
            </div>
            {isInWorkflow && (
              <div className="absolute -top-1 -right-1">
                <SparklesIcon className="h-4 w-4 text-accent" />
              </div>
            )}
          </div>

          {/* Agent Info */}
          <div className="flex-grow">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${agentCategory.bgColor} ${agentCategory.color}`}>
                {agentCategory.category}
              </span>
              {isInWorkflow && (
                <span className="text-xs text-accent font-medium">
                  Attivo nel workflow
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-light mb-1">{agent.persona(t)}</h3>
            <p className="text-sm font-mono text-dark-text/70">{agent.name}</p>
          </div>
        </div>

        {/* Agent Description */}
        <p className="text-dark-text text-sm mt-4 leading-relaxed">
            {agent.description(t)}
        </p>

        {/* Expand/Collapse Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 mt-4 text-accent hover:text-accent/80 transition-colors text-sm font-medium"
        >
          <span>{showDetails ? 'Mostra meno' : 'Mostra dettagli'}</span>
          {showDetails ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Details Section */}
      {showDetails && (
        <div className="border-t border-secondary/50 bg-primary/30 p-6 animate-in slide-in-from-top-2">
          {/* Prompt Section */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-light">System Prompt</h4>
              <span className="text-xs text-dark-text/60">(Template)</span>
            </div>
            <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-1 text-xs bg-secondary hover:bg-accent hover:text-primary rounded-md transition-colors"
                title={t.copyPrompt}
            >
                {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <CopyIcon className="h-4 w-4" />}
                <span>{copied ? t.promptCopied : t.copyPrompt}</span>
            </button>
          </div>

          {/* Prompt Preview */}
          <div className="relative">
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="w-full text-left text-xs text-dark-text/70 hover:text-dark-text transition-colors"
            >
              <div className="p-3 bg-black/20 rounded-md border border-transparent hover:border-accent/30 transition-colors">
                <code className="font-mono">
                  {showPrompt ? getDisplayPrompt() : getDisplayPrompt().substring(0, 100) + '...'}
                </code>
              </div>
            </button>

            {showPrompt && (
              <div className="mt-2 text-xs text-dark-text/50 italic">
                Punteggio complessità: {getDisplayPrompt().length > 500 ? '🔴 Complesso' : getDisplayPrompt().length > 300 ? '🟡 Medio' : '🟢 Semplice'}
              </div>
            )}
          </div>

          {/* Workflow Role */}
          {isInWorkflow && (
            <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <h5 className="text-sm font-semibold text-accent mb-2">Ruolo nel Workflow</h5>
              <p className="text-xs text-dark-text leading-relaxed">
                {agent.id === 'idea-enhancer' && 'Analizza e arricchisce l\'idea iniziale dell\'utente, trasformandola in un concetto strutturato. È il primo passo del processo.'}
                {agent.id === 'frontend-doc' && 'Crea la specifica frontend dettagliata, definendo le pagine, i componenti e i flussi utente basati sull\'idea maturata.'}
                {agent.id === 'css-spec' && 'Definisce la guida stilistica completa, inclusi colori, tipografia e stile dei componenti basandosi sulla struttura frontend.'}
                {agent.id === 'backend-doc' && 'Progetta l\'architettura backend, definendo gli endpoint API e la logica server necessari per supportare il frontend.'}
                {agent.id === 'db-schema' && 'Crea lo schema database completo utilizzando la sintassi Convex, basandosi su tutte le specifiche precedenti.'}
              </p>
            </div>
          )}

          {/* Technical Details */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-semibold text-dark-text uppercase tracking-wider mb-1">Dependencies</h5>
              <div className="text-xs text-dark-text/70">
                {agent.id === 'idea-enhancer' && 'Idea utente'}
                {(agent.id === 'frontend-doc' || agent.id === 'css-spec' || agent.id === 'backend-doc') && 'Idea maturata'}
                {agent.id === 'db-schema' && 'Frontend + Backend specs'}
                {agent.id === 'doc-orchestrator' && 'Idea maturata + Sub-agenti'}
              </div>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-dark-text uppercase tracking-wider mb-1">Output</h5>
              <div className="text-xs text-dark-text/70">
                {agent.id === 'idea-enhancer' && 'Idea strutturata'}
                {agent.id === 'frontend-doc' && 'Frontend description'}
                {agent.id === 'css-spec' && 'CSS specifications'}
                {agent.id === 'backend-doc' && 'Backend architecture'}
                {agent.id === 'db-schema' && 'Database schema'}
                {agent.id === 'doc-orchestrator' && 'Coordinamento completo'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentProfileCard;
