import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { 
  useFunnels, 
  useCreateFunnel, 
  useUpdateFunnel, 
  useDeleteFunnel, 
  useToggleFunnelStatus,
  useDuplicateFunnel,
  useFunnelStats
} from "@/hooks/funnels";
import FunnelForm, { funnelSchema, FunnelFormData } from "@/components/funnels/FunnelForm";
import FunnelsTable from "@/components/funnels/FunnelsTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Funnel } from "@/types";

/**
 * Página principal para gerenciamento de funis
 */
export default function Funis() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);
  const [viewingFunnel, setViewingFunnel] = useState<Funnel | null>(null);

  // Hooks para gerenciamento de funis
  const { data: funnelsResponse, isLoading } = useFunnels();
  const funnels = funnelsResponse?.data || [];
  const createFunnelMutation = useCreateFunnel();
  const updateFunnelMutation = useUpdateFunnel();
  const deleteFunnelMutation = useDeleteFunnel();
  const toggleStatusMutation = useToggleFunnelStatus();
  const duplicateFunnelMutation = useDuplicateFunnel();
  console.log('funnels');
  // Form para criação/edição
  const form = useForm<FunnelFormData>({
    resolver: zodResolver(funnelSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3b82f6",
      isActive: true,
      settings: {
        autoAdvance: false,
        notifyStageChange: false,
        requireApproval: false,
        itemLimit: undefined,
      },
    },
  });
  /**
   * Abre o formulário para criar um novo funil
   */
  const handleCreate = () => {
    setEditingFunnel(null);
    form.reset({
      name: "",
      description: "",
      color: "#3b82f6",
      isActive: true,
      settings: {
        autoAdvance: false,
        notifyStageChange: false,
        requireApproval: false,
        itemLimit: undefined,
      },
    });
    setIsFormOpen(true);
  };

  /**
   * Abre o formulário para editar um funil existente
   */
  const handleEdit = (funnel: Funnel) => {
    setEditingFunnel(funnel);
    form.reset({
      name: funnel.name,
      description: funnel.description || "",
      color: funnel.color,
      isActive: funnel.isActive,
      settings: {
        autoAdvance: funnel.settings?.autoAdvance || false,
        notifyStageChange: funnel.settings?.notifyStageChange || false,
        requireApproval: funnel.settings?.requireApproval || false,
        itemLimit: funnel.settings?.itemLimit,
      },
    });
    setIsFormOpen(true);
  };

  /**
   * Visualiza detalhes de um funil
   */
  const handleView = (funnel: Funnel) => {
    setViewingFunnel(funnel);
  };

  /**
   * Duplica um funil existente
   */
  const handleDuplicate = async (funnel: Funnel) => {
    try {
      await duplicateFunnelMutation.mutateAsync(funnel.id);
      toast.success("Funil duplicado com sucesso!");
    } catch (error) {
      toast.error("Erro ao duplicar funil");
    }
  };

  /**
   * Alterna o status ativo/inativo de um funil
   */
  const handleToggleStatus = async (funnel: Funnel) => {
    try {
      await toggleStatusMutation.mutateAsync(funnel.id);
      toast.success(`Funil ${funnel.isActive ? 'desativado' : 'ativado'} com sucesso!`);
    } catch (error) {
      toast.error("Erro ao alterar status do funil");
    }
  };

  /**
   * Visualiza estatísticas de um funil
   */
  const handleViewStats = (funnel: Funnel) => {
    // TODO: Implementar modal de estatísticas
    toast.info("Funcionalidade de estatísticas em desenvolvimento");
  };

  /**
   * Exclui um funil
   */
  const handleDelete = async (funnel: Funnel) => {
    try {
      await deleteFunnelMutation.mutateAsync(funnel.id);
      toast.success("Funil excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir funil");
    }
  };

  /**
   * Submete o formulário de criação/edição
   */
  const handleSubmit = async (data: FunnelFormData) => {
    try {
      if (editingFunnel) {
        await updateFunnelMutation.mutateAsync({
          id: editingFunnel.id,
          data,
        });
        toast.success("Funil atualizado com sucesso!");
      } else {
        await createFunnelMutation.mutateAsync(data);
        toast.success("Funil criado com sucesso!");
      }
      setIsFormOpen(false);
      setEditingFunnel(null);
    } catch (error) {
      toast.error(editingFunnel ? "Erro ao atualizar funil" : "Erro ao criar funil");
    }
  };

  /**
   * Cancela a edição/criação
   */
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingFunnel(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      {/* Tabela de Funis */}
      <FunnelsTable
        funnels={funnels}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onToggleStatus={handleToggleStatus}
        onViewStats={handleViewStats}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      {/* Dialog de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFunnel ? "Editar Funil" : "Criar Novo Funil"}
            </DialogTitle>
            <DialogDescription>
              {editingFunnel 
                ? "Atualize as informações do funil abaixo."
                : "Preencha as informações para criar um novo funil de atendimento."
              }
            </DialogDescription>
          </DialogHeader>
          <FunnelForm
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={createFunnelMutation.isPending || updateFunnelMutation.isPending}
            onCancel={handleCancel}
            isEditing={!!editingFunnel}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={!!viewingFunnel} onOpenChange={() => setViewingFunnel(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: viewingFunnel?.color }}
              />
              {viewingFunnel?.name}
            </DialogTitle>
            <DialogDescription>
              Detalhes do funil de atendimento
            </DialogDescription>
          </DialogHeader>
          {viewingFunnel && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-1">Descrição</h4>
                <p className="text-sm">
                  {viewingFunnel.description || "Nenhuma descrição fornecida"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Status</h4>
                  <p className="text-sm">
                    {viewingFunnel.isActive ? "Ativo" : "Inativo"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Cor</h4>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: viewingFunnel.color }}
                    />
                    <span className="text-sm font-mono">{viewingFunnel.color}</span>
                  </div>
                </div>
              </div>
              {viewingFunnel.settings && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Configurações</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Avanço Automático:</span>
                      <span>{viewingFunnel.settings.autoAdvance ? "Sim" : "Não"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notificar Mudança de Etapa:</span>
                      <span>{viewingFunnel.settings.notifyStageChange ? "Sim" : "Não"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requer Aprovação:</span>
                      <span>{viewingFunnel.settings.requireApproval ? "Sim" : "Não"}</span>
                    </div>
                    {viewingFunnel.settings.itemLimit && (
                      <div className="flex justify-between">
                        <span>Limite de Itens por Etapa:</span>
                        <span>{viewingFunnel.settings.itemLimit}</span>
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