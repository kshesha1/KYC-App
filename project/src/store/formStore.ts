import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { FormState, Section, Field, FormVersion } from '../types/form';

const createInitialVersion = (sections: Section[]): FormVersion => ({
  id: uuidv4(),
  timestamp: Date.now(),
  sections: JSON.parse(JSON.stringify(sections)),
  description: 'Initial version',
});

export const useFormStore = create<FormState>((set, get) => ({
  sections: [],
  isEditMode: true,
  currentVersion: null,
  versions: [],
  isDirty: false,

  addSection: (section) =>
    set((state) => {
      const newSections = [
        ...state.sections,
        {
          ...section,
          id: uuidv4(),
          order: state.sections.length,
        },
      ];
      return {
        sections: newSections,
        isDirty: true,
      };
    }),

  removeSection: (id) =>
    set((state) => ({
      sections: state.sections.filter((section) => section.id !== id),
      isDirty: true,
    })),

  updateSection: (id, updates) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === id ? { ...section, ...updates } : section
      ),
      isDirty: true,
    })),

  toggleSectionExpand: (id) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === id
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      ),
    })),

  reorderSection: (id, newOrder) =>
    set((state) => {
      const sections = [...state.sections];
      const section = sections.find((s) => s.id === id);
      if (!section) return state;

      const oldOrder = section.order;
      sections.forEach((s) => {
        if (s.id === id) {
          s.order = newOrder;
        } else if (
          oldOrder < newOrder
            ? s.order <= newOrder && s.order > oldOrder
            : s.order >= newOrder && s.order < oldOrder
        ) {
          s.order += oldOrder < newOrder ? -1 : 1;
        }
      });

      return { sections, isDirty: true };
    }),

  addField: (sectionId, field) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: [...section.fields, { ...field, id: uuidv4() }],
            }
          : section
      ),
      isDirty: true,
    })),

  removeField: (sectionId, fieldId) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.filter((field) => field.id !== fieldId),
            }
          : section
      ),
      isDirty: true,
    })),

  updateField: (sectionId, fieldId, updates) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId ? { ...field, ...updates } : field
              ),
            }
          : section
      ),
      isDirty: true,
    })),

  toggleEditMode: () =>
    set((state) => ({
      isEditMode: !state.isEditMode,
    })),

  saveVersion: (description) =>
    set((state) => {
      const newVersion: FormVersion = {
        id: uuidv4(),
        timestamp: Date.now(),
        sections: JSON.parse(JSON.stringify(state.sections)),
        description,
      };

      return {
        versions: [...state.versions, newVersion],
        currentVersion: newVersion.id,
        isDirty: false,
      };
    }),

  loadVersion: (versionId) =>
    set((state) => {
      const version = state.versions.find((v) => v.id === versionId);
      if (!version) return state;

      return {
        sections: JSON.parse(JSON.stringify(version.sections)),
        currentVersion: versionId,
        isDirty: false,
      };
    }),

  discardChanges: () =>
    set((state) => {
      const currentVersion = state.versions.find(
        (v) => v.id === state.currentVersion
      );
      if (!currentVersion) return state;

      return {
        sections: JSON.parse(JSON.stringify(currentVersion.sections)),
        isDirty: false,
      };
    }),
}));