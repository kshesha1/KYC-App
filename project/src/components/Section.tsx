import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Grip, X, Plus, Edit2, Check } from 'lucide-react';
import { useFormStore } from '../store/formStore';
import { cn } from '../lib/utils';
import type { Section as SectionType, Field, FieldType } from '../types/form';
import { FieldRenderer } from './fields/FieldRenderer';
import { FieldSelector } from './fields/FieldSelector';

interface SectionProps {
  section: SectionType;
}

export const Section: React.FC<SectionProps> = ({ section }) => {
  const { toggleSectionExpand, removeSection, addField, updateSection, isEditMode, reorderField } = useFormStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedField, setDraggedField] = useState<{ id: string; fromIdx: number } | null>(null);
  const [showFieldSelectorAt, setShowFieldSelectorAt] = useState<number | null>(null);
  const [showEndFieldSelector, setShowEndFieldSelector] = useState(false);

  useEffect(() => {
    setTitleValue(section.title);
  }, [section.title]);

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      updateSection(section.id, { title: titleValue.trim() });
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setTitleValue(section.title);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setIsEditingTitle(true);
  };

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleFieldDragStart = (fieldId: string, idx: number) => {
    setDraggedField({ id: fieldId, fromIdx: idx });
  };
  const handleFieldDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleFieldDrop = (toIdx: number) => {
    if (draggedField && draggedField.fromIdx !== toIdx) {
      reorderField(section.id, draggedField.id, toIdx);
    }
    setDraggedField(null);
  };
  const handleFieldDragEnd = () => {
    setDraggedField(null);
  };
  const handleAddFieldAt = (idx: number, type: FieldType, isMultiSelect?: boolean) => {
    const fieldType = isMultiSelect && type === 'checkbox' ? 'multi_checkbox' : type;
    const newField = {
      type: fieldType,
      label: `New ${fieldType.replace('_', ' ')} field`,
      required: false,
      placeholder: `Enter ${type}...`,
      options: (type === 'select' || fieldType === 'multi_checkbox') ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      value: fieldType === 'multi_checkbox' ? [false, false, false] : undefined,
      id: undefined, // will be set in store
    };
    useFormStore.getState().addFieldAt(section.id, idx, newField);
    setShowFieldSelectorAt(null);
    setShowEndFieldSelector(false);
  };

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      <div
        className={cn(
          "flex items-center p-5 select-none group",
          section.isExpanded && "border-b border-gray-200"
        )}
      >
        {isEditMode && (
          <div className="mr-3 cursor-grab opacity-60 hover:opacity-100 transition-opacity">
            <Grip className="w-4 h-4 text-dxc-purple/60" />
          </div>
        )}
        {isEditMode && isEditingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleTitleSave}
              className="flex-1 px-3 py-1.5 text-lg font-medium border border-dxc-purple/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dxc-purple focus:border-transparent bg-dxc-purple/5"
            />
          </div>
        ) : (
          <div 
            className="flex-1 flex items-center"
            onClick={() => toggleSectionExpand(section.id)}
          >
            <h3 
              className={cn(
                "text-lg font-medium text-gray-900",
                isEditMode && "cursor-pointer hover:text-dxc-purple transition-colors"
              )}
              onDoubleClick={handleDoubleClick}
            >
              {section.title}
              {isEditMode && (
                <span className="ml-2 text-sm font-normal text-dxc-purple/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Double-click to edit
                </span>
              )}
            </h3>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          {isEditMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSection(section.id);
              }}
              className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => toggleSectionExpand(section.id)}
            className="p-1.5 hover:bg-dxc-purple/5 rounded-lg transition-all duration-200"
          >
            {section.isExpanded ? (
              <ChevronUp className="w-4 h-4 text-dxc-purple" />
            ) : (
              <ChevronDown className="w-4 h-4 text-dxc-purple" />
            )}
          </button>
        </div>
      </div>
      
      {section.isExpanded && (
        <div className="p-5 space-y-4">
          {section.fields.map((field, idx) => (
            <div
              key={field.id}
              className="group/field relative flex items-center"
              draggable={isEditMode}
              onDragStart={() => handleFieldDragStart(field.id, idx)}
              onDragOver={handleFieldDragOver}
              onDrop={() => handleFieldDrop(idx)}
              onDragEnd={handleFieldDragEnd}
              style={{ opacity: draggedField?.id === field.id ? 0.5 : 1 }}
            >
              {isEditMode && (
                <div
                  className="mr-2 cursor-grab opacity-60 hover:opacity-100 transition-opacity"
                  title="Drag to reorder field"
                >
                  <Grip className="w-4 h-4 text-dxc-purple/60" />
                </div>
              )}
              <div className="flex-1">
                <FieldRenderer field={field} sectionId={section.id} />
              </div>
              {/* Minimal '+' button only between fields, not after the last field */}
              {isEditMode && idx < section.fields.length - 1 && (
                <button
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 bg-white border border-gray-200 rounded-full p-1 opacity-0 group-hover/field:opacity-100 hover:opacity-100 transition-opacity"
                  style={{ pointerEvents: 'auto' }}
                  onClick={() => setShowFieldSelectorAt(idx + 1)}
                  tabIndex={-1}
                  title="Add field here"
                >
                  <Plus className="w-4 h-4 text-dxc-purple" />
                </button>
              )}
              {showFieldSelectorAt === idx + 1 && (
                <div className="absolute left-1/2 -translate-x-1/2 z-20 mt-2">
                  <div className="relative">
                    <button
                      className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => setShowFieldSelectorAt(null)}
                      tabIndex={-1}
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <FieldSelector onSelect={(type, isMulti) => handleAddFieldAt(idx + 1, type, isMulti)} />
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* Always show Add Field at end */}
          {isEditMode && (
            <div className="mt-6">
              {showEndFieldSelector ? (
                <div className="relative">
                  <button
                    className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => setShowEndFieldSelector(false)}
                    tabIndex={-1}
                    title="Cancel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <FieldSelector onSelect={(type, isMulti) => handleAddFieldAt(section.fields.length, type, isMulti)} />
                </div>
              ) : (
                <button
                  onClick={() => setShowEndFieldSelector(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 hover:border-dxc-purple/20 hover:bg-dxc-purple/5 transition-all duration-200 text-dxc-purple"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Field</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};