/**
 * Sistema de cache para dados financeiros
 * Implementa cache em memória com TTL e invalidação inteligente
 */

// Interface para entrada do cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
  key: string;
}

// Interface para configuração do cache
interface CacheConfig {
  defaultTTL: number; // TTL padrão em milissegundos
  maxSize: number; // Número máximo de entradas
  cleanupInterval: number; // Intervalo de limpeza em milissegundos
}

// Tipos de dados que podem ser cacheados
type CacheableData = 
  | any[] // Para listas
  | Record<string, any> // Para objetos
  | string 
  | number 
  | boolean;

/**
 * Classe principal do sistema de cache
 */
export class FinancialCache {
  private cache = new Map<string, CacheEntry<CacheableData>>();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      maxSize: 100,
      cleanupInterval: 60 * 1000, // 1 minuto
      ...config
    };

    this.startCleanupTimer();
  }

  /**
   * Armazena dados no cache
   */
  set<T extends CacheableData>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key
    };

    // Remove entradas antigas se o cache estiver cheio
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry as CacheEntry<CacheableData>);
  }

  /**
   * Recupera dados do cache
   */
  get<T extends CacheableData>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verifica se a entrada expirou
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Verifica se uma chave existe no cache e não expirou
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove uma entrada específica do cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Remove todas as entradas que correspondem a um padrão
   */
  deletePattern(pattern: string | RegExp): number {
    let deletedCount = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  } {
    let oldest: CacheEntry<CacheableData> | null = null;
    let newest: CacheEntry<CacheableData> | null = null;

    for (const entry of this.cache.values()) {
      if (!oldest || entry.timestamp < oldest.timestamp) {
        oldest = entry;
      }
      if (!newest || entry.timestamp > newest.timestamp) {
        newest = entry;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Implementar contador de hits/misses se necessário
      oldestEntry: oldest?.key || null,
      newestEntry: newest?.key || null
    };
  }

  /**
   * Verifica se uma entrada expirou
   */
  private isExpired(entry: CacheEntry<CacheableData>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Remove a entrada mais antiga
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Remove entradas expiradas
   */
  private cleanup(): void {
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * Inicia o timer de limpeza automática
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Para o timer de limpeza
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

/**
 * Gerador de chaves de cache para diferentes tipos de dados financeiros
 */
export class CacheKeyGenerator {
  /**
   * Gera chave para lista de contas a pagar
   */
  static accountsPayable(filters?: Record<string, any>): string {
    const filterStr = filters ? JSON.stringify(filters) : 'all';
    return `accounts_payable:${filterStr}`;
  }

  /**
   * Gera chave para lista de contas a receber
   */
  static accountsReceivable(filters?: Record<string, any>): string {
    const filterStr = filters ? JSON.stringify(filters) : 'all';
    return `accounts_receivable:${filterStr}`;
  }

  /**
   * Gera chave para conta específica
   */
  static account(type: 'payable' | 'receivable', id: string): string {
    return `account:${type}:${id}`;
  }

  /**
   * Gera chave para categorias financeiras
   */
  static categories(): string {
    return 'financial_categories';
  }

  /**
   * Gera chave para dados do dashboard
   */
  static dashboard(period?: string): string {
    return `dashboard:${period || 'default'}`;
  }

  /**
   * Gera chave para fluxo de caixa
   */
  static cashFlow(filters?: Record<string, any>): string {
    const filterStr = filters ? JSON.stringify(filters) : 'all';
    return `cash_flow:${filterStr}`;
  }

  /**
   * Gera chave para relatórios
   */
  static report(type: string, filters?: Record<string, any>): string {
    const filterStr = filters ? JSON.stringify(filters) : 'default';
    return `report:${type}:${filterStr}`;
  }

  /**
   * Gera chave para resumo financeiro
   */
  static summary(startDate?: string, endDate?: string): string {
    return `summary:${startDate || 'all'}:${endDate || 'all'}`;
  }
}

/**
 * Estratégias de invalidação de cache
 */
export class CacheInvalidationStrategy {
  /**
   * Invalida cache relacionado a contas a pagar
   */
  static invalidateAccountsPayable(cache: FinancialCache): void {
    cache.deletePattern(/^accounts_payable:/);
    cache.deletePattern(/^dashboard:/);
    cache.deletePattern(/^summary:/);
    cache.deletePattern(/^cash_flow:/);
  }

  /**
   * Invalida cache relacionado a contas a receber
   */
  static invalidateAccountsReceivable(cache: FinancialCache): void {
    cache.deletePattern(/^accounts_receivable:/);
    cache.deletePattern(/^dashboard:/);
    cache.deletePattern(/^summary:/);
    cache.deletePattern(/^cash_flow:/);
  }

  /**
   * Invalida cache relacionado a categorias
   */
  static invalidateCategories(cache: FinancialCache): void {
    cache.delete(CacheKeyGenerator.categories());
    // Categorias afetam muitos outros dados
    cache.deletePattern(/^accounts_/);
    cache.deletePattern(/^cash_flow:/);
    cache.deletePattern(/^dashboard:/);
  }

  /**
   * Invalida cache relacionado a uma conta específica
   */
  static invalidateAccount(cache: FinancialCache, type: 'payable' | 'receivable', id: string): void {
    cache.delete(CacheKeyGenerator.account(type, id));
    
    if (type === 'payable') {
      CacheInvalidationStrategy.invalidateAccountsPayable(cache);
    } else {
      CacheInvalidationStrategy.invalidateAccountsReceivable(cache);
    }
  }

  /**
   * Invalida todo o cache financeiro
   */
  static invalidateAll(cache: FinancialCache): void {
    cache.clear();
  }
}

/**
 * Instância singleton do cache financeiro
 */
export const financialCache = new FinancialCache({
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  maxSize: 200,
  cleanupInterval: 2 * 60 * 1000 // 2 minutos
});

/**
 * Hook para usar o cache em componentes React
 */
export const useFinancialCache = () => {
  return {
    cache: financialCache,
    keyGenerator: CacheKeyGenerator,
    invalidation: CacheInvalidationStrategy
  };
};

/**
 * Decorator para métodos que devem usar cache
 */
export function Cacheable(keyGenerator: (...args: any[]) => string, ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator(...args);
      
      // Tenta buscar do cache primeiro
      const cachedResult = financialCache.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Se não estiver no cache, executa o método original
      const result = await method.apply(this, args);
      
      // Armazena o resultado no cache
      financialCache.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}

/**
 * Decorator para métodos que devem invalidar cache
 */
export function InvalidateCache(invalidationStrategy: (cache: FinancialCache, ...args: any[]) => void) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Executa o método original
      const result = await method.apply(this, args);
      
      // Invalida o cache após a operação
      invalidationStrategy(financialCache, ...args);
      
      return result;
    };
  };
}