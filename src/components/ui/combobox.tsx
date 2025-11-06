import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  loading?: boolean
  onSearch?: (searchTerm: string) => void
  searchTerm?: string
  // Permite incluir ação de cadastro inline no autocomplete
  onCreateNew?: () => void
  createNewLabel?: string
}

/**
 * Componente Combobox reutilizável com funcionalidade de autocomplete
 * Baseado no Command component do shadcn/ui
 *
 * Adições:
 * - Suporte opcional a "Cadastrar novo" dentro da lista de autocomplete
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecione uma opção...",
  searchPlaceholder = "Pesquisar...",
  emptyText = "Nenhuma opção encontrada.",
  disabled = false,
  className,
  loading = false,
  onSearch,
  searchTerm,
  onCreateNew,
  createNewLabel = "Cadastrar novo registro...",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [localSearchValue, setLocalSearchValue] = React.useState("")

  // Memoizar a opção selecionada para evitar re-renderizações desnecessárias
  const selectedOption = React.useMemo(() => 
    options.find((option) => String(option.value) === String(value)),
    [options, value]
  );
  
  // Memoizar as opções filtradas - apenas para modo local (sem onSearch)
  const filteredOptions = React.useMemo(() => {
    if (onSearch) {
      // Modo controlado: retorna as opções como estão (já filtradas externamente)
      return options;
    }
    // Modo local: filtra baseado no valor local
    return options.filter((option) =>
      option.label.toLowerCase().includes(localSearchValue.toLowerCase())
    );
  }, [options, localSearchValue, onSearch]);

  // Handler de mudança de valor de busca - simplificado
  const handleSearchChange = React.useCallback((newValue: string) => {
    if (onSearch) {
      // Modo controlado: apenas chama a função externa
      onSearch(newValue);
    } else {
      // Modo local: atualiza estado interno
      setLocalSearchValue(newValue);
    }
  }, [onSearch]);

  // Handler de seleção - simplificado
  const handleSelect = React.useCallback((currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    onValueChange(newValue);
    setOpen(false);
  }, [value, onValueChange]);

  // Valor de busca a ser exibido no input
  const displaySearchValue = onSearch ? (searchTerm || "") : localSearchValue;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled || loading}
        >
          {loading ? (
            "Carregando..."
          ) : selectedOption ? (
            selectedOption.label
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={displaySearchValue}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {onCreateNew && (
                <CommandItem
                  key="__create_new__"
                  value="__create_new__"
                  onSelect={() => {
                    onCreateNew?.();
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createNewLabel}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Hook para transformar arrays de objetos em opções do Combobox
 */
export function useComboboxOptions<T extends Record<string, any>>(
  items: T[],
  valueKey: keyof T,
  labelKey: keyof T,
  disabledKey?: keyof T
): ComboboxOption[] {
  return React.useMemo(() => {
    return items.map((item) => ({
      value: String(item[valueKey]),
      label: String(item[labelKey]),
      disabled: disabledKey ? Boolean(item[disabledKey]) : false,
    }))
  }, [items, valueKey, labelKey, disabledKey])
}