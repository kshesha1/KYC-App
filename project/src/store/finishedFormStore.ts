import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Section } from '../types/form';

export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface FinishedForm {
  id: string;
  title: string;
  description: string;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  approvalStatus: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: number;
  reviewComments?: string;
}

interface FinishedFormsState {
  forms: FinishedForm[];
  addForm: (formData: Omit<FinishedForm, 'id' | 'createdAt' | 'updatedAt' | 'approvalStatus'>, isDraft?: boolean) => string;
  updateForm: (id: string, updates: Partial<Omit<FinishedForm, 'id' | 'createdAt'>>) => void;
  deleteForm: (id: string) => void;
  getForm: (id: string) => FinishedForm | undefined;
  approveForm: (id: string, reviewerName: string, comments?: string) => void;
  rejectForm: (id: string, reviewerName: string, comments?: string) => void;
  getPendingForms: () => FinishedForm[];
  getApprovedForms: () => FinishedForm[];
  getRejectedForms: () => FinishedForm[];
  getDraftForms: () => FinishedForm[];
}

export const useFinishedFormsStore = create<FinishedFormsState>((set, get) => ({
  forms: [],
  
  addForm: (formData, isDraft = false) => {
    const id = uuidv4();
    const timestamp = Date.now();
    
    set((state) => ({
      forms: [
        ...state.forms,
        {
          id,
          ...formData,
          createdAt: timestamp,
          updatedAt: timestamp,
          approvalStatus: isDraft ? 'draft' : 'pending'
        }
      ]
    }));
    
    return id;
  },
  
  updateForm: (id, updates) => {
    set((state) => ({
      forms: state.forms.map((form) => 
        form.id === id 
          ? { 
              ...form, 
              ...updates,
              updatedAt: Date.now()
            } 
          : form
      )
    }));
  },
  
  deleteForm: (id) => {
    set((state) => ({
      forms: state.forms.filter((form) => form.id !== id)
    }));
  },
  
  getForm: (id) => {
    return get().forms.find((form) => form.id === id);
  },

  approveForm: (id, reviewerName, comments) => {
    set((state) => ({
      forms: state.forms.map((form) => 
        form.id === id 
          ? { 
              ...form, 
              approvalStatus: 'approved',
              reviewedBy: reviewerName,
              reviewedAt: Date.now(),
              reviewComments: comments
            } 
          : form
      )
    }));
  },

  rejectForm: (id, reviewerName, comments) => {
    set((state) => ({
      forms: state.forms.map((form) => 
        form.id === id 
          ? { 
              ...form, 
              approvalStatus: 'rejected',
              reviewedBy: reviewerName,
              reviewedAt: Date.now(),
              reviewComments: comments
            } 
          : form
      )
    }));
  },

  getPendingForms: () => {
    return get().forms.filter(form => form.approvalStatus === 'pending');
  },

  getApprovedForms: () => {
    return get().forms.filter(form => form.approvalStatus === 'approved');
  },

  getRejectedForms: () => {
    return get().forms.filter(form => form.approvalStatus === 'rejected');
  },

  getDraftForms: () => {
    return get().forms.filter(form => form.approvalStatus === 'draft');
  }
})); 