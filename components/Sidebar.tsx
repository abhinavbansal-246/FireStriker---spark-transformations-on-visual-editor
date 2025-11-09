import React from 'react';
import { StepType } from '../types';
import { ReadIcon, TransformIcon, AggregateIcon, JoinIcon, SQLIcon, WriteIcon, CodeIcon } from './icons';

// FIX: Changed JSX.Element to React.ReactElement to resolve JSX namespace error.
const typeStyles: { [key in StepType]: { bgColor: string; borderColor: string; icon: React.ReactElement } } = {
  [StepType.Read]: {
    bgColor: 'bg-green-800/50 hover:bg-green-800',
    borderColor: 'border-green-400',
    icon: <ReadIcon className="h-6 w-6 text-green-300" />,
  },
  [StepType.Transform]: {
    bgColor: 'bg-blue-800/50 hover:bg-blue-800',
    borderColor: 'border-blue-400',
    icon: <TransformIcon className="h-6 w-6 text-blue-300" />,
  },
  [StepType.Aggregate]: {
    bgColor: 'bg-purple-800/50 hover:bg-purple-800',
    borderColor: 'border-purple-400',
    icon: <AggregateIcon className="h-6 w-6 text-purple-300" />,
  },
  [StepType.Join]: {
    bgColor: 'bg-yellow-800/50 hover:bg-yellow-800',
    borderColor: 'border-yellow-400',
    icon: <JoinIcon className="h-6 w-6 text-yellow-300" />,
  },
  [StepType.SQL]: {
    bgColor: 'bg-indigo-800/50 hover:bg-indigo-800',
    borderColor: 'border-indigo-400',
    icon: <SQLIcon className="h-6 w-6 text-indigo-300" />,
  },
  [StepType.Write]: {
    bgColor: 'bg-red-800/50 hover:bg-red-800',
    borderColor: 'border-red-400',
    icon: <WriteIcon className="h-6 w-6 text-red-300" />,
  },
};

interface SidebarProps {
    onGenerateCode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onGenerateCode }) => {
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: StepType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-gray-900/50 border-r border-gray-700 p-4 flex-shrink-0" aria-label="Pipeline Steps Toolbox">
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Toolbox</h3>
                <div className="space-y-3">
                    {Object.values(StepType).map((type) => {
                        const styles = typeStyles[type];
                        return (
                            <div
                                key={type}
                                className={`p-3 rounded-lg border-2 border-gray-600 cursor-grab transition-all duration-200 flex items-center gap-3 ${styles.bgColor} hover:border-white/20 hover:shadow-lg`}
                                onDragStart={(event) => onDragStart(event, type)}
                                draggable
                                role="button"
                                aria-label={`Drag to add ${type} step`}
                            >
                                <div className="flex-shrink-0">{styles.icon}</div>
                                <div className="text-white font-semibold">{type}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                 <div
                    onClick={onGenerateCode}
                    className="p-3 rounded-lg border-2 border-gray-600 cursor-pointer transition-all duration-200 flex items-center gap-3 bg-indigo-800/50 hover:bg-indigo-800 hover:border-white/20 hover:shadow-lg"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onGenerateCode()}
                    aria-label="Generate Spark Scala code from pipeline"
                >
                    <div className="flex-shrink-0"><CodeIcon className="h-6 w-6 text-indigo-300" /></div>
                    <div className="text-white font-semibold">Generate Code</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;