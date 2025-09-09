import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  RefreshCw,
  Printer,
  Download,
  Copy
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ServiceOrderDetails from "@/components/serviceOrders/ServiceOrderDetails";
import {
  useServiceOrder,
  useDeleteServiceOrder
} from "@/hooks/serviceOrders";
import { useState } from "react";

/**
 * Página de visualização detalhada de uma ordem de serviço
 * Exibe todas as informações, serviços, produtos e permite ações
 */
export default function ShowServiceOrder() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Hook para buscar ordem de serviço
  const {
    data: serviceOrder,
    isLoading,
    error,
    refetch
  } = useServiceOrder(id!);
  
  // Hook para excluir ordem de serviço
  const deleteServiceOrderMutation = useDeleteServiceOrder();

  // Navega para a página de edição
  const handleEdit = () => {
    navigate(`/service-orders/update/${id}`);
  };

  // Exclui a ordem de serviço
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteServiceOrderMutation.mutateAsync(id);
      toast.success("Ordem de serviço excluída com sucesso!");
      navigate("/service-orders");
    } catch (error) {
      console.error("Erro ao excluir ordem de serviço:", error);
      toast.error("Erro ao excluir ordem de serviço. Tente novamente.");
    }
  };

  // Volta para a listagem
  const handleBack = () => {
    navigate("/service-orders");
  };

  // Atualiza os dados
  const handleRefresh = () => {
    refetch();
    toast.success("Dados atualizados!");
  };

  // Copia o ID da ordem
  const handleCopyId = () => {
    if (serviceOrder?.id) {
      navigator.clipboard.writeText(serviceOrder.id);
      toast.success("ID copiado para a área de transferência!");
    }
  };

  // Simula impressão (pode ser implementado com uma biblioteca de PDF)
  const handlePrint = () => {
    window.print();
  };

  // Simula download (pode ser implementado com geração de PDF)
  const handleDownload = () => {
    toast.info("Funcionalidade de download será implementada em breve.");
  };

  // Verifica se o ID é válido
  if (!id) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
            <CardDescription>
              ID da ordem de serviço não fornecido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Listagem
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exibe erro se houver
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao Carregar Ordem</CardTitle>
            <CardDescription>
              Não foi possível carregar os dados da ordem de serviço.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Listagem
              </Button>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exibe loading enquanto carrega os dados
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Skeleton do cabeçalho */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Skeleton do conteúdo */}
        <ServiceOrderDetails
          serviceOrder={{} as any}
          isLoading={true}
        />
      </div>
    );
  }

  // Não renderiza se não há dados da ordem
  if (!serviceOrder) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Ordem não encontrada</CardTitle>
            <CardDescription>
              A ordem de serviço solicitada não foi encontrada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Listagem
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{serviceOrder.title}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <span>Ordem #{serviceOrder.id.slice(-8).toUpperCase()}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyId}
                className="h-6 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <Button
            size="sm"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta ordem de serviço? 
                  Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteServiceOrderMutation.isPending}
                >
                  {deleteServiceOrderMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <ServiceOrderDetails
        serviceOrder={serviceOrder}
        onEdit={handleEdit}
        onPrint={handlePrint}
        onDownload={handleDownload}
        isLoading={false}
      />

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Ações comuns para esta ordem de serviço
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={handleEdit}
            >
              <Edit className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Editar Ordem</p>
                <p className="text-sm text-gray-600">Modificar informações</p>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate(`/service-orders/create`)}
            >
              <Copy className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Duplicar Ordem</p>
                <p className="text-sm text-gray-600">Criar ordem similar</p>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={handlePrint}
            >
              <Printer className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Imprimir</p>
                <p className="text-sm text-gray-600">Gerar relatório</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico (placeholder para futura implementação) */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alterações</CardTitle>
          <CardDescription>
            Registro de todas as modificações realizadas nesta ordem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Histórico de alterações será implementado em uma versão futura.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}