import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { VisibilityCondition, SingleCondition, Section, Field } from "../types/form";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function evaluateSingleCondition(
  condition: SingleCondition,
  sections: Section[]
): boolean {
  const { sourceFieldId, operator, value } = condition;
  const sourceField = findFieldById(sections, sourceFieldId);
  
  if (!sourceField) return true;
  
  const sourceValue = sourceField.value;

  switch (operator) {
    case 'equals':
      return sourceValue === value;
    case 'not_equals':
      return sourceValue !== value;
    case 'contains':
      return String(sourceValue).includes(String(value));
    case 'not_contains':
      return !String(sourceValue).includes(String(value));
    case 'greater_than':
      return Number(sourceValue) > Number(value);
    case 'less_than':
      return Number(sourceValue) < Number(value);
    case 'is_empty':
      return !sourceValue || sourceValue.length === 0;
    case 'is_not_empty':
      return sourceValue && sourceValue.length > 0;
    case 'starts_with':
      return String(sourceValue).startsWith(String(value));
    case 'ends_with':
      return String(sourceValue).endsWith(String(value));
    default:
      return true;
  }
}

export function evaluateCondition(
  condition: VisibilityCondition | undefined,
  sections: Section[]
): boolean {
  if (!condition || !condition.conditions || condition.conditions.length === 0) return true;

  const { conditions, logicalOperator } = condition;

  if (logicalOperator === 'and') {
    return conditions.every(cond => evaluateSingleCondition(cond, sections));
  } else {
    return conditions.some(cond => evaluateSingleCondition(cond, sections));
  }
}

export function findFieldById(sections: Section[], fieldId: string): Field | undefined {
  for (const section of sections) {
    const field = section.fields.find(f => f.id === fieldId);
    if (field) return field;
  }
  return undefined;
}