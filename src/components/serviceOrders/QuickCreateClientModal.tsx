import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "lucide-react";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientRecord } from "@/types/clients";
import { clientsService } from "@/services/clientsService";
import { toast } from "sonner";
import { log } from "console";

/**
 * Schema de validação para cadastro de cliente
 */
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
    celular: z.string().nullable().optional(),
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

/**
 * Props do componente QuickCreateClientModal
 */
interface QuickCreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: (client: ClientRecord) => void;
  initialName?: string;
}

/**
 * Modal para cadastro rápido de cliente durante criação de ordem de serviço
 * Utiliza o ClientForm completo para manter consistência na interface
 */
export function QuickCreateClientModal({
  open,
  onOpenChange,
  onClientCreated,
  initialName = ""
}: QuickCreateClientModalProps) {

  // Configuração do formulário com valores padrão
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      tipo_pessoa: "pf",
      email: "",
      name: initialName,
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

  /**
   * Handler para submissão do formulário
   */
  const handleSubmit = async (data: ClientFormData) => {
    try {
      // Prepara os dados para envio
      const clientData = {
        tipo_pessoa: data.tipo_pessoa,
        email: data.email,
        name: data.name,
        cpf: data.cpf || "",
        cnpj: data.cnpj || "",
        razao: data.razao || "",
        genero: data.genero,
        ativo: data.ativo,
        config: {
          nome_fantasia: data.config.nome_fantasia || "",
          celular: data.config.celular || "",
          telefone_residencial: data.config.telefone_residencial || "",
          telefone_comercial: data.config.telefone_comercial || "",
          rg: data.config.rg || "",
          nascimento: data.config.nascimento || "",
          escolaridade: data.config.escolaridade || "",
          profissao: data.config.profissao || "",
          tipo_pj: data.config.tipo_pj || "",
          cep: data.config.cep || "",
          endereco: data.config.endereco || "",
          numero: data.config.numero || "",
          complemento: data.config.complemento || "",
          bairro: data.config.bairro || "",
          cidade: data.config.cidade || "",
          uf: data.config.uf || "",
          observacoes: data.config.observacoes || "",
        },
      };

      // Cria o cliente
      const response = await clientsService.create(clientData);
      console.log("Resposta do servidor:", response);
      const clientAny = response?.data as any;
      // Converte para o formato ClientRecord esperado
      const clientRecord: ClientRecord = {
        id: clientAny.id,
        name: clientAny.name,
        email: clientAny.email,
        tipo_pessoa: clientAny.tipo_pessoa,
        cpf: clientAny.cpf,
        cnpj: clientAny.cnpj,
        razao: clientAny.razao,
        genero: clientAny.genero,
        ativo: clientAny.ativo,
        config: clientAny.config,
        created_at: clientAny.created_at,
        updated_at: clientAny.updated_at,
      };

      // Exibe toast de sucesso
      toast.success("Cliente criado com sucesso!");

      // Fecha o modal e reseta o formulário
      onOpenChange(false);
      form.reset();
      
      // Chama o callback com o cliente criado
      console.log("Cliente criado:", clientRecord);
      if (onClientCreated) {
        onClientCreated(clientRecord);
      }
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Erro ao cadastrar cliente. Tente novamente.");
    }
  };

  /**
   * Cancela a criação e fecha o modal
   */
  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Cadastro Rápido de Cliente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do cliente para continuar com a ordem de serviço.
          </DialogDescription>
        </DialogHeader>
        
        <ClientForm
          form={form}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editingClient={null}
        />
      </DialogContent>
    </Dialog>
  );
}

export default QuickCreateClientModal;