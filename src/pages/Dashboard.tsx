import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useServiceOrderStats, useServiceOrdersList } from "@/hooks/serviceOrders";
import { useFinancialSummary } from "@/hooks/useFinancial";
import { useClientsList } from "@/hooks/clients";

export default function Dashboard() {
  // Hooks para buscar dados reais da API
  const { data: serviceOrderStats, isLoading: isLoadingServiceOrders } = useServiceOrderStats();
  const { data: financialSummary, loading: isLoadingFinancial } = useFinancialSummary();
  const { data: clientsResponse, isLoading: isLoadingClients } = useClientsList();
  const { data: recentServiceOrders, isLoading: isLoadingRecentOrders } = useServiceOrdersList({
    limit: 10,
    sort: 'created_at',
    order: 'desc'
  });

  // Dados processados das APIs
  const stats = {
    totalBudgets: 0, // TODO: Implementar quando houver API de orçamentos
    pendingBudgets: 0, // TODO: Implementar quando houver API de orçamentos
    activeServiceOrders: serviceOrderStats?.active_count || 0,
    monthlyRevenue: financialSummary?.monthly_revenue || 0,
    cashBalance: financialSummary?.cash_balance || 0,
    clientsCount: clientsResponse?.total || 0,
  };

  // Estado de loading geral
  const isLoading = isLoadingServiceOrders || isLoadingFinancial || isLoadingClients;

  // Atividades recentes baseadas em ordens de serviço reais
  const recentActivities = recentServiceOrders?.data?.map((order: any, index: number) => ({
    id: order.id,
    type: "service_order",
    title: `Ordem de Serviço ${order.status === 'completed' ? 'finalizada' : 'criada'}`,
    client: order.client?.name || 'Cliente não informado',
    amount: order.total_amount || 0,
    status: order.status,
    time: new Date(order.created_at).toLocaleDateString('pt-BR'),
  })) || [];

  // Aprovações pendentes baseadas em ordens de serviço com status pendente
  const pendingApprovals = recentServiceOrders?.data?.filter((order: any) => 
    order.status === 'pending' || order.status === 'waiting_approval'
  ).map((order: any) => ({
    id: order.id,
    type: "service_order",
    title: `OS #${order.id}`,
    client: order.client?.name || 'Cliente não informado',
    amount: order.total_amount || 0,
    daysWaiting: Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24)),
  })) || [];

  // Próximos vencimentos baseados em ordens de serviço com prazos próximos
  const upcomingDeadlines = recentServiceOrders?.data?.filter((order: any) => {
    if (!order.deadline) return false;
    const deadline = new Date(order.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7; // Próximos 7 dias
  }).map((order: any) => {
    const deadline = new Date(order.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let priority = 'low';
    if (diffDays <= 1) priority = 'high';
    else if (diffDays <= 3) priority = 'medium';
    
    return {
      id: order.id,
      type: "service_order",
      number: `OS-${order.id}`,
      client: order.client?.name || 'Cliente não informado',
      deadline: order.deadline,
      priority,
      daysLeft: diffDays,
    };
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de gestão de OS e orçamentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/budgets/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/service-orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova OS
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalBudgets}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingBudgets} pendentes
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OS Ativas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingServiceOrders ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.activeServiceOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Em andamento
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingFinancial ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  R$ {(stats.monthlyRevenue / 1000).toFixed(0)}k
                </div>
                <p className="text-xs text-muted-foreground">
                  Este mês
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caixa</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingFinancial ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  R$ {(stats.cashBalance / 1000).toFixed(0)}k
                </div>
                <p className="text-xs text-muted-foreground">
                  Disponível
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingClients ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.clientsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Cadastrados
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">6</div>
            <p className="text-xs text-muted-foreground">
              Pendências
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas movimentações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecentOrders ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Carregando atividades...</span>
                </div>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma atividade recente encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        {activity.type === "budget" && <FileText className="h-4 w-4" />}
                        {activity.type === "service_order" && <ClipboardList className="h-4 w-4" />}
                        {activity.type === "payment" && <DollarSign className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.client} • {activity.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        R$ {activity.amount?.toLocaleString() || '0'}
                      </p>
                      <Badge variant={
                        activity.status === "completed" ? "default" :
                        activity.status === "pending" ? "secondary" : "outline"
                      }>
                        {activity.status === "completed" && "Concluído"}
                        {activity.status === "pending" && "Pendente"}
                        {activity.status === "paid" && "Pago"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Aprovações Pendentes
            </CardTitle>
            <CardDescription>
              Orçamentos aguardando aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecentOrders ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Carregando aprovações...</span>
                </div>
              </div>
            ) : pendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma aprovação pendente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.client} • {item.daysWaiting} dias aguardando
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        R$ {item.amount?.toLocaleString() || '0'}
                      </p>
                      <Button size="sm" variant="outline" className="mt-1">
                        Revisar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Próximos Vencimentos
          </CardTitle>
          <CardDescription>
            Orçamentos e OS com prazos próximos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRecentOrders ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando vencimentos...</span>
              </div>
            </div>
          ) : upcomingDeadlines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum vencimento próximo</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingDeadlines.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      item.daysLeft <= 3 ? "bg-destructive/10 text-destructive" : "bg-muted"
                    }`}>
                      {item.type === "budget" ? <FileText className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.number}</p>
                      <p className="text-xs text-muted-foreground">{item.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.daysLeft <= 3 ? "destructive" : "secondary"}>
                      {item.daysLeft} dias
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}