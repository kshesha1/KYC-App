import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { FormState, Section, Field, FormVersion, Form } from '../types/form';
import { useFinishedFormsStore } from './finishedFormStore';

const createInitialVersion = (sections: Section[]): FormVersion => ({
  id: uuidv4(),
  timestamp: Date.now(),
  sections: JSON.parse(JSON.stringify(sections)),
  description: 'Initial version',
});

interface FormStore {
  sections: Section[];
  isEditMode: boolean;
  isDirty: boolean;
  currentVersion: FormVersion | null;
  versions: FormVersion[];
  isDraft: boolean;
  lastSaved: string | null;
  addSection: (section: Omit<Section, 'id' | 'order'>) => void;
  removeSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  reorderSection: (sectionId: string, newOrder: number) => void;
  addField: (sectionId: string, field: Omit<Field, 'id'>) => void;
  addFieldAt: (sectionId: string, index: number, field: Omit<Field, 'id'>) => void;
  removeField: (sectionId: string, fieldId: string) => void;
  updateField: (sectionId: string, fieldId: string, updates: Partial<Field>) => void;
  reorderField: (sectionId: string, fieldId: string, newOrder: number) => void;
  toggleEditMode: () => void;
  saveVersion: (description: string) => void;
  loadVersion: (versionId: string) => void;
  saveAsDraft: (formData: Omit<Form, 'id' | 'createdAt' | 'status' | 'createdBy'>) => void;
  loadDraft: () => void;
  clearDraft: () => void;
  forms: Form[];
  currentForm: Form | null;
  draftForm: Form | null;
  addForm: (form: Omit<Form, 'id' | 'createdAt' | 'status' | 'createdBy'>) => void;
  updateForm: (form: Form) => void;
  deleteForm: (id: string) => void;
  setCurrentForm: (form: Form | null) => void;
  createVersion: (form: Form) => FormVersion;
  submitDraft: () => void;
}

export const useFormStore = create<FormStore>((set, get) => ({
  sections: [],
  isEditMode: true,
  isDirty: false,
  currentVersion: null,
  versions: [],
  isDraft: false,
  lastSaved: null,
  forms: [],
  currentForm: null,
  draftForm: null,

  addSection: (section) => {
    const newSection = {
      ...section,
      id: uuidv4(),
      order: get().sections.length,
    };
    set((state) => ({
      sections: [...state.sections, newSection],
      isDirty: true,
    }));
  },

  removeSection: (sectionId) => {
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== sectionId),
      isDirty: true,
    }));
  },

  updateSection: (sectionId, updates) => {
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
      isDirty: true,
    }));
  },

  reorderSection: (sectionId, newOrder) => {
    set((state) => {
      const sections = [...state.sections];
      const sectionIndex = sections.findIndex((s) => s.id === sectionId);
      if (sectionIndex === -1) return state;

      const [section] = sections.splice(sectionIndex, 1);
      sections.splice(newOrder, 0, section);

      return {
        sections: sections.map((s, i) => ({ ...s, order: i })),
        isDirty: true,
      };
    });
  },

  addField: (sectionId, field) => {
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: [
                ...s.fields,
                { ...field, id: uuidv4(), order: s.fields.length },
              ],
            }
          : s
      ),
      isDirty: true,
    }));
  },

  addFieldAt: (sectionId, index, field) => {
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: [
                ...s.fields.slice(0, index),
                { ...field, id: uuidv4(), order: index },
                ...s.fields.slice(index),
              ].map((f, i) => ({ ...f, order: i })),
            }
          : s
      ),
      isDirty: true,
    }));
  },

  removeField: (sectionId, fieldId) => {
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.filter((f) => f.id !== fieldId),
            }
          : s
      ),
      isDirty: true,
    }));
  },

  updateField: (sectionId, fieldId, updates) => {
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
              ),
            }
          : s
      ),
      isDirty: true,
    }));
  },

  reorderField: (sectionId, fieldId, newOrder) => {
    set((state) => {
      const sections = [...state.sections];
      const sectionIndex = sections.findIndex((s) => s.id === sectionId);
      if (sectionIndex === -1) return state;

      const section = sections[sectionIndex];
      const fieldIndex = section.fields.findIndex((f) => f.id === fieldId);
      if (fieldIndex === -1) return state;

      const fields = [...section.fields];
      const [field] = fields.splice(fieldIndex, 1);
      fields.splice(newOrder, 0, field);

      sections[sectionIndex] = {
        ...section,
        fields: fields.map((f, i) => ({ ...f, order: i })),
      };

      return {
        sections,
        isDirty: true,
      };
    });
  },

  toggleEditMode: () => {
    set((state) => ({
      isEditMode: !state.isEditMode,
    }));
  },

  saveVersion: (description) => {
    const { sections, currentVersion } = get();
    const newVersion: FormVersion = {
      id: uuidv4(),
      description,
      sections: JSON.parse(JSON.stringify(sections)),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      versions: [...state.versions, newVersion],
      currentVersion: newVersion,
      isDirty: false,
    }));
  },

  loadVersion: (versionId) => {
    const version = get().versions.find((v) => v.id === versionId);
    if (version) {
      set({
        sections: JSON.parse(JSON.stringify(version.sections)),
        currentVersion: version,
        isDirty: false,
      });
    }
  },

  saveAsDraft: (formData) => {
    const draft: Form = {
      ...formData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: 'draft',
      createdBy: 'currentUser', // This should be replaced with actual user ID
      lastSaved: new Date().toISOString(),
    };
    set({ draftForm: draft });
    localStorage.setItem('formDraft', JSON.stringify(draft));

    // Add to finishedFormStore for dashboard visibility
    const finishedFormsStore = useFinishedFormsStore.getState();
    // Check if a draft with the same id already exists
    const existing = finishedFormsStore.forms.find(f => f.id === draft.id);
    if (!existing) {
      finishedFormsStore.addForm({
        title: draft.title,
        description: draft.description || '',
        sections: draft.sections,
        createdBy: draft.createdBy,
      }, true);
    }
  },

  loadDraft: () => {
    const savedDraft = localStorage.getItem('formDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft) as Form;
      set({ draftForm: draft });
    }
  },

  clearDraft: () => {
    set({ draftForm: null });
    localStorage.removeItem('formDraft');
  },

  addForm: (formData) => {
    const newForm: Form = {
      ...formData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: 'submitted',
      createdBy: 'currentUser', // This should be replaced with actual user ID
    };
    set((state) => ({
      forms: [...state.forms, newForm],
      currentForm: newForm,
    }));
  },

  updateForm: (form) => {
    set((state) => ({
      forms: state.forms.map((f) => (f.id === form.id ? form : f)),
      currentForm: form,
    }));
  },

  deleteForm: (id) => {
    set((state) => ({
      forms: state.forms.filter((f) => f.id !== id),
      currentForm: state.currentForm?.id === id ? null : state.currentForm,
    }));
  },

  setCurrentForm: (form) => {
    set({ currentForm: form });
  },

  createVersion: (form) => {
    return {
      id: uuidv4(),
      version: 1,
      timestamp: Date.now(),
      sections: form.sections,
      description: form.description || '',
      createdAt: new Date().toISOString(),
    };
  },

  submitDraft: () => {
    set((state) => {
      if (!state.draftForm) return state;
      
      const submittedForm: Form = {
        ...state.draftForm,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        submittedBy: 'currentUser', // This should be replaced with actual user ID
      };

      return {
        forms: [...state.forms, submittedForm],
        currentForm: submittedForm,
        draftForm: null,
      };
    });
    localStorage.removeItem('formDraft');
  },
}));