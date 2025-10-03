
import React from 'react';
import { Language, translations } from '../lib/translations';
import { agentProfiles } from '../lib/agentPrompts';

interface WorkflowDiagramProps {
    language: Language;
}

const FlowArrow: React.FC = () => (
    <div className="flex items-center justify-center lg:mx-4 my-4 lg:my-0">
        <svg className="w-8 h-8 text-accent lg:rotate-0 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
    </div>
);

const Card: React.FC<{ title: string, subtitle?: string, isAgent?: boolean }> = ({ title, subtitle, isAgent = false }) => (
    <div className={`p-4 rounded-lg shadow-lg text-center w-full max-w-xs ${isAgent ? 'bg-secondary border-2 border-accent' : 'bg-secondary/50'}`}>
        <h3 className={`font-bold ${isAgent ? 'text-accent' : 'text-light'}`}>{title}</h3>
        {subtitle && <p className="text-sm text-dark-text">{subtitle}</p>}
    </div>
);

const SubAgentCard: React.FC<{ agentId: string, language: Language }> = ({ agentId, language }) => {
    const agent = agentProfiles.find(p => p.id === agentId);
    const t = translations[language];
    if (!agent) return null;
    
    return (
        <div className="flex items-center w-full">
            <div className="w-2 h-full bg-secondary mr-4 rounded-l-lg"></div>
            <div className="flex-1 p-3 bg-secondary rounded-lg text-left my-1 shadow-md">
                <p className="font-semibold text-light">{agent.name}</p>
                <p className="text-xs text-dark-text">{agent.persona(t)}</p>
            </div>
        </div>
    );
};


const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ language }) => {
    const t = translations[language];
    
    return (
        <div className="flex flex-col lg:flex-row items-center justify-center lg:flex-wrap p-4 bg-primary rounded-xl">
            {/* Input */}
            <Card title={t.userIdea} />
            <FlowArrow />
            
            {/* Phase 1: Idea Enhancement */}
            <Card title="ideaEnhancerAgent" subtitle={t.productManager} isAgent />
            <FlowArrow />
            
            {/* Intermediate Output */}
            <Card title={t.maturedIdea} />
            <FlowArrow />
            
            {/* Phase 2: Orchestration */}
            <div className="flex flex-col items-center">
                <Card title="documentationGeneratorAgent" subtitle={t.orchestrator} isAgent />
                <div className="w-px h-6 bg-accent my-2"></div>
                <div className="w-40 h-px bg-accent"></div>
                <div className="w-px h-6 bg-accent my-2"></div>
                
                {/* Sub-Agents Branch */}
                <div className="p-4 bg-secondary/50 rounded-lg w-72">
                    <div className="space-y-2">
                        <SubAgentCard agentId="frontend-doc" language={language} />
                        <SubAgentCard agentId="css-spec" language={language} />
                        <SubAgentCard agentId="backend-doc" language={language} />
                        <SubAgentCard agentId="db-schema" language={language} />
                    </div>
                </div>
            </div>
            
            <FlowArrow />
            
            {/* Final Output */}
            <Card title={t.generatedDocs} />
        </div>
    );
};

export default WorkflowDiagram;
