import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'maker' | 'checker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface UserStore {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  switchRole: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      
      login: (user: User) => {
        set({ user });
      },
      
      logout: () => {
        set({ user: null });
      },
      
      switchRole: () => {
        const { user } = get();
        if (!user) return;
        
        const newRole: UserRole = user.role === 'maker' ? 'checker' : 'maker';
        set({
          user: {
            ...user,
            role: newRole
          }
        });
      },
    }),
    {
      name: 'user-store',
    }
  )
);

// For development convenience, automatically log in as a maker
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const { user } = useUserStore.getState();
    if (!user) {
      useUserStore.getState().login({
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'maker'
      });
    }
  }, 100);
} 