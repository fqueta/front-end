import { BaseApiService } from './BaseApiService';
import { ApiResponse, PaginatedResponse } from '@/types/index';
import { Service, CreateServiceInput, UpdateServiceInput, ServiceFilters } from '@/types/services';

/**
 * Parâmetros para listagem de serviços
 */
export interface ServiceListParams extends ServiceFilters {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Serviço para gerenciamento de serviços
 */
class ServicesService extends BaseApiService {
  private readonly endpoint = '/services';

  /**
   * Lista serviços com paginação e filtros
   */
  async listServices(params?: ServiceListParams): Promise<PaginatedResponse<Service>> {
    const response = await this.get<any>(this.endpoint, params);
    return this.normalizePaginatedResponse<Service>(response);
  }

  /**
   * Obtém um serviço por ID
   */
  async getService(id: string): Promise<Service> {
    const response = await this.get<ApiResponse<Service>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Cria um novo serviço
   */
  async createService(data: CreateServiceInput): Promise<Service> {
    const response = await this.post<ApiResponse<Service>>(this.endpoint, data);
    return response.data;
  }

  /**
   * Atualiza um serviço existente
   */
  async updateService(id: string, data: UpdateServiceInput): Promise<Service> {
    const response = await this.put<ApiResponse<Service>>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Exclui um serviço
   */
  async deleteService(id: string): Promise<void> {
    // Usa o método padronizado do BaseApiService, alinhado ao padrão do PUT
    // Importante: chamar super.delete para evitar colisão com o alias público delete(id)
    await super.delete<void>(`${this.endpoint}/${id}`);
  }

  // Métodos de conveniência para compatibilidade com useGenericApi
  async list(params?: ServiceListParams): Promise<PaginatedResponse<Service>> {
    return this.listServices(params);
  }

  async getById(id: string): Promise<Service> {
    return this.getService(id);
  }

  async create(data: CreateServiceInput): Promise<Service> {
    return this.createService(data);
  }

  async update(id: string, data: UpdateServiceInput): Promise<Service> {
    return this.updateService(id, data);
  }

  // Alias para compatibilidade com useGenericApi
  async delete(id: string): Promise<void> {
    return this.deleteService(id);
  }

  async deleteById(id: string): Promise<void> {
    return this.deleteService(id);
  }
}

/**
 * Instância singleton do serviço de serviços
 */
export const servicesService = new ServicesService();