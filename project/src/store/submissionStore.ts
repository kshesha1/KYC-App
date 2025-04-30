import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { FormSubmissionState, FormSubmission, Section, Field } from '../types/form';
import { useFormStore } from './formStore';

export const useSubmissionStore = create<FormSubmissionState>((set, get) => ({
  submissions: [],
  currentSubmission: null,

  addSubmission: () => {
    const formSections = useFormStore.getState().sections;
    const { submissions } = get();
    
    // Calculate next draft number
    const draftCount = submissions.filter(s => s.status === 'draft').length;
    const draftNumber = draftCount + 1;
    
    // Deep clone sections and initialize field values
    const submissionSections = formSections.map(section => ({
      ...section,
      fields: section.fields.map(field => ({
        ...field,
        value: field.type === 'checkbox' ? false : 
               field.type === 'multi_checkbox' ? new Array(field.options?.length || 0).fill(false) :
               field.type === 'select' && field.isMultiSelect ? [] : 
               field.type === 'table' ? { columns: field.value?.columns || [], rows: [] } :
               field.type === 'calculated' ? '' : // Calculated fields start empty, will be computed on render
               ''
      }))
    }));

    const newSubmission: FormSubmission = {
      id: uuidv4(),
      name: `Draft ${draftNumber}`,
      timestamp: Date.now(),
      lastModified: Date.now(),
      sections: submissionSections,
      status: 'draft',
      version: useFormStore.getState().versions.length, // Current form version
    };

    set((state) => ({
      submissions: [...state.submissions, newSubmission],
      currentSubmission: newSubmission,
    }));
  },

  updateSubmission: (updates) => {
    set((state) => {
      if (!state.currentSubmission) return state;

      const updatedSubmission = {
        ...state.currentSubmission,
        ...updates,
        lastModified: Date.now(),
      };

      return {
        currentSubmission: updatedSubmission,
        submissions: state.submissions.map((sub) =>
          sub.id === updatedSubmission.id ? updatedSubmission : sub
        ),
      };
    });
  },

  updateSubmissionName: (submissionId: string, name: string) => {
    set((state) => {
      const updatedSubmissions = state.submissions.map((sub) =>
        sub.id === submissionId ? { ...sub, name, lastModified: Date.now() } : sub
      );

      return {
        submissions: updatedSubmissions,
        currentSubmission: state.currentSubmission?.id === submissionId
          ? { ...state.currentSubmission, name, lastModified: Date.now() }
          : state.currentSubmission,
      };
    });
  },

  saveSubmissionDraft: (name?: string) => {
    set((state) => {
      if (!state.currentSubmission) return state;

      const updatedSubmission = {
        ...state.currentSubmission,
        name: name || state.currentSubmission.name,
        lastModified: Date.now(),
        version: useFormStore.getState().versions.length, // Update version to current form version
      };

      return {
        currentSubmission: updatedSubmission,
        submissions: state.submissions.map((sub) =>
          sub.id === updatedSubmission.id ? updatedSubmission : sub
        ),
      };
    });
  },

  submitForm: (comments?: string) => {
    set((state) => {
      if (!state.currentSubmission) return state;

      const submittedSubmission = {
        ...state.currentSubmission,
        status: 'submitted' as const,
        lastModified: Date.now(),
        comments,
      };

      return {
        currentSubmission: submittedSubmission,
        submissions: state.submissions.map((sub) =>
          sub.id === submittedSubmission.id ? submittedSubmission : sub
        ),
      };
    });
  },

  loadSubmission: (submissionId) => {
    set((state) => {
      const submission = state.submissions.find((s) => s.id === submissionId);
      return {
        currentSubmission: submission || null,
      };
    });
  },
})); 