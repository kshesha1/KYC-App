import React, { useState } from 'react';
import { Trash2, Edit2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
}

interface TableRow {
  id: string;
  cells: {
    [columnId: string]: any;
  };
}

interface TableData {
  columns: TableColumn[];
  rows: TableRow[];
}

interface TableFieldProps {
  field: {
    id: string;
    label: string;
    placeholder?: string;
    value?: TableData;
    required?: boolean;
  };
  onChange: (value: any) => void;
  disabled?: boolean;
  isEditMode?: boolean;
}

export const TableField: React.FC<TableFieldProps> = ({
  field,
  onChange,
  disabled = false,
  isEditMode = false,
}) => {
  const tableData: TableData = field.value || { columns: [], rows: [] };
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState<'text' | 'number' | 'select'>('text');
  const [showColumnOptions, setShowColumnOptions] = useState(false);
  const [columnOptions, setColumnOptions] = useState<string[]>([]);
  const [newColumnOption, setNewColumnOption] = useState('');

  // For edit mode (form builder)
  const [isEditing, setIsEditing] = useState(false);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const addColumn = () => {
    if (!columnName.trim()) return;
    
    const newColumn: TableColumn = {
      id: generateId(),
      name: columnName,
      type: columnType,
    };
    
    if (columnType === 'select' && columnOptions.length > 0) {
      newColumn.options = [...columnOptions];
    }
    
    const updatedData = {
      ...tableData,
      columns: [...tableData.columns, newColumn],
      rows: tableData.rows.map(row => ({
        ...row,
        cells: {
          ...row.cells,
          [newColumn.id]: '',
        },
      })),
    };
    
    onChange(updatedData);
    setColumnName('');
    setColumnType('text');
    setColumnOptions([]);
    setShowColumnOptions(false);
  };

  const updateColumn = (columnId: string) => {
    if (!columnName.trim()) return;
    
    const updatedColumns = tableData.columns.map(column => {
      if (column.id === columnId) {
        const updatedColumn = {
          ...column,
          name: columnName,
          type: columnType,
        };
        
        if (columnType === 'select') {
          updatedColumn.options = [...columnOptions];
        } else {
          delete updatedColumn.options;
        }
        
        return updatedColumn;
      }
      return column;
    });
    
    onChange({
      ...tableData,
      columns: updatedColumns,
    });
    
    setEditingColumn(null);
    setColumnName('');
    setColumnType('text');
    setColumnOptions([]);
    setShowColumnOptions(false);
  };

  const removeColumn = (columnId: string) => {
    const updatedColumns = tableData.columns.filter(col => col.id !== columnId);
    const updatedRows = tableData.rows.map(row => {
      const updatedCells = { ...row.cells };
      delete updatedCells[columnId];
      return {
        ...row,
        cells: updatedCells,
      };
    });
    
    onChange({
      columns: updatedColumns,
      rows: updatedRows,
    });
  };

  const addRow = () => {
    const newRow: TableRow = {
      id: generateId(),
      cells: tableData.columns.reduce((cells, column) => {
        cells[column.id] = '';
        return cells;
      }, {} as { [key: string]: any }),
    };
    
    onChange({
      ...tableData,
      rows: [...tableData.rows, newRow],
    });
  };

  const removeRow = (rowId: string) => {
    onChange({
      ...tableData,
      rows: tableData.rows.filter(row => row.id !== rowId),
    });
  };

  const updateCell = (rowId: string, columnId: string, value: any) => {
    const updatedRows = tableData.rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          cells: {
            ...row.cells,
            [columnId]: value,
          },
        };
      }
      return row;
    });
    
    onChange({
      ...tableData,
      rows: updatedRows,
    });
  };

  const startEditingColumn = (column: TableColumn) => {
    setEditingColumn(column.id);
    setColumnName(column.name);
    setColumnType(column.type);
    setColumnOptions(column.options || []);
    setShowColumnOptions(column.type === 'select');
  };

  const addColumnOption = () => {
    if (!newColumnOption.trim()) return;
    setColumnOptions([...columnOptions, newColumnOption]);
    setNewColumnOption('');
  };

  const removeColumnOption = (index: number) => {
    setColumnOptions(columnOptions.filter((_, i) => i !== index));
  };

  const renderCellEditor = (row: TableRow, column: TableColumn) => {
    const value = row.cells[column.id];
    
    switch (column.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-md"
            disabled={disabled}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-md"
            disabled={disabled}
          >
            <option value="">Select...</option>
            {column.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-md"
            disabled={disabled}
          />
        );
    }
  };

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
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isEditing ? 'Done' : 'Configure Table'}
          </button>
        </div>
        
        {isEditing ? (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium mb-2">Table Columns</h3>
            
            {tableData.columns.length > 0 && (
              <div className="mb-4 border border-gray-200 rounded-md overflow-hidden bg-white">
                {tableData.columns.map((column) => (
                  <div key={column.id} className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
                    <div>
                      <div className="font-medium">{column.name}</div>
                      <div className="text-xs text-gray-500">Type: {column.type}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => startEditingColumn(column)}
                        className="p-1 text-gray-500 hover:text-blue-500"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeColumn(column.id)}
                        className="p-1 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {editingColumn ? (
              <div className="mb-4 p-3 border border-gray-200 rounded-md bg-white">
                <h4 className="text-sm font-medium mb-2">Edit Column</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Column Name</label>
                    <input
                      type="text"
                      value={columnName}
                      onChange={(e) => setColumnName(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md text-sm"
                      placeholder="Enter column name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Column Type</label>
                    <select
                      value={columnType}
                      onChange={(e) => {
                        setColumnType(e.target.value as any);
                        setShowColumnOptions(e.target.value === 'select');
                      }}
                      className="w-full p-2 border border-gray-200 rounded-md text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                    </select>
                  </div>
                  
                  {showColumnOptions && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Options</label>
                      <div className="space-y-2">
                        {columnOptions.map((option, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="text"
                              value={option}
                              readOnly
                              className="flex-1 p-2 border border-gray-200 rounded-md text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeColumnOption(index)}
                              className="ml-2 p-1 text-gray-500 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={newColumnOption}
                            onChange={(e) => setNewColumnOption(e.target.value)}
                            className="flex-1 p-2 border border-gray-200 rounded-md text-sm"
                            placeholder="Add new option"
                          />
                          <button
                            type="button"
                            onClick={addColumnOption}
                            className="ml-2 p-1 text-gray-500 hover:text-blue-500"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingColumn(null);
                        setColumnName('');
                        setColumnType('text');
                        setColumnOptions([]);
                        setShowColumnOptions(false);
                      }}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => updateColumn(editingColumn)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md"
                    >
                      Save Column
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 border border-gray-200 rounded-md bg-white">
                <h4 className="text-sm font-medium mb-2">Add New Column</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Column Name</label>
                    <input
                      type="text"
                      value={columnName}
                      onChange={(e) => setColumnName(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md text-sm"
                      placeholder="Enter column name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Column Type</label>
                    <select
                      value={columnType}
                      onChange={(e) => {
                        setColumnType(e.target.value as any);
                        setShowColumnOptions(e.target.value === 'select');
                      }}
                      className="w-full p-2 border border-gray-200 rounded-md text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                    </select>
                  </div>
                  
                  {showColumnOptions && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Options</label>
                      <div className="space-y-2">
                        {columnOptions.map((option, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="text"
                              value={option}
                              readOnly
                              className="flex-1 p-2 border border-gray-200 rounded-md text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeColumnOption(index)}
                              className="ml-2 p-1 text-gray-500 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={newColumnOption}
                            onChange={(e) => setNewColumnOption(e.target.value)}
                            className="flex-1 p-2 border border-gray-200 rounded-md text-sm"
                            placeholder="Add new option"
                          />
                          <button
                            type="button"
                            onClick={addColumnOption}
                            className="ml-2 p-1 text-gray-500 hover:text-blue-500"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={addColumn}
                    className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md"
                  >
                    Add Column
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center my-4">
              <h3 className="text-sm font-medium">Preview</h3>
            </div>
          </div>
        ) : null}
        
        <div className={cn("rounded-md border border-gray-200 overflow-hidden", { "mt-4": isEditing })}>
          {tableData.columns.length === 0 ? (
            <div className="p-6 text-center bg-gray-50">
              <p className="text-gray-500 text-sm">Configure this table by adding columns</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {tableData.columns.map((column) => (
                        <th
                          key={column.id}
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.name}
                        </th>
                      ))}
                      {isEditing && <th scope="col" className="relative px-3 py-2 w-10"></th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.rows.map((row) => (
                      <tr key={row.id}>
                        {tableData.columns.map((column) => (
                          <td key={column.id} className="px-3 py-2 whitespace-nowrap text-sm">
                            {row.cells[column.id] || '-'}
                          </td>
                        ))}
                        {isEditing && (
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {tableData.rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={tableData.columns.length + (isEditing ? 1 : 0)}
                          className="px-3 py-4 text-sm text-center text-gray-500"
                        >
                          No data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {isEditing && (
                <div className="bg-gray-50 px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={addRow}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Row
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // For form filling mode
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="rounded-md border border-gray-200 overflow-hidden">
        {tableData.columns.length === 0 ? (
          <div className="p-6 text-center bg-gray-50">
            <p className="text-gray-500">No table configuration available</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tableData.columns.map((column) => (
                      <th
                        key={column.id}
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.name}
                      </th>
                    ))}
                    <th scope="col" className="relative px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.rows.map((row, rowIndex) => (
                    <tr key={row.id} className={editingRow === row.id ? 'bg-blue-50' : ''}>
                      {tableData.columns.map((column) => (
                        <td key={column.id} className="px-3 py-2 whitespace-nowrap text-sm">
                          {editingRow === row.id ? (
                            renderCellEditor(row, column)
                          ) : (
                            <div className="py-1">
                              {row.cells[column.id] || '-'}
                            </div>
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                        {editingRow === row.id ? (
                          <button
                            type="button"
                            onClick={() => setEditingRow(null)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Done
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingRow(row.id)}
                            className="text-gray-500 hover:text-blue-500"
                            disabled={disabled}
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 px-3 py-2 flex justify-end">
              <button
                type="button"
                onClick={addRow}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={disabled}
              >
                + Add Row
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 