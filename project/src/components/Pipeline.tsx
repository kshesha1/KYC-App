import React, { useState } from 'react';
import { ChevronRight, Plus, Edit2, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface Stage {
  id: string;
  number: number;
  title: string;
  isActive?: boolean;
}

interface PipelineProps {
  stages: Stage[];
  activeStage: number;
  onStageClick: (stageNumber: number) => void;
  onAddStage: () => void;
  onUpdateStageTitle: (stageId: string, title: string) => void;
}

export const Pipeline: React.FC<PipelineProps> = ({
  stages,
  activeStage,
  onStageClick,
  onAddStage,
  onUpdateStageTitle,
}) => {
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleEditStart = (stage: Stage) => {
    setEditingStageId(stage.id);
    setEditingTitle(stage.title);
  };

  const handleEditSave = (stageId: string) => {
    if (editingTitle.trim()) {
      onUpdateStageTitle(stageId, editingTitle.trim());
    }
    setEditingStageId(null);
    setEditingTitle('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, stageId: string) => {
    if (e.key === 'Enter') {
      handleEditSave(stageId);
    } else if (e.key === 'Escape') {
      setEditingStageId(null);
      setEditingTitle('');
    }
  };

  return (
    <div className="w-full py-8">
      <div className="relative flex items-center justify-center gap-2">
        {/* Connection Lines */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200" />
        
        <div className="flex items-center justify-center gap-2 relative z-10">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStageClick(stage.number)}
                  className={cn(
                    "relative flex items-center justify-center rounded-full transition-all duration-200 border-2",
                    activeStage === stage.number
                      ? "w-14 h-14 bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 shadow-lg transform scale-110"
                      : index < activeStage
                        ? "w-12 h-12 bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-50"
                        : "w-12 h-12 bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:text-blue-600",
                  )}
                >
                  <span className={cn(
                    "text-lg font-semibold transition-all",
                    activeStage === stage.number && "text-xl"
                  )}>
                    {stage.number}
                  </span>
                </button>
                
                <div className="mt-3 text-center min-w-[120px]">
                  {editingStageId === stage.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, stage.id)}
                        onBlur={() => handleEditSave(stage.id)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter stage title..."
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditSave(stage.id)}
                        className="p-1 text-gray-600 hover:text-blue-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="group relative">
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        activeStage === stage.number 
                          ? "text-blue-600" 
                          : index < activeStage
                            ? "text-blue-500"
                            : "text-gray-600"
                      )}>
                        {stage.title}
                      </span>
                      <button
                        onClick={() => handleEditStart(stage)}
                        className="absolute -right-6 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit stage title"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {index < stages.length - 1 && (
                <ChevronRight className={cn(
                  "w-6 h-6 mx-1",
                  index < activeStage - 1 
                    ? "text-blue-400" 
                    : "text-gray-300"
                )} />
              )}
            </React.Fragment>
          ))}

          {/* Add Stage Button */}
          <div className="flex flex-col items-center ml-2">
            <button
              onClick={onAddStage}
              className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Add new stage"
            >
              <Plus className="w-6 h-6" />
            </button>
            <div className="mt-3 text-sm text-gray-500 font-medium min-w-[120px] text-center">
              Add Stage
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 