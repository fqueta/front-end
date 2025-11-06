import React from 'react';
import { ServiceOrder } from '@/types/serviceOrders';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Plane,
  GripVertical,
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from "@/lib/utils";

interface ServiceOrderCardProps {
  serviceOrder: ServiceOrder;
  onView?: (serviceOrder: ServiceOrder) => void;
  onEdit?: (serviceOrder: ServiceOrder) => void;
  onDelete?: (serviceOrder: ServiceOrder) => void;
  isDragging?: boolean;
  className?: string;
}

/**
 * Componente de card para exibir uma ordem de serviço no pipeline
 * Inclui informações essenciais e ações rápidas
 */
export default function ServiceOrderCard({
  serviceOrder,
  onView,
  onEdit,
  onDelete,
  isDragging = false,
  className
}: ServiceOrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingFromKit,
  } = useDraggable({
    id: `service-order-${serviceOrder.id}`,
    data: {
      type: 'service-order',
      serviceOrder,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };
  
  /**
   * Retorna a cor da badge baseada na prioridade
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 hover:bg-red-600';
      case 'high':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  /**
   * Retorna o texto da prioridade em português
   */
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  /**
   * Formata a data para exibição
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  /**
   * Verifica se a ordem está atrasada
   */
  const isOverdue = () => {
    if (!serviceOrder.estimated_end_date) return false;
    return new Date(serviceOrder.estimated_end_date) < new Date();
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full mb-3 cursor-pointer transition-all duration-200 hover:shadow-md",
        isDragging && "opacity-50 rotate-2 shadow-lg",
        isOverdue() && "border-red-300 bg-red-50",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            <div 
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate" title={serviceOrder.title}>
                {serviceOrder.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {serviceOrder.order_number || `#${serviceOrder.id}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {/* Badge de Prioridade */}
            <Badge 
              className={cn(
                "text-xs px-2 py-0.5 text-white",
                getPriorityColor(serviceOrder.priority)
              )}
            >
              {getPriorityLabel(serviceOrder.priority)}
            </Badge>
            
            {/* Menu de Ações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(serviceOrder)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(serviceOrder)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(serviceOrder)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        {/* Cliente */}
        {(serviceOrder.client?.name || serviceOrder.client_name) && (
          <div className="flex items-center gap-1 mb-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {serviceOrder.client?.name || serviceOrder.client_name}
            </span>
          </div>
        )}

        {/* Aeronave */}
        {(serviceOrder.aircraft?.matricula || serviceOrder.aircraft_id) && (
          <div className="flex items-center gap-1 mb-2">
            <Plane className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {serviceOrder.aircraft?.matricula || serviceOrder.aircraft_id}
            </span>
          </div>
        )}

        {/* Data de Vencimento */}
        {serviceOrder.estimated_end_date && (
          <div className="flex items-center gap-1 mb-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className={cn(
              "text-xs",
              isOverdue() ? "text-red-600 font-medium" : "text-muted-foreground"
            )}>
              {formatDate(serviceOrder.estimated_end_date)}
            </span>
            {isOverdue() && (
              <AlertTriangle className="h-3 w-3 text-red-600 ml-1" />
            )}
          </div>
        )}

        {/* Técnico Responsável */}
        {(serviceOrder.assigned_user?.name || serviceOrder.assigned_to) && (
          <div className="flex items-center gap-1 mb-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {serviceOrder.assigned_user?.name || serviceOrder.assigned_to}
            </span>
          </div>
        )}

        {/* Valor Total */}
        {serviceOrder.total_amount && Number(serviceOrder.total_amount) > 0 && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground">Total:</span>
            <span className="text-xs font-medium">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(Number(serviceOrder.total_amount))}
            </span>
          </div>
        )}

        {/* Indicador de Tempo */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDate(serviceOrder.created_at)}
            </span>
          </div>
          
          {/* Status Badge */}
          <Badge variant="outline" className="text-xs">
            {serviceOrder.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}