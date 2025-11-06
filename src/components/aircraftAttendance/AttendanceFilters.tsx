/**
 * Componente de filtros avançados para atendimentos de aeronaves
 * Permite filtrar por status, prioridade, responsável, período, etc.
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  Plane,
  Building,
  Tag,
  Clock,
  AlertTriangle,
  ChevronDown,
  RotateCcw
} from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';

import { AttendanceFilters as FilterType } from '../../types/aircraftAttendance';

interface AttendanceFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  className?: string;
}

/**
 * Opções de status disponíveis
 */
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
  { value: 'on_hold', label: 'Em Espera', color: 'bg-orange-100 text-orange-800' },
  { value: 'completed', label: 'Concluído', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

/**
 * Opções de prioridade disponíveis
 */
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Média', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' },
];

export function AttendanceFilters({
  filters,
  onFiltersChange,
  onSearch,
  searchQuery,
  className = ''
}: AttendanceFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  /**
   * Atualiza um filtro específico
   */
  const updateFilter = (key: keyof FilterType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  /**
   * Remove um filtro específico
   */
  const removeFilter = (key: keyof FilterType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  /**
   * Limpa todos os filtros
   */
  const clearAllFilters = () => {
    onFiltersChange({});
    onSearch('');
  };

  /**
   * Conta quantos filtros estão ativos
   */
  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof FilterType] !== undefined && 
    filters[key as keyof FilterType] !== null &&
    filters[key as keyof FilterType] !== ''
  ).length;

  /**
   * Verifica se há filtros ativos
   */
  const hasActiveFilters = activeFiltersCount > 0 || searchQuery.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de busca principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por título, aeronave, cliente ou responsável..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className={isAdvancedOpen ? 'bg-blue-50 border-blue-200' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
        </Button>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filtros ativos (badges) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Busca: "{searchQuery}"
              <button
                onClick={() => onSearch('')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Status: {STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => removeFilter('status')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.priority && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Prioridade: {PRIORITY_OPTIONS.find(p => p.value === filters.priority)?.label}
              <button
                onClick={() => removeFilter('priority')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.assigned_to && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Responsável: {filters.assigned_to}
              <button
                onClick={() => removeFilter('assigned_to')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.aircraft_id && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Plane className="h-3 w-3" />
              Aeronave: {filters.aircraft_id}
              <button
                onClick={() => removeFilter('aircraft_id')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.client_name && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              Cliente: {filters.client_name}
              <button
                onClick={() => removeFilter('client_name')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(filters.start_date || filters.end_date) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Período: {filters.start_date ? format(new Date(filters.start_date), 'dd/MM/yyyy', { locale: ptBR }) : '...'} - {filters.end_date ? format(new Date(filters.end_date), 'dd/MM/yyyy', { locale: ptBR }) : '...'}
              <button
                onClick={() => {
                  removeFilter('start_date');
                  removeFilter('end_date');
                }}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Filtros avançados */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleContent className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => updateFilter('status', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${status.color.split(' ')[0]}`} />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={filters.priority || ''}
                onValueChange={(value) => updateFilter('priority', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as prioridades</SelectItem>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${priority.color.split(' ')[0]}`} />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input
                placeholder="Nome do responsável"
                value={filters.assigned_to || ''}
                onChange={(e) => updateFilter('assigned_to', e.target.value || undefined)}
              />
            </div>

            {/* Cliente */}
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Input
                placeholder="Nome do cliente"
                value={filters.client_name || ''}
                onChange={(e) => updateFilter('client_name', e.target.value || undefined)}
              />
            </div>

            {/* Aeronave */}
            <div className="space-y-2">
              <Label>Aeronave</Label>
              <Input
                placeholder="Matrícula ou ID da aeronave"
                value={filters.aircraft_id || ''}
                onChange={(e) => updateFilter('aircraft_id', e.target.value || undefined)}
              />
            </div>

            {/* Funil */}
            <div className="space-y-2">
              <Label>Funil</Label>
              <Input
                placeholder="ID do funil"
                value={filters.funnel_id || ''}
                onChange={(e) => updateFilter('funnel_id', e.target.value || undefined)}
              />
            </div>
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label>Período</Label>
            <div className="flex gap-2">
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.start_date ? (
                      format(new Date(filters.start_date), 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      'Data inicial'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={filters.start_date ? new Date(filters.start_date) : undefined}
                    onSelect={(date) => {
                      updateFilter('start_date', date ? date.toISOString().split('T')[0] : undefined);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.end_date ? (
                      format(new Date(filters.end_date), 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      'Data final'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={filters.end_date ? new Date(filters.end_date) : undefined}
                    onSelect={(date) => {
                      updateFilter('end_date', date ? date.toISOString().split('T')[0] : undefined);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Ações dos filtros */}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              {activeFiltersCount > 0 ? `${activeFiltersCount} filtro(s) ativo(s)` : 'Nenhum filtro ativo'}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
              >
                Limpar Tudo
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAdvancedOpen(false)}
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}