
import React, { useState } from 'react';
import { Language, translations } from '../lib/translations';
import { agentProfiles } from '../lib/agentPrompts';
import {
    DocumentTextIcon,
    SparklesIcon,
    CogIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from './icons';

interface WorkflowDiagramProps {
    language: Language;
}

const WorkflowPhase: React.FC<{
    title: string;
    description: string;
    children: React.ReactNode;
    phaseNumber: number;
    isActive?: boolean;
}> = ({ title, description, children, phaseNumber, isActive = false }) => (
    <div className={`relative ${isActive ? 'xl:scale-105' : ''} transition-all duration-300`}>
        {/* Phase Badge */}
        <div className="absolute -top-3 -left-3 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                isActive ? 'bg-accent' : 'bg-secondary'
            }`}>
                {phaseNumber}
            </div>
        </div>

        <div className={`border-2 ${isActive ? 'border-accent shadow-lg shadow-accent/20' : 'border-secondary/50'} rounded-xl p-6 bg-secondary/30 backdrop-blur-sm`}>
            <h3 className="text-xl font-bold text-light mb-2">{title}</h3>
            <p className="text-sm text-dark-text mb-4">{description}</p>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    </div>
);

const WorkflowStep: React.FC<{
    title: string;
    description: string;
    agentId?: string;
    language: Language;
    isOutput?: boolean;
}> = ({ title, description, agentId, language, isOutput = false }) => {
    const agent = agentId ? agentProfiles.find(p => p.id === agentId) : null;
    const AgentIcon = agent?.icon || DocumentTextIcon;

    return (
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${
            isOutput ? 'bg-primary/50 border border-accent/30' : 'bg-primary/30'
        }`}>
            <div className={`p-2 rounded-lg ${isOutput ? 'bg-accent/20' : agentId ? 'bg-secondary/50' : 'bg-secondary/30'}`}>
                <AgentIcon className={`w-5 h-5 ${isOutput ? 'text-accent' : agentId ? 'text-accent' : 'text-dark-text'}`} />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-light text-sm">{title}</p>
                <p className="text-xs text-dark-text">{description}</p>
            </div>
            {agent && (
                <div className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
                    {agent.persona(translations[language])}
                </div>
            )}
        </div>
    );
};

const ExpandableSection: React.FC<{
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}> = ({ title, children, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="mt-4 border border-secondary/30 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-3 bg-secondary/20 hover:bg-secondary/30 transition-colors flex items-center justify-between text-left"
            >
                <span className="font-semibold text-light text-sm">{title}</span>
                {isExpanded ? (
                    <ChevronUpIcon className="w-4 h-4 text-dark-text" />
                ) : (
                    <ChevronDownIcon className="w-4 h-4 text-dark-text" />
                )}
            </button>
            {isExpanded && (
                <div className="p-3 space-y-2 animate-in slide-in-from-top-2">
                    {children}
                </div>
            )}
        </div>
    );
};

const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ language }) => {
    const t = translations[language];

    return (
        <div className="w-full">
            {/* Header Overview */}
            <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-4 sm:p-6 border border-accent/20">
                <div className="flex items-center space-x-3 mb-3">
                    <SparklesIcon className="w-6 h-6 text-accent" />
                    <h3 className="text-lg font-bold text-light">Come Funziona</h3>
                </div>
                <p className="text-dark-text leading-relaxed">
                    Il nostro sistema di agenti AI trasforma la tua idea grezza in documentazione tecnica completa.
                    Ogni agente è specializzato in un compito specifico e lavora in sinergia con gli altri per produrre risultati di alta qualità.
                </p>
            </div>
        </div>
    );
};

export default WorkflowDiagram;
