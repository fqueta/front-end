import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useNavigate } from "react-router-dom";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  ClipboardList,
  Phone,
  Mail,
  Pencil
} from "lucide-react";
import { cn } from '@/lib/utils';

import { 
  useClientsList, 
  useCreateClient, 
  useUpdateClient,
  useDeleteClient
} from '@/hooks/clients';
import { ClientRecord, CreateClientInput } from '@/types/clients';
import { ClientForm } from '@/components/clients/ClientForm';
import { ClientsTable } from '@/components/clients/ClientsTable';

// Form validation schema
const clientSchema = z.object({
  tipo_pessoa: z.enum(["pf", "pj"]),
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  razao: z.string().optional(),
  genero: z.enum(["m", "f", "ni"]),
  ativo: z.enum(["s", "n"]),
  config: z.object({
    nome_fantasia: z.string().nullable().optional(),
    celular: z.string().min(14, 'Informe o celular').nullable().optional(),
    telefone_residencial: z.string().nullable().optional(),
    telefone_comercial: z.string().nullable().optional(),
    rg: z.string().nullable().optional(),
    nascimento: z.string().nullable().optional(),
    escolaridade: z.string().nullable().optional(),
    profissao: z.string().nullable().optional(),
    tipo_pj: z.string().nullable().optional(),
    cep: z.string().nullable().optional(),
    endereco: z.string().nullable().optional(),
    numero: z.string().nullable().optional(),
    complemento: z.string().nullable().optional(),
    bairro: z.string().nullable().optional(),
    cidade: z.string().nullable().optional(),
    uf: z.string().nullable().optional(),
    observacoes: z.string().nullable().optional(),
  }),
});

type ClientFormData = z.infer<typeof clientSchema>;

// Brazilian states for the select dropdown
const brazilianStates = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export default function Clients() {
  // State for search, dialogs, and client operations
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const { toast } = useToast();
  const navigate = useNavigate();

  // React Query hooks for client operations
  const clientsQuery = useClientsList({
    page: currentPage,
    per_page: pageSize,
  });
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  // Form setup with zod validation
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      tipo_pessoa: "pf",
      email: "",
      name: "",
      cpf: "",
      cnpj: "",
      razao: "",
      genero: "ni",
      ativo: "s",
      config: {
        nome_fantasia: "",
        celular: "",
        telefone_residencial: "",
        telefone_comercial: "",
        rg: "",
        nascimento: "",
        escolaridade: "",
        profissao: "",
        tipo_pj: "",
        cep: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        observacoes: "",
      },
    },
  });

  const handleNewClient = () => {
    setEditingClient(null);
    form.reset({
      tipo_pessoa: "pf",
      email: "",
      name: "",
      cpf: "",
      cnpj: "",
      razao: "",
      genero: "ni",
      ativo: "s",
      config: {
        nome_fantasia: "",
        celular: "",
        telefone_residencial: "",
        telefone_comercial: "",
        rg: "",
        nascimento: "",
        escolaridade: "",
        profissao: "",
        tipo_pj: "",
        cep: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        observacoes: "",
      },
    });
    setIsDialogOpen(true);
  };

  const handleEditClient = (client: ClientRecord) => {
    setEditingClient(client);
    form.reset({
      tipo_pessoa: client.tipo_pessoa,
      email: client.email,
      name: client.name,
      cpf: client.cpf || "",
      cnpj: client.cnpj || "",
      razao: client.razao || "",
      genero: client.genero,
      ativo: client.ativo,
      config: {
        nome_fantasia: client.config?.nome_fantasia || "",
        celular: client.config?.celular || "",
        telefone_residencial: client.config?.telefone_residencial || "",
        telefone_comercial: client.config?.telefone_comercial || "",
        rg: client.config?.rg || "",
        nascimento: client.config?.nascimento || "",
        escolaridade: client.config?.escolaridade || "",
        profissao: client.config?.profissao || "",
        tipo_pj: client.config?.tipo_pj || "",
        cep: client.config?.cep || "",
        endereco: client.config?.endereco || "",
        numero: client.config?.numero || "",
        complemento: client.config?.complemento || "",
        bairro: client.config?.bairro || "",
        cidade: client.config?.cidade || "",
        uf: client.config?.uf || "",
        observacoes: client.config?.observacoes || "",
      },
    });
    setIsDialogOpen(true);
  };
  
  const handleDeleteClient = (client: ClientRecord) => {
    setClientToDelete(client);
    setOpenDeleteDialog(true);
  };
  
  const confirmDeleteClient = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id, {
        onSuccess: () => {
          toast({
            title: "Cliente excluído",
            description: "Cliente excluído com sucesso",
          });
          setOpenDeleteDialog(false);
          setClientToDelete(null);
        },
        onError: (error) => {
          toast({
            title: "Erro ao excluir cliente",
            description: `Ocorreu um erro: ${error.message}`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const onSubmit = (data: ClientFormData) => {
    const clientData = {
      tipo_pessoa: data.tipo_pessoa,
      email: data.email,
      name: data.name,
      cpf: data.tipo_pessoa === 'pf' ? data.cpf : undefined,
      cnpj: data.tipo_pessoa === 'pj' ? data.cnpj : undefined,
      razao: data.tipo_pessoa === 'pj' ? data.razao : undefined,
      genero: data.genero,
      ativo: data.ativo,
      config: data.config,
    };
    
    if (editingClient) {
      updateClientMutation.mutate(
        {
          id: editingClient.id, ...clientData,
          data: undefined
        },
        {
          onSuccess: () => {
            toast({
              title: "Cliente atualizado",
              description: `Cliente ${data.name} atualizado com sucesso`,
            });
            setIsDialogOpen(false);
            setEditingClient(null);
            form.reset();
          },
          onError: (error) => {
            toast({
              title: "Erro ao atualizar cliente",
              description: `Ocorreu um erro: ${error.message}`,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createClientMutation.mutate(
        clientData as CreateClientInput,
        {
          onSuccess: () => {
            toast({
              title: "Cliente criado",
              description: `Cliente ${data.name} criado com sucesso`,
            });
            setIsDialogOpen(false);
            form.reset();
          },
          onError: (error) => {
            toast({
              title: "Erro ao criar cliente",
              description: `Ocorreu um erro: ${error.message}`,
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  const onCancel = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    form.reset();
  };

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!clientsQuery.data?.data) return [];
    
    const searchTermLower = searchTerm.toLowerCase();
    return clientsQuery.data.data.filter((client) => {
      const document = client.tipo_pessoa === 'pf' ? client.cpf : client.cnpj;
      return (
        client.name.toLowerCase().includes(searchTermLower) ||
        (client.email && client.email.toLowerCase().includes(searchTermLower)) ||
        (document && document.toLowerCase().includes(searchTermLower))
      );
    });
  }, [clientsQuery.data, searchTerm]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button onClick={handleNewClient}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsQuery.data?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes cadastrados no sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsQuery.data?.data?.filter(client => client.ativo === 's').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes com status ativo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pessoa Física</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsQuery.data?.data?.filter(client => client.tipo_pessoa === 'pf').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes pessoa física
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pessoa Jurídica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsQuery.data?.data?.filter(client => client.tipo_pessoa === 'pj').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes pessoa jurídica
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Gerencie seus clientes, visualize informações e histórico de atividades.
          </CardDescription>
          <div className="flex items-center mt-4">
            <Search className="h-4 w-4 mr-2 opacity-50" />
            <Input
              placeholder="Buscar por nome, email ou documento..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {clientsQuery.isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Carregando clientes...</p>
            </div>
          ) : clientsQuery.isError ? (
            <div className="flex justify-center items-center py-8 text-red-500">
              <p>Erro ao carregar clientes: {clientsQuery.error.message}</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <p>Nenhum cliente encontrado.</p>
            </div>
          ) : (
            <ClientsTable 
              clients={filteredClients}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onView={(client) => navigate(`/clients/${client.id}`)}
              isLoading={clientsQuery.isLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* Client Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>
              {editingClient
                ? "Atualize as informações do cliente no formulário abaixo."
                : "Preencha as informações do novo cliente."}
            </DialogDescription>
          </DialogHeader>
          <ClientForm form={form} onSubmit={onSubmit} onCancel={onCancel} editingClient={editingClient} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente {clientToDelete?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClient} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}