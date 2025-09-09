import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import ServiceOrderTable from "@/components/serviceOrders/ServiceOrderTable";
import {
  useServiceOrdersList,
  useDeleteServiceOrder,
  useUpdateServiceOrderStatus
} from "@/hooks/serviceOrders";
import { ServiceOrderStatus } from "@/types/serviceOrders";

/**
 * Página de listagem de ordens de serviço
 * Permite visualizar, filtrar, editar e excluir ordens de serviço
 */
export default function ServiceOrders() {
  const navigate = useNavigate();
  
  // Estados para filtros e paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  // Hooks para gerenciar dados
  const {
    data: serviceOrdersData,
    isLoading,
    error,
    refetch
  } = useServiceOrdersList({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined
  });

  const deleteServiceOrderMutation = useDeleteServiceOrder();
  const updateStatusMutation = useUpdateServiceOrderStatus();

  // Dados da resposta paginada
  const serviceOrders = serviceOrdersData?.data || [];
  const totalPages = serviceOrdersData?.totalPages || 1;
  const totalItems = serviceOrdersData?.total || 0;

  // Navega para a página de visualização
  const handleView = (id: string) => {
    navigate(`/service-orders/show/${id}`);
  };

  // Navega para a página de edição
  const handleEdit = (id: string) => {
    navigate(`/service-orders/update/${id}`);
  };

  // Exclui uma ordem de serviço
  const handleDelete = async (id: string) => {
    try {
      await deleteServiceOrderMutation.mutateAsync(id);
      toast.success("Ordem de serviço excluída com sucesso!");
      refetch();
    } catch (error) {
      console.error("Erro ao excluir ordem de serviço:", error);
      toast.error("Erro ao excluir ordem de serviço. Tente novamente.");
    }
  };

  // Atualiza o status de uma ordem de serviço
  const handleStatusChange = async (id: string, newStatus: ServiceOrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      toast.success("Status atualizado com sucesso!");
      refetch();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status. Tente novamente.");
    }
  };

  // Navega para a página de criação
  const handleCreate = () => {
    navigate("/service-orders/create");
  };

  // Atualiza a página atual
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Atualiza o termo de busca
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset para primeira página ao buscar
  };

  // Atualiza o filtro de status
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset para primeira página ao filtrar
  };

  // Atualiza o filtro de prioridade
  const handlePriorityFilterChange = (priority: string) => {
    setPriorityFilter(priority);
    setCurrentPage(1); // Reset para primeira página ao filtrar
  };

  // Recarrega os dados
  const handleRefresh = () => {
    refetch();
    toast.success("Dados atualizados!");
  };

  // Exibe erro se houver
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao Carregar Dados</CardTitle>
            <CardDescription>
              Ocorreu um erro ao carregar as ordens de serviço. Tente novamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Ordem
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-gray-600">
            Gerencie todas as ordens de serviço do sistema
            {totalItems > 0 && (
              <span className="ml-2">({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ordem
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Serviço</CardTitle>
          <CardDescription>
            Visualize, edite e gerencie todas as ordens de serviço cadastradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceOrderTable
            serviceOrders={serviceOrders}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={handlePriorityFilterChange}
          />
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      {!isLoading && serviceOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {serviceOrders.filter(so => so.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {serviceOrders.filter(so => so.status === 'in_progress').length}
                </p>
                <p className="text-sm text-gray-600">Em Andamento</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {serviceOrders.filter(so => so.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Concluídas</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {serviceOrders.filter(so => so.priority === 'urgent').length}
                </p>
                <p className="text-sm text-gray-600">Urgentes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado Vazio */}
      {!isLoading && serviceOrders.length === 0 && searchTerm === "" && statusFilter === "all" && priorityFilter === "all" && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Nenhuma ordem de serviço encontrada</h3>
                <p className="text-gray-600 mt-2">
                  Comece criando sua primeira ordem de serviço para organizar e gerenciar os trabalhos.
                </p>
              </div>
              <Button onClick={handleCreate} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Ordem
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}