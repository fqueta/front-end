import { BaseApiService } from './BaseApiService';
import { 
  Funnel, 
  CreateFunnelDTO, 
  UpdateFunnelDTO, 
  FunnelListParams,
  FunnelStats,
  ApiResponse, 
  PaginatedResponse 
} from '@/types';

/**
 * Serviço para gerenciar funis
 * Estende BaseApiService para reutilizar funcionalidades comuns
 */
class FunnelsService extends BaseApiService {
  private readonly endpoint = '/funnels';

  /**
   * Lista todos os funis com paginação e filtros
   * @param params - Parâmetros de filtro e paginação
   */
  async listFunnels(params?: FunnelListParams): Promise<PaginatedResponse<Funnel>> {
    const response = await this.get<any>(this.endpoint, params);
    return this.normalizePaginatedResponse<Funnel>(response);
  }

  /**
   * Obtém um funil por ID
   * @param id - ID do funil
   */
  async getFunnel(id: string): Promise<Funnel> {
    const response = await this.get<ApiResponse<Funnel>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Cria um novo funil
   * @param data - Dados do funil
   */
  async createFunnel(data: CreateFunnelDTO): Promise<Funnel> {
    const response = await this.post<ApiResponse<Funnel>>(this.endpoint, data);
    return response.data;
  }

  /**
   * Atualiza um funil existente
   * @param id - ID do funil
   * @param data - Dados para atualização
   */
  async updateFunnel(id: string, data: UpdateFunnelDTO): Promise<Funnel> {
    const response = await this.put<ApiResponse<Funnel>>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Exclui um funil
   * @param id - ID do funil
   */
  async deleteFunnel(id: string): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Ativa ou desativa um funil
   * @param id - ID do funil
   * @param isActive - Status ativo/inativo
   */
  async toggleFunnelStatus(id: string, isActive: boolean): Promise<Funnel> {
    const response = await this.patch<ApiResponse<Funnel>>(`${this.endpoint}/${id}/status`, { isActive });
    return response.data;
  }

  /**
   * Reordena funis
   * @param funnelIds - Array de IDs na nova ordem
   */
  async reorderFunnels(funnelIds: string[]): Promise<void> {
    await this.post<void>(`${this.endpoint}/reorder`, { funnelIds });
  }

  /**
   * Obtém estatísticas de um funil
   * @param id - ID do funil
   */
  async getFunnelStats(id: string): Promise<FunnelStats> {
    const response = await this.get<ApiResponse<FunnelStats>>(`${this.endpoint}/${id}/stats`);
    return response.data;
  }

  /**
   * Duplica um funil
   * @param id - ID do funil a ser duplicado
   * @param name - Nome do novo funil
   */
  async duplicateFunnel(id: string, name: string): Promise<Funnel> {
    const response = await this.post<ApiResponse<Funnel>>(`${this.endpoint}/${id}/duplicate`, { name });
    return response.data;
  }

  // Métodos genéricos para compatibilidade com useGenericApi
  async list(params?: FunnelListParams): Promise<PaginatedResponse<Funnel>> {
    return this.listFunnels(params);
  }

  async getById(id: string): Promise<Funnel> {
    return this.getFunnel(id);
  }

  async create(data: CreateFunnelDTO): Promise<Funnel> {
    return this.createFunnel(data);
  }

  async update(id: string, data: UpdateFunnelDTO): Promise<Funnel> {
    return this.updateFunnel(id, data);
  }

  async deleteById(id: string): Promise<void> {
    return this.deleteFunnel(id);
  }
}

// Exporta instância única do serviço
export const funnelsService = new FunnelsService();
export default funnelsService;