/**
 * Componente reutilizável de timeline de atendimento
 * Pode ser usado em diferentes páginas para exibir o histórico de atendimentos
 */

import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  Plane,
  FileText,
  MessageSquare,
  ArrowRight,
  MapPin,
  Activity,
  CheckCircle,
  XCircle,
  Pause,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import {
  useAttendanceTimeline,
  useAttendanceEvents,
  useAttendanceList
} from '../../hooks/useAircraftAttendance';
import { AttendanceStageInfo, AttendanceEvent, AircraftAttendance } from '../../types/aircraftAttendance';

interface AttendanceTimelineProps {
  /** ID da aeronave para buscar atendimentos */
  aircraftId?: string;
  /** ID da ordem de serviço para buscar atendimentos */
  serviceOrderId?: string;
  /** ID específico de um atendimento para exibir timeline detalhada */
  attendanceId?: string;
  /** Título personalizado para o componente */
  title?: string;
  /** Se deve mostrar apenas atendimentos ativos */
  activeOnly?: boolean;
  /** Número máximo de itens a exibir */
  maxItems?: number;
}

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

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'stage_change':
        return 'text-blue-600 bg-blue-50';
      case 'status_change':
        return 'text-green-600 bg-green-50';
      case 'note_added':
        return 'text-purple-600 bg-purple-50';
      case 'service_added':
        return 'text-orange-600 bg-orange-50';
      case 'service_removed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-3">
      {events.map((event, index) => (
        <div key={event.id} className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${getEventColor(event.event_type)}`}>
            {getEventIcon(event.event_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{event.description}</h4>
              <span className="text-xs text-gray-500">
                {format(new Date(event.created_at), 'dd/MM HH:mm', { locale: ptBR })}
              </span>
            </div>
            {event.metadata && (
              <div className="mt-1 text-xs text-gray-600">
                {JSON.stringify(event.metadata)}
              </div>
            )}
            {event.user_name && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <User className="h-3 w-3" />
                {event.user_name}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Lista de atendimentos resumida
 */
function AttendancesList({ attendances }: { attendances: AircraftAttendance[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
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

  return (
    <div className="space-y-3">
      {attendances.map((attendance) => (
        <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Plane className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{attendance.title}</p>
              <p className="text-xs text-gray-500">
                {attendance.aircraft?.registration} • {attendance.current_stage_name || 'Sem etapa'}
              </p>
              <p className="text-xs text-gray-400">
                Iniciado em {format(new Date(attendance.started_at), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(attendance.status)}>
              {getStatusLabel(attendance.status)}
            </Badge>
            {attendance.assigned_to_name && (
              <p className="text-xs text-gray-500 mt-1">
                {attendance.assigned_to_name}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Componente principal de timeline de atendimento
 */
export function AttendanceTimeline({
  aircraftId,
  serviceOrderId,
  attendanceId,
  title = "Timeline de Atendimentos",
  activeOnly = false,
  maxItems = 10
}: AttendanceTimelineProps) {
  // Buscar dados baseado nos parâmetros fornecidos
  const { data: timeline, isLoading: timelineLoading } = useAttendanceTimeline(
    attendanceId || '', 
    { enabled: !!attendanceId }
  );
  
  const { data: events, isLoading: eventsLoading } = useAttendanceEvents(
    attendanceId || '', 
    { enabled: !!attendanceId }
  );

  const { data: attendancesList, isLoading: listLoading } = useAttendanceList(
    {
      aircraft_id: aircraftId,
      service_order_id: serviceOrderId,
      status: activeOnly ? 'in_progress,pending,on_hold' : undefined,
      limit: maxItems,
      include_aircraft: true
    },
    { enabled: !!(aircraftId || serviceOrderId) }
  );

  const isLoading = timelineLoading || eventsLoading || listLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se é um atendimento específico, mostrar timeline detalhada
  if (attendanceId && (timeline || events)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList>
              <TabsTrigger value="timeline">Timeline de Etapas</TabsTrigger>
              <TabsTrigger value="events">Histórico de Eventos</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              {timeline && timeline.length > 0 ? (
                <StagesTimeline stages={timeline} />
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma movimentação de etapa registrada
                </p>
              )}
            </TabsContent>

            <TabsContent value="events">
              {events && events.length > 0 ? (
                <EventsList events={events} />
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum evento registrado
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Se é uma lista de atendimentos (por aeronave ou ordem de serviço)
  if (attendancesList?.data && attendancesList.data.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendancesList attendances={attendancesList.data} />
        </CardContent>
      </Card>
    );
  }

  // Estado vazio
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum atendimento encontrado</p>
        </div>
      </CardContent>
    </Card>
  );
}