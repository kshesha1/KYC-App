import React from 'react';
import { UserAvatar } from './UserAvatar';
import { Building2, Mail, Phone, MapPin, Calendar, Shield, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfilePageProps {
  user: {
    name: string;
    email: string;
    role: 'maker' | 'checker';
  };
  onClose: () => void;
}

export function ProfilePage({ user, onClose }: ProfilePageProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Demo data for enterprise profile
  const profileData = {
    department: 'Enterprise Solutions',
    position: user.role === 'maker' ? 'Form Designer' : 'Form Reviewer',
    employeeId: 'EMP' + Math.floor(Math.random() * 1000000),
    joinDate: 'January 15, 2023',
    location: 'New York, NY',
    phone: '+1 (555) 123-4567',
    lastActive: '2 hours ago',
    permissions: [
      'Form Creation',
      'Form Review',
      'Template Management',
      'User Management'
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Enterprise Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="md:col-span-1 space-y-6">
              <div className="text-center">
                <div className="inline-block">
                  <UserAvatar
                    role={user.role}
                    initials={getInitials(user.name)}
                    className="h-24 w-24"
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{profileData.position}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Building2 className="w-5 h-5" />
                  <span className="text-sm">{profileData.department}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm">{profileData.location}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Employee ID</p>
                    <p className="text-sm font-medium text-gray-900">{profileData.employeeId}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Join Date</p>
                    <p className="text-sm font-medium text-gray-900">{profileData.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Role & Permissions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Role & Permissions</h4>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className={cn(
                    "w-5 h-5",
                    user.role === 'maker' ? 'text-blue-500' : 'text-green-500'
                  )} />
                  <span className="text-sm font-medium">
                    {user.role === 'maker' ? 'Form Designer' : 'Form Reviewer'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {profileData.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {permission}
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>Last active {profileData.lastActive}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 