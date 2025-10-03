
import React, { useState, useEffect } from 'react';
import { Project, Document } from '../types';
import { ideaEnhancerAgent, documentationGeneratorAgent, OPENROUTER_MODELS, OpenRouterModelId } from '../services/openRouterService';
import { WandIcon, DocumentTextIcon, SaveIcon, XMarkIcon, CopyIcon, DownloadIcon, CheckIcon } from './icons';
import Spinner from './Spinner';
import DocumentCard from './DocumentCard';
import { Language, translations } from '../lib/translations';

interface ProjectEditorProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onSaveDocuments?: (projectId: string, documents: Document[]) => Promise<void>;
  language: Language;
}

// --- Document Viewer Modal ---
const DocumentModal: React.FC<{document: Document, onClose: () => void}> = ({ document, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(document.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([document.content], { type: 'text/markdown;charset=utf-8;' });
        const link = window.document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const filename = `${document.category.replace(/ /g, '_').toLowerCase()}.md`;
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
    };
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-title"
        >
            <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
            <div 
                className="bg-secondary rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden border border-secondary" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 bg-secondary/80 border-b border-primary flex-shrink-0">
                    <h3 id="document-title" className="text-xl font-bold text-accent">{document.category}</h3>
                    <div className="flex items-center space-x-2">
                         <button onClick={handleCopy} className="p-2 rounded-md bg-primary hover:bg-accent hover:text-primary transition-colors text-light" title="Copy">
                            {copied ? <CheckIcon /> : <CopyIcon />}
                         </button>
                         <button onClick={handleDownload} className="p-2 rounded-md bg-primary hover:bg-accent hover:text-primary transition-colors text-light" title="Download .md">
                            <DownloadIcon />
                         </button>
                         <button onClick={onClose} className="p-2 rounded-md bg-primary hover:bg-red-500 hover:text-white transition-colors text-light" title="Close (Esc)">
                            <XMarkIcon className="h-5 w-5"/>
                         </button>
                    </div>
                </header>
                <div className="p-6 overflow-auto flex-grow">
                  <pre className="text-sm text-dark-text whitespace-pre-wrap break-words">
                      <code>{document.content}</code>
                  </pre>
                </div>
            </div>
        </div>
    );
};


const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onUpdateProject, onSaveDocuments, language }) => {
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDocForModal, setSelectedDocForModal] = useState<Document | null>(null);
  const [selectedModel, setSelectedModel] = useState<OpenRouterModelId>('x-ai/grok-4-fast:free');

  const t = translations[language];

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);
  
  const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentProject({ ...currentProject, idea: e.target.value });
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentProject({ ...currentProject, name: e.target.value });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Salva il progetto
      onUpdateProject(currentProject);
      
      // Salva i documenti se ci sono e se la funzione è fornita
      if (onSaveDocuments && currentProject.documents && currentProject.documents.length > 0) {
        await onSaveDocuments(currentProject.id, currentProject.documents);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Errore durante il salvataggio. Riprova.');
    } finally {
      setTimeout(() => setIsSaving(false), 1500);
    }
  };

  const handleMatureIdea = async () => {
    if (!currentProject.idea) return;
    setIsLoading(true);
    setLoadingMessage(t.maturingIdea);
    try {
      const enhancedIdea = await ideaEnhancerAgent(currentProject.idea, language, selectedModel);
      setCurrentProject({ ...currentProject, idea: enhancedIdea });
    } catch (error) {
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProduceDocs = async () => {
    if (!currentProject.idea) return;
    setIsLoading(true);
    setLoadingMessage(t.generatingDocs);
    try {
      const newDocuments = await documentationGeneratorAgent(currentProject.idea, language, selectedModel);
      setCurrentProject(prev => ({ ...prev, documents: newDocuments }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <input
            type="text"
            value={currentProject.name}
            onChange={handleNameChange}
            className="w-full sm:w-auto text-3xl md:text-4xl font-bold bg-transparent border-b-2 border-transparent focus:border-accent focus:outline-none text-light transition-colors"
            placeholder={t.projectNamePlaceholder}
          />
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as OpenRouterModelId)}
              className="px-3 py-2 bg-secondary text-light border border-primary rounded-lg focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              disabled={isLoading}
            >
              {Object.entries(OPENROUTER_MODELS).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className={`flex-shrink-0 flex items-center px-4 py-2 rounded-lg font-semibold transition-colors justify-center ${isSaving ? 'bg-green-600 text-white' : 'bg-secondary hover:bg-accent hover:text-primary text-light'}`}
            >
              {isSaving ? t.saved : <><SaveIcon /> {t.saveChanges}</>}
            </button>
          </div>
        </div>

        <div className="bg-secondary p-4 sm:p-6 rounded-lg shadow-xl">
          <label htmlFor="idea" className="block text-lg font-semibold mb-2 text-dark-text">{t.ideaLabel}</label>
          <textarea
            id="idea"
            value={currentProject.idea}
            onChange={handleIdeaChange}
            placeholder={t.ideaPlaceholder}
            className="w-full h-48 p-4 bg-primary text-light rounded-md border border-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
            rows={8}
          />
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
             <div className="flex-1 w-full sm:w-auto">
              {isLoading && <Spinner message={loadingMessage} />}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <button 
                onClick={handleMatureIdea}
                disabled={isLoading || !currentProject.idea}
                className="flex items-center justify-center w-full px-6 py-3 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                <WandIcon /> {t.matureIdeaBtn}
              </button>
              <button 
                onClick={handleProduceDocs}
                disabled={isLoading || !currentProject.idea}
                className="flex items-center justify-center w-full px-6 py-3 bg-accent text-primary font-bold rounded-lg hover:bg-sky-400 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                <DocumentTextIcon /> {t.produceDocsBtn}
              </button>
            </div>
          </div>
        </div>
        
        {currentProject.documents.length > 0 && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold mb-6 text-light">{t.generatedDocsTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentProject.documents.map(doc => (
                <DocumentCard 
                  key={doc.id} 
                  document={doc} 
                  onView={() => setSelectedDocForModal(doc)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {selectedDocForModal && (
        <DocumentModal 
            document={selectedDocForModal} 
            onClose={() => setSelectedDocForModal(null)}
        />
      )}
    </div>
  );
};

export default ProjectEditor;
