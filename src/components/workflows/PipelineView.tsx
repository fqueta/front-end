import { useState, useEffect } from "react";
import { Funnel, Stage } from "@/types/workflows";
import { ServiceOrder } from "@/types/serviceOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { seedWorkflowDemo } from "@/pages/attendimento/demoData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Settings, 
  Eye, 
  Edit, 
  Trash2,
  MoreHorizontal,
  Filter,
  Search,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import StageColumn from "./StageColumn";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

interface PipelineViewProps {
  funnel: Funnel;
  stages: Stage[];
  serviceOrders: ServiceOrder[];
  onServiceOrderView?: (serviceOrder: ServiceOrder) => void;
  onServiceOrderEdit?: (serviceOrder: ServiceOrder) => void;
  onServiceOrderDelete?: (serviceOrder: ServiceOrder) => void;
  onServiceOrderCreate?: (stageId: string) => void;
  onServiceOrderMove?: (serviceOrderId: string, targetStageId: string) => void;
  onStageView?: (stage: Stage) => void;
  onStageEdit?: (stage: Stage) => void;
  onStageDelete?: (stage: Stage) => void;
  onStageCreate?: (funnelId: string) => void;
onFunnelEdit?: (funnel: Funnel) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Componente principal do pipeline que exibe um funil como pipeline
 * com suas etapas como colunas contendo ordens de serviço
 */
export default function PipelineView({
  funnel,
  stages,
  serviceOrders,
  onServiceOrderView,
  onServiceOrderEdit,
  onServiceOrderDelete,
  onServiceOrderCreate,
  onServiceOrderMove,
  onStageView,
  onStageEdit,
  onStageDelete,
  onStageCreate,
  onFunnelEdit,
  onRefresh,
  isLoading = false,
  className
}: PipelineViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Debug logs para verificar dados recebidos
  // console.log('=== PipelineView Debug ===');
  // console.log('Funnel:', funnel);
  // console.log('Stages:', stages);
  // console.log('ServiceOrders:', serviceOrders);
  // console.log('ServiceOrders with stageId:', serviceOrders.map(so => ({
  //   id: so.id,
  //   title: so.title,
  //   stageId: so.stageId,
  //   stageIdType: typeof so.stageId
  // })));
  // console.log('Stages with id:', stages.map(stage => ({
  //   id: stage.id,
  //   name: stage.name,
  //   idType: typeof stage.id,
  //   funnelId: stage.funnelId,
  //   funnelIdType: typeof stage.funnelId
  // })));
  // console.log('========================');

  /**
   * Carrega dados de demonstração para teste
   */
  const handleLoadDemoData = () => {
    try {
      const result = seedWorkflowDemo();
      console.log('✅ Dados de demonstração carregados:', result);
      
      // Recarregar a página para mostrar os novos dados
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados de demonstração:', error);
    }
  };

  // Configuração dos sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handler para início do drag
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handler para fim do drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Debug - DragEnd Event:', { active, over });
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    console.log('Debug - Active Data:', activeData);
    console.log('Debug - Over Data:', overData);

    // Verifica se é um service order sendo movido para uma stage
    if (
      activeData?.type === 'service-order' && 
      overData?.type === 'stage' &&
      activeData.serviceOrder.stageId !== overData.stage.id
    ) {
      console.log('Debug - Moving service order:', {
        serviceOrderId: activeData.serviceOrder.id,
        serviceOrderIdType: typeof activeData.serviceOrder.id,
        fromStageId: activeData.serviceOrder.stageId,
        fromStageIdType: typeof activeData.serviceOrder.stageId,
        toStageId: overData.stage.id,
        toStageIdType: typeof overData.stage.id
      });
      onServiceOrderMove?.(activeData.serviceOrder.id, overData.stage.id);
    }

    setActiveId(null);
  };

  /**
   * Filtra etapas do funil e ordena por posição
   */
  const funnelStages = stages
    .filter(stage => Number(stage.funnelId) === Number(funnel.id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // console.log('Debug - serviceOrders:', serviceOrders);
  /**
   * Filtra ordens de serviço por termo de busca
  */
  const filteredServiceOrders = serviceOrders.filter(so => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      so.order_number?.toLowerCase().includes(searchLower) ||
      so.title?.toLowerCase().includes(searchLower) ||
      so.description?.toLowerCase().includes(searchLower) ||
      so.client?.name?.toLowerCase().includes(searchLower) ||
      so.aircraft?.matricula?.toLowerCase().includes(searchLower) ||
      String(so.id).includes(searchLower)
    );
  });
  
  /**
   * Calcula estatísticas do funil
   */
  const getFunnelStats = () => {
    const totalOrders = filteredServiceOrders.filter(so => 
      funnelStages.some(stage => stage.id === so.stageId)
    ).length;
    
    const totalValue = filteredServiceOrders
      .filter(so => funnelStages.some(stage => stage.id === so.stageId))
      .reduce((total, so) => total + (Number(so.total_amount) || 0), 0);
    
    const urgentOrders = filteredServiceOrders.filter(so => 
      so.priority === 'urgent' && funnelStages.some(stage => stage.id === so.stageId)
    ).length;

    return { totalOrders, totalValue, urgentOrders };
  };

  const { totalOrders, totalValue, urgentOrders } = getFunnelStats();

  /**
   * Handler para mover ordem de serviço entre etapas
   */
  const handleServiceOrderMove = (serviceOrderId: string, targetStageId: string) => {
    if (onServiceOrderMove) {
      onServiceOrderMove(serviceOrderId, targetStageId);
    }
  };
  console.log('Debug - funnelStages:', funnelStages);
  
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("h-full flex flex-col", className)}>
        {/* Header do Pipeline */}
        <Card className="mb-4 flex-shrink-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Indicador de cor do funil */}
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: funnel.color || '#6b7280' }}
                />
                
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate" title={funnel.name}>
                    {funnel.name}
                  </CardTitle>
                  
                  {funnel.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {funnel.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Ações do funil */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLoadDemoData}
                  title="Carregar dados de demonstração"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Demo
                </Button>

                {onRefresh && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {onStageCreate && (
                      <DropdownMenuItem onClick={() => onStageCreate(funnel.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Etapa
                      </DropdownMenuItem>
                    )}
                    {onFunnelEdit && (
                      <DropdownMenuItem onClick={() => onFunnelEdit(funnel)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Funil
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Estatísticas e filtros */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                {/* Estatísticas */}
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {totalOrders} {totalOrders === 1 ? 'ordem' : 'ordens'}
                  </Badge>
                  
                  {urgentOrders > 0 && (
                    <Badge className="bg-red-500 hover:bg-red-600">
                      {urgentOrders} urgente{urgentOrders > 1 ? 's' : ''}
                    </Badge>
                  )}
                  
                  {totalValue > 0 && (
                    <Badge variant="outline">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(totalValue)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Filtro de busca */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar ordens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Pipeline - Colunas das Etapas */}
        <div className="flex-1 overflow-hidden">
          {funnelStages.length === 0 ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  Este funil não possui etapas configuradas
                </div>
                {onStageCreate && (
                  <Button onClick={() => onStageCreate(funnel.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Etapa
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex gap-4 p-1 min-w-max">
                {/* Debug - filteredServiceOrders: {JSON.stringify(filteredServiceOrders)} */}
                {funnelStages.map((stage, index) => (
                  <div key={stage.id} className="flex items-start gap-4">
                    <StageColumn
                      stage={stage}
                      serviceOrders={filteredServiceOrders}
                      onServiceOrderView={onServiceOrderView}
                      onServiceOrderEdit={onServiceOrderEdit}
                      onServiceOrderDelete={onServiceOrderDelete}
                      onServiceOrderCreate={onServiceOrderCreate}
                      onStageView={onStageView}
                      onStageEdit={onStageEdit}
                      onStageDelete={onStageDelete}
                      onDrop={handleServiceOrderMove}
                      isDragOver={activeId !== null}
                    />
                    
                    {/* Separador entre colunas */}
                    {index < funnelStages.length - 1 && (
                      <Separator orientation="vertical" className="h-full min-h-96" />
                    )}
                  </div>
                ))}
                
                {/* Coluna para adicionar nova etapa */}
                {onStageCreate && (
                  <div className="flex items-start gap-4">
                    <Separator orientation="vertical" className="h-full min-h-96" />
                    <Card className="w-80 h-96 flex items-center justify-center border-dashed">
                      <CardContent className="text-center py-8">
                        <Button 
                          variant="ghost" 
                          onClick={() => onStageCreate(funnel.id)}
                          className="h-auto flex-col gap-2 p-6"
                        >
                          <Plus className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Adicionar Nova Etapa
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </DndContext>
  );
}