import { format } from 'date-fns';
import InputMask from "react-input-mask-next";
import { CalendarIcon } from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { MaskedInputField } from '@/components/lib/MaskedInputField';
interface ClientFormProps {
  form: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingClient: any;
}

export function ClientForm({
  form,
  onSubmit,
  onCancel,
  editingClient,
}: ClientFormProps) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          // Você pode adicionar um toast ou log de erro aqui se quiser
        })}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipo_pessoa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Pessoa</FormLabel>
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
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="m">Masculino</SelectItem>
                    <SelectItem value="f">Feminino</SelectItem>
                    <SelectItem value="ni">Não informado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('tipo_pessoa') === 'pf' ? (
            <MaskedInputField
                name="cpf"
                control={form.control}
                label="CPF"
                mask="999.999.999-99"
                placeholder="000.000.000-00"
            />
          ) : (
            <>
              <MaskedInputField
                name="cnpj"
                control={form.control}
                label="CNPJ"
                mask="99.999.999/9999-99"
                placeholder="00.000.000/0000-00"
              />
              <FormField
                control={form.control}
                name="razao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Razão Social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

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

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Informações Adicionais</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="config.nome_fantasia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome Fantasia" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <MaskedInputField
                  name="config.celular"
                  control={form.control}
                  label="Telefone"
                  mask="(99) 99999-9999"
                  placeholder="(00) 00000-0000"
                />
                <MaskedInputField
                  name="config.telefone_residencial"
                  control={form.control}
                  label="Telefone"
                  mask="(99) 99999-9999"
                  placeholder="(00) 00000-0000"
                />
                <MaskedInputField
                  name="config.telefone_comercial"
                  control={form.control}
                  label="Telefone"
                  mask="(99) 99999-9999"
                  placeholder="(00) 00000-0000"
                />
                <MaskedInputField
                  name="config.telefone_comercial"
                  control={form.control}
                  label="Telefone"
                  mask="(99) 99999-9999"
                  placeholder="(00) 00000-0000"
                />
                {form.watch('tipo_pessoa') === 'pf' && (
                  <>
                    <FormField
                      control={form.control}
                      name="config.rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input placeholder="RG" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="config.nascimento"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Nascimento</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                placeholder="DD/MM/AAAA"
                                value={field.value ? format(new Date(field.value), 'dd/MM/yyyy') : ''}
                                onChange={() => {}}
                                onClick={() => document.getElementById('calendar-popup')?.click()}
                                className="w-full"
                              />
                            </FormControl>
                            <div className="absolute right-2 top-2">
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                id="calendar-popup"
                              >
                                <CalendarIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="config.escolaridade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escolaridade</FormLabel>
                          <FormControl>
                            <Input placeholder="Escolaridade" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="config.profissao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissão</FormLabel>
                          <FormControl>
                            <Input placeholder="Profissão" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {form.watch('tipo_pessoa') === 'pj' && (
                  <FormField
                    control={form.control}
                    name="config.tipo_pj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Tipo de Empresa" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Endereço</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                
                <MaskedInputField 
                  name="config.cpf"
                  control={form.control}
                  label="CPF"
                  mask="999.999.999-99"
                  placeholder="000.000.000-00"
                />
                <FormField
                  control={form.control}
                  name="config.endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Número" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Complemento" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ''}
                      >
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
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Observações</AccordionTrigger>
            <AccordionContent>
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="config.observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações sobre o cliente" 
                          className="min-h-[120px]" 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {editingClient ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}