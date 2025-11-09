
import React from 'react';
import type { Step } from '../types';
import CodeViewer from './CodeViewer';

interface NodeDetailPanelProps {
  node: Step | null;
  onClose: () => void;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
  return (
    <div
      className={`
        w-full md:w-1/3 lg:w-1/4 xl:w-96
        bg-gray-800 border-l border-gray-700
        transition-transform transform
        flex flex-col
        ${node ? 'translate-x-0' : 'translate-x-full absolute right-0 md:relative'}
      `}
      style={{transition: 'transform 0.3s ease-in-out'}}
    >
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Node Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close details panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {node ? (
        <div className="p-4 overflow-y-auto flex-grow">
          <DetailItem label="ID" value={node.id} />
          <DetailItem label="Type" value={node.type} />
          <DetailItem label="Inputs">
            {node.inputs.length > 0 ? (
              <ul className="list-disc list-inside bg-gray-700/50 p-2 rounded">
                {node.inputs.map(input => <li key={input} className="font-mono text-sm text-blue-300">{input}</li>)}
              </ul>
            ) : (
              <span className="text-gray-500 italic">None</span>
            )}
          </DetailItem>
          
          <div className="mt-4">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Parameters</h3>
             <div className="h-96">
                <CodeViewer code={JSON.stringify(node.params, null, 2)} language="json" />
             </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 flex-grow flex items-center justify-center">
          <p>Select a node to see its details.</p>
        </div>
      )}
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => (
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{label}</h3>
    {value && <p className="text-white font-mono bg-gray-700/50 p-2 rounded mt-1">{value}</p>}
    {children && <div className="mt-1">{children}</div>}
  </div>
);

export default NodeDetailPanel;
