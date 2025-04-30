import React from 'react';
import { 
  Type, 
  Calendar, 
  Mail, 
  Phone, 
  CheckSquare, 
  List, 
  Upload, 
  MapPin,
  Table,
  Calculator,
  Plus
} from 'lucide-react';
import type { FieldType } from '../../types/form';

interface FieldSelectorProps {
  onSelect: (type: FieldType, isMultiSelect?: boolean) => void;
}

const fieldTypes: { type: FieldType; icon: React.ElementType; label: string; hasMultiSelect?: boolean }[] = [
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'date', icon: Calendar, label: 'Date' },
  { type: 'email', icon: Mail, label: 'Email' },
  { type: 'phone', icon: Phone, label: 'Phone' },
  { type: 'checkbox', icon: CheckSquare, label: 'Single Checkbox' },
  { type: 'checkbox', icon: CheckSquare, label: 'Multi Checkbox', hasMultiSelect: true },
  { type: 'select', icon: List, label: 'Dropdown' },
  { type: 'file', icon: Upload, label: 'File Upload' },
  { type: 'address', icon: MapPin, label: 'Address' },
  { type: 'table', icon: Table, label: 'Table' },
  { type: 'calculated', icon: Calculator, label: 'Calculated Field' }
];

export const FieldSelector: React.FC<FieldSelectorProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-3 gap-3 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
      {fieldTypes.map(({ type, icon: Icon, label, hasMultiSelect }, index) => (
        <button
          key={`${type}-${label}-${index}`}
          onClick={() => onSelect(type, hasMultiSelect)}
          className="flex flex-col items-center gap-2.5 p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200"
        >
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </button>
      ))}
    </div>
  );
};