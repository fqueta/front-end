import React, { useState, useCallback, useMemo } from 'react';
import Select, { SingleValue, ActionMeta } from 'react-select';
import { useDebounce } from '@/hooks/useDebounce';
import { useClientsList } from '@/hooks/clients';
import { ClientRecord } from '@/types/clients';

/**
 * Interface para as opções do select de clientes
 */
export interface ClientOption {
  value: string;
  label: string;
  client: ClientRecord;
}

/**
 * Props do componente ClientAutocompleteSelect
 */
export interface ClientAutocompleteSelectProps {
  value?: ClientRecord | null;
  onChange: (client: ClientRecord | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  isClearable?: boolean;
}

/**
 * Componente de autocomplete para seleção de clientes usando react-select
 * Otimizado para performance com debounce e memoização
 */
export const ClientAutocompleteSelect: React.FC<ClientAutocompleteSelectProps> = ({
  value,
  onChange,
  placeholder = "Buscar cliente...",
  isDisabled = false,
  className = "",
  isClearable = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { data: clientsResponse, isLoading } = useClientsList({
    search: debouncedSearchTerm,
  }, {
    enabled: debouncedSearchTerm.length >= 2,
  });

  /**
   * Converte clientes em opções para o react-select
   */
  const options = useMemo(() => {
    const clients = clientsResponse?.data || [];
    return clients.map((client): ClientOption => ({
      value: client.id,
      label: `${client.name} - ${client.email || client.phone || 'Sem contato'}`,
      client,
    }));
  }, [clientsResponse]);

  /**
   * Valor atual selecionado
   */
  const selectedValue = useMemo(() => {
    if (!value) return null;
    return {
      value: value.id,
      label: `${value.name} - ${value.email || value.phone || 'Sem contato'}`,
      client: value,
    };
  }, [value]);

  /**
   * Handler para mudança de seleção
   */
  const handleChange = useCallback((
    newValue: SingleValue<ClientOption>,
    actionMeta: ActionMeta<ClientOption>
  ) => {
    if (actionMeta.action === 'clear') {
      onChange(null);
    } else if (newValue) {
      onChange(newValue.client);
    }
  }, [onChange]);

  /**
   * Handler para mudança no input de busca
   */
  const handleInputChange = useCallback((inputValue: string) => {
    setSearchTerm(inputValue);
  }, []);

  /**
   * Estilos customizados para o react-select
   */
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '40px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 99999,
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 99999,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#3b82f6' 
        : state.isFocused 
        ? '#eff6ff' 
        : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff',
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af',
    }),
    loadingMessage: (provided: any) => ({
      ...provided,
      color: '#6b7280',
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: '#6b7280',
    }),
  };

  return (
    <div className={className}>
      <Select<ClientOption>
        value={selectedValue}
        onChange={handleChange}
        onInputChange={handleInputChange}
        options={options}
        isLoading={isLoading}
        isDisabled={isDisabled}
        isClearable={isClearable}
        placeholder={placeholder}
        noOptionsMessage={() => 
          debouncedSearchTerm.length < 2 
            ? "Digite pelo menos 2 caracteres para buscar"
            : "Nenhum cliente encontrado"
        }
        loadingMessage={() => "Buscando clientes..."}
        styles={customStyles}
        menuPortalTarget={document.body}
        classNamePrefix="client-select"
        filterOption={() => true} // Desabilita filtro local, usa apenas busca do servidor
      />
    </div>
  );
};

export default ClientAutocompleteSelect;