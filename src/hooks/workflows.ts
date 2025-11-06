import { 
  Workflow, 
  CreateWorkflowDTO, 
  UpdateWorkflowDTO, 
  WorkflowListParams,
  WorkflowStats,
  SyncStatus,
  SyncConflict
} from '@/types';
import { workflowsService } from '@/services/workflowsService';
import { useGenericApi } from './useGenericApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Função para obter os hooks de workflows
 */
function getWorkflowsApi() {
  return useGenericApi<Workflow, CreateWorkflowDTO, UpdateWorkflowDTO, WorkflowListParams>({
    service: workflowsService,
    queryKey: 'workflows',
    entityName: 'Workflow'
  });
}

// Exporta os hooks individuais para manter compatibilidade
export function useWorkflowsList(params?: WorkflowListParams, queryOptions?: any) {
  const api = getWorkflowsApi();
  const safeQueryOptions = {
    retry: (failureCount: number, error: any) => {
      if (error?.status === 404 || (error?.status >= 400 && error?.status < 500)) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos para listas
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    ...queryOptions
  };
  return api.useList(params, safeQueryOptions);
}

export function useWorkflow(id: string, queryOptions?: any) {
  const api = getWorkflowsApi();
  return api.useGetById(id, queryOptions);
}

export function useCreateWorkflow(mutationOptions?: any) {
  const api = getWorkflowsApi();
  return api.useCreate(mutationOptions);
}

export function useUpdateWorkflow(mutationOptions?: any) {
  const api = getWorkflowsApi();
  return api.useUpdate(mutationOptions);
}

export function useDeleteWorkflow(mutationOptions?: any) {
  const api = getWorkflowsApi();
  return api.useDelete(mutationOptions);
}

// Hook para workflows de um funil específico
export function useWorkflowsByFunnel(funnelId: string, params?: Omit<WorkflowListParams, 'funnelId'>, queryOptions?: any) {
  return useQuery({
    queryKey: ['workflows', 'by-funnel', funnelId, params],
    queryFn: () => workflowsService.getWorkflowsByFunnel(funnelId, params),
    enabled: !!funnelId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount: number, error: any) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    ...queryOptions
  });
}

// Hook para alternar status do workflow
export function useToggleWorkflowStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      workflowsService.toggleWorkflowStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflows', 'by-funnel'] });
    },
  });
}

// Hook para estatísticas do workflow
export function useWorkflowStats(id: string, queryOptions?: any) {
  return useQuery({
    queryKey: ['workflow-stats', id],
    queryFn: () => workflowsService.getWorkflowStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount: number, error: any) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    ...queryOptions
  });
}

// Hook para duplicar workflow
export function useDuplicateWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      workflowsService.duplicateWorkflow(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflows', 'by-funnel'] });
    },
  });
}

// HOOKS DE SINCRONIZAÇÃO

// Hook para sincronizar dados locais com a API
export function useSyncLocalData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => workflowsService.syncLocalData(),
    onSuccess: () => {
      // Invalida todas as queries relacionadas após sincronização
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
    },
  });
}

// Hook para obter status de sincronização
export function useSyncStatus(queryOptions?: any) {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: () => workflowsService.getSyncStatus(),
    staleTime: 30 * 1000, // 30 segundos (dados dinâmicos)
    refetchInterval: 60 * 1000, // Atualiza a cada minuto
    retry: (failureCount: number, error: any) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    ...queryOptions
  });
}

// Hook para forçar sincronização da API
export function useForceSyncFromApi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => workflowsService.forceSyncFromApi(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
    },
  });
}

// Hook para enviar dados locais para API
export function usePushLocalData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => workflowsService.pushLocalData(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
    },
  });
}

// Hook para resolver conflitos de sincronização
export function useResolveConflicts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conflicts: SyncConflict[]) => workflowsService.resolveConflicts(conflicts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
    },
  });
}

// Hook para workflows ativos (usado em seletores)
export function useActiveWorkflows(queryOptions?: any) {
  return useQuery({
    queryKey: ['workflows', 'active'],
    queryFn: () => workflowsService.listWorkflows({ isActive: true }),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount: number, error: any) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...queryOptions
  });
}

// Hook para workflows ativos de um funil específico
export function useActiveWorkflowsByFunnel(funnelId: string, queryOptions?: any) {
  return useQuery({
    queryKey: ['workflows', 'active', 'by-funnel', funnelId],
    queryFn: () => workflowsService.getWorkflowsByFunnel(funnelId, { isActive: true }),
    enabled: !!funnelId,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount: number, error: any) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...queryOptions
  });
}

// Hook combinado para monitoramento de sincronização em tempo real
export function useSyncMonitor() {
  const syncStatus = useSyncStatus();
  const syncLocalData = useSyncLocalData();
  const forceSyncFromApi = useForceSyncFromApi();
  const pushLocalData = usePushLocalData();
  const resolveConflicts = useResolveConflicts();

  return {
    status: syncStatus.data,
    isLoading: syncStatus.isLoading,
    error: syncStatus.error,
    refetch: syncStatus.refetch,
    
    // Ações de sincronização
    syncLocal: syncLocalData.mutate,
    forceSync: forceSyncFromApi.mutate,
    pushLocal: pushLocalData.mutate,
    resolveConflicts: resolveConflicts.mutate,
    
    // Estados das mutações
    isSyncing: syncLocalData.isPending || forceSyncFromApi.isPending || 
               pushLocalData.isPending || resolveConflicts.isPending,
    syncError: syncLocalData.error || forceSyncFromApi.error || 
               pushLocalData.error || resolveConflicts.error
  };
}

// Exporta função para uso avançado
export const useWorkflowsApi = getWorkflowsApi;