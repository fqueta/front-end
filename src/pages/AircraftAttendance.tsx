/**
 * Página principal de registros de atendimentos das aeronaves
 * Dashboard com estatísticas, listagem e gerenciamento completo
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Plane,
  BarChart3,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

import { AttendanceList } from '../components/aircraftAttendance/AttendanceList';
import { AttendanceDetail } from '../components/aircraftAttendance/AttendanceDetail';
import {
  useAttendanceStats,
  useActiveAttendances,
  useAttendancesRequiringAttention
} from '../hooks/useAircraftAttendance';
import { AircraftAttendance } from '../types/aircraftAttendance';

/**
 * Componente de estatísticas em cards
 */
function StatsCards() {
  const { data: stats, isLoading } = useAttendanceStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Atendimentos</p>
              <p className="text-2xl font-bold">{stats.total_attendances}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Andamento</p>
              <p className="text-2xl font-bold">{stats.active_attendances}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Concluídos</p>
              <p className="text-2xl font-bold">{stats.completed_attendances}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold">{stats.avg_duration_hours.toFixed(1)}h</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Componente de atendimentos que precisam de atenção
 */
function AttentionRequired() {
  const { data: attention, isLoading } = useAttendancesRequiringAttention();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Requer Atenção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attention) return null;

  const allItems = [
    ...attention.overdue.map(item => ({ ...item, type: 'overdue', label: 'Atrasado' })),
    ...attention.stalled.map(item => ({ ...item, type: 'stalled', label: 'Parado' })),
    ...attention.high_priority.map(item => ({ ...item, type: 'priority', label: 'Alta Prioridade' })),
    ...attention.unassigned.map(item => ({ ...item, type: 'unassigned', label: 'Não Atribuído' })),
  ].slice(0, 5); // Mostra apenas os 5 primeiros

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Requer Atenção
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum atendimento requer atenção no momento
          </p>
        ) : (
          <div className="space-y-3">
            {allItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    item.type === 'overdue' ? 'bg-red-500' :
                    item.type === 'stalled' ? 'bg-orange-500' :
                    item.type === 'priority' ? 'bg-purple-500' :
                    'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {item.aircraft?.registration} • {item.client_name}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.label}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Componente de atendimentos ativos recentes
 */
function ActiveAttendances() {
  const { data: activeData, isLoading } = useActiveAttendances({ limit: 5 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeAttendances = activeData?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Atendimentos Ativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeAttendances.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum atendimento ativo no momento
          </p>
        ) : (
          <div className="space-y-3">
            {activeAttendances.map((attendance) => (
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
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={
                    attendance.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    attendance.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }>
                    {attendance.status === 'in_progress' ? 'Em Andamento' :
                     attendance.status === 'pending' ? 'Pendente' : 'Em Espera'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AircraftAttendance() {
  const [selectedAttendance, setSelectedAttendance] = useState<AircraftAttendance | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  /**
   * Abre o modal de detalhes do atendimento
   */
  const handleViewAttendance = (attendance: AircraftAttendance) => {
    setSelectedAttendance(attendance);
    setShowDetail(true);
  };

  /**
   * Abre o modal de edição do atendimento
   */
  const handleEditAttendance = (attendance: AircraftAttendance) => {
    setSelectedAttendance(attendance);
    // TODO: Implementar modal de edição
    console.log('Editar atendimento:', attendance);
  };

  /**
   * Abre o modal de criação de atendimento
   */
  const handleCreateAttendance = () => {
    // TODO: Implementar modal de criação
    console.log('Criar novo atendimento');
  };

  /**
   * Fecha o modal de detalhes
   */
  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedAttendance(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Atendimentos de Aeronaves</h1>
          <p className="text-gray-600">
            Gerencie e acompanhe os atendimentos das aeronaves através dos funis e etapas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleCreateAttendance}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Atendimento
          </Button>
        </div>
      </div>

      {/* Modal de detalhes */}
      {showDetail && selectedAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <AttendanceDetail
                attendanceId={selectedAttendance.id}
                onEdit={handleEditAttendance}
                onClose={handleCloseDetail}
              />
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="attendances">Todos os Atendimentos</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Estatísticas */}
          <StatsCards />

          {/* Grid com informações importantes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttentionRequired />
            <ActiveAttendances />
          </div>

          {/* Lista resumida de atendimentos recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Atendimentos Recentes
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('attendances')}
                >
                  Ver Todos
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceList
                onViewAttendance={handleViewAttendance}
                onEditAttendance={handleEditAttendance}
                onCreateAttendance={handleCreateAttendance}
                showFilters={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendances" className="space-y-6">
          <AttendanceList
            onViewAttendance={handleViewAttendance}
            onEditAttendance={handleEditAttendance}
            onCreateAttendance={handleCreateAttendance}
            showFilters={true}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análises por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  Gráficos de análise em desenvolvimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  Gráficos de performance em desenvolvimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atendimentos por Aeronave</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  Análise por aeronave em desenvolvimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio por Etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  Análise de tempo por etapa em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}