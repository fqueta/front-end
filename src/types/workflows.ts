/**
 * Tipos para o sistema de Workflows, Funis e Etapas
 */

// Tipo base para entidades com timestamps
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Interface para Funil
export interface Funnel extends BaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
  color?: string;
  order?: number;
}

// Interface para Etapa
export interface Stage extends BaseEntity {
  name: string;
  funnelId: string;
  order: number;
  color?: string;
  description?: string;
  isActive: boolean;
}

// Interface para Workflow (relacionamento entre funis e etapas)
export interface Workflow extends BaseEntity {
  name: string;
  description?: string;
  funnelId: string;
  isActive: boolean;
  settings?: WorkflowSettings;
}

// Configurações do workflow
export interface WorkflowSettings {
  autoAdvance?: boolean;
  requireApproval?: boolean;
  notificationEnabled?: boolean;
  dueDate?: string;
  assignedUsers?: string[];
}

// DTOs para criação e atualização
export interface CreateFunnelDTO {
  name: string;
  description?: string;
  isActive?: boolean;
  color?: string;
  order?: number;
}

export interface UpdateFunnelDTO extends Partial<CreateFunnelDTO> {
  id: string;
}

export interface CreateStageDTO {
  name: string;
  funnelId: string;
  order: number;
  color?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateStageDTO extends Partial<CreateStageDTO> {
  id: string;
}

export interface CreateWorkflowDTO {
  name: string;
  description?: string;
  funnelId: string;
  isActive?: boolean;
  settings?: WorkflowSettings;
}

export interface UpdateWorkflowDTO extends Partial<CreateWorkflowDTO> {
  id: string;
}

// Tipos para listagem e filtros
export interface FunnelListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  orderBy?: 'name' | 'createdAt' | 'order';
  orderDirection?: 'asc' | 'desc';
}

export interface StageListParams {
  page?: number;
  limit?: number;
  search?: string;
  funnelId?: string;
  isActive?: boolean;
  orderBy?: 'name' | 'order' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

export interface WorkflowListParams {
  page?: number;
  limit?: number;
  search?: string;
  funnelId?: string;
  isActive?: boolean;
  orderBy?: 'name' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
}

// Tipos para sincronização
export interface SyncStatus {
  lastSync: string;
  status: 'idle' | 'syncing' | 'error' | 'success';
  error?: string;
}

export interface SyncResult {
  funnels: {
    created: number;
    updated: number;
    deleted: number;
  };
  stages: {
    created: number;
    updated: number;
    deleted: number;
  };
  workflows: {
    created: number;
    updated: number;
    deleted: number;
  };
  timestamp: string;
}

// Tipos para validação
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Tipos para estatísticas
export interface FunnelStats {
  totalStages: number;
  activeStages: number;
  totalWorkflows: number;
  activeWorkflows: number;
}

export interface WorkflowStats {
  totalItems: number;
  itemsByStage: Record<string, number>;
  completionRate: number;
  averageTimePerStage: Record<string, number>;
}