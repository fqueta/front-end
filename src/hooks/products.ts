import { Product, CreateProductInput, UpdateProductInput, ProductFilters } from '@/types/products';
import { productsService, ProductListParams } from '@/services/productsService';
import { useGenericApi } from './useGenericApi';
import { useQuery } from '@tanstack/react-query';

/**
 * Função para obter os hooks de produtos
 */
function getProductsApi() {
  return useGenericApi<Product, CreateProductInput, UpdateProductInput, ProductListParams>({
    service: productsService,
    queryKey: 'products',
    entityName: 'Produto'
  });
}

// Exporta os hooks individuais para manter compatibilidade
export function useProductsList(params?: ProductListParams, queryOptions?: any) {
  const api = getProductsApi();
  // Configurações específicas para prevenir loops infinitos em listas vazias
  const safeQueryOptions = {
    retry: (failureCount: number, error: any) => {
      // Não tenta novamente para listas vazias (404) ou erros de cliente
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

export function useProduct(id: string, queryOptions?: any) {
  const api = getProductsApi();
  return api.useGetById(id, queryOptions);
}

export function useCreateProduct(mutationOptions?: any) {
  const api = getProductsApi();
  return api.useCreate(mutationOptions);
}

export function useUpdateProduct(mutationOptions?: any) {
  const api = getProductsApi();
  return api.useUpdate(mutationOptions);
}

export function useDeleteProduct(mutationOptions?: any) {
  const api = getProductsApi();
  return api.useDelete(mutationOptions);
}

// Hook para categorias de produtos
export function useProductCategories() {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: () => productsService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount: number, error: any) => {
      // Não tenta novamente para erros de cliente
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Hook para unidades de medida
export function useProductUnits() {
  return useQuery({
    queryKey: ['product-units'],
    queryFn: () => productsService.getUnits(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Exporta função para uso avançado
export const useProductsApi = getProductsApi;