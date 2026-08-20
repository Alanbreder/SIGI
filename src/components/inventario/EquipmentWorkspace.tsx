import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Cpu,
  Monitor,
  Server,
  Wifi,
  HardDrive,
  Calendar,
  User,
  MapPin,
  Tag,
  Clock,
  BookOpen,
  Plus,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCode2,
  Headphones,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  Copy,
  Layers
} from 'lucide-react';
import {
  EquipamentoItem,
  EquipamentoHistoricoItem,
  ArtigoKBItem,
  ClientTimelineItem,
  SystemTablesData,
  EquipamentoHistoricoManutencaoItem,
  Cliente,
  UserAccount,
} from '../../types';
import { SystemTableMeta } from '../../data/mockSystemTables';
import { mockEquipamentoHistorico } from '../../data/mockWorkspaceData';
import { QuickViewModal, QuickViewEntityType } from '../common/QuickViewModal';
import { DynamicFieldsForm } from '../common/DynamicFieldsForm';
import { Trash2 } from 'lucide-react';
import { ArtigoFormDrawer } from '../drawers/ArtigoFormDrawer';
import { RegistroFormDrawer } from '../drawers/RegistroFormDrawer';
import { initialUsers } from '../../data/mockUsers';

interface EquipmentWorkspaceProps {
  equipamento: EquipamentoItem;
  onBack: () => void;
  onUpdateEquipamento?: (updated: EquipamentoItem) => void;
  onDeleteEquipamento?: (id: string) => void;
  systemTables?: SystemTablesData;
  systemTableDefinitions?: SystemTableMeta[];
  allClients?: Cliente[];
  systemUsers?: UserAccount[];
  onShowToast?: (title: string, message: string) => void;
}

type TabType = 'geral' | 'manutencao' | 'historico' | 'conhecimento';

export const EquipmentWorkspace: React.FC<EquipmentWorkspaceProps> = ({
  equipamento: initialEquipamento,
  onBack,
  onUpdateEquipamento,
  onDeleteEquipamento,
  systemTables,
  systemTableDefinitions,
  allClients = [],
  systemUsers = initialUsers,
  onShowToast,
}) => {
  // Identify linked system tables for Equipamentos
  const linkedTables = useMemo(() => {
    if (!systemTableDefinitions) return [];
    return systemTableDefinitions.filter(d => d.linkedToEntity === 'equipamento');
  }, [systemTableDefinitions]);

  const [equipamento, setEquipamento] = useState<EquipamentoItem>(initialEquipamento);
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [isEditing, setIsEditing] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Form State for Editing
  const [formData, setFormData] = useState<EquipamentoItem>(initialEquipamento);

  // Maintenance State
  const [manutencoesList, setManutencoesList] = useState<EquipamentoHistoricoManutencaoItem[]>(
    initialEquipamento.manutencoes || []
  );
  const [showMaintenanceDrawer, setShowMaintenanceDrawer] = useState(false);
  const [maintDescricao, setMaintDescricao] = useState('');
  const [maintTeveValor, setMaintTeveValor] = useState<'Sim' | 'Não'>('Não');
  const [maintValor, setMaintValor] = useState<string>('');
  const [maintPagoPor, setMaintPagoPor] = useState<'Infoserra' | 'Cliente'>('Infoserra');
  const [maintEmpresa, setMaintEmpresa] = useState('');
  const [maintObservacoes, setMaintObservacoes] = useState('');
  const [editingMaintItem, setEditingMaintItem] = useState<EquipamentoHistoricoManutencaoItem | null>(null);

  // History State
  const [historicoList, setHistoricoList] = useState<EquipamentoHistoricoItem[]>(
    (initialEquipamento?.id && mockEquipamentoHistorico[initialEquipamento.id]) || [
      {
        id: 'eq-h-default-1',
        dataHora: 'Hoje às 09:00',
        autor: 'Sistema SIGI',
        alteracao: 'Cadastro de Equipamento',
        detalhes: 'Equipamento registrado e incorporado ao inventário do cliente.',
      },
    ]
  );
  const [showAddHistoryModal, setShowAddHistoryModal] = useState(false);
  const [newAlteracaoTitle, setNewAlteracaoTitle] = useState('');
  const [newAlteracaoDetalhes, setNewAlteracaoDetalhes] = useState('');

  // KB Articles bound to this equipment
  const [articlesList, setArticlesList] = useState<ArtigoKBItem[]>([
    {
      id: `art-eq-${equipamento.id}-1`,
      codigo: '#ART-EQP-01',
      titulo: `Procedimentos de Configuração e Manutenção: ${equipamento.nome}`,
      categoria: 'Manual Técnico',
      conteudo: `Guia de acesso administrativo, endereçamento IP estático (${equipamento.ip || '192.168.10.x'}), senhas de acesso seguro e parâmetros de rede.`,
      tags: ['Configuração', 'Senha Admin', equipamento.tipo],
      status: 'Publicado',
      dataCriacao: equipamento.dataInstalacao || '15/01/2025',
      autor: 'Equipe de Infraestrutura',
    },
    {
      id: `art-eq-${equipamento.id}-2`,
      codigo: '#ART-EQP-02',
      titulo: `Como Reinstalar ou Resetar os Parâmetros Padrão`,
      categoria: 'Procedimento Operacional',
      conteudo: 'Passo a passo para recuperação do sistema operacional em caso de falha de energia ou corrupção de sistema.',
      tags: ['Reinstalação', 'Recovery', 'Reset'],
      status: 'Publicado',
      dataCriacao: '10/02/2025',
      autor: 'Suporte N3',
    },
  ]);
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [newArtTitulo, setNewArtTitulo] = useState('');
  const [newArtConteudo, setNewArtConteudo] = useState('');
  const [newArtCategoria, setNewArtCategoria] = useState('Procedimento Técnico');

  // Timeline events specific to this equipment
  const [timelineEvents, setTimelineEvents] = useState<ClientTimelineItem[]>([
    {
      id: 'eq-tl-1',
      type: 'inventario',
      titulo: `Status Atualizado: ${equipamento.status}`,
      descricao: `Status do equipamento definido como ${equipamento.status} no inventário.`,
      dataHora: 'Hoje às 08:30',
      autor: 'Carlos Eduardo Silva',
      relatedCode: equipamento.codigo,
    },
    {
      id: 'eq-tl-2',
      type: 'atendimento',
      titulo: 'Atendimento Vinculado #ATD-9012',
      descricao: 'Diagnóstico de conectividade e otimização de parâmetros de rede.',
      dataHora: '28/07/2026 às 14:20',
      autor: 'Carlos Eduardo Silva',
      relatedCode: '#ATD-9012',
    },
    {
      id: 'eq-tl-3',
      type: 'artigo',
      titulo: 'Artigo da KB Vinculado',
      descricao: `Criado artigo com instruções de recuperação para ${equipamento.nome}.`,
      dataHora: '10/02/2025 às 10:15',
      autor: 'Suporte N3',
      relatedCode: '#ART-EQP-01',
    },
    {
      id: 'eq-tl-4',
      type: 'cadastro',
      titulo: 'Equipamento Cadastrado no Inventário',
      descricao: `Registrado sob o código ${equipamento.codigo} e número de série ${equipamento.numeroSerie}.`,
      dataHora: `${equipamento.dataInstalacao} às 09:00`,
      autor: 'Engenharia de Infraestrutura',
    },
  ]);

  // Quick View Modal State
  const [quickViewModal, setQuickViewModal] = useState<{
    isOpen: boolean;
    type: QuickViewEntityType;
    data: any;
  }>({
    isOpen: false,
    type: 'equipamento',
    data: null,
  });

  // Handle Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (equipamento.status === 'Manutenção' && formData.status === 'Ativo') {
      // Intercept transition to 'Ativo' and open maintenance drawer
      setShowMaintenanceDrawer(true);
      return;
    }

    setEquipamento(formData);
    setIsEditing(false);
    if (onUpdateEquipamento) {
      onUpdateEquipamento(formData);
    }

    // Add entry to history automatically
    const newHist: EquipamentoHistoricoItem = {
      id: `eq-h-${Date.now()}`,
      dataHora: 'Agora mesmo',
      autor: 'Você (Operador SIGI)',
      alteracao: 'Atualização de Ficha Técnica',
      detalhes: 'Informações do equipamento foram atualizadas via Workspace.',
    };
    setHistoricoList((prev) => [newHist, ...prev]);

    // Add entry to timeline
    setTimelineEvents((prev) => [
      {
        id: `tl-${Date.now()}`,
        type: 'inventario',
        titulo: 'Informações Alteradas no Workspace',
        descricao: 'Ficha técnica do equipamento foi atualizada.',
        dataHora: 'Agora mesmo',
        autor: 'Você',
        relatedCode: formData.codigo,
      },
      ...prev,
    ]);
  };

  // Helper to open drawer in edit mode for a maintenance record
  const handleEditMaintenance = (maint: EquipamentoHistoricoManutencaoItem) => {
    setEditingMaintItem(maint);
    setMaintDescricao(maint.descricao);
    setMaintTeveValor(maint.teveValor);
    setMaintValor(maint.valor?.toString() || '');
    setMaintPagoPor(maint.pagoPor || 'Infoserra');
    setMaintEmpresa(maint.empresaResponsavel);
    setMaintObservacoes(maint.observacoes || '');
    setShowMaintenanceDrawer(true);
  };

  // Handle Save Maintenance Form (Returns to Ativo if was in Manutenção)
  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintDescricao.trim() || !maintEmpresa.trim()) return;

    let updatedMaintList: EquipamentoHistoricoManutencaoItem[];

    if (editingMaintItem) {
      // Edit existing maintenance record
      updatedMaintList = manutencoesList.map((maint) =>
        maint.id === editingMaintItem.id
          ? {
              ...maint,
              descricao: maintDescricao.trim(),
              teveValor: maintTeveValor,
              valor: maintTeveValor === 'Sim' ? parseFloat(maintValor) || 0 : undefined,
              pagoPor: maintTeveValor === 'Sim' ? maintPagoPor : undefined,
              empresaResponsavel: maintEmpresa.trim(),
              observacoes: maintObservacoes.trim() || undefined,
            }
          : maint
      );
    } else {
      // Create a new maintenance record
      const newMaint: EquipamentoHistoricoManutencaoItem = {
        id: `maint-${Date.now()}`,
        dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        autor: 'Você (Operador SIGI)',
        descricao: maintDescricao.trim(),
        teveValor: maintTeveValor,
        valor: maintTeveValor === 'Sim' ? parseFloat(maintValor) || 0 : undefined,
        pagoPor: maintTeveValor === 'Sim' ? maintPagoPor : undefined,
        empresaResponsavel: maintEmpresa.trim(),
        observacoes: maintObservacoes.trim() || undefined,
      };
      updatedMaintList = [newMaint, ...manutencoesList];
    }

    setManutencoesList(updatedMaintList);

    // If equipment is in Maintenance, change status to Active when registering. Otherwise, keep current status.
    const newStatus = formData.status === 'Manutenção' ? 'Ativo' : formData.status;

    const updatedEq: EquipamentoItem = {
      ...formData, // use latest form fields if was editing
      status: newStatus,
      manutencoes: updatedMaintList,
      obsManutencao: newStatus === 'Ativo' ? '' : formData.obsManutencao, // clear maintenance obs only if active
    };

    setEquipamento(updatedEq);
    setFormData(updatedEq);
    setIsEditing(false);

    if (onUpdateEquipamento) {
      onUpdateEquipamento(updatedEq);
    }

    // Add entry to history automatically
    const newHist: EquipamentoHistoricoItem = {
      id: `eq-h-${Date.now()}`,
      dataHora: 'Agora mesmo',
      autor: 'Você (Operador SIGI)',
      alteracao: editingMaintItem ? 'Manutenção Atualizada' : 'Retorno de Manutenção',
      detalhes: editingMaintItem
        ? `Informações da manutenção foram retificadas. Serviço: ${maintDescricao.trim()}.`
        : `Equipamento retornou para Ativo. Serviço realizado: ${maintDescricao.trim()}. Responsável: ${maintEmpresa.trim()}.`,
    };
    setHistoricoList((prev) => [newHist, ...prev]);

    // Add entry to timeline
    setTimelineEvents((prev) => [
      {
        id: `tl-${Date.now()}`,
        type: 'inventario',
        titulo: editingMaintItem ? 'Manutenção Atualizada' : 'Retorno de Manutenção',
        descricao: editingMaintItem
          ? `Manutenção corrigida por ${maintEmpresa.trim()}: ${maintDescricao.trim()}`
          : `Manutenção realizada por ${maintEmpresa.trim()}: ${maintDescricao.trim()}`,
        dataHora: 'Agora mesmo',
        autor: 'Você',
        relatedCode: equipamento.codigo,
      },
      ...prev,
    ]);

    // Reset fields
    setMaintDescricao('');
    setMaintTeveValor('Não');
    setMaintValor('');
    setMaintPagoPor('Infoserra');
    setMaintEmpresa('');
    setMaintObservacoes('');
    setEditingMaintItem(null);
    setShowMaintenanceDrawer(false);
  };

  // Handle Add History Entry
  const handleAddHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlteracaoTitle.trim()) return;

    const item: EquipamentoHistoricoItem = {
      id: `eq-h-${Date.now()}`,
      dataHora: 'Agora mesmo',
      autor: 'Você (Operador SIGI)',
      alteracao: newAlteracaoTitle.trim(),
      detalhes: newAlteracaoDetalhes.trim() || 'Sem detalhes adicionais fornecidos.',
    };

    setHistoricoList((prev) => [item, ...prev]);
    setNewAlteracaoTitle('');
    setNewAlteracaoDetalhes('');
    setShowAddHistoryModal(false);

    // Also update timeline
    setTimelineEvents((prev) => [
      {
        id: `tl-h-${Date.now()}`,
        type: 'inventario',
        titulo: `Histórico: ${item.alteracao}`,
        descricao: item.detalhes,
        dataHora: 'Agora mesmo',
        autor: 'Você',
        relatedCode: equipamento.codigo,
      },
      ...prev,
    ]);
  };

  const handleSaveArtigoDrawer = (newArt: ArtigoKBItem) => {
    setArticlesList((prev) => [newArt, ...prev]);
    setShowAddArticleModal(false);

    // Update timeline
    setTimelineEvents((prev) => [
      {
        id: `tl-art-${Date.now()}`,
        type: 'artigo',
        titulo: `Novo Artigo Vinculado: ${newArt.codigo}`,
        descricao: newArt.titulo,
        dataHora: 'Agora mesmo',
        autor: newArt.autor || 'Você',
        relatedCode: newArt.codigo,
      },
      ...prev,
    ]);
    
    if (onShowToast) {
      onShowToast('Artigo Vinculado', `O artigo "${newArt.titulo}" foi criado e vinculado a este equipamento.`);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Ativo':
        return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Manutenção':
        return 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Desativado':
        return 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Código ${text} copiado para a área de transferência!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Superior (Voltar + Menu Mais Ações) */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Inventário / Cliente</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            type="button"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <span>⋮ Mais Ações</span>
          </button>

          {showActionsMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 py-2 text-xs">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setActiveTab('geral');
                  setShowActionsMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 font-medium cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                Editar Informações
              </button>

              <button
                onClick={() => {
                  copyToClipboard(equipamento.codigo);
                  setShowActionsMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 font-medium cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Copiar Código ({equipamento.codigo})
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                onClick={() => {
                  setShowActionsMenu(false);
                  if (equipamento.status === 'Manutenção') {
                    setShowMaintenanceDrawer(true);
                  } else {
                    const updated = { ...equipamento, status: 'Manutenção' as const };
                    setEquipamento(updated);
                    setFormData(updated);
                    if (onUpdateEquipamento) onUpdateEquipamento(updated);
                  }
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center gap-2.5 font-medium cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Alterar para {equipamento.status === 'Ativo' ? 'Manutenção' : 'Ativo'}
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir o equipamento "${equipamento.nome}" (${equipamento.codigo})?`)) {
                    if (onDeleteEquipamento) onDeleteEquipamento(equipamento.id);
                    onBack();
                  }
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                Excluir Equipamento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner de Status Em Manutenção com Observação */}
      {equipamento.status === 'Manutenção' && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-3xl p-5 shadow-xs flex items-start gap-4 animate-in fade-in duration-200">
          <div className="p-3 bg-amber-500 text-white rounded-2xl flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              Equipamento em Manutenção
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              {equipamento.obsManutencao || equipamento.observacoes || 'Equipamento marcado como em manutenção ou reparo técnico.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. Banner Principal do Equipamento */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex-shrink-0">
              <Server className="w-8 h-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50">
                  {equipamento.codigo}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  • Tipo: <strong className="text-slate-800 dark:text-slate-200">{equipamento.tipo}</strong>
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {equipamento.nome}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Cliente: <strong className="text-indigo-600 dark:text-indigo-400">{equipamento.clienteNome || 'Cliente SIGI'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  SN: {equipamento.numeroSerie}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <span
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${getStatusBadge(
                equipamento.status
              )}`}
            >
              {equipamento.status}
            </span>

            <button
              onClick={() => setIsEditing(!isEditing)}
              type="button"
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-indigo-200/60 dark:border-indigo-800 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancelar Edição' : 'Editar Equipamento'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navegação por Abas (Geral | Manutenções | Histórico | Conhecimento) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('geral')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'geral'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Geral</span>
        </button>

        <button
          onClick={() => setActiveTab('manutencao')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'manutencao'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Manutenções</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200/50">
            {manutencoesList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'historico'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {historicoList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('conhecimento')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'conhecimento'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Conhecimento</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {articlesList.length}
          </span>
        </button>
      </div>

      {/* 4. Conteúdo Dinâmico conforme a aba */}

      {/* ABA 1: GERAL */}
      {activeTab === 'geral' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs">
          {isEditing ? (
            <form onSubmit={handleSaveForm} className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-500" />
                  Editar Dados Técnicos do Equipamento
                </h3>
                <span className="text-xs text-slate-400">
                  Preencha os campos para atualizar as especificações
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Equipamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo do Equipamento *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {(systemTables?.tiposEquipamento?.filter((t: any) => t.status === 'Ativo' || t.nome === formData.tipo).map((t: any) => t.nome) || [formData.tipo]).map((tipoOpt) => (
                      <option key={tipoOpt} value={tipoOpt}>
                        {tipoOpt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {systemTables?.statusEquipamento?.filter((s: any) => s.status === 'Ativo' || s.nome === formData.status).map((s: any) => (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    )) || (
                      <>
                        <option value="Ativo">Ativo</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Desativado">Desativado</option>
                        <option value="Reserva">Reserva</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Usuário Atribuído
                  </label>
                  <input
                    type="text"
                    value={formData.usuario || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, usuario: e.target.value })
                    }
                    placeholder="Ex: Carlos - Financeiro"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Número de Patrimônio
                  </label>
                  <input
                    type="text"
                    value={formData.patrimonio || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, patrimonio: e.target.value })
                    }
                    placeholder="Ex: PAT-2025-001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Número de Série *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numeroSerie}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroSerie: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Localização Física
                  </label>
                  <input
                    type="text"
                    value={formData.localizacao || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, localizacao: e.target.value })
                    }
                    placeholder="Ex: Datacenter Central / Rack 04"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Linked System Tables Fields */}
                {linkedTables.map((table) => {
                  const options = (systemTables?.[table.key] || []).filter((opt: any) => opt.status === 'Ativo' || opt.nome === (formData.camposEspecificos?.[table.key]));
                  return (
                    <div key={table.key}>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {table.labelSingular}
                      </label>
                      <select
                        value={formData.camposEspecificos?.[table.key] || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            camposEspecificos: {
                              ...(prev.camposEspecificos || {}),
                              [table.key]: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      >
                        <option value="">Selecione...</option>
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.nome}>{opt.nome}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Campos Dinâmicos do Tipo do Equipamento definido no ADM */}
              {(() => {
                const eqTipoDef = systemTables?.tiposEquipamento?.find(
                  (t) => t.nome.toLowerCase() === formData.tipo.toLowerCase()
                );
                if (!eqTipoDef?.camposDinamicos || eqTipoDef.camposDinamicos.length === 0) return null;
                return (
                  <DynamicFieldsForm
                    title={`Campos Específicos para ${formData.tipo}`}
                    fields={eqTipoDef.camposDinamicos}
                    values={formData.camposEspecificos || {}}
                    onChange={(key, val) =>
                      setFormData((prev) => ({
                        ...prev,
                        camposEspecificos: {
                          ...(prev.camposEspecificos || {}),
                          [key]: val,
                        },
                      }))
                    }
                  />
                );
              })()}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                  Observações Técnicas e Notas de Configuração
                </label>
                <textarea
                  rows={3}
                  value={formData.observacoes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  placeholder="Informações adicionais, credenciais administrativas de recuperação, VLANs..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Salvar Alterações
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Usuário */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Usuário Atribuído
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                    {equipamento.usuario || 'Não especificado'}
                  </span>
                </div>

                {/* Patrimônio */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Número de Patrimônio
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {equipamento.patrimonio || 'Sem patrimônio'}
                  </span>
                </div>

                {/* Data de Instalação */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Data de Instalação
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                    {equipamento.dataInstalacao || 'Não informada'}
                  </span>
                </div>

                {/* Localização Física */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Localização Física
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {equipamento.localizacao || 'Não informada'}
                  </span>
                </div>

                {/* Linked System Tables Fields (View Mode) */}
                {linkedTables.map((table) => (
                  <div key={table.key} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      {table.labelSingular}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {equipamento.camposEspecificos?.[table.key] || 'Não informado'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Render Dynamic Fields based on Equipment Type in ADM */}
              {(() => {
                const eqTipoDef = systemTables?.tiposEquipamento?.find(
                  (t) => t.nome.toLowerCase() === equipamento.tipo.toLowerCase()
                );
                const hasDynamicFields = eqTipoDef?.camposDinamicos && eqTipoDef.camposDinamicos.length > 0;
                const hasSpecificValues = equipamento.camposEspecificos && Object.keys(equipamento.camposEspecificos).length > 0;

                if (hasDynamicFields || hasSpecificValues) {
                  return (
                    <DynamicFieldsForm
                      title={`Especificações do Equipamento (${equipamento.tipo})`}
                      fields={eqTipoDef?.camposDinamicos || []}
                      values={equipamento.camposEspecificos || {}}
                      readOnly={true}
                    />
                  );
                }
                return null;
              })()}

              {/* Legacy Hardware Specs (Only shown if processador/memoria/armazenamento exist or if computer type) */}
              {(equipamento.processador || equipamento.memoria || equipamento.armazenamento || equipamento.so) &&
               ['computadores', 'computador', 'servidores', 'servidor', 'notebook'].some((kw) => equipamento.tipo.toLowerCase().includes(kw)) && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                    Especificações do Hardware
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {equipamento.processador && (
                      <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Processador</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{equipamento.processador}</span>
                        </div>
                      </div>
                    )}

                    {equipamento.memoria && (
                      <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Memória RAM</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{equipamento.memoria}</span>
                        </div>
                      </div>
                    )}

                    {equipamento.armazenamento && (
                      <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                          <HardDrive className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">HD / SSD</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{equipamento.armazenamento}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observações */}
              {equipamento.observacoes && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Observações e Notas
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {equipamento.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ABA: MANUTENÇÕES */}
      {activeTab === 'manutencao' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Histórico Técnico e Manutenções
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro detalhado de intervenções físicas, preventivas, corretivas e custos associados.
              </p>
            </div>

            <button
              onClick={() => setShowMaintenanceDrawer(true)}
              type="button"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Manutenção</span>
            </button>
          </div>

          <div className="space-y-4">
            {manutencoesList.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800">
                <AlertTriangle className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum registro de manutenção</p>
                <p className="text-[11px] text-slate-400 mt-1">Este equipamento não possui intervenções registradas no momento.</p>
              </div>
            ) : (
              manutencoesList.map((maint) => (
                <div
                  key={maint.id}
                  className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row md:items-start gap-4 transition-all animate-in fade-in duration-200"
                >
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex-shrink-0 self-start">
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                            {maint.descricao}
                          </h4>
                          <button
                            onClick={() => handleEditMaintenance(maint)}
                            type="button"
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                            title="Editar esta manutenção"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                          <Clock className="w-3 h-3 text-slate-300" />
                          {maint.dataHora}
                        </span>
                      </div>

                      {maint.teveValor === 'Sim' ? (
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                            R$ {maint.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50">
                            Pago por: {maint.pagoPor}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700">
                          Sem Custo / Cobrança
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Empresa Responsável</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{maint.empresaResponsavel}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Registrado Por</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{maint.autor}</span>
                      </div>
                    </div>

                    {maint.observacoes && (
                      <div className="mt-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        <strong className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Observações Técnicas</strong>
                        {maint.observacoes}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {activeTab === 'historico' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Histórico de Alterações do Equipamento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro cronológico de trocas de IP, usuários e upgrades
              </p>
            </div>

            <button
              onClick={() => setShowAddHistoryModal(true)}
              type="button"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Alteração</span>
            </button>
          </div>

          <div className="space-y-4">
            {historicoList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-4 transition-all"
              >
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                  <History className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      {item.alteracao}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                      {item.dataHora}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    {item.detalhes}
                  </p>

                  <div className="mt-2 text-[10px] text-slate-400 font-semibold">
                    Registrado por: <strong className="text-slate-700 dark:text-slate-300">{item.autor}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: CONHECIMENTO */}
      {activeTab === 'conhecimento' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Artigos e Instruções para este Equipamento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Procedimentos de configuração, senhas administrativas e soluções conhecidas
              </p>
            </div>

            <button
              onClick={() => setShowAddArticleModal(true)}
              type="button"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Artigo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articlesList.map((art) => (
              <div
                key={art.id}
                onClick={() =>
                  setQuickViewModal({
                    isOpen: true,
                    type: 'artigo',
                    data: art,
                  })
                }
                className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                      {art.codigo}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {art.categoria}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {art.titulo}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {art.conteudo}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Por {art.autor}</span>
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline">
                    Ver Artigo <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR ALTERAÇÃO NO HISTÓRICO */}
      {showAddHistoryModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full p-6 shadow-2xl space-y-4 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Registrar Alteração de Histórico
              </h3>
              <button
                onClick={() => setShowAddHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddHistory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Alteração *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de IP, Upgrade de Memória, Novo Usuário"
                  value={newAlteracaoTitle}
                  onChange={(e) => setNewAlteracaoTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detalhes Técnicos
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva o motivo da alteração e os novos valores..."
                  value={newAlteracaoDetalhes}
                  onChange={(e) => setNewAlteracaoDetalhes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHistoryModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Centralized KB Article Drawer */}
      {showAddArticleModal && (
        <ArtigoFormDrawer
          isOpen={showAddArticleModal}
          onClose={() => setShowAddArticleModal(false)}
          systemTables={systemTables}
          systemUsers={systemUsers}
          onSave={handleSaveArtigoDrawer}
          onShowToast={onShowToast}
        />
      )}

      {/* RIGHT DRAWER: REGISTRAR INFORMAÇÕES DE MANUTENÇÃO */}
      {showMaintenanceDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingMaintItem ? 'Editar Detalhes da Manutenção' : 'Registrar Detalhes da Manutenção'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingMaintItem ? (
                      <span>Alterando registro de manutenção de {equipamento.nome}.</span>
                    ) : (
                      <span>O equipamento {equipamento.nome} ({equipamento.codigo}) retornará para o status <strong className="text-emerald-600 dark:text-emerald-400">Ativo</strong>.</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMaintenanceDrawer(false);
                  // Reset form fields
                  setMaintDescricao('');
                  setMaintTeveValor('Não');
                  setMaintValor('');
                  setMaintPagoPor('Infoserra');
                  setMaintEmpresa('');
                  setMaintObservacoes('');
                  setEditingMaintItem(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scrollable Body */}
            <form onSubmit={handleSaveMaintenance} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-xs">
              
              {/* Alerta de Transição */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex gap-3.5 items-start">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 block">Confirmação de Retorno</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    Preencha as informações técnicas do serviço realizado. Elas serão salvas na linha do tempo de manutenção e servirão como histórico vital para auditorias e consultas futuras deste ativo.
                  </p>
                </div>
              </div>

              {/* Qual Manutenção Realizada */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Qual manutenção foi realizada? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca da fonte queimada por modelo original, reinstalação do firmware v3.2."
                  value={maintDescricao}
                  onChange={(e) => setMaintDescricao(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                />
              </div>

              {/* Empresa Responsável */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Empresa / Assistência Responsável pela Manutenção *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Infoserra (Bancada Interna), Dell Brasil, Assistência Técnica Autorizada."
                  value={maintEmpresa}
                  onChange={(e) => setMaintEmpresa(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                />
              </div>

              {/* Se teve valor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Houve custo financeiro associado? *
                  </label>
                  <select
                    value={maintTeveValor}
                    onChange={(e) => setMaintTeveValor(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="Não">Não (Garantia ou custo zero)</option>
                    <option value="Sim">Sim (Registrar valor)</option>
                  </select>
                </div>

                {maintTeveValor === 'Sim' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Valor do Serviço (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0,00"
                      value={maintValor}
                      onChange={(e) => setMaintValor(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Pago Por */}
              {maintTeveValor === 'Sim' && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Quem arcou com os custos desta manutenção? *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`flex items-center justify-center p-3.5 rounded-xl border cursor-pointer transition-all ${
                        maintPagoPor === 'Infoserra'
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pagoPor"
                        value="Infoserra"
                        checked={maintPagoPor === 'Infoserra'}
                        onChange={() => setMaintPagoPor('Infoserra')}
                        className="sr-only"
                      />
                      <span>Pago pela Infoserra</span>
                    </label>

                    <label
                      className={`flex items-center justify-center p-3.5 rounded-xl border cursor-pointer transition-all ${
                        maintPagoPor === 'Cliente'
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pagoPor"
                        value="Cliente"
                        checked={maintPagoPor === 'Cliente'}
                        onChange={() => setMaintPagoPor('Cliente')}
                        className="sr-only"
                      />
                      <span>Pago pelo Cliente</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Observações Técnicas */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Observações Técnicas / Detalhes Adicionais
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Troca de capacitores estufados, testes de estresse por 12 horas concluídos com sucesso sem queda de conexão."
                  value={maintObservacoes}
                  onChange={(e) => setMaintObservacoes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 leading-relaxed"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaintenanceDrawer(false);
                    // Reset form fields
                    setMaintDescricao('');
                    setMaintTeveValor('Não');
                    setMaintValor('');
                    setMaintPagoPor('Infoserra');
                    setMaintEmpresa('');
                    setMaintObservacoes('');
                    setEditingMaintItem(null);
                  }}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {editingMaintItem ? 'Salvar Alterações' : 'Salvar e Ativar Equipamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK VIEW MODAL FOR INSPECTING ITEMS */}
      <QuickViewModal
        isOpen={quickViewModal.isOpen}
        onClose={() =>
          setQuickViewModal({ isOpen: false, type: 'equipamento', data: null })
        }
        entityType={quickViewModal.type}
        data={quickViewModal.data}
        onOpenWorkspace={(type, data) => {
          // If viewing an equipment, we are already in Equipment Workspace, but if another equipment:
          console.log('Opened workspace from equipment workspace:', type, data);
        }}
      />
    </div>
  );
};
