import React, { useMemo, useState, useCallback } from 'react';
import Select, { SingleValue, ActionMeta, StylesConfig } from 'react-select';
import { useProductsList } from '@/hooks/products';
import { useDebounce } from '@/hooks/useDebounce';
import type { ProductRecord } from '@/types/products';

/**
 * Componente de autocomplete para Produtos usando react-select.
 * Filtra por nome/descrição e mostra preço e estoque na opção.
 */
interface ProductOption {
  value: string;
  label: string;
  product: ProductRecord;
}

interface ProductAutocompleteSelectProps {
  onProductSelect: (product: ProductRecord | null) => void;
  selectedProduct?: ProductRecord | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  excludeProductIds?: string[];
}

export const ProductAutocompleteSelect: React.FC<ProductAutocompleteSelectProps> = ({
  onProductSelect,
  selectedProduct,
  placeholder = 'Buscar produto...',
  disabled = false,
  className = '',
  excludeProductIds = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: apiProductsResponse, isLoading } = useProductsList({
    search: debouncedSearchTerm,
    per_page: 10,
  }, {
    enabled: debouncedSearchTerm.length >= 2,
  });

  const apiProducts = (apiProductsResponse?.data || []) as ProductRecord[];

  const filteredProducts = useMemo(() => {
    let products = apiProducts;
    if (excludeProductIds.length > 0) {
      products = products.filter(p => !excludeProductIds.includes(String(p.id)));
    }
    if (!searchTerm) return products.slice(0, 10);
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 20);
  }, [apiProducts, searchTerm, excludeProductIds]);

  const options: ProductOption[] = useMemo(() => (
    filteredProducts.map(p => ({
      value: String(p.id),
      label: `${p.name} - R$ ${Number(p.salePrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Estoque: ${Number(p.stock || 0)})`,
      product: p,
    }))
  ), [filteredProducts]);

  const selectedValue = useMemo(() => {
    if (!selectedProduct) return null;
    return {
      value: String(selectedProduct.id),
      label: `${selectedProduct.name} - R$ ${Number(selectedProduct.salePrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Estoque: ${Number(selectedProduct.stock || 0)})`,
      product: selectedProduct,
    } as ProductOption;
  }, [selectedProduct]);

  const handleChange = useCallback((
    newValue: SingleValue<ProductOption>,
    actionMeta: ActionMeta<ProductOption>
  ) => {
    if (actionMeta.action === 'clear' || !newValue) {
      onProductSelect(null);
    } else {
      onProductSelect(newValue.product);
    }
  }, [onProductSelect]);

  const handleInputChange = useCallback((input: string) => {
    setSearchTerm(input);
  }, []);

  const customStyles: StylesConfig<ProductOption, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': { borderColor: '#3b82f6' },
    }),
    menu: (provided) => ({ ...provided, zIndex: 99999 }),
    menuPortal: (provided) => ({ ...provided, zIndex: 99999 }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      cursor: 'pointer',
    }),
  };

  return (
    <div className={`w-full ${className}`}>
      <Select<ProductOption, false>
        value={selectedValue}
        onChange={handleChange}
        onInputChange={handleInputChange}
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        isLoading={isLoading}
        isClearable
        isSearchable
        filterOption={null}
        styles={customStyles}
        loadingMessage={() => 'Carregando produtos...'}
        noOptionsMessage={() => (searchTerm ? 'Nenhum produto encontrado' : 'Digite para buscar produtos')}
        className="transform-gpu click-optimized"
        classNamePrefix="product-select"
        closeMenuOnScroll={false}
        blurInputOnSelect={false}
      />
    </div>
  );
};

export default ProductAutocompleteSelect;