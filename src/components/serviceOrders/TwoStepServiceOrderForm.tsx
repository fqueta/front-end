import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateServiceOrder } from "@/hooks/serviceOrders";
import { useServicesList } from "@/hooks/services";
// Dialog components removed - this component is now used as content inside other dialogs
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, User, Phone, Mail, Plane, Search, Wrench, X, Plus } from "lucide-react";
import { ClientNameAutocomplete } from "@/components/clients/ClientNameAutocomplete";
import { ServiceAutocompleteSelect } from "@/components/services/ServiceAutocompleteSelect";
import { QuickCreateClientModal } from "./QuickCreateClientModal";
import { ClientRecord } from "@/types/clients";
import { ServiceRecord } from "@/types/services";

/**
 * Schema para validação do formulário em três etapas
 */
const twoStepSchema = z.object({
  // Etapa 1: Matrícula da aeronave
  aircraft_registration: z.string().min(1, "Matrícula é obrigatória"),
  
  // Etapa 2: Dados do contato
  contact_name: z.string().min(1, "Nome do contato é obrigatório"),
  contact_phone: z.string().min(1, "Telefone é obrigatório"),
  contact_email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  
  // Etapa 3: Seleção de serviços
  service_ids: z.array(z.string()).min(1, "Pelo menos um serviço deve ser selecionado"),
  
  // Dados do RAB (opcionais no schema, mas obrigatórios via validação customizada)
  rab_data: z.any().optional(),
});

export type TwoStepFormData = z.infer<typeof twoStepSchema>;

interface TwoStepServiceOrderFormProps {
  onSubmit?: (data: TwoStepFormData) => void;
  onCancel: () => void;
  stageId?: string;
  funnelId?: string;
  isSubmitting?: boolean;
}

/**
 * Componente de formulário em duas etapas para criação de ordem de serviço
 * Etapa 1: Matrícula da aeronave
 * Etapa 2: Dados do contato (Nome, Telefone, Email)
 */
export default function TwoStepServiceOrderForm({
  onSubmit,
  onCancel,
  stageId,
  funnelId,
  isSubmitting = false
}: TwoStepServiceOrderFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Estados para consulta RAB
  const [rabData, setRabData] = useState<any>(null);
  const [isLoadingRab, setIsLoadingRab] = useState(false);
  const [rabConsulted, setRabConsulted] = useState(false);
  
  // Estado para seleção de serviços
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null);
  
  // Estado para cliente selecionado
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  
  // Estado para modal de criação de cliente
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientInitialName, setClientInitialName] = useState("");

  // Hook para buscar serviços
  const { data: servicesResponse, isLoading: isLoadingServices, error: servicesError } = useServicesList();
  const apiServices = servicesResponse?.data || [];

  // Dados mocados temporários para serviços (remover quando a API estiver funcionando)
  const mockServices = [
    {
      id: "service-1",
      name: "Inspeção Anual",
      description: "Inspeção anual obrigatória da aeronave",
      category: "Inspeção",
      price: 2500.00,
      estimatedDuration: 480,
      unit: "minutes",
      active: true,
      requiresMaterials: false,
      skillLevel: "intermediate" as const
    },
    {
      id: "service-2", 
      name: "Manutenção de Motor",
      description: "Manutenção preventiva do motor",
      category: "Manutenção",
      price: 5000.00,
      estimatedDuration: 720,
      unit: "minutes",
      active: true,
      requiresMaterials: true,
      skillLevel: "expert" as const
    },
    {
      id: "service-3",
      name: "Reparo de Avionics",
      description: "Reparo e calibração de sistemas aviônicos",
      category: "Eletrônica",
      price: 3200.00,
      estimatedDuration: 360,
      unit: "minutes", 
      active: true,
      requiresMaterials: true,
      skillLevel: "advanced" as const
    },
    {
      id: "service-4",
      name: "Inspeção de Estrutura",
      description: "Inspeção detalhada da estrutura da aeronave",
      category: "Estrutural",
      price: 1800.00,
      estimatedDuration: 240,
      unit: "minutes",
      active: true,
      requiresMaterials: false,
      skillLevel: "intermediate" as const
    }
  ];

  // Usa dados da API se disponíveis, senão usa dados mocados
  const services = apiServices.length > 0 ? apiServices : mockServices;

  // Hook para criação de service order
  const createServiceOrderMutation = useCreateServiceOrder({
    onSuccess: () => {
      toast.success("🎉 Ordem de serviço criada com sucesso!", {
        description: "A ordem de serviço foi registrada e está pronta para processamento.",
        duration: 4000,
      });
      handleCancel(); // Reset form and close
    },
    onError: (error: any) => {
      console.error("Erro ao criar ordem de serviço:", error);
      
      // Tratamento de erros mais específico
      let errorMessage = "Erro inesperado ao criar ordem de serviço.";
      let errorDescription = "Tente novamente em alguns instantes.";
      
      if (error?.response?.status === 400) {
        errorMessage = "Dados inválidos fornecidos.";
        errorDescription = "Verifique os campos preenchidos e tente novamente.";
      } else if (error?.response?.status === 401) {
        errorMessage = "Sessão expirada.";
        errorDescription = "Faça login novamente para continuar.";
      } else if (error?.response?.status === 403) {
        errorMessage = "Permissão negada.";
        errorDescription = "Você não tem permissão para criar ordens de serviço.";
      } else if (error?.response?.status === 422) {
        errorMessage = "Dados de validação incorretos.";
        errorDescription = "Verifique se todos os campos obrigatórios foram preenchidos corretamente.";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Erro interno do servidor.";
        errorDescription = "Nosso time técnico foi notificado. Tente novamente mais tarde.";
      } else if (error?.message?.includes('Network')) {
        errorMessage = "Erro de conexão.";
        errorDescription = "Verifique sua conexão com a internet e tente novamente.";
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 6000,
      });
    }
  });

  // Configuração do formulário
  const form = useForm<TwoStepFormData>({
    resolver: zodResolver(twoStepSchema),
    defaultValues: {
      aircraft_registration: "",
      contact_name: "",
      contact_phone: "",
      contact_email: "",
      service_ids: [],
    },
  });

  /**
   * Função para lidar com a seleção de cliente
   */
  const handleClientSelect = (client: ClientRecord | null) => {
    console.log("handleClientSelect chamada com:", client);
    setSelectedClient(client);
    
    if (client) {
      // Só acessa client.config depois de verificar se client não é null
      const celular: string = client.config?.celular || "";
      
      console.log("Preenchendo campos do formulário com dados do cliente:", {
        name: client.name,
        email: client.email,
        celular: celular
      });
      
      // Preenche automaticamente os campos com os dados do cliente
      form.setValue("contact_name", client.name);
      form.setValue("contact_email", client.email);
      
      // Preenche o telefone se disponível no config
      if (celular) {
        form.setValue("contact_phone", celular);
      } else if (client.config?.telefone_residencial) {
        form.setValue("contact_phone", client.config.telefone_residencial);
      } else if (client.config?.telefone_comercial) {
        form.setValue("contact_phone", client.config.telefone_comercial);
      }
      
      // Trigger validation para os campos preenchidos
      form.trigger(["contact_name", "contact_email", "contact_phone"]);
      console.log('campos dos formulario',form.getValues());
      
      console.log("Campos preenchidos com sucesso!");
    } else {
      console.log("Cliente é null, limpando seleção");
      // Opcionalmente, limpar os campos quando cliente é null
      // form.setValue("contact_name", "");
      // form.setValue("contact_email", "");
      // form.setValue("contact_phone", "");
    }
  };

  /**
   * Função para lidar com a criação de novo cliente
   */
  const handleCreateNewClient = (name: string) => {
    console.log("handleCreateNewClient chamada com nome:", name);
    setClientInitialName(name);
    setShowClientModal(true);
  };

  /**
   * Função para lidar com cliente criado com sucesso
   */
  const handleClientCreated = (client: ClientRecord) => {
    console.log("handleClientCreated chamada com cliente:", client);
    
    // Seleciona o cliente recém-criado
    handleClientSelect(client);
    
    // Fecha o modal
    setShowClientModal(false);
    setClientInitialName("");
    
    // Mostra toast de sucesso
    toast.success("Cliente criado com sucesso!", {
      description: `${client.name} foi adicionado e selecionado automaticamente.`,
      duration: 4000,
    });
  };

  /**
   * Avança para a próxima etapa
   */
  const handleNextStep = async () => {
    let isValid = false;
    
    if (currentStep === 1) {
      // Valida o campo da matrícula e se a consulta do RAB foi feita
      isValid = await form.trigger(["aircraft_registration"]);
      
      if (isValid && !rabConsulted) {
        toast.error("⚠️ Consulta RAB obrigatória", {
          description: "É necessário consultar os dados do RAB antes de prosseguir para a próxima etapa.",
          duration: 4000,
        });
        return;
      }
      
      if (isValid) {
        toast.success("✅ Dados da aeronave validados", {
          description: "Prosseguindo para os dados de contato.",
          duration: 2000,
        });
      }
    } else if (currentStep === 2) {
      // Valida os campos de contato
      isValid = await form.trigger(["contact_name", "contact_phone", "contact_email"]);
      
      if (isValid) {
        toast.success("✅ Dados de contato validados", {
          description: "Prosseguindo para a seleção de serviços.",
          duration: 2000,
        });
      }
    } else if (currentStep === 3) {
      // Valida a seleção de serviços
      isValid = await form.trigger(["service_ids"]);
      
      if (isValid) {
        toast.success("✅ Serviços selecionados", {
          description: "Todos os dados estão prontos para finalização.",
          duration: 2000,
        });
      }
    }
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      toast.error("❌ Campos obrigatórios", {
        description: "Preencha todos os campos obrigatórios antes de continuar.",
        duration: 3000,
      });
    }
  };

  /**
   * Volta para a etapa anterior
   */
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Submete o formulário
   */
  const handleSubmit = async (data: TwoStepFormData) => {
    try {
      // Validação final antes do envio
      const isFormValid = await form.trigger();
      if (!isFormValid) {
        toast.error("❌ Formulário inválido", {
          description: "Corrija os erros nos campos antes de finalizar.",
          duration: 4000,
        });
        return;
      }

      // Toast de loading
      toast.loading("🔄 Criando ordem de serviço...", {
        description: "Processando seus dados, aguarde um momento.",
        duration: Infinity,
        id: "creating-service-order",
      });

      // Se existe uma função onSubmit personalizada, usa ela (para compatibilidade)
      if (onSubmit) {
        const formDataWithRab = {
          ...data,
          rab_data: rabData
        };
        onSubmit(formDataWithRab);
        toast.dismiss("creating-service-order");
        return;
      }
      
      console.log("Dados do formulário:", data);
      console.log("IDs recebidos - stageId:", stageId, "funnelId:", funnelId);
      
      // Caso contrário, faz o POST direto para /api/v1/service-orders
      const serviceOrderData = {
        // Dados obrigatórios
        doc_type: "os" as const,
        title: `O.S. ${data.aircraft_registration}`,
        description: `Ordem de serviço para aeronave ${data.aircraft_registration}`,
        status: "pending" as const,
        priority: "medium" as const,
        
        // Dados do formulário
        aircraft_registration: data.aircraft_registration,
        contact_name: data.contact_name,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        
        // IDs dos serviços selecionados
        service_ids: data.service_ids ? data.service_ids.map(id => Number(id)) : [],
        
        // Dados do RAB (se consultados)
        rab_data: rabData,
        
        // Variável local=workflow conforme solicitado
        local: "workflow",
        
        // Dados adicionais
        notes: `Contato: ${data.contact_name}\nTelefone: ${data.contact_phone}\nEmail: ${data.contact_email}`,
        internal_notes: "Criado via formulário de três etapas",
        estimated_start_date: new Date().toISOString().split('T')[0],
        estimated_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        
        // Listas vazias para serviços e produtos (podem ser adicionados posteriormente)
        services: [],
        products: [],
        
        // Stage ID se fornecido
        ...(stageId && { stageId: parseInt(stageId) }),
        
        // Funnel ID se fornecido
        ...(funnelId && { funnelId: parseInt(funnelId) })
      };

      console.log("Dados finais da ordem de serviço:", serviceOrderData);

      // Faz o POST usando o hook
      await createServiceOrderMutation.mutateAsync(serviceOrderData);
      
      // Remove o toast de loading (será substituído pelo de sucesso no onSuccess)
      toast.dismiss("creating-service-order");
      
    } catch (error) {
      console.error("Erro ao processar formulário:", error);
      
      // Remove o toast de loading
      toast.dismiss("creating-service-order");
      
      // Toast de erro já é tratado no onError do mutation
      // Mas adicionamos um fallback caso não seja capturado
      if (!createServiceOrderMutation.isError) {
        toast.error("❌ Erro inesperado", {
          description: "Ocorreu um erro ao processar o formulário. Tente novamente.",
          duration: 5000,
        });
      }
    }
  };

  /**
   * Cancela o formulário e reseta o estado
   */
  const handleCancel = () => {
    setCurrentStep(1);
    form.reset();
    setRabData(null);
    setRabConsulted(false);
    onCancel();
  };

  /**
   * Consulta dados do RAB pela matrícula
   */
  const handleConsultRAB = async () => {
    const matricula = form.getValues("aircraft_registration");
    
    if (!matricula) {
      toast.error("Informe a matrícula da aeronave");
      return;
    }

    setIsLoadingRab(true);
    
    try {
      const response = await fetch(`https://api.aeroclubejf.com.br/api/v1/rab?matricula=${matricula}`);
      const result = await response.json();
      
      if (result.exec && result.data) {
        setRabData(result.data);
        setRabConsulted(true);
        toast.success("Dados do RAB consultados com sucesso!");
      } else {
        toast.error("Não foi possível consultar os dados do RAB");
        setRabData(null);
        setRabConsulted(false);
      }
    } catch (error) {
      console.error("Erro ao consultar RAB:", error);
      toast.error("Erro ao consultar dados do RAB");
      setRabData(null);
      setRabConsulted(false);
    } finally {
      setIsLoadingRab(false);
    }
  };

  /**
   * Renderiza o indicador de progresso
   */
  const renderProgressIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div 
                className={`
                  w-12 h-0.5 mx-2
                  ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                `} 
              />
            )}
          </div>
        );
      })}
    </div>
  );

  /**
   * Renderiza a tabela com os dados do RAB
   */
  const renderRabTable = () => {
    if (!rabData) return null;

    const rabFields = [
      { label: "Matrícula", value: rabData["Matrícula"] },
      { label: "Proprietário", value: rabData["Proprietário"] },
      { label: "CPF/CNPJ", value: rabData["CPF/CNPJ"] },
      { label: "Cota Parte %", value: rabData["Cota Parte %"] },
      { label: "Data da Compra/Transferência", value: rabData["Data da Compra/Transferência"] },
      { label: "Operador", value: rabData["Operador"] },
      { label: "Fabricante", value: rabData["Fabricante"] },
      { label: "Ano de Fabricação", value: rabData["Ano de Fabricação"] },
      { label: "Modelo", value: rabData["Modelo"] },
      { label: "Número de Série", value: rabData["Número de Série"] },
      { label: "Tipo ICAO", value: rabData["Tipo ICAO"] },
      { label: "Categoria de Homologação", value: rabData["Categoria de Homologação"] },
      { label: "Tipo de Habilitação para Pilotos", value: rabData["Tipo de Habilitação para Pilotos"] },
      { label: "Classe da Aeronave", value: rabData["Classe da Aeronave"] },
      { label: "Peso Máximo de Decolagem", value: rabData["Peso Máximo de Decolagem"] },
      { label: "Número de Passageiros", value: rabData["Número de Passageiros"] },
      { label: "Tipo de voo autorizado", value: rabData["Tipo de voo autorizado"] },
      { label: "Tripulação Mínima prevista na Certificação", value: rabData["Tripulação Mínima prevista na Certificação"] },
      { label: "Número de Assentos", value: rabData["Número de Assentos"] },
      { label: "Categoria de Registro", value: rabData["Categoria de Registro"] },
      { label: "Número da Matrícula", value: rabData["Número da Matrícula"] },
      { label: "Status da Operação", value: rabData["Status da Operação"] },
      { label: "Gravame", value: rabData["Gravame"] },
      { label: "Data de Validade do CVA", value: rabData["Data de Validade do CVA"] },
      { label: "Situação de Aeronavegabilidade", value: rabData["Situação de Aeronavegabilidade"] },
      { label: "Motivo(s)", value: rabData["Motivo(s)"] },
      { label: "Data da consulta", value: rabData["Data da consulta"] }
    ];

    return (
      <Card className="mt-4 mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Dados do RAB</CardTitle>
          <CardDescription>
            Informações da aeronave consultadas no Registro Aeronáutico Brasileiro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Campo</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rabFields.map((field, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{field.label}</TableCell>
                    <TableCell>{field.value || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * Renderiza a primeira etapa (Matrícula)
   */
  const renderStep1 = () => (
    <>
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Plane className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>Identificação da Aeronave</CardTitle>
        <CardDescription>
          Informe a matrícula da aeronave para a ordem de serviço
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="aircraft_registration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matrícula da Aeronave *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: PR-ABC"
                  {...field}
                  className="text-center text-lg font-mono"
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={handleConsultRAB}
            disabled={isLoadingRab || !form.watch("aircraft_registration")}
            className="w-full max-w-xs"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoadingRab ? "Consultando..." : "Consultar RAB"}
          </Button>
        </div>
      </CardContent>
    </Card>
    
    {/* Tabela dos dados do RAB */}
    {renderRabTable()}
    </>
  );

  /**
   * Renderiza a segunda etapa (Dados do contato)
   */
  const renderStep2 = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle>Dados do Contato</CardTitle>
        <CardDescription>
          Informe os dados de contato para a ordem de serviço
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente *</FormLabel>
                <FormControl>
                  <ClientNameAutocomplete
                    value={field.value}
                    onChange={(value, client) => {
                      field.onChange(value);
                      handleClientSelect(client);
                    }}
                    onCreateNewClient={handleCreateNewClient}
                    placeholder="Digite o nome do cliente..."
                    className="mt-1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="(11) 99999-9999"
                    {...field}
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="contato@exemplo.com"
                    {...field}
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  /**
   * Renderiza a terceira etapa (Seleção de serviços)
   */
  const renderStep3 = () => {
    const selectedServiceIds = form.watch("service_ids") || [];

    /**
     * Adiciona um serviço à lista de serviços selecionados
     */
    const addService = (service: ServiceRecord) => {
      const serviceId = String(service.id);
      const currentServices = form.getValues("service_ids") || [];
      if (!currentServices.includes(serviceId)) {
        const newServices = [...currentServices, serviceId];
        form.setValue("service_ids", newServices);
        form.trigger("service_ids");
      }
      setSelectedService(null);
    };

    /**
     * Remove um serviço da lista de serviços selecionados
     */
    const removeService = (serviceId: string) => {
      const currentServices = form.getValues("service_ids") || [];
      const newServices = currentServices.filter(id => id !== serviceId);
      form.setValue("service_ids", newServices);
      form.trigger("service_ids");
    };

    /**
     * Calcula o total dos serviços selecionados
     */
    const calculateTotal = () => {
      return selectedServiceIds.reduce((total, serviceId) => {
        const service = services.find(s => String(s.id) === serviceId);
        return total + (service?.price ? Number(service.price) : 0);
      }, 0);
    };

    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>Seleção de Serviços</CardTitle>
          <CardDescription>
            Selecione os serviços que serão executados nesta ordem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seletor para adicionar serviços */}
          <div className="space-y-2">
            <FormLabel>Adicionar Serviço</FormLabel>
            <div className="flex gap-2">
              <ServiceAutocompleteSelect
                selectedService={selectedService}
                onServiceSelect={setSelectedService}
                placeholder={isLoadingServices ? "Carregando serviços..." : "Digite para buscar um serviço..."}
                disabled={isLoadingServices}
                className="flex-1"
                excludeServiceIds={selectedServiceIds}
              />
              <Button
                type="button"
                onClick={() => selectedService && addService(selectedService)}
                disabled={!selectedService || isLoadingServices}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Campo hidden para validação */}
          <FormField
            control={form.control}
            name="service_ids"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <input {...field} value={field.value?.join(',') || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Lista de serviços selecionados */}
          <div className="space-y-2">
            <FormLabel>Serviços Selecionados *</FormLabel>
            {selectedServiceIds.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                Nenhum serviço selecionado. Adicione pelo menos um serviço.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedServiceIds.map((serviceId) => {
                  const service = services.find(s => String(s.id) === serviceId);
                  if (!service) return null;

                  return (
                    <div key={serviceId} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          R$ {service.price ? Number(service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                        </div>
                        {service.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {service.description}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(serviceId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resumo total */}
          {selectedServiceIds.length > 0 && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total dos Serviços:</span>
                <span className="text-lg font-bold text-primary">
                  R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {selectedServiceIds.length} serviço{selectedServiceIds.length > 1 ? 's' : ''} selecionado{selectedServiceIds.length > 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Mensagem de erro se não houver serviços selecionados */}
          {form.formState.errors.service_ids && (
            <div className="text-sm text-destructive">
              {form.formState.errors.service_ids.message}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  /**
   * Renderiza os botões de navegação
   */
  const renderNavigationButtons = () => (
    <div className="flex justify-between pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={currentStep === 1 ? handleCancel : handlePreviousStep}
        disabled={isSubmitting || createServiceOrderMutation.isPending}
        className="min-w-[120px]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {currentStep === 1 ? 'Cancelar' : 'Voltar'}
      </Button>

      {currentStep < totalSteps ? (
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={isSubmitting || createServiceOrderMutation.isPending || (currentStep === 1 && !rabConsulted)}
          className="min-w-[120px]"
        >
          {createServiceOrderMutation.isPending ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processando...
            </>
          ) : (
            <>
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={isSubmitting || createServiceOrderMutation.isPending}
          className="min-w-[120px] bg-green-600 hover:bg-green-700"
        >
          {(isSubmitting || createServiceOrderMutation.isPending) ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Criando...
            </>
          ) : (
            <>
              <Wrench className="mr-2 h-4 w-4" />
              Finalizar
            </>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <>
    <Form {...form}>
      <div className="flex flex-col h-full max-h-[85vh]">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
          {/* Indicador de progresso */}
          <div className="flex-shrink-0">
            {renderProgressIndicator()}
          </div>

          {/* Conteúdo da etapa atual - com scroll */}
          <div className="flex-1 overflow-y-auto px-1 py-4">
            <div className="space-y-4">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>
          </div>

          {/* Separador e Botões de navegação - sempre visíveis */}
          <div className="flex-shrink-0 border-t bg-white pt-4 pb-2">
            {renderNavigationButtons()}
          </div>
        </form>
      </div>
    </Form>

    {/* Modal de criação de cliente */}
    <QuickCreateClientModal
      open={showClientModal}
      onOpenChange={(open) => {
        setShowClientModal(open);
        if (!open) {
          setClientInitialName("");
        }
      }}
      onClientCreated={handleClientCreated}
      initialName={clientInitialName}
    />
  </>
  );
}