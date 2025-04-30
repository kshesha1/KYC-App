import { useState, useEffect } from 'react';
import { Check, Edit2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CheckboxFieldProps {
  field: {
    id: string;
    type: string;
    label: string;
    title?: string;
    placeholder?: string;
    value?: boolean;
    required?: boolean;
  };
  onChange: (value: boolean) => void;
  disabled?: boolean;
  isEditMode?: boolean;
  onLabelChange?: (value: string) => void;
  onTitleChange?: (value: string) => void;
}

export const CheckboxField = ({
  field,
  onChange,
  disabled = false,
  isEditMode = false,
  onLabelChange,
  onTitleChange,
}: CheckboxFieldProps) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [labelValue, setLabelValue] = useState(field.placeholder || field.label);
  const [titleValue, setTitleValue] = useState(field.title || field.label);

  useEffect(() => {
    setTitleValue(field.title || field.label);
  }, [field.title, field.label]);

  const handleLabelSave = () => {
    if (onLabelChange && labelValue.trim()) {
      onLabelChange(labelValue.trim());
    }
    setIsEditingLabel(false);
  };

  const handleTitleSave = () => {
    if (onTitleChange && titleValue.trim()) {
      onTitleChange(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSave();
    } else if (e.key === 'Escape') {
      setLabelValue(field.placeholder || field.label);
      setIsEditingLabel(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitleValue(field.title || field.label);
      setIsEditingTitle(false);
    }
  };

    return (
    <div className="space-y-3">
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

      {/* Checkbox Section */}
      <div className="group flex items-center gap-3 pl-1">
        <input
          type="checkbox"
          id={field.id}
          checked={field.value || false}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={cn(
            "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600",
            disabled && "cursor-not-allowed opacity-50"
          )}
        />
        <div className="flex-1 flex items-center gap-2">
          {isEditMode && isEditingLabel ? (
            <div className="flex items-center gap-2 flex-1">
          <input
                type="text"
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onKeyDown={handleLabelKeyDown}
                onBlur={handleLabelSave}
                placeholder="Enter checkbox label..."
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
            <label
              htmlFor={field.id}
            className={cn(
                "text-sm font-medium text-gray-900 flex-1",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {field.placeholder || field.label}
              {isEditMode && (
                <button
                  onClick={() => setIsEditingLabel(true)}
                  className="ml-2 opacity-0 group-hover:opacity-100 icon-button inline-flex"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
        </label>
          )}
        </div>
      </div>
    </div>
  );
};