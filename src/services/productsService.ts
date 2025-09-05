import { BaseApiService } from './BaseApiService';
import { Product, CreateProductInput, UpdateProductInput, ProductFilters } from '@/types/products';
import { ApiResponse, PaginatedResponse } from '@/types/index';

/**
 * Parâmetros para listagem de produtos
 */
export interface ProductListParams extends ProductFilters {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Serviço para gerenciar produtos
 * Estende BaseApiService para reutilizar funcionalidades comuns
 */
class ProductsService extends BaseApiService {
  private readonly endpoint = '/products';

  /**
   * Lista todos os produtos com paginação e filtros
   * @param params - Parâmetros de filtro e paginação
   */
  async listProducts(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
    const response = await this.get<any>(this.endpoint, params);
    return this.normalizePaginatedResponse<Product>(response);
  }

  /**
   * Obtém um produto por ID
   * @param id - ID do produto
   */
  async getProduct(id: string): Promise<Product> {
    const response = await this.get<ApiResponse<Product>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Cria um novo produto
   * @param data - Dados do produto
   */
  async createProduct(data: CreateProductInput): Promise<Product> {
    const response = await this.post<ApiResponse<Product>>(this.endpoint, data);
    return response.data;
  }

  /**
   * Atualiza um produto existente
   * @param id - ID do produto
   * @param data - Dados para atualização
   */
  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    const response = await this.put<ApiResponse<Product>>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Exclui um produto
   * @param id - ID do produto
   */
  async deleteProduct(id: string): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Lista categorias de produtos
   */
  async getCategories(): Promise<{ id: string; name: string }[]> {
    const response = await this.get<ApiResponse<{ id: string; name: string }[]>>('/product-categories');
    return response.data;
  }

  /**
   * Lista unidades de medida
   */
  async getUnits(): Promise<{ value: string; label: string }[]> {
    const response = await this.get<ApiResponse<{ value: string; label: string }[]>>('/product-units');
    return response.data;
  }

  // Métodos genéricos para compatibilidade com useGenericApi
  async list(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
    return this.listProducts(params);
  }

  async getById(id: string): Promise<Product> {
    return this.getProduct(id);
  }

  async create(data: CreateProductInput): Promise<Product> {
    return this.createProduct(data);
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    return this.updateProduct(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.deleteProduct(id);
  }
}

// Exporta uma instância do serviço
export const productsService = new ProductsService();