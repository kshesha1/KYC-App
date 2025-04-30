import React, { useEffect, useState } from 'react';
import { PlusCircle, Eye, Edit2, ChevronRight, ChevronLeft, LayoutDashboard, Save, CheckCircle, XCircle } from 'lucide-react';
import { useFormStore } from './store/formStore';
import { useSubmissionStore } from './store/submissionStore';
import { useUserStore } from './store/userStore';
import { useFinishedFormsStore } from './store/finishedFormStore';
import { Section } from './components/Section';
import { VersionHistory } from './components/VersionHistory';
import { SubmissionHistory } from './components/SubmissionHistory';
import { FormActions } from './components/FormActions';
import { ProfileMenu } from './components/ProfileMenu';
import { Dashboard } from './components/Dashboard';
import { SaveFormButton } from './components/SaveFormButton';
import { Toaster } from './components/ui/use-toast';
import { cn } from './lib/utils';

function App() {
  const { sections, isEditMode, addSection, toggleEditMode, saveVersion, reorderSection } = useFormStore();
  const { currentSubmission, addSubmission } = useSubmissionStore();
  const { user, switchRole, logout } = useUserStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDashboard, setShowDashboard] = useState(true);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  const isMaker = user?.role === 'maker';
  const isChecker = user?.role === 'checker';

  // Create initial version when the app loads
  useEffect(() => {
    if (sections.length === 0 && !showDashboard && isMaker) {
      addSection({
        title: 'New Section',
        fields: [],
        isExpanded: true,
      });
      saveVersion('Initial version');
    }
  }, [user?.role]);

  // If user role changes, show dashboard
  useEffect(() => {
    setShowDashboard(true);
    setCurrentFormId(null);
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    setShowDashboard(true);
    setCurrentFormId(null);
  };

  const handleToggleEditMode = () => {
    if (!isMaker) return; // Only makers can toggle edit mode
    
    const newMode = !isEditMode;
    if (!newMode && !currentSubmission) {
      addSubmission();
    }
    toggleEditMode();
  };

  const handleCreateNewForm = () => {
    if (!isMaker) return; // Only makers can create new forms
    
    setShowDashboard(false);
    setCurrentFormId(null);
    // Reset form to a new empty state
    useFormStore.setState({
      sections: [],
      isEditMode: true,
      currentVersion: null,
      versions: []
    });
    addSection({
      title: 'New Section',
      fields: [],
      isExpanded: true,
    });
    saveVersion('Initial version');
  };

  const handleEditForm = (formId: string) => {
    const form = useFinishedFormsStore.getState().getForm(formId);
    if (!form) return;
    
    setShowDashboard(false);
    setCurrentFormId(formId);
    
    // Load the form content
    useFormStore.setState({
      sections: JSON.parse(JSON.stringify(form.sections)),
      // If checker, always set to view mode
      // If maker and form is pending approval, set to edit mode
      isEditMode: isMaker && form.approvalStatus === 'pending',
      currentVersion: null,
      versions: []
    });
    
    saveVersion(`Loaded form: ${form.title}`);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, sectionId: string, currentOrder: number) => {
    if (!isEditMode || !isMaker) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: sectionId, order: currentOrder }));
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode || !isMaker) return;
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode || !isMaker) return;
    e.preventDefault();
    const draggedOverItem = e.currentTarget;
    draggedOverItem.classList.add('border-t-2', 'border-blue-500');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode || !isMaker) return;
    e.currentTarget.classList.remove('border-t-2', 'border-blue-500');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropOrder: number) => {
    if (!isEditMode || !isMaker) return;
    e.preventDefault();
    e.currentTarget.classList.remove('border-t-2', 'border-blue-500');
    
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const draggedSectionId = data.id;
    const draggedOrder = data.order;
    
    if (draggedOrder === dropOrder) return;
    
    reorderSection(draggedSectionId, dropOrder);
  };

  // Determine if the current form can be edited
  const canEditCurrentForm = () => {
    if (!currentFormId) return true; // New form
    
    const form = useFinishedFormsStore.getState().getForm(currentFormId);
    return isMaker && form && form.approvalStatus === 'pending';
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const handleApproveForm = () => {
    if (!currentFormId || !user) return;
    
    useFinishedFormsStore.getState().approveForm(currentFormId, user.name, reviewComments);
    setReviewComments('');
    setShowDashboard(true);
  };
  
  const handleRejectForm = () => {
    if (!currentFormId || !user) return;
    
    useFinishedFormsStore.getState().rejectForm(currentFormId, user.name, reviewComments);
    setReviewComments('');
    setShowDashboard(true);
  };

  const renderFormTitle = () => {
    if (!currentFormId) return null;
    
    const form = useFinishedFormsStore.getState().getForm(currentFormId);
    if (!form) return null;

    return (
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{form.title}</h2>
        {form.description && (
          <p className="mt-1 text-gray-600">{form.description}</p>
        )}
        <div className="mt-2 flex gap-2">
          {form.approvalStatus === 'pending' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
              Pending Review
            </span>
          )}
          {form.approvalStatus === 'approved' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              Approved
            </span>
          )}
          {form.approvalStatus === 'rejected' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
              Rejected
            </span>
          )}
          {form.reviewComments && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium">
              Comments: {form.reviewComments}
            </span>
          )}
        </div>
        
        {/* Checker Review Controls */}
        {isChecker && form.approvalStatus === 'pending' && (
          <div className="mt-5 border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <span className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                Review Form
              </h3>
            </div>
            <div className="p-4 bg-white">
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Enter your review comments (optional)"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 text-sm"
              />
              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={handleRejectForm}
                  className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={handleApproveForm}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 h-16">
          <div className="max-w-screen-2xl mx-auto px-6 h-full flex items-center justify-between">
            {/* Left Side - Logo & App Name */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="dxc-logo w-8 h-8 bg-contain bg-no-repeat bg-center"></div>
                <div className="ml-3 flex items-center">
                  <span className="text-lg font-semibold text-gray-900">KYC</span>
                  <span className="text-gray-500 mx-1.5">|</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight text-gray-700">Enterprise Portal</span>
                    <span className="text-xs text-gray-500 leading-tight">Client Verification System</span>
                  </div>
                </div>
              </div>
              
              {/* Environment Tag */}
              <div className="hidden md:flex ml-4 px-2 py-0.5 rounded border border-blue-100 bg-blue-50">
                <span className="text-xs font-medium text-blue-700">Production</span>
              </div>
            </div>
            
            {/* Center - Spacer */}
            <div className="flex-1"></div>
            
            {/* Right Side - Navigation and Profile */}
            <div className="flex items-center space-x-5">
              {/* Activity & Notifications */}
              <div className="hidden sm:flex items-center space-x-3 mr-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="h-6 w-px bg-gray-200"></div>
              </div>
              
              {/* Dashboard Button */}
              <button
                onClick={() => setShowDashboard(true)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  showDashboard 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              
              {/* Edit Mode Button (Only for Makers) */}
              {!showDashboard && isMaker && (
                <button
                  onClick={handleToggleEditMode}
                  disabled={!canEditCurrentForm()}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    !canEditCurrentForm() && "opacity-50 cursor-not-allowed",
                    isEditMode 
                      ? "bg-purple-50 text-purple-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {isEditMode ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              )}
              
              {/* Add Section Button (Only for Makers in Edit Mode) */}
              {!showDashboard && isMaker && isEditMode && canEditCurrentForm() && (
                <div className="flex items-center gap-2">
                  <SaveFormButton onSuccess={() => setShowDashboard(true)} />
                  <button
                    onClick={() => addSection({
                      title: 'New Section',
                      fields: [],
                      isExpanded: true,
                    })}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Section</span>
                  </button>
                </div>
              )}
              
              {/* User Profile */}
              {user && (
                <div className="flex items-center">
                  <div className="hidden md:flex items-center border-l border-gray-200 ml-2 pl-4">
                    <div className="flex flex-col mr-3">
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <div className="flex items-center">
                        <span className={cn(
                          "inline-block w-1.5 h-1.5 rounded-full mr-1",
                          user.role === 'maker' ? "bg-blue-500" : "bg-green-500"
                        )}></span>
                        <p className="text-xs text-gray-500">
                          {user.role === 'maker' ? 'Maker' : 'Checker'}
                        </p>
                      </div>
                    </div>
                    <ProfileMenu
                      user={user}
                      onRoleChange={switchRole}
                      onLogout={handleLogout}
                    />
                  </div>
                  <div className="md:hidden">
                    <ProfileMenu
                      user={user}
                      onRoleChange={switchRole}
                      onLogout={handleLogout}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex min-h-screen pt-16">
          {/* Main Content */}
          <div className="flex-1 relative">
            {showDashboard ? (
              <Dashboard 
                onCreateNewForm={handleCreateNewForm} 
                onEditForm={handleEditForm} 
              />
            ) : (
              <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    {renderFormTitle()}
                    
                    {sections.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        {isMaker && (
                          <div className="space-y-4">
                            <div className="text-gray-500">No sections have been added yet</div>
                            <button
                              onClick={() => addSection({ title: 'New Section', fields: [], isExpanded: true })}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>Add First Section</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 mt-6">
                        {sections
                          .sort((a, b) => a.order - b.order)
                          .map((section) => (
                            <div
                              key={section.id}
                              draggable={isEditMode && isMaker && canEditCurrentForm()}
                              onDragStart={(e) => handleDragStart(e, section.id, section.order)}
                              onDragEnd={handleDragEnd}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, section.order)}
                              className="border border-gray-100 rounded-md hover:border-gray-200 transition-colors"
                            >
                              <Section section={section} />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Form Actions - Now outside the sidebar */}
            {!isEditMode && !showDashboard && !isChecker && <FormActions />}
          </div>

          {/* Sidebar */}
          {!showDashboard && !isChecker && (
            <aside
              className={cn(
                "w-96 border-l border-gray-200 bg-white/80 backdrop-blur-sm",
                "fixed top-16 bottom-0 right-0 transition-transform duration-300",
                "lg:relative lg:top-0 lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "translate-x-full"
              )}
            >
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "absolute top-4 -left-12 p-2 rounded-lg",
                  "bg-white/80 backdrop-blur-sm border border-gray-200",
                  "hover:bg-gray-50 transition-colors duration-200",
                  "lg:hidden",
                  !isSidebarOpen && "hidden"
                )}
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>

              {/* Sidebar Toggle (Mobile) */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={cn(
                  "fixed bottom-4 right-4 p-3 rounded-full",
                  "bg-dxc-purple text-white shadow-lg",
                  "lg:hidden",
                  isSidebarOpen && "hidden"
                )}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Sidebar Content */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                  <h2 className="text-lg font-medium text-dxc-purple">
                    {isEditMode ? "Version History" : "Form Submissions"}
                  </h2>
                </div>

                {/* Content */}
                <div className="p-4 overflow-auto grow">
                  {isEditMode ? <VersionHistory /> : <SubmissionHistory />}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
      <Toaster />
    </>
  );
}

export default App;

