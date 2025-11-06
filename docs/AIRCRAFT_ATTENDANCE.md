# Sistema de Atendimentos de Aeronaves

## Visão Geral

O Sistema de Atendimentos de Aeronaves é uma funcionalidade completa que permite rastrear e gerenciar a passagem das aeronaves pelos funis e etapas através das Ordens de Serviço. Esta funcionalidade oferece controle total sobre o ciclo de vida dos atendimentos, desde a criação até a conclusão.

## Funcionalidades Principais

### 1. Gestão de Atendimentos
- **Criação de Atendimentos**: Criação de novos registros de atendimento vinculados a aeronaves e ordens de serviço
- **Edição e Atualização**: Modificação de dados dos atendimentos existentes
- **Exclusão**: Remoção de atendimentos quando necessário
- **Visualização Detalhada**: Acesso completo aos dados e histórico dos atendimentos

### 2. Sistema de Status
- **Em Progresso** (`in_progress`): Atendimento em andamento
- **Concluído** (`completed`): Atendimento finalizado
- **Cancelado** (`cancelled`): Atendimento cancelado
- **Em Espera** (`on_hold`): Atendimento pausado
- **Pendente** (`pending`): Atendimento aguardando início

### 3. Sistema de Prioridades
- **Baixa** (`low`): Prioridade baixa
- **Média** (`medium`): Prioridade média
- **Alta** (`high`): Prioridade alta
- **Urgente** (`urgent`): Prioridade urgente

### 4. Filtros e Busca Avançada
- Filtro por aeronave
- Filtro por cliente
- Filtro por status
- Filtro por prioridade
- Filtro por funil/etapa
- Filtro por responsável
- Filtro por período (data de/até)
- Busca textual inteligente

### 5. Paginação Inteligente
- Controle de itens por página (10, 25, 50, 100)
- Navegação entre páginas
- Informações de total de registros
- Performance otimizada para grandes volumes

### 6. Timeline e Histórico
- Histórico completo de eventos
- Timeline visual das etapas
- Rastreamento de mudanças de status
- Registro de notas e observações

### 7. Dashboard e Estatísticas
- Estatísticas gerais de atendimentos
- Métricas por status e prioridade
- Performance por aeronave
- Análise de tempo médio de atendimento

## Arquitetura Técnica

### Estrutura de Arquivos

```
src/
├── types/
│   └── aircraftAttendance.ts          # Definições de tipos TypeScript
├── services/
│   └── aircraftAttendanceService.ts   # Serviço de API com CRUD completo
├── hooks/
│   └── useAircraftAttendance.ts       # Hooks React Query para gerenciamento de estado
├── components/
│   └── aircraft-attendance/
│       ├── AttendanceList.tsx         # Lista de atendimentos com filtros
│       ├── AttendanceDetail.tsx       # Detalhes do atendimento
│       ├── AttendanceFilters.tsx      # Componente de filtros
│       └── AttendanceTimeline.tsx     # Timeline visual
└── pages/
    └── AircraftAttendance.tsx         # Página principal
```

### Tecnologias Utilizadas

- **React 18**: Framework principal
- **TypeScript**: Tipagem estática
- **React Query**: Gerenciamento de estado e cache
- **Tailwind CSS**: Estilização
- **Shadcn/ui**: Componentes de interface
- **Lucide React**: Ícones
- **Sonner**: Notificações toast

### Padrões de Desenvolvimento

#### 1. Serviços de API
O serviço `AircraftAttendanceService` estende `BaseApiService` seguindo o padrão do projeto:

```typescript
class AircraftAttendanceService extends BaseApiService {
  private readonly endpoint = '/aircraft-attendances';
  
  async list(params?: AttendanceListParams): Promise<AttendanceListResponse> {
    const response = await this.get<any>(this.endpoint, params);
    return this.normalizePaginatedResponse<AircraftAttendance>(response);
  }
  
  // Outros métodos CRUD...
}
```

#### 2. Hooks React Query
Hooks especializados para cada operação:

```typescript
export function useAttendanceList(params?: AttendanceListParams) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => aircraftAttendanceService.list(params),
    staleTime: 5 * 60 * 1000,
  });
}
```

#### 3. Componentes Reutilizáveis
Componentes modulares e reutilizáveis com props tipadas:

```typescript
interface AttendanceListProps {
  filters?: AttendanceFilters;
  onAttendanceSelect?: (attendance: AircraftAttendance) => void;
  showFilters?: boolean;
}
```

## Funcionalidades Avançadas

### 1. Cache Inteligente
- Cache automático com React Query
- Invalidação seletiva de cache
- Sincronização em tempo real
- Otimização de performance

### 2. Tratamento de Erros
- Tratamento robusto de erros de API
- Mensagens de erro amigáveis
- Fallbacks para estados de erro
- Retry automático em falhas de rede

### 3. Estados de Loading
- Indicadores visuais de carregamento
- Skeleton screens para melhor UX
- Estados de loading granulares
- Feedback visual imediato

### 4. Responsividade
- Design totalmente responsivo
- Adaptação para mobile e tablet
- Navegação otimizada para touch
- Layout flexível

## Integração com o Sistema

### 1. Menu e Navegação
A funcionalidade foi integrada ao sistema de menu principal:

```typescript
// menu.ts
{
  title: 'Atendimentos de Aeronaves',
  url: '/aircraft-attendance',
  icon: 'Plane',
  permission: 'aircraft-attendance.view'
}
```

### 2. Rotas Protegidas
Rota protegida por permissões:

```typescript
// App.tsx
<Route 
  path="/aircraft-attendance" 
  element={
    <ProtectedRoute>
      <AppLayout>
        <AircraftAttendance />
      </AppLayout>
    </ProtectedRoute>
  } 
/>
```

### 3. Sistema de Permissões
- `aircraft-attendance.view`: Visualizar atendimentos
- `aircraft-attendance.create`: Criar atendimentos
- `aircraft-attendance.edit`: Editar atendimentos
- `aircraft-attendance.delete`: Excluir atendimentos

## API Endpoints

### Endpoints Principais
- `GET /aircraft-attendances` - Listar atendimentos
- `GET /aircraft-attendances/:id` - Buscar atendimento por ID
- `POST /aircraft-attendances` - Criar atendimento
- `PUT /aircraft-attendances/:id` - Atualizar atendimento
- `DELETE /aircraft-attendances/:id` - Excluir atendimento

### Endpoints Especializados
- `GET /aircraft-attendances/:id/history` - Histórico do atendimento
- `POST /aircraft-attendances/:id/events` - Adicionar evento
- `PATCH /aircraft-attendances/:id/status` - Atualizar status
- `PATCH /aircraft-attendances/:id/stage` - Mover para etapa
- `GET /aircraft-attendances/stats` - Estatísticas
- `GET /aircraft-attendances/export` - Exportar dados

## Como Usar

### 1. Acessar a Funcionalidade
1. Faça login no sistema
2. No menu lateral, clique em "Atendimentos de Aeronaves"
3. A página principal será carregada com a lista de atendimentos

### 2. Filtrar Atendimentos
1. Use os filtros na parte superior da página
2. Selecione aeronave, status, prioridade, etc.
3. A lista será atualizada automaticamente

### 3. Criar Novo Atendimento
1. Clique no botão "Novo Atendimento"
2. Preencha os dados obrigatórios
3. Salve para criar o registro

### 4. Visualizar Detalhes
1. Clique em um atendimento na lista
2. Visualize todos os detalhes e histórico
3. Edite ou atualize conforme necessário

## Manutenção e Extensibilidade

### 1. Adicionando Novos Campos
Para adicionar novos campos aos atendimentos:

1. Atualize os tipos em `aircraftAttendance.ts`
2. Modifique o serviço se necessário
3. Atualize os componentes de formulário
4. Teste a funcionalidade

### 2. Novos Filtros
Para adicionar novos filtros:

1. Atualize `AttendanceFilters` em types
2. Modifique o componente `AttendanceFilters`
3. Atualize a lógica de busca no serviço

### 3. Novas Funcionalidades
O sistema foi projetado para ser extensível:

- Adicione novos hooks em `useAircraftAttendance.ts`
- Crie novos componentes na pasta `aircraft-attendance/`
- Estenda o serviço com novos métodos

## Considerações de Performance

### 1. Paginação
- Implementada paginação server-side
- Controle de itens por página
- Carregamento sob demanda

### 2. Cache
- Cache inteligente com React Query
- Tempo de vida configurável
- Invalidação automática

### 3. Otimizações
- Lazy loading de componentes
- Debounce em filtros de busca
- Memoização de componentes pesados

## Segurança

### 1. Autenticação
- Todas as rotas são protegidas
- Verificação de token JWT
- Redirecionamento automático para login

### 2. Autorização
- Sistema de permissões granular
- Controle de acesso por funcionalidade
- Validação server-side

### 3. Validação
- Validação de dados no frontend
- Sanitização de inputs
- Tratamento seguro de erros

## Conclusão

O Sistema de Atendimentos de Aeronaves é uma solução completa e robusta que oferece:

- **Funcionalidade Completa**: CRUD completo com funcionalidades avançadas
- **Performance Otimizada**: Cache inteligente e paginação eficiente
- **UX Excepcional**: Interface intuitiva e responsiva
- **Arquitetura Sólida**: Código bem estruturado e extensível
- **Segurança**: Proteção adequada e controle de acesso
- **Manutenibilidade**: Fácil de manter e estender

Esta implementação segue as melhores práticas de desenvolvimento React/TypeScript e está totalmente integrada ao ecossistema do projeto.