import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Select, { SingleValue, ActionMeta, components } from 'react-select';
import { useDebounce } from '@/hooks/useDebounce';
import { useClientsList } from '@/hooks/clients';
import { ClientRecord } from '@/types/clients';
import { Plus, User } from 'lucide-react';

/**
 * Interface para opções do select
 */
export interface ClientNameOption {
  value: string;
  label: string;
  client?: ClientRecord;
  isCreateNew?: boolean;
}

/**
 * Props do componente ClientNameAutocomplete
 */
export interface ClientNameAutocompleteProps {
  value?: string;
  onChange: (value: string, client?: ClientRecord | null) => void;
  onCreateNewClient?: (name: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  isClearable?: boolean;
}

/**
 * Componente customizado para a opção "Criar Novo Cliente"
 */
const CreateNewOption = (props: any) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      <Plus className="h-4 w-4 text-blue-500" />
      <span className="text-blue-500 font-medium">Criar Novo Cliente</span>
    </div>
  </components.Option>
);

/**
 * Componente customizado para opções de clientes existentes
 */
const ClientOption = (props: any) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      <User className="h-4 w-4 text-gray-500" />
      <div className="flex flex-col">
        <span className="font-medium">{props.data.client?.name}</span>
        <span className="text-xs text-gray-500">
          {props.data.client?.email} • {props.data.client?.phone}
        </span>
      </div>
    </div>
  </components.Option>
);

/**
 * Componente de autocomplete para nome de cliente que permite buscar clientes existentes
 * ou criar novos clientes diretamente no campo
 */
export const ClientNameAutocomplete: React.FC<ClientNameAutocompleteProps> = ({
  value = '',
  onChange,
  onCreateNewClient,
  placeholder = "Digite o nome do cliente...",
  isDisabled = false,
  className = "",
  isClearable = true,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>(value);
  const [selectedOption, setSelectedOption] = useState<ClientNameOption | null>(null);
  
  // Ref para rastrear a última sincronização e evitar loops
  const lastSyncedValue = useRef<string | undefined>(undefined);
  
  // Debounce do termo de busca para otimizar as consultas
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Hook para buscar clientes
  const { data: clientsResponse, isLoading } = useClientsList({
    search: debouncedSearchTerm,
    limit: 10,
    enabled: debouncedSearchTerm.length >= 2
  });

  // Extrai o array de clientes da resposta paginada
  const clients = clientsResponse?.data || [];

  /**
   * Gera as opções do select baseado nos clientes encontrados
   */
  const options = useMemo(() => {
    const clientOptions: ClientNameOption[] = clients.map(client => ({
      value: client.name,
      label: client.name,
      client
    }));

    // Adiciona opção "Criar Novo Cliente" se houver texto digitado
    if (searchTerm.trim().length > 0) {
      clientOptions.unshift({
        value: `create_new_${searchTerm}`,
        label: `Criar novo cliente: "${searchTerm}"`,
        isCreateNew: true
      });
    }

    return clientOptions;
  }, [clients, searchTerm]);

  /**
   * Sincroniza o valor externo com o estado interno
   */
  useEffect(() => {
    // Evitar loops infinitos - só sincronizar se o valor realmente mudou
    if (value !== undefined && value !== lastSyncedValue.current) {
      lastSyncedValue.current = value;
      
      if (value && value !== selectedOption?.value) {
        const existingOption = options.find(opt => opt.value === value);
        if (existingOption) {
          setSelectedOption(existingOption);
          setInputValue(existingOption.label);
        } else if (typeof value === 'string' && value.length > 0) {
          // Se não encontrou nas opções atuais e é uma string válida, criar uma opção temporária
          const tempOption: ClientNameOption = {
            value: value,
            label: value,
            client: undefined
          };
          setSelectedOption(tempOption);
          setInputValue(value);
        }
      } else if (!value && selectedOption) {
        // Se valor externo é vazio, limpar seleção apenas se há uma seleção atual
        setSelectedOption(null);
        setInputValue('');
      }
    }
  }, [value, options, selectedOption?.value]);

  /**
   * Efeito adicional para sincronizar quando uma opção correspondente é encontrada
   */
  useEffect(() => {
    if (value && !selectedOption && options.length > 0) {
      const matchingOption = options.find(opt => opt.value === value);
      if (matchingOption && value !== lastSyncedValue.current) {
        lastSyncedValue.current = value;
        setSelectedOption(matchingOption);
        setInputValue(matchingOption.label);
      }
    }
  }, [value, selectedOption, options]);

  /**
   * Handler para mudança de seleção
   */
  const handleChange = useCallback((
    newValue: SingleValue<ClientNameOption>,
    actionMeta: ActionMeta<ClientNameOption>
  ) => {
    if (actionMeta.action === 'clear') {
      setSelectedOption(null);
      setInputValue('');
      onChange('', null);
    } else if (newValue) {
      if (newValue.isCreateNew) {
        // Criar novo cliente - chamar callback se fornecido
        if (onCreateNewClient) {
          onCreateNewClient(searchTerm);
        } else {
          // Fallback: usar o termo de busca como nome
          setSelectedOption(null);
          setInputValue(searchTerm);
          onChange(searchTerm, null);
        }
      } else {
        // Cliente existente selecionado
        setSelectedOption(newValue);
        setInputValue(newValue.value);
        onChange(newValue.value, newValue.client || null);
      }
    }
  }, [onChange, onCreateNewClient, searchTerm]);

  /**
   * Handler para mudança no input de busca
   */
  const handleInputChange = useCallback((inputValue: string, actionMeta: any) => {
    if (actionMeta.action === 'input-change') {
      setSearchTerm(inputValue);
      setInputValue(inputValue);
      
      // Se o usuário está digitando livremente (não selecionou uma opção)
      if (!selectedOption || selectedOption.value !== inputValue) {
        onChange(inputValue, null);
      }
    } else if (actionMeta.action === 'set-value') {
      // Quando o valor é definido programaticamente, não devemos chamar onChange
      // para evitar loops infinitos
      setInputValue(inputValue);
    }
    return inputValue;
  }, [onChange, selectedOption]);

  /**
   * Estilos customizados para o react-select
   */
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '40px',
      borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      opacity: 1, // Forçar opacity 1
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    input: (provided: any) => ({
      ...provided,
      opacity: 1, // Corrigir opacity do input que estava em 0
      color: '#1e293b' // Garantir que o texto seja visível
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#3b82f6' 
        : state.isFocused 
          ? '#f1f5f9' 
          : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      padding: '8px 12px'
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999
    })
  };

  /**
   * Componentes customizados
   */
  const customComponents = {
    Option: (props: any) => {
      if (props.data.isCreateNew) {
        return <CreateNewOption {...props} />;
      }
      return <ClientOption {...props} />;
    }
  };

  return (
    <div className={className}>
      <Select<ClientNameOption>
        value={selectedOption}
        onChange={handleChange}
        onInputChange={handleInputChange}
        inputValue={inputValue}
        options={options}
        isLoading={isLoading}
        isDisabled={isDisabled}
        isClearable={isClearable}
        placeholder={placeholder}
        noOptionsMessage={() => 
          searchTerm.length < 2 
            ? "Digite pelo menos 2 caracteres para buscar" 
            : "Nenhum cliente encontrado"
        }
        loadingMessage={() => "Buscando clientes..."}
        styles={customStyles}
        components={customComponents}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        filterOption={() => true} // Desabilita filtro interno do react-select
      />
      
      {/* Texto de ajuda */}
      <p className="text-xs text-muted-foreground mt-1">
        Digite para buscar clientes existentes ou criar um novo cliente
      </p>
    </div>
  );
};

export default ClientNameAutocomplete;