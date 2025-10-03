/**
 * Sistema de auditoria para operações financeiras
 * Registra e rastreia todas as mudanças em dados financeiros
 */

// Tipos para auditoria
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MARK_AS_PAID = 'MARK_AS_PAID',
  MARK_AS_RECEIVED = 'MARK_AS_RECEIVED',
  CANCEL = 'CANCEL',
  RESTORE = 'RESTORE'
}

export enum AuditEntityType {
  ACCOUNT_PAYABLE = 'ACCOUNT_PAYABLE',
  ACCOUNT_RECEIVABLE = 'ACCOUNT_RECEIVABLE',
  CASH_FLOW_ENTRY = 'CASH_FLOW_ENTRY',
  FINANCIAL_CATEGORY = 'FINANCIAL_CATEGORY'
}

export interface AuditEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  userId?: string;
  userName?: string;
  timestamp: Date;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: FieldChange[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'modified' | 'removed';
}

export interface AuditFilter {
  entityType?: AuditEntityType;
  entityId?: string;
  action?: AuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditSummary {
  totalEntries: number;
  actionCounts: Record<AuditAction, number>;
  entityTypeCounts: Record<AuditEntityType, number>;
  userActivityCounts: Record<string, number>;
  recentActivity: AuditEntry[];
}

/**
 * Classe principal para gerenciamento de auditoria
 */
export class FinancialAuditService {
  private entries: AuditEntry[] = [];
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
   * Registra uma nova entrada de auditoria
   */
  log(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'userId' | 'userName'>): AuditEntry {
    const auditEntry: AuditEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
      userId: this.currentUser?.id,
      userName: this.currentUser?.name,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    // Calcula as mudanças se oldValues e newValues estão presentes
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
  search(filter: AuditFilter = {}): AuditEntry[] {
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
    const offset = filter.offset || 0;
    const limit = filter.limit || filtered.length;
    
    return filtered.slice(offset, offset + limit);
  }

  /**
   * Obtém o histórico de uma entidade específica
   */
  getEntityHistory(entityType: AuditEntityType, entityId: string): AuditEntry[] {
    return this.search({ entityType, entityId })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Obtém resumo da auditoria
   */
  getSummary(filter: AuditFilter = {}): AuditSummary {
    const entries = this.search(filter);

    const actionCounts = Object.values(AuditAction).reduce((acc, action) => {
      acc[action] = entries.filter(entry => entry.action === action).length;
      return acc;
    }, {} as Record<AuditAction, number>);

    const entityTypeCounts = Object.values(AuditEntityType).reduce((acc, type) => {
      acc[type] = entries.filter(entry => entry.entityType === type).length;
      return acc;
    }, {} as Record<AuditEntityType, number>);

    const userActivityCounts = entries.reduce((acc, entry) => {
      if (entry.userName) {
        acc[entry.userName] = (acc[entry.userName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const recentActivity = entries
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      totalEntries: entries.length,
      actionCounts,
      entityTypeCounts,
      userActivityCounts,
      recentActivity
    };
  }

  /**
   * Exporta dados de auditoria
   */
  export(filter: AuditFilter = {}, format: 'json' | 'csv' = 'json'): string {
    const entries = this.search(filter);

    if (format === 'csv') {
      return this.exportToCSV(entries);
    }

    return JSON.stringify(entries, null, 2);
  }

  /**
   * Limpa entradas antigas
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
   * Calcula as diferenças entre valores antigos e novos
   */
  private calculateChanges(oldValues: Record<string, any>, newValues: Record<string, any>): FieldChange[] {
    const changes: FieldChange[] = [];
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    for (const key of allKeys) {
      const oldValue = oldValues[key];
      const newValue = newValues[key];

      if (!(key in oldValues)) {
        changes.push({
          field: key,
          oldValue: undefined,
          newValue,
          type: 'added'
        });
      } else if (!(key in newValues)) {
        changes.push({
          field: key,
          oldValue,
          newValue: undefined,
          type: 'removed'
        });
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue,
          type: 'modified'
        });
      }
    }

    return changes;
  }

  /**
   * Gera ID único para entrada de auditoria
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém IP do cliente (simulado para ambiente frontend)
   */
  private getClientIP(): string {
    // Em um ambiente real, isso seria obtido do servidor
    return 'client-ip';
  }

  /**
   * Exporta para formato CSV
   */
  private exportToCSV(entries: AuditEntry[]): string {
    const headers = [
      'ID',
      'Entity Type',
      'Entity ID',
      'Action',
      'User',
      'Timestamp',
      'Changes',
      'IP Address'
    ];

    const rows = entries.map(entry => [
      entry.id,
      entry.entityType,
      entry.entityId,
      entry.action,
      entry.userName || 'Unknown',
      entry.timestamp.toISOString(),
      entry.changes?.length || 0,
      entry.ipAddress || 'Unknown'
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
        entries: this.entries.slice(0, 1000), // Salva apenas as 1000 mais recentes
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('financial_audit', JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar dados de auditoria:', error);
    }
  }

  /**
   * Carrega dados do localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('financial_audit');
      if (stored) {
        const data = JSON.parse(stored);
        this.entries = data.entries.map((entry: any) => ({
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
 * Decorators para auditoria automática
 */
export function AuditCreate(entityType: AuditEntityType) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      auditService.log({
        entityType,
        entityId: result.id,
        action: AuditAction.CREATE,
        newValues: result,
        metadata: { method: propertyName, args }
      });
      
      return result;
    };
  };
}

export function AuditUpdate(entityType: AuditEntityType) {
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
      
      auditService.log({
        entityType,
        entityId: id,
        action: AuditAction.UPDATE,
        oldValues,
        newValues: result,
        metadata: { method: propertyName, updateData }
      });
      
      return result;
    };
  };
}

export function AuditDelete(entityType: AuditEntityType) {
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
      
      auditService.log({
        entityType,
        entityId: id,
        action: AuditAction.DELETE,
        oldValues,
        metadata: { method: propertyName }
      });
      
      return result;
    };
  };
}

export function AuditAction(action: AuditAction, entityType: AuditEntityType) {
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
      
      auditService.log({
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
 * Instância singleton do serviço de auditoria
 */
export const auditService = new FinancialAuditService();

/**
 * Hook para usar auditoria em componentes React
 */
export const useFinancialAudit = () => {
  return {
    auditService,
    AuditAction,
    AuditEntityType
  };
};

/**
 * Utilitários para formatação de dados de auditoria
 */
export class AuditFormatter {
  /**
   * Formata uma entrada de auditoria para exibição
   */
  static formatEntry(entry: AuditEntry): string {
    const action = this.formatAction(entry.action);
    const entity = this.formatEntityType(entry.entityType);
    const user = entry.userName || 'Sistema';
    const time = entry.timestamp.toLocaleString('pt-BR');
    
    return `${user} ${action} ${entity} em ${time}`;
  }

  /**
   * Formata ação para exibição
   */
  static formatAction(action: AuditAction): string {
    const actionMap = {
      [AuditAction.CREATE]: 'criou',
      [AuditAction.UPDATE]: 'atualizou',
      [AuditAction.DELETE]: 'excluiu',
      [AuditAction.MARK_AS_PAID]: 'marcou como pago',
      [AuditAction.MARK_AS_RECEIVED]: 'marcou como recebido',
      [AuditAction.CANCEL]: 'cancelou',
      [AuditAction.RESTORE]: 'restaurou'
    };
    
    return actionMap[action] || action;
  }

  /**
   * Formata tipo de entidade para exibição
   */
  static formatEntityType(entityType: AuditEntityType): string {
    const entityMap = {
      [AuditEntityType.ACCOUNT_PAYABLE]: 'conta a pagar',
      [AuditEntityType.ACCOUNT_RECEIVABLE]: 'conta a receber',
      [AuditEntityType.CASH_FLOW_ENTRY]: 'entrada de fluxo de caixa',
      [AuditEntityType.FINANCIAL_CATEGORY]: 'categoria financeira'
    };
    
    return entityMap[entityType] || entityType;
  }

  /**
   * Formata mudanças para exibição
   */
  static formatChanges(changes: FieldChange[]): string[] {
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
      'amount': 'Valor',
      'description': 'Descrição',
      'dueDate': 'Data de Vencimento',
      'status': 'Status',
      'paymentMethod': 'Método de Pagamento',
      'category': 'Categoria',
      'supplier': 'Fornecedor',
      'customer': 'Cliente'
    };
    
    return fieldMap[field] || field;
  }
}