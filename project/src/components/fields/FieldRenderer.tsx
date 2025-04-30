import React, { useState } from 'react';
import { Trash2, Edit2, Check, GripVertical, Star, Eye, EyeOff, Plus, X } from 'lucide-react';
import type { Field, VisibilityCondition, SingleCondition, Operator, LogicalOperator, Section } from '../../types/form';
import { useFormStore } from '../../store/formStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { TextField } from './TextField';
import { DateField } from './DateField';
import { CheckboxField } from './CheckboxField';
import { SelectField } from './SelectField';
import { FileField } from './FileField';
import { MultiCheckboxField } from './MultiCheckboxField';
import { AddressField } from './AddressField';
import { TableField } from './TableField';
import { CalculatedField, CalculationFormula, ConditionalFormula } from './CalculatedField';
import { cn, evaluateCondition } from '../../lib/utils';
import '../../styles/custom.css';

interface FieldRendererProps {
  field: Field;
  sectionId: string;
}

const OPERATORS: { value: Operator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
];

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field, sectionId }) => {
  const { sections, isEditMode, updateField, removeField } = useFormStore();
  const { currentSubmission, updateSubmission } = useSubmissionStore();
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(field.label);
  const [showConditionEditor, setShowConditionEditor] = useState(false);
  const [conditions, setConditions] = useState<SingleCondition[]>(
    field.visibilityCondition?.conditions || []
  );
  const [logicalOperator, setLogicalOperator] = useState<LogicalOperator>(
    field.visibilityCondition?.logicalOperator || 'and'
  );

  const isVisible = isEditMode || evaluateCondition(
    field.visibilityCondition,
    !isEditMode && currentSubmission ? currentSubmission.sections : sections
  );

  const handleChange = (value: any) => {
    if (!isEditMode && currentSubmission) {
      const updatedSections = currentSubmission.sections.map((section: Section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((f: Field) =>
                f.id === field.id 
                  ? { 
                      ...f, 
                      value: field.type === 'multi_checkbox' 
                        ? (Array.isArray(value) ? value : new Array(f.options?.length || 0).fill(false))
                        : value 
                    } 
                  : f
              ),
            }
          : section
      );
      updateSubmission({ sections: updatedSections });
    }
  };

  const handleLabelSave = () => {
    updateField(sectionId, field.id, { label: labelValue });
    setIsEditingLabel(false);
  };

  const toggleRequired = () => {
    updateField(sectionId, field.id, { required: !field.required });
  };

  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      { sourceFieldId: '', operator: 'equals', value: '' }
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleUpdateCondition = (index: number, updates: Partial<SingleCondition>) => {
    setConditions(
      conditions.map((condition, i) =>
        i === index ? { ...condition, ...updates } : condition
      )
    );
  };

  const handleSaveCondition = () => {
    const hasValidConditions = conditions.length > 0 && 
      conditions.every(c => c.sourceFieldId && 
        (c.operator === 'is_empty' || c.operator === 'is_not_empty' || c.value));

    const condition: VisibilityCondition | undefined = hasValidConditions
      ? {
          conditions,
          logicalOperator,
        }
      : undefined;

    updateField(sectionId, field.id, { visibilityCondition: condition });
    setShowConditionEditor(false);
  };

  const availableSourceFields = sections.flatMap((section: Section) =>
    section.fields.filter((f: Field) => f.id !== field.id)
  );

  const renderField = () => {
    if (!isEditMode && !isVisible) return null;

    const currentValue = !isEditMode && currentSubmission
      ? currentSubmission.sections
          .find((s: Section) => s.id === sectionId)
          ?.fields.find((f: Field) => f.id === field.id)?.value
      : undefined;

    const fieldProps = {
      field: {
        ...field,
        value: !isEditMode ? currentValue : undefined,
        placeholder: field.placeholder || `Enter ${field.type}...`,
      },
      onChange: handleChange,
      disabled: isEditMode,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return <TextField {...fieldProps} />;
      case 'date':
        return <DateField {...fieldProps} />;
      case 'checkbox':
        return (
          <CheckboxField
            {...fieldProps}
            isEditMode={isEditMode}
            onLabelChange={(value) => {
              updateField(sectionId, field.id, { placeholder: value });
            }}
            onTitleChange={(value) => {
              updateField(sectionId, field.id, { title: value });
            }}
          />
        );
      case 'select':
        return (
          <SelectField
            {...fieldProps}
            isEditMode={isEditMode}
            onOptionsChange={(options) => {
              updateField(sectionId, field.id, { options });
            }}
            onMultiSelectChange={(isMultiSelect) => {
              const newValue = isMultiSelect ? [] : '';
              updateField(sectionId, field.id, { 
                isMultiSelect,
                value: newValue
              });
            }}
          />
        );
      case 'file':
        return <FileField {...fieldProps} />;
      case 'address':
        return <AddressField {...fieldProps} />;
      case 'multi_checkbox':
        return (
          <MultiCheckboxField
            field={{
              ...field,
              value: !isEditMode ? currentValue : field.value
            }}
            onChange={handleChange}
            disabled={isEditMode}
            isEditMode={isEditMode}
            onOptionsChange={(options) => {
              const currentValues = Array.isArray(field.value) ? field.value : [];
              const newValues = options.map((_, index) => currentValues[index] || false);
              updateField(sectionId, field.id, { 
                options,
                value: newValues
              });
            }}
            onTitleChange={(title) => {
              updateField(sectionId, field.id, { title });
            }}
          />
        );
      case 'table':
        return <TableField {...fieldProps} />;
      case 'calculated':
        return (
          <CalculatedField 
            {...fieldProps} 
            isEditMode={isEditMode}
            sectionId={sectionId}
            sourceFields={sections.flatMap(section => section.fields)}
            onFormulaChange={(formula: CalculationFormula) => {
              updateField(sectionId, field.id, { formula });
            }}
          />
        );
      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  if (!isEditMode && !isVisible) return null;

  return (
    <div className="group relative animate-fade-in">
      <div className="field-container mb-6">
        <div className="field-header">
          <div className="flex items-center gap-3 flex-1">
            {isEditMode && (
              <div className="drag-handle">
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            {field.type !== 'checkbox' && (
              <>
        {isEditMode && isEditingLabel ? (
                  <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
                      className="input-field flex-1"
              autoFocus
            />
            <button
              onClick={handleLabelSave}
                      className="icon-button"
            >
                      <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <label className="block text-sm font-medium text-gray-900 flex-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
            {isEditMode && (
              <button
                onClick={() => setIsEditingLabel(true)}
                          className="ml-2 opacity-0 group-hover:opacity-100 icon-button inline-flex"
              >
                          <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </label>
                  </div>
                )}
              </>
        )}
        {isEditMode && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowConditionEditor(!showConditionEditor)}
                  className={cn(
                    "icon-button",
                    field.visibilityCondition && "text-blue-600"
                  )}
                  title="Set visibility condition"
                >
                  {field.visibilityCondition ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={toggleRequired}
                  className={cn(
                    "icon-button",
                    field.required && "text-blue-600"
                  )}
                  title="Toggle required"
                >
                  <Star className="w-4 h-4" />
                </button>
          <button
            onClick={() => removeField(sectionId, field.id)}
                  className="icon-button text-red-600"
                  title="Remove field"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {showConditionEditor && isEditMode && (
          <div className="field-content border-b border-gray-100">
            <div className="glassmorphism rounded-xl animate-fade-in">
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Visibility Conditions</h4>
                <div className="space-y-4">
                  {conditions.map((condition, index) => (
                    <div key={index} className="condition-card animate-slide-in">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm text-gray-600">
                          {index === 0 ? 'Show this field when' : logicalOperator.toUpperCase()}
                        </label>
                        <button
                          onClick={() => handleRemoveCondition(index)}
                          className="icon-button danger"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <select
                          value={condition.sourceFieldId}
                          onChange={(e) => handleUpdateCondition(index, { sourceFieldId: e.target.value })}
                          className="select-field input-field w-full"
                        >
                          <option value="">Select a field...</option>
                          {availableSourceFields.map((field) => (
                            <option key={field.id} value={field.id}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                        {condition.sourceFieldId && (
                          <>
                            <select
                              value={condition.operator}
                              onChange={(e) => handleUpdateCondition(index, { operator: e.target.value as Operator })}
                              className="select-field input-field w-full"
          >
                              {OPERATORS.map((op) => (
                                <option key={op.value} value={op.value}>
                                  {op.label}
                                </option>
                              ))}
                            </select>
                            {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                              <input
                                type="text"
                                value={condition.value || ''}
                                onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                                placeholder="Enter value..."
                                className="input-field w-full"
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-4 pt-4">
                    <button
                      onClick={handleAddCondition}
                      className="button-secondary flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Condition</span>
                    </button>
                    {conditions.length > 1 && (
                      <select
                        value={logicalOperator}
                        onChange={(e) => setLogicalOperator(e.target.value as LogicalOperator)}
                        className="select-field input-field"
                      >
                        <option value="and">AND</option>
                        <option value="or">OR</option>
                      </select>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        updateField(sectionId, field.id, { visibilityCondition: undefined });
                        setShowConditionEditor(false);
                      }}
                      className="button-secondary"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSaveCondition}
                      className="button-primary"
                    >
                      Save Conditions
          </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="field-content">
          {renderField()}
        </div>
      </div>
      <div className="fields-divider" />
    </div>
  );
};