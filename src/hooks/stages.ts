import { 
  Stage, 
  CreateStageDTO, 
  UpdateStageDTO, 
  StageListParams 
} from '@/types';
import { stagesService } from '@/services/stagesService';
import { useGenericApi } from './useGenericApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Função para obter os hooks de etapas
 */
function getStagesApi() {
  return useGenericApi<Stage, CreateStageDTO, UpdateStageDTO, StageListParams>({
    service: stagesService,
    queryKey: 'stages',
    entityName: 'Etapa'
  });
}

// Exporta os hooks individuais para manter compatibilidade
export function useStagesList(params?: StageListParams, queryOptions?: any) {
  const api = getStagesApi();
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

export function useStage(id: string, queryOptions?: any) {
  const api = getStagesApi();
  return api.useGetById(id, queryOptions);
}

export function useCreateStage(mutationOptions?: any) {
  const api = getStagesApi();
  return api.useCreate(mutationOptions);
}

export function useUpdateStage(mutationOptions?: any) {
  const api = getStagesApi();
  return api.useUpdate(mutationOptions);
}

export function useDeleteStage(mutationOptions?: any) {
  const api = getStagesApi();
  return api.useDelete(mutationOptions);
}

// Hook para etapas de um funil específico
export function useStagesByFunnel(funnelId: string, params?: Omit<StageListParams, 'funnelId'>, queryOptions?: any) {
  return useQuery({
    queryKey: ['stages', 'by-funnel', funnelId, params],
    queryFn: async () => {
      const result = await stagesService.getStagesByFunnel(funnelId, params);
      return { data: result };
    },
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

// Hook para alternar status da etapa
export function useToggleStageStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      stagesService.toggleStageStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      // Invalida também as etapas do funil específico
      queryClient.invalidateQueries({ queryKey: ['stages', 'by-funnel'] });
    },
  });
}

// Hook para reordenar etapas com update otimista
export function useReorderStages() {
  const queryClient = useQueryClient();
  
  return useMutation({
    /**
     * Envia a nova ordem de IDs para o backend
     */
    mutationFn: ({ funnelId, stageIds }: { funnelId: string; stageIds: string[] }) =>
      stagesService.reorderStages(funnelId, stageIds),

    /**
     * Atualiza o cache de forma otimista para evitar "voltar" a posição após o drop
     * - Reordena apenas as etapas do funil alvo
     * - Atualiza o campo `order` para manter consistência
     */
    onMutate: async ({ funnelId, stageIds }) => {
      // Cancela queries pendentes para evitar sobrescrever o estado otimista
      await queryClient.cancelQueries({ queryKey: ['stages'] });
      await queryClient.cancelQueries({ queryKey: ['stages', 'by-funnel', funnelId] });

      // Snapshot do cache atual para rollback em caso de erro
      const prevList = queryClient.getQueryData<any>(['stages', 'list', undefined]);
      const prevByFunnel = queryClient.getQueryData<any>(['stages', 'by-funnel', funnelId, undefined]);

      // Helper para aplicar nova ordem dentro do funil
      const applyNewOrder = (stagesArr: Stage[]) => {
        const stagesMap = new Map(stagesArr.map(s => [String(s.id), s] as const));
        const reorderedInFunnel: Stage[] = stageIds
          .map(id => stagesMap.get(String(id)))
          .filter((s): s is Stage => !!s && s.funnelId === funnelId);

        // Atualiza a propriedade `order` conforme a nova posição
        reorderedInFunnel.forEach((s, idx) => { s.order = idx + 1; });

        // Mantém itens de outros funis e mescla com os reordenados
        const others = stagesArr.filter(s => s.funnelId !== funnelId);
        return [...others, ...reorderedInFunnel];
      };

      // Atualiza lista paginada principal (se existir)
      if (prevList?.data) {
        const newData = applyNewOrder(prevList.data as Stage[]);
        queryClient.setQueryData(['stages', 'list', undefined], { ...prevList, data: newData });
      }

      // Atualiza lista específica do funil (se existir)
      if (prevByFunnel?.data) {
        const newData = applyNewOrder(prevByFunnel.data as Stage[]).filter(s => s.funnelId === funnelId);
        queryClient.setQueryData(['stages', 'by-funnel', funnelId, undefined], { ...prevByFunnel, data: newData });
      }

      // Contexto para rollback
      return { prevList, prevByFunnel };
    },

    /**
     * Em caso de erro, restaura o cache anterior
     */
    onError: (_error, _variables, context) => {
      if (context?.prevList) {
        queryClient.setQueryData(['stages', 'list', undefined], context.prevList);
      }
      if (context?.prevByFunnel) {
        const key = ['stages', 'by-funnel', (_variables as any)?.funnelId, undefined];
        queryClient.setQueryData(key, context.prevByFunnel);
      }
    },

    /**
     * Após sucesso/erro, sincroniza com o backend
     */
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      queryClient.invalidateQueries({ queryKey: ['stages', 'by-funnel', variables.funnelId] });
    },
  });
}

// Hook para mover etapa para outro funil
export function useMoveStageToFunnel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ stageId, targetFunnelId, order }: { 
      stageId: string; 
      targetFunnelId: string; 
      order?: number 
    }) => stagesService.moveStageToFunnel(stageId, targetFunnelId, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      queryClient.invalidateQueries({ queryKey: ['stages', 'by-funnel'] });
    },
  });
}

// Hook para duplicar etapa
export function useDuplicateStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name, funnelId }: { 
      id: string; 
      name: string; 
      funnelId?: string 
    }) => stagesService.duplicateStage(id, name, funnelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      queryClient.invalidateQueries({ queryKey: ['stages', 'by-funnel'] });
    },
  });
}

// Hook para contagem de itens por etapa
export function useStageItemCount(stageId: string, queryOptions?: any) {
  return useQuery({
    queryKey: ['stage-item-count', stageId],
    queryFn: () => stagesService.getStageItemCount(stageId),
    enabled: !!stageId,
    staleTime: 2 * 60 * 1000, // 2 minutos (dados mais dinâmicos)
    retry: (failureCount: number, error: any) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    ...queryOptions
  });
}

// Hook para etapas ativas de um funil (usado em seletores)
export function useActiveStagesByFunnel(funnelId: string, queryOptions?: any) {
  return useQuery({
    queryKey: ['stages', 'active', 'by-funnel', funnelId],
    queryFn: () => stagesService.getStagesByFunnel(funnelId, { isActive: true }),
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

// Exporta função para uso avançado
export const useStagesApi = getStagesApi;

// Alias para compatibilidade
export const useStages = useStagesList;