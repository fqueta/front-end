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
import { GitBranch, Target, Settings, Filter } from "lucide-react";
import { Funnel as FunnelType } from "@/types";

/**
 * Schema de validação para formulário de etapa
 */
const stageSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  funnelId: z.string().min(1, "Funil é obrigatório"),
  color: z.string().min(1, "Cor é obrigatória"),
  isActive: z.boolean(),
  order: z.number().int().min(0, "Ordem não pode ser negativa").optional()
});

export type StageFormData = z.infer<typeof stageSchema>;

interface StageFormProps {
  form: UseFormReturn<StageFormData>;
  onSubmit: (data: StageFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  isEditing: boolean;
  funnels: FunnelType[];
  isLoadingFunnels: boolean;
}

/**
 * Cores predefinidas para etapas
 */
const STAGE_COLORS = [
  { value: "#3B82F6", label: "Azul", color: "#3B82F6" },
  { value: "#10B981", label: "Verde", color: "#10B981" },
  { value: "#F59E0B", label: "Amarelo", color: "#F59E0B" },
  { value: "#EF4444", label: "Vermelho", color: "#EF4444" },
  { value: "#8B5CF6", label: "Roxo", color: "#8B5CF6" },
  { value: "#06B6D4", label: "Ciano", color: "#06B6D4" },
  { value: "#84CC16", label: "Lima", color: "#84CC16" },
  { value: "#F97316", label: "Laranja", color: "#F97316" },
  { value: "#EC4899", label: "Rosa", color: "#EC4899" },
  { value: "#6B7280", label: "Cinza", color: "#6B7280" },
];

/**
 * Componente de formulário para criação e edição de etapas
 */
export default function StageForm({
  form,
  onSubmit,
  isSubmitting,
  onCancel,
  isEditing,
  funnels,
  isLoadingFunnels
}: StageFormProps) {
  const watchedColor = form.watch("color");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Configure as informações principais da etapa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Etapa *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Prospecção, Qualificação, Proposta..." 
                      {...field} 
                    />
                  </FormControl>
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
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um funil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingFunnels ? (
                        <SelectItem value="loading-funnels" disabled>
                          Carregando funis...
                        </SelectItem>
                      ) : funnels.length === 0 ? (
                        <SelectItem value="empty-funnels" disabled>
                          Nenhum funil disponível
                        </SelectItem>
                      ) : (
                        funnels
                          .filter(funnel => funnel.isActive)
                          .map((funnel) => (
                            <SelectItem key={funnel.id} value={String(funnel.id)}>
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
                    Selecione o funil ao qual esta etapa pertence
                  </FormDescription>
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
                      placeholder="Descreva o que acontece nesta etapa..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional: Adicione uma descrição para ajudar a equipe a entender o propósito da etapa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cor */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor da Etapa *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma cor">
                          {watchedColor && (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: watchedColor }}
                              />
                              {STAGE_COLORS.find(c => c.value === watchedColor)?.label}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STAGE_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.color }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    A cor ajuda a identificar visualmente a etapa no funil
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
                    <FormLabel className="text-base">Etapa Ativa</FormLabel>
                    <FormDescription>
                      Etapas ativas podem receber novos itens e são visíveis no funil
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
                {isEditing ? "Atualizar Etapa" : "Criar Etapa"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { stageSchema };