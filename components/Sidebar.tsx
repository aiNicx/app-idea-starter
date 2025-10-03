
import React from 'react';
import { Project } from '../types';
import { PlusIcon, TrashIcon, ItalyFlagIcon, UKFlagIcon, BrainCircuitIcon, ChevronLeftIcon } from './icons';
import { Language, translations } from '../lib/translations';

interface LanguageSwitcherProps {
  language: Language;
  isCollapsed: boolean;
  onLanguageChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, isCollapsed, onLanguageChange }) => (
  <div className={`flex items-center space-x-2 transition-all ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
    <button
      onClick={() => onLanguageChange('it')}
      className={`p-1 rounded-full transition-all ${language === 'it' ? 'ring-2 ring-accent' : 'opacity-50 hover:opacity-100'}`}
      aria-label="Switch to Italian"
    >
      <ItalyFlagIcon />
    </button>
    <button
      onClick={() => onLanguageChange('en')}
      className={`p-1 rounded-full transition-all ${language === 'en' ? 'ring-2 ring-accent' : 'opacity-50 hover:opacity-100'}`}
      aria-label="Switch to English"
    >
      <UKFlagIcon />
    </button>
  </div>
);

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  language: Language;
  currentView: 'editor' | 'agentHub';
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onLanguageChange: (lang: Language) => void;
  onSetView: (view: 'editor' | 'agentHub') => void;
  onToggleCollapse: () => void;
  onSetMobileOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  projects, activeProjectId, language, currentView, isCollapsed, isMobileOpen,
  onSelectProject, onNewProject, onDeleteProject, onLanguageChange, onSetView,
  onToggleCollapse, onSetMobileOpen
}) => {
  const t = translations[language];

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm(t.deleteConfirmation)) {
      onDeleteProject(projectId);
    }
  };

  const sidebarContent = (
    <>
      {/* HEADER */}
      <div className={`p-4 border-b border-secondary flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-baseline space-x-2 ${isCollapsed ? 'hidden' : ''}`}>
             <h1 className="text-2xl font-bold text-light">
                <span>Docu</span><span className="text-accent">G</span><span>enius</span>
              </h1>
        </div>
         <div className={`${isCollapsed ? '' : 'hidden'}`}>
             <h1 className="text-2xl font-bold text-accent">G</h1>
         </div>

        <button 
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-dark-text hover:bg-secondary/50 transition-colors hidden lg:block"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
         >
            <ChevronLeftIcon className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* NEW PROJECT & LANGUAGE */}
      <div className="p-4 space-y-4">
        <LanguageSwitcher language={language} isCollapsed={isCollapsed} onLanguageChange={onLanguageChange} />
        <button
          onClick={onNewProject}
          className={`w-full flex items-center justify-center bg-accent text-primary font-bold py-2 rounded-lg hover:bg-sky-400 transition-all ${isCollapsed ? 'px-2' : 'px-4'}`}
        >
          <PlusIcon />
          {!isCollapsed && <span className="ml-2">{t.newProject}</span>}
        </button>
      </div>
      
      {/* PROJECT LIST */}
      <nav className="flex-1 overflow-y-auto px-4">
        <ul>
          {projects.map(project => (
            <li key={project.id} className="mb-2">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onSelectProject(project.id); }}
                className={`group flex justify-between items-center p-3 rounded-lg text-sm transition-colors ${activeProjectId === project.id && currentView === 'editor' ? 'bg-secondary text-light' : 'text-dark-text hover:bg-secondary/50'}`}
              >
                <div className={`flex-1 overflow-hidden ${isCollapsed ? 'text-center' : ''}`}>
                    <p className="font-semibold truncate">{project.name}</p>
                    {!isCollapsed && (
                      <p className="text-xs text-gray-400">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                </div>
                {!isCollapsed && (
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete project"
                  >
                    <TrashIcon />
                  </button>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* FOOTER - AGENT HUB */}
      <div className="p-4 border-t border-secondary">
        <button
          onClick={() => onSetView('agentHub')}
          className={`w-full flex items-center p-2 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''} ${currentView === 'agentHub' ? 'bg-secondary text-accent' : 'text-dark-text hover:bg-secondary/50'}`}
          title={t.meetTheAgents}
          aria-label={t.meetTheAgents}
        >
          <BrainCircuitIcon className="h-6 w-6" />
          {!isCollapsed && <span className="ml-2">{t.meetTheAgents}</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => onSetMobileOpen(false)}
      ></div>
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-40 bg-primary border-r border-secondary flex flex-col h-screen transition-all duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-24' : 'w-72'}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
