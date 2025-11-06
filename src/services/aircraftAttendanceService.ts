/**
 * Serviço para gerenciar registros de atendimentos das aeronaves
 * Permite rastrear a passagem das aeronaves pelos funis e etapas através das Ordens de Serviço
 */

import { BaseApiService } from './BaseApiService';
import { ApiResponse, PaginatedResponse } from '@/types/index';
import {
  AircraftAttendance,
  CreateAttendanceInput,
  UpdateAttendanceInput,
  AttendanceListParams,
  AttendanceListResponse,
  AttendanceEvent,
  AttendanceHistory,
  AttendanceStats,
  AttendanceStageInfo
} from '../types/aircraftAttendance';

/**
 * Serviço para operações de atendimentos de aeronaves
 * Estende BaseApiService para reutilizar funcionalidades comuns
 */
class AircraftAttendanceService extends BaseApiService {
  private readonly endpoint = '/aircraft-attendances';

  /**
   * Lista atendimentos com filtros e paginação
   */
  async list(params?: AttendanceListParams): Promise<AttendanceListResponse> {
    const response = await this.get<any>(this.endpoint, params);
    return this.normalizePaginatedResponse<AircraftAttendance>(response);
  }

  /**
   * Busca um atendimento por ID
   */
  async getById(id: string, includeDetails = false): Promise<AircraftAttendance> {
    const params = includeDetails ? { 
      include_aircraft: true, 
      include_service_order: true,
      include_summary: true 
    } : {};
    
    const response = await this.get<ApiResponse<AircraftAttendance>>(`${this.endpoint}/${id}`, params);
    return response.data;
  }

  /**
   * Cria um novo atendimento
   */
  async create(data: CreateAttendanceInput): Promise<AircraftAttendance> {
    const response = await this.post<ApiResponse<AircraftAttendance>>(this.endpoint, data);
    return response.data;
  }

  /**
   * Atualiza um atendimento existente
   */
  async update(id: string, data: UpdateAttendanceInput): Promise<AircraftAttendance> {
    const response = await this.put<ApiResponse<AircraftAttendance>>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Remove um atendimento
   */
  async remove(id: string): Promise<void> {
    await super.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Busca o histórico completo de um atendimento
   */
  async getHistory(id: string): Promise<AttendanceHistory> {
    const response = await this.get<ApiResponse<AttendanceHistory>>(`${this.endpoint}/${id}/history`);
    return response.data;
  }

  /**
   * Busca eventos de um atendimento
   */
  async getEvents(id: string, limit = 50): Promise<AttendanceEvent[]> {
    const response = await this.get<ApiResponse<AttendanceEvent[]>>(`${this.endpoint}/${id}/events`, { limit });
    return response.data;
  }

  /**
   * Adiciona uma observação ao atendimento
   */
  async addNote(id: string, note: string, isInternal = false): Promise<AttendanceEvent> {
    const response = await this.post<ApiResponse<AttendanceEvent>>(`${this.endpoint}/${id}/notes`, {
      note,
      is_internal: isInternal
    });
    return response.data;
  }

  /**
   * Atualiza o status do atendimento
   */
  async updateStatus(
    id: string, 
    status: AircraftAttendance['status'], 
    reason?: string
  ): Promise<AircraftAttendance> {
    const response = await this.patch<ApiResponse<AircraftAttendance>>(`${this.endpoint}/${id}/status`, {
      status,
      reason
    });
    return response.data;
  }

  /**
   * Atribui responsável ao atendimento
   */
  async assignTo(id: string, userId: string, reason?: string): Promise<AircraftAttendance> {
    const response = await this.patch<ApiResponse<AircraftAttendance>>(`${this.endpoint}/${id}/assign`, {
      assigned_to: userId,
      reason
    });
    return response.data;
  }

  /**
   * Move o atendimento para uma nova etapa
   */
  async moveToStage(
    id: string, 
    stageId: string, 
    reason?: string
  ): Promise<AircraftAttendance> {
    const response = await this.patch<ApiResponse<AircraftAttendance>>(`${this.endpoint}/${id}/move-stage`, {
      stage_id: stageId,
      reason
    });
    return response.data;
  }

  /**
   * Busca timeline de etapas do atendimento
   */
  async getStagesTimeline(id: string): Promise<AttendanceStageInfo[]> {
    const response = await this.get<ApiResponse<AttendanceStageInfo[]>>(`${this.endpoint}/${id}/stages-timeline`);
    return response.data;
  }

  /**
   * Busca estatísticas gerais de atendimentos
   */
  async getStats(filters?: {
    date_from?: string;
    date_to?: string;
    aircraft_id?: string;
    client_id?: string;
  }): Promise<AttendanceStats> {
    const response = await this.get<ApiResponse<AttendanceStats>>(`${this.endpoint}/stats`, filters);
    return response.data;
  }

  /**
   * Busca atendimentos por aeronave
   */
  async getByAircraft(
    aircraftId: string, 
    params?: Omit<AttendanceListParams, 'aircraft_id'>
  ): Promise<AttendanceListResponse> {
    const response = await this.get<any>(`/aircraft/${aircraftId}/attendances`, params);
    return this.normalizePaginatedResponse<AircraftAttendance>(response);
  }

  /**
   * Busca atendimentos por ordem de serviço
   */
  async getByServiceOrder(serviceOrderId: string): Promise<AircraftAttendance[]> {
    const response = await this.get<ApiResponse<AircraftAttendance[]>>(`/service-orders/${serviceOrderId}/attendances`);
    return response.data;
  }

  /**
   * Busca atendimentos ativos (em andamento)
   */
  async getActive(params?: Omit<AttendanceListParams, 'status'>): Promise<AttendanceListResponse> {
    return this.list({
      ...params,
      status: ['in_progress', 'pending', 'on_hold']
    });
  }

  /**
   * Busca atendimentos por responsável
   */
  async getByAssignee(
    userId: string, 
    params?: Omit<AttendanceListParams, 'assigned_to'>
  ): Promise<AttendanceListResponse> {
    return this.list({
      ...params,
      assigned_to: userId
    });
  }

  /**
   * Duplica um atendimento existente
   */
  async duplicate(
    id: string, 
    overrides?: Partial<CreateAttendanceInput>
  ): Promise<AircraftAttendance> {
    const response = await this.post<ApiResponse<AircraftAttendance>>(`${this.endpoint}/${id}/duplicate`, overrides || {});
    return response.data;
  }

  /**
   * Exporta dados de atendimentos em formato específico
   */
  async exportData(
     format: 'csv' | 'excel' | 'pdf' = 'csv',
     filters?: AttendanceListParams
   ): Promise<Blob> {
     const params = { ...filters, format };
     const url = this.buildUrlWithParams(`${this.API_BASE_URL}${this.endpoint}/export`, params);
     
     const response = await fetch(url, {
       method: 'GET',
       headers: this.getHeaders(),
     });

     if (!response.ok) {
       throw new Error(`Erro ao exportar dados: ${response.statusText}`);
     }

     return response.blob();
   }

  /**
   * Busca resumo de performance por período
   */
  async getPerformanceSummary(
    dateFrom: string,
    dateTo: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    period: string;
    total_attendances: number;
    completed_attendances: number;
    avg_duration_hours: number;
    completion_rate: number;
  }[]> {
    const response = await this.get<ApiResponse<{
      period: string;
      total_attendances: number;
      completed_attendances: number;
      avg_duration_hours: number;
      completion_rate: number;
    }[]>>(`${this.endpoint}/performance`, {
      date_from: dateFrom,
      date_to: dateTo,
      group_by: groupBy
    });
    return response.data;
  }

  /**
   * Busca atendimentos que precisam de atenção
   */
  async getRequiringAttention(): Promise<{
    overdue: AircraftAttendance[];
    stalled: AircraftAttendance[];
    high_priority: AircraftAttendance[];
    unassigned: AircraftAttendance[];
  }> {
    const response = await this.get<ApiResponse<{
      overdue: AircraftAttendance[];
      stalled: AircraftAttendance[];
      high_priority: AircraftAttendance[];
      unassigned: AircraftAttendance[];
    }>>(`${this.endpoint}/requiring-attention`);
    return response.data;
   }
}

// Exporta uma instância do serviço para uso em toda a aplicação
export const aircraftAttendanceService = new AircraftAttendanceService();