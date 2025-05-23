export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'file'
  | 'address'
  | 'table'
  | 'multi_checkbox'
  | 'calculated'
  | 'dynamic';

// Import the Expression and CalculationFormula types from the CalculatedField component
import { CalculationFormula, ConditionalFormula } from '../components/fields/CalculatedField';

export type Operator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'starts_with'
  | 'ends_with';

export type LogicalOperator = 'and' | 'or';

export interface SingleCondition {
  sourceFieldId: string;
  operator: Operator;
  value: string;
}

export interface VisibilityCondition {
  conditions: SingleCondition[];
  logicalOperator: LogicalOperator;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  title?: string;
  placeholder?: string;
  value?: any;
  required?: boolean;
  options?: string[];
  isMultiSelect?: boolean;
  visibilityCondition?: VisibilityCondition;
  order: number;
  formula?: CalculationFormula;
}

export interface Section {
  id: string;
  title: string;
  fields: Field[];
  isExpanded: boolean;
  order: number;
  visibilityCondition?: VisibilityCondition;
}

export interface FormVersion {
  id: string;
  version?: number;
  timestamp?: number;
  sections: Section[];
  description: string;
  createdAt?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  sections: Section[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  lastSaved?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  submittedBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface FormState {
  sections: Section[];
  isEditMode: boolean;
  isDirty: boolean;
  currentVersion: FormVersion | null;
  versions: FormVersion[];
  clonedFrom: string | null;
  addSection: (section: Omit<Section, 'id' | 'order'>) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  toggleSectionExpand: (id: string) => void;
  reorderSection: (id: string, newOrder: number) => void;
  addField: (sectionId: string, field: Omit<Field, 'id'>) => void;
  removeField: (sectionId: string, fieldId: string) => void;
  updateField: (sectionId: string, fieldId: string, updates: Partial<Field>) => void;
  toggleEditMode: () => void;
  saveVersion: (description: string) => void;
  loadVersion: (versionId: string) => void;
  discardChanges: () => void;
}

export interface FormSubmission {
  id: string;
  name: string;
  timestamp: number;
  sections: Section[];
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'pending_approval';
  lastModified: number;
  version: number;
  submittedBy?: string;
  comments?: string;
}

export interface FormSubmissionState {
  submissions: FormSubmission[];
  currentSubmission: FormSubmission | null;
  addSubmission: () => void;
  updateSubmission: (updates: Partial<FormSubmission>) => void;
  saveSubmissionDraft: (name?: string) => void;
  submitForm: (comments?: string) => void;
  loadSubmission: (submissionId: string) => void;
  updateSubmissionName: (submissionId: string, name: string) => void;
}