
import React, { useState, useMemo } from 'react';
import CodeViewer from './components/CodeViewer';
import PipelineVisualizer from './components/PipelineVisualizer';
import { 
  JSON_SCHEMA_STRING,
  EXAMPLE_PIPELINE_JSON_STRING,
  PROTOCOL_DEFINITION_MD_STRING
} from './constants';
import { SparkIcon } from './components/icons';
import type { Step } from './types';

type View = 'visualizer' | 'protocol' | 'schema';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('visualizer');

  const examplePipeline = useMemo(() => {
    try {
      const parsed = JSON.parse(EXAMPLE_PIPELINE_JSON_STRING);
      return parsed.steps as Step[];
    } catch (error) {
      console.error("Failed to parse example pipeline JSON:", error);
      return [];
    }
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'visualizer':
        return <PipelineVisualizer pipelineSteps={examplePipeline} />;
      case 'protocol':
        return <CodeViewer code={PROTOCOL_DEFINITION_MD_STRING} language="markdown" />;
      case 'schema':
        return <CodeViewer code={JSON_SCHEMA_STRING} language="json" />;
      default:
        return null;
    }
  };

  const NavButton: React.FC<{ view: View; label: string }> = ({ view, label }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        activeView === view
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SparkIcon className="h-8 w-8 text-blue-400" />
          <h1 className="text-xl font-bold text-white tracking-wider">Spark Pipeline Protocol Visualizer</h1>
        </div>
        <nav className="flex items-center gap-2">
          <NavButton view="visualizer" label="Example Pipeline Visualizer" />
          <NavButton view="protocol" label="Protocol Definition" />
          <NavButton view="schema" label="JSON Schema" />
        </nav>
      </header>
      <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
