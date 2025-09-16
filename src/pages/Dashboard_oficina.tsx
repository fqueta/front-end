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
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // Mock data - will be replaced with real API calls
  const stats = {
    totalBudgets: 45,
    pendingBudgets: 12,
    activeServiceOrders: 23,
    monthlyRevenue: 125000,
    cashBalance: 85000,
    clientsCount: 156,
  };

  const recentActivities = [
    {
      id: 1,
      type: "budget",
      title: "Orçamento #2024-001 criado",
      client: "João Silva",
      amount: 2500,
      status: "pending",
      time: "2 horas atrás",
    },
    {
      id: 2,
      type: "service_order",
      title: "OS #2024-045 concluída",
      client: "Maria Santos",
      amount: 1800,
      status: "completed",
      time: "4 horas atrás",
    },
    {
      id: 3,
      type: "payment",
      title: "Pagamento recebido",
      client: "Tech Corp",
      amount: 5200,
      status: "paid",
      time: "1 dia atrás",
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      number: "ORC-2024-034",
      client: "Empresa ABC",
      amount: 8500,
      date: "2024-01-15",
    },
    {
      id: 2,
      number: "ORC-2024-035",
      client: "Loja XYZ",
      amount: 3200,
      date: "2024-01-14",
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      type: "budget",
      number: "ORC-2024-028",
      client: "Cliente ABC",
      deadline: "2024-01-20",
      daysLeft: 3,
    },
    {
      id: 2,
      type: "service_order",
      number: "OS-2024-019",
      client: "Empresa XYZ",
      deadline: "2024-01-22",
      daysLeft: 5,
    },
  ];

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
            <div className="text-2xl font-bold">{stats.totalBudgets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingBudgets} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OS Ativas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeServiceOrders}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(stats.monthlyRevenue / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caixa</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(stats.cashBalance / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">
              Disponível
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientsCount}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados
            </p>
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
                      R$ {activity.amount.toLocaleString()}
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
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{item.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.client} • {item.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      R$ {item.amount.toLocaleString()}
                    </p>
                    <Button size="sm" variant="outline" className="mt-1">
                      Revisar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
        </CardContent>
      </Card>
    </div>
  );
}