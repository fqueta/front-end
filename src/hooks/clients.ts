import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '@/services/clientsService';
import { 
  ClientRecord, 
  CreateClientInput, 
  UpdateClientInput, 
  ClientsListParams 
} from '@/types/clients';
import { toast } from '@/hooks/use-toast';

const CLIENTS_QUERY_KEY = 'clients';

export function useClientsList(params?: ClientsListParams) {
  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY, 'list', params],
    queryFn: () => clientsService.listClients(params),
    retry: (failureCount, error: any) => {
      if (error?.status === 403) return false;
      return failureCount < 2;
    },
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY, 'detail', id],
    queryFn: () => clientsService.getClient(id),
    enabled: !!id,
    retry: (failureCount, error: any) => {
      if (error?.status === 403) return false;
      return failureCount < 2;
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientInput) => clientsService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
      toast({
        title: "Cliente criado",
        description: "O cliente foi criado com sucesso.",
      });
    },
    onError: (error: Error & { status?: number }) => {
      toast({
        title: "Erro ao criar cliente",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) => 
      clientsService.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
      toast({
        title: "Cliente atualizado",
        description: "O cliente foi atualizado com sucesso.",
      });
    },
    onError: (error: Error & { status?: number }) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });
    },
    onError: (error: Error & { status?: number }) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}