import { useState, useEffect } from 'react';
import { Check, Edit2, Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MultiCheckboxFieldProps {
  field: {
    id: string;
    type: string;
    label: string;
    title?: string;
    options?: string[];
    value?: boolean[];
    required?: boolean;
  };
  onChange: (value: boolean[]) => void;
  disabled?: boolean;
  isEditMode?: boolean;
  onOptionsChange?: (options: string[]) => void;
  onTitleChange?: (value: string) => void;
}

export const MultiCheckboxField = ({
  field,
  onChange,
  disabled = false,
  isEditMode = false,
  onOptionsChange,
  onTitleChange,
}: MultiCheckboxFieldProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(field.title || field.label);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [editingOptionValue, setEditingOptionValue] = useState('');

  const options = field.options || [];
  const values = Array.isArray(field.value) 
    ? field.value 
    : new Array(options.length).fill(false);

  useEffect(() => {
    setTitleValue(field.title || field.label);
  }, [field.title, field.label]);

  useEffect(() => {
    // Initialize values when options change
    if (!isEditMode && (!field.value || field.value.length !== options.length)) {
      onChange(new Array(options.length).fill(false));
    }
  }, [options.length, field.value, isEditMode, onChange]);

  const handleTitleSave = () => {
    if (onTitleChange && titleValue.trim()) {
      onTitleChange(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitleValue(field.title || field.label);
      setIsEditingTitle(false);
    }
  };

  const handleOptionSave = (index: number) => {
    if (onOptionsChange && editingOptionValue.trim()) {
      const newOptions = [...options];
      newOptions[index] = editingOptionValue.trim();
      onOptionsChange(newOptions);
    }
    setEditingOptionIndex(null);
    setEditingOptionValue('');
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handleOptionSave(index);
    } else if (e.key === 'Escape') {
      setEditingOptionIndex(null);
      setEditingOptionValue('');
    }
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    if (!disabled) {
      const newValues = [...values];
      newValues[index] = checked;
      onChange(newValues);
    }
  };

  const handleAddOption = () => {
    if (onOptionsChange) {
      const newOptions = [...options, 'New Option'];
      onOptionsChange(newOptions);
      onChange([...values, false]);
      // Start editing the new option immediately
      setEditingOptionIndex(newOptions.length - 1);
      setEditingOptionValue('New Option');
    }
  };

  const handleRemoveOption = (index: number) => {
    if (onOptionsChange) {
      const newOptions = options.filter((_, i) => i !== index);
      const newValues = values.filter((_, i) => i !== index);
      onOptionsChange(newOptions);
      onChange(newValues);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title Section */}
      <div className="group flex items-center gap-2">
        {isEditMode && isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleSave}
              placeholder="Enter field title..."
              className="input-field flex-1"
              autoFocus
            />
            <button
              onClick={handleTitleSave}
              className="icon-button"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <h3 className={cn(
              "text-sm font-semibold text-gray-900",
              disabled && "opacity-50"
            )}>
              {field.title || field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {isEditMode && (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="ml-2 opacity-0 group-hover:opacity-100 icon-button inline-flex"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </h3>
          </div>
        )}
      </div>

      {/* Checkboxes Section */}
      <div className="space-y-3 pl-1">
        {options.map((option, index) => (
          <div key={index} className="group flex items-center gap-3">
            <input
              type="checkbox"
              id={`${field.id}-${index}`}
              checked={values[index] || false}
              onChange={(e) => handleCheckboxChange(index, e.target.checked)}
              disabled={disabled}
              className={cn(
                "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600",
                disabled && "cursor-not-allowed opacity-50"
              )}
            />
            <div className="flex-1 flex items-center gap-2">
              {isEditMode && editingOptionIndex === index ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editingOptionValue}
                    onChange={(e) => setEditingOptionValue(e.target.value)}
                    onKeyDown={(e) => handleOptionKeyDown(e, index)}
                    onBlur={() => handleOptionSave(index)}
                    placeholder="Enter option label..."
                    className="input-field flex-1"
                    autoFocus
                  />
                  <button
                    onClick={() => handleOptionSave(index)}
                    className="icon-button"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between flex-1">
                  <label
                    htmlFor={`${field.id}-${index}`}
                    className={cn(
                      "text-sm font-medium text-gray-900",
                      disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {option}
                  </label>
                  {isEditMode && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditingOptionIndex(index);
                          setEditingOptionValue(option);
                        }}
                        className="icon-button"
                        title="Edit option"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="icon-button text-red-500"
                        title="Remove option"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Option Button */}
        {isEditMode && (
          <button
            onClick={handleAddOption}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-4"
          >
            <Plus className="w-4 h-4" />
            <span>Add Option</span>
          </button>
        )}
      </div>
    </div>
  );
}; 