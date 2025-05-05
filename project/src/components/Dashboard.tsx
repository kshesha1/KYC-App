import React, { useState } from 'react';
import { PlusCircle, FileText, Edit2, Trash2, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter, Copy } from 'lucide-react';
import { useFinishedFormsStore, FinishedForm, ApprovalStatus } from '../store/finishedFormStore';
import { useUserStore } from '../store/userStore';
import { cn } from '../lib/utils';

interface DashboardProps {
  onCreateNewForm: () => void;
  onEditForm: (formId: string) => void;
  onCreateBasedOn: (formId: string) => void;
  activeRole: 'Maker' | 'Checker';
}

type FilterStatus = 'all' | ApprovalStatus;

export const Dashboard: React.FC<DashboardProps> = ({ onCreateNewForm, onEditForm, onCreateBasedOn, activeRole }) => {
  const { forms, deleteForm, approveForm, rejectForm } = useFinishedFormsStore();
  const { user } = useUserStore();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMaker = user?.role === 'maker';
  const isChecker = user?.role === 'checker';

  const filteredForms = forms.filter(form => {
    if (filterStatus === 'all') {
      return true;
    }
    return form.approvalStatus === filterStatus;
  });

  const handleOpenReview = (formId: string) => {
    if (activeRole !== 'Checker') return;
    setReviewId(formId);
    setReviewComments('');
    setReviewModalOpen(true);
  };

  const handleApprove = () => {
    if (reviewId && user) {
      approveForm(reviewId, user.name, reviewComments);
      setReviewModalOpen(false);
    }
  };

  const handleReject = () => {
    if (reviewId && user) {
      rejectForm(reviewId, user.name, reviewComments);
      setReviewModalOpen(false);
    }
  };

  const renderStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'draft':
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Draft
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600 border border-yellow-100">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Pending
          </div>
        );
      case 'approved':
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Rejected
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-700">
                {filterStatus === 'all' 
                  ? 'All Forms' 
                  : filterStatus === 'pending' 
                    ? 'Pending Review'
                    : filterStatus === 'approved'
                      ? 'Approved Forms'
                      : 'Rejected Forms'
                }
              </h2>
              <span className="ml-3 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {filteredForms.length} {filteredForms.length === 1 ? 'form' : 'forms'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-2 rounded-md border border-gray-200 bg-white">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="text-sm border-none focus:outline-none bg-transparent"
            >
              <option value="all">All Forms</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          {activeRole === 'Maker' && (
            <button
              onClick={onCreateNewForm}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Form</span>
            </button>
          )}
        </div>
      </div>
      
      {forms.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-dashed border-gray-200 bg-gray-50">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-700 mb-1">No Forms Available</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            {isMaker ? 'Create your first form to get started with the KYC application process.' : 'There are no forms awaiting your review at this time.'}
          </p>
          {isMaker && (
            <button
              onClick={onCreateNewForm}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Form</span>
            </button>
          )}
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-dashed border-gray-200 bg-gray-50">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-medium text-gray-700 mb-1">No Matching Forms</h3>
          <p className="text-sm text-gray-500 mb-6">
            No forms match your current filter criteria.
          </p>
          <button
            onClick={() => setFilterStatus('all')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Show All Forms
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <div 
              key={form.id}
              className={cn(
                "bg-white rounded-md border shadow-sm hover:shadow-md transition-shadow p-5",
                form.approvalStatus === 'pending' && "border-yellow-200",
                form.approvalStatus === 'approved' && "border-green-200",
                form.approvalStatus === 'rejected' && "border-red-200"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-medium text-gray-800 truncate" title={form.title}>
                  {form.title}
                </h3>
                <div className="flex gap-2">
                  {activeRole === 'Maker' && (
                    <>
                      {(form.approvalStatus === 'approved' || form.approvalStatus === 'rejected') && (
                        <button
                          onClick={() => onCreateBasedOn(form.id)}
                          className="p-1.5 rounded-full hover:bg-gray-100"
                          title="Create new form based on this one"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteForm(form.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 hover:text-red-500"
                        title="Delete form"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mb-3 flex items-center gap-2">
                {renderStatusBadge(form.approvalStatus)}
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3 text-sm" title={form.description}>
                {form.description}
              </p>
              
              <div className="text-xs text-gray-500 space-y-1 mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Created: {formatDate(form.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated: {formatDate(form.updatedAt)} at {formatTime(form.updatedAt)}</span>
                </div>
                {form.createdBy && (
                  <div className="flex items-center gap-1.5">
                    <span>Created by: {form.createdBy}</span>
                  </div>
                )}
                {form.reviewedBy && (
                  <div className="flex items-center gap-1.5">
                    <span>Reviewed by: {form.reviewedBy}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{form.sections.length} sections</span>
                  {activeRole === 'Checker' && form.approvalStatus === 'pending' ? (
                    <div className="flex justify-between items-center gap-2">
                      <button
                        onClick={() => onEditForm(form.id)}
                        className="text-sm font-medium text-dxc-purple hover:text-dxc-purple-dark"
                      >
                        View Form &rarr;
                      </button>
                      <button
                        onClick={() => handleOpenReview(form.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Review
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditForm(form.id)}
                        className="text-sm font-medium text-dxc-purple hover:text-dxc-purple-dark"
                      >
                        {activeRole === 'Checker' ? "View" : "Open"} &rarr;
                      </button>
                      {activeRole === 'Maker' && (form.approvalStatus === 'approved' || form.approvalStatus === 'rejected') && (
                        <button
                          onClick={() => onCreateBasedOn(form.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Create New</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && reviewId && activeRole === 'Checker' && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full">
            <h3 className="text-base font-medium text-gray-800 mb-4">Review Form</h3>
            
            <div className="space-y-4 mb-5">
              <div>
                <label htmlFor="review-comments" className="block text-sm font-medium text-gray-700 mb-1">
                  Review Comments
                </label>
                <textarea
                  id="review-comments"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none text-sm"
                  placeholder="Enter your review comments (optional)"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 border border-gray-200 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 