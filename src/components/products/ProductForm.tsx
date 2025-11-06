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

import { Calculator, Package, DollarSign, BarChart3, Info } from "lucide-react";

// Form validation schema
const productSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  salePrice: z.number().min(0.01, "Preço de venda deve ser maior que 0"),
  costPrice: z.number().min(0.01, "Preço de custo deve ser maior que 0"),
  stock: z.number().int().min(0, "Estoque não pode ser negativo"),
  minStock: z.number().int().min(0, "Estoque mínimo não pode ser negativo").optional(),
  maxStock: z.number().int().min(0, "Estoque máximo não pode ser negativo").optional(),
  unit: z.string().min(1, "Unidade é obrigatória"),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  weight: z.number().min(0, "Peso não pode ser negativo").optional(),
  dimensions: z.string().optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  active: z.boolean(),
}).refine((data) => {
  if (data.minStock && data.maxStock) {
    return data.minStock <= data.maxStock;
  }
  return true;
}, {
  message: "Estoque mínimo deve ser menor ou igual ao estoque máximo",
  path: ["maxStock"],
});

export type ProductFormData = z.infer<typeof productSchema>;

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

interface ProductFormProps {
  form: UseFormReturn<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
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

export default function ProductForm({
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
}: ProductFormProps) {
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

  // Cálculo da margem de lucro
  const profitMargin = useMemo(() => {
    const salePrice = form.watch('salePrice') || 0;
    const costPrice = form.watch('costPrice') || 0;
    
    if (costPrice === 0) return 0;
    
    return ((salePrice - costPrice) / costPrice) * 100;
  }, [form.watch('salePrice'), form.watch('costPrice')]);

  // Cálculo do lucro absoluto
  const profitAmount = useMemo(() => {
    const salePrice = form.watch('salePrice') || 0;
    const costPrice = form.watch('costPrice') || 0;
    
    return salePrice - costPrice;
  }, [form.watch('salePrice'), form.watch('costPrice')]);
  //função para apagar o zero se ele for o primeiro caractere
 const apagaZeros = (value: string): string => {
    if (!value) return '';
    return value.replace(/^0+/, '');
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Dados principais do produto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome do produto" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories || !!categoriesError}>
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
                      placeholder="Descrição do produto (opcional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Código do produto" {...field} />
                    </FormControl>
                    <FormDescription>
                      Código único de identificação do produto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Barras</FormLabel>
                    <FormControl>
                      <Input placeholder="EAN/UPC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preços e Margem */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Preços e Margem
            </CardTitle>
            <CardDescription>
              Configuração de preços e cálculo de margem de lucro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Custo *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$ 0,00"
                        value={field.value !== undefined && field.value !== null ? formatCurrency(field.value) : ''}
                        onChange={(e) => {
                          const formatted = formatCurrencyInput(e.target.value);
                          const numericValue = parseCurrency(formatted);
                          // Garante que sempre seja um número válido
                          field.onChange(isNaN(numericValue) ? 0 : numericValue);
                          // Atualiza o valor exibido
                          e.target.value = formatted;
                        }}
                        onBlur={(e) => {
                          const numericValue = parseCurrency(e.target.value);
                          // Garante que sempre seja um número válido
                          const validNumber = isNaN(numericValue) ? 0 : numericValue;
                          field.onChange(validNumber);
                          // Formata o valor final
                          e.target.value = validNumber > 0 ? formatCurrency(validNumber) : '';
                        }}
                        onFocus={(e) => {
                          // Ao focar, mostra o valor sem formatação para facilitar edição
                          if (field.value !== undefined && field.value !== null && field.value > 0) {
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
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$ 0,00"
                        value={field.value !== undefined && field.value !== null ? formatCurrency(field.value) : ''}
                        onChange={(e) => {
                          const formatted = formatCurrencyInput(e.target.value);
                          const numericValue = parseCurrency(formatted);
                          // Garante que sempre seja um número válido
                          field.onChange(isNaN(numericValue) ? 0 : numericValue);
                          // Atualiza o valor exibido
                          e.target.value = formatted;
                        }}
                        onBlur={(e) => {
                          const numericValue = parseCurrency(e.target.value);
                          // Garante que sempre seja um número válido
                          const validNumber = isNaN(numericValue) ? 0 : numericValue;
                          field.onChange(validNumber);
                          // Formata o valor final
                          e.target.value = validNumber > 0 ? formatCurrency(validNumber) : '';
                        }}
                        onFocus={(e) => {
                          // Ao focar, mostra o valor sem formatação para facilitar edição
                          if (field.value !== undefined && field.value !== null && field.value > 0) {
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
            </div>

            {/* Indicadores de Margem */}
            {(form.watch('costPrice') > 0 || form.watch('salePrice') > 0) && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calculator className="h-4 w-4" />
                  Análise de Margem
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Lucro:</span>
                    <Badge variant={profitAmount >= 0 ? "default" : "destructive"}>
                      {formatCurrency(profitAmount)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Margem:</span>
                    <Badge variant={profitMargin >= 0 ? "default" : "destructive"}>
                      {profitMargin.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
                {profitMargin < 0 && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <Info className="h-4 w-4" />
                    Preço de venda menor que o custo
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estoque */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Controle de Estoque
            </CardTitle>
            <CardDescription>
              Gestão de quantidades e unidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Atual *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        onClick={(e) => e.target.select()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        onClick={(e) => e.target.select()}
                      />
                    </FormControl>
                    <FormDescription>
                      Alerta quando atingir este valor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Máximo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        onClick={(e) => e.target.select()}
                      />
                    </FormControl>
                    <FormDescription>
                      Limite máximo de estoque
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade de Medida *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingUnits || !!unitsError}>
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
                        <div className="p-2 text-sm text-muted-foreground">
                          Nenhuma unidade disponível
                        </div>
                      ) : (
                        units.map((unit) => (
                          <SelectItem key={unit.id} value={String(unit.id)}>
                            {unit.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
            <CardDescription>
              Dados complementares do produto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensões</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 10x20x30 cm" {...field} />
                    </FormControl>
                    <FormDescription>
                      Formato: comprimento x largura x altura
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do fornecedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Prateleira A1, Setor B" {...field} />
                    </FormControl>
                    <FormDescription>
                      Localização física no estoque
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Produto Ativo</FormLabel>
                    <FormDescription>
                      Produto disponível para venda no sistema
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

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { productSchema };
export type { Category, Unit };