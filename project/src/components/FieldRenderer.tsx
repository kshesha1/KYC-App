import React from 'react';
import { Field } from '../types/form';
import { FieldSelector } from './FieldSelector';

interface FieldRendererProps {
  field: Field;
  isEditing: boolean;
  onUpdate: (field: Field) => void;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  isEditing,
  onUpdate,
}) => {
  const handleTypeChange = (type: Field['type']) => {
    onUpdate({
      ...field,
      type,
      value: undefined, // Reset value when type changes
    });
  };

  const handleValueChange = (value: any) => {
    onUpdate({
      ...field,
      value,
    });
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            value={field.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={!isEditing}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={field.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={!isEditing}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={field.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            disabled={!isEditing}
          />
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={field.value || false}
            onChange={(e) => handleValueChange(e.target.checked)}
            disabled={!isEditing}
          />
        );
      case 'select':
        return (
          <select
            value={field.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            disabled={!isEditing}
          >
            <option value="">Select an option</option>
            {/* Add options here */}
          </select>
        );
      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  return (
    <div className="field-renderer">
      <div className="field-header">
        <label>{field.label}</label>
        {isEditing && (
          <FieldSelector
            onSelect={(type) => handleTypeChange(type)}
          />
        )}
      </div>
      {renderField()}
    </div>
  );
}; 