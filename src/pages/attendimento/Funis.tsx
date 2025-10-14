import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type Funnel = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

function getStoredFunnels(): Funnel[] {
  try {
    const raw = localStorage.getItem("workflow.funnels");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeFunnels(funnels: Funnel[]) {
  try {
    localStorage.setItem("workflow.funnels", JSON.stringify(funnels));
  } catch {}
}

export default function Funis() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setFunnels(getStoredFunnels());
  }, []);

  useEffect(() => {
    storeFunnels(funnels);
  }, [funnels]);

  const isEditing = useMemo(() => !!editingId, [editingId]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleCreateOrUpdate = () => {
    if (!name.trim()) {
      toast.error("Informe o nome do funil");
      return;
    }
    if (isEditing) {
      setFunnels((prev) => prev.map((f) => (f.id === editingId ? { ...f, name, description } : f)));
      toast.success("Funil atualizado");
    } else {
      const newFunnel: Funnel = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      setFunnels((prev) => [newFunnel, ...prev]);
      toast.success("Funil criado");
    }
    resetForm();
  };

  const handleEdit = (funnel: Funnel) => {
    setEditingId(funnel.id);
    setName(funnel.name);
    setDescription(funnel.description || "");
  };

  const handleDelete = (id: string) => {
    setFunnels((prev) => prev.filter((f) => f.id !== id));
    toast.success("Funil excluído");
    if (editingId === id) resetForm();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Funis</CardTitle>
          <CardDescription>Cadastre e gerencie funis de atendimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-3">
              <Input
                placeholder="Nome do funil"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Descrição (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateOrUpdate}>{isEditing ? "Salvar alterações" : "Adicionar funil"}</Button>
                {isEditing && (
                  <Button variant="secondary" onClick={resetForm}>Cancelar</Button>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-40">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funnels.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>{f.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(f)}>Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(f.id)}>Excluir</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {funnels.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Nenhum funil cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Dica: após criar funis, cadastre as etapas em "Etapas" para montar o workflow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}