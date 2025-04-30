import { create } from 'zustand';
import type { FormSubmission } from '../types/form';

export type WorkflowStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type Role = 'maker' | 'checker';

interface WorkflowState {
  currentRole: Role;
  pendingApprovals: FormSubmission[];
  approvedForms: FormSubmission[];
  rejectedForms: FormSubmission[];
  
  // Role management
  setRole: (role: Role) => void;
  
  // Maker actions
  submitForApproval: (submission: FormSubmission) => void;
  
  // Checker actions
  approveSubmission: (submissionId: string, comments?: string) => void;
  rejectSubmission: (submissionId: string, comments: string) => void;
  
  // Common actions
  getSubmissionStatus: (submissionId: string) => WorkflowStatus;
  canEditSubmission: (submissionId: string) => boolean;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentRole: 'maker',
  pendingApprovals: [],
  approvedForms: [],
  rejectedForms: [],

  setRole: (role) => {
    set({ currentRole: role });
  },

  submitForApproval: (submission) => {
    const updatedSubmission = {
      ...submission,
      status: 'pending_approval' as const,
      lastModified: Date.now(),
    };

    set((state) => ({
      pendingApprovals: [...state.pendingApprovals, updatedSubmission],
    }));
  },

  approveSubmission: (submissionId, comments) => {
    set((state) => {
      const submission = state.pendingApprovals.find((s) => s.id === submissionId);
      if (!submission) return state;

      const updatedSubmission = {
        ...submission,
        status: 'approved' as const,
        lastModified: Date.now(),
        comments,
      };

      return {
        pendingApprovals: state.pendingApprovals.filter((s) => s.id !== submissionId),
        approvedForms: [...state.approvedForms, updatedSubmission],
      };
    });
  },

  rejectSubmission: (submissionId, comments) => {
    set((state) => {
      const submission = state.pendingApprovals.find((s) => s.id === submissionId);
      if (!submission) return state;

      const updatedSubmission = {
        ...submission,
        status: 'rejected' as const,
        lastModified: Date.now(),
        comments,
      };

      return {
        pendingApprovals: state.pendingApprovals.filter((s) => s.id !== submissionId),
        rejectedForms: [...state.rejectedForms, updatedSubmission],
      };
    });
  },

  getSubmissionStatus: (submissionId) => {
    const state = get();
    
    if (state.pendingApprovals.some((s) => s.id === submissionId)) {
      return 'pending_approval';
    }
    if (state.approvedForms.some((s) => s.id === submissionId)) {
      return 'approved';
    }
    if (state.rejectedForms.some((s) => s.id === submissionId)) {
      return 'rejected';
    }
    return 'draft';
  },

  canEditSubmission: (submissionId) => {
    const state = get();
    const status = state.getSubmissionStatus(submissionId);
    const role = state.currentRole;

    // Makers can only edit drafts and rejected forms
    if (role === 'maker') {
      return status === 'draft' || status === 'rejected';
    }

    // Checkers can only view forms, not edit them
    return false;
  },
})); 