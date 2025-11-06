import { 
  ClientRecord, 
  CreateClientInput, 
  UpdateClientInput, 
  ClientsListParams,  
} from '@/types/clients';
import { PaginatedResponse } from '@/types/index';
import { IndependentApiService } from './IndependentApiService';

/**
 * Serviço para gerenciamento de clientes
 * Estende IndependentApiService para evitar dependência de FinancialError
 */
class ClientsService extends IndependentApiService {
  /**
   * Lista clientes com parâmetros de filtro
   * @param params - Parâmetros de listagem
   */
  async listClients(params?: ClientsListParams): Promise<PaginatedResponse<ClientRecord>> {
    const response = await this.get<any>('/clients', params);
    return this.normalizePaginatedResponse<ClientRecord>(response);
  }

  /**
   * Obtém cliente por ID
   * @param id - ID do cliente
   */
  async getClient(id: string): Promise<ClientRecord> {
    return this.get<ClientRecord>(`/clients/${id}`);
  }

  /**
   * Cria novo cliente
   * @param payload - Dados do cliente
   */
  async createClient(payload: CreateClientInput): Promise<ClientRecord> {
    return this.post<ClientRecord>('/clients', payload);
  }

  /**
   * Atualiza cliente existente
   * @param id - ID do cliente
   * @param payload - Dados atualizados
   */
  async updateClient(id: string, payload: UpdateClientInput): Promise<ClientRecord> {
    return this.put<ClientRecord>(`/clients/${id}`, payload);
  }

  /**
   * Exclui cliente
   * @param id - ID do cliente
   */
  async deleteClient(id: string): Promise<void> {
    return this.delete<void>(`/clients/${id}`);
  }

  // Métodos para compatibilidade com o hook genérico
  async list(params?: ClientsListParams): Promise<PaginatedResponse<ClientRecord>> {
    return this.listClients(params);
  }

  async getById(id: string): Promise<ClientRecord> {
    return this.getClient(id);
  }

  async create(data: CreateClientInput): Promise<ClientRecord> {
    return this.createClient(data);
  }

  async update(id: string, data: UpdateClientInput): Promise<ClientRecord> {
    return this.updateClient(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.deleteClient(id);
  }
}

export const clientsService = new ClientsService();