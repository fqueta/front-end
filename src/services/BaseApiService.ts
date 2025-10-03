import { PaginatedResponse } from '@/types/index';
import { getTenantIdFromSubdomain, getTenantApiUrl, getVersionApi } from '@/lib/qlib';
import { FinancialError, FinancialErrorFactory } from '@/types/financial-errors';

/**
 * Classe base para todos os serviços de API
 * Fornece funcionalidades comuns como headers, tratamento de erros e normalização de respostas
 */
export abstract class BaseApiService {
  protected readonly API_BASE_URL: string;
  protected readonly tenant_id: string;
  protected readonly api_version: string;

  constructor() {
    this.tenant_id = getTenantIdFromSubdomain() || 'default';
    this.api_version = getVersionApi();
    this.API_BASE_URL = getTenantApiUrl() + this.api_version;
  }

  /**
   * Obtém os headers padrão para requisições
   */
  protected getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Trata a resposta da API e converte para JSON
   * @param response - Resposta da requisição fetch
   */
  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        // ignore json parse errors
      }
      
      // Cria erro específico baseado no status HTTP
      const financialError = FinancialErrorFactory.fromHttpResponse(response.status, errorBody);
      throw financialError;
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      const networkError = FinancialErrorFactory.createNetworkError(
        'Erro ao processar resposta da API',
        error as Error
      );
      throw networkError;
    }
  }

  /**
   * Constrói URL com parâmetros de query
   * @param baseUrl - URL base
   * @param params - Parâmetros de query
   */
  protected buildUrlWithParams(baseUrl: string, params?: Record<string, any>): string {
    if (!params) return baseUrl;

    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Normaliza resposta paginada para o formato esperado
   * @param response - Resposta da API
   */
  protected normalizePaginatedResponse<T>(response: any): PaginatedResponse<T> {
    // Se já está no formato correto, retorna como está
    if (response.data && Array.isArray(response.data)) {
      return response as PaginatedResponse<T>;
    }

    // Se é um array direto, converte para formato paginado
    if (Array.isArray(response)) {
      return {
        data: response,
        current_page: 1,
        last_page: 1,
        per_page: response.length,
        total: response.length
      };
    }

    // Fallback para outros formatos
    return {
      data: response?.items || response?.data || [],
      current_page: response?.current_page || response?.page || 1,
      last_page: response?.last_page || response?.total_pages || 1,
      per_page: response?.per_page || response?.limit || 10,
      total: response?.total || response?.count || 0
    };
  }

  /**
   * Executa requisição GET
   * @param endpoint - Endpoint da API
   * @param params - Parâmetros de query
   */
  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const url = this.buildUrlWithParams(`${this.API_BASE_URL}${endpoint}`, params);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FinancialError) {
        throw error;
      }
      throw FinancialErrorFactory.createNetworkError('Erro na requisição GET', error as Error);
    }
  }

  /**
   * Executa requisição POST
   * @param endpoint - Endpoint da API
   * @param data - Dados para envio
   */
  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FinancialError) {
        throw error;
      }
      throw FinancialErrorFactory.createNetworkError('Erro na requisição POST', error as Error);
    }
  }

  /**
   * Executa requisição PUT
   * @param endpoint - Endpoint da API
   * @param data - Dados para envio
   */
  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FinancialError) {
        throw error;
      }
      throw FinancialErrorFactory.createNetworkError('Erro na requisição PUT', error as Error);
    }
  }

  /**
   * Executa requisição PATCH
   * @param endpoint - Endpoint da API
   * @param data - Dados para envio
   */
  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FinancialError) {
        throw error;
      }
      throw FinancialErrorFactory.createNetworkError('Erro na requisição PATCH', error as Error);
    }
  }

  /**
   * Executa requisição DELETE
   * @param endpoint - Endpoint da API
   */
  protected async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FinancialError) {
        throw error;
      }
      throw FinancialErrorFactory.createNetworkError('Erro na requisição DELETE', error as Error);
    }
  }
}