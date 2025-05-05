import React, { useEffect, useState } from 'react';
import { useFormStore } from '../store/formStore';
import { useFinishedFormsStore } from '../store/finishedFormStore';
import { Form, Section } from '../types/form';
import { Button } from './ui/button';
import { SectionEditor } from './SectionEditor';
import { FieldSelector } from './FieldSelector';

export const FormBuilder: React.FC = () => {
  const { currentForm, draftForm, saveAsDraft, loadDraft } = useFormStore();
  const finishedFormsStore = useFinishedFormsStore();
  const [form, setForm] = useState<Form | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadDraft();
    if (draftForm) {
      setForm(draftForm);
    } else if (currentForm) {
      setForm(currentForm);
    }
  }, [currentForm, draftForm, loadDraft]);

  const handleSaveDraft = () => {
    if (!form) return;
    saveAsDraft({
      title: form.title,
      description: form.description,
      sections: form.sections,
    });
  };

  const handleSubmitForApproval = () => {
    if (!form) return;
    finishedFormsStore.addForm({
      title: form.title,
      description: form.description || '',
      sections: form.sections,
      createdBy: 'currentUser', // Replace with actual user
    }, false); // false = not draft, so status will be 'pending'
  };

  if (!form) {
    return <div>Loading...</div>;
  }

  return (
    <div className="form-builder">
      <div className="form-builder-header">
        <h2>{form.title}</h2>
        <p>{form.description}</p>
        <div className="form-builder-actions">
          <Button onClick={handleSaveDraft} variant="secondary">
            Save Draft
          </Button>
          <Button onClick={handleSubmitForApproval} variant="default">
            Submit for Approval
          </Button>
        </div>
      </div>

      <div className="form-builder-content">
        {form.sections.map((section) => (
          <SectionEditor
            key={section.id}
            section={section}
            isEditing={isEditing}
            onUpdate={(updatedSection: Section) => {
              setForm({
                ...form,
                sections: form.sections.map((s) =>
                  s.id === updatedSection.id ? updatedSection : s
                ),
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}; 