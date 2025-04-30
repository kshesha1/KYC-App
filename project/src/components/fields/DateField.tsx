import React from 'react';
import type { Field } from '../../types/form';
import { cn } from '../../lib/utils';

interface DateFieldProps {
  field: Field;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const DateField: React.FC<DateFieldProps> = ({ field, onChange, disabled = false }) => {
  // Format the date value to YYYY-MM-DD for the input
  const formatDateForInput = (value: any) => {
    if (!value) return '';
    try {
      // Handle both date string formats and timestamps
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (date) {
      // Convert to ISO string but keep only the date part
      const formattedDate = new Date(date).toISOString().split('T')[0];
      onChange(formattedDate);
    } else {
      onChange('');
    }
  };

  return (
    <div className="relative">
      <input
        type="date"
        value={formatDateForInput(field.value)}
        onChange={handleChange}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          disabled && "bg-gray-50 cursor-not-allowed",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
          "[&::-webkit-calendar-picker-indicator]:opacity-70",
          "[&::-webkit-calendar-picker-indicator]:hover:opacity-100"
        )}
        required={field.required}
        disabled={disabled}
        min="1900-01-01"
        max="2100-12-31"
      />
    </div>
  );
};