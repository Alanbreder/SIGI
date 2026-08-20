import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bug,
  Sparkles,
  Lightbulb,
  Search,
  Plus,
  ChevronDown,
  Filter,
  FileCode2,
  Clock,
  Building2,
  Headphones,
  Tag,
  BookOpen,
  ArrowRight,
  LayoutGrid,
  List,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { RegistroItem, Cliente, AtendimentoItem, ArtigoKBItem, SystemOptionsConfig, SystemTablesData, UserAccount } from '../../types';
import { getSystemTableBadgeStyle, formatTempoEmDesenvolvimento } from '../../lib/badgeUtils';
import { SystemTableMeta } from '../../data/mockSystemTables';
import { initialRegistros } from '../../data/mockRegistros';
import { RegistroFormDrawer } from '../drawers/RegistroFormDrawer';
import { RegistroQuickView } from './RegistroQuickView';
import { RegistroWorkspace } from './RegistroWorkspace';

interface RegistrosViewProps {
  registrosList?: RegistroItem[];
  allClients?: Cliente[];
  allAtendimentos?: AtendimentoItem[];
  allArtigos?: ArtigoKBItem[];
  systemOptions?: SystemOptionsConfig;
  onUpdateRegistrosList?: (newList: RegistroItem[]) => void;
  onUpdateArtigosList?: (newList: ArtigoKBItem[]) => void;
  onShowToast?: (title: string, message: string) => void;
  onOpenAtendimentoWorkspace?: (atdId: string) => void;
  systemTables?: SystemTablesData;
  systemTableDefinitions?: SystemTableMeta[];
  selectedWorkspace?: RegistroItem | null;
  onOpenWorkspace?: (reg: RegistroItem | null) => void;
  systemUsers?: UserAccount[];
}

export const RegistrosView: React.FC<RegistrosViewProps> = ({
  registrosList = initialRegistros,
  allClients,
  allAtendimentos,
  allArtigos,
  systemOptions,
  onUpdateRegistrosList,
  onUpdateArtigosList,
  onShowToast,
  onOpenAtendimentoWorkspace,
  systemTables,
  systemTableDefinitions,
  selectedWorkspace: externalSelectedWorkspace,
  onOpenWorkspace,
  systemUsers = [],
}) => {
  const [items, setItems] = useState<RegistroItem[]>(registrosList);

  useEffect(() => {
    setItems(registrosList);
  }, [registrosList]);

  // Active Workspace / QuickView State
  const [selectedQuickView, setSelectedQuickView] = useState<RegistroItem | null>(null);
  const [internalSelectedWorkspace, setInternalSelectedWorkspace] = useState<RegistroItem | null>(null);

  const selectedWorkspace = onOpenWorkspace !== undefined ? externalSelectedWorkspace : internalSelectedWorkspace;
  const setSelectedWorkspace = onOpenWorkspace !== undefined ? onOpenWorkspace : setInternalSelectedWorkspace;

  // New Registro Modal State
  const [isNovoModalOpen, setIsNovoModalOpen] = useState(false);
  const [defaultTipoModal, setDefaultTipoModal] = useState<'Bug' | 'Melhoria' | 'Ideia'>('Bug');

  // Novo ▼ Dropdown State with Click-Outside Listener
  const [isNovoDropdownOpen, setIsNovoDropdownOpen] = useState(false);
  const novoDropdownRef = useRef<HTMLDivElement>(null);  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'Todos' | 'Bugs' | 'Melhorias' | 'Ideias' | 'Features' | 'Em Análise' | 'Concluídos'
  >('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedImpacto, setSelectedImpacto] = useState<string>('Todos');
  const [selectedModulo, setSelectedModulo] = useState<string>('Todos');
  const [selectedSistema, setSelectedSistema] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Options for Dropdown Filters
  const statusFilterOptions = useMemo(() => {
    const fromTables = systemTables?.statusRegistro?.map((s) => s.nome) || [];
    const fromItems = items.map((i) => i.status).filter(Boolean);
    const set = Array.from(new Set([...fromTables, ...fromItems]));
    return set.sort();
  }, [systemTables?.statusRegistro, items]);

  const moduloFilterOptions = useMemo(() => {
    const fromTables = systemTables?.modulos?.map((m) => m.nome) || [];
    const fromItems = items.map((i) => i.modulo).filter(Boolean) as string[];
    const set = Array.from(new Set([...fromTables, ...fromItems]));
    return set.sort();
  }, [systemTables?.modulos, items]);

  const sistemaFilterOptions = useMemo(() => {
    const fromTables = systemTables?.sistemas?.map((s) => s.nome) || [];
    const fromItems = items.map((i) => i.sistema).filter(Boolean) as string[];
    const set = Array.from(new Set([...fromTables, ...fromItems]));
    return set.sort();
  }, [systemTables?.sistemas, items]);

  const hasActiveFilters =
    searchTerm !== '' ||
    activeFilter !== 'Todos' ||
    selectedStatus !== 'Todos' ||
    selectedImpacto !== 'Todos' ||
    selectedModulo !== 'Todos' ||
    selectedSistema !== 'Todos';

  const handleClearFilters = () => {
    setSearchTerm('');
    setActiveFilter('Todos');
    setSelectedStatus('Todos');
    setSelectedImpacto('Todos');
    setSelectedModulo('Todos');
    setSelectedSistema('Todos');
  };

  // Click-Outside Listener for Novo ▼ Dropdown
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (novoDropdownRef.current && !novoDropdownRef.current.contains(event.target as Node)) {
        setIsNovoDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNovoDropdownOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside, true);
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('click', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside, true);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Update List Handler
  const handleSaveOrUpdateRegistro = (updatedReg: RegistroItem) => {
    let newList: RegistroItem[];
    const exists = items.some((r) => r.id === updatedReg.id);
    if (exists) {
      newList = items.map((r) => (r.id === updatedReg.id ? updatedReg : r));
    } else {
      newList = [updatedReg, ...items];
    }
    setItems(newList);
    if (onUpdateRegistrosList) {
      onUpdateRegistrosList(newList);
    }
    if (selectedWorkspace?.id === updatedReg.id || !exists) {
      setSelectedWorkspace(updatedReg);
    }
  };

  // Filter Logic
  const filteredRegistros = items.filter((reg) => {
    // Search Term Filter (Título, Descrição, Tags, Módulo, Código, Cliente)
    const matchesSearch =
      reg.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.descricao && reg.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reg.modulo && reg.modulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reg.sistema && reg.sistema.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reg.clienteNome && reg.clienteNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      reg.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.tags && reg.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    if (!matchesSearch) return false;

    // Type / Quick Pill Filter
    if (activeFilter === 'Bugs' && reg.tipo !== 'Bug') return false;
    if (activeFilter === 'Melhorias' && reg.tipo !== 'Melhoria') return false;
    if (activeFilter === 'Ideias' && reg.tipo !== 'Ideia') return false;
    if (activeFilter === 'Features' && reg.tipo !== 'Solicitação de Feature') return false;
    if (activeFilter === 'Em Análise' && reg.status !== 'Em Análise') return false;
    if (activeFilter === 'Concluídos' && reg.status !== 'Concluído' && reg.status !== 'Reparado') return false;

    // Specific Dropdown Filters
    // 1. Status Filter
    if (selectedStatus !== 'Todos' && reg.status !== selectedStatus) {
      return false;
    }

    // 2. Impacto Filter
    if (selectedImpacto !== 'Todos') {
      const regImpacto = (reg.impacto || '').toLowerCase();
      const selImpacto = selectedImpacto.toLowerCase();
      if (!regImpacto.includes(selImpacto)) return false;
    }

    // 3. Módulo Filter
    if (selectedModulo !== 'Todos' && reg.modulo !== selectedModulo) {
      return false;
    }

    // 4. Sistema Filter
    if (selectedSistema !== 'Todos' && reg.sistema !== selectedSistema) {
      return false;
    }

    return true;
  });

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'Bug':
        return {
          icon: <Bug className="w-3.5 h-3.5 text-rose-500" />,
          label: 'Bug',
          bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
        };
      case 'Melhoria':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-indigo-500" />,
          label: 'Melhoria',
          bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300'
        };
      case 'Ideia':
        return {
          icon: <Lightbulb className="w-3.5 h-3.5 text-purple-500" />,
          label: 'Ideia',
          bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300'
        };
      case 'Solicitação de Feature':
        return {
          icon: <FileCode2 className="w-3.5 h-3.5 text-sky-500" />,
          label: 'Solicitação de Feature',
          bg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-300'
        };
      default:
        return {
          icon: <FileCode2 className="w-3.5 h-3.5 text-slate-500" />,
          label: tipo,
          bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
        };
    }
  };

  const getImpactoBadge = (impacto?: string) => {
    if (!impacto) return null;
    if (impacto === 'Alto' || impacto.toLowerCase().includes('alto')) {
      return (
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          Impacto Alto
        </span>
      );
    }
    if (impacto === 'Médio' || impacto.toLowerCase().includes('médio') || impacto.toLowerCase().includes('medio')) {
      return (
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          Impacto Médio
        </span>
      );
    }
    return (
      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        Impacto Baixo
      </span>
    );
  };

  const getStatusBadge = (st: string) => {
    return getSystemTableBadgeStyle('statusRegistro', st, systemTables, 'slate');
  };

  // If a Workspace is active, render the Workspace view
  if (selectedWorkspace) {
    return (
      <RegistroWorkspace
        registro={selectedWorkspace}
        onBack={() => setSelectedWorkspace(null)}
        onUpdateRegistro={handleSaveOrUpdateRegistro}
        onShowToast={onShowToast}
        allClients={allClients}
        allAtendimentos={allAtendimentos}
        onOpenAtendimentoWorkspace={onOpenAtendimentoWorkspace}
        allArtigos={allArtigos}
        onUpdateArtigosList={onUpdateArtigosList}
        systemTableDefinitions={systemTableDefinitions}
        systemTables={systemTables}
        systemUsers={systemUsers}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
              <FileCode2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Registros</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralização de Bugs, Melhorias e Ideias vinculáveis aos atendimentos e clientes do SIGI.
          </p>
        </div>

        {/* Novo Button */}
        <button
          type="button"
          onClick={() => {
            setDefaultTipoModal('Bug');
            setIsNovoModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Registro</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        {/* Top Row: Search & Type Pills & View Mode */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Real-Time Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Pesquisar registro por título, descrição, tags, código, módulo ou sistema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills & View Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {(['Todos', 'Bugs', 'Melhorias', 'Ideias', 'Features', 'Em Análise', 'Concluídos'] as const).map((flt) => (
                <button
                  key={flt}
                  type="button"
                  onClick={() => setActiveFilter(flt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === flt
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Visualização em Lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Detailed Dropdown Filters (Status, Impacto, Módulo, Sistema) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-bold mr-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
            <span>Filtros Específicos:</span>
          </div>

          {/* 1. Status Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium cursor-pointer"
            >
              <option value="Todos">Todos os Status</option>
              {statusFilterOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Impacto Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Impacto:</label>
            <select
              value={selectedImpacto}
              onChange={(e) => setSelectedImpacto(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium cursor-pointer"
            >
              <option value="Todos">Todos os Impactos</option>
              <option value="Alto">Impacto Alto</option>
              <option value="Médio">Impacto Médio</option>
              <option value="Baixo">Impacto Baixo</option>
            </select>
          </div>

          {/* 3. Módulo Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Módulo:</label>
            <select
              value={selectedModulo}
              onChange={(e) => setSelectedModulo(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium cursor-pointer max-w-[160px]"
            >
              <option value="Todos">Todos os Módulos</option>
              {moduloFilterOptions.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Sistema Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sistema:</label>
            <select
              value={selectedSistema}
              onChange={(e) => setSelectedSistema(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium cursor-pointer max-w-[160px]"
            >
              <option value="Todos">Todos os Sistemas</option>
              {sistemaFilterOptions.map((sis) => (
                <option key={sis} value={sis}>
                  {sis}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-auto text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Cards Grid or List View */}
      {filteredRegistros.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRegistros.map((reg) => {
              const badge = getTipoBadge(reg.tipo);
              return (
                <div
                  key={reg.id}
                  onClick={() => setSelectedQuickView(reg)}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  {/* Card Header: Type Badge & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 border ${badge.bg}`}>
                      {badge.icon}
                      <span>{reg.tipo}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getImpactoBadge(reg.impacto)}
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${getStatusBadge(reg.status)}`}>
                        {reg.status}
                      </span>
                      {(reg.status === 'Em Desenvolvimento' || reg.status === 'Em desenvolvimento') && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          {formatTempoEmDesenvolvimento(reg.dataEmDesenvolvimento, reg.data)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Code */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {reg.codigo}
                      </span>
                      <span className="text-slate-400 text-[10px]">• {reg.modulo || 'Geral'}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {reg.titulo}
                    </h3>
                    {reg.descricao && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {reg.descricao}
                      </p>
                    )}
                  </div>

                  {/* Solicitante / Cliente Origin */}
                  {(reg.clienteNome || reg.reportadoPor) && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="truncate">{reg.clienteNome || (reg.reportadoPor === 'Infoserra' ? 'Infoserra (Interno)' : reg.reportadoPor)}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {reg.tags && reg.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {reg.tags.slice(0, 3).map((tg, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {reg.data || reg.dataCriacao || 'Hoje'}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Abrir <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW TABLE FOR REGISTROS */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Código</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Título do Registro</th>
                    <th className="p-4">Origem / Solicitante</th>
                    <th className="p-4">Módulo</th>
                    <th className="p-4">Impacto</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredRegistros.map((reg) => {
                    const badge = getTipoBadge(reg.tipo);
                    return (
                      <tr
                        key={reg.id}
                        onClick={() => setSelectedQuickView(reg)}
                        className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {reg.codigo}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 w-fit border ${badge.bg}`}>
                            {badge.icon}
                            {reg.tipo}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {reg.titulo}
                        </td>
                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                          {reg.clienteNome || (reg.reportadoPor === 'Infoserra' ? 'Infoserra' : '-')}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                          {reg.modulo || 'Geral'}
                        </td>
                        <td className="p-4">
                          {getImpactoBadge(reg.impacto) || <span className="text-slate-400 text-[10px]">-</span>}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${getStatusBadge(reg.status)}`}>
                              {reg.status}
                            </span>
                            {(reg.status === 'Em Desenvolvimento' || reg.status === 'Em desenvolvimento') && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                {formatTempoEmDesenvolvimento(reg.dataEmDesenvolvimento, reg.data)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs inline-flex items-center gap-1">
                            Ver
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mx-auto">
            <FileCode2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Nenhum registro encontrado
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Não foram encontrados registros correspondentes aos filtros ou pesquisa informados.
          </p>
        </div>
      )}

      {/* Quick View Drawer */}
      <RegistroQuickView
        registro={selectedQuickView}
        onClose={() => setSelectedQuickView(null)}
        onOpenWorkspace={(reg) => {
          setSelectedQuickView(null);
          setSelectedWorkspace(reg);
        }}
        onOpenAtendimentoWorkspace={onOpenAtendimentoWorkspace}
      />

      {/* Novo Registro Drawer */}
      <RegistroFormDrawer
        isOpen={isNovoModalOpen}
        onClose={() => setIsNovoModalOpen(false)}
        clients={allClients || []}
        systemTables={systemTables}
        systemUsers={systemUsers}
        onSave={handleSaveOrUpdateRegistro}
        onShowToast={onShowToast}
      />
    </div>
  );
};
