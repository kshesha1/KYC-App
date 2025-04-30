import React from 'react';
import { Pipeline } from './Pipeline';
import { StageForm } from './StageForm';
import { usePipelineStore } from '../store/pipelineStore';

export const PipelineBuilder: React.FC = () => {
  const { stages, activeStage, addStage, updateStageTitle, setActiveStage } = usePipelineStore();

  const currentStage = stages.find(stage => stage.number === activeStage);
  const isFirstStage = activeStage === 1;
  const isLastStage = activeStage === stages.length;

  const handlePrevious = () => {
    if (!isFirstStage) {
      setActiveStage(activeStage - 1);
    }
  };

  const handleNext = () => {
    if (isLastStage) {
      // Handle form completion
      console.log('Pipeline completed');
    } else {
      setActiveStage(activeStage + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Pipeline
        stages={stages}
        activeStage={activeStage}
        onStageClick={setActiveStage}
        onAddStage={addStage}
        onUpdateStageTitle={updateStageTitle}
      />

      <div className="mt-8">
        {currentStage && (
          <StageForm
            stageId={currentStage.id}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isFirstStage={isFirstStage}
            isLastStage={isLastStage}
          />
        )}
      </div>
    </div>
  );
}; 