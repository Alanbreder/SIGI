import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  UserCheck,
  Building2,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  FileText,
  Paperclip,
  CheckSquare,
  CreditCard,
} from 'lucide-react';
import {
  AtendimentoFixoItem,
  Cliente,
  UserAccount,
  ArtigoKBItem,
  SystemTablesData,
} from '../../types';
import { AtendimentoFixoFormDrawer } from '../drawers/AtendimentoFixoFormDrawer';
import { AtendimentoFixoWorkspace } from './AtendimentoFixoWorkspace';

interface AtendimentosFixosViewProps {
  atendimentosFixos: AtendimentoFixoItem[];
  onAddAtendimentoFixo: (atendimento: AtendimentoFixoItem) => void;
  onUpdateAtendimentoFixo: (atendimento: AtendimentoFixoItem) => void;
  onDeleteAtendimentoFixo: (id: string) => void;
  allClients?: Cliente[];
  systemUsers?: UserAccount[];
  allArtigos?: ArtigoKBItem[];
  currentUserName?: string;
  systemTables?: SystemTablesData;
  onShowToast?: (title: string, message: string) => void;
  onOpenArtigoWorkspace?: (artigo: ArtigoKBItem) => void;
  onCreateArtigoFromMaintenance?: (artigo: Partial<ArtigoKBItem>) => void;
}

export const AtendimentosFixosView: React.FC<AtendimentosFixosViewProps> = ({
  atendimentosFixos,
  onAddAtendimentoFixo,
  onUpdateAtendimentoFixo,
  onDeleteAtendimentoFixo,
  allClients = [],
  systemUsers = [],
  allArtigos = [],
  currentUserName = 'Carlos Eduardo Silva',
  systemTables,
  onShowToast,
  onOpenArtigoWorkspace,
  onCreateArtigoFromMaintenance,
}) => {
  // State variables - hooks declared first!
  const [activeWorkspaceItem, setActiveWorkspaceItem] = useState<AtendimentoFixoItem | null>(null);
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Concluído' | 'Aguardando' | 'Em Andamento' | 'Agendado' | 'Pendente'>('todos');
  const [clientFilter, setClientFilter] = useState('todos');
  const [monthFilter, setMonthFilter] = useState('todos');

  // Month options for filter
  const monthOptions = [
    { val: 'todos', label: 'Todos os Meses' },
    { val: '01', label: 'Janeiro' },
    { val: '02', label: 'Fevereiro' },
    { val: '03', label: 'Março' },
    { val: '04', label: 'Abril' },
    { val: '05', label: 'Maio' },
    { val: '06', label: 'Junho' },
    { val: '07', label: 'Julho' },
    { val: '08', label: 'Agosto' },
    { val: '09', label: 'Setembro' },
    { val: '10', label: 'Outubro' },
    { val: '11', label: 'Novembro' },
    { val: '12', label: 'Dezembro' },
  ];

  // Helper to extract month string from date string (e.g. 2026-08-03 or 03/08/2026)
  const getItemMonth = (dateStr: string): string => {
    if (!dateStr) return '';
    // If format YYYY-MM-DD
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length >= 2) return parts[1];
    }
    // If format DD/MM/YYYY
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length >= 2) return parts[1];
    }
    return '';
  };

  // Base Filtered List (filtered by client, month, and search term)
  const baseFilteredList = useMemo(() => {
    return atendimentosFixos.filter((item) => {
      // Client filter
      if (clientFilter !== 'todos' && item.clienteId !== clientFilter && item.clienteNome !== clientFilter) {
        return false;
      }
      // Month filter
      if (monthFilter !== 'todos') {
        const itemMonth = getItemMonth(item.dataManutencao);
        if (itemMonth && itemMonth !== monthFilter) {
          return false;
        }
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesCode = item.codigo.toLowerCase().includes(query);
        const matchesClient = item.clienteNome.toLowerCase().includes(query);
        const matchesTech = item.responsavelTecnico.toLowerCase().includes(query);
        const matchesNotes = item.anotacoes.toLowerCase().includes(query);
        const matchesPeriod = (item.periodoManutencao || '').toLowerCase().includes(query);
        if (!matchesCode && !matchesClient && !matchesTech && !matchesNotes && !matchesPeriod) {
          return false;
        }
      }
      return true;
    });
  }, [atendimentosFixos, clientFilter, monthFilter, searchTerm]);

  // Final Filtered List (includes status filter)
  const filteredList = useMemo(() => {
    return baseFilteredList.filter((item) => {
      if (statusFilter !== 'todos' && item.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [baseFilteredList, statusFilter]);

  // Status counters & financial total related to selected filters
  const stats = useMemo(() => {
    const total = baseFilteredList.length;
    const concluídos = baseFilteredList.filter((i) => i.status === 'Concluído').length;
    const emAndamento = baseFilteredList.filter((i) => i.status === 'Em Andamento').length;
    const agendados = baseFilteredList.filter((i) => i.status === 'Agendado').length;

    let totalFinanceiroInfoserra = 0;
    const listForFinancial = statusFilter === 'todos' ? baseFilteredList : filteredList;
    listForFinancial.forEach(atd => {
      (atd.equipamentos || []).forEach(eq => {
        const isInfoserra = eq.origemCusto === 'Infoserra (Valor a Receber)' || eq.cobrarNaMensalidade || (eq.tipo && eq.tipo.includes('Comprado pela IS'));
        if (isInfoserra) {
          totalFinanceiroInfoserra += (eq.valorUnitario || 0) * eq.quantidade;
        }
      });
    });

    return { total, concluídos, emAndamento, agendados, totalFinanceiroInfoserra };
  }, [baseFilteredList, filteredList, statusFilter]);

  // If viewing a workspace, render workspace component directly
  if (activeWorkspaceItem) {
    return (
      <AtendimentoFixoWorkspace
        atendimento={activeWorkspaceItem}
        onBack={() => setActiveWorkspaceItem(null)}
        onUpdateAtendimento={(updated) => {
          onUpdateAtendimentoFixo(updated);
          setActiveWorkspaceItem(updated);
        }}
        onDeleteAtendimento={(id) => {
          onDeleteAtendimentoFixo(id);
          setActiveWorkspaceItem(null);
        }}
        onShowToast={onShowToast}
        allArtigos={allArtigos}
        allClients={allClients}
        systemTables={systemTables}
        onOpenArtigoWorkspace={onOpenArtigoWorkspace}
        onCreateArtigoFromMaintenance={onCreateArtigoFromMaintenance}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Top Main Section Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="w-full max-w-[1700px] mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Atendimentos Fixos
                  </h1>
                  <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full border border-indigo-200 dark:border-indigo-800">
                    {stats.total} registros
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Gestão simplificada de manutenções periódicas e preventivas de TI para clientes fixos
                </p>
              </div>
            </div>

            {/* Main Primary Action Button */}
            <button
              onClick={() => setIsNewDrawerOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Novo Atendimento Fixo
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div
              onClick={() => setStatusFilter('todos')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                statusFilter === 'todos'
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Geral
                </span>
                <Wrench className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                {stats.total}
              </p>
            </div>

            <div
              onClick={() => setStatusFilter('Concluído')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                statusFilter === 'Concluído'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Concluídos
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {stats.concluídos}
              </p>
            </div>

            <div
              onClick={() => setStatusFilter('Em Andamento')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                statusFilter === 'Em Andamento'
                  ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Em Andamento
                </span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                {stats.emAndamento}
              </p>
            </div>

            <div
              className="p-4 rounded-2xl border bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-500/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-100 uppercase tracking-wider">
                  Total a Receber (IS)
                </span>
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-black text-white mt-2">
                R$ {stats.totalFinanceiroInfoserra.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="w-full max-w-[1700px] mx-auto p-4 md:p-6 space-y-6">
        {/* Search & Filter Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, responsável, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Filter Dropdowns & Status Pills */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Filter Month */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              {monthOptions.map((m) => (
                <option key={m.val} value={m.val}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Filter Client */}
            {allClients.length > 0 && (
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                <option value="todos">Todos os Clientes</option>
                {allClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razaoSocial}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['todos', 'Concluído', 'Aguardando', 'Em Andamento', 'Agendado'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {st === 'todos' ? 'Todos' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List Table of Atendimentos Fixos */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {filteredList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-slate-500">
                    <th className="py-3.5 px-4 font-bold">Código</th>
                    <th className="py-3.5 px-4 font-bold">Cliente Fixo</th>
                    <th className="py-3.5 px-4 font-bold">Responsável Técnico</th>
                    <th className="py-3.5 px-4 font-bold">Data / Horário</th>
                    <th className="py-3.5 px-4 font-bold">Status da Manutenção</th>
                    <th className="py-3.5 px-4 font-bold">Equipamentos</th>
                    <th className="py-3.5 px-4 font-bold text-indigo-600">A Receber</th>
                    <th className="py-3.5 px-4 font-bold text-slate-600">Outros Custos</th>
                    <th className="py-3.5 px-4 font-bold">Resumo das Anotações</th>
                    <th className="py-3.5 px-4 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredList.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setActiveWorkspaceItem(item)}
                      className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 cursor-pointer transition-colors group"
                    >
                      {/* Código */}
                      <td className="py-4 px-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {item.codigo}
                      </td>

                      {/* Cliente */}
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{item.clienteNome}</span>
                        </div>
                      </td>

                      {/* Técnico */}
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.responsavelTecnico}</span>
                        </div>
                      </td>

                      {/* Data */}
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.dataManutencao}</span>
                        </div>
                      </td>

                      {/* Status (Editable directly in list) */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as AtendimentoFixoItem['status'];
                            const updated = { ...item, status: newStatus };
                            onUpdateAtendimentoFixo(updated);
                            if (onShowToast) {
                              onShowToast('Status Atualizado', `Status alterado para "${newStatus}" em ${item.codigo}`);
                            }
                          }}
                          className={`px-2.5 py-1 text-[11px] rounded-lg font-bold uppercase cursor-pointer border outline-none transition-colors ${
                            item.status === 'Concluído'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                              : item.status === 'Aguardando'
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                              : item.status === 'Em Andamento'
                              ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                              : item.status === 'Agendado'
                              ? 'bg-purple-50 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {systemTables?.statusAtendimentoFixo?.map(s => (
                            <option key={s.id} value={s.nome}>{s.nome}</option>
                          )) || (
                            <>
                              <option value="Concluído">Concluído</option>
                              <option value="Aguardando">Aguardando</option>
                              <option value="Em Andamento">Em Andamento</option>
                              <option value="Agendado">Agendado</option>
                              <option value="Pendente">Pendente</option>
                            </>
                          )}
                        </select>
                      </td>

                      {/* Equipamentos count */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {item.equipamentos && item.equipamentos.length > 0 ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold rounded-md border border-amber-200 dark:border-amber-800 text-[11px] flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {item.equipamentos.length} item(ns)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Valor a Receber / Outros Custos */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {(() => {
                          const totalInfoserra = (item.equipamentos || []).reduce(
                            (acc, eq) => {
                              const isInfoserra = eq.origemCusto === 'Infoserra (Valor a Receber)' || eq.cobrarNaMensalidade || (eq.tipo && eq.tipo.includes('Comprado pela IS'));
                              return isInfoserra ? acc + (eq.valorUnitario || 0) * eq.quantidade : acc;
                            },
                            0
                          );

                          return (
                            <div className="flex flex-col gap-1">
                              {totalInfoserra > 0 ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  R$ {totalInfoserra.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">R$ 0,00</span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {(() => {
                          const totalOutros = (item.equipamentos || []).reduce(
                            (acc, eq) => {
                              const isInfoserra = eq.origemCusto === 'Infoserra (Valor a Receber)' || eq.cobrarNaMensalidade || (eq.tipo && eq.tipo.includes('Comprado pela IS'));
                              return !isInfoserra ? acc + (eq.valorUnitario || 0) * eq.quantidade : acc;
                            },
                            0
                          );

                          return totalOutros > 0 ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              R$ {totalOutros.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">R$ 0,00</span>
                          );
                        })()}
                      </td>

                      {/* Resumo */}
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {item.anotacoes}
                      </td>

                      {/* Visualizar Button */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveWorkspaceItem(item);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Visualizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4 space-y-3">
              <Wrench className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nenhum Atendimento Fixo Encontrado
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Não existem registros de manutenção para os filtros selecionados. Clique no botão abaixo para registrar uma nova manutenção de cliente fixo.
              </p>
              <button
                onClick={() => setIsNewDrawerOpen(true)}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Registrar Atendimento Fixo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Novo Atendimento Fixo Drawer */}
      <AtendimentoFixoFormDrawer
        isOpen={isNewDrawerOpen}
        onClose={() => setIsNewDrawerOpen(false)}
        onSave={(newAtendimento) => {
          onAddAtendimentoFixo(newAtendimento);
          setActiveWorkspaceItem(newAtendimento);
        }}
        clients={allClients}
        systemTables={systemTables}
        onShowToast={onShowToast}
      />
    </div>
  );
};
