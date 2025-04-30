import React, { useState } from 'react';
import { useSubmissionStore } from '../store/submissionStore';
import { Clock, FileText, Edit2, CheckCircle2, AlertCircle, Pencil, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface EditableNameProps {
  name: string;
  onSave: (newName: string) => void;
  onCancel: () => void;
}

const EditableName: React.FC<EditableNameProps> = ({ name, onSave, onCancel }) => {
  const [value, setValue] = useState(name);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(value);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="px-1 py-0.5 text-sm border border-gray-300 rounded w-full"
        autoFocus
      />
      <button
        onClick={() => onSave(value)}
        className="p-1 hover:bg-green-50 text-green-600 rounded"
      >
        <Check className="w-3 h-3" />
      </button>
      <button
        onClick={onCancel}
        className="p-1 hover:bg-red-50 text-red-600 rounded"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export const SubmissionHistory: React.FC = () => {
  const { submissions, currentSubmission, addSubmission, loadSubmission, updateSubmissionName } = useSubmissionStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleNewSubmission = () => {
    addSubmission();
  };

  const handleLoadSubmission = (submissionId: string) => {
    loadSubmission(submissionId);
  };

  const handleStartEditing = (e: React.MouseEvent, submissionId: string) => {
    e.stopPropagation();
    setEditingId(submissionId);
  };

  const handleSaveName = (submissionId: string, newName: string) => {
    updateSubmissionName(submissionId, newName);
    setEditingId(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit2 className="w-4 h-4" />;
      case 'submitted':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in_review':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'submitted':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in_review':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Group submissions by status
  const groupedSubmissions = submissions.reduce((acc, submission) => {
    const status = submission.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(submission);
    return acc;
  }, {} as Record<string, typeof submissions>);

  // Order of status display
  const statusOrder = ['draft', 'submitted', 'in_review', 'approved', 'rejected'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end p-4">
        <button
          onClick={handleNewSubmission}
          className="p-2 hover:bg-blue-50 rounded-md text-blue-600 transition-colors"
          title="New Submission"
        >
          <FileText className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No submissions yet</p>
            <button
              onClick={handleNewSubmission}
              className="mt-2 inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Create New Submission</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {statusOrder.map(status => {
              const statusSubmissions = groupedSubmissions[status];
              if (!statusSubmissions?.length) return null;

              return (
                <div key={status} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {status === 'draft' ? 'Saved Drafts' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </h3>
                  {statusSubmissions
                    .sort((a, b) => b.lastModified - a.lastModified)
                    .map((submission) => (
                      <button
                        key={submission.id}
                        onClick={() => handleLoadSubmission(submission.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border text-sm transition-colors",
                          getStatusColor(submission.status),
                          currentSubmission?.id === submission.id && "ring-2 ring-blue-500",
                          "hover:bg-opacity-80"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getStatusIcon(submission.status)}
                            <div className="flex-1 min-w-0">
                              {editingId === submission.id ? (
                                <EditableName
                                  name={submission.name}
                                  onSave={(newName) => handleSaveName(submission.id, newName)}
                                  onCancel={() => setEditingId(null)}
                                />
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium truncate">
                                    {submission.name}
                                  </span>
                                  {submission.status === 'draft' && (
                                    <button
                                      onClick={(e) => handleStartEditing(e, submission.id)}
                                      className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end text-xs opacity-70">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(submission.lastModified)}
                            </div>
                            <div className="text-xs opacity-70">
                              v{submission.version}
                            </div>
                          </div>
                        </div>
                        {submission.comments && (
                          <p className="text-xs mt-2 opacity-70 line-clamp-2">{submission.comments}</p>
                        )}
                      </button>
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 