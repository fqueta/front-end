export type FunnelSeed = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

export type StageSeed = {
  id: string;
  funnelId: string;
  name: string;
  order: number;
  color?: string;
};

const FUNNELS_KEY = "workflow.funnels";
const STAGES_KEY = "workflow.stages";

export function seedWorkflowDemo(): { funnels: FunnelSeed[]; stages: StageSeed[] } {
  const funnels: FunnelSeed[] = [
    {
      id: "funnel-atendimento-os",
      name: "Atendimento OS",
      description: "Fluxo para Ordens de Serviço",
      createdAt: new Date().toISOString(),
    },
    {
      id: "funnel-manutencao-programada",
      name: "Manutenção Programada",
      description: "Fluxo para manutenções agendadas",
      createdAt: new Date().toISOString(),
    },
  ];

  const stages: StageSeed[] = [
    // Atendimento OS
    { id: "stage-os-1", funnelId: "funnel-atendimento-os", name: "Recebida", order: 1, color: "#2563eb" },
    { id: "stage-os-2", funnelId: "funnel-atendimento-os", name: "Triagem", order: 2, color: "#0ea5e9" },
    { id: "stage-os-3", funnelId: "funnel-atendimento-os", name: "Em Execução", order: 3, color: "#22c55e" },
    { id: "stage-os-4", funnelId: "funnel-atendimento-os", name: "Aguardando Peças", order: 4, color: "#f59e0b" },
    { id: "stage-os-5", funnelId: "funnel-atendimento-os", name: "Concluída", order: 5, color: "#10b981" },

    // Manutenção Programada
    { id: "stage-mp-1", funnelId: "funnel-manutencao-programada", name: "Planejada", order: 1, color: "#7c3aed" },
    { id: "stage-mp-2", funnelId: "funnel-manutencao-programada", name: "Agendada", order: 2, color: "#6366f1" },
    { id: "stage-mp-3", funnelId: "funnel-manutencao-programada", name: "Execução", order: 3, color: "#ef4444" },
    { id: "stage-mp-4", funnelId: "funnel-manutencao-programada", name: "Finalizada", order: 4, color: "#14b8a6" },
  ];

  try {
    localStorage.setItem(FUNNELS_KEY, JSON.stringify(funnels));
    localStorage.setItem(STAGES_KEY, JSON.stringify(stages));
  } catch {}

  return { funnels, stages };
}

export function clearWorkflowDemo(): void {
  try {
    localStorage.removeItem(FUNNELS_KEY);
    localStorage.removeItem(STAGES_KEY);
  } catch {}
}