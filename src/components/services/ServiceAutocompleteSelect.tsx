import React, { useMemo, useState, useCallback } from 'react';
import Select, { SingleValue, ActionMeta, StylesConfig } from 'react-select';
import { useServicesList } from '@/hooks/services';
import { useDebounce } from '@/hooks/useDebounce';
import { ServiceRecord } from '@/types/services';

/**
 * Interface para as opções do select
 */
interface ServiceOption {
  value: string;
  label: string;
  service: ServiceRecord;
}

/**
 * Props do componente ServiceAutocompleteSelect
 */
interface ServiceAutocompleteSelectProps {
  onServiceSelect: (service: ServiceRecord | null) => void;
  selectedService?: ServiceRecord | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  excludeServiceIds?: string[]; // IDs de serviços a serem excluídos da lista
}

/**
 * Componente de autocomplete para serviços usando react-select
 * Baseado no ClientAutocompleteSelect, otimizado para performance e compatibilidade
 */
export const ServiceAutocompleteSelect: React.FC<ServiceAutocompleteSelectProps> = ({
  onServiceSelect,
  selectedService,
  placeholder = "Buscar serviço...",
  disabled = false,
  className = "",
  excludeServiceIds = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Hook para buscar serviços da API
  const { data: apiServicesResponse, isLoading } = useServicesList({
    search: debouncedSearchTerm,
    enabled: debouncedSearchTerm.length >= 2,
  });

  // Extrair array de serviços da resposta paginada
  const apiServices = apiServicesResponse?.data || [];

  // Filtrar serviços baseado no termo de busca e excluir IDs especificados
  const filteredServices = useMemo(() => {
    let services = apiServices;
    
    // Excluir serviços já selecionados
    if (excludeServiceIds.length > 0) {
      services = services.filter(service => !excludeServiceIds.includes(String(service.id)));
    }
    
    if (!searchTerm) return services.slice(0, 10); // Limitar a 10 itens iniciais
    
    return services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 20); // Limitar a 20 resultados
  }, [apiServices, searchTerm, excludeServiceIds]);

  // Converter serviços para opções do select
  const serviceOptions: ServiceOption[] = useMemo(() => 
    filteredServices.map(service => ({
      value: String(service.id),
      label: `${service.name} - R$ ${service.price ? Number(service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}`,
      service,
    })), [filteredServices]
  );

  // Valor selecionado atual
  const selectedValue = useMemo(() => {
    if (!selectedService) return null;
    return {
      value: String(selectedService.id),
      label: `${selectedService.name} - R$ ${selectedService.price ? Number(selectedService.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}`,
      service: selectedService,
    };
  }, [selectedService]);

  // Handler para mudança de seleção
  const handleChange = useCallback((
    newValue: SingleValue<ServiceOption>,
    actionMeta: ActionMeta<ServiceOption>
  ) => {
    if (actionMeta.action === 'clear' || !newValue) {
      onServiceSelect(null);
    } else {
      onServiceSelect(newValue.service);
    }
  }, [onServiceSelect]);

  // Handler para mudança no input de busca
  const handleInputChange = useCallback((inputValue: string) => {
    setSearchTerm(inputValue);
  }, []);

  // Estilos customizados básicos para o react-select
  const customStyles: StylesConfig<ServiceOption, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: '#3b82f6',
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 99999, // Z-index alto para aparecer acima dos campos de input
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 99999, // Z-index alto para portal também
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#3b82f6' 
        : state.isFocused 
          ? '#eff6ff' 
          : 'white',
      color: state.isSelected ? 'white' : '#374151',
      cursor: 'pointer',
    }),
  };

  return (
    <div className={`w-full ${className}`}>
      <Select<ServiceOption, false>
        value={selectedValue}
        onChange={handleChange}
        onInputChange={handleInputChange}
        options={serviceOptions}
        placeholder={placeholder}
        isDisabled={disabled}
        isLoading={isLoading}
        isClearable
        isSearchable
        filterOption={null} // Desabilitar filtro interno para melhor performance
        styles={customStyles}
        loadingMessage={() => "Carregando serviços..."}
        noOptionsMessage={() => searchTerm ? "Nenhum serviço encontrado" : "Digite para buscar serviços"}
        className="transform-gpu click-optimized"
        classNamePrefix="service-select"
        // Configurações básicas para funcionamento
        closeMenuOnScroll={false}
        blurInputOnSelect={false}
        // Handler simples para garantir visibilidade
        onMenuOpen={() => {
          console.log('Service menu opened - checking visibility');
        }}
      />
    </div>
  );
};

export default ServiceAutocompleteSelect;