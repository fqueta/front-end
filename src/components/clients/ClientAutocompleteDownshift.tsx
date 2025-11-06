import React, { useMemo, useState, useCallback } from 'react';
import { useCombobox } from 'downshift';
import { useClientsList } from '@/hooks/clients';
import { useDebounce } from '@/hooks/useDebounce';
import { Client } from '@/types/clients';
import { ChevronDown, X, Search } from 'lucide-react';

/**
 * Props do componente ClientAutocompleteDownshift
 */
interface ClientAutocompleteDownshiftProps {
  onClientSelect: (client: Client | null) => void;
  selectedClient?: Client | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Componente de autocomplete para clientes usando Downshift
 * Otimizado para performance e compatibilidade com Firefox
 */
export const ClientAutocompleteDownshift: React.FC<ClientAutocompleteDownshiftProps> = ({
  onClientSelect,
  selectedClient,
  placeholder = "Buscar cliente...",
  disabled = false,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState('');
  const debouncedSearchTerm = useDebounce(inputValue, 300);
  
  // Hook para buscar clientes da API
  const { data: apiClientsResponse, isLoading } = useClientsList({
    search: debouncedSearchTerm,
    enabled: debouncedSearchTerm.length >= 2,
  });

  // Extrair array de clientes da resposta paginada
  const apiClients = apiClientsResponse?.data || [];

  // Filtrar clientes baseado no termo de busca
  const filteredClients = useMemo(() => {
    if (!inputValue) return apiClients.slice(0, 10); // Limitar a 10 itens iniciais
    
    return apiClients.filter(client =>
      client.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      client.email.toLowerCase().includes(inputValue.toLowerCase()) ||
      (client.phone && client.phone.includes(inputValue))
    ).slice(0, 20); // Limitar a 20 resultados
  }, [apiClients, inputValue]);

  // Configuração do Downshift
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
    selectItem,
    reset,
  } = useCombobox({
    items: filteredClients,
    itemToString: (item) => item ? `${item.name} - ${item.email}` : '',
    selectedItem: selectedClient,
    onSelectedItemChange: ({ selectedItem }) => {
      onClientSelect(selectedItem || null);
    },
    onInputValueChange: ({ inputValue }) => {
      setInputValue(inputValue || '');
    },
    stateReducer: (state, actionAndChanges) => {
      const { type, changes } = actionAndChanges;
      
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: false,
            highlightedIndex: -1,
          };
        default:
          return changes;
      }
    },
  });

  // Handler para limpar seleção
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    reset();
    onClientSelect(null);
    setInputValue('');
  }, [reset, onClientSelect]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Label (oculto visualmente mas acessível) */}
      <label {...getLabelProps()} className="sr-only">
        Selecionar cliente
      </label>
      
      {/* Container do input */}
      <div className="relative">
        {/* Ícone de busca */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        
        {/* Input */}
        <input
          {...getInputProps({
            disabled,
            placeholder,
            className: `
              w-full pl-10 pr-20 py-2 border border-gray-300 rounded-md
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              transform-gpu click-optimized
            `,
          })}
        />
        
        {/* Botões de ação */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Botão de limpar */}
          {selectedItem && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded transform-gpu click-optimized"
              disabled={disabled}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          
          {/* Botão de toggle */}
          <button
            type="button"
            {...getToggleButtonProps({
              disabled,
              className: `
                p-1 hover:bg-gray-100 rounded transform-gpu click-optimized
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `,
            })}
          >
            <ChevronDown 
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </button>
        </div>
      </div>
      
      {/* Menu dropdown */}
      <div
        {...getMenuProps({
          className: `
            absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg
            max-h-60 overflow-y-auto scroll-optimized firefox-scroll-fix transform-gpu
            ${isOpen ? 'block' : 'hidden'}
          `,
        })}
      >
        {isOpen && (
          <>
            {/* Loading state */}
            {isLoading && (
              <div className="px-3 py-2 text-sm text-gray-500">
                Carregando clientes...
              </div>
            )}
            
            {/* Lista de clientes */}
            {!isLoading && filteredClients.length > 0 && (
              filteredClients.map((client, index) => (
                <div
                  key={client.id}
                  {...getItemProps({
                    item: client,
                    index,
                    className: `
                      px-3 py-2 cursor-pointer text-sm transform-gpu click-optimized
                      ${highlightedIndex === index ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                      ${selectedItem?.id === client.id ? 'bg-blue-100 font-medium' : ''}
                      hover:bg-blue-50 hover:text-blue-900
                    `,
                  })}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{client.name}</span>
                    <span className="text-xs text-gray-500">{client.email}</span>
                    {client.phone && (
                      <span className="text-xs text-gray-500">{client.phone}</span>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {/* Estado vazio */}
            {!isLoading && filteredClients.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                {inputValue ? 'Nenhum cliente encontrado' : 'Digite para buscar clientes'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientAutocompleteDownshift;