import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { useFormStore } from '../store/formStore';
import { useFinishedFormsStore } from '../store/finishedFormStore';
import { useUserStore } from '../store/userStore';

interface SaveFormButtonProps {
  onSuccess?: () => void;
}

export const SaveFormButton: React.FC<SaveFormButtonProps> = ({ onSuccess }) => {
  const { sections, saveVersion } = useFormStore();
  const { addForm } = useFinishedFormsStore();
  const { user } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // If no user or user is not a maker, don't render the button
  if (!user || user.role !== 'maker') {
    return null;
  }

  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const handleSaveForm = () => {
    if (!formTitle.trim() || !user) return;
    
    setIsSaving(true);
    
    try {
      // Save as a version in formStore
      saveVersion(`Saved form: ${formTitle}`);
      
      // Add to finished forms with user details
      addForm({
        title: formTitle,
        description: formDescription,
        sections: JSON.parse(JSON.stringify(sections)),
        createdBy: user.name
      });
      
      setIsModalOpen(false);
      setFormTitle('');
      setFormDescription('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSaveClick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white shadow-sm hover:bg-green-700 transition-all duration-200"
      >
        <Save className="w-4 h-4" />
        <span className="text-sm font-medium">Submit for Approval</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Form for Approval</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="form-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Form Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter form title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="form-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="form-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                  placeholder="Enter form description (optional)"
                />
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                <p>By submitting this form, it will be sent for review by a checker. You cannot edit it once approved.</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveForm}
                disabled={!formTitle.trim() || isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin">●</span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Submit for Approval</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 