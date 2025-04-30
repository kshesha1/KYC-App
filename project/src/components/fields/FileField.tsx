import React from 'react';
import type { Field } from '../../types/form';
import { cn } from '../../lib/utils';

interface FileFieldProps {
  field: Field;
  onChange: (value: File | null) => void;
  disabled?: boolean;
}

export const FileField: React.FC<FileFieldProps> = ({
  field,
  onChange,
  disabled = false,
}) => {
  return (
    <input
      type="file"
      onChange={(e) => onChange(e.target.files?.[0] || null)}
      disabled={disabled}
      className={cn(
        "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4",
        "file:rounded-md file:border-0 file:text-sm file:font-semibold",
        "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    />
  );
};