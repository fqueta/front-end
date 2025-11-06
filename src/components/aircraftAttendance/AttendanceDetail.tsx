/**
 * Componente de visualização detalhada de atendimento
 * Exibe informações completas, histórico, timeline de etapas e eventos
 */

import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  Plane,
  FileText,
  MessageSquare,
  ArrowRight,
  Edit,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  MapPin,
  Activity,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarInitials } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Textarea } from '../ui/textarea';

import {
  useAttendance,
  useAttendanceHistory,
  useAttendanceEvents,
  useAttendanceTimeline,
  useAddAttendanceNote,
  useUpdateAttendanceStatus,
  useMoveAttendanceToStage
} from '../../hooks/useAircraftAttendance';
import { AircraftAttendance, AttendanceStatus, AttendanceEvent, AttendanceStageInfo } from '../../types/aircraftAttendance';

interface AttendanceDetailProps {
  attendanceId: string;
  onEdit?: (attendance: AircraftAttendance) => void;
  onClose?: () => void;
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
      return <CheckCircle className="h-4 w-4" />;
    case 'in_progress':
      return <Clock className="h-4 w-4" />;
    case 'pending':
      return <AlertCircle className="h-4 w-4" />;
    case 'on_hold':
      return <Pause className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
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
 * Componente de timeline de etapas
 */
function StagesTimeline({ stages }: { stages: AttendanceStageInfo[] }) {
  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
        <div key={stage.stage_id} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${
              stage.exited_at ? 'bg-green-500' : 'bg-blue-500'
            }`} />
            {index < stages.length - 1 && (
              <div className="w-px h-8 bg-gray-200 mt-2" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{stage.stage_name}</h4>
                <p className="text-sm text-gray-500">{stage.funnel_name}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                {stage.duration_minutes && (
                  <div>{Math.round(stage.duration_minutes / 60)}h {stage.duration_minutes % 60}m</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Entrada: {format(new Date(stage.entered_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </div>
              {stage.exited_at && (
                <div className="flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  Saída: {format(new Date(stage.exited_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
              )}
            </div>
            {stage.notes && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                {stage.notes}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Componente de lista de eventos
 */
function EventsList({ events }: { events: AttendanceEvent[] }) {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'stage_change':
        return <MapPin className="h-4 w-4" />;
      case 'status_change':
        return <Activity className="h-4 w-4" />;
      case 'note_added':
        return <MessageSquare className="h-4 w-4" />;
      case 'service_added':
      case 'service_removed':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            {getEventIcon(event.event_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{event.description}</p>
              <time className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(event.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </time>
            </div>
            {event.user_name && (
              <p className="text-xs text-gray-500 mt-1">
                por {event.user_name}
              </p>
            )}
            {(event.previous_value || event.new_value) && (
              <div className="mt-2 text-xs">
                {event.previous_value && (
                  <span className="text-red-600">De: {event.previous_value}</span>
                )}
                {event.previous_value && event.new_value && (
                  <span className="mx-2 text-gray-400">→</span>
                )}
                {event.new_value && (
                  <span className="text-green-600">Para: {event.new_value}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AttendanceDetail({ attendanceId, onEdit, onClose }: AttendanceDetailProps) {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const { data: attendance, isLoading, error } = useAttendance(attendanceId, true);
  const { data: history } = useAttendanceHistory(attendanceId);
  const { data: events } = useAttendanceEvents(attendanceId);
  const { data: timeline } = useAttendanceTimeline(attendanceId);

  const addNote = useAddAttendanceNote();
  const updateStatus = useUpdateAttendanceStatus();

  /**
   * Adiciona uma nova observação
   */
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await addNote.mutateAsync({
        id: attendanceId,
        note: newNote.trim(),
        isInternal: false
      });
      setNewNote('');
      setIsAddingNote(false);
    } catch (error) {
      console.error('Erro ao adicionar observação:', error);
    }
  };

  /**
   * Atualiza o status do atendimento
   */
  const handleStatusChange = async (status: AttendanceStatus, reason?: string) => {
    try {
      await updateStatus.mutateAsync({ id: attendanceId, status, reason });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Erro ao carregar detalhes do atendimento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !attendance) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{attendance.title}</h1>
                <Badge className={getStatusColor(attendance.status)}>
                  {getStatusIcon(attendance.status)}
                  <span className="ml-1">{getStatusText(attendance.status)}</span>
                </Badge>
              </div>
              {attendance.description && (
                <p className="text-gray-600">{attendance.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(attendance)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                    Marcar como Em Andamento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('on_hold')}>
                    Colocar em Espera
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                    Marcar como Concluído
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Relatório
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {onClose && (
                <Button variant="ghost" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Informações da Aeronave */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Aeronave
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Registro:</span>
                  <span className="ml-2 font-medium">{attendance.aircraft?.registration || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Modelo:</span>
                  <span className="ml-2">{attendance.aircraft?.model || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Cliente:</span>
                  <span className="ml-2">{attendance.client_name}</span>
                </div>
              </div>
            </div>

            {/* Status e Progresso */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Status e Progresso
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Prioridade:</span>
                  <Badge className={`ml-2 ${
                    attendance.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    attendance.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    attendance.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {attendance.priority === 'urgent' ? 'Urgente' :
                     attendance.priority === 'high' ? 'Alta' :
                     attendance.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Etapa Atual:</span>
                  <span className="ml-2">{attendance.current_stage_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Funil:</span>
                  <span className="ml-2">{attendance.current_funnel_name || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Responsável e Datas */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Responsável e Datas
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Responsável:</span>
                  <span className="ml-2">{attendance.assigned_to_name || 'Não atribuído'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Iniciado em:</span>
                  <span className="ml-2">
                    {format(new Date(attendance.started_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
                {attendance.estimated_completion && (
                  <div>
                    <span className="text-gray-500">Previsão:</span>
                    <span className="ml-2">
                      {format(new Date(attendance.estimated_completion), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com detalhes */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline de Etapas</TabsTrigger>
          <TabsTrigger value="events">Histórico de Eventos</TabsTrigger>
          <TabsTrigger value="notes">Observações</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline de Etapas</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline && timeline.length > 0 ? (
                <StagesTimeline stages={timeline} />
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma movimentação de etapa registrada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              {events && events.length > 0 ? (
                <EventsList events={events} />
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum evento registrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Observações
                <Button 
                  size="sm" 
                  onClick={() => setIsAddingNote(true)}
                  disabled={isAddingNote}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Adicionar Observação
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAddingNote && (
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                  <Textarea
                    placeholder="Digite sua observação..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || addNote.isPending}
                    >
                      Salvar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNote('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {attendance.notes && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Observações Gerais</h4>
                  <p className="text-sm">{attendance.notes}</p>
                </div>
              )}

              {attendance.internal_notes && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium mb-2">Observações Internas</h4>
                  <p className="text-sm">{attendance.internal_notes}</p>
                </div>
              )}

              {!attendance.notes && !attendance.internal_notes && !isAddingNote && (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma observação registrada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Serviços Relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.service_order ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Ordem de Serviço #{attendance.service_order.id}</h4>
                      <p className="text-sm text-gray-500">
                        Status: {attendance.service_order.status}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>

                  {attendance.service_summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {attendance.service_summary.total_services}
                        </div>
                        <div className="text-sm text-blue-600">Total de Serviços</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {attendance.service_summary.total_value.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-sm text-green-600">Valor Total</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {attendance.service_summary.services_by_category.length}
                        </div>
                        <div className="text-sm text-purple-600">Categorias</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma ordem de serviço associada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}