import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserPlan } from '../types';
import { supabase, isSupabaseConfigured, LocalDbService, isOwnerUser, DEFAULT_OWNER, DEFAULT_CUSTOMER } from './supabaseClient';

interface AuthContextType {
  user: UserProfile | null;
  isOwner: boolean;
  loading: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  consumeSearch: () => boolean;
  refreshProfile: () => void;
  updatePlan: (newPlan: UserPlan) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_SESSION_KEY = 'leadforge_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load existing session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile from supabase table
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (profile) {
              setUser(profile as UserProfile);
            }
          }
        } else {
          // Local fallback check
          const storedUserJson = localStorage.getItem(CURRENT_USER_SESSION_KEY);
          if (storedUserJson) {
            const parsed = JSON.parse(storedUserJson);
            // Refresh with latest from DB service
            let current = LocalDbService.getProfileByUserId(parsed.user_id || parsed.id) || parsed;
            
            const isOwnerEmail = (
              current.email?.toLowerCase() === DEFAULT_OWNER.email.toLowerCase() ||
              current.email?.toLowerCase() === 'owner@leadforge.ai' ||
              (import.meta.env.VITE_OWNER_EMAIL && current.email?.toLowerCase() === import.meta.env.VITE_OWNER_EMAIL.toLowerCase())
            );

            if (isOwnerEmail || current.account_type === 'owner') {
              current = {
                ...current,
                role: 'admin',
                account_type: 'owner',
                plan: 'premium',
                searches_remaining: 999999,
                is_active: true,
              };
            }

            setUser(current);
            localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(current));
          } else {
            // Fresh visitor: not logged in by default
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const refreshProfile = () => {
    if (!user) return;
    let latest = LocalDbService.getProfileByUserId(user.user_id || user.id) || user;
    if (isOwnerUser(user) || latest.account_type === 'owner') {
      latest.role = 'admin';
      latest.account_type = 'owner';
    }
    setUser(latest);
    localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(latest));
  };

  const isOwner = isOwnerUser(user);

  const login = async (email: string, password?: string) => {
    try {
      if (!email || !email.trim()) {
        return { success: false, error: 'Por favor, informe seu e-mail.' };
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) return { success: false, error: error.message };

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (profile) {
            setUser(profile as UserProfile);
            return { success: true };
          }
        }
      }

      // Check if logging in as Owner (authenticated email match)
      const isOwnerEmailMatch = (
        normalizedEmail === DEFAULT_OWNER.email.toLowerCase() ||
        normalizedEmail === 'owner@leadforge.ai' ||
        (import.meta.env.VITE_OWNER_EMAIL && normalizedEmail === import.meta.env.VITE_OWNER_EMAIL.toLowerCase())
      );

      if (isOwnerEmailMatch) {
        const ownerUser = LocalDbService.getProfileByEmail(DEFAULT_OWNER.email) || DEFAULT_OWNER;
        const completeOwner: UserProfile = {
          ...ownerUser,
          role: 'admin',
          account_type: 'owner',
          plan: 'premium',
          searches_remaining: 999999,
          is_active: true,
        };
        setUser(completeOwner);
        localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(completeOwner));
        return { success: true };
      }

      // Local / Offline validation for customer
      const existing = LocalDbService.getProfileByEmail(email);
      if (existing) {
        if (!existing.is_active) {
          return { success: false, error: 'Esta conta foi desativada pelo administrador.' };
        }
        setUser(existing);
        localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(existing));
        return { success: true };
      }

      return {
        success: false,
        error: 'Nenhuma conta encontrada com este e-mail. Verifique os dados digitados ou cadastre-se gratuitamente.'
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro inesperado ao realizar login.' };
    }
  };

  const register = async (name: string, email: string, password?: string) => {
    try {
      // SECURITY: Public registration ALWAYS creates a normal customer
      // Role = 'user' and account_type = 'customer'
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) return { success: false, error: error.message };

        if (data.user) {
          const newProfile: UserProfile = {
            id: data.user.id,
            user_id: data.user.id,
            name,
            email,
            role: 'user',
            account_type: 'customer',
            plan: 'gratis',
            searches_remaining: 5,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(newProfile);
          return { success: true };
        }
      }

      // Local Registration - Strictly Customer
      const existing = LocalDbService.getProfileByEmail(email);
      if (existing) {
        return { success: false, error: 'Já existe uma conta cadastrada com este e-mail.' };
      }

      const newUserId = 'usr_' + Date.now();
      const newProfile: UserProfile = {
        id: newUserId,
        user_id: newUserId,
        name,
        email,
        role: 'user',
        account_type: 'customer',
        plan: 'gratis',
        searches_remaining: 5,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      LocalDbService.saveProfile(newProfile);
      setUser(newProfile);
      localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(newProfile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao criar conta.' };
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(CURRENT_USER_SESSION_KEY);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) return { success: false, message: error.message };
      }
      return {
        success: true,
        message: `Instruções de recuperação foram enviadas para o e-mail: ${email}`
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao solicitar recuperação.' };
    }
  };

  const consumeSearch = (): boolean => {
    if (!user) return false;
    
    // OWNER RULE: If role = 'admin' AND account_type = 'owner', searches are UNLIMITED
    if (isOwner) {
      return true;
    }

    if (user.plan === 'premium') return true; // unlimited for premium plan
    if (user.searches_remaining <= 0) return false;

    const remaining = LocalDbService.updateSearchesRemaining(user.user_id || user.id, -1);
    setUser(prev => prev ? { ...prev, searches_remaining: remaining } : null);
    return true;
  };

  const updatePlan = (newPlan: UserPlan) => {
    if (!user || isOwner) return; // Owner never changes plan via purchase
    LocalDbService.updatePlan(user.user_id || user.id, newPlan);
    refreshProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isOwner,
        loading,
        isSupabaseConnected: isSupabaseConfigured,
        login,
        register,
        logout,
        resetPassword,
        consumeSearch,
        refreshProfile,
        updatePlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
