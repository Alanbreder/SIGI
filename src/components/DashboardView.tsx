import React, { useState, useMemo } from 'react';
import {
  Users,
  Headphones,
  FileCode2,
  BookOpen,
  PlusCircle,
  Clock,
  ChevronRight,
  UserCheck,
  FileText,
  Boxes,
  Wrench,
  AlertTriangle,
  Building2,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ModuleType, User, RecentActivity, DashboardStats, EquipamentoItem, Cliente, SystemCustomization, AtendimentoItem, RegistroItem, ArtigoKBItem } from '../types';
import { mockEquipamentos } from '../data/mockWorkspaceData';
import { SummaryCard } from './SummaryCard';
import { QuickViewModal } from './common/QuickViewModal';

interface DashboardViewProps {
  currentUser: User;
  stats: DashboardStats;
  activities: RecentActivity[];
  atendimentos?: AtendimentoItem[];
  registros?: RegistroItem[];
  artigos?: ArtigoKBItem[];
  onNavigate: (module: ModuleType) => void;
  onOpenQuickAction: (actionType: 'atendimento' | 'registro' | 'cliente' | 'atendimento_fixo') => void;
  clients: Cliente[];
  onOpenEquipmentWorkspace?: (client: Cliente, equipment: EquipamentoItem) => void;
  customization?: SystemCustomization;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  stats,
  activities,
  atendimentos = [],
  registros = [],
  artigos = [],
  onNavigate,
  onOpenQuickAction,
  clients,
  onOpenEquipmentWorkspace,
  customization,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<RecentActivity | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipamentoItem | null>(null);

  // Calculated metrics for Column 2 (Informative & Open Points)
  const metricAtendimentosAbertos = useMemo(() => {
    return atendimentos.filter(a => a.status === 'Aberto' || a.status === 'Em Andamento').length;
  }, [atendimentos]);

  const metricBugsAbertoAnalise = useMemo(() => {
    return registros.filter(r => {
      const isBug = r.tipo === 'Bug';
      const isOpenOrAnalysis = r.status === 'Aberto' || r.status === 'Em Análise';
      return isBug && isOpenOrAnalysis;
    }).length;
  }, [registros]);

  const metricRegistrosAltaUrgente = useMemo(() => {
    return registros.filter(r => {
      return r.prioridade === 'Alta' || r.prioridade === 'Urgente';
    }).length;
  }, [registros]);

  const metricVideosCount = useMemo(() => {
    return artigos.filter(a => a.tipoConteudo === 'video' || a.tipoArtigo === 'Vídeo Aula' || Boolean(a.videoUrl)).length;
  }, [artigos]);

  const metricArtigosCount = useMemo(() => {
    return artigos.length;
  }, [artigos]);

  const metricEmDesenvolvimentoCount = useMemo(() => {
    return registros.filter(r => r.status === 'Em Desenvolvimento' || r.status === 'Em desenvolvimento').length;
  }, [registros]);

  // Filter clients for 'Ativação | Retenção' alerts
  const monitoramentoClientes = useMemo(() => {
    if (!clients || !customization) return [];

    const diasLimite = customization.diasAlertaMonitoramento || 20;
    const hoje = new Date();

    const alertas: { cliente: Cliente; dias: number }[] = [];

    clients.forEach(client => {
      if (!client.dataUltimoStatus) return;

      const dataStatus = new Date(client.dataUltimoStatus);
      const diffTime = Math.abs(hoje.getTime() - dataStatus.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (client.classificacao === 'Ativação | Retenção' && diffDays >= diasLimite) {
        alertas.push({ cliente: client, dias: diffDays });
      }
    });

    return alertas;
  }, [clients, customization]);

  // Filter all equipment currently in maintenance status across all clients
  const equipamentosEmManutencao = useMemo(() => {
    const list: EquipamentoItem[] = [];
    if (!clients) return list;

    clients.forEach((client) => {
      let clientEqs: EquipamentoItem[] = [];
      
      // 1. Try to get from client object if populated
      if (client.equipamentos && Array.isArray(client.equipamentos) && client.equipamentos.length > 0) {
        clientEqs = client.equipamentos;
      } 
      
      // 2. Try to get from localStorage (standard persistence for equipment)
      if (clientEqs.length === 0) {
        const saved = localStorage.getItem(`sip_equipamentos_${client.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) clientEqs = parsed;
          } catch (e) {
            console.error('Failed to parse equipment in dashboard', e);
          }
        }
      }

      // 3. Fallback to mock data ONLY for initial/mock clients, not for newly created ones
      if (clientEqs.length === 0 && !client.id.startsWith('cli-new-')) {
        clientEqs = mockEquipamentos[client.id] || [];
      }

      clientEqs.forEach((eq) => {
        if (eq.status === 'Manutenção') {
          list.push({
            ...eq,
            clienteId: eq.clienteId || client.id,
            clienteNome: eq.clienteNome || client.nomeFantasia || client.razaoSocial
          });
        }
      });
    });

    return list;
  }, [clients]);

  // Calculate dynamic greeting according to the local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'atendimento':
        return <Headphones className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'registro':
        return <FileCode2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'cliente':
        return <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'artigo':
        return <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'inventario':
        return <Boxes className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActivityModule = (type: RecentActivity['type']): ModuleType => {
    switch (type) {
      case 'atendimento':
        return 'atendimentos';
      case 'registro':
        return 'registros';
      case 'cliente':
        return 'clientes';
      case 'artigo':
        return 'base_conhecimento';
      case 'inventario':
        return 'modulos';
      default:
        return 'dashboard';
    }
  };

  const getActivityBg = (type: RecentActivity['type']) => {
    switch (type) {
      case 'atendimento':
        return 'bg-indigo-50 dark:bg-indigo-950/60';
      case 'registro':
        return 'bg-emerald-50 dark:bg-emerald-950/60';
      case 'cliente':
        return 'bg-blue-50 dark:bg-blue-950/60';
      case 'artigo':
        return 'bg-purple-50 dark:bg-purple-950/60';
      case 'inventario':
        return 'bg-amber-50 dark:bg-amber-950/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Mensagem de Boas-vindas */}
      <section className="pt-0.5 pb-1">
        <h1 className="text-xl md:text-2xl font-black text-slate-950 dark:text-slate-100 tracking-tight">
          {getGreeting()}, {currentUser.name}.
        </h1>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
          Bem-vindo ao SIGI — Sistema Integrado de Gestão e Inteligência.
        </p>
      </section>

      {/* 2. Top Sections: Quick Actions (Col 1 / First on Mobile) & General Indicators (Col 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Ações Rápidas */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Ações Rápidas
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Atalhos para criação de registros e chamados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-auto">
            {/* + Novo Atendimento */}
            <button
              onClick={() => onOpenQuickAction('atendimento')}
              type="button"
              className="w-full text-left bg-slate-50/90 hover:bg-indigo-50/90 dark:bg-slate-800/40 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-2xl p-3.5 transition-all duration-150 group flex items-center justify-between cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-tight block truncate">
                    Atendimento
                  </span>
                  <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                    Novo Chamado
                  </div>
                </div>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 transition-colors" />
            </button>

            {/* + Novo Registro */}
            <button
              onClick={() => onOpenQuickAction('registro')}
              type="button"
              className="w-full text-left bg-slate-50/90 hover:bg-emerald-50/90 dark:bg-slate-800/40 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-2xl p-3.5 transition-all duration-150 group flex items-center justify-between cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-tight block truncate">
                    Registro
                  </span>
                  <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                    Nova Ocorrência
                  </div>
                </div>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 transition-colors" />
            </button>

            {/* + Novo Cliente */}
            <button
              onClick={() => onOpenQuickAction('cliente')}
              type="button"
              className="w-full text-left bg-slate-50/90 hover:bg-blue-50/90 dark:bg-slate-800/40 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl p-3.5 transition-all duration-150 group flex items-center justify-between cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-tight block truncate">
                    Cliente
                  </span>
                  <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                    Novo Cadastro
                  </div>
                </div>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 transition-colors" />
            </button>

            {/* + Novo Atendimento Fixo */}
            <button
              onClick={() => onOpenQuickAction('atendimento_fixo')}
              type="button"
              className="w-full text-left bg-slate-50/90 hover:bg-amber-50/90 dark:bg-slate-800/40 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700/60 hover:border-amber-300 dark:hover:border-amber-700 rounded-2xl p-3.5 transition-all duration-150 group flex items-center justify-between cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-tight block truncate">
                    Atendimento Fixo
                  </span>
                  <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                    Registrar Manutenção
                  </div>
                </div>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-amber-600 transition-colors" />
            </button>
          </div>
        </section>

        {/* Column 2: Indicadores Gerais & Pontos Importantes (6 smaller cards, informative) */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Indicadores e Pontos Importantes
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Visão geral e itens críticos em aberto
              </p>
            </div>
            <span className="text-[10px] font-extrabold font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md">
              Informativo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-auto">
            {/* LINHA 1 */}
            {/* 1. Clientes registrados */}
            <div className="bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] leading-tight font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight block">
                  Clientes<br />Registrados
                </span>
                <span className="text-base font-black text-slate-950 dark:text-white mt-0.5 block">
                  {clients.length}
                </span>
              </div>
            </div>

            {/* 2. Atendimentos registrados */}
            <div className="bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex-shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] leading-tight font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight block">
                  Atendimentos<br />Registrados
                </span>
                <span className="text-base font-black text-slate-950 dark:text-white mt-0.5 block">
                  {atendimentos.length}
                </span>
              </div>
            </div>

            {/* 3. Conhecimento (Vídeos e Artigos juntos) */}
            <div className="bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] leading-tight font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight block">
                  Conhecimento
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Vídeos: <strong className="text-slate-950 dark:text-white text-sm">{metricVideosCount}</strong>
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Artigos: <strong className="text-slate-950 dark:text-white text-sm">{metricArtigosCount}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* LINHA 2 */}
            {/* 4. Card Bug (Aberto/Análise) */}
            <div className={`border-2 rounded-2xl p-3 flex items-center gap-2.5 shadow-xs transition-all ${
              metricBugsAbertoAnalise > 0 
                ? 'bg-rose-50 border-rose-400 dark:bg-rose-950/50 dark:border-rose-600 ring-2 ring-rose-400/30' 
                : 'bg-rose-50/60 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/50'
            }`}>
              <div className={`p-2 rounded-xl text-rose-700 dark:bg-rose-900/80 dark:text-rose-300 flex-shrink-0 relative ${
                metricBugsAbertoAnalise > 0 ? 'bg-rose-100 animate-pulse' : 'bg-rose-100/70'
              }`}>
                <AlertTriangle className={`w-4 h-4 ${metricBugsAbertoAnalise > 0 ? 'text-rose-600 dark:text-rose-400 animate-bounce' : ''}`} />
                {metricBugsAbertoAnalise > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] leading-tight font-black text-rose-800 dark:text-rose-300 uppercase tracking-tight block">
                  Bugs<br />(Aberto / Análise)
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-base font-black text-rose-900 dark:text-rose-300 block">
                    {metricBugsAbertoAnalise}
                  </span>
                  {metricBugsAbertoAnalise > 0 && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200 uppercase animate-pulse">
                      Atenção
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Card Registros Alta / Urgente */}
            <div className="bg-amber-50 border-2 border-amber-300/90 dark:bg-amber-950/40 dark:border-amber-700/80 rounded-2xl p-3 flex items-center gap-2.5 shadow-xs">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-300 flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] leading-tight font-black text-amber-900 dark:text-amber-300 uppercase tracking-tight block">
                  Registros<br />Alta / Urgente
                </span>
                <span className="text-base font-black text-amber-950 dark:text-amber-300 mt-0.5 block">
                  {metricRegistrosAltaUrgente}
                </span>
              </div>
            </div>

            {/* 6. Card Em Desenvolvimento */}
            <div className="bg-amber-50 border-2 border-amber-300/90 dark:bg-amber-950/40 dark:border-amber-700/80 rounded-2xl p-3 flex items-center gap-2.5 shadow-xs">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-300 flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] leading-tight font-black text-amber-900 dark:text-amber-300 uppercase tracking-tight block">
                  Registros<br />Em Desenvolvimento
                </span>
                <span className="text-base font-black text-amber-950 dark:text-amber-300 mt-0.5 block">
                  {metricEmDesenvolvimentoCount}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Main Dashboard Content: Activities & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Atividades Recentes */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs h-full flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Atividades Recentes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Últimos acontecimentos registrados
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              {activities.length} eventos
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Nenhuma atividade registrada.
              </p>
            ) : (
              activities.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedActivity(item)}
                  type="button"
                  className="w-full text-left flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200/50 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer group"
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${getActivityBg(item.type)}`}>
                    {getActivityIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 transition-colors self-center flex-shrink-0" />
                </button>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 italic">
              Clique para visualização rápida.
            </p>
          </div>
        </section>

        {/* Right: Monitoramento & Manutenção */}
        <div className="space-y-6 flex flex-col h-full">
          {/* Monitoramento de Clientes (Ativação | Retenção) */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Monitoramento de Clientes
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                    {monitoramentoClientes.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Alerta de tempo em Ativação | Retenção
                </p>
              </div>
              <Info className="w-5 h-5 text-amber-500" />
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
              {monitoramentoClientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 opacity-60">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="text-xs text-slate-400">Nenhum cliente em atraso.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest px-1">
                    Acima de {customization?.diasAlertaMonitoramento} dias
                  </h3>
                  {monitoramentoClientes.map(({ cliente, dias }) => (
                    <div
                      key={`ativ-ret-${cliente.id}`}
                      onClick={() => onNavigate('clientes')}
                      className="flex items-center justify-between p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 hover:border-amber-400 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {cliente.nomeFantasia || cliente.razaoSocial}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {cliente.codigo} • Há {dias} dias nesta classificação
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-amber-700 dark:text-amber-300">
                          {dias}d
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-amber-500 ml-1 inline" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Right: Equipamentos em Manutenção */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                Equipamentos em Manutenção
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                  {equipamentosEmManutencao.length}
                </span>
              </h2>
              <p className="text-xs text-amber-700/70 dark:text-amber-400/70">
                Acompanhamento central de equipamentos
              </p>
            </div>
            <Wrench className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
            {equipamentosEmManutencao.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-60">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                  <AlertTriangle className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-xs text-slate-400">Nenhum equipamento em manutenção.</p>
              </div>
            ) : (
              equipamentosEmManutencao.map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => {
                    if (onOpenEquipmentWorkspace) {
                      const client = clients.find(c => c.id === eq.clienteId);
                      if (client) {
                        onOpenEquipmentWorkspace(client, eq);
                      } else {
                        onNavigate('clientes');
                      }
                    } else {
                      onNavigate('clientes');
                    }
                  }}
                  className="bg-slate-50/50 dark:bg-slate-800/30 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-4 hover:border-amber-400 transition-all cursor-pointer group relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                            {eq.codigo}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                            {eq.nome}
                          </h4>
                        </div>

                        {/* Quick View Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEquipment(eq);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                          title="Visualização Rápida"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">Cliente: <strong>{eq.clienteNome}</strong></span>
                        </p>
                        <div className="grid grid-cols-2 gap-x-2 text-[9px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1 truncate">
                            <span className="font-semibold text-slate-400 uppercase tracking-tight">S/N:</span>
                            <span className="font-mono text-slate-600 dark:text-slate-300 truncate">{eq.numeroSerie}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <span className="font-semibold text-slate-400 uppercase tracking-tight">Tipo:</span>
                            <span className="text-slate-600 dark:text-slate-300 truncate">{eq.tipo}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <span className="font-semibold text-slate-400 uppercase tracking-tight">Loc:</span>
                            <span className="text-slate-600 dark:text-slate-300 truncate">{eq.localizacao || 'Padrão'}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <span className="font-semibold text-slate-400 uppercase tracking-tight">Inst:</span>
                            <span className="text-slate-600 dark:text-slate-300 truncate">{eq.dataInstalacao}</span>
                          </div>
                        </div>
                      </div>

                      {eq.obsManutencao && (
                        <div className="mt-2 text-[10px] text-amber-800 dark:text-amber-300 line-clamp-1 italic bg-white/50 dark:bg-black/20 p-1.5 rounded-lg border border-amber-100/50 dark:border-amber-900/20">
                          "{eq.obsManutencao}"
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Manutenção
                      </span>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-tight mt-auto">
                        <span>Workspace</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigate('clientes')}
            className="mt-4 w-full py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Ver todos os equipamentos
          </button>
        </section>
      </div>
    </div>

      {/* Quick View Modals */}
      <QuickViewModal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        entityType="recent_activity"
        data={selectedActivity}
        onOpenWorkspace={(_type, data) => {
          if (selectedActivity) {
            onNavigate(getActivityModule(selectedActivity.type));
          }
        }}
      />

      <QuickViewModal
        isOpen={!!selectedEquipment}
        onClose={() => setSelectedEquipment(null)}
        entityType="equipamento"
        data={selectedEquipment}
        onOpenWorkspace={(_type, data) => {
          if (selectedEquipment && onOpenEquipmentWorkspace) {
            const client = clients.find(c => c.id === selectedEquipment.clienteId);
            if (client) {
              onOpenEquipmentWorkspace(client, selectedEquipment);
            } else {
              onNavigate('clientes');
            }
          } else {
            onNavigate('clientes');
          }
          setSelectedEquipment(null);
        }}
      />
    </div>
  );
};
