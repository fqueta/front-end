
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useWorkflowsList, 
  useCreateWorkflow, 
  useUpdateWorkflow, 
  useDeleteWorkflow, 
  useToggleWorkflowStatus,
  useDuplicateWorkflow,
  useWorkflowStats,
  useWorkflowsByFunnel
} from "@/hooks/workflows";
import { useFunnels } from "@/hooks/funnels";
import { useStagesByFunnel, useCreateStage } from "@/hooks/stages";
import { 
  useServiceOrdersList, 
  useUpdateServiceOrder,
  useUpdateServiceOrderStatus,
  useDeleteServiceOrder
} from "@/hooks/serviceOrders";
import WorkflowForm, { workflowSchema, WorkflowFormData } from "@/components/workflows/WorkflowForm";
import WorkflowsTable from "@/components/workflows/WorkflowsTable";
import SyncPanel from "@/components/workflows/SyncPanel";
import PipelineView from "@/components/workflows/PipelineView";
import StageForm, { stageSchema, StageFormData } from "@/components/stages/StageForm";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Workflow, Funnel, Stage } from "@/types";
import { ServiceOrder } from "@/types/serviceOrders";
import { Plus, Eye, Settings, LayoutGrid, List } from "lucide-react";

/**
 * Página principal para gerenciamento de workflows
 */
export default function WorkflowPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Inicializar selectedFunnelId com valor da URL se disponível
  const funnelIdFromUrl = searchParams.get('funnelId');
  const [selectedFunnelId, setSelectedFunnelId] = useState<number>(
    funnelIdFromUrl ? parseInt(funnelIdFromUrl, 10) : 0
  );
  console.log('funnelIdFromUrl:', funnelIdFromUrl);
  console.log('selectedFunnelId:', selectedFunnelId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [viewingWorkflow, setViewingWorkflow] = useState<Workflow | null>(null);
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  
  // Estados para o modal de criação de etapa
  const [isStageFormOpen, setIsStageFormOpen] = useState(false);
  const [selectedFunnelForStage, setSelectedFunnelForStage] = useState<string | null>(null);
  
  // Estados para o modal de confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceOrderToDelete, setServiceOrderToDelete] = useState<ServiceOrder | null>(null);

  // Hooks para gerenciamento de dados
  const { data: funnelsResponse, isLoading: isLoadingFunnels } = useFunnels();
  const funnels = funnelsResponse?.data || [];
  
  // Busca etapas do funil selecionado
  const { data: stagesResponse, isLoading: isLoadingStages, error: stagesError } = useStagesByFunnel(
    selectedFunnelId !== 0 ? selectedFunnelId.toString() : undefined
  );
  const stages = stagesResponse?.data || [];
  

  
  // Busca ordens de serviço
  const { data: serviceOrdersResponse, refetch: refetchServiceOrders } = useServiceOrdersList({
    funnelId: selectedFunnelId !== 0 ? selectedFunnelId.toString() : undefined,
    stageId: selectedStageId !== "all" ? selectedStageId : undefined,
  });
  
  const serviceOrders = serviceOrdersResponse?.data || [];
  // console.log('Debug - serviceOrdersResponse:', serviceOrdersResponse);
  // console.log('Debug - serviceOrders:', serviceOrders);
  
  const { data: workflowsResponse, isLoading } = useWorkflowsList();
  const workflows = workflowsResponse?.data || [];
  const createWorkflowMutation = useCreateWorkflow();
  const updateWorkflowMutation = useUpdateWorkflow();
  const deleteWorkflowMutation = useDeleteWorkflow();
  const toggleStatusMutation = useToggleWorkflowStatus();
  const duplicateWorkflowMutation = useDuplicateWorkflow();
  const updateServiceOrderMutation = useUpdateServiceOrder();
  const updateServiceOrderStatusMutation = useUpdateServiceOrderStatus();
  const deleteServiceOrderMutation = useDeleteServiceOrder();
  const createStageMutation = useCreateStage();
  const queryClient = useQueryClient();

  // Form para criação/edição de workflows
  const form = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      description: "",
      funnelId: "",
      triggerStageId: "",
      targetStageId: "",
      isActive: true,
      settings: {
        autoExecute: false,
        requireApproval: false,
        notifyUsers: false,
        executionLimit: undefined,
        waitTime: undefined,
      },
    },
  });

  // Form para criação de etapas
  const stageForm = useForm<StageFormData>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      name: "",
      description: "",
      funnelId: "",
      color: "#3B82F6",
      isActive: true,
      order: 0
    }
  });
  console.log('selectedFunnelId:', selectedFunnelId);
  // Filtrar workflows por funil selecionado
  const filteredWorkflows = workflows.filter(workflow => 
    selectedFunnelId !== 0 ? workflow.funnelId === selectedFunnelId.toString() : true
  );

  // Validar se o funil da URL existe quando os funis terminarem de carregar
  useEffect(() => {
    // Só executar quando os funis terminarem de carregar e houver funnelId na URL
    if (funnelIdFromUrl && !isLoadingFunnels && funnels.length > 0) {
      // Verificar se o funil existe na lista de funis
      const funnelExists = funnels.some(funnel => funnel.id == funnelIdFromUrl);
      if (!funnelExists) {
        // Se o funil não existe, resetar para 0 (equivalente a "all")
        setSelectedFunnelId(0);
      }
    }
  }, [funnelIdFromUrl, funnels, isLoadingFunnels]);

  // Restaurar parâmetros quando retornar do cadastro de ordem de serviço
  useEffect(() => {
    const returnParams = location.state;
    if (returnParams) {
      // Restaura os filtros e visualização
      if (returnParams.selectedFunnelId !== undefined) {
        setSelectedFunnelId(returnParams.selectedFunnelId);
      }
      if (returnParams.selectedStageId !== undefined) {
        setSelectedStageId(returnParams.selectedStageId);
      }
      if (returnParams.currentView !== undefined) {
        setViewMode(returnParams.currentView);
      }
      
      // Limpa o estado para evitar restaurações desnecessárias
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, location.pathname]);

  /**
   * Abre o formulário para criar um novo workflow
   */
  const handleCreate = () => {
    setEditingWorkflow(null);
    form.reset({
      name: "",
      description: "",
      funnelId: selectedFunnelId !== 0 ? selectedFunnelId.toString() : "",
      triggerStageId: "",
      targetStageId: "",
      isActive: true,
      settings: {
        autoExecute: false,
        requireApproval: false,
        notifyUsers: false,
        executionLimit: undefined,
        waitTime: undefined,
      },
    });
    setIsFormOpen(true);
  };

  /**
   * Abre o formulário para editar um workflow existente
   */
  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    form.reset({
      name: workflow.name,
      description: workflow.description || "",
      funnelId: workflow.funnelId,
      triggerStageId: workflow.triggerStageId,
      targetStageId: workflow.targetStageId,
      isActive: workflow.isActive,
      settings: {
        autoExecute: workflow.settings?.autoExecute || false,
        requireApproval: workflow.settings?.requireApproval || false,
        notifyUsers: workflow.settings?.notifyUsers || false,
        executionLimit: workflow.settings?.executionLimit,
        waitTime: workflow.settings?.waitTime,
      },
    });
    setIsFormOpen(true);
  };

  /**
   * Visualiza detalhes de um workflow
   */
  const handleView = (workflow: Workflow) => {
    setViewingWorkflow(workflow);
  };

  /**
   * Duplica um workflow existente
   */
  const handleDuplicate = async (workflow: Workflow) => {
    try {
      await duplicateWorkflowMutation.mutateAsync(workflow.id);
      toast.success("Workflow duplicado com sucesso!");
    } catch (error) {
      toast.error("Erro ao duplicar workflow");
    }
  };

  /**
   * Alterna o status ativo/inativo de um workflow
   */
  const handleToggleStatus = async (workflow: Workflow) => {
    try {
      await toggleStatusMutation.mutateAsync(workflow.id);
      toast.success(`Workflow ${workflow.isActive ? 'desativado' : 'ativado'} com sucesso!`);
    } catch (error) {
      toast.error("Erro ao alterar status do workflow");
    }
  };

  /**
   * Visualiza estatísticas de um workflow
   */
  const handleViewStats = (workflow: Workflow) => {
    // TODO: Implementar modal de estatísticas
    toast.info("Funcionalidade de estatísticas em desenvolvimento");
  };

  /**
   * Exclui um workflow
   */
  const handleDelete = async (workflow: Workflow) => {
    try {
      await deleteWorkflowMutation.mutateAsync(workflow.id);
      toast.success("Workflow excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir workflow");
    }
  };

  /**
   * Submete o formulário de criação/edição
   */
  const handleSubmit = async (data: WorkflowFormData) => {
    try {
      if (editingWorkflow) {
        await updateWorkflowMutation.mutateAsync({
          id: editingWorkflow.id,
          data,
        });
        toast.success("Workflow atualizado com sucesso!");
      } else {
        await createWorkflowMutation.mutateAsync(data);
        toast.success("Workflow criado com sucesso!");
      }
      setIsFormOpen(false);
      setEditingWorkflow(null);
    } catch (error) {
      toast.error(editingWorkflow ? "Erro ao atualizar workflow" : "Erro ao criar workflow");
    }
  };

  /**
   * Cancela a edição/criação
   */
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingWorkflow(null);
    form.reset();
  };

  // ========== Funções para Pipeline ==========

  /**
   * Visualiza uma ordem de serviço
   */
  const handleServiceOrderView = (serviceOrder: ServiceOrder) => {
    // Navega para página de visualização com parâmetros de origem
    const searchParams = new URLSearchParams({
      from: 'workflow',
      funnelId: selectedFunnelId !== 0 ? selectedFunnelId.toString() : '',
      funnelName: selectedFunnelId !== 0 ? (funnels.find(f => f.id === selectedFunnelId.toString())?.name || '') : ''
    });
    
    navigate(`/service-orders/show/${serviceOrder.id}?${searchParams.toString()}`);
  };

  /**
   * Edita uma ordem de serviço
   */
  const handleServiceOrderEdit = (serviceOrder: ServiceOrder) => {
    // Navega para página de edição com parâmetros de origem
    const searchParams = new URLSearchParams({
      from: 'workflow',
      funnelId: selectedFunnelId !== 0 ? selectedFunnelId.toString() : '',
      funnelName: selectedFunnelId !== 0 ? (funnels.find(f => f.id === selectedFunnelId.toString())?.name || '') : ''
    });
    
    navigate(`/service-orders/update/${serviceOrder.id}?${searchParams.toString()}`);
  };

  /**
   * Abre o modal de confirmação para exclusão de ordem de serviço
   */
  const handleServiceOrderDelete = (serviceOrder: ServiceOrder) => {
    setServiceOrderToDelete(serviceOrder);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Confirma e executa a exclusão da ordem de serviço
   */
  const confirmDeleteServiceOrder = async () => {
    if (!serviceOrderToDelete) return;

    try {
      await deleteServiceOrderMutation.mutateAsync(serviceOrderToDelete.id);
      toast.success(`Ordem ${serviceOrderToDelete.order_number} excluída com sucesso!`);
      refetchServiceOrders();
      setIsDeleteDialogOpen(false);
      setServiceOrderToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir ordem de serviço:', error);
      toast.error("Erro ao excluir ordem de serviço");
    }
  };

  /**
   * Cancela a exclusão da ordem de serviço
   */
  const cancelDeleteServiceOrder = () => {
    setIsDeleteDialogOpen(false);
    setServiceOrderToDelete(null);
  };

  /**
   * Cria uma nova ordem de serviço para uma etapa específica
   * Navega para a página de cadastro de ordem de serviço
   */
  const handleServiceOrderCreate = (stageId: string) => {
    // Constrói a URL de retorno com os parâmetros atuais do workflow
    const currentUrl = new URL('/attendimento/workflow', window.location.origin);
    if (selectedFunnelId !== 0) {
      currentUrl.searchParams.set('funnelId', selectedFunnelId.toString());
    }
    if (selectedStageId && selectedStageId !== "all") {
      currentUrl.searchParams.set('stageId', selectedStageId);
    }
    if (viewMode) {
      currentUrl.searchParams.set('view', viewMode);
    }

    // Navega para a página de criação rápida passando os parâmetros do workflow
    const flashCreateUrl = new URL('/attendimento/workflow/flashCreate', window.location.origin);
    flashCreateUrl.searchParams.set('workflowOrigin', 'true');
    flashCreateUrl.searchParams.set('returnTo', currentUrl.pathname);
    flashCreateUrl.searchParams.set('stageId', stageId);
    if (selectedFunnelId !== 0) {
      flashCreateUrl.searchParams.set('funnelId', selectedFunnelId.toString());
    }
    // Preserva os parâmetros de retorno para restaurar o estado do workflow
    flashCreateUrl.searchParams.set('returnParams', currentUrl.search.substring(1));

    navigate(flashCreateUrl.pathname + flashCreateUrl.search);
  };



  /**
   * Move uma ordem de serviço entre etapas (drag and drop)
   * Implementa atualização otimista no cache para manter o card na coluna alvo
   * imediatamente após o drop. Em caso de erro, reverte o cache ao estado anterior.
   */
  const handleServiceOrderMove = async (serviceOrderId: string, targetStageId: string) => {
    console.log('🚀 Iniciando handleServiceOrderMove:', { serviceOrderId, targetStageId });
    
    try {
      console.log('🔍 Procurando ordem de serviço e etapa...');
      const serviceOrder = serviceOrders.find(so => so.id.toString() === String(serviceOrderId));
      const targetStage = stages.find(s => s.id.toString() === targetStageId);
      
      console.log('🔍 Resultado da busca:', {
        serviceOrderFound: !!serviceOrder,
        targetStageFound: !!targetStage,
        serviceOrdersCount: serviceOrders.length,
        stagesCount: stages.length
      });
      
      if (!serviceOrder || !targetStage) {
        console.error('❌ Ordem de serviço ou etapa não encontrada:', {
          serviceOrder: !!serviceOrder,
          targetStage: !!targetStage,
          serviceOrderId,
          targetStageId
        });
        toast.error("Ordem de serviço ou etapa não encontrada");
        return;
      }

      const targetStageIdNum = Number(targetStageId);

      console.log('🔄 Movendo ordem de serviço:', {
        serviceOrderId,
        targetStageId,
        serviceOrder: serviceOrder.title,
        targetStage: targetStage.name,
        currentStageId: serviceOrder.stageId,
        newStageId: targetStageIdNum
      });
      
      // ===== Atualização otimista no cache de listas =====
      // Snapshot dos dados atuais para possível rollback
      const listSnapshots = queryClient.getQueriesData({ queryKey: ['service-orders', 'list'] });

      // Aplica update otimista em todas as listas no cache
      listSnapshots.forEach(([key, prev]) => {
        const prevAny = prev as any;
        if (!prevAny || !prevAny.data) return;
        const updated = {
          ...prevAny,
          data: prevAny.data.map((so: any) =>
            String(so.id) === String(serviceOrderId)
              ? { ...so, stageId: targetStageIdNum }
              : so
          ),
        };
        queryClient.setQueryData(key, updated);
      });

      // Também atualiza o cache de detalhe, se existir
      const detailKey = ['service-orders', 'detail', String(serviceOrderId)];
      const detailPrev: any = queryClient.getQueryData(detailKey);
      if (detailPrev) {
        queryClient.setQueryData(detailKey, { ...detailPrev, stageId: targetStageIdNum });
      }

      // ===== Chamada de API para persistir =====
      console.log('📡 Enviando para API:', {
        id: String(serviceOrderId),
        data: { stageId: targetStageIdNum }
      });
      const result = await updateServiceOrderMutation.mutateAsync({
        id: String(serviceOrderId),
        data: { stageId: targetStageIdNum },
      });
      console.log('📥 Resposta da API:', result);

      // Mantém UI responsiva; a própria mutation já invalida 'service-orders'
      toast.success(`Ordem movida para "${targetStage.name}"`);
      console.log('✅ Ordem movida com sucesso:', {
        serviceOrderId,
        targetStageId,
        serviceOrder: serviceOrder.title,
        targetStage: targetStage.name
      });
    } catch (error) {
      console.error('❌ Erro detalhado ao mover ordem de serviço:', {
        error,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        serviceOrderId,
        targetStageId
      });
      toast.error("Erro ao mover ordem de serviço");

      // Em caso de falha, refetch para recuperar consistência do servidor
      try {
        await refetchServiceOrders();
        console.log('✅ Refetch após erro concluído');
      } catch (refetchError) {
        console.error('❌ Erro no refetch:', refetchError);
      }
    }
  };

  /**
   * Visualiza uma etapa
   */
  const handleStageView = (stage: Stage) => {
    console.log('🚀 Iniciando handleStageView:', { stageId: stage.id, name: stage.name });
    // toast.info(`Visualizando etapa: ${stage.name}`);
  };

  /**
   * Edita uma etapa
   */
  const handleStageEdit = (stage: Stage) => {
    toast.info(`Editando etapa: ${stage.name}`);
  };

  /**
   * Exclui uma etapa
   */
  const handleStageDelete = (stage: Stage) => {
    toast.info(`Excluindo etapa: ${stage.name}`);
  };

  /**
   * Cria uma nova etapa para um funil
   */
  const handleStageCreate = (funnelId: string) => {
    const funnel = funnels.find(f => f.id === funnelId);
    setSelectedFunnelForStage(funnelId);
    
    // Calcular a próxima ordem disponível para o funil
    const funnelStages = stages.filter(stage => stage.funnelId === funnelId);
    const nextOrder = Math.max(...funnelStages.map(s => s.order || 0), 0) + 1;
    
    // Resetar o formulário com valores padrão
    stageForm.reset({
      name: "",
      description: "",
      funnelId: funnelId,
      color: "#3B82F6",
      isActive: true,
      order: nextOrder
    });
    
    setIsStageFormOpen(true);
  };

  /**
   * Submete o formulário de criação de etapa
   */
  const handleStageSubmit = async (data: StageFormData) => {
    try {
      await createStageMutation.mutateAsync(data);
      toast.success("Etapa criada com sucesso!");
      setIsStageFormOpen(false);
      stageForm.reset();
      setSelectedFunnelForStage(null);
      
      // Invalidar queries relacionadas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      queryClient.invalidateQueries({ queryKey: ["funnels"] });
    } catch (error) {
      console.error("Erro ao criar etapa:", error);
      toast.error("Erro ao criar etapa. Tente novamente.");
    }
  };

  /**
   * Cancela a criação de etapa
   */
  const handleStageCancel = () => {
    setIsStageFormOpen(false);
    stageForm.reset();
    setSelectedFunnelForStage(null);
  };

  /**
   * Edita um funil
   */
  const handleFunnelEdit = (funnel: Funnel) => {
    toast.info(`Editando funil: ${funnel.name}`);
  };

  /**
   * Atualiza os dados do pipeline
   */
  const handleRefresh = () => {
    refetchServiceOrders();
    toast.success("Dados atualizados!");
  };

  return (
      <div className="space-y-6">
        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="sync">Sincronização</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-6">
            {/* Controles do Pipeline */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pipeline de Ordens de Serviço</CardTitle>
                    <CardDescription>
                      Visualize e gerencie ordens de serviço organizadas por funis e etapas
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Seletor de modo de visualização */}
                    <div className="flex items-center gap-1 border rounded-lg p-1">
                      <Button
                        variant={viewMode === "pipeline" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("pipeline")}
                        className="h-7 px-2"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className="h-7 px-2"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {/* Seletor de funil */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Funil:</label>
                    <Select 
                      value={selectedFunnelId.toString()} 
                      onValueChange={(value) => setSelectedFunnelId(parseInt(value, 10))}
                    >
                      <SelectTrigger className="w-64">
                        <div className="flex items-center gap-2 w-full">
                          {selectedFunnelId === 0 ? (
                            <span>Todos os funis</span>
                          ) : (
                            (() => {
                              const selectedFunnel = funnels.find(f => String(f.id) === selectedFunnelId.toString());
                              return selectedFunnel ? (
                                <>
                                  <div 
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: selectedFunnel.color }}
                                  />
                                  <span className="truncate">{selectedFunnel.name}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">Selecione um funil</span>
                              );
                            })()
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Todos os funis</SelectItem>
                        {funnels.map((funnel) => (
                          <SelectItem key={String(funnel.id)} value={String(funnel.id)}>
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

                  {/* Estatísticas rápidas */}
                  {selectedFunnelId !== 0 && (
                    <div className="flex items-center gap-3 ml-auto">
                      <Badge variant="secondary">
                        {stages.length} {stages.length === 1 ? 'etapa' : 'etapas'}
                      </Badge>
                      <Badge variant="outline">
                        {serviceOrders.filter(so => 
                          stages.some(stage => stage.id === so.stageId)
                        ).length} {serviceOrders.filter(so => 
                          stages.some(stage => stage.id === so.stageId)
                        ).length === 1 ? 'ordem' : 'ordens'}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conteúdo do Pipeline */}
            {selectedFunnelId === 0 ? (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    Selecione um funil para visualizar o pipeline
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Escolha um funil na lista acima para ver suas etapas e ordens de serviço organizadas em pipeline
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="min-h-screen">
                {(() => {
                  const selectedFunnel = funnels.find(f => f.id === selectedFunnelId);
                  if (!selectedFunnel) {
                    return (
                      <Card className="h-full flex items-center justify-center">
                        <CardContent className="text-center py-8">
                          <div className="text-muted-foreground">
                            Funil não encontrado
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  console.log('Debug - stages:', stages);
                  console.log('Debug - selectedFunnel:', selectedFunnel);
                  console.log('Debug - serviceOrders:', serviceOrders);
                  return (
                    <PipelineView
                      funnel={selectedFunnel}
                      stages={stages}
                      serviceOrders={serviceOrders}
                      onServiceOrderView={handleServiceOrderView}
                      onServiceOrderEdit={handleServiceOrderEdit}
                      onServiceOrderDelete={handleServiceOrderDelete}
                      onServiceOrderCreate={handleServiceOrderCreate}
                      onServiceOrderMove={handleServiceOrderMove}
                      onStageView={handleStageView}
                      onStageEdit={handleStageEdit}
                      onStageDelete={handleStageDelete}
                      onStageCreate={handleStageCreate}
                      onFunnelEdit={handleFunnelEdit}
                      onRefresh={handleRefresh}
                      isLoading={isLoading}
                    />
                  );
                })()}
              </div>
            )}
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            {/* Filtro por Funil */}
            <Card>
              <CardHeader>
                <CardTitle>Filtrar por Funil</CardTitle>
                <CardDescription>
                  Selecione um funil para visualizar e gerenciar seus workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedFunnelId.toString()} 
                  onValueChange={(value) => setSelectedFunnelId(parseInt(value, 10))}
                >
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Todos os funis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Todos os funis</SelectItem>
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
              </CardContent>
            </Card>

            {/* Tabela de Workflows */}
            <WorkflowsTable
              workflows={filteredWorkflows}
              funnels={funnels}
              stages={stages}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
              onViewStats={handleViewStats}
              onDelete={handleDelete}
              onCreate={handleCreate}
              selectedFunnelId={selectedFunnelId}
            />
          </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          {/* Painel de Sincronização */}
          <SyncPanel />
        </TabsContent>
      </Tabs>

      {/* Dialog de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWorkflow ? "Editar Workflow" : "Criar Novo Workflow"}
            </DialogTitle>
            <DialogDescription>
              {editingWorkflow 
                ? "Atualize as informações do workflow abaixo."
                : "Preencha as informações para criar um novo workflow."
              }
            </DialogDescription>
          </DialogHeader>
          <WorkflowForm
            form={form}
            funnels={funnels}
            stages={stages}
            onSubmit={handleSubmit}
            isSubmitting={createWorkflowMutation.isPending || updateWorkflowMutation.isPending}
            onCancel={handleCancel}
            isEditing={!!editingWorkflow}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={!!viewingWorkflow} onOpenChange={() => setViewingWorkflow(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingWorkflow?.name}
            </DialogTitle>
            <DialogDescription>
              Detalhes do workflow
            </DialogDescription>
          </DialogHeader>
          {viewingWorkflow && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-1">Descrição</h4>
                <p className="text-sm">
                  {viewingWorkflow.description || "Nenhuma descrição fornecida"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Funil</h4>
                  <p className="text-sm">
                    {funnels.find(f => f.id === viewingWorkflow.funnelId)?.name || "Funil não encontrado"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Status</h4>
                  <p className="text-sm">
                    {viewingWorkflow.isActive ? "Ativo" : "Inativo"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Etapa de Gatilho</h4>
                  <p className="text-sm">
                    {stages.find(s => s.id === viewingWorkflow.triggerStageId)?.name || "Etapa não encontrada"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Etapa de Destino</h4>
                  <p className="text-sm">
                    {stages.find(s => s.id === viewingWorkflow.targetStageId)?.name || "Etapa não encontrada"}
                  </p>
                </div>
              </div>
              {viewingWorkflow.settings && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Configurações</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Execução Automática:</span>
                      <span>{viewingWorkflow.settings.autoExecute ? "Sim" : "Não"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requer Aprovação:</span>
                      <span>{viewingWorkflow.settings.requireApproval ? "Sim" : "Não"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notificar Usuários:</span>
                      <span>{viewingWorkflow.settings.notifyUsers ? "Sim" : "Não"}</span>
                    </div>
                    {viewingWorkflow.settings.executionLimit && (
                      <div className="flex justify-between">
                        <span>Limite de Execuções:</span>
                        <span>{viewingWorkflow.settings.executionLimit}</span>
                      </div>
                    )}
                    {viewingWorkflow.settings.waitTime && (
                      <div className="flex justify-between">
                        <span>Tempo de Espera:</span>
                        <span>{viewingWorkflow.settings.waitTime} minutos</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Criação de Etapa */}
      <Dialog open={isStageFormOpen} onOpenChange={setIsStageFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Nova Etapa</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar uma nova etapa no funil.
            </DialogDescription>
          </DialogHeader>
          <StageForm
            form={stageForm}
            funnels={funnels}
            isLoadingFunnels={isLoadingFunnels}
            onSubmit={handleStageSubmit}
            isSubmitting={createStageMutation.isPending}
            onCancel={handleStageCancel}
            isEditing={false}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a ordem de serviço{" "}
              <strong>{serviceOrderToDelete?.order_number}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteServiceOrder}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteServiceOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteServiceOrderMutation.isPending}
            >
              {deleteServiceOrderMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}