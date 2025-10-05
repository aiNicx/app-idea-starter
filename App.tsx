import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import SimpleMainScreen from './components/SimpleMainScreen';
import SimpleAgentHub from './components/SimpleAgentHub';
import { useConvexProjectManager } from './hooks/useConvexProjectManager';
import { useDynamicAgents } from './hooks/useDynamicAgents';
import { Project, Document, DocumentCategory } from './types';
import { Agent } from './types/agents';
import { Language, translations } from './lib/translations';
import { MenuIcon } from './components/icons';
import { LoginForm, RegisterForm, UserProfile } from './components/AuthForms';
import { useAuth } from './contexts/AuthContext';

/**
 * Determina automaticamente la categoria del documento basata sul contenuto
 */
const determineDocumentCategory = (content: string, workflowName?: string): DocumentCategory => {
  const lowerContent = content.toLowerCase();
  const lowerWorkflowName = workflowName?.toLowerCase() || '';

  // Logica per determinare categoria basata su parole chiave nel contenuto
  if (lowerContent.includes('frontend') || lowerContent.includes('ui') || lowerContent.includes('interface') ||
      lowerContent.includes('component') || lowerContent.includes('react') || lowerContent.includes('html') ||
      lowerContent.includes('css') || lowerContent.includes('javascript') || lowerContent.includes('typescript')) {
    return DocumentCategory.FRONTEND;
  }

  if (lowerContent.includes('backend') || lowerContent.includes('server') || lowerContent.includes('api') ||
      lowerContent.includes('endpoint') || lowerContent.includes('database') || lowerContent.includes('schema') ||
      lowerContent.includes('table') || lowerContent.includes('convex') || lowerContent.includes('prisma')) {
    return DocumentCategory.BACKEND;
  }

  if (lowerContent.includes('style') || lowerContent.includes('color') || lowerContent.includes('layout') ||
      lowerContent.includes('responsive') || lowerContent.includes('design') || lowerContent.includes('theme')) {
    return DocumentCategory.CSS;
  }

  // Se il workflow ha un nome che indica la categoria, usalo
  if (lowerWorkflowName.includes('frontend') || lowerWorkflowName.includes('ui')) {
    return DocumentCategory.FRONTEND;
  }

  if (lowerWorkflowName.includes('backend') || lowerWorkflowName.includes('api') || lowerWorkflowName.includes('database')) {
    return DocumentCategory.BACKEND;
  }

  if (lowerWorkflowName.includes('style') || lowerWorkflowName.includes('css') || lowerWorkflowName.includes('design')) {
    return DocumentCategory.CSS;
  }

  // Default: usa la categoria più generale
  return DocumentCategory.FRONTEND;
};

const LANGUAGE_STORAGE_KEY = 'docugenius_language';

type View = 'editor' | 'agentHub' | 'login' | 'register' | 'profile';
type SidebarView = 'editor' | 'agentHub';



const App: React.FC = () => {
  const { user, isLoading: authLoading, login, register, logout, updateUser } = useAuth();
  const { projects, loading: projectsLoading, addProject, updateProject, deleteProject, getProject, addDocumentsToProject, deleteDocument } = useConvexProjectManager(user?.id || null);
  const { agents, workflows, createAgent, createWorkflow, updateAgent, updateWorkflow, executeWorkflow } = useDynamicAgents(user?.id || null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('editor');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // CRITICAL: Usa un ref per prevenire chiamate multiple
  const isExecutingRef = useRef(false);
  

  const [language, setLanguage] = useState<Language>(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    const userLanguage = user?.language as Language;
    return userLanguage || storedLanguage || 'it';
  });
  
  const t = translations[language];

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    if (user && user.language !== language) {
      updateUser({ language });
    }
  }, [language, user, updateUser]);

  useEffect(() => {
    if (authLoading || projectsLoading) {
      return;
    }

    const activeProjectExists = activeProjectId && projects.some(p => p.id === activeProjectId);

    if (!activeProjectExists && projects.length > 0) {
      setActiveProjectId(projects[0].id);
    } else if (!activeProjectExists && projects.length === 0 && activeProjectId !== null) {
      setActiveProjectId(null);
    }
  }, [projects, activeProjectId, authLoading, projectsLoading]);

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setCurrentView('editor');
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleNewProject = async () => {
    const newId = await addProject(t.newProject);
    if (newId) {
      setActiveProjectId(newId);
      setCurrentView('editor');
      if (isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    }
  };
  
  const handleSetView = (view: View) => {
    setCurrentView(view);
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }

  const handleDeleteProject = useCallback((projectId: string) => {
    deleteProject(projectId);
  }, [deleteProject]);
  

  const activeProject = getProject(activeProjectId);

  const handleAuthSuccess = (userData: any) => {
    setShowLogin(false);
    // L'utente verrà gestito dal context
  };

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      setShowLogin(false);
    }
    return success;
  };

  const handleRegister = async (email: string, password: string, name?: string) => {
    const success = await register(email, password, name);
    if (success) {
      setShowLogin(false);
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setActiveProjectId(null);
    setCurrentView('editor');
  };

  // Funzioni per gestire agenti e workflow
  const handleCreateAgent = async (agentData: Partial<Agent>) => {
    await createAgent(agentData);
  };

  const handleCreateWorkflow = async (workflow: any) => {
    await createWorkflow(workflow);
  };

  const handleEditAgent = async (agent: Agent) => {
    await updateAgent(agent._id, {
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      modelId: agent.modelId,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      isActive: agent.isActive,
      order: agent.order
    });
  };

  const handleEditWorkflow = async (workflow: any) => {
    await updateWorkflow(workflow._id, {
      name: workflow.name,
      description: workflow.description,
      steps: workflow.steps,
      isActive: workflow.isActive
    });
  };

  const handleExecuteWorkflow = useCallback(async (workflow: any, input: string) => {
    // CRITICAL: Previeni esecuzioni multiple usando un ref
    if (isExecutingRef.current) {
      console.warn('Workflow già in esecuzione, ignoro la richiesta');
      return;
    }

    isExecutingRef.current = true;
    setIsExecuting(true);

    try {
      const { WorkflowEngine } = await import('./services/workflowEngine');

      // Cattura i valori al momento della chiamata per evitare problemi con dipendenze
      const currentAgents = agents || [];
      const currentLanguage = language;
      const currentProject = activeProject;

      // Controlli di validazione
      if (!workflow || !workflow.steps || workflow.steps.length === 0) {
        throw new Error('Workflow has no steps configured');
      }

      if (currentAgents.length === 0) {
        throw new Error('No agents available for workflow execution');
      }

      console.log('Starting workflow execution:', {
        workflowId: workflow._id,
        workflowName: workflow.name,
        stepsCount: workflow.steps.length,
        agentsCount: currentAgents.length,
        inputLength: input.length
      });

      const result = await WorkflowEngine.executeWorkflow(
        workflow,
        currentAgents,
        input,
        currentLanguage
      );

      if (result.success && currentProject) {
        // Salva SOLO gli output degli step con produceDocument=true (default true per retrocompatibilità)
        const documents = (workflow.steps || [])
          .filter((s: any) => s?.produceDocument !== false)
          .map((s: any) => {
            const order = s.order as number;
            const output = result.outputs?.[order];
            const content = (output || '').trim();
            if (!content) return null;

            const category = determineDocumentCategory(content, `${workflow.name} step ${order}`);

            // Titolo: se non fornito, usa il nome dell'agente come default
            const rawTitle = (s as any).documentTitle;
            const stepAgent = currentAgents.find(a => a._id === s.agentId);
            const fallbackTitle = stepAgent?.name ? stepAgent.name : `${workflow.name} - Step ${order + 1}`;
            const title = rawTitle && String(rawTitle).trim().length > 0 ? String(rawTitle).trim() : fallbackTitle;

            return {
              id: `doc_${Date.now()}_${order}`,
              title,
              category,
              content
            };
          })
          .filter((d): d is { id: string; title: string; category: DocumentCategory; content: string } => d !== null);

        console.log('Workflow execution result (multi-output):', {
          success: result.success,
          outputsCount: Object.keys(result.outputs || {}).length,
          documentsToSave: documents.length
        });

        if (documents.length === 0) {
          console.warn('Workflow completed but no non-empty outputs to save');
          // Non bloccare l'utente con errore
          return;
        }

        // Salva tutti i documenti prodotti dagli step (lato server evita duplicati per titolo/contenuto)
        await addDocumentsToProject(currentProject.id, documents as any);
      } else if (!result.success) {
        // Propaga l'errore per mostrarlo nell'interfaccia
        throw new Error(result.error || 'Workflow execution failed');
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      // Rilancia l'errore per farlo gestire dal componente UI
      throw error;
    } finally {
      isExecutingRef.current = false;
      setIsExecuting(false);
    }
  }, [agents, language, activeProject, updateProject, addDocumentsToProject]);

  const renderContent = () => {
    // Se non è autenticato, mostra login/register
    if (!user) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-light mb-2">{t.welcome}</h1>
              <p className="text-dark-text">Accedi al tuo account per gestire i tuoi progetti</p>
            </div>
            <div className="bg-secondary rounded-lg p-1 mb-4">
              <div className="flex">
                <button
                  onClick={() => setShowLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-l-md font-semibold transition-colors ${
                    !showLogin ? 'bg-accent text-primary' : 'bg-primary text-dark-text hover:bg-primary/80'
                  }`}
                >
                  {t.registerTitle}
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-r-md font-semibold transition-colors ${
                    showLogin ? 'bg-accent text-primary' : 'bg-primary text-dark-text hover:bg-primary/80'
                  }`}
                >
                  {t.loginTitle}
                </button>
              </div>
            </div>
              {showLogin ? (
                <LoginForm 
                  language={language} 
                  onAuthSuccess={handleAuthSuccess}
                  onLogin={handleLogin}
                />
              ) : (
                <RegisterForm 
                  language={language} 
                  onAuthSuccess={handleAuthSuccess}
                  onRegister={handleRegister}
                />
              )}
          </div>
        </div>
      );
    }

    // Se è autenticato, mostra il contenuto principale
    if (currentView === 'profile') {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <UserProfile
            user={user}
            language={language}
            onLogout={handleLogout}
            onUpdateUser={updateUser}
          />
        </div>
      );
    }


    if (currentView === 'agentHub') {
      return (
        <SimpleAgentHub
          language={language}
          agents={agents}
          workflows={workflows}
          onCreateAgent={handleCreateAgent}
          onCreateWorkflow={handleCreateWorkflow}
          onEditAgent={handleEditAgent}
          onEditWorkflow={handleEditWorkflow}
        />
      );
    }

    if (projectsLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <p>{t.loadingProjects}</p>
        </div>
      );
    }
    
    if (activeProject) {
      return (
        <SimpleMainScreen
          project={activeProject}
          workflows={workflows}
          onUpdateProject={updateProject}
          onSaveDocuments={addDocumentsToProject}
          onDeleteDocument={deleteDocument}
          onExecuteWorkflow={handleExecuteWorkflow}
          language={language}
          isExecuting={isExecuting}
        />
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-3xl font-bold text-light mb-4">{t.welcome}</h2>
        <p className="text-xl text-dark-text mb-8 max-w-2xl">
          {t.welcomeMsg}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
            <button
                onClick={handleNewProject}
                className="bg-accent text-primary font-bold py-3 px-6 rounded-lg hover:bg-sky-400 transition-colors text-lg"
            >
                {t.createFirstProject}
            </button>
        </div>
      </div>
    );
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex h-screen font-sans bg-primary flex items-center justify-center">
        <div className="text-light text-xl">{t.loadingProjects}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans bg-primary">
      {user && (
        <Sidebar
          projects={projects}
          activeProjectId={activeProjectId}
          language={language}
          currentView={currentView as SidebarView}
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          onSetMobileOpen={setIsMobileSidebarOpen}
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
          onDeleteProject={handleDeleteProject}
          onLanguageChange={setLanguage}
          onSetView={(view: SidebarView) => handleSetView(view)}
        />
      )}
      <main className="flex-1 text-light flex flex-col transition-all duration-300">
        {user && (
          <div className="lg:hidden p-2 absolute top-2 left-2 z-20">
              <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 rounded-md bg-secondary/80 text-light">
                  <MenuIcon className="h-6 w-6"/>
              </button>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
