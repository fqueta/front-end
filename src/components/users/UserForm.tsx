import InputMask from 'react-input-mask';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { AddressAccordion } from "@/components/lib/AddressAccordion";

interface UserFormProps {
  form: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingUser: any;
  permissions: any[];
  isLoadingPermissions: boolean;
  handleOnclick?: () => void;
}

export function UserForm({
  form,
  onSubmit,
  onCancel,
  editingUser,
  permissions,
  isLoadingPermissions,
  handleOnclick,
}: UserFormProps) {
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
                <Select onValueChange={field.onChange} value={field.value}>
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
            name="permission_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permissão</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingPermissions}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingPermissions ? "Carregando..." : "Selecione a permissão"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-[60]">
                    {permissions.map((permission) => (
                      <SelectItem key={permission.id} value={String(permission.id)}>
                        {permission.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Senha (min. 6 caracteres)" {...field} />
                </FormControl>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gênero" />
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
          <FormField
            control={form.control}
            name="ativo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ativo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="s">Sim</SelectItem>
                    <SelectItem value="n">Não</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch('tipo_pessoa') === 'pf' && (
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <InputMask
                      mask="999.999.999-99"
                      value={field.value || ""}
                      onChange={field.onChange}
                    >
                      {(inputProps: any) => <Input {...inputProps} />}
                    </InputMask>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {form.watch('tipo_pessoa') === 'pj' && (
            <>
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <InputMask
                        mask="99.999.999/9999-99"
                        value={field.value || ""}
                        onChange={field.onChange}
                      >
                        {(inputProps: any) => <Input {...inputProps} />}
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="razao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Razão social da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <FormField
            control={form.control}
            name="config.celular"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Celular</FormLabel>
                <FormControl>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={field.value || ""}
                    onChange={field.onChange}
                  >
                    {(inputProps: any) => <Input {...inputProps} />}
                  </InputMask>
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
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <AddressAccordion form={form} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleOnclick}
            disabled={isLoadingPermissions}
          >
            {editingUser ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}