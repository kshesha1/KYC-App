import React, { useState, useRef, useEffect } from 'react';
import type { Field } from '../../types/form';
import { cn } from '../../lib/utils';
import { Edit2, Check, Plus, Trash2, ListFilter, X, ChevronDown } from 'lucide-react';

interface SelectFieldProps {
  field: Field;
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  isEditMode?: boolean;
  onOptionsChange?: (options: string[]) => void;
  onMultiSelectChange?: (isMultiSelect: boolean) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({ 
  field, 
  onChange, 
  disabled = false,
  isEditMode = false,
  onOptionsChange,
  onMultiSelectChange
}) => {
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [editingOptionValue, setEditingOptionValue] = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!field.options) return null;

  const selectedValues = field.isMultiSelect 
    ? (Array.isArray(field.value) ? field.value : [])
    : (field.value ? [field.value] : []);

  const handleOptionSelect = (option: string) => {
    if (field.isMultiSelect) {
      const currentValues = Array.isArray(field.value) ? field.value : [];
      const newValues = currentValues.includes(option)
        ? currentValues.filter((v: string) => v !== option)
        : [...currentValues, option];
      onChange(newValues);
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    if (field.isMultiSelect) {
      const currentValues = Array.isArray(field.value) ? field.value : [];
      onChange(currentValues.filter((v: string) => v !== valueToRemove));
    } else {
      onChange('');
    }
  };

  const handleOptionEdit = (index: number) => {
    setEditingOptionIndex(index);
    setEditingOptionValue(field.options![index]);
  };

  const handleOptionSave = () => {
    if (editingOptionIndex !== null && editingOptionValue.trim() && onOptionsChange) {
      const newOptions = [...field.options!];
      newOptions[editingOptionIndex] = editingOptionValue.trim();
      onOptionsChange(newOptions);
      setEditingOptionIndex(null);
      setEditingOptionValue('');
    }
  };

  const handleOptionDelete = (index: number) => {
    if (onOptionsChange) {
      const newOptions = field.options!.filter((_: string, i: number) => i !== index);
      onOptionsChange(newOptions);
    }
  };

  const handleAddOption = () => {
    if (newOptionValue.trim() && onOptionsChange) {
      const newOptions = [...field.options!, newOptionValue.trim()];
      onOptionsChange(newOptions);
      setNewOptionValue('');
      setIsAddingOption(false);
    }
  };

  const handleMultiSelectToggle = () => {
    if (onMultiSelectChange) {
      onMultiSelectChange(!field.isMultiSelect);
      // Reset value when switching between single and multi-select
      onChange(field.isMultiSelect ? '' : []);
    }
  };

  const renderSelectedValues = () => (
    <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-1">
      {selectedValues.length === 0 && (
        <span className="text-gray-400 px-2 py-1">
          {field.placeholder || `Select ${field.isMultiSelect ? 'options' : 'an option'}...`}
        </span>
      )}
      {selectedValues.map((value: string) => (
        <span
          key={value}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm",
            "bg-blue-50 text-blue-700 border border-blue-200",
            disabled ? "opacity-50" : "hover:bg-blue-100"
          )}
        >
          {value}
          {!disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveValue(value);
              }}
              className="hover:text-blue-900"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}
    </div>
  );

  const renderDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full border rounded-md bg-white",
          "cursor-pointer select-none",
          disabled && "bg-gray-50 cursor-not-allowed",
          isOpen ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300 hover:border-gray-400"
        )}
      >
        {renderSelectedValues()}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <ChevronDown className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {field.options.map((option: string) => (
            <div
              key={option}
              onClick={() => handleOptionSelect(option)}
              className={cn(
                "px-4 py-2 cursor-pointer flex items-center gap-2",
                "hover:bg-gray-50",
                selectedValues.includes(option) && "bg-blue-50 text-blue-700"
              )}
            >
              {option}
              {selectedValues.includes(option) && (
                <Check className="w-4 h-4 ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEditableOptions = () => (
    <div className="space-y-2 mt-3">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handleMultiSelectToggle}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-sm",
            field.isMultiSelect 
              ? "bg-blue-50 text-blue-600" 
              : "bg-gray-50 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          )}
          title={field.isMultiSelect ? "Switch to Single Select" : "Switch to Multi Select"}
        >
          <ListFilter className="w-4 h-4" />
          <span>{field.isMultiSelect ? "Multi Select" : "Single Select"}</span>
        </button>
      </div>

      {field.options.map((option: string, index: number) => (
        <div key={index} className="flex items-center gap-2 group">
          {editingOptionIndex === index ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editingOptionValue}
                onChange={(e) => setEditingOptionValue(e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleOptionSave();
                  if (e.key === 'Escape') {
                    setEditingOptionIndex(null);
                    setEditingOptionValue('');
                  }
                }}
              />
              <button
                onClick={handleOptionSave}
                className="p-1 text-blue-600 hover:text-blue-700"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <span className="flex-1">{option}</span>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <button
                  onClick={() => handleOptionEdit(index)}
                  className="p-1 text-gray-600 hover:text-blue-600"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOptionDelete(index)}
                  className="p-1 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
      
      {isAddingOption ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newOptionValue}
            onChange={(e) => setNewOptionValue(e.target.value)}
            placeholder="Enter new option..."
            className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddOption();
              if (e.key === 'Escape') {
                setIsAddingOption(false);
                setNewOptionValue('');
              }
            }}
          />
          <button
            onClick={handleAddOption}
            className="p-1 text-blue-600 hover:text-blue-700"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingOption(true)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Option
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      {renderDropdown()}
      {isEditMode && renderEditableOptions()}
    </div>
  );
};