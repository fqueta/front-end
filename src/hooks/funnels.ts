import { 
  Funnel, 
  CreateFunnelDTO, 
  UpdateFunnelDTO, 
  FunnelListParams,
  FunnelStats 
} from '@/types';
import { funnelsService } from '@/services/funnelsService';
import { useGenericApi } from './useGenericApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Função para obter os hooks de funis
 */
function getFunnelsApi() {
  return useGenericApi<Funnel, CreateFunnelDTO, UpdateFunnelDTO, FunnelListParams>({
    service: funnelsService,
    queryKey: 'funnels',
    entityName: 'Funil'
  });
}

// Exporta os hooks individuais para manter compatibilidade
export function useFunnelsList(params?: FunnelListParams, queryOptions?: any) {
  const api = getFunnelsApi();
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

export function useFunnel(id: string, queryOptions?: any) {
  const api = getFunnelsApi();
  return api.useGetById(id, queryOptions);
}

export function useCreateFunnel(mutationOptions?: any) {
  const api = getFunnelsApi();
  return api.useCreate(mutationOptions);
}

export function useUpdateFunnel(mutationOptions?: any) {
  const api = getFunnelsApi();
  return api.useUpdate(mutationOptions);
}

export function useDeleteFunnel(mutationOptions?: any) {
  const api = getFunnelsApi();
  return api.useDelete(mutationOptions);
}

// Hook para alternar status do funil
export function useToggleFunnelStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      funnelsService.toggleFunnelStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
  });
}

// Hook para reordenar funis
export function useReorderFunnels() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (funnelIds: string[]) => funnelsService.reorderFunnels(funnelIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
  });
}

// Hook para estatísticas do funil
export function useFunnelStats(id: string, queryOptions?: any) {
  return useQuery({
    queryKey: ['funnel-stats', id],
    queryFn: () => funnelsService.getFunnelStats(id),
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

// Hook para duplicar funil
export function useDuplicateFunnel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      funnelsService.duplicateFunnel(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
  });
}

// Hook para funis ativos (usado em seletores)
export function useActiveFunnels(queryOptions?: any) {
  return useQuery({
    queryKey: ['funnels', 'active'],
    queryFn: () => funnelsService.listFunnels({ isActive: true }),
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

// Exporta função para uso avançado
export const useFunnelsApi = getFunnelsApi;

// Alias para compatibilidade
export const useFunnels = useFunnelsList;