export type FunnelSeed = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
};

export type StageSeed = {
  id: string;
  funnelId: string;
  name: string;
  order: number;
  color?: string;
};

/**
 * Interface para Ordem de Serviço mocada
 */
interface ServiceOrderSeed {
  id: string;
  number: string;
  title: string;
  client: string;
  aircraft?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  createdAt: string;
  dueDate?: string;
  stageId: string;
  description?: string;
  technician?: string;
}

const FUNNELS_KEY = "workflow.funnels";
const STAGES_KEY = "workflow.stages";
const SERVICE_ORDERS_KEY = "workflow.serviceOrders";

export function seedWorkflowDemo(): { funnels: FunnelSeed[]; stages: StageSeed[]; serviceOrders: ServiceOrderSeed[] } {
  const funnels: FunnelSeed[] = [
    {
      id: "funnel-atendimento-os",
      name: "Atendimento OS",
      description: "Fluxo padrão para atendimento de ordens de serviço",
      isActive: true,
      createdAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: "funnel-manutencao-programada",
      name: "Manutenção Programada",
      description: "Processo para manutenções agendadas e preventivas",
      isActive: true,
      createdAt: new Date('2024-01-20').toISOString(),
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

  /**
   * Dados mocados de Ordens de Serviço
   */
  const demoServiceOrders: ServiceOrderSeed[] = [
    // Etapa: Recebimento (stage-os-1)
    {
      id: "os-001",
      number: "OS-2024-001",
      title: "Inspeção de Motor",
      client: "TAM Linhas Aéreas",
      aircraft: "Boeing 737-800 (PR-GTD)",
      priority: "high",
      status: "Em análise",
      createdAt: "2024-01-15T08:30:00Z",
      dueDate: "2024-01-20T17:00:00Z",
      stageId: "stage-os-1",
      description: "Inspeção programada do motor CFM56-7B",
      technician: "João Silva"
    },
    {
      id: "os-002",
      number: "OS-2024-002",
      title: "Reparo de Trem de Pouso",
      client: "Azul Linhas Aéreas",
      aircraft: "Airbus A320 (PR-YRB)",
      priority: "urgent",
      status: "Aguardando peças",
      createdAt: "2024-01-16T09:15:00Z",
      dueDate: "2024-01-18T16:00:00Z",
      stageId: "stage-os-1",
      description: "Reparo urgente no trem de pouso principal",
      technician: "Maria Santos"
    },
    // Etapa: Triagem (stage-os-2)
    {
      id: "os-003",
      number: "OS-2024-003",
      title: "Manutenção de Avionics",
      client: "Gol Linhas Aéreas",
      aircraft: "Boeing 737-700 (PR-GXK)",
      priority: "medium",
      status: "Em triagem",
      createdAt: "2024-01-17T10:00:00Z",
      dueDate: "2024-01-25T15:00:00Z",
      stageId: "stage-os-2",
      description: "Atualização de software dos sistemas aviônicos",
      technician: "Carlos Oliveira"
    },
    // Etapa: Em Execução (stage-os-3)
    {
      id: "os-004",
      number: "OS-2024-004",
      title: "Substituição de Pneus",
      client: "LATAM Airlines",
      aircraft: "Airbus A321 (PR-XBF)",
      priority: "low",
      status: "Em execução",
      createdAt: "2024-01-18T11:30:00Z",
      dueDate: "2024-01-22T14:00:00Z",
      stageId: "stage-os-3",
      description: "Troca de pneus do trem de pouso principal",
      technician: "Ana Costa"
    },
    {
      id: "os-005",
      number: "OS-2024-005",
      title: "Reparo de Fuselagem",
      client: "Azul Linhas Aéreas",
      aircraft: "Embraer E195 (PR-AXG)",
      priority: "high",
      status: "Em execução",
      createdAt: "2024-01-19T13:45:00Z",
      dueDate: "2024-01-24T12:00:00Z",
      stageId: "stage-os-3",
      description: "Reparo de dano na fuselagem inferior",
      technician: "Pedro Lima"
    },
    // Etapa: Aguardando Peças (stage-os-4)
    {
      id: "os-006",
      number: "OS-2024-006",
      title: "Troca de Turbina",
      client: "TAM Linhas Aéreas",
      aircraft: "Boeing 777-300ER (PR-OVT)",
      priority: "urgent",
      status: "Aguardando peças",
      createdAt: "2024-01-20T14:20:00Z",
      dueDate: "2024-01-26T10:00:00Z",
      stageId: "stage-os-4",
      description: "Substituição de turbina do motor direito",
      technician: "Roberto Silva"
    },
    // Etapa: Concluída (stage-os-5)
    {
      id: "os-007",
      number: "OS-2024-007",
      title: "Inspeção de Segurança",
      client: "Gol Linhas Aéreas",
      aircraft: "Boeing 737-800 (PR-GUP)",
      priority: "medium",
      status: "Concluída",
      createdAt: "2024-01-21T15:10:00Z",
      dueDate: "2024-01-23T16:30:00Z",
      stageId: "stage-os-5",
      description: "Inspeção de segurança pré-voo completa",
      technician: "Luiza Ferreira"
    },
    // Funil 2: Manutenção Programada
    // Etapa: Planejada (stage-mp-1)
    {
      id: "os-008",
      number: "MP-2024-001",
      title: "Check C - Boeing 777",
      client: "TAM Linhas Aéreas",
      aircraft: "Boeing 777-300ER (PR-OVS)",
      priority: "medium",
      status: "Planejamento",
      createdAt: "2024-01-20T08:00:00Z",
      dueDate: "2024-02-15T17:00:00Z",
      stageId: "stage-mp-1",
      description: "Manutenção programada tipo C",
      technician: "Equipe Planejamento"
    },
    // Etapa: Agendada (stage-mp-2)
    {
      id: "os-009",
      number: "MP-2024-002",
      title: "Manutenção Preventiva A320",
      client: "Azul Linhas Aéreas",
      aircraft: "Airbus A320 (PR-YRC)",
      priority: "low",
      status: "Agendada",
      createdAt: "2024-01-22T09:30:00Z",
      dueDate: "2024-02-05T14:00:00Z",
      stageId: "stage-mp-2",
      description: "Manutenção preventiva de 6000 horas",
      technician: "Equipe A320"
    },
    // Etapa: Execução (stage-mp-3)
    {
      id: "os-010",
      number: "MP-2024-003",
      title: "Overhaul de Motor",
      client: "LATAM Airlines",
      aircraft: "Boeing 787-9 (PR-XTD)",
      priority: "high",
      status: "Em execução",
      createdAt: "2024-01-23T10:15:00Z",
      dueDate: "2024-03-01T16:00:00Z",
      stageId: "stage-mp-3",
      description: "Revisão geral do motor Trent 1000",
      technician: "Equipe Motores"
    },
    // Etapa: Finalizada (stage-mp-4)
    {
      id: "os-011",
      number: "MP-2024-004",
      title: "Check A - E195",
      client: "Azul Linhas Aéreas",
      aircraft: "Embraer E195 (PR-AXH)",
      priority: "medium",
      status: "Finalizada",
      createdAt: "2024-01-24T11:00:00Z",
      dueDate: "2024-01-28T13:30:00Z",
      stageId: "stage-mp-4",
      description: "Check A de 500 horas de voo",
      technician: "Equipe Embraer"
    },
    {
      id: "os-012",
      number: "MP-2024-005",
      title: "Inspeção Estrutural",
      client: "Gol Linhas Aéreas",
      aircraft: "Boeing 737-700 (PR-GXL)",
      priority: "low",
      status: "Finalizada",
      createdAt: "2024-01-25T12:45:00Z",
      dueDate: "2024-01-30T15:00:00Z",
      stageId: "stage-mp-4",
      description: "Inspeção estrutural detalhada",
      technician: "Equipe Estrutural"
    }
  ];

  const serviceOrders = demoServiceOrders;

  try {
    localStorage.setItem(FUNNELS_KEY, JSON.stringify(funnels));
    localStorage.setItem(STAGES_KEY, JSON.stringify(stages));
    localStorage.setItem(SERVICE_ORDERS_KEY, JSON.stringify(serviceOrders));
    
    console.log("✅ Dados de demonstração carregados com sucesso!");
    return { funnels, stages, serviceOrders };
  } catch (error) {
    console.error("❌ Erro ao carregar dados de demonstração:", error);
    return { funnels: [], stages: [], serviceOrders: [] };
  }
}

/**
 * Obtém as Ordens de Serviço armazenadas no localStorage
 */
export function getStoredServiceOrders(): ServiceOrderSeed[] {
  try {
    const stored = localStorage.getItem(SERVICE_ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("❌ Erro ao obter ordens de serviço:", error);
    return [];
  }
}

/**
 * Remove todos os dados de demonstração do localStorage
 */
export function clearWorkflowDemo(): void {
  try {
    localStorage.removeItem(FUNNELS_KEY);
    localStorage.removeItem(STAGES_KEY);
    localStorage.removeItem(SERVICE_ORDERS_KEY);
    
    console.log("🗑️ Dados de demonstração removidos com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao remover dados de demonstração:", error);
  }
}