import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ProjectEditor from './components/ProjectEditor';
import AgentHub from './components/AgentHub';
import { useConvexProjectManager } from './hooks/useConvexProjectManager';
import { Project, DocumentCategory } from './types';
import { Language, translations } from './lib/translations';
import { MenuIcon } from './components/icons';
import { LoginForm, RegisterForm, UserProfile } from './components/AuthForms';
import { useAuth } from './contexts/AuthContext';

const LANGUAGE_STORAGE_KEY = 'docugenius_language';

type View = 'editor' | 'agentHub' | 'login' | 'register' | 'profile';

// --- START: DESIGN PREVIEW ---
// Dati fittizi per l'anteprima del design. Facilmente rimovibile.
const createPreviewProject = (language: Language): Project => {
    const t = translations[language];
    return {
        id: 'project_design_preview',
        name: t.designPreviewProjectName,
        idea: 'This is a sample project idea to demonstrate the document layout and design. It showcases how different generated documents will be presented to the user.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: [
            {
                id: 'doc_preview_1',
                category: DocumentCategory.FRONTEND,
                content: `# Frontend Description: Fictional Social App\n\n## 1. General Overview\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum et quam eget magna finibus vehicula. Integer in magna in elit tincidunt pulvinar.\n\n## 2. Pages & Content\n- **Home/Feed:** Displays a stream of posts from followed users.\n- **Profile:** Shows user details, their posts, and follower counts.\n- **Settings:** Allows users to change their password and notification preferences.\n\n## 3. Core User Flows\n- **User Login:** User enters credentials, is authenticated, and redirected to the Home/Feed.\n- **Creating a Post:** User clicks 'New Post', types a message, and submits it to their feed.`
            },
            {
                id: 'doc_preview_2',
                category: DocumentCategory.CSS,
                content: `# CSS Specifics: Style Guide\n\n## 1. Color Palette\n- **Primary:** #1e293b\n- **Secondary:** #334155\n- **Accent:** #38bdf8\n\n## 2. Typography\n- **Headings:** 'Inter', sans-serif (700)\n- **Body:** 'Inter', sans-serif (400)\n\n## 3. UI Elements\n- **Buttons:** Rounded corners, solid accent color for primary actions.\n- **Cards:** Slight shadow, rounded corners, subtle border.`
            },
            {
                id: 'doc_preview_3',
                category: DocumentCategory.BACKEND,
                content: `# Backend Architecture\n\n## 1. Core Logic\nPhasellus vitae leo eget sem maximus gravida. Ut in metus vel nulla venenatis vestibulum.\n\n## 2. Key API Endpoints\n- \`GET /api/posts\`: Fetches the main feed.\n- \`POST /api/posts\`: Creates a new post.\n- \`GET /api/users/:id\`: Retrieves a user profile.\n\n## 3. External Services\n- **Authentication:** Clerk or Auth0\n- **Email:** SendGrid`
            },
            {
                id: 'doc_preview_4',
                category: DocumentCategory.DB_SCHEMA,
                content: `# DB Schema (Convex)\n\nDonec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.\n\n\`\`\`typescript\nimport { defineSchema, defineTable } from "convex/server";\nimport { v } from "convex/values";\n\nexport default defineSchema({\n  users: defineTable({\n    name: v.string(),\n    email: v.string(),\n  }).index("by_email", ["email"]),\n\n  posts: defineTable({\n    authorId: v.id("users"),\n    content: v.string(),\n  }).index("by_author", ["authorId"]),\n});\n\`\`\``
            },
        ],
    };
};
// --- END: DESIGN PREVIEW ---


const App: React.FC = () => {
  const { user, isLoading: authLoading, login, register, logout, updateUser } = useAuth();
  const { projects, loading: projectsLoading, addProject, updateProject, deleteProject, getProject, addDocumentsToProject } = useConvexProjectManager(user?.id || null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('editor');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  // --- START: DESIGN PREVIEW ---
  // Stato per gestire la modalità di anteprima del design.
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  // --- END: DESIGN PREVIEW ---

  const [language, setLanguage] = useState<Language>(() => {
    return user?.language || (localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language) || 'it';
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
    
    // --- START: DESIGN PREVIEW ---
    // Non modificare l'active project se siamo in modalità anteprima
    if (previewProject) return;
    // --- END: DESIGN PREVIEW ---

    const activeProjectExists = activeProjectId && projects.some(p => p.id === activeProjectId);

    if (!activeProjectExists) {
      if (projects.length > 0) {
        setActiveProjectId(projects[0].id);
      } else if (activeProjectId !== null) {
        setActiveProjectId(null);
      }
    }
  }, [projects, activeProjectId, authLoading, projectsLoading, previewProject]);

  const handleSelectProject = (id: string) => {
    // --- START: DESIGN PREVIEW ---
    setPreviewProject(null); // Esce dalla modalità anteprima
    // --- END: DESIGN PREVIEW ---
    setActiveProjectId(id);
    setCurrentView('editor');
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleNewProject = () => {
    // --- START: DESIGN PREVIEW ---
    setPreviewProject(null); // Esce dalla modalità anteprima
    // --- END: DESIGN PREVIEW ---
    const newId = addProject(t.newProject);
    setActiveProjectId(newId);
    setCurrentView('editor');
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };
  
  const handleSetView = (view: View) => {
    // --- START: DESIGN PREVIEW ---
    setPreviewProject(null); // Esce dalla modalità anteprima
    // --- END: DESIGN PREVIEW ---
    setCurrentView(view);
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }

  const handleDeleteProject = useCallback((projectId: string) => {
    deleteProject(projectId);
  }, [deleteProject]);
  
  // --- START: DESIGN PREVIEW ---
  // Funzione per attivare la modalità di anteprima.
  const handleShowPreview = () => {
    setPreviewProject(createPreviewProject(language));
    setActiveProjectId(null); // Deseleziona i progetti reali
    setCurrentView('editor');
  };
  // --- END: DESIGN PREVIEW ---

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

    // --- START: DESIGN PREVIEW ---
    // Se la modalità anteprima è attiva, renderizza l'editor con il progetto fittizio.
    if (previewProject) {
        return (
            <ProjectEditor 
                project={previewProject} 
                onUpdateProject={() => { /* No-op in preview mode */ }}
                language={language} 
            />
        );
    }
    // --- END: DESIGN PREVIEW ---

    if (currentView === 'agentHub') {
      return <AgentHub language={language} />;
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
        <ProjectEditor 
          project={activeProject} 
          onUpdateProject={updateProject}
          onSaveDocuments={addDocumentsToProject}
          language={language} 
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
            {/* --- START: DESIGN PREVIEW --- */}
            {/* Pulsante per attivare la modalità anteprima. */}
            <button
                onClick={handleShowPreview}
                className="bg-secondary text-light font-semibold py-3 px-6 rounded-lg hover:bg-secondary/70 border border-secondary transition-colors text-lg"
            >
                {t.designPreview}
            </button>
            {/* --- END: DESIGN PREVIEW --- */}
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
          currentView={currentView}
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          onSetMobileOpen={setIsMobileSidebarOpen}
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
          onDeleteProject={handleDeleteProject}
          onLanguageChange={setLanguage}
          onSetView={handleSetView}
          user={user}
          onProfileClick={() => setCurrentView('profile')}
          onLogout={handleLogout}
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
