import React from 'react';
import { FieldType } from '../types/form';

interface FieldSelectorProps {
  onSelect: (type: FieldType) => void;
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({ onSelect }) => {
  const fieldTypes: FieldType[] = [
    'text',
    'textarea',
    'number',
    'email',
    'phone',
    'date',
    'checkbox',
    'radio',
    'select',
    'file',
    'address',
    'table',
    'multi_checkbox',
    'calculated',
    'dynamic',
  ];

  return (
    <div className="field-selector">
      <div className="field-selector-grid">
        {fieldTypes.map((type) => (
          <button
            key={type}
            className="field-type-button"
            onClick={() => onSelect(type)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}; 