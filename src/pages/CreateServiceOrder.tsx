import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import ServiceOrderForm from "@/components/serviceOrders/ServiceOrderForm";
import { serviceOrderSchema, type ServiceOrderFormData } from "@/components/serviceOrders/serviceOrderSchema";
import {
  useCreateServiceOrder,
  useServiceOrderFormData
} from "@/hooks/serviceOrders";
import { useQueryClient } from "@tanstack/react-query";
import { ServiceOrderServiceItem, ServiceOrderProductItem } from "@/types/serviceOrders";

/**
 * Página de criação de nova ordem de serviço
 * Permite criar uma ordem com serviços e produtos
 */
// Function-level comment: Inicializa a página de criação de OS, carregando dados e definindo handlers de submissão.
export default function CreateServiceOrder() {
  const navigate = useNavigate();
  // Removido useToast; usando "sonner" diretamente para notificações.

  const createServiceOrderMutation = useCreateServiceOrder();

  const {
    clients,
    isLoadingClients,
    users,
    isLoadingUsers,
    aircraft,
    isLoadingAircraft,
    availableServices,
    isLoadingServices,
    availableProducts,
    isLoadingProducts,
    searchClients,
    searchUsers,
    searchAircraft,
    searchServices,
    searchProducts,
  } = useServiceOrderFormData();

  const params = useParams();

  // Function-level comment: Define dados de criação rápida para novo registro via URL.
  const quickCreateData = useMemo(() => {
    const clientId = params.clientId;
    const aircraftId = params.aircraftId;

    const title = aircraftId ? `O.S. ${aircraftId}` : "";

    return {
      client_id: clientId ? String(clientId) : "",
      aircraft_id: aircraftId ? String(aircraftId) : "",
      title,
    };
  }, [params.clientId, params.aircraftId]);

  // Function-level comment: Submete dados do formulário mapeando para o input da API.
  const handleSubmit = async (data: any) => {
    const serviceOrderData: CreateServiceOrderInput = {
      title: data.title || "",
      description: data.description || "",
      clientId: data.client_id ? Number(data.client_id) : undefined,
      aircraftId: data.aircraft_id ? Number(data.aircraft_id) : undefined,
      assignedToId: data.assigned_to_id ? Number(data.assigned_to_id) : undefined,
      doc_type: data.doc_type,
      funnelId: data.funnel_id ? Number(data.funnel_id) : undefined,
      stageId: data.stage_id ? Number(data.stage_id) : undefined,
      services: data.services.map(s => ({ serviceId: Number(s.service_id), quantity: Number(s.quantity) })),
      products: data.products.map(p => ({ productId: Number(p.product_id), quantity: Number(p.quantity) })),
      observations: data.observations || "",
    };

    try {
      const created = await createServiceOrderMutation.mutateAsync(serviceOrderData);
      toast({ title: "OS criada com sucesso", description: `#${created.id}` });
      navigate(`/servicos/os/${created.id}`);
    } catch (error: any) {
      toast({ title: "Erro ao criar OS", description: error?.message || "Ocorreu um erro" });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Criar Ordem de Serviço</h1>
      <ServiceOrderForm
        clients={clients}
        isLoadingClients={isLoadingClients}
        users={users}
        isLoadingUsers={isLoadingUsers}
        aircraft={aircraft}
        isLoadingAircraft={isLoadingAircraft}
        availableServices={availableServices}
        isLoadingServices={isLoadingServices}
        availableProducts={availableProducts}
        isLoadingProducts={isLoadingProducts}
        searchClients={searchClients}
        searchUsers={searchUsers}
        searchAircraft={searchAircraft}
        searchServices={searchServices}
        searchProducts={searchProducts}
        quickCreateData={quickCreateData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}