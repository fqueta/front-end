import { LoginCredentials, RegisterData, ForgotPasswordData, ResetPasswordData, AuthResponse, User } from '@/types/auth';
import { MenuItemDTO } from '@/types/menu';
import { getTenantIdFromSubdomain, getTenantApiUrl, getVersionApi } from '@/lib/qlib';
const tenant_id = getTenantIdFromSubdomain() || 'default';
const api_version = getVersionApi();
const API_BASE_URL = getTenantApiUrl() + api_version;
class AuthService {
  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Erro na requisição';
      let errorBody: any = null;
      try {
        errorBody = await response.json();
        errorMessage = errorBody?.message || errorMessage;
      } catch {
        // ignore json parse errors
      }
      const error = new Error(errorMessage) as Error & { status?: number; body?: any };
      error.status = response.status;
      error.body = errorBody;
      throw error;
    }
    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    const data = await this.handleResponse<AuthResponse>(response);
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      // Store permissions and menu if provided
      if (data.permissions) {
        localStorage.setItem('auth_permissions', JSON.stringify(data.permissions));
      }
      if (data.menu) {
        localStorage.setItem('auth_menu', JSON.stringify(data.menu));
      }
    }

    return data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await this.handleResponse<AuthResponse>(response);
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      // Store permissions and menu if provided
      if (data.permissions) {
        localStorage.setItem('auth_permissions', JSON.stringify(data.permissions));
      }
      if (data.menu) {
        localStorage.setItem('auth_menu', JSON.stringify(data.menu));
      }
    }

    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.clearStorage();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    return this.handleResponse<User>(response);
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getStoredPermissions(): string[] | null {
    const permissionsStr = localStorage.getItem('auth_permissions');
    if (permissionsStr) {
      try {
        return JSON.parse(permissionsStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getStoredMenu(): MenuItemDTO[] | null {
    const menuStr = localStorage.getItem('auth_menu');
    if (menuStr) {
      try {
        return JSON.parse(menuStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  async getUserPermissions(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/user/permissions`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    const data = await this.handleResponse<{ permissions: string[] }>(response);
    return data.permissions;
  }

  async getUserMenu(): Promise<MenuItemDTO[]> {
    const response = await fetch(`${API_BASE_URL}/user/menu`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    const data = await this.handleResponse<{ menu: MenuItemDTO[] }>(response);
    return data.menu;
  }

  async checkAccess({ permission, path }: { permission?: string; path?: string }): Promise<{ allowed: boolean }> {
    const params = new URLSearchParams();
    if (permission) params.append('permission', permission);
    if (path) params.append('path', path);

    try {
      const response = await fetch(`${API_BASE_URL}/user/can?${params.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (response.status === 403 || response.status === 401) {
        return { allowed: false };
      }

      return this.handleResponse<{ allowed: boolean }>(response);
    } catch (error) {
      // On API errors, assume not allowed for safety
      console.warn('Access check failed:', error);
      return { allowed: false };
    }
  }

  clearStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_permissions');
    localStorage.removeItem('auth_menu');
  }
}

export const authService = new AuthService();