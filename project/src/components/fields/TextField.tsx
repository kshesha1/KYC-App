import React, { useState } from 'react';
import type { Field } from '../../types/form';
import { cn } from '../../lib/utils';
import { Mail, Phone, Type, AlertCircle, Check } from 'lucide-react';

interface TextFieldProps {
  field: Field;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({ field, onChange, disabled = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    return cleaned;
  };

  const validateField = (value: string) => {
    if (!value) {
      setIsValid(true);
      setValidationMessage('');
      return;
    }

    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsValid(emailRegex.test(value));
        setValidationMessage(emailRegex.test(value) ? '' : 'Please enter a valid email address');
        break;
      case 'phone':
        const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
        setIsValid(phoneRegex.test(value));
        setValidationMessage(phoneRegex.test(value) ? '' : 'Please enter a valid phone number');
        break;
      default:
        setIsValid(true);
        setValidationMessage('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (field.type === 'phone') {
      value = formatPhoneNumber(value);
    }
    
    onChange(value);
    validateField(value);
  };

  const getIcon = () => {
    switch (field.type) {
      case 'email':
        return <Mail className="w-4 h-4 text-gray-500" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-gray-500" />;
      default:
        return <Type className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlaceholder = () => {
    switch (field.type) {
      case 'email':
        return field.placeholder || 'email@example.com';
      case 'phone':
        return field.placeholder || '(123) 456-7890';
      default:
        return field.placeholder;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {getIcon()}
        </div>
    <input
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
      value={field.value || ''}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={getPlaceholder()}
          className={cn(
            "w-full pl-10 pr-10 py-2 border rounded-md",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:border-transparent",
            disabled && "bg-gray-50 cursor-not-allowed",
            isValid 
              ? "border-gray-300 focus:ring-blue-500"
              : "border-red-300 focus:ring-red-500",
            field.value && isValid && "border-green-300"
          )}
          required={field.required}
      disabled={disabled}
        />
        {field.value && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {isValid ? (
              field.value && <Check className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      {validationMessage && !isValid && (
        <p className="mt-1 text-sm text-red-500">{validationMessage}</p>
      )}
    </div>
  );
};