/**
 * Componente de listagem de atendimentos de aeronaves
 * Exibe uma tabela com filtros, busca e paginação
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Plane,
  User,
  Calendar,
  Clock,
  AlertTriangle
} from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Skeleton } from '../ui/skeleton';

import { useAttendanceList, useDeleteAttendance } from '../../hooks/useAircraftAttendance';
import { AircraftAttendance, AttendanceFilters } from '../../types/aircraftAttendance';
import { AttendanceFilters as FiltersComponent } from './AttendanceFilters';

interface AttendanceListProps {
  onViewAttendance?: (attendance: AircraftAttendance) => void;
  onEditAttendance?: (attendance: AircraftAttendance) => void;
  onCreateAttendance?: () => void;
  showFilters?: boolean;
  showActions?: boolean;
}

/**
 * Retorna a cor do badge baseada no status
 */
const getStatusColor = (status: AttendanceStatus) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'on_hold':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Retorna o ícone baseado no status
 */
const getStatusIcon = (status: AttendanceStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-3 w-3" />;
    case 'in_progress':
      return <Clock className="h-3 w-3" />;
    case 'pending':
      return <AlertCircle className="h-3 w-3" />;
    case 'on_hold':
      return <Pause className="h-3 w-3" />;
    case 'cancelled':
      return <XCircle className="h-3 w-3" />;
    default:
      return null;
  }
};

/**
 * Retorna o texto do status em português
 */
const getStatusText = (status: AttendanceStatus) => {
  switch (status) {
    case 'completed':
      return 'Concluído';
    case 'in_progress':
      return 'Em Andamento';
    case 'pending':
      return 'Pendente';
    case 'on_hold':
      return 'Em Espera';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
};

/**
 * Retorna a cor do badge baseada na prioridade
 */
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function AttendanceList({
  onViewAttendance,
  onEditAttendance,
  onCreateAttendance,
  showFilters = true,
  showActions = true
}: AttendanceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AttendanceFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Parâmetros para a consulta
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    ...filters,
  };

  const { data, isLoading, error } = useAttendanceList(queryParams);
  const deleteAttendance = useDeleteAttendance();

  /**
   * Atualiza a página atual
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Atualiza o tamanho da página
   */
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset para primeira página
  };

  /**
   * Atualiza os filtros
   */
  const handleFiltersChange = (newFilters: AttendanceFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset para primeira página ao filtrar
  };

  /**
   * Atualiza a busca
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset para primeira página ao buscar
  };

  /**
   * Confirma e executa a exclusão
   */
  const handleDelete = async (attendance: AircraftAttendance) => {
    if (window.confirm(`Tem certeza que deseja excluir o atendimento "${attendance.title}"?`)) {
      try {
        await deleteAttendance.mutateAsync(attendance.id);
        refetch();
      } catch (error) {
        console.error('Erro ao excluir atendimento:', error);
      }
    }
  };

  /**
   * Exporta dados
   */
  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    // TODO: Implementar exportação
    console.log('Exportar como:', format);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Erro ao carregar atendimentos</p>
            <Button onClick={() => refetch()} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      {showActions && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Atendimentos de Aeronaves</h2>
            <p className="text-gray-600">
              {data?.total ? `${data.total} atendimento(s) encontrado(s)` : 'Carregando...'}
            </p>
          </div>
          {onCreateAttendance && (
            <Button onClick={onCreateAttendance}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Atendimento
            </Button>
          )}
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <FiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearchChange}
          searchQuery={searchQuery}
        />
      )}

      {/* Tabela de atendimentos */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSortChange('title')}
                >
                  Título
                </TableHead>
                <TableHead>Aeronave</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Etapa Atual</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSortChange('created_at')}
                >
                  Criado em
                </TableHead>
                {showActions && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    {showActions && <TableCell><Skeleton className="h-8 w-24" /></TableCell>}
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={showActions ? 9 : 8} 
                    className="text-center py-8 text-gray-500"
                  >
                    Nenhum atendimento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((attendance) => (
                  <TableRow key={attendance.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{attendance.title}</div>
                        {attendance.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {attendance.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-gray-400" />
                        <span>{attendance.aircraft?.registration || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{attendance.client_name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(attendance.status)}>
                        {getStatusIcon(attendance.status)}
                        <span className="ml-1">{getStatusText(attendance.status)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(attendance.priority)}>
                        {attendance.priority === 'urgent' ? 'Urgente' :
                         attendance.priority === 'high' ? 'Alta' :
                         attendance.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {attendance.current_stage_name ? (
                        <div className="text-sm">
                          <div className="font-medium">{attendance.current_stage_name}</div>
                          <div className="text-gray-500">{attendance.current_funnel_name}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {attendance.assigned_to_name ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{attendance.assigned_to_name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Não atribuído</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(attendance.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Ações
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onViewAttendance && (
                              <DropdownMenuItem onClick={() => onViewAttendance(attendance)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                            )}
                            {onEditAttendance && (
                              <DropdownMenuItem onClick={() => onEditAttendance(attendance)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(attendance)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginação */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Itens por página:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-gray-600">
            Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, data.total)} de {data.total} resultados
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {currentPage} de {Math.ceil(data.total / pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(data.total / pageSize)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}