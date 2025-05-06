import React from 'react';
import { Section, Field } from '../types/form';
import { FieldRenderer } from './FieldRenderer';

interface SectionEditorProps {
  section: Section;
  isEditing: boolean;
  onUpdate: (section: Section) => void;
}
/**
 * SectionEditor Component
 * 
 * A reusable component for editing and displaying form sections.
 * Handles the rendering and updating of fields within a section.
 * 
 * Props:
 * - section: The section data containing fields and metadata
 * - isEditing: Boolean flag to control edit mode
 * - onUpdate: Callback function to handle section updates
 */

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