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
  return api.useList(params, queryOptions);
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
    staleTime: 5 * 60 * 1000, // 5 minutos
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