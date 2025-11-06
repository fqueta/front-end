import { BaseApiService } from './BaseApiService';
import { 
  Stage, 
  CreateStageDTO, 
  UpdateStageDTO, 
  StageListParams,
  ApiResponse, 
  PaginatedResponse 
} from '@/types';

/**
 * Serviço para gerenciar etapas
 * Estende BaseApiService para reutilizar funcionalidades comuns
 */
class StagesService extends BaseApiService {
  private readonly endpoint = '/stages';

  /**
   * Lista todas as etapas com paginação e filtros
   * @param params - Parâmetros de filtro e paginação
   */
  async listStages(params?: StageListParams): Promise<PaginatedResponse<Stage>> {
    const response = await this.get<any>(this.endpoint, params);
    return this.normalizePaginatedResponse<Stage>(response);
  }

  /**
   * Lista etapas de um funil específico
   * @param funnelId - ID do funil
   * @param params - Parâmetros adicionais
   */
  async getStagesByFunnel(funnelId: string, params?: Omit<StageListParams, 'funnelId'>): Promise<Stage[]> {
    const response = await this.get<ApiResponse<Stage[]>>(`/funnels/${funnelId}/stages`, params);
    return response.data;
  }

  /**
   * Obtém uma etapa por ID
   * @param id - ID da etapa
   */
  async getStage(id: string): Promise<Stage> {
    const response = await this.get<ApiResponse<Stage>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Cria uma nova etapa
   * @param data - Dados da etapa
   */
  async createStage(data: CreateStageDTO): Promise<Stage> {
    const response = await this.post<ApiResponse<Stage>>(this.endpoint, data);
    return response.data;
  }

  /**
   * Atualiza uma etapa existente
   * @param id - ID da etapa
   * @param data - Dados para atualização
   */
  async updateStage(id: string, data: UpdateStageDTO): Promise<Stage> {
    const response = await this.put<ApiResponse<Stage>>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Exclui uma etapa
   * @param id - ID da etapa
   */
  async deleteStage(id: string): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Ativa ou desativa uma etapa
   * @param id - ID da etapa
   * @param isActive - Status ativo/inativo
   */
  async toggleStageStatus(id: string, isActive: boolean): Promise<Stage> {
    const response = await this.patch<ApiResponse<Stage>>(`${this.endpoint}/${id}/status`, { isActive });
    return response.data;
  }

  /**
   * Reordena etapas de um funil
   * @param funnelId - ID do funil
   * @param stageIds - Array de IDs das etapas na nova ordem
   */
  async reorderStages(funnelId: string, stageIds: string[]): Promise<void> {
    await this.post<void>(`/funnels/${funnelId}/stages/reorder`, { stageIds });
  }

  /**
   * Move uma etapa para outro funil
   * @param stageId - ID da etapa
   * @param targetFunnelId - ID do funil de destino
   * @param order - Nova ordem na lista de etapas
   */
  async moveStageToFunnel(stageId: string, targetFunnelId: string, order?: number): Promise<Stage> {
    const response = await this.patch<ApiResponse<Stage>>(`${this.endpoint}/${stageId}/move`, { 
      targetFunnelId, 
      order 
    });
    return response.data;
  }

  /**
   * Duplica uma etapa
   * @param id - ID da etapa a ser duplicada
   * @param name - Nome da nova etapa
   * @param funnelId - ID do funil (opcional, usa o mesmo da etapa original se não informado)
   */
  async duplicateStage(id: string, name: string, funnelId?: string): Promise<Stage> {
    const response = await this.post<ApiResponse<Stage>>(`${this.endpoint}/${id}/duplicate`, { 
      name, 
      funnelId 
    });
    return response.data;
  }

  /**
   * Obtém contagem de itens por etapa
   * @param stageId - ID da etapa
   */
  async getStageItemCount(stageId: string): Promise<number> {
    const response = await this.get<ApiResponse<{ count: number }>>(`${this.endpoint}/${stageId}/count`);
    return response.data.count;
  }

  // Métodos genéricos para compatibilidade com useGenericApi
  async list(params?: StageListParams): Promise<PaginatedResponse<Stage>> {
    return this.listStages(params);
  }

  async getById(id: string): Promise<Stage> {
    return this.getStage(id);
  }

  async create(data: CreateStageDTO): Promise<Stage> {
    return this.createStage(data);
  }

  async update(id: string, data: UpdateStageDTO): Promise<Stage> {
    return this.updateStage(id, data);
  }

  async deleteById(id: string): Promise<void> {
    return this.deleteStage(id);
  }
}

// Exporta instância única do serviço
export const stagesService = new StagesService();
export default stagesService;