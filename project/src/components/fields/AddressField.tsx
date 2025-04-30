import React, { useState, useEffect } from 'react';
import type { Field } from '../../types/form';
import { cn } from '../../lib/utils';
import { MapPin } from 'lucide-react';

interface AddressFieldProps {
  field: Field;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface AddressValue {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export const AddressField: React.FC<AddressFieldProps> = ({ field, onChange, disabled = false }) => {
  const [address, setAddress] = useState<AddressValue>(() => {
    try {
      return field.value ? JSON.parse(field.value) : { street: '', city: '', state: '', zipCode: '' };
    } catch {
      return { street: '', city: '', state: '', zipCode: '' };
    }
  });

  useEffect(() => {
    if (field.value) {
      try {
        const parsedValue = JSON.parse(field.value);
        if (
          typeof parsedValue === 'object' &&
          'street' in parsedValue &&
          'city' in parsedValue &&
          'state' in parsedValue &&
          'zipCode' in parsedValue
        ) {
          setAddress(parsedValue);
        }
      } catch {
        // Invalid JSON, keep current state
      }
    }
  }, [field.value]);

  const handleChange = (key: keyof AddressValue) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = { ...address, [key]: e.target.value };
    setAddress(newAddress);
    onChange(JSON.stringify(newAddress));
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="w-4 h-4 text-gray-500" />
        </div>
        <input
          type="text"
          value={address.street}
          onChange={handleChange('street')}
          placeholder="Street Address"
          className={cn(
            "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            disabled && "bg-gray-50 cursor-not-allowed"
          )}
          disabled={disabled}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={address.city}
          onChange={handleChange('city')}
          placeholder="City"
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            disabled && "bg-gray-50 cursor-not-allowed"
          )}
          disabled={disabled}
        />
        
        <input
          type="text"
          value={address.state}
          onChange={handleChange('state')}
          placeholder="State"
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            disabled && "bg-gray-50 cursor-not-allowed"
          )}
          disabled={disabled}
        />
      </div>
      
      <input
        type="text"
        value={address.zipCode}
        onChange={handleChange('zipCode')}
        placeholder="ZIP Code"
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          disabled && "bg-gray-50 cursor-not-allowed"
        )}
        disabled={disabled}
      />
    </div>
  );
}; 