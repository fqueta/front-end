/**
 * Sistema de auditoria para operações de ordens de serviço
 * Registra e rastreia todas as mudanças em ordens de serviço
 */

// Tipos para auditoria de ordens de serviço
export enum ServiceOrderAuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  PRIORITY_CHANGE = 'PRIORITY_CHANGE',
  ASSIGN_USER = 'ASSIGN_USER',
  UNASSIGN_USER = 'UNASSIGN_USER',
  ADD_SERVICE = 'ADD_SERVICE',
  REMOVE_SERVICE = 'REMOVE_SERVICE',
  ADD_PRODUCT = 'ADD_PRODUCT',
  REMOVE_PRODUCT = 'REMOVE_PRODUCT',
  CANCEL = 'CANCEL',
  RESTORE = 'RESTORE'
}

export enum ServiceOrderAuditEntityType {
  SERVICE_ORDER = 'SERVICE_ORDER',
  SERVICE_ORDER_SERVICE = 'SERVICE_ORDER_SERVICE',
  SERVICE_ORDER_PRODUCT = 'SERVICE_ORDER_PRODUCT'
}

export interface ServiceOrderAuditEntry {
  id: string;
  entityType: ServiceOrderAuditEntityType;
  entityId: string;
  action: ServiceOrderAuditAction;
  userId?: string;
  userName?: string;
  timestamp: Date;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: ServiceOrderFieldChange[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ServiceOrderFieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'modified' | 'removed';
}

export interface ServiceOrderAuditFilter {
  entityType?: ServiceOrderAuditEntityType;
  entityId?: string;
  action?: ServiceOrderAuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ServiceOrderAuditSummary {
  totalEntries: number;
  actionCounts: Record<ServiceOrderAuditAction, number>;
  entityTypeCounts: Record<ServiceOrderAuditEntityType, number>;
  userActivityCounts: Record<string, number>;
  recentActivity: ServiceOrderAuditEntry[];
}

/**
 * Serviço de auditoria para ordens de serviço
 */
export class ServiceOrderAuditService {
  private entries: ServiceOrderAuditEntry[] = [];
  private maxEntries: number;
  private currentUser?: { id: string; name: string };

  constructor(maxEntries = 10000) {
    this.maxEntries = maxEntries;
    this.loadFromStorage();
  }

  /**
   * Define o usuário atual para auditoria
   */
  setCurrentUser(user: { id: string; name: string }): void {
    this.currentUser = user;
  }

  /**
   * Registra uma entrada de auditoria
   */
  log(entry: Omit<ServiceOrderAuditEntry, 'id' | 'timestamp' | 'userId' | 'userName'>): ServiceOrderAuditEntry {
    const auditEntry: ServiceOrderAuditEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
      userId: this.currentUser?.id,
      userName: this.currentUser?.name,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    // Calcula mudanças se valores antigos e novos foram fornecidos
    if (entry.oldValues && entry.newValues) {
      auditEntry.changes = this.calculateChanges(entry.oldValues, entry.newValues);
    }

    this.entries.unshift(auditEntry);

    // Mantém apenas o número máximo de entradas
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }

    this.saveToStorage();
    return auditEntry;
  }

  /**
   * Busca entradas de auditoria com filtros
   */
  search(filter: ServiceOrderAuditFilter = {}): ServiceOrderAuditEntry[] {
    let filtered = [...this.entries];

    if (filter.entityType) {
      filtered = filtered.filter(entry => entry.entityType === filter.entityType);
    }

    if (filter.entityId) {
      filtered = filtered.filter(entry => entry.entityId === filter.entityId);
    }

    if (filter.action) {
      filtered = filtered.filter(entry => entry.action === filter.action);
    }

    if (filter.userId) {
      filtered = filtered.filter(entry => entry.userId === filter.userId);
    }

    if (filter.startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= filter.startDate!);
    }

    if (filter.endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= filter.endDate!);
    }

    // Aplica paginação
    if (filter.offset) {
      filtered = filtered.slice(filter.offset);
    }

    if (filter.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }

  /**
   * Obtém histórico de uma entidade específica
   */
  getEntityHistory(entityType: ServiceOrderAuditEntityType, entityId: string): ServiceOrderAuditEntry[] {
    return this.search({ entityType, entityId });
  }

  /**
   * Obtém resumo das atividades de auditoria
   */
  getSummary(filter: ServiceOrderAuditFilter = {}): ServiceOrderAuditSummary {
    const entries = this.search(filter);
    
    const actionCounts = {} as Record<ServiceOrderAuditAction, number>;
    const entityTypeCounts = {} as Record<ServiceOrderAuditEntityType, number>;
    const userActivityCounts = {} as Record<string, number>;

    // Inicializa contadores
    Object.values(ServiceOrderAuditAction).forEach(action => {
      actionCounts[action] = 0;
    });
    Object.values(ServiceOrderAuditEntityType).forEach(type => {
      entityTypeCounts[type] = 0;
    });

    entries.forEach(entry => {
      actionCounts[entry.action]++;
      entityTypeCounts[entry.entityType]++;
      
      if (entry.userName) {
        userActivityCounts[entry.userName] = (userActivityCounts[entry.userName] || 0) + 1;
      }
    });

    return {
      totalEntries: entries.length,
      actionCounts,
      entityTypeCounts,
      userActivityCounts,
      recentActivity: entries.slice(0, 10)
    };
  }

  /**
   * Exporta dados de auditoria
   */
  export(filter: ServiceOrderAuditFilter = {}, format: 'json' | 'csv' = 'json'): string {
    const entries = this.search(filter);
    
    if (format === 'csv') {
      return this.exportToCSV(entries);
    }
    
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Remove entradas antigas
   */
  cleanup(olderThan: Date): number {
    const initialCount = this.entries.length;
    this.entries = this.entries.filter(entry => entry.timestamp > olderThan);
    const removedCount = initialCount - this.entries.length;
    
    if (removedCount > 0) {
      this.saveToStorage();
    }
    
    return removedCount;
  }

  /**
   * Calcula mudanças entre valores antigos e novos
   */
  private calculateChanges(oldValues: Record<string, any>, newValues: Record<string, any>): ServiceOrderFieldChange[] {
    const changes: ServiceOrderFieldChange[] = [];
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    allKeys.forEach(key => {
      const oldValue = oldValues[key];
      const newValue = newValues[key];

      if (oldValue === undefined && newValue !== undefined) {
        changes.push({
          field: key,
          oldValue: null,
          newValue,
          type: 'added'
        });
      } else if (oldValue !== undefined && newValue === undefined) {
        changes.push({
          field: key,
          oldValue,
          newValue: null,
          type: 'removed'
        });
      } else if (oldValue !== newValue) {
        // Comparação mais robusta para objetos e arrays
        const isEqual = JSON.stringify(oldValue) === JSON.stringify(newValue);
        if (!isEqual) {
          changes.push({
            field: key,
            oldValue,
            newValue,
            type: 'modified'
          });
        }
      }
    });

    return changes;
  }

  /**
   * Gera ID único para entrada de auditoria
   */
  private generateId(): string {
    return `so_audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém IP do cliente (simulado no frontend)
   */
  private getClientIP(): string {
    // No frontend, não temos acesso ao IP real do cliente
    // Retorna um placeholder que pode ser substituído pelo backend
    return 'client_ip';
  }

  /**
   * Exporta para CSV
   */
  private exportToCSV(entries: ServiceOrderAuditEntry[]): string {
    const headers = [
      'ID',
      'Tipo de Entidade',
      'ID da Entidade',
      'Ação',
      'Usuário',
      'Data/Hora',
      'Mudanças'
    ];

    const rows = entries.map(entry => [
      entry.id,
      entry.entityType,
      entry.entityId,
      entry.action,
      entry.userName || 'Sistema',
      entry.timestamp.toISOString(),
      entry.changes?.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`).join('; ') || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * Salva dados no localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        entries: this.entries,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('serviceOrderAuditData', JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar dados de auditoria:', error);
    }
  }

  /**
   * Carrega dados do localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('serviceOrderAuditData');
      if (data) {
        const parsed = JSON.parse(data);
        this.entries = parsed.entries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Erro ao carregar dados de auditoria:', error);
      this.entries = [];
    }
  }
}

/**
 * Decorators para auditoria automática de ordens de serviço
 */
export function ServiceOrderAuditCreate(entityType: ServiceOrderAuditEntityType) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      serviceOrderAuditService.log({
        entityType,
        entityId: result.id,
        action: ServiceOrderAuditAction.CREATE,
        newValues: result,
        metadata: { method: propertyName, args }
      });
      
      return result;
    };
  };
}

export function ServiceOrderAuditUpdate(entityType: ServiceOrderAuditEntityType) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [id, updateData] = args;
      
      // Busca valores antigos antes da atualização
      let oldValues;
      try {
        oldValues = await this.getById(id);
      } catch (error) {
        // Se não conseguir buscar valores antigos, continua sem eles
      }
      
      const result = await method.apply(this, args);
      
      serviceOrderAuditService.log({
        entityType,
        entityId: id,
        action: ServiceOrderAuditAction.UPDATE,
        oldValues,
        newValues: result,
        metadata: { method: propertyName, updateData }
      });
      
      return result;
    };
  };
}

export function ServiceOrderAuditDelete(entityType: ServiceOrderAuditEntityType) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [id] = args;
      
      // Busca valores antes da exclusão
      let oldValues;
      try {
        oldValues = await this.getById(id);
      } catch (error) {
        // Se não conseguir buscar valores antigos, continua sem eles
      }
      
      const result = await method.apply(this, args);
      
      serviceOrderAuditService.log({
        entityType,
        entityId: id,
        action: ServiceOrderAuditAction.DELETE,
        oldValues,
        metadata: { method: propertyName }
      });
      
      return result;
    };
  };
}

export function ServiceOrderAuditActionDecorator(action: ServiceOrderAuditAction, entityType: ServiceOrderAuditEntityType) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [id] = args;
      
      // Busca valores antes da ação
      let oldValues;
      try {
        oldValues = await this.getById(id);
      } catch (error) {
        // Se não conseguir buscar valores antigos, continua sem eles
      }
      
      const result = await method.apply(this, args);
      
      serviceOrderAuditService.log({
        entityType,
        entityId: id,
        action,
        oldValues,
        newValues: result,
        metadata: { method: propertyName, args }
      });
      
      return result;
    };
  };
}

/**
 * Instância singleton do serviço de auditoria de ordens de serviço
 */
export const serviceOrderAuditService = new ServiceOrderAuditService();

/**
 * Hook para usar auditoria em componentes React
 */
export const useServiceOrderAudit = () => {
  return {
    auditService: serviceOrderAuditService,
    ServiceOrderAuditAction,
    ServiceOrderAuditEntityType
  };
};

/**
 * Utilitários para formatação de dados de auditoria de ordens de serviço
 */
export class ServiceOrderAuditFormatter {
  /**
   * Formata uma entrada de auditoria para exibição
   */
  static formatEntry(entry: ServiceOrderAuditEntry): string {
    const action = this.formatAction(entry.action);
    const entity = this.formatEntityType(entry.entityType);
    const user = entry.userName || 'Sistema';
    const time = entry.timestamp.toLocaleString('pt-BR');
    
    return `${user} ${action} ${entity} em ${time}`;
  }

  /**
   * Formata ação para exibição
   */
  static formatAction(action: ServiceOrderAuditAction): string {
    const actionMap = {
      [ServiceOrderAuditAction.CREATE]: 'criou',
      [ServiceOrderAuditAction.UPDATE]: 'atualizou',
      [ServiceOrderAuditAction.DELETE]: 'excluiu',
      [ServiceOrderAuditAction.STATUS_CHANGE]: 'alterou o status de',
      [ServiceOrderAuditAction.PRIORITY_CHANGE]: 'alterou a prioridade de',
      [ServiceOrderAuditAction.ASSIGN_USER]: 'atribuiu usuário à',
      [ServiceOrderAuditAction.UNASSIGN_USER]: 'removeu usuário da',
      [ServiceOrderAuditAction.ADD_SERVICE]: 'adicionou serviço à',
      [ServiceOrderAuditAction.REMOVE_SERVICE]: 'removeu serviço da',
      [ServiceOrderAuditAction.ADD_PRODUCT]: 'adicionou produto à',
      [ServiceOrderAuditAction.REMOVE_PRODUCT]: 'removeu produto da',
      [ServiceOrderAuditAction.CANCEL]: 'cancelou',
      [ServiceOrderAuditAction.RESTORE]: 'restaurou'
    };
    
    return actionMap[action] || action;
  }

  /**
   * Formata tipo de entidade para exibição
   */
  static formatEntityType(entityType: ServiceOrderAuditEntityType): string {
    const entityMap = {
      [ServiceOrderAuditEntityType.SERVICE_ORDER]: 'ordem de serviço',
      [ServiceOrderAuditEntityType.SERVICE_ORDER_SERVICE]: 'serviço da ordem',
      [ServiceOrderAuditEntityType.SERVICE_ORDER_PRODUCT]: 'produto da ordem'
    };
    
    return entityMap[entityType] || entityType;
  }

  /**
   * Formata mudanças para exibição
   */
  static formatChanges(changes: ServiceOrderFieldChange[]): string[] {
    return changes.map(change => {
      const field = this.formatFieldName(change.field);
      
      switch (change.type) {
        case 'added':
          return `${field}: adicionado "${change.newValue}"`;
        case 'removed':
          return `${field}: removido "${change.oldValue}"`;
        case 'modified':
          return `${field}: alterado de "${change.oldValue}" para "${change.newValue}"`;
        default:
          return `${field}: modificado`;
      }
    });
  }

  /**
   * Formata nome do campo para exibição
   */
  static formatFieldName(field: string): string {
    const fieldMap: Record<string, string> = {
      'title': 'Título',
      'description': 'Descrição',
      'status': 'Status',
      'priority': 'Prioridade',
      'dueDate': 'Data de Vencimento',
      'startDate': 'Data de Início',
      'endDate': 'Data de Término',
      'assignedUserId': 'Usuário Atribuído',
      'clientId': 'Cliente',
      'aircraftId': 'Aeronave',
      'totalAmount': 'Valor Total',
      'notes': 'Observações',
      'services': 'Serviços',
      'products': 'Produtos'
    };
    
    return fieldMap[field] || field;
  }
}