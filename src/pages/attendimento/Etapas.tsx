import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type Funnel = {
  id: string;
  name: string;
};

type Stage = {
  id: string;
  funnelId: string;
  name: string;
  order: number;
  color?: string;
};

function getStoredFunnels(): Funnel[] {
  try {
    const raw = localStorage.getItem("workflow.funnels");
    const parsed = raw ? JSON.parse(raw) : [];
    return parsed.map((f: any) => ({ id: f.id, name: f.name }));
  } catch {
    return [];
  }
}

function getStoredStages(): Stage[] {
  try {
    const raw = localStorage.getItem("workflow.stages");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeStages(stages: Stage[]) {
  try {
    localStorage.setItem("workflow.stages", JSON.stringify(stages));
  } catch {}
}

export default function Etapas() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>("");

  const [name, setName] = useState("");
  const [order, setOrder] = useState<number>(1);
  const [color, setColor] = useState<string>("#3b82f6");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setFunnels(getStoredFunnels());
    setStages(getStoredStages());
  }, []);

  useEffect(() => {
    storeStages(stages);
  }, [stages]);

  const filteredStages = useMemo(() => stages.filter((s) => s.funnelId === selectedFunnelId).sort((a, b) => a.order - b.order), [stages, selectedFunnelId]);
  const isEditing = useMemo(() => !!editingId, [editingId]);

  useEffect(() => {
    // Ajustar próximo order automaticamente
    const maxOrder = filteredStages.reduce((acc, s) => Math.max(acc, s.order), 0);
    setOrder(maxOrder + 1);
  }, [filteredStages.length]);

  const resetForm = () => {
    setName("");
    setColor("#3b82f6");
    setEditingId(null);
  };

  const handleCreateOrUpdate = () => {
    if (!selectedFunnelId) {
      toast.error("Selecione um funil");
      return;
    }
    if (!name.trim()) {
      toast.error("Informe o nome da etapa");
      return;
    }
    if (isEditing) {
      setStages((prev) => prev.map((s) => (s.id === editingId ? { ...s, name, order, color } : s)));
      toast.success("Etapa atualizada");
    } else {
      const newStage: Stage = {
        id: crypto.randomUUID(),
        funnelId: selectedFunnelId,
        name: name.trim(),
        order: Number(order) || 1,
        color: color || undefined,
      };
      setStages((prev) => [...prev, newStage]);
      toast.success("Etapa criada");
    }
    resetForm();
  };

  const handleEdit = (stage: Stage) => {
    setEditingId(stage.id);
    setName(stage.name);
    setOrder(stage.order);
    setColor(stage.color || "#3b82f6");
  };

  const handleDelete = (id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
    toast.success("Etapa excluída");
    if (editingId === id) resetForm();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Etapas</CardTitle>
          <CardDescription>Defina as etapas de cada funil para o workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-3">
              <Select value={selectedFunnelId} onValueChange={setSelectedFunnelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funil" />
                </SelectTrigger>
                <SelectContent>
                  {funnels.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {funnels.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum funil encontrado. Cadastre em "Funis".</p>
              )}
              <Input placeholder="Nome da etapa" value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="number" placeholder="Ordem" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleCreateOrUpdate}>{isEditing ? "Salvar alterações" : "Adicionar etapa"}</Button>
                {isEditing && <Button variant="secondary" onClick={resetForm}>Cancelar</Button>}
              </div>
            </div>
            <div className="md:col-span-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead className="w-40">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStages.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.order}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>
                        <div className="h-4 w-8 rounded" style={{ backgroundColor: s.color || "#3b82f6" }} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(s)}>Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>Excluir</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {selectedFunnelId && filteredStages.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhuma etapa para este funil
                      </TableCell>
                    </TableRow>
                  )}
                  {!selectedFunnelId && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Selecione um funil para ver as etapas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Dica: a ordem define a sequência no quadro de workflow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}