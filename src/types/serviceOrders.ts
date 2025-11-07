/**
 * Tipos relacionados a ordens de serviço
 */

import { Service } from './services';
import { Product } from './products';
import { Funnel, Stage } from './workflows';

/**
 * Item de serviço em uma ordem
 */
export interface ServiceOrderServiceItem {
  id?: string;
  service_id: string;
  service?: Service;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

/**
 * Item de produto em uma ordem
 */
export interface ServiceOrderProductItem {
  id?: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

/**
 * Status possíveis para uma ordem de serviço
 */
export type ServiceOrderStatus = 
  | 'draft'        // Rascunho
  | 'pending'      // Pendente
  | 'approved'     // Aprovada
  | 'in_progress'  // Em andamento
  | 'completed'    // Concluída
  | 'cancelled'    // Cancelada
  | 'on_hold';     // Em espera

/**
 * Prioridade da ordem de serviço
 */
export type ServiceOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Tipo de documento da ordem de serviço
 */
export type ServiceOrderDocType = 'os' | 'orc';

/**
 * Cliente da ordem de serviço
 */
export interface ServiceOrderClient {
  id: string;
  tipo_pessoa: 'pf' | 'pj';
  name: string;
  razao?: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  email_verified_at?: string;
  status: string;
  genero?: string;
  verificado?: string;
  permission_id?: number;
  created_at?: string;
  updated_at?: string;
  config?: {
    celular?: string;
    phone?: string;
    [key: string]: any;
  };
  preferencias?: any;
  foto_perfil?: string;
  ativo?: string;
  autor?: string;
  token?: string;
  excluido?: string;
  reg_excluido?: string;
  deletado?: string;
  reg_deletado?: string;
}

/**
 * Aeronave da ordem de serviço
 */
export interface ServiceOrderAircraft {
  id: number;
  client_id: string;
  config?: {
    [key: string]: any;
  };
  description?: string;
  matricula: string;
  rab?: any;
  created_at?: string;
  updated_at?: string;
  active: boolean;
}

/**
 * Usuário atribuído à ordem de serviço
 */
export interface ServiceOrderUser {
  id: string;
  name: string;
  email?: string;
}

/**
 * Ordem de serviço base
 */
export interface ServiceOrder {
  id: number;
  doc_type: ServiceOrderDocType;
  title: string;
  description?: string;
  object_id?: number;
  object_type?: string;
  aircraft_id?: number;
  aricraft_data?: any;
  assigned_to?: string;
  assigned_user?: ServiceOrderUser;
  client_id?: string;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  estimated_start_date?: string;
  estimated_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  notes?: string;
  funnelId: number;
  stageId: number;
  funnel?: Funnel;
  stage?: Stage;
  internal_notes?: string;
  total_amount: string | number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  aircraft?: ServiceOrderAircraft;
  client?: ServiceOrderClient;
  products: ServiceOrderProductItem[];
  services: ServiceOrderServiceItem[];
  
  // Campos calculados/derivados para compatibilidade
  order_number?: string;
  client_name?: string;
  services_total?: number;
  products_total?: number;
  created_by?: string;
}

/**
 * Dados para criar uma nova ordem de serviço
 */
export interface CreateServiceOrderInput {
  doc_type: ServiceOrderDocType;
  title: string;
  description?: string;
  object_id?: number;
  object_type?: string;
  aircraft_id?: number;
  assigned_to?: string;
  client_id?: string;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  estimated_start_date?: string;
  estimated_end_date?: string;
  notes?: string;
  funnelId: number;
  stageId: number;
  internal_notes?: string;
  total_amount?: string | number;
  services?: Omit<ServiceOrderServiceItem, 'id'>[];
  products?: Omit<ServiceOrderProductItem, 'id'>[];
}

/**
 * Dados para atualizar uma ordem de serviço
 */
export interface UpdateServiceOrderInput {
  doc_type?: ServiceOrderDocType;
  title?: string;
  description?: string;
  object_id?: number;
  object_type?: string;
  aircraft_id?: number;
  assigned_to?: string;
  client_id?: string;
  status?: ServiceOrderStatus;
  priority?: ServiceOrderPriority;
  estimated_start_date?: string;
  estimated_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  notes?: string;
  funnelId?: number;
  stageId?: number;
  internal_notes?: string;
  total_amount?: string | number;
  services?: Omit<ServiceOrderServiceItem, 'id'>[];
  products?: Omit<ServiceOrderProductItem, 'id'>[];
}

/**
 * Dados do formulário de ordem de serviço
 */
export interface ServiceOrderFormData {
  doc_type: ServiceOrderDocType;
  title: string;
  description: string;
  client_id: string;
  client_name: string;
  aircraft_id: string;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  estimated_start_date: string;
  estimated_end_date: string;
  services: ServiceOrderServiceItem[];
  products: ServiceOrderProductItem[];
  notes: string;
  internal_notes: string;
  assigned_to: string;
}

/**
 * Registro de ordem de serviço (para tabelas)
 */
export interface ServiceOrderRecord extends ServiceOrder {
  // Campos adicionais para exibição
}

/**
 * Filtros para listagem de ordens de serviço
 */
export interface ServiceOrderFilters {
  search?: string;
  status?: ServiceOrderStatus;
  priority?: ServiceOrderPriority;
  client_id?: string;
  assigned_to?: string;
  // Filtro por aeronave (permite listar OS de uma aeronave específica)
  aircraft_id?: string | number;
  date_range?: {
    start?: string;
    end?: string;
  };
  amount_range?: {
    min?: number;
    max?: number;
  };
}

/**
 * Constantes para status
 */
export const SERVICE_ORDER_STATUSES = [
  { value: 'draft', label: 'Rascunho', color: 'gray' },
  { value: 'pending', label: 'Pendente', color: 'yellow' },
  { value: 'approved', label: 'Aprovada', color: 'blue' },
  { value: 'in_progress', label: 'Em Andamento', color: 'orange' },
  { value: 'completed', label: 'Concluída', color: 'green' },
  { value: 'cancelled', label: 'Cancelada', color: 'red' },
  { value: 'on_hold', label: 'Em Espera', color: 'purple' }
] as const;

/**
 * Constantes para prioridades
 */
export const SERVICE_ORDER_PRIORITIES = [
  { value: 'low', label: 'Baixa', color: 'green' },
  { value: 'medium', label: 'Média', color: 'yellow' },
  { value: 'high', label: 'Alta', color: 'orange' },
  { value: 'urgent', label: 'Urgente', color: 'red' }
] as const;

/**
 * Estatísticas de ordens de serviço
 */
export interface ServiceOrderStats {
  total: number;
  by_status: Record<ServiceOrderStatus, number>;
  by_priority: Record<ServiceOrderPriority, number>;
  total_amount: number;
  average_amount: number;
  pending_amount: number;
  completed_this_month: number;
  overdue: number;
}