import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

// Form validation schema
const productSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  salePrice: z.number().min(0.01, "Preço de venda deve ser maior que 0"),
  costPrice: z.number().min(0.01, "Preço de custo deve ser maior que 0"),
  stock: z.number().int().min(0, "Estoque não pode ser negativo"),
  unit: z.string().min(1, "Unidade é obrigatória"),
  active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

// Categories for the select dropdown
const categories = [
  { id: "1", name: "Lubrificantes" },
  { id: "2", name: "Filtros" },
  { id: "3", name: "Pneus" },
  { id: "4", name: "Elétrica" },
  { id: "5", name: "Freios" },
  { id: "6", name: "Suspensão" },
  { id: "7", name: "Motor" },
];

// Units for the select dropdown
const units = [
  { value: "Unidade", label: "Unidade" },
  { value: "Litro", label: "Litro" },
  { value: "Quilograma", label: "Quilograma" },
  { value: "Metro", label: "Metro" },
  { value: "Par", label: "Par" },
];

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { toast } = useToast();

  // Mock data - will be replaced with real API calls
  const products = [
    {
      id: "1",
      name: "Óleo Motor 5W30",
      description: "Óleo sintético para motor",
      category: "Lubrificantes",
      category_id: "1",
      salePrice: 45.90,
      costPrice: 32.50,
      stock: 25,
      unit: "Litro",
      active: true,
      created_at: "2024-01-15",
    },
    {
      id: "2", 
      name: "Filtro de Ar",
      description: "Filtro de ar para veículos leves",
      category: "Filtros",
      category_id: "2",
      salePrice: 35.00,
      costPrice: 18.00,
      stock: 15,
      unit: "Unidade",
      active: true,
      created_at: "2024-01-14",
    },
    {
      id: "3",
      name: "Pneu 185/60 R15",
      description: "Pneu radial aro 15",
      category: "Pneus",
      category_id: "3", 
      salePrice: 280.00,
      costPrice: 195.00,
      stock: 8,
      unit: "Unidade",
      active: true,
      created_at: "2024-01-12",
    },
    {
      id: "4",
      name: "Bateria 60Ah",
      description: "Bateria automotiva livre de manutenção",
      category: "Elétrica",
      category_id: "4",
      salePrice: 320.00,
      costPrice: 220.00,
      stock: 0,
      unit: "Unidade",
      active: false,
      created_at: "2024-01-10",
    },
  ];

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      salePrice: 0,
      costPrice: 0,
      stock: 0,
      unit: "Unidade",
      active: true,
    },
  });

  const handleNewProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      category: "",
      salePrice: 0,
      costPrice: 0,
      stock: 0,
      unit: "Unidade",
      active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      category: product.category,
      salePrice: product.salePrice,
      costPrice: product.costPrice,
      stock: product.stock,
      unit: product.unit,
      active: product.active,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ProductFormData) => {
    // Here you would normally make an API call
    console.log("Product data:", data);
    
    if (editingProduct) {
      toast({
        title: "Produto atualizado",
        description: `${data.name} foi atualizado com sucesso.`,
      });
    } else {
      toast({
        title: "Produto criado",
        description: `${data.name} foi criado com sucesso.`,
      });
    }
    
    setIsDialogOpen(false);
    setEditingProduct(null);
    form.reset();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  const totalStockValue = products.reduce((sum, product) => sum + (product.stock * product.costPrice), 0);
  const lowStockProducts = products.filter(p => p.stock <= 10).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os produtos do estoque
          </p>
        </div>
        <Button onClick={handleNewProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Custo total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              ≤ 10 unidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((products.reduce((sum, p) => sum + ((p.salePrice - p.costPrice) / p.salePrice * 100), 0) / products.length))}%
            </div>
            <p className="text-xs text-muted-foreground">
              Lucro sobre venda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os produtos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preços</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          Venda: R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Custo: R$ {product.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className={`text-sm font-medium ${product.stock <= 10 ? 'text-destructive' : ''}`}>
                          {product.stock} {product.unit}
                        </div>
                        {product.stock <= 10 && (
                          <div className="text-xs text-destructive">
                            Estoque baixo
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {Math.round(((product.salePrice - product.costPrice) / product.salePrice) * 100)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                             <Edit className="mr-2 h-4 w-4" />
                             Editar
                           </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? "Faça as alterações necessárias no produto." 
                : "Preencha as informações do novo produto."
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Nome do Produto</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição do produto (opcional)" 
                          className="resize-none"
                          {...field} 
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
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a unidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Venda (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          step="0.01" 
                          placeholder="0,00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Custo (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          step="0.01" 
                          placeholder="0,00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade em Estoque</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Produto Ativo</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Produto disponível para venda
                        </div>
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
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduct ? "Salvar Alterações" : "Criar Produto"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}