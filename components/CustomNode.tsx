import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { Step, StepType } from '../types';
import { ReadIcon, TransformIcon, AggregateIcon, JoinIcon, SQLIcon, WriteIcon } from './icons';

const typeStyles = {
  [StepType.Read]: {
    bgColor: 'bg-green-800',
    borderColor: 'border-green-400',
    icon: <ReadIcon className="h-6 w-6 text-green-300" />,
  },
  [StepType.Transform]: {
    bgColor: 'bg-blue-800',
    borderColor: 'border-blue-400',
    icon: <TransformIcon className="h-6 w-6 text-blue-300" />,
  },
  [StepType.Aggregate]: {
    bgColor: 'bg-purple-800',
    borderColor: 'border-purple-400',
    icon: <AggregateIcon className="h-6 w-6 text-purple-300" />,
  },
  [StepType.Join]: {
    bgColor: 'bg-yellow-800',
    borderColor: 'border-yellow-400',
    icon: <JoinIcon className="h-6 w-6 text-yellow-300" />,
  },
  [StepType.SQL]: {
    bgColor: 'bg-indigo-800',
    borderColor: 'border-indigo-400',
    icon: <SQLIcon className="h-6 w-6 text-indigo-300" />,
  },
  [StepType.Write]: {
    bgColor: 'bg-red-800',
    borderColor: 'border-red-400',
    icon: <WriteIcon className="h-6 w-6 text-red-300" />,
  },
};


// The component's props now use the base NodeProps to be compatible with the
// NodeTypes object. A type assertion is used inside to handle the custom data.
const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  // FIX: Cast through `unknown` first to satisfy stricter type checking rules.
  // This correctly and safely asserts the `data` object to the `Step` type.
  const stepData = data as unknown as Step;
  const styles = typeStyles[stepData.type];

  return (
    <div
      className={`
        w-64 rounded-lg shadow-md border-2 
        ${styles.bgColor} 
        ${selected ? styles.borderColor : 'border-gray-600'}
        transition-all duration-200
        ${selected ? 'transform scale-105 shadow-2xl' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400 w-3 h-3" />
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{styles.icon}</div>
          <div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{stepData.type}</div>
            <div className="text-white font-bold text-md truncate" title={stepData.id}>{stepData.id}</div>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400 w-3 h-3" />
    </div>
  );
};

export default memo(CustomNode);