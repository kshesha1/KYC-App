import { Check, Pen } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '../lib/utils';

interface UserAvatarProps {
  role: 'maker' | 'checker';
  initials: string;
  className?: string;
}

export function UserAvatar({ role, initials, className }: UserAvatarProps) {
  return (
    <div className="relative">
      <Avatar className={cn("h-8 w-8", className)}>
        <AvatarFallback className={cn(
          "text-xs font-medium text-white",
          role === 'maker' ? 'bg-blue-500' : 'bg-green-500'
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        "absolute -bottom-0.5 -right-0.5 rounded-full w-3 h-3 border border-white",
        role === 'maker' ? 'bg-blue-500' : 'bg-green-500'
      )}></div>
    </div>
  );
} 