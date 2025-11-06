import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Workflow, Target, Settings, Filter, GitBranch } from "lucide-react";
import { Funnel as FunnelType, Stage } from "@/types";

/**
 * Schema de validação para formulário de workflow
 */
const workflowSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  funnelId: z.string().min(1, "Funil é obrigatório"),
  triggerStageId: z.string().min(1, "Etapa de gatilho é obrigatória"),
  targetStageId: z.string().min(1, "Etapa de destino é obrigatória"),
  isActive: z.boolean(),
  settings: z.object({
    autoExecute: z.boolean().optional(),
    requireApproval: z.boolean().optional(),
    notifyOnExecution: z.boolean().optional(),
    maxExecutions: z.number().int().min(1).optional(),
    cooldownMinutes: z.number().int().min(0).optional(),
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.string(),
      value: z.string(),
    })).optional(),
  }).optional(),
});

export type WorkflowFormData = z.infer<typeof workflowSchema>;

interface WorkflowFormProps {
  form: UseFormReturn<WorkflowFormData>;
  onSubmit: (data: WorkflowFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  isEditing: boolean;
  funnels: FunnelType[];
  stages: Stage[];
  isLoadingFunnels: boolean;
  isLoadingStages: boolean;
}

/**
 * Operadores disponíveis para condições
 */
const CONDITION_OPERATORS = [
  { value: "equals", label: "Igual a" },
  { value: "not_equals", label: "Diferente de" },
  { value: "contains", label: "Contém" },
  { value: "not_contains", label: "Não contém" },
  { value: "greater_than", label: "Maior que" },
  { value: "less_than", label: "Menor que" },
  { value: "is_empty", label: "Está vazio" },
  { value: "is_not_empty", label: "Não está vazio" },
];

/**
 * Componente de formulário para criação e edição de workflows
 */
export default function WorkflowForm({
  form,
  onSubmit,
  isSubmitting,
  onCancel,
  isEditing,
  funnels,
  stages,
  isLoadingFunnels,
  isLoadingStages
}: WorkflowFormProps) {
  const watchedFunnelId = form.watch("funnelId");
  
  // Filtrar etapas do funil selecionado
  const funnelStages = stages.filter(stage => stage.funnelId === watchedFunnelId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Configure as informações principais do workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Workflow *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Auto-aprovação, Notificação de atraso..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o que este workflow faz..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional: Adicione uma descrição para ajudar a equipe a entender o propósito do workflow
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Funil */}
            <FormField
              control={form.control}
              name="funnelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funil *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um funil">
                          {field.value && funnels.find(f => f.id === field.value)?.name}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingFunnels ? (
                        <SelectItem value="loading" disabled>
                          Carregando funis...
                        </SelectItem>
                      ) : funnels.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Nenhum funil disponível
                        </SelectItem>
                      ) : (
                        funnels
                          .filter(funnel => funnel.isActive)
                          .map((funnel) => (
                            <SelectItem key={funnel.id} value={funnel.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: funnel.color }}
                                />
                                {funnel.name}
                              </div>
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o funil onde este workflow será executado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Ativo */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Workflow Ativo</FormLabel>
                    <FormDescription>
                      Workflows ativos são executados automaticamente quando as condições são atendidas
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Configuração de Etapas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Configuração de Etapas
            </CardTitle>
            <CardDescription>
              Configure as etapas de gatilho e destino do workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Etapa de Gatilho */}
            <FormField
              control={form.control}
              name="triggerStageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etapa de Gatilho *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!watchedFunnelId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !watchedFunnelId 
                            ? "Selecione um funil primeiro" 
                            : "Selecione a etapa de gatilho"
                        }>
                          {field.value && funnelStages.find(s => s.id === field.value)?.name}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingStages ? (
                        <SelectItem value="loading-stages" disabled>
                          Carregando etapas...
                        </SelectItem>
                      ) : funnelStages.length === 0 ? (
                        <SelectItem value="empty-stages" disabled>
                          {!watchedFunnelId ? "Selecione um funil primeiro" : "Nenhuma etapa disponível"}
                        </SelectItem>
                      ) : (
                        funnelStages
                          .filter(stage => stage.isActive)
                          .map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: stage.color }}
                                />
                                {stage.name}
                              </div>
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Etapa que irá disparar a execução do workflow
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Etapa de Destino */}
            <FormField
              control={form.control}
              name="targetStageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etapa de Destino *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!watchedFunnelId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !watchedFunnelId 
                            ? "Selecione um funil primeiro" 
                            : "Selecione a etapa de destino"
                        }>
                          {field.value && funnelStages.find(s => s.id === field.value)?.name}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingStages ? (
                        <SelectItem value="loading-target-stages" disabled>
                          Carregando etapas...
                        </SelectItem>
                      ) : funnelStages.length === 0 ? (
                        <SelectItem value="empty-target-stages" disabled>
                          {!watchedFunnelId ? "Selecione um funil primeiro" : "Nenhuma etapa disponível"}
                        </SelectItem>
                      ) : (
                        funnelStages
                          .filter(stage => stage.isActive)
                          .map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: stage.color }}
                                />
                                {stage.name}
                              </div>
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Etapa para onde os itens serão movidos quando o workflow for executado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Configurações Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Avançadas
            </CardTitle>
            <CardDescription>
              Configure comportamentos específicos do workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Execução Automática */}
            <FormField
              control={form.control}
              name="settings.autoExecute"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Execução Automática</FormLabel>
                    <FormDescription>
                      O workflow é executado automaticamente quando as condições são atendidas
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Requer Aprovação */}
            <FormField
              control={form.control}
              name="settings.requireApproval"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Requer Aprovação</FormLabel>
                    <FormDescription>
                      A execução do workflow precisa ser aprovada por um supervisor
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Notificar na Execução */}
            <FormField
              control={form.control}
              name="settings.notifyOnExecution"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notificar na Execução</FormLabel>
                    <FormDescription>
                      Envia notificação quando o workflow é executado
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Máximo de Execuções */}
            <FormField
              control={form.control}
              name="settings.maxExecutions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máximo de Execuções por Item</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="1"
                      placeholder="Ex: 5"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional: Limite máximo de vezes que o workflow pode ser executado para o mesmo item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tempo de Espera */}
            <FormField
              control={form.control}
              name="settings.cooldownMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo de Espera (minutos)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      placeholder="Ex: 30"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional: Tempo mínimo entre execuções do workflow para o mesmo item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                {isEditing ? "Atualizando..." : "Criando..."}
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                {isEditing ? "Atualizar Workflow" : "Criar Workflow"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { workflowSchema };