import { useState, useRef } from 'react';
import InputMask from "react-input-mask-next";
import { User, Building2, MapPin, Phone, Mail, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { MaskedInputField } from '@/components/lib/MaskedInputField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClientFormProps {
  form: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingClient: any;
}

/**
 * Formulário simplificado de cadastro de clientes
 * Organizado em seções visuais claras com campos essenciais
 */
export function ClientForm({
  form,
  onSubmit,
  onCancel,
  editingClient,
}: ClientFormProps) {
  const isPessoaFisica = form.watch('tipo_pessoa') === 'pf';
  const isPessoaJuridica = form.watch('tipo_pessoa') === 'pj';
  const { toast } = useToast();
  
  // Estados para busca de CEP
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const numeroInputRef = useRef<HTMLInputElement>(null);

  /**
   * Função para formatar mensagens de erro de validação
   * @param errors - Objeto de erros do react-hook-form
   * @returns Array de mensagens formatadas
   */
  const formatValidationErrors = (errors: any): string[] => {
    const messages: string[] = [];
    
    const processErrors = (obj: any, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const error = obj[key];
        if (error && typeof error === 'object') {
          if (error.message) {
            // Mapear nomes de campos para labels amigáveis
            const fieldLabels: { [key: string]: string } = {
              'nome': 'Nome',
              'email': 'E-mail',
              'celular': 'Celular',
              'telefone': 'Telefone',
              'cpf': 'CPF',
              'cnpj': 'CNPJ',
              'endereco': 'Endereço',
              'numero': 'Número',
              'bairro': 'Bairro',
              'cidade': 'Cidade',
              'estado': 'Estado',
              'cep': 'CEP',
              'config.celular': 'Celular',
              'config.telefone': 'Telefone',
              'config.endereco': 'Endereço',
              'config.numero': 'Número',
              'config.bairro': 'Bairro',
              'config.cidade': 'Cidade',
              'config.estado': 'Estado',
              'config.cep': 'CEP'
            };
            
            const fieldPath = prefix ? `${prefix}.${key}` : key;
            const fieldLabel = fieldLabels[fieldPath] || fieldLabels[key] || key;
            messages.push(`${fieldLabel}: ${error.message}`);
          } else {
            // Se é um objeto aninhado, processar recursivamente
            processErrors(error, prefix ? `${prefix}.${key}` : key);
          }
        }
      });
    };
    
    processErrors(errors);
    return messages;
  };

  /**
   * Função para exibir erros de validação usando toast
   * @param errors - Objeto de erros do react-hook-form
   */
  const handleValidationErrors = (errors: any) => {
    const errorMessages = formatValidationErrors(errors);
    
    if (errorMessages.length > 0) {
      toast({
        title: "Erro de Validação",
        description: (
          <div className="space-y-1">
            {errorMessages.map((message, index) => (
              <div key={index} className="text-sm">
                • {message}
              </div>
            ))}
          </div>
        ),
        variant: "destructive",
      });
    }
  };

  /**
   * Função para buscar dados do CEP na API ViaCEP
   * @param cep - CEP limpo (apenas números)
   */
  const fetchCepData = async (cep: string) => {
    if (cep.length !== 8) return;
    
    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        // Preenche os campos automaticamente
        form.setValue("config.endereco", data.logradouro || "");
        form.setValue("config.bairro", data.bairro || "");
        form.setValue("config.cidade", data.localidade || "");
        form.setValue("config.estado", data.uf || "");
        
        // Foca no campo número após preencher os dados
        setTimeout(() => {
          numeroInputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  /**
   * Manipula a mudança do CEP
   * @param value - Valor do CEP com máscara
   */
  const handleCepChange = (value: string) => {
    const cleanCep = value.replace(/\D/g, '');
    
    // Se o CEP tem 8 dígitos, busca os dados
    if (cleanCep.length === 8) {
      fetchCepData(cleanCep);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, handleValidationErrors)}
        className="space-y-6"
      >
        {/* Seção: Informações Básicas */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo de Pessoa */}
              <FormField
                control={form.control}
                name="tipo_pessoa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Pessoa *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pf">Pessoa Física</SelectItem>
                        <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CPF/CNPJ baseado no tipo */}
              {isPessoaFisica && (
                <MaskedInputField
                  name="cpf"
                  control={form.control}
                  label="CPF *"
                  mask="999.999.999-99"
                  placeholder="000.000.000-00"
                />
              )}

              {isPessoaJuridica && (
                <MaskedInputField
                  name="cnpj"
                  control={form.control}
                  label="CNPJ *"
                  mask="99.999.999/9999-99"
                  placeholder="00.000.000/0000-00"
                />
              )}

              {/* Gênero para PF */}
              {isPessoaFisica && (
                <FormField
                  control={form.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="m">Masculino</SelectItem>
                          <SelectItem value="f">Feminino</SelectItem>
                          <SelectItem value="ni">Não Informado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Status */}
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="s">Ativo</SelectItem>
                        <SelectItem value="n">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção: Informações Adicionais */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Informações Adicionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome Fantasia para PJ */}
              {isPessoaJuridica && (
                <FormField
                  control={form.control}
                  name="config.nome_fantasia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome fantasia da empresa" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Telefone Principal */}
              <MaskedInputField
                name="config.celular"
                control={form.control}
                label="Telefone Principal"
                mask="(99) 99999-9999"
                placeholder="(00) 00000-0000"
              />

              {/* RG para PF */}
              {isPessoaFisica && (
                <FormField
                  control={form.control}
                  name="config.rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="Número do RG" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Data de Nascimento para PF */}
              {isPessoaFisica && (
                <FormField
                  control={form.control}
                  name="config.nascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              field.onChange(new Date(e.target.value).toISOString());
                            } else {
                              field.onChange('');
                            }
                          }}
                          max={new Date().toISOString().split('T')[0]}
                          min="1900-01-01"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seção: Endereço */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CEP com busca automática */}
              <FormField
                control={form.control}
                name="config.cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      CEP 
                      {isLoadingCep && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Search className="h-3 w-3 animate-spin" />
                          Buscando...
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <InputMask
                        mask="99999-999"
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          handleCepChange(e.target.value);
                        }}
                        disabled={isLoadingCep}
                      >
                        <Input 
                          placeholder="00000-000"
                          className="w-full"
                        />
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Endereço */}
              <FormField
                control={form.control}
                name="config.endereco"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, Avenida, etc." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Número */}
              <FormField
                control={form.control}
                name="config.numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123" 
                        {...field} 
                        value={field.value || ''} 
                        ref={numeroInputRef}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bairro */}
              <FormField
                control={form.control}
                name="config.bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do bairro" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cidade */}
              <FormField
                control={form.control}
                name="config.cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da cidade" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Complemento */}
              <FormField
                control={form.control}
                name="config.complemento"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Apartamento, bloco, etc. (opcional)" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <FormField
                control={form.control}
                name="config.estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="AL">AL</SelectItem>
                        <SelectItem value="AP">AP</SelectItem>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="BA">BA</SelectItem>
                        <SelectItem value="CE">CE</SelectItem>
                        <SelectItem value="DF">DF</SelectItem>
                        <SelectItem value="ES">ES</SelectItem>
                        <SelectItem value="GO">GO</SelectItem>
                        <SelectItem value="MA">MA</SelectItem>
                        <SelectItem value="MT">MT</SelectItem>
                        <SelectItem value="MS">MS</SelectItem>
                        <SelectItem value="MG">MG</SelectItem>
                        <SelectItem value="PA">PA</SelectItem>
                        <SelectItem value="PB">PB</SelectItem>
                        <SelectItem value="PR">PR</SelectItem>
                        <SelectItem value="PE">PE</SelectItem>
                        <SelectItem value="PI">PI</SelectItem>
                        <SelectItem value="RJ">RJ</SelectItem>
                        <SelectItem value="RN">RN</SelectItem>
                        <SelectItem value="RS">RS</SelectItem>
                        <SelectItem value="RO">RO</SelectItem>
                        <SelectItem value="RR">RR</SelectItem>
                        <SelectItem value="SC">SC</SelectItem>
                        <SelectItem value="SP">SP</SelectItem>
                        <SelectItem value="SE">SE</SelectItem>
                        <SelectItem value="TO">TO</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção: Observações */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="config.observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Gerais</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o cliente (opcional)" 
                      className="min-h-[100px] resize-none" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="min-w-[120px]">
            {editingClient ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}