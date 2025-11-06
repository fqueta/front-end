import React, { useMemo, useState, useCallback } from 'react';
import Select, { SingleValue, ActionMeta, StylesConfig } from 'react-select';
import { useAircraftList } from '@/hooks/aircraft';
import { useDebounce } from '@/hooks/useDebounce';
import type { AircraftRecord } from '@/types/aircraft';

/**
 * Componente de autocomplete para Aeronaves usando react-select.
 * Permite buscar por matrícula e exibe o nome do cliente associado.
 * Props simples: recebe aeronave selecionada e callback para seleção.
 */
interface AircraftOption {
  value: string;
  label: string;
  aircraft: AircraftRecord;
}

interface AircraftAutocompleteSelectProps {
  onAircraftSelect: (aircraft: AircraftRecord | null) => void;
  selectedAircraft?: AircraftRecord | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const AircraftAutocompleteSelect: React.FC<AircraftAutocompleteSelectProps> = ({
  onAircraftSelect,
  selectedAircraft,
  placeholder = 'Buscar aeronave...',
  disabled = false,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Busca aeronaves com filtro de termo
  const { data: apiAircraftResponse, isLoading } = useAircraftList({
    search: debouncedSearchTerm,
    per_page: 10,
  }, {
    enabled: debouncedSearchTerm.length >= 2,
  });

  const apiAircraft = (apiAircraftResponse?.data || []) as AircraftRecord[];

  // Converter para opções do select
  const options: AircraftOption[] = useMemo(() => (
    apiAircraft.map(a => ({
      value: String(a.id),
      label: `${a.matricula}${a.client?.name ? ` (${a.client.name})` : ''}`,
      aircraft: a,
    }))
  ), [apiAircraft]);

  // Valor selecionado
  const selectedValue = useMemo(() => {
    if (!selectedAircraft) return null;
    return {
      value: String(selectedAircraft.id),
      label: `${selectedAircraft.matricula}${selectedAircraft.client?.name ? ` (${selectedAircraft.client.name})` : ''}`,
      aircraft: selectedAircraft,
    } as AircraftOption;
  }, [selectedAircraft]);

  const handleChange = useCallback((
    newValue: SingleValue<AircraftOption>,
    actionMeta: ActionMeta<AircraftOption>
  ) => {
    if (actionMeta.action === 'clear' || !newValue) {
      onAircraftSelect(null);
    } else {
      onAircraftSelect(newValue.aircraft);
    }
  }, [onAircraftSelect]);

  const handleInputChange = useCallback((input: string) => {
    setSearchTerm(input);
  }, []);

  const customStyles: StylesConfig<AircraftOption, false> = {
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
      <Select<AircraftOption, false>
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
        loadingMessage={() => 'Carregando aeronaves...'}
        noOptionsMessage={() => (searchTerm ? 'Nenhuma aeronave encontrada' : 'Digite para buscar aeronaves')}
        className="transform-gpu click-optimized"
        classNamePrefix="aircraft-select"
        closeMenuOnScroll={false}
        blurInputOnSelect={false}
      />
    </div>
  );
};

export default AircraftAutocompleteSelect;