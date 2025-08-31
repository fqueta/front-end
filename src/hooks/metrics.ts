import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metricsService } from '@/services/metricsService';
import { 
  MetricRecord, 
  CreateMetricInput, 
  UpdateMetricInput, 
  MetricsListParams 
} from '@/types/metrics';
import { useToast } from '@/hooks/use-toast';

export function useMetricsList(params?: MetricsListParams) {
  return useQuery({
    queryKey: ['metrics', 'list', params],
    queryFn: () => metricsService.listMetrics(params),
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useMetric(id: string) {
  return useQuery({
    queryKey: ['metrics', 'detail', id],
    queryFn: () => metricsService.getMetric(id),
    enabled: !!id,
  });
}

export function useCreateMetric() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateMetricInput) => metricsService.createMetric(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast({
        title: "Sucesso",
        description: "Permissão criada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar permissão",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMetric() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMetricInput }) => 
      metricsService.updateMetric(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast({
        title: "Sucesso",
        description: "Permissão atualizada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar permissão",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteMetric() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => metricsService.deleteMetric(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast({
        title: "Sucesso",
        description: "Permissão excluída com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir permissão",
        variant: "destructive",
      });
    },
  });
}