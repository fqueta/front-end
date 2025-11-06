/**
 * Hooks para gerenciar dados de atendimentos das aeronaves
 * Utiliza React Query para cache, sincronização e gerenciamento de estado
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aircraftAttendanceService } from '../services/aircraftAttendanceService';
import {
  AircraftAttendance,
  CreateAttendanceInput,
  UpdateAttendanceInput,
  AttendanceListParams,
  AttendanceListResponse,
  AttendanceHistory,
  AttendanceStats,
  AttendanceEvent,
  AttendanceStageInfo
} from '../types/aircraftAttendance';

// Chaves para cache do React Query
export const attendanceKeys = {
  all: ['aircraft-attendances'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params?: AttendanceListParams) => [...attendanceKeys.lists(), params] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
  history: (id: string) => [...attendanceKeys.all, 'history', id] as const,
  events: (id: string) => [...attendanceKeys.all, 'events', id] as const,
  stats: (filters?: any) => [...attendanceKeys.all, 'stats', filters] as const,
  timeline: (id: string) => [...attendanceKeys.all, 'timeline', id] as const,
  byAircraft: (aircraftId: string) => [...attendanceKeys.all, 'by-aircraft', aircraftId] as const,
  byServiceOrder: (serviceOrderId: string) => [...attendanceKeys.all, 'by-service-order', serviceOrderId] as const,
  active: () => [...attendanceKeys.all, 'active'] as const,
  byAssignee: (userId: string) => [...attendanceKeys.all, 'by-assignee', userId] as const,
  requiresAttention: () => [...attendanceKeys.all, 'requires-attention'] as const,
};

/**
 * Hook para listar atendimentos com filtros e paginação
 */
export function useAttendanceList(params?: AttendanceListParams) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => aircraftAttendanceService.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar um atendimento por ID
 */
export function useAttendance(id: string, includeDetails = false) {
  return useQuery({
    queryKey: attendanceKeys.detail(id),
    queryFn: () => aircraftAttendanceService.getById(id, includeDetails),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para buscar histórico de um atendimento
 */
export function useAttendanceHistory(id: string) {
  return useQuery({
    queryKey: attendanceKeys.history(id),
    queryFn: () => aircraftAttendanceService.getHistory(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para buscar eventos de um atendimento
 */
export function useAttendanceEvents(id: string, limit = 50) {
  return useQuery({
    queryKey: attendanceKeys.events(id),
    queryFn: () => aircraftAttendanceService.getEvents(id, limit),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 segundos
  });
}

/**
 * Hook para buscar timeline de etapas
 */
export function useAttendanceTimeline(id: string) {
  return useQuery({
    queryKey: attendanceKeys.timeline(id),
    queryFn: () => aircraftAttendanceService.getStagesTimeline(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para buscar estatísticas de atendimentos
 */
export function useAttendanceStats(filters?: any) {
  return useQuery({
    queryKey: attendanceKeys.stats(filters),
    queryFn: () => aircraftAttendanceService.getStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar atendimentos por aeronave
 */
export function useAttendancesByAircraft(
  aircraftId: string, 
  params?: Omit<AttendanceListParams, 'aircraft_id'>
) {
  return useQuery({
    queryKey: attendanceKeys.byAircraft(aircraftId),
    queryFn: () => aircraftAttendanceService.getByAircraft(aircraftId, params),
    enabled: !!aircraftId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para buscar atendimentos por ordem de serviço
 */
export function useAttendancesByServiceOrder(serviceOrderId: string) {
  return useQuery({
    queryKey: attendanceKeys.byServiceOrder(serviceOrderId),
    queryFn: () => aircraftAttendanceService.getByServiceOrder(serviceOrderId),
    enabled: !!serviceOrderId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para buscar atendimentos ativos
 */
export function useActiveAttendances(params?: Omit<AttendanceListParams, 'status'>) {
  return useQuery({
    queryKey: attendanceKeys.active(),
    queryFn: () => aircraftAttendanceService.getActive(params),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 2 * 60 * 1000, // Atualiza a cada 2 minutos
  });
}

/**
 * Hook para buscar atendimentos por responsável
 */
export function useAttendancesByAssignee(
  userId: string, 
  params?: Omit<AttendanceListParams, 'assigned_to'>
) {
  return useQuery({
    queryKey: attendanceKeys.byAssignee(userId),
    queryFn: () => aircraftAttendanceService.getByAssignee(userId, params),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para buscar atendimentos que precisam de atenção
 */
export function useAttendancesRequiringAttention() {
  return useQuery({
    queryKey: attendanceKeys.requiresAttention(),
    queryFn: () => aircraftAttendanceService.getRequiringAttention(),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 minutos
  });
}

/**
 * Hook para criar um novo atendimento
 */
export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttendanceInput) => aircraftAttendanceService.create(data),
    onSuccess: (newAttendance) => {
      // Invalida listas para atualizar
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.active() });
      
      // Adiciona o novo atendimento ao cache
      queryClient.setQueryData(
        attendanceKeys.detail(newAttendance.id),
        newAttendance
      );

      toast.success('Atendimento criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar atendimento');
    },
  });
}

/**
 * Hook para atualizar um atendimento
 */
export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceInput }) =>
      aircraftAttendanceService.update(id, data),
    onSuccess: (updatedAttendance) => {
      // Atualiza o cache do atendimento específico
      queryClient.setQueryData(
        attendanceKeys.detail(updatedAttendance.id),
        updatedAttendance
      );

      // Invalida listas para atualizar
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.active() });

      toast.success('Atendimento atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar atendimento');
    },
  });
}

/**
 * Hook para deletar um atendimento
 */
export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aircraftAttendanceService.remove(id),
    onSuccess: (_, deletedId) => {
      // Remove do cache
      queryClient.removeQueries({ queryKey: attendanceKeys.detail(deletedId) });
      queryClient.removeQueries({ queryKey: attendanceKeys.history(deletedId) });
      queryClient.removeQueries({ queryKey: attendanceKeys.events(deletedId) });
      queryClient.removeQueries({ queryKey: attendanceKeys.timeline(deletedId) });

      // Invalida listas
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.active() });

      toast.success('Atendimento removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover atendimento');
    },
  });
}

/**
 * Hook para atualizar status do atendimento
 */
export function useUpdateAttendanceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reason }: { 
      id: string; 
      status: AircraftAttendance['status']; 
      reason?: string 
    }) => aircraftAttendanceService.updateStatus(id, status, reason),
    onSuccess: (updatedAttendance) => {
      // Atualiza caches
      queryClient.setQueryData(
        attendanceKeys.detail(updatedAttendance.id),
        updatedAttendance
      );
      
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.events(updatedAttendance.id) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() });

      toast.success('Status atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar status');
    },
  });
}

/**
 * Hook para atribuir responsável
 */
export function useAssignAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId, reason }: { 
      id: string; 
      userId: string; 
      reason?: string 
    }) => aircraftAttendanceService.assignTo(id, userId, reason),
    onSuccess: (updatedAttendance) => {
      queryClient.setQueryData(
        attendanceKeys.detail(updatedAttendance.id),
        updatedAttendance
      );
      
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.events(updatedAttendance.id) });

      toast.success('Responsável atribuído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atribuir responsável');
    },
  });
}

/**
 * Hook para mover atendimento para nova etapa
 */
export function useMoveAttendanceToStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stageId, reason }: { 
      id: string; 
      stageId: string; 
      reason?: string 
    }) => aircraftAttendanceService.moveToStage(id, stageId, reason),
    onSuccess: (updatedAttendance) => {
      queryClient.setQueryData(
        attendanceKeys.detail(updatedAttendance.id),
        updatedAttendance
      );
      
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.events(updatedAttendance.id) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.timeline(updatedAttendance.id) });

      toast.success('Atendimento movido para nova etapa!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao mover atendimento');
    },
  });
}

/**
 * Hook para adicionar observação
 */
export function useAddAttendanceNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note, isInternal }: { 
      id: string; 
      note: string; 
      isInternal?: boolean 
    }) => aircraftAttendanceService.addNote(id, note, isInternal),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.events(id) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.history(id) });

      toast.success('Observação adicionada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao adicionar observação');
    },
  });
}

/**
 * Hook para duplicar atendimento
 */
export function useDuplicateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, overrides }: { 
      id: string; 
      overrides?: Partial<CreateAttendanceInput> 
    }) => aircraftAttendanceService.duplicate(id, overrides),
    onSuccess: (newAttendance) => {
      queryClient.setQueryData(
        attendanceKeys.detail(newAttendance.id),
        newAttendance
      );
      
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });

      toast.success('Atendimento duplicado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao duplicar atendimento');
    },
  });
}