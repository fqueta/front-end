import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Client } from "@/types";

const schema = z.object({
  client_id: z.string().min(1, "Cliente é obrigatório"),
  type: z.enum(["automovel", "aeronave"], { required_error: "Tipo é obrigatório" }),
  identifier_primary: z.string().min(1, "Identificador principal é obrigatório"),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const mockClients: Client[] = [
  { id: "1", name: "ACME Ltda.", email: "contato@acme.com", phone: "(11) 99999-9999", document: "12.345.678/0001-90", address: "Rua A, 123", city: "São Paulo", state: "SP", zip_code: "01000-000", active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "2", name: "Blue Sky", email: "hello@bluesky.com", phone: "(21) 98888-8888", document: "98.765.432/0001-10", address: "Av. B, 456", city: "Rio de Janeiro", state: "RJ", zip_code: "20000-000", active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

interface ServiceObjectRow {
  id: string;
  client_id: string;
  client_name: string;
  type: "automovel" | "aeronave";
  identifier_primary: string;
  manufacturer?: string;
  model?: string;
  year?: string;
  color?: string;
}

const ServiceObjects = () => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ServiceObjectRow[]>([{
    id: "obj-1",
    client_id: mockClients[0].id,
    client_name: mockClients[0].name,
    type: "automovel",
    identifier_primary: "ABC-1D23",
    manufacturer: "Toyota",
    model: "Corolla",
    year: "2020",
    color: "Prata",
  }]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "automovel" },
  });

  const type = watch("type");

  useEffect(() => {
    document.title = "Objetos do Serviço | Sistema OS";
  }, []);

  const onSubmit = (values: FormValues) => {
    const client = mockClients.find(c => c.id === values.client_id)!;
    setRows(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        client_id: values.client_id,
        client_name: client.name,
        type: values.type,
        identifier_primary: values.identifier_primary,
        manufacturer: values.manufacturer,
        model: values.model,
        year: values.year,
        color: values.color,
      }
    ]);
    setOpen(false);
    reset({ type: values.type });
  };

  const identifierLabel = useMemo(() => type === "automovel" ? "Placa/Chassi" : "Matrícula/Nº Série", [type]);

  return (
    <main className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Objetos do Serviço</h1>
        <p className="text-sm text-muted-foreground">Cadastre e gerencie veículos e aeronaves vinculados aos clientes.</p>
      </header>

      <section aria-label="Lista de objetos do serviço">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Objetos</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Novo Objeto</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Objeto do Serviço</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cliente</Label>
                      <Select onValueChange={(v) => setValue("client_id", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockClients.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.client_id && <span className="text-destructive text-sm">{errors.client_id.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={type} onValueChange={(v) => setValue("type", v as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automovel">Automóvel</SelectItem>
                          <SelectItem value="aeronave">Aeronave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>{identifierLabel}</Label>
                      <Input placeholder={identifierLabel} {...register("identifier_primary")} />
                      {errors.identifier_primary && <span className="text-destructive text-sm">{errors.identifier_primary.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label>Fabricante</Label>
                      <Input placeholder="Ex.: Toyota, Cessna" {...register("manufacturer")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Input placeholder="Ex.: Corolla, 172" {...register("model")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ano</Label>
                      <Input placeholder="Ex.: 2020" {...register("year")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Cor</Label>
                      <Input placeholder="Ex.: Prata, Branco" {...register("color")} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Observações</Label>
                      <Input placeholder="Notas adicionais" {...register("notes")} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Salvar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Identificador</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Cor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.client_name}</TableCell>
                      <TableCell className="capitalize">{row.type}</TableCell>
                      <TableCell>{row.identifier_primary}</TableCell>
                      <TableCell>{row.model || "-"}</TableCell>
                      <TableCell>{row.year || "-"}</TableCell>
                      <TableCell>{row.color || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default ServiceObjects;
