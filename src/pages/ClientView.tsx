import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, User, Building, Calendar, GraduationCap, Briefcase, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useClient } from '@/hooks/clients';
import { ClientRecord } from '@/types/clients';

/**
 * Página de visualização detalhada de um cliente específico
 * Exibe todas as informações do cadastro do cliente de forma organizada
 */
export default function ClientView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading, error } = useClient(id!);

  /**
   * Navega de volta para a listagem de clientes
   */
  const handleBack = () => {
    navigate('/clients');
  };

  /**
   * Formata a data para exibição no formato brasileiro
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  /**
   * Formata o CEP para exibição
   */
  const formatCEP = (cep: string) => {
    if (!cep) return 'Não informado';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  /**
   * Formata CPF para exibição
   */
  const formatCPF = (cpf: string) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  /**
   * Formata CNPJ para exibição
   */
  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return 'Não informado';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  /**
   * Formata telefone para exibição
   */
  const formatPhone = (phone: string) => {
    if (!phone) return 'Não informado';
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando informações do cliente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Erro ao carregar cliente</h2>
          <p className="text-muted-foreground mb-4">
            {error.message || 'Não foi possível carregar as informações do cliente.'}
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para listagem
          </Button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Cliente não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O cliente solicitado não foi encontrado.
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para listagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">
              {client.tipo_pessoa === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            </p>
          </div>
        </div>
        <Badge variant={client.ativo === 's' ? 'default' : 'destructive'}>
          {client.ativo === 's' ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="text-sm">{client.name || 'Não informado'}</p>
            </div>
            
            {client.tipo_pessoa === 'pj' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Razão Social</label>
                <p className="text-sm">{client.razao || 'Não informado'}</p>
              </div>
            )}
            
            {client.config?.nome_fantasia && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome Fantasia</label>
                <p className="text-sm">{client.config.nome_fantasia}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Documento</label>
              <p className="text-sm">
                {client.tipo_pessoa === 'pf' 
                  ? formatCPF(client.cpf) 
                  : formatCNPJ(client.cnpj)
                }
              </p>
            </div>

            {client.config?.rg && client.tipo_pessoa === 'pf' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">RG</label>
                <p className="text-sm">{client.config.rg}</p>
              </div>
            )}

            {client.tipo_pessoa === 'pf' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                <p className="text-sm">
                  {client.genero === 'm' ? 'Masculino' : 
                   client.genero === 'f' ? 'Feminino' : 'Não informado'}
                </p>
              </div>
            )}

            {client.config?.nascimento && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                <p className="text-sm">{formatDate(client.config.nascimento)}</p>
              </div>
            )}

            {client.config?.tipo_pj && client.tipo_pessoa === 'pj' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo de Pessoa Jurídica</label>
                <p className="text-sm">{client.config.tipo_pj}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                {client.email || 'Não informado'}
              </p>
            </div>

            {client.config?.celular && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Celular</label>
                <p className="text-sm flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  {formatPhone(client.config.celular)}
                </p>
              </div>
            )}

            {client.config?.telefone_residencial && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefone Residencial</label>
                <p className="text-sm flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  {formatPhone(client.config.telefone_residencial)}
                </p>
              </div>
            )}

            {client.config?.telefone_comercial && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefone Comercial</label>
                <p className="text-sm flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  {formatPhone(client.config.telefone_comercial)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.config?.cep && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">CEP</label>
                <p className="text-sm">{formatCEP(client.config.cep)}</p>
              </div>
            )}

            {client.config?.endereco && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                <p className="text-sm">
                  {client.config.endereco}
                  {client.config?.numero && `, ${client.config.numero}`}
                </p>
              </div>
            )}

            {client.config?.complemento && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Complemento</label>
                <p className="text-sm">{client.config.complemento}</p>
              </div>
            )}

            {client.config?.bairro && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                <p className="text-sm">{client.config.bairro}</p>
              </div>
            )}

            {(client.config?.cidade || client.config?.uf) && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cidade/UF</label>
                <p className="text-sm">
                  {client.config?.cidade && client.config?.uf 
                    ? `${client.config.cidade}, ${client.config.uf}`
                    : client.config?.cidade || client.config?.uf || 'Não informado'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações Profissionais/Acadêmicas */}
        {(client.config?.escolaridade || client.config?.profissao) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.config?.escolaridade && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Escolaridade</label>
                  <p className="text-sm flex items-center">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    {client.config.escolaridade}
                  </p>
                </div>
              )}

              {client.config?.profissao && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Profissão</label>
                  <p className="text-sm flex items-center">
                    <Briefcase className="mr-2 h-4 w-4" />
                    {client.config.profissao}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Observações */}
      {client.config?.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{client.config.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {client.created_at && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
              <p className="text-sm">{formatDate(client.created_at)}</p>
            </div>
          )}

          {client.updated_at && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
              <p className="text-sm">{formatDate(client.updated_at)}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">ID do Cliente</label>
            <p className="text-sm font-mono">{client.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}