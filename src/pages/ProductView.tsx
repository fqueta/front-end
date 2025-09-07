import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Tag, DollarSign, Archive, BarChart3, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProduct } from '@/hooks/products';
import type { Product } from '@/types/products';

/**
 * Página de visualização detalhada de um produto específico
 * Exibe todas as informações do produto de forma organizada
 */
export default function ProductView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id!);

  /**
   * Navega de volta para a listagem de produtos
   */
  const handleBack = () => {
    navigate('/products');
  };

  /**
   * Formata valores monetários para exibição
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  /**
   * Calcula a margem de lucro
   */
  const calculateMargin = (salePrice: number, costPrice: number) => {
    if (salePrice === 0) return 0;
    return Math.round(((salePrice - costPrice) / salePrice) * 100);
  };

  /**
   * Formata a data para exibição no formato brasileiro
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Erro ao carregar produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'Não foi possível carregar as informações do produto.'}
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para produtos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produto não encontrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              O produto solicitado não foi encontrado ou pode ter sido removido.
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para produtos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const margin = calculateMargin(product.salePrice, product.costPrice);
  const isLowStock = product.stock <= 10;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">
              Visualização detalhada do produto
            </p>
          </div>
        </div>
        <Badge variant={product.active ? "default" : "secondary"} className="text-sm">
          {product.active ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="text-lg font-medium">{product.name}</p>
            </div>
            
            {product.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <p className="text-sm">{product.description}</p>
              </div>
            )}
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Categoria
                </label>
                <Badge variant="outline" className="mt-1">{product.category}</Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unidade</label>
                <p className="text-sm font-medium">{product.unit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Informações Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preço de Venda</label>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(product.salePrice)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preço de Custo</label>
                <p className="text-lg font-medium text-orange-600">
                  {formatCurrency(product.costPrice)}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Margem de Lucro
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={margin > 30 ? "default" : margin > 15 ? "secondary" : "destructive"}
                  className="text-sm"
                >
                  {margin}%
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Lucro: {formatCurrency(product.salePrice - product.costPrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Estoque */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Controle de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Quantidade em Estoque</label>
              <div className="flex items-center gap-2 mt-1">
                <p className={`text-2xl font-bold ${
                  isLowStock ? 'text-destructive' : 'text-foreground'
                }`}>
                  {product.stock}
                </p>
                <span className="text-sm text-muted-foreground">{product.unit}</span>
              </div>
              {isLowStock && (
                <div className="flex items-center gap-1 mt-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive font-medium">
                    Estoque baixo - Reposição necessária
                  </span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valor Total em Estoque</label>
              <div className="space-y-1 mt-1">
                <p className="text-lg font-medium">
                  Custo: {formatCurrency(product.stock * product.costPrice)}
                </p>
                <p className="text-lg font-medium text-green-600">
                  Venda: {formatCurrency(product.stock * product.salePrice)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID do Produto</label>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{product.id}</p>
            </div>
            
            {product.created_at && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                <p className="text-sm">{formatDate(product.created_at)}</p>
              </div>
            )}
            
            {product.updated_at && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
                <p className="text-sm">{formatDate(product.updated_at)}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  product.active ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm">
                  {product.active ? 'Produto ativo e disponível' : 'Produto inativo'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}