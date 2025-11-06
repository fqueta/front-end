import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy, 
  Power, 
  PowerOff, 
  BarChart3, 
  Trash2,
  Plus,
  Filter,
  Layers,
  GitBranch,
  ArrowUpDown,
  Clock,
  CheckCircle,
  XCircle,
  Hash,
  Users,
  GripVertical
} from "lucide-react";
import { Stage, Funnel } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
// Drag & Drop
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface StagesTableProps {
  stages: Stage[];
  funnels: Funnel[];
  isLoading: boolean;
  onView: (stage: Stage) => void;
  onEdit: (stage: Stage) => void;
  onDuplicate: (stage: Stage) => void;
  onToggleStatus: (stage: Stage) => void;
  // Atualizado para receber funil e lista ordenada de IDs
  onReorder: (funnelId: string, stageIds: string[]) => void;
  onViewStats: (stage: Stage) => void;
  onDelete: (stage: Stage) => void;
  onCreate: () => void;
  // Recebe o funil selecionado para habilitar reordenação
  selectedFunnelId?: string;
}

/**
 * Componente de tabela para exibir e gerenciar etapas
 */
export default function StagesTable({
  stages,
  funnels,
  isLoading,
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onReorder,
  onViewStats,
  onDelete,
  onCreate,
  selectedFunnelId
}: StagesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [funnelFilter, setFunnelFilter] = useState<string>("all");
  const [deleteStage, setDeleteStage] = useState<Stage | null>(null);
  // Estado local para refletir a ordem durante drag-and-drop
  const [localStages, setLocalStages] = useState<Stage[]>(stages);

  useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

  /**
   * Filtra etapas baseado nos critérios de busca
   */
  const filteredStages = localStages.filter((stage) => {
    const matchesSearch = stage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stage.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && stage.isActive) ||
                         (statusFilter === "inactive" && !stage.isActive);
    
    const matchesFunnel = funnelFilter === "all" || stage.funnelId === funnelFilter;

    return matchesSearch && matchesStatus && matchesFunnel;
  });

  /**
   * Handler de término do drag para reordenar lista e persistir
   * - Reordena apenas quando há um funil selecionado (não "all")
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = filteredStages.map((s) => String(s.id));
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));

    const newOrder = arrayMove(filteredStages, oldIndex, newIndex);
    setLocalStages((prev) => {
      // Atualiza somente os que estão no filtro atual
      const others = prev.filter((s) => !ids.includes(String(s.id)));
      return [...others, ...newOrder];
    });

    // Persistência: exige funil específico
    const funnelId = selectedFunnelId && selectedFunnelId !== "all"
      ? selectedFunnelId
      : String(newOrder[0]?.funnelId || "");
    if (funnelId) {
      const stageIds = newOrder.map((s) => String(s.id));
      onReorder(funnelId, stageIds);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Carregando etapas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Componente de linha ordenável
  function SortableRow({ stage }: { stage: Stage }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: String(stage.id) });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    } as React.CSSProperties;

    const funnel = stage.funnel ?? getFunnelInfo(stage.funnelId);

    return (
      <TableRow ref={setNodeRef} style={style} key={stage.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="p-0 h-6 w-6 cursor-grab" {...attributes} {...listeners} title="Arrastar para reordenar">
              <GripVertical className="h-4 w-4 text-gray-500" />
            </Button>
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: stage.color }}
            />
            <div>
              <div className="font-medium">{stage.name}</div>
              {stage.description && (
                <div className="text-sm text-gray-500 mt-1">
                  {stage.description.length > 50 
                    ? `${stage.description.substring(0, 50)}...`
                    : stage.description
                  }
                </div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>
          {funnel ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: funnel.color }}
              />
              <span>{funnel.name}</span>
            </div>
          ) : (
            <span className="text-gray-500">Funil não informado</span>
          )}
        </TableCell>
        <TableCell>
          {/* Exibe posição atual na lista filtrada */}
          <Badge variant="secondary" className="font-mono">{filteredStages.findIndex(s => s.id === stage.id) + 1}</Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> SLA</Badge>
            <Badge variant="outline" className="gap-1"><CheckCircle className="h-3 w-3" /> Auto</Badge>
            <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" /> Aprovação</Badge>
            <Badge variant="outline" className="gap-1"><Hash className="h-3 w-3" /> Limites</Badge>
            <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" /> Equipe</Badge>
          </div>
        </TableCell>
        <TableCell>
          {stage.isActive ? (
            <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Ativa</Badge>
          ) : (
            <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Inativa</Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(stage.createdAt || new Date()), { locale: ptBR })}
          </div>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(stage)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(stage)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(stage)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Mantemos ação manual de reordenar caso necessário */}
              {/* <DropdownMenuItem>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Arraste a linha para reordenar
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => onToggleStatus(stage)}>
                {stage.isActive ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewStats(stage)}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Estatísticas
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteStage(stage)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Etapas
              </CardTitle>
              <CardDescription>
                Gerencie as etapas dos seus funis de vendas
              </CardDescription>
            </div>
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Etapa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar etapas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Funil */}
            <Select value={funnelFilter} onValueChange={setFunnelFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <GitBranch className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Funil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Funis</SelectItem>
                {funnels.map((funnel) => (
                  <SelectItem key={funnel.id} value={funnel.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: funnel.color }}
                      />
                      {funnel.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista com Drag & Drop */}
          {/* DnDContext deve ficar FORA do <table> para evitar validateDOMNesting */}
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Funil</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Configurações</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criada</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <SortableContext items={filteredStages.map((s) => String(s.id))}>
                  <TableBody>
                    {filteredStages.map((stage) => (
                      <SortableRow key={stage.id} stage={stage} />
                    ))}
                  </TableBody>
                </SortableContext>
              </Table>
            </div>
          </DndContext>
          
          {/* Informações da tabela */}
          {filteredStages.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <div>
                Mostrando {filteredStages.length} de {stages.length} etapas
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Ativas: {stages.filter(s => s.isActive).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Inativas: {stages.filter(s => !s.isActive).length}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteStage} onOpenChange={() => setDeleteStage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir etapa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a etapa "{deleteStage?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteStage) onDelete(deleteStage);
              setDeleteStage(null);
            }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}