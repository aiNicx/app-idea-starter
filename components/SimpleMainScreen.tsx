import React, { useState } from 'react';
import { Project, Document } from '../types';
import { Workflow } from '../types/agents';
import { Language, translations } from '../lib/translations';
import SimpleWorkflowExecutor from './SimpleWorkflowExecutor';
import DocumentCard from './DocumentCard';

interface SimpleMainScreenProps {
  language: Language;
  project: Project;
  workflows: Workflow[];
  onUpdateProject: (project: Project) => void;
  onExecuteWorkflow: (workflow: Workflow, input: string) => Promise<void>;
  onSaveDocuments?: (projectId: string, documents: Document[]) => Promise<void>;
  isExecuting?: boolean;
}

const SimpleMainScreen: React.FC<SimpleMainScreenProps> = ({
  language,
  project,
  workflows,
  onUpdateProject,
  onExecuteWorkflow,
  onSaveDocuments,
  isExecuting = false
}) => {
  const t = translations[language];
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [isSaving, setIsSaving] = useState(false);

  const handleProjectUpdate = (updates: Partial<Project>) => {
    const updatedProject = { ...currentProject, ...updates };
    setCurrentProject(updatedProject);
    onUpdateProject(updatedProject);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      onUpdateProject(currentProject);
      
      if (onSaveDocuments && currentProject.documents && currentProject.documents.length > 0) {
        await onSaveDocuments(currentProject.id, currentProject.documents);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setTimeout(() => setIsSaving(false), 1500);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
          <input
            type="text"
            value={currentProject.name}
            onChange={(e) => handleProjectUpdate({ name: e.target.value })}
            className="text-3xl md:text-4xl font-bold bg-transparent border-b-2 border-transparent focus:border-blue-500 focus:outline-none text-white transition-colors"
            placeholder={t.projectNamePlaceholder}
          />
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${
              isSaving 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.saved}
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {t.saveChanges}
              </>
            )}
          </button>
        </div>

        {/* Workflow Executor */}
        <div className="mb-8">
          <SimpleWorkflowExecutor
            language={language}
            workflows={workflows}
            onExecuteWorkflow={onExecuteWorkflow}
            isExecuting={isExecuting}
          />
        </div>

        {/* Results Section */}
        {currentProject.documents && currentProject.documents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-white">
              {t.generatedDocsTitle || 'Generated Documents'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProject.documents.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={() => {
                    // TODO: Implement document view functionality
                    console.log('View document:', doc.id);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!currentProject.documents || currentProject.documents.length === 0) && !isExecuting && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t.noResultsYet || 'No Results Yet'}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {t.noResultsDescription || 'Execute a workflow above to generate documents and see results here.'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isExecuting && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t.processing || 'Processing...'}
            </h3>
            <p className="text-gray-400">
              {t.processingDescription || 'Your workflow is running. This may take a few moments.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleMainScreen;

