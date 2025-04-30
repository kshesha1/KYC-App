import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Section } from './Section';
import { usePipelineStore } from '../store/pipelineStore';
import { useFormStore } from '../store/formStore';

interface StageFormProps {
  stageId: string;
  onPrevious: () => void;
  onNext: () => void;
  isFirstStage: boolean;
  isLastStage: boolean;
}

export const StageForm: React.FC<StageFormProps> = ({
  stageId,
  onPrevious,
  onNext,
  isFirstStage,
  isLastStage,
}) => {
  const { sections, isEditMode } = useFormStore();
  const { stages, updateStageSections } = usePipelineStore();
  const currentStage = stages.find(stage => stage.id === stageId);

  const handleSaveAndNext = () => {
    if (currentStage) {
      updateStageSections(stageId, sections);
    }
    onNext();
  };

  const handlePrevious = () => {
    if (currentStage) {
      updateStageSections(stageId, sections);
    }
    onPrevious();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {sections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={handlePrevious}
          disabled={isFirstStage}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Stage
        </button>

        <button
          onClick={handleSaveAndNext}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLastStage ? 'Complete' : 'Next Stage'}
          {!isLastStage && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}; 