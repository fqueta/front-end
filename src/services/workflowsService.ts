import { BaseApiService } from './BaseApiService';
import { 
  Workflow, 
  CreateWorkflowDTO, 
  UpdateWorkflowDTO, 
  WorkflowListParams,
  WorkflowStats,
  SyncResult,
  SyncStatus,
  ApiResponse, 
  PaginatedResponse 
} from '@/types';

/**
 * Serviço para gerenciar workflows
 * Estende BaseApiService para reutilizar funcionalidades comuns
 */
class WorkflowsService extends BaseApiService {
  private readonly endpoint = '/workflows';

  /**
   * Lista todos os workflows com paginação e filtros
   * @param params - Parâmetros de filtro e paginação
   */
  async listWorkflows(params?: WorkflowListParams): Promise<PaginatedResponse<Workflow>> {
    const response = await this.get<any>(this.endpoint, params);
    return this.normalizePaginatedResponse<Workflow>(response);
  }

  /**
   * Obtém um workflow por ID
   * @param id - ID do workflow
   */
  async getWorkflow(id: string): Promise<Workflow> {
    const response = await this.get<ApiResponse<Workflow>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Cria um novo workflow
   * @param data - Dados do workflow
   */
  async createWorkflow(data: CreateWorkflowDTO): Promise<Workflow> {
    const response = await this.post<ApiResponse<Workflow>>(this.endpoint, data);
    return response.data;
  }

  /**
   * Atualiza um workflow existente
   * @param id - ID do workflow
   * @param data - Dados para atualização
   */
  async updateWorkflow(id: string, data: UpdateWorkflowDTO): Promise<Workflow> {
    const response = await this.put<ApiResponse<Workflow>>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Exclui um workflow
   * @param id - ID do workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Ativa ou desativa um workflow
   * @param id - ID do workflow
   * @param isActive - Status ativo/inativo
   */
  async toggleWorkflowStatus(id: string, isActive: boolean): Promise<Workflow> {
    const response = await this.patch<ApiResponse<Workflow>>(`${this.endpoint}/${id}/status`, { isActive });
    return response.data;
  }

  /**
   * Obtém estatísticas de um workflow
   * @param id - ID do workflow
   */
  async getWorkflowStats(id: string): Promise<WorkflowStats> {
    const response = await this.get<ApiResponse<WorkflowStats>>(`${this.endpoint}/${id}/stats`);
    return response.data;
  }

  /**
   * Duplica um workflow
   * @param id - ID do workflow a ser duplicado
   * @param name - Nome do novo workflow
   */
  async duplicateWorkflow(id: string, name: string): Promise<Workflow> {
    const response = await this.post<ApiResponse<Workflow>>(`${this.endpoint}/${id}/duplicate`, { name });
    return response.data;
  }

  /**
   * Sincroniza dados locais com a API
   * @param localData - Dados locais para sincronizar
   */
  async syncWithApi(localData: {
    funnels: any[];
    stages: any[];
    workflows: any[];
  }): Promise<SyncResult> {
    const response = await this.post<ApiResponse<SyncResult>>(`${this.endpoint}/sync`, localData);
    return response.data;
  }

  /**
   * Obtém status da última sincronização
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const response = await this.get<ApiResponse<SyncStatus>>(`${this.endpoint}/sync/status`);
    return response.data;
  }

  /**
   * Força sincronização completa
   * Baixa todos os dados da API e substitui dados locais
   */
  async forceSyncFromApi(): Promise<{
    funnels: any[];
    stages: any[];
    workflows: any[];
  }> {
    const response = await this.get<ApiResponse<{
      funnels: any[];
      stages: any[];
      workflows: any[];
    }>>(`${this.endpoint}/sync/download`);
    return response.data;
  }

  /**
   * Envia dados locais para API (upload)
   * @param localData - Dados locais para enviar
   */
  async uploadLocalData(localData: {
    funnels: any[];
    stages: any[];
    workflows: any[];
  }): Promise<SyncResult> {
    const response = await this.post<ApiResponse<SyncResult>>(`${this.endpoint}/sync/upload`, localData);
    return response.data;
  }

  /**
   * Resolve conflitos de sincronização
   * @param conflicts - Lista de conflitos a resolver
   * @param resolution - Estratégia de resolução ('local' | 'remote' | 'merge')
   */
  async resolveConflicts(conflicts: any[], resolution: 'local' | 'remote' | 'merge'): Promise<SyncResult> {
    const response = await this.post<ApiResponse<SyncResult>>(`${this.endpoint}/sync/resolve`, {
      conflicts,
      resolution
    });
    return response.data;
  }

  /**
   * Obtém workflows por funil
   * @param funnelId - ID do funil
   */
  async getWorkflowsByFunnel(funnelId: string): Promise<Workflow[]> {
    const response = await this.get<ApiResponse<Workflow[]>>(`/funnels/${funnelId}/workflows`);
    return response.data;
  }

  // Métodos genéricos para compatibilidade com useGenericApi
  async list(params?: WorkflowListParams): Promise<PaginatedResponse<Workflow>> {
    return this.listWorkflows(params);
  }

  async getById(id: string): Promise<Workflow> {
    return this.getWorkflow(id);
  }

  async create(data: CreateWorkflowDTO): Promise<Workflow> {
    return this.createWorkflow(data);
  }

  async update(id: string, data: UpdateWorkflowDTO): Promise<Workflow> {
    return this.updateWorkflow(id, data);
  }

  async deleteById(id: string): Promise<void> {
    return this.deleteWorkflow(id);
  }
}

// Exporta instância única do serviço
export const workflowsService = new WorkflowsService();
export default workflowsService;