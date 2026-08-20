import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Building2,
  User,
  MapPin,
  Headphones,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Filter,
  X,
  Building,
  LayoutGrid,
  List,
  Download
} from 'lucide-react';
import { Cliente, ClienteFilterStatus, ModuleType, EquipamentoItem, SystemTablesData, AtendimentoItem, RegistroItem, ArtigoKBItem } from '../../types';
import { ClienteFormDrawer } from '../drawers/ClienteFormDrawer';
import { ClientWorkspace } from './ClientWorkspace';
import { EquipmentWorkspace } from '../inventario/EquipmentWorkspace';
import { getSystemTableBadgeStyle } from '../../lib/badgeUtils';

interface ClientesViewProps {
  clients: Cliente[];
  onAddClient: (client: Cliente) => void;
  onUpdateClient?: (client: Cliente) => void;
  systemTables?: SystemTablesData;
  onNavigateModule: (module: ModuleType) => void;
  onOpenQuickAction?: (actionType: 'atendimento' | 'registro' | 'cliente') => void;
  allAtendimentos?: AtendimentoItem[];
  allRegistros?: RegistroItem[];
  allArtigos?: ArtigoKBItem[];
  onUpdateAtendimentosList?: (atendimentos: AtendimentoItem[]) => void;
  onUpdateRegistrosList?: (registros: RegistroItem[]) => void;
  onUpdateArtigosList?: (artigos: ArtigoKBItem[]) => void;
  onShowToast?: (title: string, message: string) => void;
  systemOptions?: any;
  onOpenRegistroWorkspace?: (reg: RegistroItem) => void;
  onOpenArtigoWorkspace?: (art: ArtigoKBItem) => void;
  initialClient?: Cliente | null;
  initialEquipment?: EquipamentoItem | null;
  onClearInitialSelection?: () => void;
}

const getClassificacaoStyle = (cls?: string, systemTables?: SystemTablesData) => {
  return getSystemTableBadgeStyle('classificacoesCliente', cls || '', systemTables, 'blue');
};

export const ClientesView: React.FC<ClientesViewProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
  systemTables,
  onNavigateModule,
  onOpenQuickAction,
  allAtendimentos,
  allRegistros,
  allArtigos,
  onUpdateAtendimentosList,
  onUpdateRegistrosList,
  onUpdateArtigosList,
  onShowToast,
  systemOptions,
  onOpenRegistroWorkspace,
  onOpenArtigoWorkspace,
  initialClient,
  initialEquipment,
  onClearInitialSelection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ClienteFilterStatus>('todos');
  const [selectedClassificacao, setSelectedClassificacao] = useState<string>('todas');
  const [selectedSistema, setSelectedSistema] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'lista'>('lista');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(initialClient || null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipamentoItem | null>(initialEquipment || null);

  // Dynamically extract unique classifications and systems from current clients
  const uniqueClassificacoes = useMemo(() => {
    const list = new Set<string>();
    clients.forEach((c) => {
      if (c.classificacao) list.add(c.classificacao);
    });
    return Array.from(list).sort();
  }, [clients]);

  const uniqueSistemas = useMemo(() => {
    const list = new Set<string>();
    clients.forEach((c) => {
      if (c.sistemasModulos) {
        c.sistemasModulos.forEach((sm) => {
          if (sm.sistema) list.add(sm.sistema);
        });
      }
    });
    return Array.from(list).sort();
  }, [clients]);

  // Handle initial selection from props (robustified)
  React.useEffect(() => {
    if (initialClient && !selectedClient) {
      setSelectedClient(initialClient);
    }
    if (initialEquipment && !selectedEquipment) {
      setSelectedEquipment(initialEquipment);
    }
    
    if (initialClient && onClearInitialSelection) {
      // Small delay to ensure state is settled if needed, but usually not necessary
      onClearInitialSelection();
    }
  }, [initialClient, initialEquipment, onClearInitialSelection, selectedClient, selectedEquipment]);

  // Real-time Search and Filtering Logic
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // 1. Status Filter
      if (activeFilter === 'ativos' && client.status !== 'Ativo') return false;
      if (activeFilter === 'inativos' && client.status !== 'Inativo') return false;

      // 2. Classificação Filter
      if (selectedClassificacao !== 'todas') {
        if (selectedClassificacao === 'vazio') {
          if (client.classificacao) return false;
        } else if (client.classificacao !== selectedClassificacao) {
          return false;
        }
      }

      // 3. Sistema Filter
      if (selectedSistema !== 'todos') {
        const hasSistema = client.sistemasModulos?.some(
          (sm) => sm.sistema === selectedSistema
        );
        if (!hasSistema) return false;
      }

      // 4. Real-time Text Search (Empresa, Nome Fantasia, Responsável, Cidade, Classificação, Sistemas)
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase().trim();
      const matchRazao = client.razaoSocial.toLowerCase().includes(term);
      const matchFantasia = client.nomeFantasia
        ? client.nomeFantasia.toLowerCase().includes(term)
        : false;
      const matchCnpj = client.cnpj
        ? client.cnpj.toLowerCase().includes(term)
        : false;
      const matchIE = client.inscricaoEstadual
        ? client.inscricaoEstadual.toLowerCase().includes(term)
        : false;
      const matchResponsavel = client.responsavel.toLowerCase().includes(term);
      const matchCidade = client.cidade.toLowerCase().includes(term);
      const matchEstado = client.estado.toLowerCase().includes(term);
      const matchCodigo = client.codigo.toLowerCase().includes(term);
      const matchClassificacao = client.classificacao
        ? client.classificacao.toLowerCase().includes(term)
        : false;
      const matchSistemas = client.sistemasModulos
        ? client.sistemasModulos.some(
            (sm) =>
              sm.sistema.toLowerCase().includes(term) ||
              (sm.modulo && sm.modulo.toLowerCase().includes(term))
          )
        : false;

      return (
        matchRazao ||
        matchFantasia ||
        matchCnpj ||
        matchIE ||
        matchResponsavel ||
        matchCidade ||
        matchEstado ||
        matchCodigo ||
        matchClassificacao ||
        matchSistemas
      );
    });
  }, [clients, searchTerm, activeFilter, selectedClassificacao, selectedSistema]);

  // Counts for filters
  const countTodos = clients.length;
  const countAtivos = clients.filter((c) => c.status === 'Ativo').length;
  const countInativos = clients.filter((c) => c.status === 'Inativo').length;

  // Handle client creation and auto-open Workspace
  const handleSaveNewClient = (newClient: Cliente) => {
    onAddClient(newClient);
    setSelectedClient(newClient); // Automatically open the Workspace of the newly created client
  };

  const handleExport = () => {
    if (!clients || clients.length === 0) {
      if (onShowToast) onShowToast('Erro', 'Não há clientes para exportar.');
      return;
    }

    try {
      // 1. Prepare data
      const headers = [
        'ID',
        'Código',
        'Razão Social',
        'Nome Fantasia',
        'CNPJ',
        'Responsável',
        'E-mail',
        'Telefone',
        'Cidade',
        'Estado',
        'Status',
        'Classificação',
        'Segmento',
        'Tipo Instalação',
        'Qtd Atendimentos (Total)',
        'Qtd Bugs/Melhorias (Total)'
      ];

      const csvRows = clients.map(client => {
        // Count quantitative info
        const totalAtendimentos = (allAtendimentos || []).filter(a => a.clienteId === client.id).length;
        const totalRegistros = (allRegistros || []).filter(r => r.clienteId === client.id).length;

        const row = [
          client.id,
          client.codigo,
          client.razaoSocial,
          client.nomeFantasia || '',
          client.cnpj || '',
          client.responsavel,
          client.email || '',
          client.telefone || '',
          client.cidade,
          client.estado,
          client.status,
          client.classificacao || '',
          client.segmento || '',
          client.tipoInstalacao || '',
          totalAtendimentos,
          totalRegistros
        ];

        // Sanitize for CSV (handle commas and quotes)
        return row.map(value => {
          const stringified = String(value ?? '').replace(/"/g, '""');
          return `"${stringified}"`;
        }).join(',');
      });

      const csvContent = [headers.join(','), ...csvRows].join('\n');

      // 2. Trigger Download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clientes_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onShowToast) onShowToast('Sucesso', 'Exportação concluída com sucesso.');
    } catch (error) {
      console.error('Erro ao exportar clientes:', error);
      if (onShowToast) onShowToast('Erro', 'Ocorreu um erro ao gerar a exportação.');
    }
  };

  // If equipment is selected, render EquipmentWorkspace
  if (selectedEquipment) {
    return (
      <EquipmentWorkspace
        equipamento={selectedEquipment}
        systemTables={systemTables}
        onBack={() => setSelectedEquipment(null)}
        onUpdateEquipamento={(updated) => {
          setSelectedEquipment(updated);
          if (selectedClient) {
            const currentEqs = selectedClient.equipamentos || [];
            const updatedEqs = currentEqs.map((e) => (e.id === updated.id ? updated : e));
            const updatedClient = { ...selectedClient, equipamentos: updatedEqs };
            setSelectedClient(updatedClient);
            if (onUpdateClient) onUpdateClient(updatedClient);
          }
        }}
        onDeleteEquipamento={(eqId) => {
          if (selectedClient) {
            const currentEqs = selectedClient.equipamentos || [];
            const updatedEqs = currentEqs.filter((e) => e.id !== eqId);
            const updatedClient = { ...selectedClient, equipamentos: updatedEqs };
            setSelectedClient(updatedClient);
            if (onUpdateClient) onUpdateClient(updatedClient);
          }
          setSelectedEquipment(null);
        }}
      />
    );
  }

  // If a client is selected, render their Workspace directly
  if (selectedClient) {
    return (
      <ClientWorkspace
        client={selectedClient}
        systemTables={systemTables}
        systemOptions={systemOptions}
        onUpdateClient={(updated) => {
          setSelectedClient(updated);
          if (onUpdateClient) onUpdateClient(updated);
        }}
        onBack={() => setSelectedClient(null)}
        onNavigateModule={onNavigateModule}
        onOpenQuickAction={onOpenQuickAction}
        onOpenEquipmentWorkspace={(eq) => setSelectedEquipment(eq)}
        allAtendimentos={allAtendimentos}
        allRegistros={allRegistros}
        allArtigos={allArtigos}
        onUpdateAtendimentosList={onUpdateAtendimentosList}
        onUpdateRegistrosList={onUpdateRegistrosList}
        onUpdateArtigosList={onUpdateArtigosList}
        onShowToast={onShowToast}
        onOpenRegistroWorkspace={onOpenRegistroWorkspace}
        onOpenArtigoWorkspace={onOpenArtigoWorkspace}
      />
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sessão de Clientes
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Clientes Cadastrados
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Localize e acesse diretamente o Workspace de qualquer empresa.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Exportar</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* 2. Controls Bar: Real-time Search + Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Real-time Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Pesquisar por empresa, fantasia, responsável, cidade, classificação ou sistemas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
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

        {/* Filters Row: Status + Classification + System */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mr-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </div>
              <button
                type="button"
                onClick={() => setActiveFilter('todos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  activeFilter === 'todos'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>Todos</span>
                <span className="text-[10px] px-1 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md font-mono">
                  {countTodos}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('ativos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  activeFilter === 'ativos'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>Ativos</span>
                <span className="text-[10px] px-1 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md font-mono">
                  {countAtivos}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('inativos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  activeFilter === 'inativos'
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>Inativos</span>
                <span className="text-[10px] px-1 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-mono">
                  {countInativos}
                </span>
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

            {/* Classification Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                Classificação:
              </span>
              <select
                value={selectedClassificacao}
                onChange={(e) => setSelectedClassificacao(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700/80 focus:ring-1 focus:ring-indigo-500/30 outline-none cursor-pointer"
              >
                <option value="todas">Todas</option>
                <option value="vazio">Sem Classificação</option>
                {uniqueClassificacoes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

            {/* System Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                Sistema:
              </span>
              <select
                value={selectedSistema}
                onChange={(e) => setSelectedSistema(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700/80 focus:ring-1 focus:ring-indigo-500/30 outline-none cursor-pointer"
              >
                <option value="todos">Todos</option>
                {uniqueSistemas.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters button if any are active */}
          {(selectedClassificacao !== 'todas' || selectedSistema !== 'todos' || activeFilter !== 'todos' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setSelectedClassificacao('todas');
                setSelectedSistema('todos');
                setActiveFilter('todos');
                setSearchTerm('');
              }}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1.5 self-end sm:self-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Cards Grid OR Structured List */}
      {filteredClients.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Card Top Header: Code, Razão Social & Status */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                        {client.codigo}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${getSystemTableBadgeStyle('statusCliente', client.status, systemTables, 'slate')}`}
                    >
                      {client.status === 'Ativo' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-400" />
                      )}
                      {client.status}
                    </span>
                  </div>

                  {/* Empresa Name & Nome Fantasia */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {client.razaoSocial}
                  </h3>
                  {client.nomeFantasia && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
                      {client.nomeFantasia}
                    </p>
                  )}

                  {/* Details Grid */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <User className="w-3.5 h-3.5 text-indigo-500" /> Responsável:
                      </span>
                      <span className="font-semibold truncate max-w-[160px]">{client.responsavel}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" /> Cidade / UF:
                      </span>
                      <span className="font-semibold">
                        {client.cidade} / {client.estado}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Headphones className="w-3.5 h-3.5 text-amber-500" /> Atendimentos:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {client.qtdAtendimentos}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-purple-500" /> Último atendimento:
                      </span>
                      <span className="font-medium text-slate-500 dark:text-slate-400 text-[11px]">
                        {client.ultimoAtendimento || 'Nenhum'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Access Workspace Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-all">
                  <span>Acessar Workspace</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Structured Column List View (2-line rows with action button in front) */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {/* Header Columns */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="col-span-3">Cliente & Identificação</div>
              <div className="col-span-2">Contato & Responsável</div>
              <div className="col-span-2">Localização & Chamados</div>
              <div className="col-span-3">Sistemas & Módulos</div>
              <div className="col-span-2 text-right">Status & Classificação</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="p-4 md:px-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center justify-between gap-3"
                >
                  {/* Col 1: Cliente & Identificação (2 lines) */}
                  <div className="col-span-3 space-y-1">
                    {/* Line 1 */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50 flex-shrink-0">
                        {client.codigo}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {client.razaoSocial}
                      </h3>
                    </div>
                    {/* Line 2 */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-0.5">
                      {client.nomeFantasia && (
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                          {client.nomeFantasia}
                        </span>
                      )}
                      {client.cnpj && (
                        <span className="font-mono text-[11px] text-slate-400">
                          • {client.cnpj}
                        </span>
                      )}
                      {client.inscricaoEstadual && (
                        <span className="font-mono text-[11px] text-slate-400" title="Inscrição Estadual">
                          • IE: {client.inscricaoEstadual}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Col 2: Contato & Responsável (2 lines) */}
                  <div className="col-span-2 space-y-1 text-xs">
                    {/* Line 1 */}
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold truncate">
                      <User className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{client.responsavel || 'Não Informado'}</span>
                    </div>
                    {/* Line 2 */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{client.email || 'Sem e-mail'}</span>
                    </div>
                  </div>

                  {/* Col 3: Localização & Chamados (2 lines) */}
                  <div className="col-span-2 space-y-1 text-xs">
                    {/* Line 1 */}
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span>{client.cidade} / {client.estado}</span>
                    </div>
                    {/* Line 2 */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Headphones className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      <span>{client.qtdAtendimentos} atendimento(s)</span>
                    </div>
                  </div>

                  {/* Col 4: Sistemas & Módulos */}
                  <div className="col-span-3">
                    <div className="flex flex-wrap gap-1">
                      {client.sistemasModulos && client.sistemasModulos.length > 0 ? (
                        client.sistemasModulos.slice(0, 3).map((sm, idx) => (
                          <span
                            key={idx}
                            className="inline-flex flex-col px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-semibold border border-slate-200 dark:border-slate-700/60"
                          >
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{sm.sistema}</span>
                            {sm.modulo && (
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                                ({sm.modulo})
                              </span>
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Nenhum sistema</span>
                      )}
                      {client.sistemasModulos && client.sistemasModulos.length > 3 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[9px] font-bold border border-slate-200 dark:border-slate-700/60">
                          +{client.sistemasModulos.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Col 5: Status, Classificação & Ação */}
                  <div className="col-span-2 flex flex-col items-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {/* Classification Badge */}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getClassificacaoStyle(client.classificacao, systemTables)}`}>
                        {client.classificacao || 'Sem classificação'}
                      </span>
                      
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSystemTableBadgeStyle('statusCliente', client.status, systemTables, 'slate')}`}
                      >
                        {client.status === 'Ativo' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-slate-400" />
                        )}
                        {client.status}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                      }}
                      className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs group-hover:bg-indigo-600 group-hover:text-white"
                    >
                      <span>Abrir</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full inline-block mb-3">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Nenhum cliente encontrado
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Não encontramos nenhum cliente para os filtros ou termo de pesquisa digitados.
          </p>
          {(searchTerm || activeFilter !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('todos');
              }}
              className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Limpar Pesquisa e Filtros
            </button>
          )}
        </div>
      )}

      {/* New Client Drawer */}
      <ClienteFormDrawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNewClient}
        systemTables={systemTables}
        onShowToast={onShowToast}
      />
    </div>
  );
};
