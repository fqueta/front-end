import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle } from "lucide-react";
import type { Product } from "@/types/products";

interface ProductsStatsProps {
  products: Product[];
}

export function ProductsStats({ products }: ProductsStatsProps) {
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  const totalStockValue = products.reduce((sum, product) => sum + (product.stock * (product.costPrice || 0)), 0);
  const lowStockProducts = products.filter(p => p.stock <= 10).length;
  
  // Calcula a margem média apenas se houver produtos
  const averageMargin = products.length > 0 
    ? Math.round(products.reduce((sum, p) => {
        const salePrice = p.salePrice || 0;
        const costPrice = p.costPrice || 0;
        return salePrice > 0 ? sum + ((salePrice - costPrice) / salePrice * 100) : sum;
      }, 0) / products.length)
    : 0;

  return (
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
            {averageMargin}%
          </div>
          <p className="text-xs text-muted-foreground">
            Lucro sobre venda
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductsStats;