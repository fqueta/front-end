import { PaginatedResponse } from '@/types/index';
import { getTenantIdFromSubdomain, getTenantApiUrl, getVersionApi } from '@/lib/qlib';

/**
 * Classe de erro genérica para APIs
 * Substitui o FinancialError para uso geral
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly response?: any;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number = 500,
    response?: any,
    errors?: Record<string, string[]>
  ) {
    console.log('ApiError constructor:', message, status, response, errors);
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    this.errors = errors;
  }

  /**
   * Cria um erro de API a partir de uma resposta HTTP
   */
  static fromHttpResponse(status: number, responseBody?: any): ApiError {
    let message = 'Erro na requisição';
    let errors: Record<string, string[]> | undefined;

    if (responseBody) {
      message = responseBody.message || responseBody.error || message;
      errors = responseBody.errors;
    }

    // Mensagens específicas por status HTTP
    switch (status) {
      case 400:
        message = responseBody?.message || 'Dados inválidos';
        break;
      case 401:
        message = 'Não autorizado';
        break;
      case 403:
        message = 'Acesso negado';
        break;
      case 404:
        message = 'Recurso não encontrado';
        break;
      case 422:
        message = responseBody?.message || 'Erro de validação';
        break;
      case 500:
        message = 'Erro interno do servidor';
        break;
    }

    return new ApiError(message, status, responseBody, errors);
  }

  /**
   * Cria um erro de rede
   */
  static createNetworkError(message: string, originalError?: Error): ApiError {
    return new ApiError(
      `${message}: ${originalError?.message || 'Erro de conexão'}`,
      0,
      null
    );
  }

  /**
   * Retorna uma mensagem amigável para o usuário
   */
  getUserFriendlyMessage(): string {
    if (this.errors && Object.keys(this.errors).length > 0) {
      const errorMessages: string[] = [];
      Object.keys(this.errors).forEach(field => {
        const fieldErrors = this.errors![field];
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach(errorMsg => {
            errorMessages.push(`${field.toUpperCase()}: ${errorMsg}`);
          });
        }
      });
      return errorMessages.join('\n');
    }
    return this.message;
  }
}

/**
 * Classe base independente para serviços de API
 * Não depende de FinancialError, usando ApiError genérico
 */
export abstract class IndependentApiService {
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
      
      // Cria erro genérico baseado no status HTTP
      const apiError = ApiError.fromHttpResponse(response.status, errorBody);
      throw apiError;
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      const networkError = ApiError.createNetworkError(
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
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.createNetworkError('Erro na requisição GET', error as Error);
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
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.createNetworkError('Erro na requisição POST', error as Error);
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
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.createNetworkError('Erro na requisição PUT', error as Error);
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
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.createNetworkError('Erro na requisição PATCH', error as Error);
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
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.createNetworkError('Erro na requisição DELETE', error as Error);
    }
  }
}