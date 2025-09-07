import { Service, CreateServiceInput, UpdateServiceInput, ServiceFilters } from '@/types/services';
import { servicesService, ServiceListParams } from '@/services/servicesService';
import { useGenericApi } from './useGenericApi';
import { useQuery } from '@tanstack/react-query';

/**
 * Função para obter os hooks de serviços
 */
function getServicesApi() {
  return useGenericApi<Service, CreateServiceInput, UpdateServiceInput, ServiceListParams>({
    service: servicesService,
    queryKey: 'services',
    entityName: 'Serviço'
  });
}

// Exporta os hooks individuais para manter compatibilidade
export function useServicesList(params?: ServiceListParams, queryOptions?: any) {
  const api = getServicesApi();
  return api.useList(params, queryOptions);
}

export function useService(id: string, queryOptions?: any) {
  const api = getServicesApi();
  return api.useGetById(id, queryOptions);
}

export function useCreateService(mutationOptions?: any) {
  const api = getServicesApi();
  return api.useCreate(mutationOptions);
}

export function useUpdateService(mutationOptions?: any) {
  const api = getServicesApi();
  return api.useUpdate(mutationOptions);
}

export function useDeleteService(mutationOptions?: any) {
  const api = getServicesApi();
  return api.useDelete(mutationOptions);
}

// Hook para categorias de serviços
export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: () => servicesService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para unidades de tempo de serviços
export function useServiceUnits() {
  return useQuery({
    queryKey: ['service-units'],
    queryFn: () => servicesService.getUnits(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook principal para API de serviços
 */
export const useServicesApi = getServicesApi;