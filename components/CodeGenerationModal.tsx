import React, { useState, useEffect } from 'react';
import CodeViewer from './CodeViewer';
import { CopyIcon, CheckIcon } from './icons';

interface CodeGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  code: string | null;
  error: string | null;
}

const CodeGenerationModal: React.FC<CodeGenerationModalProps> = ({
  isOpen, onClose, isLoading, code, error
}) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsCopied(false);
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="codegen-title">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-gray-700">
        <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
          <h2 id="codegen-title" className="text-xl font-bold text-white">Generated Spark Scala Code</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="flex-grow bg-gray-900 rounded-b-lg overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-gray-900/80">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-300 text-lg">Generating code, please wait...</p>
            </div>
          )}
          {error && <div className="p-4 text-red-400 whitespace-pre-wrap font-mono">{error}</div>}
          {code && (
            <div className="h-full">
                <CodeViewer code={code} language="scala" />
            </div>
          )}
        </main>
        <footer className="p-4 flex justify-end gap-4 flex-shrink-0 bg-gray-800 rounded-b-lg">
          <button 
            onClick={handleCopy} 
            disabled={!code || isLoading} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200 hover:bg-blue-500"
          >
            {isCopied ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
            {isCopied ? 'Copied!' : 'Copy Code'}
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">Close</button>
        </footer>
      </div>
    </div>
  );
};

export default CodeGenerationModal;