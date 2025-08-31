import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types/auth';
import { MenuItemDTO } from '@/types/menu';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    permissions: [],
    menu: [],
    isLoading: true,
    isAuthenticated: false,
  });

  const updateAuthState = (
    user: User | null, 
    token: string | null, 
    permissions: string[] = [], 
    menu: MenuItemDTO[] = []
  ) => {
    setState({
      user,
      token,
      permissions,
      menu,
      isLoading: false,
      isAuthenticated: !!user && !!token,
    });
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.login(credentials);
      updateAuthState(
        response.user, 
        response.token, 
        response.permissions || [], 
        response.menu || []
      );
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${response.user.name}!`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      
      updateAuthState(null, null, [], []);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.register(data);
      updateAuthState(
        response.user, 
        response.token, 
        response.permissions || [], 
        response.menu || []
      );
      
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${response.user.name}!`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      
      updateAuthState(null, null, [], []);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      updateAuthState(null, null, [], []);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const user = await authService.getCurrentUser();
      setState((prev) => ({ ...prev, user }));
    } catch (error) {
      const status = (error as any)?.status;
      console.error('Erro ao atualizar dados do usuário:', error);
      if (status === 401 || status === 419) {
        await logout();
      } else {
        // mantém a sessão em caso de erro temporário
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  };

  // Inicialização - verificar se há sessão salva
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authService.getStoredToken();
      const storedUser = authService.getStoredUser();
      const storedPermissions = authService.getStoredPermissions() || [];
      const storedMenu = authService.getStoredMenu() || [];

      if (storedToken && storedUser) {
        // Hidratação otimista: considera autenticado imediatamente
        updateAuthState(storedUser, storedToken, storedPermissions, storedMenu);

        // Validação em segundo plano
        try {
          const freshUser = await authService.getCurrentUser();
          updateAuthState(freshUser, storedToken, storedPermissions, storedMenu);
        } catch (error) {
          const status = (error as any)?.status;
          console.warn('Falha ao validar sessão ao iniciar:', error);
          if (status === 401 || status === 419) {
            authService.clearStorage();
            updateAuthState(null, null, [], []);
          } else {
            // Mantém a sessão em caso de erro temporário/servidor
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}