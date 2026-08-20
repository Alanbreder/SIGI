import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Users,
  Headphones,
  HelpCircle,
  ShieldAlert,
  Wrench,
  BookOpen,
  FileText,
  Filter,
  Calendar,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Layers,
  Boxes,
  GraduationCap,
  GitPullRequest,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Printer,
  X,
  Eye,
  Info,
  Clock,
  User,
  Building,
  Tag,
  CheckSquare,
  AlertTriangle,
  Bug,
  Lightbulb,
  Activity,
  Grid,
  Compass,
  BarChart2,
  HelpCircle as HelpIcon,
  Layers3,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { AtendimentoItem, Cliente, RegistroItem, ArtigoKBItem, SistemaItem } from '../../types';

interface RelatoriosViewProps {
  atendimentos: AtendimentoItem[];
  clients: Cliente[];
  registros?: RegistroItem[];
  artigos?: ArtigoKBItem[];
  sistemas?: SistemaItem[];
  onOpenAtendimentoWorkspace?: (atd: AtendimentoItem) => void;
  onOpenRegistroWorkspace?: (reg: RegistroItem) => void;
  onOpenArtigoWorkspace?: (art: ArtigoKBItem) => void;
  onOpenClientesModule?: () => void;
}

type TabType =
  | 'daily_report'
  | 'visao_geral'
  | 'causa_raiz'
  | 'dependencia_clientes'
  | 'tipos_demanda'
  | 'matriz_cliente_modulo'
  | 'clientes'
  | 'apoio_interno'
  | 'capacitacao'
  | 'modulos';

type PeriodoType =
  | 'todos'
  | 'mes_atual'
  | '30_dias'
  | '90_dias'
  | 'ano_atual'
  | 'mes_especifico'
  | 'personalizado';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const MODULOS_MATRIZ = [
  'Faturamento / NF-e',
  'NFC-e / Ponto de Venda',
  'Financeiro / Contas',
  'Estoque / Compras',
  'MDF-e / Transporte',
  'SPED / Fiscal',
  'Configurações e Rede',
  'Outros / Geral'
];

export const RelatoriosView: React.FC<RelatoriosViewProps> = ({
  atendimentos = [],
  clients = [],
  registros = [],
  artigos = [],
  sistemas = [],
  onOpenAtendimentoWorkspace,
  onOpenRegistroWorkspace,
  onOpenArtigoWorkspace,
  onOpenClientesModule
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('daily_report');
  const [dailyReportDate, setDailyReportDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedDailyActivityDrawer, setSelectedDailyActivityDrawer] = useState<{
    id: string;
    type: 'atendimento' | 'registro' | 'cliente' | 'artigo' | 'video';
    codigo: string;
    titulo: string;
    subtitulo: string;
    status: string;
    prioridade?: string;
    autor?: string;
    dataHora: string;
    rawData: any;
  } | null>(null);

  const normalizeDateToYMD = (dateStr?: string): string | null => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        let y = parts[2];
        if (y.length === 2) y = '20' + y;
        return `${y}-${m}-${d}`;
      }
    }
    const dt = new Date(dateStr);
    if (!isNaN(dt.getTime())) {
      return dt.toISOString().split('T')[0];
    }
    return null;
  };

  const dailyReportActivities = useMemo(() => {
    const targetDate = dailyReportDate;
    const results: Array<{
      id: string;
      type: 'atendimento' | 'registro' | 'cliente' | 'artigo' | 'video';
      codigo: string;
      titulo: string;
      subtitulo: string;
      status: string;
      prioridade?: string;
      autor?: string;
      dataHora: string;
      rawData: any;
    }> = [];

    atendimentos.forEach((atd) => {
      const dYMD = normalizeDateToYMD(atd.dataAbertura);
      if (dYMD === targetDate) {
        results.push({
          id: `atd-${atd.id}`,
          type: 'atendimento',
          codigo: atd.codigo,
          titulo: atd.assunto,
          subtitulo: `Cliente: ${atd.clienteNome || 'Geral'} • Módulo: ${atd.modulo || 'N/A'}`,
          status: atd.status,
          prioridade: atd.prioridade,
          autor: atd.responsavel,
          dataHora: atd.dataAbertura,
          rawData: atd
        });
      }
    });

    registros.forEach((reg) => {
      const dYMD = normalizeDateToYMD(reg.data);
      if (dYMD === targetDate) {
        results.push({
          id: `reg-${reg.id}`,
          type: 'registro',
          codigo: reg.codigo,
          titulo: reg.titulo,
          subtitulo: `Tipo: ${reg.tipo} • Módulo: ${reg.modulo || 'N/A'}`,
          status: reg.status,
          prioridade: reg.prioridade,
          autor: reg.autor,
          dataHora: reg.data,
          rawData: reg
        });
      }
    });

    artigos.forEach((art) => {
      const dYMD = normalizeDateToYMD(art.dataCriacao);
      if (dYMD === targetDate) {
        const isVid = art.tipoConteudo === 'video' || art.tipoArtigo === 'Vídeo Aula' || Boolean(art.videoUrl);
        results.push({
          id: `art-${art.id}`,
          type: isVid ? 'video' : 'artigo',
          codigo: art.codigo,
          titulo: art.titulo,
          subtitulo: `Categoria: ${art.categoria} • ${isVid ? 'Vídeo Aula' : 'Artigo'}`,
          status: art.status,
          autor: art.autor,
          dataHora: art.dataCriacao,
          rawData: art
        });
      }
    });

    clients.forEach((cli) => {
      const dYMD = normalizeDateToYMD((cli as any).dataCriacao || (cli as any).criadoEm);
      if (dYMD === targetDate) {
        results.push({
          id: `cli-${cli.id}`,
          type: 'cliente',
          codigo: cli.codigo || cli.id,
          titulo: cli.nomeFantasia || cli.razaoSocial,
          subtitulo: `Segmento: ${cli.segmento || 'Geral'} • CNPJ: ${cli.cnpj || 'N/A'}`,
          status: cli.status,
          dataHora: (cli as any).dataCriacao || targetDate,
          rawData: cli
        });
      }
    });

    return results;
  }, [atendimentos, registros, artigos, clients, dailyReportDate]);
  const [periodoFilter, setPeriodoFilter] = useState<PeriodoType>('todos');
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('todos');
  const [selectedModuloFilter, setSelectedModuloFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected Atendimento for Right Drawer
  const [selectedAtendimentoForDrawer, setSelectedAtendimentoForDrawer] = useState<AtendimentoItem | null>(null);

  // Selected Group/List for Right Drawer (e.g., from Matriz or Causa Raiz)
  const [selectedGroupDrawer, setSelectedGroupDrawer] = useState<{
    titulo: string;
    subtitulo: string;
    atendimentos: AtendimentoItem[];
  } | null>(null);

  // Helper: Classify Root Cause of Atendimento
  const getAtendimentoCausa = (atd: AtendimentoItem): string => {
    if (atd.dadosDinamicos?.causaRaiz) return atd.dadosDinamicos.causaRaiz;
    const cat = (atd.categoria || '').toLowerCase();
    const motivo = (atd.motivoProcedimento || '').toLowerCase();
    const ass = (atd.assunto || '').toLowerCase();
    const mod = (atd.modulo || '').toLowerCase();
    const orig = (atd.origemApoio || '').toLowerCase();

    if (
      cat.includes('bug') ||
      cat.includes('erro') ||
      ass.includes('erro') ||
      ass.includes('bug') ||
      ass.includes('falha') ||
      ass.includes('trava')
    ) {
      return 'Bug / Erro de Sistema';
    }
    if (
      atd.clientePoderiaExecutar === 'Sim' ||
      cat.includes('treinamento') ||
      motivo.includes('treinamento') ||
      motivo.includes('desconhecimento')
    ) {
      return 'Falta de Treinamento';
    }
    if (
      cat.includes('dúvida') ||
      cat.includes('duvida') ||
      ass.includes('como') ||
      ass.includes('onde') ||
      ass.includes('passo')
    ) {
      return 'Dúvida Operacional';
    }
    if (cat.includes('config') || ass.includes('configur') || ass.includes('instala') || ass.includes('impressora')) {
      return 'Configuração / Instalação';
    }
    if (
      cat.includes('fiscal') ||
      cat.includes('sefaz') ||
      mod.includes('fiscal') ||
      mod.includes('sped') ||
      mod.includes('nf-e') ||
      ass.includes('rejeição')
    ) {
      return 'Problema Fiscal / SEFAZ';
    }
    if (cat.includes('infra') || cat.includes('rede') || orig.includes('infra') || ass.includes('servidor')) {
      return 'Problema de Infraestrutura';
    }
    if (cat.includes('melhoria') || cat.includes('solicitação') || ass.includes('sugestã') || ass.includes('recurso')) {
      return 'Solicitação de Melhoria';
    }
    if (cat.includes('externo') || cat.includes('integra') || orig.includes('integra') || ass.includes('api')) {
      return 'Integração / Terceiros';
    }
    if (cat.includes('usuário') || cat.includes('usuario') || ass.includes('digitou') || ass.includes('errado')) {
      return 'Erro do Usuário';
    }
    return 'Dúvida Operacional';
  };

  // Helper: Classify Demand Type (for Product View)
  const getAtendimentoTipoDemanda = (atd: AtendimentoItem): string => {
    const causa = getAtendimentoCausa(atd);
    if (causa === 'Bug / Erro de Sistema') return '🐛 Bug / Erro';
    if (causa === 'Solicitação de Melhoria') return '💡 Solicitação de Melhoria';
    if (causa === 'Falta de Treinamento') return '🎓 Treinamento / Capacitação';
    if (causa === 'Configuração / Instalação') return '🔧 Configuração / Parâmetros';
    if (atd.necessitouApoioInterno === 'Sim') return '🆘 Apoio Interno / Escalação';
    return '❓ Dúvida Operacional';
  };

  // Filtering Logic
  const filteredAtendimentos = useMemo(() => {
    const now = new Date();

    return atendimentos.filter((atd) => {
      // Filter by Client
      if (
        selectedClientFilter !== 'todos' &&
        atd.clienteId !== selectedClientFilter &&
        atd.clienteNome !== selectedClientFilter
      ) {
        return false;
      }

      // Filter by Module
      if (selectedModuloFilter !== 'todos') {
        const matchesMainModule = atd.modulo === selectedModuloFilter;
        const matchesSubModules = (atd.sistemasModulos || []).some(
          (sm) => sm.modulo === selectedModuloFilter || sm.sistema === selectedModuloFilter
        );
        if (!matchesMainModule && !matchesSubModules) return false;
      }

      // Filter by Date Period
      if (periodoFilter !== 'todos' && atd.dataAbertura) {
        let atdDate: Date | null = null;
        if (atd.dataAbertura.includes('/')) {
          const parts = atd.dataAbertura.split('/');
          if (parts.length === 3) {
            atdDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
        } else {
          atdDate = new Date(atd.dataAbertura);
        }

        if (atdDate && !isNaN(atdDate.getTime())) {
          if (periodoFilter === 'mes_atual') {
            if (atdDate.getMonth() !== now.getMonth() || atdDate.getFullYear() !== now.getFullYear()) {
              return false;
            }
          } else if (periodoFilter === '30_dias') {
            const diffTime = Math.abs(now.getTime() - atdDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 30) return false;
          } else if (periodoFilter === '90_dias') {
            const diffTime = Math.abs(now.getTime() - atdDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 90) return false;
          } else if (periodoFilter === 'ano_atual') {
            if (atdDate.getFullYear() !== now.getFullYear()) return false;
          } else if (periodoFilter === 'mes_especifico' && selectedMonthYear) {
            const [yearStr, monthStr] = selectedMonthYear.split('-');
            const y = parseInt(yearStr);
            const m = parseInt(monthStr) - 1;
            if (atdDate.getFullYear() !== y || atdDate.getMonth() !== m) return false;
          } else if (periodoFilter === 'personalizado') {
            if (startDate) {
              const sDate = new Date(startDate);
              sDate.setHours(0, 0, 0, 0);
              if (atdDate < sDate) return false;
            }
            if (endDate) {
              const eDate = new Date(endDate);
              eDate.setHours(23, 59, 59, 999);
              if (atdDate > eDate) return false;
            }
          }
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const inCode = atd.codigo?.toLowerCase().includes(term);
        const inSubject = atd.assunto?.toLowerCase().includes(term);
        const inClient = atd.clienteNome?.toLowerCase().includes(term);
        const inModule = atd.modulo?.toLowerCase().includes(term);
        const inSolution = atd.solucaoAplicada?.toLowerCase().includes(term);
        if (!inCode && !inSubject && !inClient && !inModule && !inSolution) return false;
      }

      return true;
    });
  }, [
    atendimentos,
    selectedClientFilter,
    selectedModuloFilter,
    periodoFilter,
    selectedMonthYear,
    startDate,
    endDate,
    searchTerm
  ]);

  // Overall Statistics for Product Management
  const stats = useMemo(() => {
    const total = filteredAtendimentos.length;
    if (total === 0) {
      return {
        total: 0,
        capacitacaoCount: 0,
        capacitacaoPercent: 0,
        apoioCount: 0,
        apoioPercent: 0,
        topModulo: 'N/A',
        concluidos: 0,
        concluidosPercent: 0
      };
    }

    const capacitacaoCount = filteredAtendimentos.filter((a) => a.clientePoderiaExecutar === 'Sim').length;
    const apoioCount = filteredAtendimentos.filter((a) => a.necessitouApoioInterno === 'Sim').length;
    const concluidos = filteredAtendimentos.filter((a) => a.status === 'Resolvido' || a.status === 'Concluído').length;

    const moduleCounts: Record<string, number> = {};
    filteredAtendimentos.forEach((a) => {
      const mod = a.modulo || 'Outros';
      moduleCounts[mod] = (moduleCounts[mod] || 0) + 1;
    });

    let topModulo = 'Outros';
    let maxCount = 0;
    Object.entries(moduleCounts).forEach(([mod, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topModulo = mod;
      }
    });

    return {
      total,
      capacitacaoCount,
      capacitacaoPercent: Math.round((capacitacaoCount / total) * 100),
      apoioCount,
      apoioPercent: Math.round((apoioCount / total) * 100),
      topModulo,
      concluidos,
      concluidosPercent: Math.round((concluidos / total) * 100)
    };
  }, [filteredAtendimentos]);

  // 1. ANÁLISE DE CAUSA DOS ATENDIMENTOS (ORIGEM/RAIZ)
  const causaAnalysis = useMemo(() => {
    const map: Record<string, { causa: string; total: number; atendimentos: AtendimentoItem[] }> = {};

    filteredAtendimentos.forEach((atd) => {
      const causa = getAtendimentoCausa(atd);
      if (!map[causa]) {
        map[causa] = { causa, total: 0, atendimentos: [] };
      }
      map[causa].total += 1;
      map[causa].atendimentos.push(atd);
    });

    const totalCount = filteredAtendimentos.length || 1;
    const list = Object.values(map)
      .map((item) => ({
        ...item,
        percent: Math.round((item.total / totalCount) * 100)
      }))
      .sort((a, b) => b.total - a.total);

    return {
      list,
      chartData: list.map((i) => ({ name: i.causa, value: i.total, percent: i.percent }))
    };
  }, [filteredAtendimentos]);

  // 2. PERFIL DE DEPENDÊNCIA POR CLIENTE (VOLUME VS DEPENDÊNCIA REAL)
  const clienteDependenciaData = useMemo(() => {
    const map: Record<
      string,
      {
        clienteId: string;
        nome: string;
        total: number;
        duvidasCount: number;
        treinamentoCount: number;
        escalamentosCount: number;
        modulos: Record<string, number>;
        assuntos: Record<string, number>;
        atendimentos: AtendimentoItem[];
      }
    > = {};

    filteredAtendimentos.forEach((atd) => {
      const key = atd.clienteId || atd.clienteNome || 'Cliente Não Identificado';
      const name = atd.clienteNome || 'Cliente Não Identificado';

      if (!map[key]) {
        map[key] = {
          clienteId: atd.clienteId || key,
          nome: name,
          total: 0,
          duvidasCount: 0,
          treinamentoCount: 0,
          escalamentosCount: 0,
          modulos: {},
          assuntos: {},
          atendimentos: []
        };
      }

      const item = map[key];
      item.total += 1;
      item.atendimentos.push(atd);

      const causa = getAtendimentoCausa(atd);
      if (causa === 'Dúvida Operacional' || causa === 'Erro do Usuário') {
        item.duvidasCount += 1;
      }
      if (causa === 'Falta de Treinamento' || atd.clientePoderiaExecutar === 'Sim') {
        item.treinamentoCount += 1;
      }
      if (atd.necessitouApoioInterno === 'Sim') {
        item.escalamentosCount += 1;
      }

      const mod = atd.modulo || 'Geral';
      item.modulos[mod] = (item.modulos[mod] || 0) + 1;

      const ass = atd.assunto || 'Atendimento Geral';
      item.assuntos[ass] = (item.assuntos[ass] || 0) + 1;
    });

    return Object.values(map)
      .map((item) => {
        let topModulo = 'Geral';
        let maxMod = 0;
        Object.entries(item.modulos).forEach(([m, count]) => {
          if (count > maxMod) {
            maxMod = count;
            topModulo = m;
          }
        });

        const duvidasETreinamentos = item.duvidasCount + item.treinamentoCount;
        const ratioDependencia = duvidasETreinamentos / (item.total || 1);

        let perfil: 'autonomo' | 'moderado' | 'alta_dependencia' = 'autonomo';
        if (item.total > 2) {
          if (ratioDependencia > 0.45 || item.escalamentosCount / item.total > 0.35) {
            perfil = 'alta_dependencia';
          } else if (ratioDependencia > 0.25 || item.escalamentosCount / item.total > 0.15) {
            perfil = 'moderado';
          }
        }

        return {
          ...item,
          topModulo,
          duvidasETreinamentos,
          percentDependencia: Math.round(ratioDependencia * 100),
          perfil
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [filteredAtendimentos]);

  // 3. TIPOS DE DEMANDA (BUGS X MELHORIAS X DÚVIDAS X TREINAMENTO X CONFIGURAÇÃO X APOIO)
  const tiposDemandaData = useMemo(() => {
    const counts: Record<string, { total: number; atendimentos: AtendimentoItem[] }> = {
      '❓ Dúvida Operacional': { total: 0, atendimentos: [] },
      '🐛 Bug / Erro': { total: 0, atendimentos: [] },
      '🎓 Treinamento / Capacitação': { total: 0, atendimentos: [] },
      '🔧 Configuração / Parâmetros': { total: 0, atendimentos: [] },
      '🆘 Apoio Interno / Escalação': { total: 0, atendimentos: [] },
      '💡 Solicitação de Melhoria': { total: 0, atendimentos: [] }
    };

    filteredAtendimentos.forEach((atd) => {
      const tipo = getAtendimentoTipoDemanda(atd);
      if (!counts[tipo]) {
        counts[tipo] = { total: 0, atendimentos: [] };
      }
      counts[tipo].total += 1;
      counts[tipo].atendimentos.push(atd);
    });

    const totalFiltered = filteredAtendimentos.length || 1;
    const list = Object.entries(counts).map(([name, data]) => ({
      name,
      value: data.total,
      percent: Math.round((data.total / totalFiltered) * 100),
      atendimentos: data.atendimentos
    }));

    const duvidasEPedagogico = (counts['❓ Dúvida Operacional'].total + counts['🎓 Treinamento / Capacitação'].total);
    const bugsEErros = counts['🐛 Bug / Erro'].total;

    let insight = '';
    if (duvidasEPedagogico > bugsEErros) {
      insight = `Maior parte da demanda (${Math.round((duvidasEPedagogico / totalFiltered) * 100)}%) vem de Dúvidas e Treinamento. O sistema possui boa estabilidade de código, mas a UX/Documentação requer simplificação.`;
    } else if (bugsEErros > 0) {
      insight = `Gargalo técnico identificado (${Math.round((bugsEErros / totalFiltered) * 100)}% de bugs/erros). Priorizar refatoração e correções nos próximos sprints.`;
    } else {
      insight = 'Demanda distribuída equilibradamente entre módulos e serviços.';
    }

    return {
      list,
      duvidasEPedagogico,
      bugsEErros,
      insight
    };
  }, [filteredAtendimentos]);

  // 4. MATRIZ CLIENTE × MÓDULO (INTERATIVA)
  const matrizClienteModuloData = useMemo(() => {
    // Unique list of clients in current filtered scope
    const clientList: { id: string; nome: string }[] = [];
    const clientSet = new Set<string>();

    filteredAtendimentos.forEach((atd) => {
      const id = atd.clienteId || atd.clienteNome || 'Cliente Geral';
      const nome = atd.clienteNome || 'Cliente Geral';
      if (!clientSet.has(id)) {
        clientSet.add(id);
        clientList.push({ id, nome });
      }
    });

    // Populate Matrix Cell [clientId][moduloName] = AtendimentoItem[]
    const grid: Record<string, Record<string, AtendimentoItem[]>> = {};

    clientList.forEach((c) => {
      grid[c.id] = {};
      MODULOS_MATRIZ.forEach((m) => {
        grid[c.id][m] = [];
      });
    });

    filteredAtendimentos.forEach((atd) => {
      const cId = atd.clienteId || atd.clienteNome || 'Cliente Geral';
      const mod = atd.modulo || 'Outros / Geral';

      // Find matching modulo in MODULOS_MATRIZ or fallback to Outros
      let matchedModulo = MODULOS_MATRIZ.find((m) => m.toLowerCase().includes((mod || '').toLowerCase())) || 'Outros / Geral';

      if (grid[cId] && grid[cId][matchedModulo]) {
        grid[cId][matchedModulo].push(atd);
      }
    });

    return {
      clientList,
      grid
    };
  }, [filteredAtendimentos]);

  // Client Ranking
  const clientRankings = useMemo(() => {
    return clienteDependenciaData;
  }, [clienteDependenciaData]);

  // Support requiring internal assistance (Cross-functional)
  const apoioInternoList = useMemo(() => {
    return filteredAtendimentos.filter((a) => a.necessitouApoioInterno === 'Sim');
  }, [filteredAtendimentos]);

  const apoioPorSetor = useMemo(() => {
    const sectors: Record<string, number> = {};
    apoioInternoList.forEach((a) => {
      const setor = a.origemApoio || 'Não Especificado';
      sectors[setor] = (sectors[setor] || 0) + 1;
    });

    return Object.entries(sectors).map(([name, value]) => ({ name, value }));
  }, [apoioInternoList]);

  // Support due to customer training gaps
  const capacitacaoList = useMemo(() => {
    return filteredAtendimentos.filter((a) => a.clientePoderiaExecutar === 'Sim');
  }, [filteredAtendimentos]);

  const motivosCapacitacaoData = useMemo(() => {
    const motivos: Record<string, number> = {};
    capacitacaoList.forEach((a) => {
      const m = a.motivoProcedimento || 'Falta de Treinamento Inicial';
      motivos[m] = (motivos[m] || 0) + 1;
    });

    return Object.entries(motivos).map(([name, value]) => ({ name, value }));
  }, [capacitacaoList]);

  // Module friction analysis
  const moduloFrictionData = useMemo(() => {
    const map: Record<
      string,
      {
        modulo: string;
        total: number;
        duvidasCount: number;
        bugsCount: number;
        apoioCount: number;
        capacitacaoCount: number;
      }
    > = {};

    filteredAtendimentos.forEach((a) => {
      const mod = a.modulo || 'Outros / Não Identificado';
      if (!map[mod]) {
        map[mod] = {
          modulo: mod,
          total: 0,
          duvidasCount: 0,
          bugsCount: 0,
          apoioCount: 0,
          capacitacaoCount: 0
        };
      }

      map[mod].total += 1;
      if (a.categoria === 'Dúvida Operacional' || a.categoria === 'Treinamento') {
        map[mod].duvidasCount += 1;
      }
      if (a.categoria === 'Bug / Erro' || a.categoria === 'Sistema Parado') {
        map[mod].bugsCount += 1;
      }
      if (a.necessitouApoioInterno === 'Sim') {
        map[mod].apoioCount += 1;
      }
      if (a.clientePoderiaExecutar === 'Sim') {
        map[mod].capacitacaoCount += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredAtendimentos]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Product Management Context */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Relatórios e Indicadores de Product Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Causa raiz dos chamados, dependência por cliente, matriz cliente × módulo e inteligência de produto.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Print */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-extrabold pr-2 border-r border-slate-200 dark:border-slate-800">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Filtros do Relatório:</span>
          </div>

          {/* Período Select Dropdown com estilização limpa */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <select
              value={periodoFilter}
              onChange={(e) => setPeriodoFilter(e.target.value as PeriodoType)}
              className="bg-transparent text-slate-900 dark:text-slate-100 font-bold outline-none cursor-pointer text-xs"
            >
              <option value="todos" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Todo o Histórico
              </option>
              <option value="mes_atual" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Mês Atual
              </option>
              <option value="mes_especifico" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Mês / Ano Específico...
              </option>
              <option value="personalizado" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Intervalo Personalizado (De/Até)...
              </option>
              <option value="30_dias" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Últimos 30 Dias
              </option>
              <option value="90_dias" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Últimos 90 Dias
              </option>
              <option value="ano_atual" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Ano Atual
              </option>
            </select>
          </div>

          {/* Cliente Select */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700">
            <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-slate-100 font-bold outline-none cursor-pointer max-w-[180px] truncate text-xs"
            >
              <option value="todos" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Todos os Clientes
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {c.nomeFantasia || c.razaoSocial}
                </option>
              ))}
            </select>
          </div>

          {/* Módulo Select */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700">
            <Boxes className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <select
              value={selectedModuloFilter}
              onChange={(e) => setSelectedModuloFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-slate-100 font-bold outline-none cursor-pointer max-w-[180px] truncate text-xs"
            >
              <option value="todos" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Todos os Módulos
              </option>
              <option value="Faturamento / NF-e" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Faturamento / NF-e
              </option>
              <option value="NFC-e / Ponto de Venda" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                NFC-e / Ponto de Venda
              </option>
              <option value="Financeiro / Contas" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Financeiro / Contas
              </option>
              <option value="Estoque / Compras" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Estoque / Compras
              </option>
              <option value="MDF-e / Transporte" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                MDF-e / Transporte
              </option>
              <option value="SPED / Fiscal" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                SPED / Fiscal
              </option>
              <option value="Configurações e Rede" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                Configurações e Rede
              </option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700">
            <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por termo, código, assunto..."
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 font-medium outline-none placeholder:text-slate-400 text-xs"
            />
          </div>

          {(selectedClientFilter !== 'todos' ||
            selectedModuloFilter !== 'todos' ||
            periodoFilter !== 'todos' ||
            searchTerm) && (
            <button
              onClick={() => {
                setSelectedClientFilter('todos');
                setSelectedModuloFilter('todos');
                setPeriodoFilter('todos');
                setSearchTerm('');
                setStartDate('');
                setEndDate('');
              }}
              className="px-3 py-2 text-xs text-rose-600 dark:text-rose-400 font-extrabold hover:underline cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Dynamic Extra Period Inputs when Específico or Personalizado */}
        {periodoFilter === 'mes_especifico' && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs animate-in fade-in duration-200">
            <span className="font-extrabold text-slate-700 dark:text-slate-300">Selecione o Mês e Ano:</span>
            <input
              type="month"
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold outline-none cursor-pointer"
            />
            <span className="text-slate-500 text-[11px]">
              Exibindo chamados ocorridos no mês de {selectedMonthYear}
            </span>
          </div>
        )}

        {periodoFilter === 'personalizado' && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-700 dark:text-slate-300">Data Inicial:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-700 dark:text-slate-300">Data Final:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold outline-none cursor-pointer"
              />
            </div>
            <span className="text-slate-500 text-[11px]">
              Intervalo configurado de {startDate || 'início'} até {endDate || 'hoje'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('daily_report')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'daily_report'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Daily Report</span>
        </button>

        <button
          onClick={() => setActiveTab('visao_geral')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'visao_geral'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visão Geral PM</span>
        </button>

        <button
          onClick={() => setActiveTab('causa_raiz')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'causa_raiz'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Análise de Causa / Origem</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            {causaAnalysis.list.length} tipos
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dependencia_clientes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'dependencia_clientes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Perfil de Dependência</span>
        </button>

        <button
          onClick={() => setActiveTab('tipos_demanda')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tipos_demanda'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bug className="w-4 h-4" />
          <span>Bugs × Melhorias × Dúvidas</span>
        </button>

        <button
          onClick={() => setActiveTab('matriz_cliente_modulo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'matriz_cliente_modulo'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Matriz Cliente × Módulo</span>
        </button>

        <button
          onClick={() => setActiveTab('clientes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'clientes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Top Demanda</span>
        </button>

        <button
          onClick={() => setActiveTab('apoio_interno')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'apoio_interno'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Apoio Intersetorial</span>
        </button>

        <button
          onClick={() => setActiveTab('capacitacao')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'capacitacao'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Treinamento</span>
        </button>

        <button
          onClick={() => setActiveTab('modulos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'modulos'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Fricção</span>
        </button>
      </div>

      {/* TAB 0: DAILY REPORT */}
      {activeTab === 'daily_report' && (
        <div className="space-y-6">
          {/* Header & Date Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Daily Report — Resumo Diário
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Atividades, registros, bugs e cadastros realizados no sistema na data selecionada.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 1);
                  setDailyReportDate(d.toISOString().split('T')[0]);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dailyReportDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Ontem
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  setDailyReportDate(d.toISOString().split('T')[0]);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dailyReportDate === new Date().toISOString().split('T')[0]
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Hoje
              </button>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dailyReportDate}
                  onChange={(e) => setDailyReportDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Atividades Totais</span>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {dailyReportActivities.length}
              </div>
              <p className="text-[11px] text-slate-500">Registradas em {dailyReportDate}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Atendimentos</span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Headphones className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {dailyReportActivities.filter((a) => a.type === 'atendimento').length}
              </div>
              <p className="text-[11px] text-slate-500">Chamados e suporte</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Registros & Bugs</span>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <Bug className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {dailyReportActivities.filter((a) => a.type === 'registro').length}
              </div>
              <p className="text-[11px] text-slate-500">Demandas e correções</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Conhecimento & Clientes</span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {dailyReportActivities.filter((a) => a.type === 'artigo' || a.type === 'video' || a.type === 'cliente').length}
              </div>
              <p className="text-[11px] text-slate-500">Artigos, vídeos e novos clientes</p>
            </div>
          </div>

          {/* Activities Stream / List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Linha do Tempo de Atividades ({dailyReportActivities.length})
              </h4>
              <span className="text-xs text-slate-400 font-mono">Data: {dailyReportDate}</span>
            </div>

            {dailyReportActivities.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma atividade encontrada neste dia</h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Não há registros, atendimentos ou publicações para a data selecionada ({dailyReportDate}). Tente selecionar outra data.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyReportActivities.map((act) => {
                  const badgeColor =
                    act.type === 'atendimento'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200'
                      : act.type === 'registro'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200'
                      : act.type === 'video'
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200'
                      : act.type === 'artigo'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200';

                  return (
                    <div
                      key={act.id}
                      onClick={() => setSelectedDailyActivityDrawer(act)}
                      className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className={`p-2.5 rounded-xl border flex-shrink-0 ${badgeColor}`}>
                          {act.type === 'atendimento' && <Headphones className="w-4 h-4" />}
                          {act.type === 'registro' && <Bug className="w-4 h-4" />}
                          {act.type === 'video' && <BookOpen className="w-4 h-4" />}
                          {act.type === 'artigo' && <FileText className="w-4 h-4" />}
                          {act.type === 'cliente' && <Users className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                              {act.codigo}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {act.titulo}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {act.subtitulo}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {act.status && (
                          <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            {act.status}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: VISÃO GERAL PM */}
      {activeTab === 'visao_geral' && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total de Chamados</span>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                  <Headphones className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.concluidosPercent}% resolvidos
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Atendimentos registrados no filtro selecionado</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Passível de Capacitação</span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.capacitacaoCount}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.capacitacaoPercent}% do total
                </span>
              </div>
              <p className="text-[11px] text-slate-500">O cliente executaria com treinamento/artigo</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Apoio Intersetorial</span>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                  <GitPullRequest className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.apoioCount}</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {stats.apoioPercent}% do total
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Precisaram de auxílio do Nível 2 / Dev / Infra</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Módulo com Maior Fricção</span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                  <Boxes className="w-4 h-4" />
                </div>
              </div>
              <div className="truncate">
                <span className="text-base font-black text-slate-900 dark:text-white truncate block">{stats.topModulo}</span>
              </div>
              <p className="text-[11px] text-slate-500">Módulo mais acionado em suporte</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Apoio Interno por Setor */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-amber-500" />
                    Solicitações de Apoio por Setor Interno
                  </h3>
                  <p className="text-xs text-slate-500">Origem do suporte especializado acionado pelo Nível 1</p>
                </div>
              </div>
              {apoioPorSetor.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={apoioPorSetor} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Chamados" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                  <span>Nenhum chamado exigiu apoio intersetorial no período.</span>
                </div>
              )}
            </div>

            {/* Chart 2: Distribuicao das Causas */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-indigo-500" />
                    Distribuição da Causa dos Atendimentos
                  </h3>
                  <p className="text-xs text-slate-500">Identificação de por que o suporte foi acionado</p>
                </div>
              </div>
              {causaAnalysis.chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={causaAnalysis.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {causaAnalysis.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <span>Sem dados para o filtro selecionado.</span>
                </div>
              )}
            </div>
          </div>

          {/* Highlights & Top Friction Table Summary */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Clientes que Mais Demandam Suporte (Top 5)
                </h3>
                <p className="text-xs text-slate-500">Mapeamento de clientes com maior volume de chamados</p>
              </div>
              <button
                onClick={() => setActiveTab('clientes')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver ranking completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Posição</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3 text-center">Total Chamados</th>
                    <th className="p-3 text-center">Perfil Dependência</th>
                    <th className="p-3">Módulo Mais Solicitado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {clientRankings.slice(0, 5).map((item, idx) => (
                    <tr
                      key={item.clienteId}
                      className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 transition cursor-pointer"
                      onClick={() => {
                        setSelectedGroupDrawer({
                          titulo: `Chamados de ${item.nome}`,
                          subtitulo: `Total de ${item.total} atendimentos registrados para este cliente`,
                          atendimentos: item.atendimentos
                        });
                      }}
                    >
                      <td className="p-3 font-extrabold text-slate-400">#{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{item.nome}</span>
                        <Eye className="w-3.5 h-3.5 text-indigo-500 opacity-60" />
                      </td>
                      <td className="p-3 text-center font-extrabold text-indigo-600 dark:text-indigo-400">{item.total}</td>
                      <td className="p-3 text-center font-bold">
                        {item.perfil === 'autonomo' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px]">
                            🟢 Autônomo
                          </span>
                        )}
                        {item.perfil === 'moderado' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px]">
                            🟡 Moderado
                          </span>
                        )}
                        {item.perfil === 'alta_dependencia' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[11px]">
                            🔴 Alta Dependência
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{item.topModulo}</td>
                    </tr>
                  ))}
                  {clientRankings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">Nenhum cliente registrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANÁLISE DE CAUSA DOS ATENDIMENTOS ("POR QUE ACONTECEU?") */}
      {activeTab === 'causa_raiz' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Análise de Causa / Origem do Suporte ("Por que o atendimento aconteceu?")
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Classificação da origem raiz para identificar onde está a causa real da demanda (dúvida, bug, falta de treinamento, parâmetro fiscal, infraestrutura).
              </p>
            </div>

            {/* Grid de Causas com Porcentagem e Quantidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {causaAnalysis.list.map((c, idx) => (
                <div
                  key={c.causa}
                  onClick={() => {
                    setSelectedGroupDrawer({
                      titulo: `Atendimentos por Causa: ${c.causa}`,
                      subtitulo: `${c.total} atendimentos (${c.percent}% do total analisado)`,
                      atendimentos: c.atendimentos
                    });
                  }}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {c.causa}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px]">
                      {c.percent}%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{c.total}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 group-hover:underline">
                      <Eye className="w-3.5 h-3.5 text-indigo-500" />
                      Ver todos
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela de Causas */}
            <div className="pt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Causa Raiz Identificada</th>
                    <th className="p-3.5 text-center">Volume Total</th>
                    <th className="p-3.5 text-center">% do Período</th>
                    <th className="p-3.5 text-center">Ação do Relatório</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {causaAnalysis.list.map((item) => (
                    <tr
                      key={item.causa}
                      onClick={() => {
                        setSelectedGroupDrawer({
                          titulo: `Atendimentos por Causa: ${item.causa}`,
                          subtitulo: `${item.total} atendimentos (${item.percent}% do total)`,
                          atendimentos: item.atendimentos
                        });
                      }}
                      className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/80 transition cursor-pointer"
                    >
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">{item.causa}</td>
                      <td className="p-3.5 text-center font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        {item.total}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                        {item.percent}%
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg text-[11px] inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver {item.total} Eventos</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERFIL DE DEPENDÊNCIA POR CLIENTE (VOLUME VS DEPENDÊNCIA REAL) */}
      {activeTab === 'dependencia_clientes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                Perfil de Dependência do Cliente (Volume ≠ Dependência)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Diferencia clientes com alto uso do sistema daqueles com dúvidas repetidas e baixa autonomia.
              </p>
            </div>

            {/* Badges explicativos do Perfil */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block">
                  🟢 Autônomo
                </span>
                <p className="text-[11px] text-emerald-950 dark:text-emerald-200">
                  Acessa suporte para casos esporádicos ou avançados. Baixa taxa de dúvidas simples.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
                <span className="text-xs font-black text-amber-800 dark:text-amber-300 block">
                  🟡 Dependência Moderada
                </span>
                <p className="text-[11px] text-amber-950 dark:text-amber-200">
                  Apresenta dúvidas frequentes em determinados módulos ou trocas recentes de equipe.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1">
                <span className="text-xs font-black text-rose-800 dark:text-rose-300 block">
                  🔴 Alta Dependência
                </span>
                <p className="text-[11px] text-rose-950 dark:text-rose-200">
                  Alto índice de dúvidas recorrentes e chamados passíveis de treinamento. Exige reciclagem na KB.
                </p>
              </div>
            </div>

            {/* Tabela do Perfil de Dependência */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5 text-center">Volume Total</th>
                    <th className="p-3.5 text-center">Dúvidas / Treinamento</th>
                    <th className="p-3.5 text-center">Escalamentos N2/Dev</th>
                    <th className="p-3.5 text-center">Perfil de Autonomia</th>
                    <th className="p-3.5">Módulo Mais Utilizado</th>
                    <th className="p-3.5 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {clienteDependenciaData.map((item) => (
                    <tr
                      key={item.clienteId}
                      onClick={() => {
                        setSelectedGroupDrawer({
                          titulo: `Análise do Cliente: ${item.nome}`,
                          subtitulo: `Histórico completo de ${item.total} atendimentos no período`,
                          atendimentos: item.atendimentos
                        });
                      }}
                      className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/80 transition cursor-pointer"
                    >
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{item.nome}</td>
                      <td className="p-3.5 text-center font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        {item.total}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                        {item.duvidasETreinamentos} ({item.percentDependencia}%)
                      </td>
                      <td className="p-3.5 text-center font-bold text-amber-600 dark:text-amber-400">
                        {item.escalamentosCount}
                      </td>
                      <td className="p-3.5 text-center">
                        {item.perfil === 'autonomo' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black">
                            🟢 Autônomo
                          </span>
                        )}
                        {item.perfil === 'moderado' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black">
                            🟡 Moderado
                          </span>
                        )}
                        {item.perfil === 'alta_dependencia' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-black">
                            🔴 Alta Dependência
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-medium">{item.topModulo}</td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold"
                        >
                          Ver Registros
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BUGS X MELHORIAS X DÚVIDAS (INTELIGÊNCIA DE PRODUTO) */}
      {activeTab === 'tipos_demanda' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Bug className="w-5 h-5 text-indigo-600" />
                Inteligência de Produto: Bugs × Melhorias × Dúvidas Operacionais
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Validação de produto: Diferenciar se o suporte está sobrecarregado por falhas técnicas de código ou por falta de instrução do usuário.
              </p>
            </div>

            {/* Strategic Insight Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                  Diagnóstico do Time de Produto:
                </h4>
                <p className="text-xs text-indigo-900 dark:text-indigo-300 font-medium mt-1 leading-relaxed">
                  {tiposDemandaData.insight}
                </p>
              </div>
            </div>

            {/* Grid de Tipos de Demanda */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {tiposDemandaData.list.map((td) => (
                <div
                  key={td.name}
                  onClick={() => {
                    setSelectedGroupDrawer({
                      titulo: `Demandas: ${td.name}`,
                      subtitulo: `${td.value} chamados (${td.percent}% da demanda total)`,
                      atendimentos: td.atendimentos
                    });
                  }}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                      {td.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-[11px]">
                      {td.percent}%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{td.value}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 group-hover:underline">
                      <Eye className="w-3.5 h-3.5 text-indigo-500" />
                      Ver lista
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MATRIZ CLIENTE × MÓDULO (INTERATIVA) */}
      {activeTab === 'matriz_cliente_modulo' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Grid className="w-5 h-5 text-indigo-600" />
                Matriz Interativa: Cliente × Módulo do Sistema
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Clique em qualquer célula com numeração para abrir o painel lateral com todos os atendimentos daquela combinação específica.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase">
                  <tr>
                    <th className="p-3 border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-100 dark:bg-slate-800 min-w-[180px]">
                      Cliente
                    </th>
                    {MODULOS_MATRIZ.map((mod) => (
                      <th
                        key={mod}
                        className="p-3 border-b border-r border-slate-200 dark:border-slate-700 text-center min-w-[110px]"
                      >
                        {mod.split('/')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {matrizClienteModuloData.clientList.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-bold border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 truncate max-w-[200px]">
                        {client.nome}
                      </td>
                      {MODULOS_MATRIZ.map((mod) => {
                        const list = matrizClienteModuloData.grid[client.id]?.[mod] || [];
                        const count = list.length;
                        return (
                          <td
                            key={mod}
                            className="p-2 border-r border-slate-200 dark:border-slate-800 text-center"
                          >
                            {count > 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedGroupDrawer({
                                    titulo: `${client.nome} — ${mod}`,
                                    subtitulo: `${count} atendimento(s) neste módulo`,
                                    atendimentos: list
                                  });
                                }}
                                className="px-3 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black hover:bg-indigo-600 hover:text-white transition cursor-pointer text-xs"
                              >
                                {count}
                              </button>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700 font-medium">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {matrizClienteModuloData.clientList.length === 0 && (
                    <tr>
                      <td colSpan={MODULOS_MATRIZ.length + 1} className="p-8 text-center text-slate-400">
                        Nenhum registro encontrado para a matriz.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RANKING DE CLIENTES */}
      {activeTab === 'clientes' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Ranking de Clientes por Volume de Chamados
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Clique em qualquer cliente para visualizar seu painel de chamados.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-bold">
              Total de Clientes Analisados: <span className="text-indigo-600 font-black">{clientRankings.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5 text-center">Total Chamados</th>
                  <th className="p-3.5 text-center">Treinamento Necessário</th>
                  <th className="p-3.5 text-center">Apoio Interno</th>
                  <th className="p-3.5">Módulo Frequente</th>
                  <th className="p-3.5 text-center">Perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {clientRankings.map((item, idx) => (
                  <tr
                    key={item.clienteId}
                    className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/80 transition cursor-pointer"
                    onClick={() => {
                      setSelectedGroupDrawer({
                        titulo: `Atendimentos de ${item.nome}`,
                        subtitulo: `${item.total} atendimentos registrados`,
                        atendimentos: item.atendimentos
                      });
                    }}
                  >
                    <td className="p-3.5 font-black text-slate-400">#{idx + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{item.nome}</td>
                    <td className="p-3.5 text-center font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                      {item.total}
                    </td>
                    <td className="p-3.5 text-center font-bold text-emerald-600">
                      {item.treinamentoCount}
                    </td>
                    <td className="p-3.5 text-center font-bold text-amber-600">
                      {item.escalamentosCount}
                    </td>
                    <td className="p-3.5 font-medium">{item.topModulo}</td>
                    <td className="p-3.5 text-center">
                      {item.perfil === 'autonomo' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                          🟢 Autônomo
                        </span>
                      )}
                      {item.perfil === 'moderado' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black">
                          🟡 Moderado
                        </span>
                      )}
                      {item.perfil === 'alta_dependencia' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black">
                          🔴 Alta Dependência
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: APOIO INTERSETORIAL */}
      {activeTab === 'apoio_interno' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitPullRequest className="w-5 h-5 text-amber-500" />
                  Atendimentos que Exigiram Apoio Intersetorial
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clique em qualquer linha ou botão para abrir o painel lateral com todos os detalhes.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-extrabold text-xs">
                {apoioInternoList.length} chamados com escalação
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Código</th>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Assunto</th>
                    <th className="p-3.5">Setor Solicitado</th>
                    <th className="p-3.5">Tipo do Apoio</th>
                    <th className="p-3.5">Responsável</th>
                    <th className="p-3.5 text-center">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {apoioInternoList.map((atd) => (
                    <tr
                      key={atd.id}
                      onClick={() => setSelectedAtendimentoForDrawer(atd)}
                      className="hover:bg-amber-50/40 dark:hover:bg-slate-800/80 transition cursor-pointer"
                    >
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{atd.codigo}</td>
                      <td className="p-3.5 font-bold">{atd.clienteNome || 'Geral'}</td>
                      <td className="p-3.5 font-medium max-w-xs truncate">{atd.assunto}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-extrabold">
                          {atd.origemApoio || 'Geral'}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">{atd.tipoApoio || 'Suporte Técnico Especializado'}</td>
                      <td className="p-3.5 font-medium text-slate-600 dark:text-slate-400">{atd.responsavel}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAtendimentoForDrawer(atd);
                          }}
                          className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold rounded-lg transition text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {apoioInternoList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Nenhum chamado exigiu apoio de outros setores no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: TREINAMENTO DO CLIENTE */}
      {activeTab === 'capacitacao' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                  Oportunidades de Capacitação & Autonomia do Cliente
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clique em qualquer chamado para visualizar as informações completas.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                {capacitacaoList.length} oportunidades de treinamento
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Código</th>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Assunto</th>
                    <th className="p-3.5">Motivo do Procedimento</th>
                    <th className="p-3.5">Módulo</th>
                    <th className="p-3.5 text-center">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {capacitacaoList.map((atd) => (
                    <tr
                      key={atd.id}
                      onClick={() => setSelectedAtendimentoForDrawer(atd)}
                      className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 transition cursor-pointer"
                    >
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{atd.codigo}</td>
                      <td className="p-3.5 font-bold">{atd.clienteNome || 'Geral'}</td>
                      <td className="p-3.5 font-medium max-w-xs truncate">{atd.assunto}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-extrabold">
                          {atd.motivoProcedimento || 'Falta de Treinamento'}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600 dark:text-slate-400">{atd.modulo || 'Geral'}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAtendimentoForDrawer(atd);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg transition text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {capacitacaoList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Nenhum atendimento marcado como passível de treinamento no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: FRICÇÃO POR MÓDULO */}
      {activeTab === 'modulos' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-purple-600" />
              Análise de Fricção por Módulo do Produto
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Utilize estes dados para priorizar correções de bugs, refatoração de UX e novos artigos da Base de Conhecimento.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Módulo</th>
                  <th className="p-3.5 text-center">Total de Solicitações</th>
                  <th className="p-3.5 text-center">Dúvidas Operacionais</th>
                  <th className="p-3.5 text-center">Bugs / Erros de Sistema</th>
                  <th className="p-3.5 text-center">Demandou Apoio Interno</th>
                  <th className="p-3.5 text-center">Oportunidade de Treinamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {moduloFrictionData.map((item) => (
                  <tr
                    key={item.modulo}
                    className="hover:bg-purple-50/40 dark:hover:bg-slate-800/80 transition cursor-pointer"
                    onClick={() => {
                      setSelectedModuloFilter(item.modulo);
                    }}
                  >
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{item.modulo}</span>
                      <Filter className="w-3 h-3 text-purple-500 opacity-60" />
                    </td>
                    <td className="p-3.5 text-center font-black text-indigo-600 dark:text-indigo-400 text-sm">
                      {item.total}
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-600 dark:text-slate-300">
                      {item.duvidasCount}
                    </td>
                    <td className="p-3.5 text-center font-bold text-rose-600 dark:text-rose-400">
                      {item.bugsCount}
                    </td>
                    <td className="p-3.5 text-center font-bold text-amber-600 dark:text-amber-400">
                      {item.apoioCount}
                    </td>
                    <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {item.capacitacaoCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RIGHT DRAWER 1: LISTA DE EVENTOS DO GRUPO SELECIONADO (EX: MATRIZ / CAUSA RAIZ) */}
      {selectedGroupDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedGroupDrawer.titulo}
                </h3>
                <p className="text-xs text-slate-500">{selectedGroupDrawer.subtitulo}</p>
              </div>
              <button
                onClick={() => setSelectedGroupDrawer(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 p-6 overflow-y-auto space-y-3">
              {selectedGroupDrawer.atendimentos.map((atd) => (
                <div
                  key={atd.id}
                  onClick={() => setSelectedAtendimentoForDrawer(atd)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {atd.codigo}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {atd.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{atd.assunto}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span>Cliente: {atd.clienteNome || 'Geral'}</span>
                    <span className="flex items-center gap-1 font-bold text-indigo-600 hover:underline">
                      <Eye className="w-3 h-3" /> Ver Detalhes
                    </span>
                  </div>
                </div>
              ))}
              {selectedGroupDrawer.atendimentos.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum atendimento associado a este grupo.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedGroupDrawer(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Fechar Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT DRAWER 2: DETALHES COMPLETOS DO REGISTRO / EVENTO SELECIONADO */}
      {selectedAtendimentoForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-black text-sm">
                  {selectedAtendimentoForDrawer.codigo}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Detalhes do Atendimento
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cliente: <strong className="text-slate-800 dark:text-slate-200">{selectedAtendimentoForDrawer.clienteNome || 'Geral'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAtendimentoForDrawer(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body with all Event Information */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Badges / Header Metadata */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    selectedAtendimentoForDrawer.status === 'Resolvido' || selectedAtendimentoForDrawer.status === 'Concluído'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                      : selectedAtendimentoForDrawer.status === 'Em Andamento'
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {selectedAtendimentoForDrawer.status}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {selectedAtendimentoForDrawer.categoria || 'Geral'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Prioridade: {selectedAtendimentoForDrawer.prioridade || 'Normal'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Causa: {getAtendimentoCausa(selectedAtendimentoForDrawer)}
                </span>
              </div>

              {/* Assunto & Descrição */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {selectedAtendimentoForDrawer.assunto}
                </h4>
                {selectedAtendimentoForDrawer.descricao && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedAtendimentoForDrawer.descricao}
                  </p>
                )}
              </div>

              {/* Informações de Módulo e Solução */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Módulo / Sistema
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedAtendimentoForDrawer.modulo || 'Não informado'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Atendente Responsável
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedAtendimentoForDrawer.responsavel || 'Equipe de Suporte'}
                  </p>
                </div>
              </div>

              {/* Solução Aplicada */}
              {selectedAtendimentoForDrawer.solucaoAplicada && (
                <div className="space-y-1.5 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60">
                  <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Solução Aplicada
                  </span>
                  <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                    {selectedAtendimentoForDrawer.solucaoAplicada}
                  </p>
                </div>
              )}

              {/* Indicadores do Produto (PM) */}
              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Métricas de Product Management:
                </h5>

                {/* Apoio Interno */}
                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <GitPullRequest className="w-4 h-4 text-amber-500" />
                      Necessitou de Apoio Intersetorial?
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        selectedAtendimentoForDrawer.necessitouApoioInterno === 'Sim'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {selectedAtendimentoForDrawer.necessitouApoioInterno || 'Não'}
                    </span>
                  </div>
                  {selectedAtendimentoForDrawer.necessitouApoioInterno === 'Sim' && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <p>
                        <strong>Setor de Apoio:</strong> {selectedAtendimentoForDrawer.origemApoio || 'Não informado'}
                      </p>
                      <p>
                        <strong>Tipo do Apoio:</strong> {selectedAtendimentoForDrawer.tipoApoio || 'Técnico / Dev'}
                      </p>
                      {selectedAtendimentoForDrawer.motivoApoioInterno && (
                        <p>
                          <strong>Motivo do Apoio:</strong> {selectedAtendimentoForDrawer.motivoApoioInterno}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Capacitação do Cliente */}
                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      O cliente poderia ter executado o procedimento?
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        selectedAtendimentoForDrawer.clientePoderiaExecutar === 'Sim'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {selectedAtendimentoForDrawer.clientePoderiaExecutar || 'Não'}
                    </span>
                  </div>
                  {selectedAtendimentoForDrawer.clientePoderiaExecutar === 'Sim' && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <p>
                        <strong>Motivo do Procedimento:</strong>{' '}
                        {selectedAtendimentoForDrawer.motivoProcedimento || 'Treinamento/KB'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Datas */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Abertura: {selectedAtendimentoForDrawer.dataAbertura || 'Indefinida'}</span>
                {selectedAtendimentoForDrawer.dataFechamento && (
                  <span>Conclusão: {selectedAtendimentoForDrawer.dataFechamento}</span>
                )}
              </div>
            </div>

            {/* Drawer Footer com Apenas o Botão de Abrir Workspace */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setSelectedAtendimentoForDrawer(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Fechar Painel
              </button>

              {onOpenAtendimentoWorkspace && (
                <button
                  type="button"
                  onClick={() => {
                    const atd = selectedAtendimentoForDrawer;
                    setSelectedAtendimentoForDrawer(null);
                    onOpenAtendimentoWorkspace(atd);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir no Workspace</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT DRAWER: DAILY REPORT ACTIVITY DETAILS */}
      {selectedDailyActivityDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {selectedDailyActivityDrawer.codigo}
                    </span>
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      {selectedDailyActivityDrawer.type}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {selectedDailyActivityDrawer.titulo}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDailyActivityDrawer(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedDailyActivityDrawer.status && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    Status: {selectedDailyActivityDrawer.status}
                  </span>
                )}
                {selectedDailyActivityDrawer.prioridade && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Prioridade: {selectedDailyActivityDrawer.prioridade}
                  </span>
                )}
                {selectedDailyActivityDrawer.autor && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Responsável: {selectedDailyActivityDrawer.autor}
                  </span>
                )}
              </div>

              {/* Details Box */}
              <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Informações Detalhadas</h4>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {selectedDailyActivityDrawer.subtitulo}
                </p>
                {selectedDailyActivityDrawer.rawData?.descricao && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    {selectedDailyActivityDrawer.rawData.descricao}
                  </p>
                )}
                {selectedDailyActivityDrawer.rawData?.conteudo && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <strong>Conteúdo:</strong> {selectedDailyActivityDrawer.rawData.conteudo}
                  </div>
                )}
                {selectedDailyActivityDrawer.rawData?.solucaoAplicada && (
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <strong>Solução Aplicada:</strong> {selectedDailyActivityDrawer.rawData.solucaoAplicada}
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-500 pt-2">
                <span>Data do Evento: {selectedDailyActivityDrawer.dataHora}</span>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setSelectedDailyActivityDrawer(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Fechar Painel
              </button>

              <button
                type="button"
                onClick={() => {
                  const item = selectedDailyActivityDrawer;
                  setSelectedDailyActivityDrawer(null);
                  if (item.type === 'atendimento' && onOpenAtendimentoWorkspace) {
                    onOpenAtendimentoWorkspace(item.rawData);
                  } else if (item.type === 'registro' && onOpenRegistroWorkspace) {
                    onOpenRegistroWorkspace(item.rawData);
                  } else if ((item.type === 'artigo' || item.type === 'video') && onOpenArtigoWorkspace) {
                    onOpenArtigoWorkspace(item.rawData);
                  } else if (item.type === 'cliente' && onOpenClientesModule) {
                    onOpenClientesModule();
                  }
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir no Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
