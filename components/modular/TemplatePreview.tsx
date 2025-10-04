import React, { useState, useEffect } from 'react';
import { Language, translations } from '../../lib/translations';
import { TemplateEngine } from '../../lib/templateEngine';

interface TemplatePreviewProps {
  template: string;
  language: Language;
  className?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  language,
  className = ''
}) => {
  const t = translations[language];
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample data for preview
  const sampleData = {
    idea: 'App per gestire task personali',
    frontendDoc: 'React Native con TypeScript',
    backendDoc: 'Node.js con Express e MongoDB',
    langInstruction: 'Rispondi in italiano',
    userName: 'Mario Rossi',
    projectName: 'Task Manager App',
    currentDate: new Date().toLocaleDateString('it-IT'),
    currentTime: new Date().toLocaleTimeString('it-IT')
  };

  useEffect(() => {
    if (!template.trim()) {
      setPreview('');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = TemplateEngine.renderTemplate(template, sampleData);
      setPreview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel rendering del template');
      setPreview('');
    } finally {
      setIsLoading(false);
    }
  }, [template]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          {t.livePreview || 'Live Preview'}
        </h4>
        <div className="text-xs text-gray-500">
          {t.sampleData || 'Sample data'}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-600">{error}</span>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="border border-gray-200 rounded-md">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
            {t.renderedOutput || 'Rendered Output'}
          </div>
          <div className="p-3">
            {preview ? (
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {preview}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">
                {t.noPreviewAvailable || 'No preview available'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sample Data Display */}
      <div className="text-xs text-gray-500">
        <div className="font-medium mb-1">{t.sampleDataUsed || 'Sample data used:'}</div>
        <div className="space-y-1">
          {Object.entries(sampleData).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-mono text-gray-400 w-20">{`{{${key}}}`}</span>
              <span className="text-gray-600">: {value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
