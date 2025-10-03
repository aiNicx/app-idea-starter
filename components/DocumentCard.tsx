
import React, { useState } from 'react';
import { Document, DocumentCategory } from '../types';
import { CopyIcon, DownloadIcon, CheckIcon, CodeBracketIcon, PaintBrushIcon, ServerIcon, CircleStackIcon, DocumentTextIcon } from './icons';

// Helper to get icon based on category
const getCategoryIcon = (category: DocumentCategory) => {
  const iconProps = { className: "w-10 h-10 text-accent group-hover:text-sky-300 transition-colors" };
  switch (category) {
    case DocumentCategory.FRONTEND:
      return <CodeBracketIcon {...iconProps} />;
    case DocumentCategory.CSS:
      return <PaintBrushIcon {...iconProps} />;
    case DocumentCategory.BACKEND:
      return <ServerIcon {...iconProps} />;
    case DocumentCategory.DB_SCHEMA:
      return <CircleStackIcon {...iconProps} />;
    default:
      return <DocumentTextIcon {...iconProps} />;
  }
};


interface DocumentCardProps {
  document: Document;
  onView: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onView }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([document.content], { type: 'text/markdown;charset=utf-8;' });
    // FIX: Explicitly use `window.document` to avoid conflict with the `document` prop.
    const link = window.document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const filename = `${document.category.replace(/ /g, '_').toLowerCase()}.md`;
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    // FIX: Explicitly use `window.document` to avoid conflict with the `document` prop.
    window.document.body.appendChild(link);
    link.click();
    // FIX: Explicitly use `window.document` to avoid conflict with the `document` prop.
    window.document.body.removeChild(link);
  };

  const contentPreview = document.content.substring(0, 120).replace(/\n/g, ' ') + '...';

  return (
    <div 
      className="bg-secondary rounded-lg shadow-lg flex flex-col justify-between p-6 cursor-pointer group hover:border-accent border-2 border-transparent transition-all duration-300 transform hover:-translate-y-1"
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onView()}
      aria-label={`View document: ${document.category}`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          {getCategoryIcon(document.category)}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={handleCopy} className="p-2 rounded-md bg-primary hover:bg-accent hover:text-primary transition-colors text-light" title="Copy content">
              {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
            </button>
            <button onClick={handleDownload} className="p-2 rounded-md bg-primary hover:bg-accent hover:text-primary transition-colors text-light" title="Download .md file">
              <DownloadIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <h3 className="text-xl font-bold text-light mb-2">{document.category}</h3>
        <p className="text-sm text-dark-text leading-relaxed h-20 overflow-hidden">
          {contentPreview}
        </p>
      </div>
      <div className="text-right text-accent font-semibold mt-4 text-sm uppercase tracking-wider group-hover:underline">
        View Document
      </div>
    </div>
  );
};

export default DocumentCard;
