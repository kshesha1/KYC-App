import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { useFormStore } from '../store/formStore';
import { useSubmissionStore } from '../store/submissionStore';
import type { Section, Field } from '../types/form';

export const FormActions: React.FC = () => {
  const { sections } = useFormStore();
  const { currentSubmission, submitForm } = useSubmissionStore();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [comments, setComments] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    sections.forEach((section: Section) => {
      section.fields.forEach((field: Field) => {
        if (field.required) {
          const value = field.value;
          if (value === undefined || value === '' || 
              (Array.isArray(value) && value.length === 0)) {
            errors.push(`${field.label} is required`);
          }
        }
      });
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmitClick = () => {
    if (validateForm()) {
      setShowSubmitDialog(true);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      submitForm(comments);
      setComments('');
      setShowSubmitDialog(false);
      // Show a toast or some feedback
      alert('Form submitted successfully');
    }
  };

  if (!currentSubmission || currentSubmission.status !== 'draft') {
    return null;
  }

  return (
    <>
      {/* Validation Errors Panel */}
      {validationErrors.length > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl mx-auto px-4">
          <div className="bg-red-50 rounded-lg p-4 shadow-lg border border-red-100">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">Please fix the following errors:</h3>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="fixed bottom-16 left-0 right-0 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-end">
            <button
              onClick={handleSubmitClick}
              className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Send className="w-4 h-4" />
              <span className="font-medium">Submit Form</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Form</h3>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments (optional)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitDialog(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 