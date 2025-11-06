import { useState } from "react";
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
  Workflow,
  GitBranch,
  Target,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Workflow as WorkflowType, Funnel, Stage } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkflowsTableProps {
  workflows: WorkflowType[];
  funnels: Funnel[];
  stages: Stage[];
  isLoading: boolean;
  onView: (workflow: WorkflowType) => void;
  onEdit: (workflow: WorkflowType) => void;
  onDuplicate: (workflow: WorkflowType) => void;
  onToggleStatus: (workflow: WorkflowType) => void;
  onViewStats: (workflow: WorkflowType) => void;
  onDelete: (workflow: WorkflowType) => void;
  onCreate: () => void;
}

/**
 * Componente de tabela para exibir e gerenciar workflows
 */
export default function WorkflowsTable({
  workflows,
  funnels,
  stages,
  isLoading,
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onViewStats,
  onDelete,
  onCreate
}: WorkflowsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [funnelFilter, setFunnelFilter] = useState<string>("all");
  const [deleteWorkflow, setDeleteWorkflow] = useState<WorkflowType | null>(null);

  /**
   * Filtra workflows baseado nos critérios de busca
   */
  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && workflow.isActive) ||
                         (statusFilter === "inactive" && !workflow.isActive);
    
    const matchesFunnel = funnelFilter === "all" || workflow.funnelId === funnelFilter;

    return matchesSearch && matchesStatus && matchesFunnel;
  });

  /**
   * Obtém informações do funil
   */
  const getFunnelInfo = (funnelId: string) => {
    return funnels.find(f => f.id === funnelId);
  };

  /**
   * Obtém informações da etapa
   */
  const getStageInfo = (stageId: string) => {
    return stages.find(s => s.id === stageId);
  };

  /**
   * Renderiza o status do workflow
   */
  const renderStatus = (workflow: WorkflowType) => {
    if (workflow.isActive) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Ativo
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
        <XCircle className="w-3 h-3 mr-1" />
        Inativo
      </Badge>
    );
  };

  /**
   * Renderiza o tipo de execução
   */
  const renderExecutionType = (workflow: WorkflowType) => {
    const settings = workflow.settings;
    
    if (settings?.autoExecute) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Settings className="w-3 h-3 mr-1" />
          Automático
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Manual
      </Badge>
    );
  };

  /**
   * Confirma a exclusão do workflow
   */
  const handleDeleteConfirm = () => {
    if (deleteWorkflow) {
      onDelete(deleteWorkflow);
      setDeleteWorkflow(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Carregando workflows...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Workflows
              </CardTitle>
              <CardDescription>
                Gerencie os workflows de automação dos seus funis
              </CardDescription>
            </div>
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Workflow
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
                placeholder="Buscar workflows..."
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
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
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

          {/* Tabela */}
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" || funnelFilter !== "all" 
                  ? "Nenhum workflow encontrado" 
                  : "Nenhum workflow cadastrado"
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== "all" || funnelFilter !== "all"
                  ? "Tente ajustar os filtros para encontrar workflows."
                  : "Comece criando seu primeiro workflow de automação."
                }
              </p>
              {!searchTerm && statusFilter === "all" && funnelFilter === "all" && (
                <Button onClick={onCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Workflow
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Funil</TableHead>
                    <TableHead>Gatilho → Destino</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows.map((workflow) => {
                    const funnel = getFunnelInfo(workflow.funnelId);
                    const triggerStage = getStageInfo(workflow.triggerStageId);
                    const targetStage = getStageInfo(workflow.targetStageId);

                    return (
                      <TableRow key={workflow.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{workflow.name}</div>
                            {workflow.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {workflow.description.length > 60 
                                  ? `${workflow.description.substring(0, 60)}...`
                                  : workflow.description
                                }
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {funnel ? (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: funnel.color }}
                              />
                              <span className="text-sm">{funnel.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Funil não encontrado</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            {triggerStage ? (
                              <div className="flex items-center gap-1">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: triggerStage.color }}
                                />
                                <span>{triggerStage.name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">?</span>
                            )}
                            <Target className="h-3 w-3 text-gray-400" />
                            {targetStage ? (
                              <div className="flex items-center gap-1">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: targetStage.color }}
                                />
                                <span>{targetStage.name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">?</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderExecutionType(workflow)}
                        </TableCell>
                        <TableCell>
                          {renderStatus(workflow)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            {workflow.createdAt && !isNaN(new Date(workflow.createdAt).getTime()) 
                              ? formatDistanceToNow(new Date(workflow.createdAt), {
                                  addSuffix: true,
                                  locale: ptBR
                                })
                              : 'Data inválida'
                            }
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
                              <DropdownMenuItem onClick={() => onView(workflow)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(workflow)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onDuplicate(workflow)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onToggleStatus(workflow)}>
                                {workflow.isActive ? (
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
                              <DropdownMenuItem onClick={() => onViewStats(workflow)}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Estatísticas
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setDeleteWorkflow(workflow)}
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
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Informações da tabela */}
          {filteredWorkflows.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <div>
                Mostrando {filteredWorkflows.length} de {workflows.length} workflows
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Ativos: {workflows.filter(w => w.isActive).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Inativos: {workflows.filter(w => !w.isActive).length}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteWorkflow} onOpenChange={() => setDeleteWorkflow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o workflow "{deleteWorkflow?.name}"?
              Esta ação não pode ser desfeita e todas as configurações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}