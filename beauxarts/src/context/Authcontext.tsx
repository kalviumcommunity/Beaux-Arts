"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// --- Types ---
export interface User {
  id: number;
  email: string;
  fullname?: string;
  role: 'ADMIN' | 'USER' | 'SELLER';
  phone?: string;
}

export interface SignupData {
  email: string;
  password: string;
  fullname?: string;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null; // 👈 1. Added Token here
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // 👈 2. Added Token State
  const [isLoading, setIsLoading] = useState(true); 
  const router = useRouter(); 

  // 1. INITIALIZE
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken); // 👈 3. Restore token to state
        }
      } catch (error) {
        console.error("Failed to parse user from storage", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 2. LOGIN
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const res = await response.json();

      if (!res.success) {
        return { success: false, error: res.message || 'Login failed' };
      }

      const { user, token } = res.data;

      // Save to Storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update State
      setUser(user);
      setToken(token); // 👈 4. Set token on login
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. SIGNUP
  const signup = useCallback(async (data: SignupData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const res = await response.json();

      if (!res.success) {
        return { success: false, error: res.message || 'Signup failed' };
      }

      const { user, token } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setToken(token); // 👈 5. Set token on signup
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 4. LOGOUT
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null); // 👈 6. Clear token on logout
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 5. UPDATE PROFILE (Now with actual API call!)
  const updateProfile = useCallback(async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      // 👈 7. Actually call the backend to update
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Use the token!
        },
        body: JSON.stringify(data),
      });
      
      const res = await response.json();

      if (res.success) {
        const updatedUser = res.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      } else {
        return { success: false, error: res.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Update failed.' };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // 👈 8. Expose token in Context
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}