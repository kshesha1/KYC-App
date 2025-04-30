import React, { useState } from 'react';
import { Calculator, PlusCircle, X, Edit2, ArrowDown, PlusSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Field, Section, Operator, SingleCondition, LogicalOperator } from '../../types/form';
import { useFormStore } from '../../store/formStore';

// Expression type to represent a calculation
export interface Expression {
  type: 'field' | 'operator' | 'number';
  value: string;
}

export interface ConditionalFormula {
  condition: {
    sourceFieldId: string;
    operator: Operator;
    value: string;
  };
  expressions: Expression[];
}

export interface CalculationFormula {
  expressions: Expression[]; // Default formula if no conditions match
  conditionalFormulas?: ConditionalFormula[];
  displayFormat?: string; // optional format like "$0.00" or "0.00%"
}

interface CalculatedFieldProps {
  field: {
    id: string;
    label: string;
    placeholder?: string;
    value?: any;
    required?: boolean;
    formula?: CalculationFormula;
  };
  onChange: (value: any) => void;
  disabled?: boolean;
  isEditMode?: boolean;
  sourceFields?: Field[];
  sectionId: string;
  onFormulaChange?: (formula: CalculationFormula) => void;
}

// Available operators for conditions
const OPERATORS: { value: Operator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
];

export const CalculatedField: React.FC<CalculatedFieldProps> = ({
  field,
  onChange,
  disabled = false,
  isEditMode = false,
  sourceFields = [],
  sectionId,
  onFormulaChange,
}) => {
  const [editingFormula, setEditingFormula] = useState(false);
  const [expressions, setExpressions] = useState<Expression[]>(field.formula?.expressions || []);
  const [conditionalFormulas, setConditionalFormulas] = useState<ConditionalFormula[]>(
    field.formula?.conditionalFormulas || []
  );
  const [displayFormat, setDisplayFormat] = useState<string>(field.formula?.displayFormat || '');
  const [activeFormulaIndex, setActiveFormulaIndex] = useState<number>(-1);
  const { sections } = useFormStore();

  // Check if condition is met based on field values
  const evaluateCondition = (
    condition: ConditionalFormula['condition'],
    fieldValues: Record<string, any>
  ): boolean => {
    const { sourceFieldId, operator, value } = condition;
    const fieldValue = fieldValues[sourceFieldId];
    
    if (fieldValue === undefined) return false;
    
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return String(fieldValue).includes(value);
      case 'not_contains':
        return !String(fieldValue).includes(value);
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'is_empty':
        return !fieldValue || fieldValue.length === 0;
      case 'is_not_empty':
        return fieldValue && fieldValue.length > 0;
      case 'starts_with':
        return String(fieldValue).startsWith(value);
      case 'ends_with':
        return String(fieldValue).endsWith(value);
      default:
        return false;
    }
  };

  // Function to calculate the result based on the formula and field values
  const calculateResult = (formula: Expression[], fieldValues: Record<string, any>): string => {
    if (!formula || formula.length === 0) return 'No formula defined';

    // Build calculation string
    let calculationString = '';
    formula.forEach(expr => {
      if (expr.type === 'field') {
        // Get the field value
        const fieldValue = fieldValues[expr.value] || 0;
        calculationString += fieldValue;
      } else if (expr.type === 'operator') {
        calculationString += expr.value;
      } else if (expr.type === 'number') {
        calculationString += expr.value;
      }
    });

    try {
      // Using Function instead of eval for better security
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${calculationString})`)();
      
      // Apply formatting if defined
      if (displayFormat) {
        if (displayFormat.includes('%')) {
          return (result * 100).toFixed(2) + '%';
        } else if (displayFormat.includes('$')) {
          return '$' + result.toFixed(2);
        } else {
          const decimalPlaces = (displayFormat.split('.')[1] || '').length;
          return result.toFixed(decimalPlaces);
        }
      }
      
      return result.toString();
    } catch (error) {
      console.error('Calculation error:', error);
      return 'Error in formula';
    }
  };

  // Helper to extract all available field values
  const getFieldValues = (): Record<string, any> => {
    const fieldValues: Record<string, any> = {};
    
    sections.forEach(section => {
      section.fields.forEach(field => {
        // Skip the current calculated field to avoid circular references
        if (field.id === field.id) return;
        
        // For all fields, store their value
        fieldValues[field.id] = field.value;
      });
    });
    
    return fieldValues;
  };

  const addFieldToFormula = (fieldId: string) => {
    if (activeFormulaIndex === -1) {
      // Adding to default formula
      // If last expression was a field or number, add a + operator
      const lastExpr = expressions[expressions.length - 1];
      if (lastExpr && (lastExpr.type === 'field' || lastExpr.type === 'number')) {
        setExpressions([...expressions, { type: 'operator', value: '+' }, { type: 'field', value: fieldId }]);
      } else {
        setExpressions([...expressions, { type: 'field', value: fieldId }]);
      }
    } else {
      // Adding to conditional formula
      const updatedFormulas = [...conditionalFormulas];
      const formula = updatedFormulas[activeFormulaIndex];
      const lastExpr = formula.expressions[formula.expressions.length - 1];
      
      if (lastExpr && (lastExpr.type === 'field' || lastExpr.type === 'number')) {
        formula.expressions = [...formula.expressions, { type: 'operator', value: '+' }, { type: 'field', value: fieldId }];
      } else {
        formula.expressions = [...formula.expressions, { type: 'field', value: fieldId }];
      }
      
      setConditionalFormulas(updatedFormulas);
    }
  };

  const addOperator = (operator: string) => {
    if (activeFormulaIndex === -1) {
      // Adding to default formula
      // Avoid consecutive operators
      const lastExpr = expressions[expressions.length - 1];
      if (!lastExpr || lastExpr.type === 'operator') return;

      setExpressions([...expressions, { type: 'operator', value: operator }]);
    } else {
      // Adding to conditional formula
      const updatedFormulas = [...conditionalFormulas];
      const formula = updatedFormulas[activeFormulaIndex];
      const lastExpr = formula.expressions[formula.expressions.length - 1];
      
      if (!lastExpr || lastExpr.type === 'operator') return;
      
      formula.expressions = [...formula.expressions, { type: 'operator', value: operator }];
      setConditionalFormulas(updatedFormulas);
    }
  };

  const addNumber = (num: string) => {
    if (activeFormulaIndex === -1) {
      // Adding to default formula
      // If last expression was a field or number, add a + operator
      const lastExpr = expressions[expressions.length - 1];
      if (lastExpr && (lastExpr.type === 'field')) {
        setExpressions([...expressions, { type: 'operator', value: '+' }, { type: 'number', value: num }]);
      } else if (lastExpr && lastExpr.type === 'number') {
        // If last expression was a number, append to it
        const newExpressions = [...expressions];
        newExpressions[newExpressions.length - 1].value += num;
        setExpressions(newExpressions);
      } else {
        setExpressions([...expressions, { type: 'number', value: num }]);
      }
    } else {
      // Adding to conditional formula
      const updatedFormulas = [...conditionalFormulas];
      const formula = updatedFormulas[activeFormulaIndex];
      const lastExpr = formula.expressions[formula.expressions.length - 1];
      
      if (lastExpr && (lastExpr.type === 'field')) {
        formula.expressions = [...formula.expressions, { type: 'operator', value: '+' }, { type: 'number', value: num }];
      } else if (lastExpr && lastExpr.type === 'number') {
        // If last expression was a number, append to it
        formula.expressions[formula.expressions.length - 1].value += num;
      } else {
        formula.expressions = [...formula.expressions, { type: 'number', value: num }];
      }
      
      setConditionalFormulas(updatedFormulas);
    }
  };

  const removeExpression = (index: number) => {
    if (activeFormulaIndex === -1) {
      // Removing from default formula
      const newExpressions = [...expressions];
      newExpressions.splice(index, 1);
      setExpressions(newExpressions);
    } else {
      // Removing from conditional formula
      const updatedFormulas = [...conditionalFormulas];
      const formula = updatedFormulas[activeFormulaIndex];
      formula.expressions.splice(index, 1);
      setConditionalFormulas(updatedFormulas);
    }
  };

  const saveFormula = () => {
    const formula: CalculationFormula = {
      expressions,
      displayFormat,
      conditionalFormulas: conditionalFormulas.length > 0 ? conditionalFormulas : undefined
    };
    if (onFormulaChange) {
      onFormulaChange(formula);
    }
    setEditingFormula(false);
  };

  const clearFormula = () => {
    if (activeFormulaIndex === -1) {
      setExpressions([]);
    } else {
      const updatedFormulas = [...conditionalFormulas];
      updatedFormulas[activeFormulaIndex].expressions = [];
      setConditionalFormulas(updatedFormulas);
    }
  };

  const addConditionalFormula = () => {
    setConditionalFormulas([
      ...conditionalFormulas,
      {
        condition: {
          sourceFieldId: '',
          operator: 'equals',
          value: ''
        },
        expressions: []
      }
    ]);
    // Automatically switch to editing the new condition
    setActiveFormulaIndex(conditionalFormulas.length);
  };

  const removeConditionalFormula = (index: number) => {
    const updatedFormulas = [...conditionalFormulas];
    updatedFormulas.splice(index, 1);
    setConditionalFormulas(updatedFormulas);
    setActiveFormulaIndex(-1); // Return to default formula
  };

  const updateCondition = (index: number, updates: Partial<ConditionalFormula['condition']>) => {
    const updatedFormulas = [...conditionalFormulas];
    updatedFormulas[index].condition = {
      ...updatedFormulas[index].condition,
      ...updates
    };
    setConditionalFormulas(updatedFormulas);
  };

  const displayExpressionValue = (expr: Expression): string => {
    if (expr.type === 'field') {
      const field = sourceFields.find(f => f.id === expr.value);
      return field ? `[${field.label}]` : `[Unknown Field]`;
    }
    return expr.value;
  };

  // Get field name by ID
  const getFieldNameById = (fieldId: string): string => {
    const field = sourceFields.find(f => f.id === fieldId);
    return field ? field.label : 'Unknown Field';
  };

  // Get the current expressions based on active formula index
  const getCurrentExpressions = (): Expression[] => {
    if (activeFormulaIndex === -1) {
      return expressions;
    } else {
      return conditionalFormulas[activeFormulaIndex]?.expressions || [];
    }
  };

  // If in edit mode, show formula editor and preview
  if (isEditMode) {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <button
            type="button"
            onClick={() => setEditingFormula(!editingFormula)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {editingFormula ? 'Done' : 'Configure Formula'}
          </button>
        </div>
        
        {editingFormula ? (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <h3 className="text-sm font-medium mb-3">Configure Calculation Formula</h3>
            
            {/* Formula tabs - Default + Conditional */}
            <div className="flex mb-4 border-b border-gray-200">
              <button
                onClick={() => setActiveFormulaIndex(-1)}
                className={cn(
                  "px-4 py-2 text-sm font-medium",
                  activeFormulaIndex === -1
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Default Formula
              </button>
              
              {conditionalFormulas.map((formula, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFormulaIndex(index)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium",
                    activeFormulaIndex === index
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Condition {index + 1}
                </button>
              ))}
              
              <button
                onClick={addConditionalFormula}
                className="px-3 py-2 ml-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                Add Condition
              </button>
            </div>
            
            {/* Condition configuration if in conditional mode */}
            {activeFormulaIndex !== -1 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-blue-800">If Condition:</h4>
                  <button
                    onClick={() => removeConditionalFormula(activeFormulaIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-2">
                  <select
                    value={conditionalFormulas[activeFormulaIndex].condition.sourceFieldId}
                    onChange={(e) => updateCondition(activeFormulaIndex, { sourceFieldId: e.target.value })}
                    className="p-2 border border-blue-200 rounded-md text-sm bg-white"
                  >
                    <option value="">Select a field...</option>
                    {sourceFields
                      .filter(f => f.id !== field.id) // Prevent self-reference
                      .map(sourceField => (
                        <option key={sourceField.id} value={sourceField.id}>
                          {sourceField.label}
                        </option>
                      ))}
                  </select>
                  
                  <select
                    value={conditionalFormulas[activeFormulaIndex].condition.operator}
                    onChange={(e) => updateCondition(activeFormulaIndex, { operator: e.target.value as Operator })}
                    className="p-2 border border-blue-200 rounded-md text-sm bg-white"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  
                  {!['is_empty', 'is_not_empty'].includes(conditionalFormulas[activeFormulaIndex].condition.operator) && (
                    <input
                      type="text"
                      value={conditionalFormulas[activeFormulaIndex].condition.value}
                      onChange={(e) => updateCondition(activeFormulaIndex, { value: e.target.value })}
                      placeholder="Enter value..."
                      className="p-2 border border-blue-200 rounded-md text-sm bg-white"
                    />
                  )}
                  
                  <div className="flex items-center mt-1 text-blue-800">
                    <ArrowDown className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">Then use this formula:</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {activeFormulaIndex === -1 ? 'Default Formula' : 'Condition Formula'}
              </label>
              <div className="p-3 bg-white border border-gray-200 rounded-md min-h-[40px] flex flex-wrap gap-1 items-center">
                {getCurrentExpressions().length === 0 ? (
                  <span className="text-gray-400 text-sm">Add fields and operators to create formula</span>
                ) : (
                  getCurrentExpressions().map((expr, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "px-2 py-1 rounded-md text-sm flex items-center gap-1",
                        expr.type === 'field' ? "bg-blue-100 text-blue-800" :
                        expr.type === 'operator' ? "bg-gray-200 text-gray-800" :
                        "bg-purple-100 text-purple-800"
                      )}
                    >
                      <span>{displayExpressionValue(expr)}</span>
                      <button 
                        type="button" 
                        onClick={() => removeExpression(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Source Fields</label>
              <div className="grid grid-cols-2 gap-2">
                {sourceFields
                  .filter(f => f.id !== field.id) // Prevent self-reference
                  .map(sourceField => (
                    <button
                      key={sourceField.id}
                      type="button"
                      onClick={() => addFieldToFormula(sourceField.id)}
                      className="text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors truncate"
                    >
                      {sourceField.label}
                    </button>
                  ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Operators</label>
              <div className="grid grid-cols-4 gap-2">
                {['+', '-', '*', '/', '(', ')', '%', '^'].map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => addOperator(op)}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50 font-medium"
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Numbers</label>
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => addNumber(num)}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Display Format (Optional)</label>
              <select
                value={displayFormat}
                onChange={(e) => setDisplayFormat(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">No formatting</option>
                <option value="0">Whole number</option>
                <option value="0.0">One decimal place</option>
                <option value="0.00">Two decimal places</option>
                <option value="$0.00">Currency</option>
                <option value="0.00%">Percentage</option>
              </select>
            </div>
            
            <div className="flex justify-between gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={clearFormula}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                Clear Current Formula
              </button>
              <button
                type="button"
                onClick={saveFormula}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md"
              >
                Save All Formulas
              </button>
            </div>
          </div>
        ) : null}
        
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex items-center gap-1.5 mb-2">
            <Calculator className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Formula Preview:</span>
          </div>
          
          {conditionalFormulas.length > 0 && (
            <div className="mb-3 p-3 bg-white border border-gray-200 rounded-md">
              <h4 className="text-sm font-medium mb-2">Conditional Formulas</h4>
              <div className="space-y-2">
                {conditionalFormulas.map((formula, index) => {
                  const sourceField = sourceFields.find(f => f.id === formula.condition.sourceFieldId);
                  return (
                    <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded border border-gray-100">
                      <span className="font-medium">If {sourceField?.label || 'Unknown Field'} {formula.condition.operator} {formula.condition.value}</span>
                      <span className="block mt-1">
                        Then: {formula.expressions.map((expr, i) => (
                          <span key={i}>
                            {expr.type === 'field' 
                              ? getFieldNameById(expr.value) 
                              : expr.value}
                            {i < formula.expressions.length - 1 ? ' ' : ''}
                          </span>
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="p-3 bg-white border border-gray-200 rounded-md">
            <p className="text-sm font-medium mb-1">Default Formula:</p>
            <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded border border-gray-100">
              {expressions.length === 0 ? (
                <span className="text-gray-400">No default formula defined</span>
              ) : (
                expressions.map((expr, index) => (
                  <span key={index}>
                    {expr.type === 'field' 
                      ? getFieldNameById(expr.value) 
                      : expr.value}
                    {index < expressions.length - 1 ? ' ' : ''}
                  </span>
                ))
              )}
            </div>
            <p className="text-sm font-medium mb-1">Format:</p>
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              {displayFormat ? (
                <span className="text-xs font-medium">{displayFormat}</span>
              ) : (
                <span className="text-xs text-gray-400">No formatting</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // In form filling mode - readonly display
  // Get current field values
  const fieldValues = getFieldValues();
  
  // First check for any matching conditions
  let calculatedValue = 'No formula defined';
  let matchedCondition = false;
  
  if (field.formula) {
    // Check each conditional formula
    if (field.formula.conditionalFormulas) {
      for (const conditionalFormula of field.formula.conditionalFormulas) {
        if (evaluateCondition(conditionalFormula.condition, fieldValues)) {
          calculatedValue = calculateResult(conditionalFormula.expressions, fieldValues);
          matchedCondition = true;
          break; // Stop at first matching condition
        }
      }
    }
    
    // If no condition matched, use the default formula
    if (!matchedCondition && field.formula.expressions.length > 0) {
      calculatedValue = calculateResult(field.formula.expressions, fieldValues);
    }
  }

  // Update parent with calculated value
  React.useEffect(() => {
    onChange(calculatedValue);
  }, [calculatedValue, onChange]);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-center gap-1.5 mb-2">
          <Calculator className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">Calculated Value:</span>
        </div>
        
        <input
          type="text"
          value={calculatedValue}
          readOnly
          className="w-full p-3 border border-gray-200 rounded-md bg-white text-gray-700 cursor-not-allowed focus:outline-none"
        />
        
        {matchedCondition && field.formula?.conditionalFormulas && (
          <div className="mt-2 text-xs text-blue-600">
            <span>* Value calculated using a conditional formula</span>
          </div>
        )}
      </div>
    </div>
  );
}; 