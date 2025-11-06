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
import { Filter, Target, Settings, Info } from "lucide-react";

/**
 * Schema de validação para formulário de funil
 */
const funnelSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
  isActive: z.boolean(),
  order: z.number().int().min(0, "Ordem não pode ser negativa").optional(),
  settings: z.object({
    autoAdvance: z.boolean().optional(),
    notifyOnStageChange: z.boolean().optional(),
    requireApproval: z.boolean().optional(),
    maxItemsPerStage: z.number().int().min(1).optional(),
  }).optional(),
});

export type FunnelFormData = z.infer<typeof funnelSchema>;

interface FunnelFormProps {
  form: UseFormReturn<FunnelFormData>;
  onSubmit: (data: FunnelFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  isEditing: boolean;
}

/**
 * Cores predefinidas para funis
 */
const FUNNEL_COLORS = [
  { value: "#3B82F6", label: "Azul", color: "#3B82F6" },
  { value: "#10B981", label: "Verde", color: "#10B981" },
  { value: "#F59E0B", label: "Amarelo", color: "#F59E0B" },
  { value: "#EF4444", label: "Vermelho", color: "#EF4444" },
  { value: "#8B5CF6", label: "Roxo", color: "#8B5CF6" },
  { value: "#06B6D4", label: "Ciano", color: "#06B6D4" },
  { value: "#84CC16", label: "Lima", color: "#84CC16" },
  { value: "#F97316", label: "Laranja", color: "#F97316" },
];

/**
 * Componente de formulário para criação e edição de funis
 */
export default function FunnelForm({
  form,
  onSubmit,
  isSubmitting,
  onCancel,
  isEditing
}: FunnelFormProps) {
  const watchedColor = form.watch("color");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Configure as informações principais do funil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Funil *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Vendas, Suporte, Projetos..." 
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
                      placeholder="Descreva o propósito e objetivo deste funil..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional: Adicione uma descrição para ajudar a equipe a entender o propósito do funil
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
                  <FormLabel>Cor do Funil *</FormLabel>
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
                              {FUNNEL_COLORS.find(c => c.value === watchedColor)?.label}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FUNNEL_COLORS.map((color) => (
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
                    A cor ajuda a identificar visualmente o funil na interface
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
                    <FormLabel className="text-base">Funil Ativo</FormLabel>
                    <FormDescription>
                      Funis ativos podem receber novos itens e são visíveis na interface
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

        {/* Configurações Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Avançadas
            </CardTitle>
            <CardDescription>
              Configure comportamentos específicos do funil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Auto Avanço */}
            <FormField
              control={form.control}
              name="settings.autoAdvance"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Avanço Automático</FormLabel>
                    <FormDescription>
                      Permite que itens avancem automaticamente entre etapas baseado em regras
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

            {/* Notificação de Mudança de Etapa */}
            <FormField
              control={form.control}
              name="settings.notifyOnStageChange"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notificar Mudanças</FormLabel>
                    <FormDescription>
                      Envia notificações quando itens mudam de etapa
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
                      Mudanças de etapa precisam ser aprovadas por um supervisor
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

            {/* Máximo de Itens por Etapa */}
            <FormField
              control={form.control}
              name="settings.maxItemsPerStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máximo de Itens por Etapa</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="1"
                      placeholder="Ex: 50"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional: Limite máximo de itens que cada etapa pode conter
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
                {isEditing ? "Atualizar Funil" : "Criar Funil"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { funnelSchema };