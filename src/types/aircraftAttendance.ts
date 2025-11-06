/**
 * Tipos para o sistema de registros de atendimentos das aeronaves
 * Permite rastrear a passagem das aeronaves pelos funis e etapas através das Ordens de Serviço
 */

import { Aircraft } from './aircraft';
import { ServiceOrder } from './serviceOrders';
import { Stage } from './workflows';

/**
 * Status do atendimento da aeronave
 */
export type AttendanceStatus = 
  | 'in_progress'    // Em andamento
  | 'completed'      // Concluído
  | 'cancelled'      // Cancelado
  | 'on_hold'        // Em espera
  | 'pending';       // Pendente

/**
 * Tipo de evento no histórico de atendimento
 */
export type AttendanceEventType = 
  | 'stage_change'     // Mudança de etapa
  | 'funnel_change'    // Mudança de funil
  | 'status_change'    // Mudança de status
  | 'service_added'    // Serviço adicionado
  | 'service_removed'  // Serviço removido
  | 'note_added'       // Observação adicionada
  | 'created'          // Criação do atendimento
  | 'completed';       // Conclusão do atendimento

/**
 * Evento no histórico de atendimento
 */
export interface AttendanceEvent {
  id: string;
  attendance_id: string;
  event_type: AttendanceEventType;
  description: string;
  previous_value?: string | null;
  new_value?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  created_at: string;
  metadata?: Record<string, any> | null;
}

/**
 * Resumo de etapa no atendimento
 */
export interface AttendanceStageInfo {
  stage_id: string;
  stage_name: string;
  stage_color?: string;
  funnel_id: string;
  funnel_name: string;
  entered_at: string;
  exited_at?: string | null;
  duration_minutes?: number | null;
  notes?: string | null;
}

/**
 * Resumo de serviços no atendimento
 */
export interface AttendanceServiceSummary {
  total_services: number;
  total_value: number;
  services_by_category: {
    category_name: string;
    count: number;
    total_value: number;
  }[];
}

/**
 * Registro de atendimento da aeronave
 */
export interface AircraftAttendance {
  id: string;
  aircraft_id: string;
  service_order_id: string;
  
  // Informações básicas
  title: string;
  description?: string | null;
  status: AttendanceStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Rastreamento de funil e etapa
  current_funnel_id?: string | null;
  current_funnel_name?: string | null;
  current_stage_id?: string | null;
  current_stage_name?: string | null;
  
  // Datas importantes
  started_at: string;
  completed_at?: string | null;
  estimated_completion?: string | null;
  
  // Responsável
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  
  // Cliente
  client_id: string;
  client_name: string;
  
  // Observações
  notes?: string | null;
  internal_notes?: string | null;
  
  // Metadados
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  
  // Relacionamentos (quando expandidos)
  aircraft?: Aircraft;
  service_order?: ServiceOrder;
  current_stage?: Stage;
  
  // Resumos calculados
  total_duration_minutes?: number | null;
  stages_count?: number;
  events_count?: number;
  service_summary?: AttendanceServiceSummary;
}

/**
 * Dados para criação de atendimento
 */
export interface CreateAttendanceInput {
  aircraft_id: string;
  service_order_id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  estimated_completion?: string;
  notes?: string;
  internal_notes?: string;
}

/**
 * Dados para atualização de atendimento
 */
export interface UpdateAttendanceInput {
  title?: string;
  description?: string;
  status?: AttendanceStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  estimated_completion?: string;
  completed_at?: string;
  notes?: string;
  internal_notes?: string;
}

/**
 * Filtros para busca de atendimentos
 */
export interface AttendanceFilters {
  aircraft_id?: string;
  client_id?: string;
  status?: AttendanceStatus | AttendanceStatus[];
  priority?: string | string[];
  funnel_id?: string;
  stage_id?: string;
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

/**
 * Parâmetros para listagem de atendimentos
 */
export interface AttendanceListParams extends AttendanceFilters {
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'updated_at' | 'started_at' | 'completed_at' | 'title';
  sort_order?: 'asc' | 'desc';
  include_aircraft?: boolean;
  include_service_order?: boolean;
  include_summary?: boolean;
}

/**
 * Resposta da API para listagem de atendimentos
 */
export interface AttendanceListResponse {
  data: AircraftAttendance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  summary?: {
    total_attendances: number;
    by_status: Record<AttendanceStatus, number>;
    by_priority: Record<string, number>;
    avg_duration_minutes: number;
  };
}

/**
 * Estatísticas de atendimentos
 */
export interface AttendanceStats {
  total_attendances: number;
  active_attendances: number;
  completed_attendances: number;
  avg_duration_hours: number;
  by_status: Record<AttendanceStatus, number>;
  by_priority: Record<string, number>;
  by_aircraft: {
    aircraft_id: string;
    aircraft_registration: string;
    count: number;
    avg_duration_hours: number;
  }[];
  by_funnel: {
    funnel_id: string;
    funnel_name: string;
    count: number;
    avg_duration_hours: number;
  }[];
  recent_activity: AttendanceEvent[];
}

/**
 * Histórico detalhado de um atendimento
 */
export interface AttendanceHistory {
  attendance: AircraftAttendance;
  events: AttendanceEvent[];
  stages_timeline: AttendanceStageInfo[];
  service_changes: {
    added: any[];
    removed: any[];
    modified: any[];
  };
}