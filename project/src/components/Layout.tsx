import React, { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { useWorkflowStore } from '../store/workflowStore';
import { cn } from '../lib/utils';
import { UserCircle, ChevronDown, Check, Bell } from 'lucide-react';
import '../styles/custom.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isEditMode } = useFormStore();
  const { currentRole, setRole, pendingApprovals } = useWorkflowStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleRoleChange = (role: 'maker' | 'checker') => {
    setRole(role);
    setShowProfileMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glassmorphism border-b border-white/20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <h1 className="text-xl font-semibold bg-gradient-to-r from-dxc-purple to-blue-600 bg-clip-text text-transparent">
                  KYC Form Builder
                </h1>
                <nav className="flex items-center gap-6">
                  <a href="#" className="text-sm font-medium text-gray-600 hover:text-dxc-purple transition-colors">Dashboard</a>
                  <a href="#" className="text-sm font-medium text-gray-600 hover:text-dxc-purple transition-colors">Templates</a>
                  <a href="#" className="text-sm font-medium text-gray-600 hover:text-dxc-purple transition-colors">Submissions</a>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                {currentRole === 'checker' && (
                  <div className="relative">
                    <button className="p-2 rounded-lg hover:bg-white/50 transition-all duration-200 relative">
                      <Bell className="w-5 h-5 text-dxc-purple" />
                      {pendingApprovals.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                          {pendingApprovals.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {currentRole === 'maker' && (
                  <button 
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      isEditMode 
                        ? "bg-dxc-purple text-white hover:bg-dxc-purple-light" 
                        : "bg-white/50 text-dxc-purple hover:bg-white"
                    )}
                  >
                    {isEditMode ? 'Preview Mode' : 'Edit Mode'}
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-all duration-200"
                  >
                    <UserCircle className="w-5 h-5 text-dxc-purple" />
                    <span className="text-sm font-medium text-gray-700">
                      {currentRole === 'maker' ? 'Form Creator' : 'Form Approver'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 animate-fade-in">
                      <div className="glassmorphism rounded-lg py-2 shadow-lg">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs font-medium text-gray-500">SWITCH ROLE</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => handleRoleChange('maker')}
                            className={cn(
                              "w-full px-4 py-2 text-sm text-left flex items-center justify-between",
                              "hover:bg-dxc-purple/5 transition-colors",
                              currentRole === 'maker' ? "text-dxc-purple" : "text-gray-700"
                            )}
                          >
                            Form Creator (Maker)
                            {currentRole === 'maker' && (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRoleChange('checker')}
                            className={cn(
                              "w-full px-4 py-2 text-sm text-left flex items-center justify-between",
                              "hover:bg-dxc-purple/5 transition-colors",
                              currentRole === 'checker' ? "text-dxc-purple" : "text-gray-700"
                            )}
                          >
                            Form Approver (Checker)
                            {currentRole === 'checker' && (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium text-gray-900">John Doe</p>
                            <p className="text-xs text-gray-500">john.doe@example.com</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-24 pb-24">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-30">
        <div className="glassmorphism border-t border-white/20">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <p>© 2024 KYC Form Builder. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-dxc-purple transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-dxc-purple transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-dxc-purple transition-colors">Contact Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}; 