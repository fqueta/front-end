/**
 * Hooks customizados para operações financeiras
 * Simplifica o uso dos serviços financeiros em componentes React
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AccountsPayable, 
  AccountsReceivable, 
  CreateAccountPayableDto,
  CreateAccountReceivableDto,
  UpdateAccountDto,
  AccountStatus,
  PaymentMethod,
  FinancialSummary
} from '../types/financial';
import { financialService } from '../services/financialService';
import { useFinancialCache } from '../services/cache/FinancialCache';

// Tipos para estados de loading e erro
interface UseFinancialState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseFinancialListState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  total: number;
  page: number;
  setPage: (page: number) => void;
}

interface UseFinancialMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | void>;
  reset: () => void;
}

/**
 * Hook para gerenciar contas a pagar
 */
export const useAccountsPayable = (filters?: Record<string, any>) => {
  const [state, setState] = useState<UseFinancialListState<AccountsPayable>>({
    data: [],
    loading: true,
    error: null,
    refetch: async () => {},
    total: 0,
    page: 1,
    setPage: () => {}
  });

  const { cache, keyGenerator } = useFinancialCache();

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await financialService.accountsPayableService.getAll(filters);
      setState(prev => ({
        ...prev,
        data: response.data || [],
        total: response.total || 0,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar contas a pagar',
        loading: false
      }));
    }
  }, [filters]);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
    setPage
  };
};

/**
 * Hook para gerenciar contas a receber
 */
export const useAccountsReceivable = (filters?: Record<string, any>) => {
  const [state, setState] = useState<UseFinancialListState<AccountsReceivable>>({
    data: [],
    loading: true,
    error: null,
    refetch: async () => {},
    total: 0,
    page: 1,
    setPage: () => {}
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await financialService.accountsReceivableService.getAll(filters);
      setState(prev => ({
        ...prev,
        data: response.data || [],
        total: response.total || 0,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar contas a receber',
        loading: false
      }));
    }
  }, [filters]);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
    setPage
  };
};

/**
 * Hook para buscar uma conta específica (a pagar ou a receber)
 */
export const useAccount = <T extends AccountsPayable | AccountsReceivable>(
  type: 'payable' | 'receivable',
  id: string
) => {
  const [state, setState] = useState<UseFinancialState<T>>({
    data: null,
    loading: true,
    error: null,
    refetch: async () => {}
  });

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = type === 'payable'
        ? await financialService.accountsPayableService.getById(id)
        : await financialService.accountsReceivableService.getById(id);
      
      setState(prev => ({
        ...prev,
        data: response as T,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar conta',
        loading: false
      }));
    }
  }, [type, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData
  };
};

/**
 * Hook para criar conta a pagar
 */
export const useCreateAccountPayable = () => {
  const [state, setState] = useState<UseFinancialMutationState<AccountsPayable>>({
    data: null,
    loading: false,
    error: null,
    execute: async () => {},
    reset: () => {}
  });

  const execute = useCallback(async (data: CreateAccountPayableDto) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await financialService.accountsPayableService.create(data);
      setState(prev => ({
        ...prev,
        data: result,
        loading: false
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao criar conta a pagar',
        loading: false
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      execute: async () => {},
      reset: () => {}
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};

/**
 * Hook para criar conta a receber
 */
export const useCreateAccountReceivable = () => {
  const [state, setState] = useState<UseFinancialMutationState<AccountsReceivable>>({
    data: null,
    loading: false,
    error: null,
    execute: async () => {},
    reset: () => {}
  });

  const execute = useCallback(async (data: CreateAccountReceivableDto) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await financialService.accountsReceivableService.create(data);
      setState(prev => ({
        ...prev,
        data: result,
        loading: false
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao criar conta a receber',
        loading: false
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      execute: async () => {},
      reset: () => {}
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};

/**
 * Hook para marcar conta como paga
 */
export const useMarkAsPaid = () => {
  const [state, setState] = useState<UseFinancialMutationState<AccountsPayable>>({
    data: null,
    loading: false,
    error: null,
    execute: async () => {},
    reset: () => {}
  });

  const execute = useCallback(async (id: string, paymentMethod?: PaymentMethod) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await financialService.accountsPayableService.markAsPaid(id, paymentMethod);
      setState(prev => ({
        ...prev,
        data: result,
        loading: false
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao marcar como pago',
        loading: false
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      execute: async () => {},
      reset: () => {}
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};

/**
 * Hook para marcar conta como recebida
 */
export const useMarkAsReceived = () => {
  const [state, setState] = useState<UseFinancialMutationState<AccountsReceivable>>({
    data: null,
    loading: false,
    error: null,
    execute: async () => {},
    reset: () => {}
  });

  const execute = useCallback(async (id: string, paymentMethod?: PaymentMethod) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await financialService.accountsReceivableService.markAsReceived(id, paymentMethod);
      setState(prev => ({
        ...prev,
        data: result,
        loading: false
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao marcar como recebido',
        loading: false
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      execute: async () => {},
      reset: () => {}
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};

/**
 * Hook para cancelar conta
 */
export const useCancelAccount = (type: 'payable' | 'receivable') => {
  const [state, setState] = useState<UseFinancialMutationState<AccountsPayable | AccountsReceivable>>({
    data: null,
    loading: false,
    error: null,
    execute: async () => {},
    reset: () => {}
  });

  const execute = useCallback(async (id: string, reason?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = type === 'payable'
        ? await financialService.accountsPayableService.cancel(id, reason)
        : await financialService.accountsReceivableService.cancel(id, reason);
      
      setState(prev => ({
        ...prev,
        data: result,
        loading: false
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao cancelar conta',
        loading: false
      }));
      throw error;
    }
  }, [type]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      execute: async () => {},
      reset: () => {}
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};

/**
 * Hook para deletar conta
 */
export const useDeleteAccount = (type: 'payable' | 'receivable') => {
  const [state, setState] = useState<UseFinancialMutationState<void>>({
    data: null,
    loading: false,
    error: null,
    execute: async () => {},
    reset: () => {}
  });

  const execute = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (type === 'payable') {
        await financialService.accountsPayableService.delete(id);
      } else {
        await financialService.accountsReceivableService.delete(id);
      }
      
      setState(prev => ({
        ...prev,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao deletar conta',
        loading: false
      }));
      throw error;
    }
  }, [type]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      execute: async () => {},
      reset: () => {}
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};

/**
 * Hook para resumo financeiro
 */
export const useFinancialSummary = (startDate?: string, endDate?: string) => {
  const [state, setState] = useState<UseFinancialState<FinancialSummary>>({
    data: null,
    loading: true,
    error: null,
    refetch: async () => {}
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await financialService.getSummary(startDate, endDate);
      setState(prev => ({
        ...prev,
        data: response,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar resumo financeiro',
        loading: false
      }));
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData
  };
};

/**
 * Hook para filtros financeiros com estado persistente
 */
export const useFinancialFilters = (initialFilters: Record<string, any> = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  return {
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
    hasFilters,
    setFilters
  };
};

/**
 * Hook para estatísticas financeiras calculadas
 */
export const useFinancialStats = (accounts: (AccountsPayable | AccountsReceivable)[]) => {
  const stats = useMemo(() => {
    const total = accounts.length;
    const paid = accounts.filter(acc => acc.status === AccountStatus.PAID).length;
    const pending = accounts.filter(acc => acc.status === AccountStatus.PENDING).length;
    const overdue = accounts.filter(acc => {
      if (acc.status !== AccountStatus.PENDING) return false;
      return new Date(acc.dueDate) < new Date();
    }).length;
    
    const totalAmount = accounts.reduce((sum, acc) => sum + acc.amount, 0);
    const paidAmount = accounts
      .filter(acc => acc.status === AccountStatus.PAID)
      .reduce((sum, acc) => sum + acc.amount, 0);
    const pendingAmount = accounts
      .filter(acc => acc.status === AccountStatus.PENDING)
      .reduce((sum, acc) => sum + acc.amount, 0);
    
    return {
      total,
      paid,
      pending,
      overdue,
      totalAmount,
      paidAmount,
      pendingAmount,
      paidPercentage: total > 0 ? (paid / total) * 100 : 0,
      pendingPercentage: total > 0 ? (pending / total) * 100 : 0,
      overduePercentage: total > 0 ? (overdue / total) * 100 : 0
    };
  }, [accounts]);

  return stats;
};

/**
 * Hook para formatação de valores monetários
 */
export const useFinancialFormatting = () => {
  const formatCurrency = useCallback((value: number, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    }).format(value);
  }, []);

  const formatPercentage = useCallback((value: number, decimals = 1) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  }, []);

  const formatDate = useCallback((date: string | Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }, []);

  return {
    formatCurrency,
    formatPercentage,
    formatDate
  };
};