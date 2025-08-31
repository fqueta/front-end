export function getTenantIdFromSubdomain(): string | null {
  const host = window.location.hostname; 
  const parts = host.split('.');
  return parts.length > 1 ? parts[0] : null;
}

export function getTenantApiUrl(): string {
  // Derive tenant API URL from VITE_API_URL by removing 'api-' prefix
  const baseUrl : string = import.meta.env.VITE_TENANT_API_URL || 'http://maisaqui1.localhost:8000/api/v1';
  const tenant_id = getTenantIdFromSubdomain() || 'default';
  const ret = baseUrl.replace('{tenant_id}', tenant_id);
  return ret;
}

export function getVersionApi(): string {
  return import.meta.env.VITE_API_VERSION || '/v1';
}
// Capitaliza a primeira letra de cada palavra (similar ao ucwords do PHP)
export function ucwords(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
// Converte data do formato 'YYYY-MM-DD' para 'DD/MM/YYYY' (padrão brasileiro)
export function dataParaBR(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split('-');
  if (!ano || !mes || !dia) return dataISO;
  return `${dia}/${mes}/${ano}`;
}
// Retorna o número do mês (1-12) dado o nome do mês em português (case-insensitive)
export function numeroDoMes(nomeMes: string): number | undefined {
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const idx = meses.findIndex(
    m => m.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase() ===
         nomeMes.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  );
  return idx >= 0 ? idx + 1 : undefined;
}
// component para retornar o inicio e fim da semana atual
export function getSemanaAtual() {
  const hoje = new Date();

  // Pega o dia da semana (0 = domingo, 1 = segunda, ..., 6 = sábado)
  const diaSemana = hoje.getDay();

  // Ajuste para considerar segunda-feira como início
  const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;

  // Data da segunda-feira
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() + diffSegunda);

  // Data do domingo
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);

  return {
    inicio: inicioSemana,
    fim: fimSemana,
  };
}
/**
 * Componente para retornar o numero da semana do ano 
 * @param data Data para a qual se quer obter o número da semana (padrão: data atual)
 * @returns 
 * exmplo de uso:
 * console.log("Semana atual:", getNumeroSemana()); 
 * console.log("Semana de 01/01/2025:", getNumeroSemana(new Date("2025-01-01")));
 * console.log("Semana de 31/12/2025:", getNumeroSemana(new Date("2025-12-31")));
 */

export function getNumeroSemana(data: Date = new Date()): number {
  // Copia a data e zera horas (em UTC para evitar problemas de fuso)
  const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));

  // Ajusta para quinta-feira da semana atual (regra ISO-8601)
  const diaSemana = d.getUTCDay() || 7; // se for domingo (0), vira 7
  d.setUTCDate(d.getUTCDate() + 4 - diaSemana);

  // Primeiro dia do ano
  const inicioAno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  // Diferença em dias e conversão para número da semana
  const numeroSemana = Math.ceil(((d.getTime() - inicioAno.getTime()) / 86400000 + 1) / 7);

  return numeroSemana;
}
/**
 * componente para obter o inicio e fim da semana de um ano e numero da semana 
 * @param ano numero do ano
 * @param semana numero da semana (1-53)
 * @returns o objeto com as datas de inicio e fim da semana
 * Exemplo de uso: const { inicio, fim } = getSemanaPorNumero(2025, 34);
  console.log("Semana 34 de 2025:");
  console.log("Início:", inicio.toISOString().split("T")[0]); // 2025-08-18
  console.log("Fim:", fim.toISOString().split("T")[0]);       // 2025-08-24
 */
export function getSemanaPorNumero(ano: number, semana: number): { inicio: Date; fim: Date } {
  // Cria data na 1ª semana do ano (dia 4 de janeiro é sempre na semana 1 ISO)
  const inicioAno = new Date(Date.UTC(ano, 0, 4));

  // Ajusta para segunda-feira da semana 1
  const diaSemana = inicioAno.getUTCDay() || 7;
  const inicioSemana1 = new Date(inicioAno);
  inicioSemana1.setUTCDate(inicioAno.getUTCDate() - (diaSemana - 1));

  // Calcula a data de início da semana desejada
  const inicio = new Date(inicioSemana1);
  inicio.setUTCDate(inicioSemana1.getUTCDate() + (semana - 1) * 7);

  // Data do fim da semana (domingo)
  const fim = new Date(inicio);
  fim.setUTCDate(inicio.getUTCDate() + 6);

  return { inicio, fim };
}
/**
 * componente para obter o inicio e fim de um mes de um ano
 * @param ano ano (ex: 2025)
 * @param mes mes (1-12)
 * @returns 
 */
export function getInicioFimMes(ano: number, mes: number): { inicioStr: string; fimStr: string } {
  // mes é 1–12, mas no JS o mês começa em 0
  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0); // dia 0 do próximo mês → último dia do mês atual
  // Formata como YYYY-MM-DD
  const inicioStr = inicio.toISOString().split('T')[0];
  const fimStr = fim.toISOString().split('T')[0];
  return { inicioStr, fimStr };
}


