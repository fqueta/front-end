import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { 
  useStages, 
  useCreateStage, 
  useUpdateStage, 
  useDeleteStage, 
  useToggleStageStatus,
  useReorderStages
} from "@/hooks/stages";
import { useFunnels } from "@/hooks/funnels";
import StageForm, { stageSchema, StageFormData } from "@/components/stages/StageForm";
import StagesTable from "@/components/stages/StagesTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stage } from "@/types";
import { FinancialError, FinancialErrorHandler } from "@/types/financial-errors";

/**
 * Página principal para gerenciamento de etapas
 */
export default function Etapas() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [duplicatingStage, setDuplicatingStage] = useState<Stage | null>(null);
  const [viewingStage, setViewingStage] = useState<Stage | null>(null);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>("all");

  // Hooks para gerenciamento de dados
  const { data: funnelsResponse, isLoading: isLoadingFunnels } = useFunnels();
  const funnels = funnelsResponse?.data || [];
  const { data: stagesResponse, isLoading } = useStages();
  const stages = stagesResponse?.data || [];
  const createStageMutation = useCreateStage();
  const updateStageMutation = useUpdateStage();
  const deleteStageMutation = useDeleteStage();
  const toggleStatusMutation = useToggleStageStatus();
  const reorderStagesMutation = useReorderStages();

  // Form para criação/edição
  const form = useForm<StageFormData>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      name: "",
      funnelId: "",
      order: 0,
      color: "#3B82F6",
      description: "",
      isActive: true
    }
  });

  // Filtrar etapas por funil selecionado
  const filteredStages = stages.filter(stage => 
    selectedFunnelId !== "all" ? stage.funnelId === selectedFunnelId : true
  );

  /**
   * Abre o formulário para criar uma nova etapa
   */
  const handleCreate = () => {
    setEditingStage(null);
    form.reset({
      name: "",
      description: "",
      funnelId: selectedFunnelId !== "all" ? Number(selectedFunnelId) : "",
      order: Math.max(...filteredStages.map(s => s.order), 0) + 1,
      color: "#3b82f6",
      isActive: true,
      settings: {
        autoAdvance: false,
        notifyOnEntry: false,
        notifyOnExit: false,
        requireApproval: false,
        itemLimit: undefined,
        timeLimit: undefined,
      },
    });
    setIsFormOpen(true);
  };

  /**
   * Abre o formulário para editar uma etapa existente
   */
  const handleEdit = (stage: Stage) => {
    setEditingStage(stage);
    form.reset({
      name: stage.name,
      description: stage.description || "",
      funnelId: stage.funnelId,
      order: stage.order,
      color: stage.color || "#3B82F6",
      isActive: stage.isActive
    });
    setIsFormOpen(true);
  };

  /**
   * Visualiza detalhes de uma etapa
   */
  const handleView = (stage: Stage) => {
    setViewingStage(stage);
  };

  /**
   * Abre o formulário para duplicar uma etapa existente
   */
  const handleDuplicate = (stage: Stage) => {
    setDuplicatingStage(stage);
    
    // Calcula a próxima ordem disponível
    const maxOrder = Math.max(...stages.map(s => s.order), 0);
    const nextOrder = maxOrder + 1;
    
    form.reset({
      name: `${stage.name} (Cópia)`,
      description: stage.description || "",
      funnelId: String(stage.funnelId),
      color: stage.color,
      isActive: true,
      order: nextOrder
    });
    setIsFormOpen(true);
  };

  /**
   * Reordena etapas
   * Recebe funil e lista de IDs na nova ordem e persiste via serviço
   */
  const handleReorder = async (funnelId: string, stageIds: string[]) => {
    try {
      await reorderStagesMutation.mutateAsync({ funnelId, stageIds });
      toast.success("Ordem das etapas atualizada!");
    } catch (error) {
      console.error("Erro ao reordenar etapas:", error);
      // Mostra mensagem amigável quando for FinancialError
      const friendly = error instanceof FinancialError
        ? FinancialErrorHandler.getUserFriendlyMessage(error)
        : (error as any)?.message || "Erro ao reordenar etapas";
      toast.error(friendly);
    }
  };

  /**
   * Alterna o status ativo/inativo de uma etapa
   */
  const handleToggleStatus = async (stage: Stage) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: stage.id,
        isActive: !stage.isActive
      });
      toast.success(`Etapa ${stage.isActive ? 'desativada' : 'ativada'} com sucesso!`);
    } catch (error) {
      console.error("Erro ao alterar status da etapa:", error);
      toast.error("Erro ao alterar status da etapa");
    }
  };

  /**
   * Visualiza estatísticas de uma etapa
   */
  const handleViewStats = (stage: Stage) => {
    // TODO: Implementar modal de estatísticas
    toast.info("Funcionalidade de estatísticas em desenvolvimento");
  };

  /**
   * Exclui uma etapa
   */
  const handleDelete = async (stage: Stage) => {
    try {
      await deleteStageMutation.mutateAsync(stage.id);
      toast.success("Etapa excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir etapa");
    }
  };

  /**
   * Submete o formulário de criação/edição/duplicação
   */
  const handleSubmit = async (data: StageFormData) => {
    try {
      if (editingStage) {
        await updateStageMutation.mutateAsync({
          id: editingStage.id,
          data,
        });
        toast.success("Etapa atualizada com sucesso!");
      } else if (duplicatingStage) {
        await createStageMutation.mutateAsync(data);
        toast.success("Etapa duplicada com sucesso!");
      } else {
        await createStageMutation.mutateAsync(data);
        toast.success("Etapa criada com sucesso!");
      }
      setIsFormOpen(false);
      setEditingStage(null);
      setDuplicatingStage(null);
    } catch (error) {
      const action = editingStage ? "atualizar" : duplicatingStage ? "duplicar" : "criar";
      toast.error(`Erro ao ${action} etapa`);
    }
  };

  /**
   * Cancela a edição/criação/duplicação
   */
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingStage(null);
    setDuplicatingStage(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      {/* Filtro por Funil */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Funil</CardTitle>
          <CardDescription>
            Selecione um funil para visualizar e gerenciar suas etapas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedFunnelId} onValueChange={setSelectedFunnelId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Todos os funis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os funis</SelectItem>
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

      {/* Tabela de Etapas */}
      <StagesTable
        stages={filteredStages}
        funnels={funnels}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onReorder={handleReorder}
        onToggleStatus={handleToggleStatus}
        onViewStats={handleViewStats}
        onDelete={handleDelete}
        onCreate={handleCreate}
        selectedFunnelId={selectedFunnelId}
      />

      {/* Dialog de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStage 
                ? "Editar Etapa" 
                : duplicatingStage 
                  ? "Duplicar Etapa" 
                  : "Criar Nova Etapa"
              }
            </DialogTitle>
            <DialogDescription>
              {editingStage 
                ? "Atualize as informações da etapa abaixo."
                : duplicatingStage
                  ? "Revise e ajuste as informações da etapa duplicada abaixo."
                  : "Preencha as informações para criar uma nova etapa."
              }
            </DialogDescription>
          </DialogHeader>
          <StageForm
            form={form}
            funnels={funnels}
            isLoadingFunnels={isLoadingFunnels}
            onSubmit={handleSubmit}
            isSubmitting={createStageMutation.isPending || updateStageMutation.isPending}
            onCancel={handleCancel}
            isEditing={!!editingStage || !!duplicatingStage}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={!!viewingStage} onOpenChange={() => setViewingStage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: viewingStage?.color }}
              />
              {viewingStage?.name}
            </DialogTitle>
            <DialogDescription>
              Detalhes da etapa
            </DialogDescription>
          </DialogHeader>
          {viewingStage && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-1">Descrição</h4>
                <p className="text-sm">
                  {viewingStage.description || "Nenhuma descrição fornecida"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Funil</h4>
                  <p className="text-sm">
                    {funnels.find(f => f.id === viewingStage.funnelId)?.name || "Funil não encontrado"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Ordem</h4>
                  <p className="text-sm">{viewingStage.order}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Status</h4>
                  <p className="text-sm">
                    {viewingStage.isActive ? "Ativo" : "Inativo"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Cor</h4>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: viewingStage.color }}
                    />
                    <span className="text-sm font-mono">{viewingStage.color}</span>
                  </div>
                </div>
              </div>
              {viewingStage.settings && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Configurações</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Avanço Automático:</span>
                      <span>{viewingStage.settings.autoAdvance ? "Sim" : "Não"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notificar Mudança:</span>
                      <span>{viewingStage.settings.notifyChange ? "Sim" : "Não"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requer Aprovação:</span>
                      <span>{viewingStage.settings.requireApproval ? "Sim" : "Não"}</span>
                    </div>
                    {viewingStage.settings.itemLimit && (
                      <div className="flex justify-between">
                        <span>Limite de Itens:</span>
                        <span>{viewingStage.settings.itemLimit}</span>
                      </div>
                    )}
                    {viewingStage.settings.timeLimit && (
                      <div className="flex justify-between">
                        <span>Limite de Tempo:</span>
                        <span>{viewingStage.settings.timeLimit} minutos</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}