import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { seedWorkflowDemo, clearWorkflowDemo } from "./demoData";

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

export default function Workflow() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>("");

  useEffect(() => {
    setFunnels(getStoredFunnels());
    setStages(getStoredStages());
  }, []);

  const funnelStages = useMemo(
    () => stages.filter((s) => s.funnelId === selectedFunnelId).sort((a, b) => a.order - b.order),
    [stages, selectedFunnelId]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workflow</CardTitle>
          <CardDescription>Selecione um funil para visualizar suas etapas</CardDescription>
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
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={() => (window.location.href = "/attendimento/etapas")}>Gerenciar Etapas</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const data = seedWorkflowDemo();
                    setFunnels(data.funnels);
                    setStages(data.stages);
                  }}
                >Carregar dados de exemplo</Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    clearWorkflowDemo();
                    setFunnels([]);
                    setStages([]);
                    setSelectedFunnelId("");
                  }}
                >Limpar dados</Button>
              </div>
            </div>
            <div className="md:col-span-2">
              {selectedFunnelId ? (
                <div className="flex gap-4 overflow-x-auto">
                  {funnelStages.map((stage) => (
                    <div key={stage.id} className="min-w-[220px] flex-shrink-0">
                      <div className="rounded-md border p-3" style={{ borderColor: stage.color || "#e5e7eb" }}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium" style={{ color: stage.color || undefined }}>{stage.name}</h3>
                          <span className="text-xs text-muted-foreground">#{stage.order}</span>
                        </div>
                        <Separator className="my-2" />
                        <p className="text-xs text-muted-foreground">Em breve: quadro kanban com OS nesta etapa.</p>
                      </div>
                    </div>
                  ))}
                  {funnelStages.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma etapa definida para este funil.</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Selecione um funil para visualizar o workflow.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}