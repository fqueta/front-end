import { useState } from "react";
import { Stage } from "@/types/workflows";
import { ServiceOrder } from "@/types/serviceOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  MoreHorizontal, 
  Settings,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ServiceOrderCard from "./ServiceOrderCard";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

interface StageColumnProps {
  stage: Stage;
  serviceOrders: ServiceOrder[];
  onServiceOrderView?: (serviceOrder: ServiceOrder) => void;
  onServiceOrderEdit?: (serviceOrder: ServiceOrder) => void;
  onServiceOrderDelete?: (serviceOrder: ServiceOrder) => void;
  onServiceOrderCreate?: (stageId: string) => void;
  onStageView?: (stage: Stage) => void;
  onStageEdit?: (stage: Stage) => void;
  onStageDelete?: (stage: Stage) => void;
  onDrop?: (serviceOrderId: string, targetStageId: string) => void;
  isDragOver?: boolean;
  className?: string;
}

/**
 * Componente de coluna para representar uma etapa no pipeline
 * Contém cards de ordens de serviço e permite drag & drop
 */
export default function StageColumn({
  stage,
  serviceOrders,
  onServiceOrderView,
  onServiceOrderEdit,
  onServiceOrderDelete,
  onServiceOrderCreate,
  onStageView,
  onStageEdit,
  onStageDelete,
  onDrop,
  isDragOver = false,
  className
}: StageColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `stage-${stage.id}`,
    data: {
      type: 'stage',
      stage,
    },
  });

  /**
   * Filtra ordens de serviço desta etapa
   */
  // console.log('Debug - serviceOrders:', serviceOrders);
  // console.log('Debug - stage:', stage);
  const stageServiceOrders = serviceOrders.filter(so => {
    // console.log('Debug - Comparing stageId:', {
    //   serviceOrderStageId: so.stageId,
    //   serviceOrderStageIdType: typeof so.stageId,
    //   stageId: stage.id,
    //   stageIdType: typeof stage.id,
    //   isEqual: Number(so.stageId) === Number(stage.id),
    //   serviceOrderId: so.id,
    //   serviceOrderTitle: so.title
    // });
    return Number(so.stageId) === Number(stage.id);
  });
  // console.log('Debug - stageServiceOrders for stage', stage.name, ':', stageServiceOrders);
  /**
   * Calcula estatísticas da etapa
   */

  /**
   * Calcula o valor total das ordens de serviço na etapa
   */
  const getTotalValue = () => {
    return stageServiceOrders.reduce((total, so) => total + (Number(so.total_amount) || 0), 0);
  };

  /**
   * Conta ordens por prioridade
   */
  const getPriorityCount = (priority: string) => {
    return stageServiceOrders.filter(so => so.priority === priority).length;
  };
  // console.log('Debug - stageServiceOrders:', stageServiceOrders);
  
  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "w-80 flex-shrink-0 h-fit max-h-[calc(100vh-200px)] flex flex-col relative transition-colors",
        isOver && "ring-2 ring-blue-500 bg-blue-50",
        className
      )}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Indicador de cor da etapa */}
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: stage.color || '#6b7280' }}
            />
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate" title={stage.name}>
                {stage.name}
              </CardTitle>
              
              {/* Contador de ordens */}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {stageServiceOrders.length} {stageServiceOrders.length === 1 ? 'ordem' : 'ordens'}
                </Badge>
                
                {/* Indicadores de prioridade */}
                {getPriorityCount('urgent') > 0 && (
                  <Badge className="text-xs bg-red-500 hover:bg-red-600">
                    {getPriorityCount('urgent')} urgente{getPriorityCount('urgent') > 1 ? 's' : ''}
                  </Badge>
                )}
                
                {getPriorityCount('high') > 0 && (
                  <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
                    {getPriorityCount('high')} alta{getPriorityCount('high') > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Menu de ações da etapa */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onServiceOrderCreate && (
                <DropdownMenuItem onClick={() => onServiceOrderCreate(stage.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Ordem de Serviço
                </DropdownMenuItem>
              )}
              {onStageView && (
                <DropdownMenuItem onClick={() => onStageView(stage)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar Etapa
                </DropdownMenuItem>
              )}
              {onStageEdit && (
                <DropdownMenuItem onClick={() => onStageEdit(stage)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Etapa
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              {onStageDelete && (
                <DropdownMenuItem 
                  onClick={() => onStageDelete(stage)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Etapa
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Valor total da etapa */}
        {getTotalValue() > 0 && (
          <div className="text-xs text-muted-foreground mt-2">
            Total: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(getTotalValue())}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-3 pt-0 overflow-hidden">
        <ScrollArea className="h-full">
          {/* Lista de ordens de serviço */}
          <div className="space-y-2">
            {stageServiceOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">Nenhuma ordem de serviço</div>
                {onServiceOrderCreate && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => onServiceOrderCreate(stage.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Ordem
                  </Button>
                )}
              </div>
            ) : (
              stageServiceOrders.map((serviceOrder) => (
                <ServiceOrderCard
                  key={serviceOrder.id}
                  serviceOrder={serviceOrder}
                  onView={onServiceOrderView}
                  onEdit={onServiceOrderEdit}
                  onDelete={onServiceOrderDelete}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Área de drop visual */}
      {isOver && (
        <div className="absolute inset-0 bg-blue-100/50 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="text-blue-600 font-medium">
            Solte aqui para mover para "{stage.name}"
          </div>
        </div>
      )}
    </Card>
  );
}