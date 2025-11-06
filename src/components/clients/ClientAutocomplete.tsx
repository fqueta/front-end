import React, { useState, useEffect } from 'react';
import { useClientsList } from '@/hooks/clients';
import { Combobox } from '@/components/ui/combobox';
import { ClientRecord } from '@/types/clients';
import { useDebounce } from '@/hooks/useDebounce';



interface ClientAutocompleteProps {
  value?: string;
  onValueChange: (clientId: string) => void;
  onClientSelect?: (client: ClientRecord | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Componente de autocomplete para seleção de clientes
 * Busca na API com debounce
 */
export function ClientAutocomplete({
  value,
  onValueChange,
  onClientSelect,
  placeholder = "Digite o nome do cliente...",
  disabled = false,
  className,
}: ClientAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Busca clientes na API com debounce
  const { data: clientsResponse, isLoading, error } = useClientsList(
    {
      search: debouncedSearchTerm,
      per_page: 10,
    },
    {
      enabled: debouncedSearchTerm.length >= 2, // Só busca com 2+ caracteres
    }
  );
  
  // Usa apenas dados da API
  const clients = clientsResponse?.data || [];

  // Log apenas erros da API para debug
  if (error) {
    console.error('Erro ao buscar clientes:', error);
  }

  // Memoizar as opções do combobox
  const clientOptions = React.useMemo(() => 
    clients.map((client) => ({
      value: client.id,
      label: `${client.name} ${client.email ? `(${client.email})` : ''}`,
    })),
    [clients]
  );

  // Memoizar o cliente selecionado para evitar re-renderizações desnecessárias
  const selectedClient = React.useMemo(() => 
    clients.find((client) => client.id === value),
    [clients, value]
  );

  // Notifica quando um cliente é selecionado - otimizado para evitar loops
  useEffect(() => {
    if (onClientSelect && value && selectedClient) {
      onClientSelect(selectedClient);
    } else if (onClientSelect && !value) {
      onClientSelect(null);
    }
  }, [value, onClientSelect]); // Removido selectedClient das dependências para evitar loop

  // Memoizar handlers para evitar re-renderizações
  const handleValueChange = React.useCallback((clientId: string) => {
    onValueChange(clientId);
  }, [onValueChange]);

  const handleSearch = React.useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return (
    <Combobox
      options={clientOptions}
      value={value}
      onValueChange={handleValueChange}
      onSearch={handleSearch}
      searchTerm={searchTerm}
      placeholder={placeholder}
      searchPlaceholder="Digite o nome do cliente..."
      emptyText={
        searchTerm.length < 2
          ? "Digite pelo menos 2 caracteres para buscar na API"
          : "Nenhum cliente encontrado"
      }
      loading={isLoading && debouncedSearchTerm.length >= 2}
      disabled={disabled}
      className={className}
    />
  );
}