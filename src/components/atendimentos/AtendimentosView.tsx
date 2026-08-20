import React, { useState, useMemo } from 'react';
import {
  Headphones,
  Plus,
  Search,
  Building2,
  User,
  Clock,
  ChevronRight,
  Filter,
  X,
  Tag,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  Eye,
  LifeBuoy,
  LayoutGrid,
  List,
  Calendar,
  CalendarDays
} from 'lucide-react';
import { AtendimentoItem, ModuleType, SystemTablesData } from '../../types';
import { QuickViewModal } from '../common/QuickViewModal';
import { getSystemTableBadgeStyle } from '../../lib/badgeUtils';

export type AtendimentoFilterStatus = 'todos' | 'abertos' | 'finalizados';
export type AtendimentoDateFilter = 'todas' | 'hoje' | 'ontem' | 'custom';

interface AtendimentosViewProps {
  atendimentos: AtendimentoItem[];
  onNavigateModule?: (module: ModuleType) => void;
  onOpenQuickAction?: (actionType: 'atendimento' | 'registro' | 'cliente') => void;
  onShowToast?: (title: string, message: string) => void;
  onOpenWorkspace?: (atd: AtendimentoItem) => void;
  systemTables?: SystemTablesData;
}

export const AtendimentosView: React.FC<AtendimentosViewProps> = ({
  atendimentos,
  onNavigateModule,
  onOpenQuickAction,
  onShowToast,
  onOpenWorkspace,
  systemTables,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<AtendimentoFilterStatus>('todos');
  const [selectedModule, setSelectedModule] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<AtendimentoDateFilter>('todas');
  const [customDate, setCustomDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'lista'>('lista');

  // Quick View Modal State
  const [quickViewModal, setQuickViewModal] = useState<{
    isOpen: boolean;
    data: AtendimentoItem | null;
  }>({
    isOpen: false,
    data: null,
  });

  // Unique list of modules for filter
  const availableModules = useMemo(() => {
    const modulesSet = new Set<string>();
    atendimentos.forEach((atd) => {
      if (atd.modulo) modulesSet.add(atd.modulo);
    });
    return Array.from(modulesSet);
  }, [atendimentos]);

  // Real-time Search and Filter Logic
  const filteredAtendimentos = useMemo(() => {
    return atendimentos.filter((atd) => {
      // 1. Status Filter
      if (activeFilter === 'abertos') {
        const isAberto = ['Aberto', 'Em Andamento', 'Aguardando Cliente'].includes(atd.status);
        if (!isAberto) return false;
      }
      if (activeFilter === 'finalizados') {
        const isFinalizado = ['Resolvido', 'Concluído', 'Cancelado'].includes(atd.status);
        if (!isFinalizado) return false;
      }

      // 2. Module Filter
      if (selectedModule !== 'todos' && atd.modulo !== selectedModule) {
        return false;
      }

      // 3. Date Filter
      if (dateFilter === 'hoje') {
        const lower = (atd.dataAbertura || '').toLowerCase();
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const todayFormatted = `${dd}/${mm}/${yyyy}`;
        const isToday = lower.includes('hoje') || (atd.dataAbertura && atd.dataAbertura.includes(todayFormatted));
        if (!isToday) return false;
      } else if (dateFilter === 'ontem') {
        const lower = (atd.dataAbertura || '').toLowerCase();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dd = String(yesterday.getDate()).padStart(2, '0');
        const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
        const yyyy = yesterday.getFullYear();
        const yesterdayFormatted = `${dd}/${mm}/${yyyy}`;
        const isYesterday = lower.includes('ontem') || (atd.dataAbertura && atd.dataAbertura.includes(yesterdayFormatted));
        if (!isYesterday) return false;
      } else if (dateFilter === 'custom' && customDate) {
        const parts = customDate.split('-');
        if (parts.length === 3) {
          const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
          if (!atd.dataAbertura || !atd.dataAbertura.includes(formatted)) return false;
        }
      }

      // 4. Real-time Search (Cliente, Título/Assunto, Descrição, Módulo, Tags, Código, Responsável)
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase().trim();
      const matchCliente = atd.clienteNome ? atd.clienteNome.toLowerCase().includes(term) : false;
      const matchAssunto = atd.assunto.toLowerCase().includes(term);
      const matchDescricao = atd.descricao ? atd.descricao.toLowerCase().includes(term) : false;
      const matchModulo = atd.modulo ? atd.modulo.toLowerCase().includes(term) : false;
      const matchCodigo = atd.codigo.toLowerCase().includes(term);
      const matchResponsavel = atd.responsavel.toLowerCase().includes(term);
      const matchTags = atd.tags
        ? atd.tags.some((tag) => tag.toLowerCase().includes(term))
        : false;

      return (
        matchCliente ||
        matchAssunto ||
        matchDescricao ||
        matchModulo ||
        matchCodigo ||
        matchResponsavel ||
        matchTags
      );
    });
  }, [atendimentos, searchTerm, activeFilter, selectedModule, dateFilter, customDate]);

  // Counts for filters
  const countTodos = atendimentos.length;
  const countAbertos = atendimentos.filter((a) =>
    ['Aberto', 'Em Andamento', 'Aguardando Cliente'].includes(a.status)
  ).length;
  const countFinalizados = atendimentos.filter((a) =>
    ['Resolvido', 'Concluído', 'Cancelado'].includes(a.status)
  ).length;
  const countHoje = useMemo(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const todayFormatted = `${dd}/${mm}/${yyyy}`;

    return atendimentos.filter((a) => {
      if (!a.dataAbertura) return false;
      const lower = a.dataAbertura.toLowerCase();
      return lower.includes('hoje') || a.dataAbertura.includes(todayFormatted);
    }).length;
  }, [atendimentos]);

  // Helper badge styles
  const getStatusBadge = (statusStr: string) => {
    const styleClasses = getSystemTableBadgeStyle('statusAtendimento', statusStr, systemTables, 'slate');
    
    // Choose icon based on dynamic name or standard fallback
    const lower = statusStr.toLowerCase();
    let icon = null;
    if (lower.includes('abert')) {
      icon = <AlertCircle className="w-3 h-3 text-blue-500" />;
    } else if (lower.includes('andamento')) {
      icon = <Clock3 className="w-3 h-3 text-amber-500" />;
    } else if (lower.includes('aguardando')) {
      icon = <Clock className="w-3 h-3 text-purple-500" />;
    } else if (lower.includes('resolv') || lower.includes('conclu')) {
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
    } else {
      icon = <XCircle className="w-3 h-3 text-slate-400" />;
    }

    return {
      style: styleClasses,
      icon,
    };
  };

  const getPriorityBadge = (prioridade: string) => {
    return getSystemTableBadgeStyle('prioridadesAtendimento', prioridade, systemTables, 'slate');
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sessão de Atendimentos
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Atendimentos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Central de chamados e suporte. Localize rapidamente e consulte na Visualização Rápida.
          </p>
        </div>

        <button
          onClick={() => {
            if (onOpenQuickAction) {
              onOpenQuickAction('atendimento');
            } else if (onShowToast) {
              onShowToast('Novo Atendimento', 'Abrindo tela de registro de atendimento.');
            }
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Atendimento</span>
        </button>
      </div>

      {/* 2. Controls Bar: Real-time Search + Status Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-4">
        {/* Real-time Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Pesquisar por cliente, título, descrição, módulo ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 lg:pt-0">
          {/* Module Selector */}
          {availableModules.length > 0 && (
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
            >
              <option value="todos">Todos os Módulos</option>
              {availableModules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}

          {/* Date Filter Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDateFilter((prev) => (prev === 'hoje' ? 'todas' : 'hoje'))}
              title="Filtrar atendimentos criados hoje"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                dateFilter === 'hoje'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Somente do dia</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  dateFilter === 'hoje'
                    ? 'bg-amber-700 text-amber-100'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {countHoje}
              </span>
            </button>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as AtendimentoDateFilter)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
            >
              <option value="todas">Todas as Datas</option>
              <option value="hoje">Somente Hoje ({countHoje})</option>
              <option value="ontem">Ontem</option>
              <option value="custom">Data Específica...</option>
            </select>

            {dateFilter === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              />
            )}
          </div>

          {/* Filter Status Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mr-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filtros:
            </div>

            <button
              onClick={() => setActiveFilter('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeFilter === 'todos'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md font-mono">
                {countTodos}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('abertos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeFilter === 'abertos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>Abertos</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-md font-mono">
                {countAbertos}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('finalizados')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeFilter === 'finalizados'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>Finalizados</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md font-mono">
                {countFinalizados}
              </span>
            </button>
          </div>

          {/* View Mode Switcher (Cards / Lista) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Visualização em Cards"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              title="Visualização em Lista por Colunas"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'lista'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Cards Grid OR Structured List */}
      {filteredAtendimentos.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAtendimentos.map((atd) => {
              const statusInfo = getStatusBadge(atd.status);
              return (
                <div
                  key={atd.id}
                  onClick={() => setQuickViewModal({ isOpen: true, data: atd })}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header: Code, Priority & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                        {atd.codigo}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                            atd.prioridade
                          )}`}
                        >
                          {atd.prioridade}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.style}`}
                        >
                          {statusInfo.icon}
                          {atd.status}
                        </span>
                      </div>
                    </div>

                    {/* Cliente Name */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{atd.clienteNome || 'Cliente Não Informado'}</span>
                    </div>

                    {/* Título do Atendimento */}
                    <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-3">
                      {atd.assunto}
                    </h3>

                    {/* Module & Category Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {atd.modulo && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {atd.modulo}
                        </span>
                      )}
                      {atd.categoria && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {atd.categoria}
                        </span>
                      )}
                    </div>

                    {/* Details Line: Data & Responsável */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-purple-500" /> Data:
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                          {atd.dataAbertura}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                          <User className="w-3.5 h-3.5 text-indigo-500" /> Responsável:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-[150px]">
                          {atd.responsavel}
                        </span>
                      </div>
                    </div>

                    {/* Tags Pills */}
                    {atd.tags && atd.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                        {atd.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-medium bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.2 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                        {atd.tags.length > 3 && (
                          <span className="text-[10px] font-medium text-slate-400 py-0.2">
                            +{atd.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-all">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-indigo-500" /> Visualização Rápida
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Structured Column List View (2-line rows with action button in front) */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {/* Header Columns */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="col-span-5">Atendimento & Cliente</div>
              <div className="col-span-3">Responsável & Data</div>
              <div className="col-span-2">Prioridade & Status</div>
              <div className="col-span-2 text-right">Ação</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAtendimentos.map((atd) => {
                const statusInfo = getStatusBadge(atd.status);
                return (
                  <div
                    key={atd.id}
                    onClick={() => setQuickViewModal({ isOpen: true, data: atd })}
                    className="p-4 md:px-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center justify-between gap-3"
                  >
                    {/* Col 1: Atendimento & Cliente (2 lines) */}
                    <div className="col-span-5 space-y-1">
                      {/* Line 1 */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50 flex-shrink-0">
                          {atd.codigo}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {atd.assunto}
                        </h3>
                      </div>
                      {/* Line 2 */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-0.5">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                          <Building2 className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                          {atd.clienteNome || 'Cliente Não Informado'}
                        </span>
                        {(atd.modulo || atd.categoria) && (
                          <span className="text-[11px] text-slate-400 truncate">
                            • {atd.modulo} {atd.categoria ? `(${atd.categoria})` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Col 2: Responsável & Data (2 lines) */}
                    <div className="col-span-3 space-y-1 text-xs">
                      {/* Line 1 */}
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold truncate">
                        <User className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span className="truncate">{atd.responsavel}</span>
                      </div>
                      {/* Line 2 */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3 text-purple-500 flex-shrink-0" />
                        <span>Aberto em {atd.dataAbertura}</span>
                      </div>
                    </div>

                    {/* Col 3: Prioridade & Status (2 lines) */}
                    <div className="col-span-2 space-y-1">
                      {/* Line 1 */}
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                            atd.prioridade
                          )}`}
                        >
                          Prioridade: {atd.prioridade}
                        </span>
                      </div>
                      {/* Line 2 */}
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.style}`}
                        >
                          {statusInfo.icon}
                          {atd.status}
                        </span>
                      </div>
                    </div>

                    {/* Col 4: Botão de Ação na frente */}
                    <div className="col-span-2 flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewModal({ isOpen: true, data: atd });
                        }}
                        className="w-full md:w-auto px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group-hover:bg-indigo-600 group-hover:text-white"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualizar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full inline-block mb-3">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Nenhum atendimento encontrado
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Não encontramos nenhum atendimento com os critérios ou filtros pesquisados.
          </p>
          {(searchTerm || activeFilter !== 'todos' || selectedModule !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('todos');
                setSelectedModule('todos');
              }}
              className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Limpar Pesquisa e Filtros
            </button>
          )}
        </div>
      )}

      {/* Visualização Rápida Modal Unificada */}
      <QuickViewModal
        isOpen={quickViewModal.isOpen}
        onClose={() => setQuickViewModal({ isOpen: false, data: null })}
        entityType="atendimento"
        data={quickViewModal.data}
        onOpenWorkspace={(_type, data) => {
          setQuickViewModal({ isOpen: false, data: null });
          if (onOpenWorkspace && data) {
            onOpenWorkspace(data);
          } else if (onShowToast) {
            onShowToast(
              'Acessar Workspace do Atendimento',
              `Direcionando para o Workspace do atendimento ${data?.codigo || ''}.`
            );
          }
        }}
      />
    </div>
  );
};
