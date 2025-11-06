import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { useMemo } from "react";

import { Settings, DollarSign, Clock, Wrench } from "lucide-react";
import { SKILL_LEVELS, TIME_UNITS } from "@/types/services";

// Form validation schema
const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  price: z.number().min(0.01, "Preço deve ser maior que 0"),
  estimatedDuration: z.number().min(1, "Duração estimada deve ser maior que 0"),
  unit: z.string().min(1, "Unidade é obrigatória"),
  active: z.boolean(),
  requiresMaterials: z.boolean(),
  skillLevel: z.enum(["basic", "intermediate", "advanced", "expert"], {
    required_error: "Nível de habilidade é obrigatório"
  }),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

/**
 * Função para formatar valor monetário no padrão brasileiro para exibição
 */
const formatCurrency = (value: number): string => {
  if (!value || isNaN(value)) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Função para formatar valor durante a digitação (mais flexível)
 */
const formatCurrencyInput = (value: string): string => {
  if (!value) return '';
  
  // Remove tudo exceto dígitos
  const digits = value.replace(/\D/g, '');
  
  if (!digits) return '';
  
  // Converte para centavos
  const cents = parseInt(digits);
  const reais = cents / 100;
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(reais);
};

/**
 * Função para converter string monetária em número
 */
const parseCurrency = (value: string): number => {
  if (!value) return 0;
  
  // Remove tudo exceto dígitos
  const digits = value.replace(/\D/g, '');
  
  if (!digits) return 0;
  
  // Converte centavos para reais
  const cents = parseInt(digits);
  return cents / 100;
};

interface Category {
  id?: string | number;
  name?: string;
}

interface Unit {
  id?: number;
  name?: string;
  label?: string;
  value?: string;
}

interface ServiceFormProps {
  form: UseFormReturn<ServiceFormData>;
  onSubmit: (data: ServiceFormData) => void;
  isSubmitting: boolean;
  categories: Category[];
  units: Unit[];
  isLoadingCategories: boolean;
  isLoadingUnits: boolean;
  categoriesError: any;
  unitsError: any;
  onCancel: () => void;
  isEditing: boolean;
}

/**
 * Componente de formulário para criação e edição de serviços
 * Inclui validação de dados e interface responsiva
 */
export default function ServiceForm({
  form,
  onSubmit,
  isSubmitting,
  categories,
  units,
  isLoadingCategories,
  isLoadingUnits,
  categoriesError,
  unitsError,
  onCancel,
  isEditing
}: ServiceFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Dados principais do serviço
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Serviço *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome do serviço"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting || isLoadingCategories || !!categoriesError}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Carregando categorias...
                          </div>
                        ) : categoriesError ? (
                          <div className="p-2 text-sm text-destructive">
                            Erro ao carregar categorias
                          </div>
                        ) : categories.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Nenhuma categoria disponível
                          </div>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o serviço (opcional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrição detalhada do serviço oferecido
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Preços e Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Preços e Configurações
            </CardTitle>
            <CardDescription>
              Configuração de preços e nível de complexidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$ 0,00"
                        value={field.value ? formatCurrency(field.value) : ''}
                        onChange={(e) => {
                          const formatted = formatCurrencyInput(e.target.value);
                          const numericValue = parseCurrency(formatted);
                          field.onChange(numericValue);
                          // Atualiza o valor exibido
                          e.target.value = formatted;
                        }}
                        onBlur={(e) => {
                          const numericValue = parseCurrency(e.target.value);
                          field.onChange(numericValue);
                          // Formata o valor final
                          e.target.value = numericValue ? formatCurrency(numericValue) : '';
                        }}
                        onFocus={(e) => {
                          // Ao focar, mostra o valor sem formatação para facilitar edição
                          if (field.value) {
                            e.target.value = formatCurrency(field.value);
                          }
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skillLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Habilidade *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SKILL_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Nível de complexidade técnica necessária
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tempo e Duração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tempo e Duração
            </CardTitle>
            <CardDescription>
              Configuração de tempo estimado para execução
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração Estimada *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Tempo estimado para conclusão do serviço
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Tempo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting || isLoadingUnits || !!unitsError}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingUnits ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Carregando unidades...
                          </div>
                        ) : unitsError ? (
                          <div className="p-2 text-sm text-destructive">
                            Erro ao carregar unidades
                          </div>
                        ) : units.length === 0 ? (
                          TIME_UNITS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))
                        ) : (
                          units.map((unit) => (
                            <SelectItem
                              key={unit.id || unit.value}
                              value={unit.value || unit.name || `unit_${unit.id}`}
                            >
                              {unit.label || unit.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              Configurações adicionais do serviço
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="requiresMaterials"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Requer Materiais</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Este serviço necessita de materiais específicos
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Serviço Ativo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Serviço disponível para contratação
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Atualizando..."
                : "Criando..."
              : isEditing
              ? "Atualizar Serviço"
              : "Criar Serviço"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { serviceSchema };
export type { Category, Unit };