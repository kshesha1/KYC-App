import React, { useState } from 'react';
import { useFormStore } from '../store/formStore';
import { Clock, Save, RotateCcw } from 'lucide-react';

export const VersionHistory: React.FC = () => {
  const { versions, currentVersion, isDirty, saveVersion, loadVersion, discardChanges } = useFormStore();
  const [description, setDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSave = () => {
    if (description.trim()) {
      saveVersion(description.trim());
      setDescription('');
      setShowSaveDialog(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="h-full flex flex-col">
      {isDirty && (
        <div className="flex justify-end gap-2 px-4 py-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="p-1 hover:bg-blue-50 rounded-full text-blue-600 transition-colors"
            title="Save Version"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            onClick={discardChanges}
            className="p-1 hover:bg-red-50 rounded-full text-red-600 transition-colors"
            title="Discard Changes"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      )}

      {showSaveDialog && (
        <div className="mx-4 mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Save Version</h3>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Version description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowSaveDialog(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!description.trim()}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4">
        {versions.length === 0 ? (
          <p className="text-gray-500 text-sm">No versions saved yet</p>
        ) : (
          <div className="space-y-2">
            {versions
              .slice()
              .reverse()
              .map((version) => (
                <button
                  key={version.id}
                  onClick={() => loadVersion(version.id)}
                  className={`w-full text-left p-3 rounded-lg text-sm ${
                    version.id === currentVersion
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="font-medium text-gray-800 mb-1">
                    {version.description}
                  </div>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(version.timestamp)}
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}; 