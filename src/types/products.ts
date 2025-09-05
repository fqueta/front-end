/**
 * Tipos relacionados a produtos
 */

/**
 * Produto base
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  category_id?: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  unit: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Dados para criar um novo produto
 */
export interface CreateProductInput {
  name: string;
  description?: string;
  category: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  unit: string;
  active: boolean;
}

/**
 * Dados para atualizar um produto
 */
export interface UpdateProductInput {
  name?: string;
  description?: string;
  category?: string;
  salePrice?: number;
  costPrice?: number;
  stock?: number;
  unit?: string;
  active?: boolean;
}

/**
 * Registro de produto (usado em listagens)
 */
export interface ProductRecord extends Product {
  // Campos adicionais que podem vir da API
}

/**
 * Filtros para busca de produtos
 */
export interface ProductFilters {
  search?: string;
  category?: string;
  active?: boolean;
  lowStock?: boolean;
}

/**
 * Categoria de produto
 */
export interface ProductCategory {
  id: string;
  name: string;
}

/**
 * Unidade de medida
 */
export interface ProductUnit {
  value: string;
  label: string;
}