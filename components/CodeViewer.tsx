
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeViewerProps {
  code: string;
  language: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, language }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden h-full shadow-inner">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ 
          margin: 0, 
          height: '100%', 
          backgroundColor: '#1E1E1E'
        }}
        codeTagProps={{ style: { fontFamily: '"Fira Code", monospace' } }}
        showLineNumbers
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeViewer;
