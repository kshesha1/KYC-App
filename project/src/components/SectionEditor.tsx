import React from 'react';
import { Section, Field } from '../types/form';
import { FieldRenderer } from './FieldRenderer';

interface SectionEditorProps {
  section: Section;
  isEditing: boolean;
  onUpdate: (section: Section) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  isEditing,
  onUpdate,
}) => {
  const handleFieldUpdate = (updatedField: Field) => {
    onUpdate({
      ...section,
      fields: section.fields.map((f) =>
        f.id === updatedField.id ? updatedField : f
      ),
    });
  };

  return (
    <div className="section-editor">
      <h3>{section.title}</h3>
      <div className="section-fields">
        {section.fields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            isEditing={isEditing}
            onUpdate={handleFieldUpdate}
          />
        ))}
      </div>
    </div>
  );
}; 