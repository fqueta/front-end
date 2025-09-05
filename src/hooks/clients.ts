import { ClientRecord, CreateClientInput, UpdateClientInput, ClientsListParams } from '@/types/clients';
import { clientsService } from '@/services/clientsService';
import { useGenericApi } from './useGenericApi';

/**
 * Função para obter os hooks de clientes
 */
function getClientsApi() {
  return useGenericApi<ClientRecord, CreateClientInput, UpdateClientInput, ClientsListParams>({
    service: clientsService,
    queryKey: 'clients',
    entityName: 'Cliente'
  });
}

// Exporta os hooks individuais para manter compatibilidade
export function useClientsList(params?: ClientsListParams, queryOptions?: any) {
  const api = getClientsApi();
  return api.useList(params, queryOptions);
}

export function useClient(id: string, queryOptions?: any) {
  const api = getClientsApi();
  return api.useGetById(id, queryOptions);
}

export function useCreateClient(mutationOptions?: any) {
  const api = getClientsApi();
  return api.useCreate(mutationOptions);
}

export function useUpdateClient(mutationOptions?: any) {
  const api = getClientsApi();
  return api.useUpdate(mutationOptions);
}

export function useDeleteClient(mutationOptions?: any) {
  const api = getClientsApi();
  return api.useDelete(mutationOptions);
}

// Exporta função para uso avançado
export const useClientsApi = getClientsApi;