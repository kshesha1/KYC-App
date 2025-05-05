import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { UserAvatar } from './UserAvatar';
import { Check, LogOut, Pen, User, Settings } from 'lucide-react';
import { toast } from './ui/use-toast';
import { ProfilePage } from './ProfilePage';
import { useNavigate } from 'react-router-dom';

interface ProfileMenuProps {
  user: {
    name: string;
    email: string;
    role: 'maker' | 'checker' | 'Maker' | 'Checker';
  };
  onRoleChange: (role: 'Maker' | 'Checker') => void;
  onLogout: () => void;
}

export function ProfileMenu({ user, onRoleChange, onLogout }: ProfileMenuProps) {
  const [showProfile, setShowProfile] = React.useState(false);
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleRoleChange = (newRole: 'maker' | 'checker' | 'Maker' | 'Checker') => {
    const role = (newRole.charAt(0).toUpperCase() + newRole.slice(1).toLowerCase()) as 'Maker' | 'Checker';
    onRoleChange(role);
    toast({
      title: `Role Changed`,
      description: `Now acting as: ${role}`,
    });
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <UserAvatar
              role={user.role}
              initials={getInitials(user.name)}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 animate-in slide-in-from-top-1 duration-200" align="end" sideOffset={8}>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              className="flex items-center cursor-pointer"
              onClick={() => setShowProfile(true)}
            >
              <User className="mr-2 h-4 w-4 text-gray-500" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4 text-gray-500" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {user.role === 'checker' || user.role === 'Checker' ? (
              <DropdownMenuItem onClick={() => handleRoleChange('Maker')} className="flex items-center cursor-pointer">
                <Pen className="mr-2 h-4 w-4 text-blue-500" />
                <span>Switch to Maker</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleRoleChange('Checker')} className="flex items-center cursor-pointer">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Switch to Checker</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 flex items-center cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showProfile && (
        <ProfilePage
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
} 