import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Section } from '../types/form';

interface Stage {
  id: string;
  number: number;
  title: string;
  sections: Section[];
}

interface PipelineState {
  stages: Stage[];
  activeStage: number;
  addStage: () => void;
  updateStageTitle: (stageId: string, title: string) => void;
  setActiveStage: (stageNumber: number) => void;
  updateStageSections: (stageId: string, sections: Section[]) => void;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  stages: [
    {
      id: uuidv4(),
      number: 1,
      title: 'Stage 1',
      sections: [],
    },
  ],
  activeStage: 1,

  addStage: () => {
    set((state) => {
      const newStageNumber = state.stages.length + 1;
      return {
        stages: [
          ...state.stages,
          {
            id: uuidv4(),
            number: newStageNumber,
            title: `Stage ${newStageNumber}`,
            sections: [],
          },
        ],
      };
    });
  },

  updateStageTitle: (stageId: string, title: string) => {
    set((state) => ({
      stages: state.stages.map((stage) =>
        stage.id === stageId ? { ...stage, title } : stage
      ),
    }));
  },

  setActiveStage: (stageNumber: number) => {
    set({ activeStage: stageNumber });
  },

  updateStageSections: (stageId: string, sections: Section[]) => {
    set((state) => ({
      stages: state.stages.map((stage) =>
        stage.id === stageId ? { ...stage, sections } : stage
      ),
    }));
  },
})); 