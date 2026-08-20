import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FolderTree,
  Boxes,
  Wrench,
  Headphones,
  Building2,
  HelpCircle,
  ShieldAlert,
  BookOpen,
  Tag,
  X,
  Sparkles,
  Box,
  Palette,
  Check,
  Layers,
  Video,
  UserCheck,
  Info,
  SlidersHorizontal
} from 'lucide-react';
import { 
  SystemTablesData, 
  SystemTableKey, 
  SystemTableItem, 
  EquipmentCustomFieldDef,
  Cliente,
  AtendimentoItem,
  AtendimentoFixoItem,
  RegistroItem,
  ArtigoKBItem 
} from '../../types';
import {
  SystemTableGroupKey,
  SystemTableGroupMeta,
  SystemTableMeta
} from '../../data/mockSystemTables';
import { EQUIPMENT_ICONS_LIST } from '../../lib/equipmentIcons';

interface TabelasDoSistemaViewProps {
  systemTables: SystemTablesData;
  systemTableDefinitions: SystemTableMeta[];
  systemTableGroups: SystemTableGroupMeta[];
  onUpdateDefinitions: (defs: SystemTableMeta[]) => void;
  onUpdateGroups: (grps: SystemTableGroupMeta[]) => void;
  onUpdateItem: (tableKey: SystemTableKey, item: SystemTableItem) => void;
  onAddItem: (tableKey: SystemTableKey, item: SystemTableItem) => void;
  onDeleteItem?: (tableKey: SystemTableKey, itemId: string) => void;
  onShowToast?: (title: string, message: string) => void;
  clients?: Cliente[];
  atendimentos?: AtendimentoItem[];
  atendimentosFixos?: AtendimentoFixoItem[];
  registros?: RegistroItem[];
  artigos?: ArtigoKBItem[];
}

const BADGE_COLOR_OPTIONS = [
  { key: 'emerald', label: 'Verde (Ativo / Sucesso / Concluído)', bg: 'bg-emerald-100 dark:bg-emerald-950/80', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' },
  { key: 'amber', label: 'Amarelo (Pendente / Alerta / Média)', bg: 'bg-amber-100 dark:bg-amber-950/80', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800' },
  { key: 'rose', label: 'Vermelho (Crítico / Urgente / Alta)', bg: 'bg-rose-100 dark:bg-rose-950/80', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800' },
  { key: 'sky', label: 'Azul (Informação / Em Andamento)', bg: 'bg-sky-100 dark:bg-sky-950/80', text: 'text-sky-800 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-800' },
  { key: 'indigo', label: 'Índigo (Destaque / Padrão)', bg: 'bg-indigo-100 dark:bg-indigo-950/80', text: 'text-indigo-800 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-800' },
  { key: 'purple', label: 'Roxo (Especial / VIP / Revisão)', bg: 'bg-purple-100 dark:bg-purple-950/80', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800' },
  { key: 'slate', label: 'Cinza (Neutro / Inativo / Cancelado)', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' }
];

const isStatusOrPrioridadeTable = (key: string): boolean => {
  const lowercaseKey = key.toLowerCase();
  return (
    lowercaseKey.includes('status') ||
    lowercaseKey.includes('prioridade') ||
    lowercaseKey.includes('classificacao') ||
    lowercaseKey.includes('classificacoes')
  );
};

export const TabelasDoSistemaView: React.FC<TabelasDoSistemaViewProps> = ({
  systemTables,
  systemTableDefinitions: definitions,
  systemTableGroups: groups,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onShowToast,
  clients = [],
  atendimentos = [],
  atendimentosFixos = [],
  registros = [],
  artigos = []
}) => {
  // Check if a system table item is being used anywhere in the system
  const isItemInUse = (tableKey: SystemTableKey, itemName: string): boolean => {
    if (!itemName) return false;
    const nameLower = itemName.toLowerCase().trim();

    const safeClients = clients || [];
    const safeAtendimentos = atendimentos || [];
    const safeRegistros = registros || [];
    const safeArtigos = artigos || [];
    const safeAtendimentosFixos = atendimentosFixos || [];

    switch (tableKey) {
      case 'sistemas':
        return (
          safeClients.some(c => c.sistemasModulos?.some(sm => sm.sistema?.toLowerCase().trim() === nameLower)) ||
          safeAtendimentos.some(a => a.sistemasModulos?.some(sm => sm.sistema?.toLowerCase().trim() === nameLower)) ||
          safeRegistros.some(r => r.sistema?.toLowerCase().trim() === nameLower) ||
          safeArtigos.some(art => art.sistemaPertencente?.toLowerCase().trim() === nameLower)
        );
      case 'modulos':
        return (
          safeClients.some(c => c.sistemasModulos?.some(sm => sm.modulo?.toLowerCase().trim() === nameLower)) ||
          safeAtendimentos.some(a => a.modulo?.toLowerCase().trim() === nameLower || a.sistemasModulos?.some(sm => sm.modulo?.toLowerCase().trim() === nameLower)) ||
          safeRegistros.some(r => r.modulo?.toLowerCase().trim() === nameLower) ||
          safeArtigos.some(art => art.modulo?.toLowerCase().trim() === nameLower)
        );
      case 'statusCliente':
        return safeClients.some(c => c.status?.toLowerCase().trim() === nameLower);
      case 'segmentosCliente':
        return safeClients.some(c => c.segmento?.toLowerCase().trim() === nameLower);
      case 'classificacoesCliente':
        return safeClients.some(c => c.classificacao?.toLowerCase().trim() === nameLower);
      case 'tiposInstalacao':
        return safeClients.some(c => c.tipoInstalacao?.toLowerCase().trim() === nameLower);
      case 'statusAtendimento':
        return safeAtendimentos.some(a => a.status?.toLowerCase().trim() === nameLower);
      case 'prioridadesAtendimento':
        return safeAtendimentos.some(a => a.prioridade?.toLowerCase().trim() === nameLower);
      case 'categoriasAtendimento':
        return safeAtendimentos.some(a => a.categoria?.toLowerCase().trim() === nameLower);
      case 'motivosAtendimento':
        return safeAtendimentos.some(a => a.motivoProcedimento?.toLowerCase().trim() === nameLower);
      case 'setoresApoio':
        return safeAtendimentos.some(a => a.origemApoio?.toLowerCase().trim() === nameLower);
      case 'tiposApoio':
        return safeAtendimentos.some(a => a.tipoApoio?.toLowerCase().trim() === nameLower);
      case 'statusRegistro':
        return safeRegistros.some(r => r.status?.toLowerCase().trim() === nameLower);
      case 'prioridadesRegistro':
        return safeRegistros.some(r => r.prioridade?.toLowerCase().trim() === nameLower);
      case 'tiposRegistro':
        return safeRegistros.some(r => r.tipo?.toLowerCase().trim() === nameLower);
      case 'impactosRegistro':
        return safeRegistros.some(r => r.impacto?.toLowerCase().trim() === nameLower);
      case 'statusAtendimentoFixo':
        return safeAtendimentosFixos.some(af => af.status?.toLowerCase().trim() === nameLower);
      case 'tiposManutencaoFixa':
        return safeAtendimentosFixos.some(af => 
          af.periodoManutencao?.toLowerCase().trim() === nameLower || 
          af.periodoManutencao?.toLowerCase().trim().includes(nameLower)
        );
      case 'tiposEquipamento':
        return (
          safeClients.some(c => c.equipamentos?.some(e => e.tipo?.toLowerCase().trim() === nameLower)) ||
          safeAtendimentosFixos.some(af => af.equipamentos?.some(e => e.nome?.toLowerCase().trim() === nameLower))
        );
      case 'statusEquipamento':
        return (
          safeClients.some(c => c.equipamentos?.some(e => e.status?.toLowerCase().trim() === nameLower)) ||
          safeAtendimentosFixos.some(af => af.equipamentos?.some(e => e.status?.toLowerCase().trim() === nameLower))
        );
      case 'localizacoesEquipamento':
        return safeClients.some(c => c.equipamentos?.some(e => e.localizacao?.toLowerCase().trim() === nameLower));
      case 'marcasEquipamento':
        return safeClients.some(c => c.equipamentos?.some(e => e.marcaModelo?.toLowerCase().trim().includes(nameLower)));
      case 'statusBaseConhecimento':
      case 'statusVideo':
        return safeArtigos.some(art => art.status?.toLowerCase().trim() === nameLower);
      case 'tiposBaseConhecimento':
        return safeArtigos.some(art => art.tipoArtigo?.toLowerCase().trim() === nameLower);
      case 'categoriasVideo':
        return safeArtigos.some(art => art.categoria?.toLowerCase().trim() === nameLower);
      case 'niveisVideo':
        return safeArtigos.some(art => art.nivel?.toLowerCase().trim() === nameLower);
      case 'origensCusto':
        return safeAtendimentosFixos.some(af => af.equipamentos?.some(e => e.origemCusto?.toLowerCase().trim() === nameLower));
      default:
        return false;
    }
  };


  // Active Group / Sector Filter
  const [activeGroupKey, setActiveGroupKey] = useState<string | 'todos'>('todos');

  // Search & Status Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  // Right Drawer State for Creating / Editing Option Items
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ tableKey: SystemTableKey, item: SystemTableItem } | null>(null);
  const [targetTableKey, setTargetTableKey] = useState<SystemTableKey>('statusAtendimento');
  const [editingItem, setEditingItem] = useState<SystemTableItem | null>(null);

  // Form Fields
  const [formNome, setFormNome] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formStatus, setFormStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [formSistemaId, setFormSistemaId] = useState('');
  const [formIcon, setFormIcon] = useState('Box');
  const [formColor, setFormColor] = useState('indigo');
  const [formError, setFormError] = useState('');

  // Equipment custom conditional fields
  const [formCamposDinamicos, setFormCamposDinamicos] = useState<EquipmentCustomFieldDef[]>([]);
  // Local state for dynamic field form
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<string>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptionsString, setNewFieldOptionsString] = useState('');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);

  // Target Table Metadata
  const targetTableMeta = useMemo(() => {
    const safeDefs = definitions || [];
    const found = safeDefs.find((d) => d.key === targetTableKey);
    return found || safeDefs[0] || {
      key: targetTableKey,
      groupKey: 'atendimento' as any,
      label: 'Tabela do Sistema',
      labelSingular: 'Opção',
      description: 'Gerenciamento de opções',
      hasSistemaVinculo: false
    };
  }, [targetTableKey, definitions]);

  // Available Sistemas for Module linking
  const availableSistemas = useMemo(() => {
    return systemTables?.sistemas ? systemTables.sistemas.filter((s) => s && s.status === 'Ativo') : [];
  }, [systemTables]);

  // Filtered Groups based on Sector filter
  const visibleGroups = useMemo(() => {
    const safeGroups = groups || [];
    if (activeGroupKey === 'todos') {
      return safeGroups;
    }
    return safeGroups.filter((g) => g && g.key === activeGroupKey);
  }, [activeGroupKey, groups]);

  // Open Drawer for Create Item
  const handleOpenNewItemDrawer = (tableKey: SystemTableKey) => {
    setTargetTableKey(tableKey);
    setEditingItem(null);
    setFormNome('');
    setFormDescricao('');
    setFormStatus('Ativo');
    setFormIcon('Box');
    setFormColor('indigo');
    setFormError('');
    setFormCamposDinamicos([]);
    // reset dynamic field form state
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptionsString('');
    setNewFieldPlaceholder('');
    setEditingFieldKey(null);

    const meta = definitions.find((d) => d.key === tableKey);
    if (meta?.hasSistemaVinculo && availableSistemas.length > 0) {
      setFormSistemaId(availableSistemas[0].id);
    } else {
      setFormSistemaId('');
    }

    setIsDrawerOpen(true);
  };

  // Open Drawer for Edit Item
  const handleOpenEditItemDrawer = (tableKey: SystemTableKey, item: SystemTableItem) => {
    setTargetTableKey(tableKey);
    setEditingItem(item);
    setFormNome(item.nome);
    setFormDescricao(item.descricao || '');
    setFormStatus(item.status);
    setFormIcon(item.icon || 'Box');
    setFormColor(item.color || 'indigo');
    setFormSistemaId(item.sistemaId || (availableSistemas[0]?.id || ''));
    setFormError('');
    setFormCamposDinamicos(item.camposDinamicos || []);
    // reset dynamic field form state
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptionsString('');
    setNewFieldPlaceholder('');
    setEditingFieldKey(null);

    setIsDrawerOpen(true);
  };

  // Save Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNome.trim()) {
      setFormError('O nome do item é obrigatório.');
      return;
    }

    if (targetTableMeta.hasSistemaVinculo && !formSistemaId) {
      setFormError('Selecione um sistema para vincular este módulo.');
      return;
    }

    const selectedSistemaObj = availableSistemas.find((s) => s.id === formSistemaId);

    if (editingItem) {
      const updated: SystemTableItem = {
        ...editingItem,
        nome: formNome.trim(),
        descricao: formDescricao.trim() || undefined,
        status: formStatus,
        sistemaId: targetTableMeta.hasSistemaVinculo ? formSistemaId : undefined,
        sistemaNome: targetTableMeta.hasSistemaVinculo ? selectedSistemaObj?.nome : undefined,
        icon: formIcon,
        color: formColor,
        camposDinamicos: !isStatusOrPrioridadeTable(targetTableKey) ? formCamposDinamicos : undefined,
        updatedAt: new Date().toLocaleDateString('pt-BR')
      };

      onUpdateItem(targetTableKey, updated);
      if (onShowToast) {
        onShowToast('Opção Atualizada', `"${updated.nome}" foi atualizada com sucesso.`);
      }
    } else {
      const newItem: SystemTableItem = {
        id: `tbl-${Date.now()}`,
        nome: formNome.trim(),
        descricao: formDescricao.trim() || undefined,
        status: formStatus,
        sistemaId: targetTableMeta.hasSistemaVinculo ? formSistemaId : undefined,
        sistemaNome: targetTableMeta.hasSistemaVinculo ? selectedSistemaObj?.nome : undefined,
        icon: formIcon,
        color: formColor,
        camposDinamicos: !isStatusOrPrioridadeTable(targetTableKey) ? formCamposDinamicos : undefined,
        createdAt: new Date().toLocaleDateString('pt-BR')
      };

      onAddItem(targetTableKey, newItem);
      if (onShowToast) {
        onShowToast('Nova Opção Criada', `"${newItem.nome}" foi adicionada à tabela.`);
      }
    }

    setIsDrawerOpen(false);
  };

  // Toggle Item Status
  const handleToggleStatus = (tableKey: SystemTableKey, item: SystemTableItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = item.status === 'Ativo' ? 'Inativo' : 'Ativo';
    const updated: SystemTableItem = {
      ...item,
      status: nextStatus,
      updatedAt: new Date().toLocaleDateString('pt-BR')
    };
    onUpdateItem(tableKey, updated);
    if (onShowToast) {
      onShowToast('Status Alterado', `"${item.nome}" alterado para ${nextStatus}.`);
    }
  };

  // Delete Item
  const handleDeleteItem = (tableKey: SystemTableKey, item: SystemTableItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(`[SIGI] Solicitando exclusão de item: ${item.nome} na tabela ${tableKey}`);

    try {
      // Check if item is in use
      const inUse = isItemInUse(tableKey, item.nome);
      console.log(`[SIGI] Item em uso? ${inUse}`);

      if (inUse) {
        const msg = `A opção "${item.nome}" está vinculada a registros no sistema e não pode ser excluída. Recomendamos inativá-la.`;
        if (onShowToast) {
          onShowToast('Ação Bloqueada', msg, 'error');
        } else {
          alert(msg);
        }
        return;
      }

      // Em vez de window.confirm, usamos o estado do modal customizado
      setItemToDelete({ tableKey, item });
    } catch (err) {
      console.error('[SIGI] Erro ao processar exclusão:', err);
    }
  };

  const confirmDeletion = () => {
    if (!itemToDelete) {
      console.warn('[SIGI] Tentativa de confirmar exclusão sem item selecionado.');
      return;
    }
    
    console.log(`[SIGI] Confirmando exclusão definitiva de: ${itemToDelete.item.nome}`);
    
    if (onDeleteItem) {
      onDeleteItem(itemToDelete.tableKey, itemToDelete.item.id);
      if (onShowToast) {
        onShowToast('Sucesso', `Opção "${itemToDelete.item.nome}" excluída com sucesso.`);
      }
    }
    setItemToDelete(null);
  };


  // Sector Icon Helper
  const getGroupIcon = (groupKey: SystemTableGroupKey) => {
    switch (groupKey) {
      case 'cliente':
        return <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'atendimento':
        return <Headphones className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
      case 'atendimentosFixos':
        return <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
      case 'registros':
        return <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
      case 'equipamentos':
        return <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
      case 'conhecimento':
        return <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />;
      case 'videos':
        return <Video className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />;
      case 'sistemasModulos':
        return <Boxes className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />;
      case 'apoio':
        return <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      default:
        return <FolderTree className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  // Badge Color Pill Helper
  const renderBadgePill = (label: string, colorKey?: string) => {
    const config = BADGE_COLOR_OPTIONS.find((c) => c.key === colorKey) || BADGE_COLOR_OPTIONS[4];
    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${config.bg} ${config.text} ${config.border} whitespace-nowrap inline-flex items-center gap-1.5 shadow-2xs`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 shadow-2xs shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white break-words">
                Opções & Tabelas dos Formulários
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3" /> Administração de Opções
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 break-words leading-relaxed">
              Gerencie as listas de opções, status, categorias e prioridades que alimentam os formulários de Clientes, Atendimentos, Inventário e Chamados.
            </p>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-auto">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar opção..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40 sm:w-52"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Segmented Switch */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('ativo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === 'ativo'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setStatusFilter('inativo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === 'inativo'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Inativos
            </button>
          </div>
        </div>
      </div>

      {/* SECTOR / FORM NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveGroupKey('todos')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeGroupKey === 'todos'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Todos os Formulários ({(groups || []).length})</span>
        </button>

        {(groups || []).map((group) => {
          if (!group) return null;
          const isActive = activeGroupKey === group.key;
          return (
            <button
              key={group.key}
              onClick={() => setActiveGroupKey(group.key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
              }`}
            >
              {getGroupIcon(group.key)}
              <span>{group.label}</span>
            </button>
          );
        })}
      </div>

      {/* FORM OPTION GROUPS & TABLES */}
      <div className="space-y-8">
        {visibleGroups.map((group) => {
          if (!group) return null;

          return (
            <div
              key={group.key}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6"
            >
              {/* Group Sector Header */}
              <div className="flex items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                    {getGroupIcon(group.key)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white break-words">
                      Formulário: {group.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 break-words mt-0.5">
                      {group.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Render Tables in Group */}
              <div className="grid grid-cols-1 gap-6">
                {(group.tableKeys || []).map((tableKey) => {
                  const meta = (definitions || []).find((d) => d.key === tableKey);
                  if (!meta) return null;

                  const rawItems = (systemTables && systemTables[tableKey]) || [];

                  // Apply search term and status filter
                  const items = rawItems.filter((item) => {
                    if (!item) return false;
                    const matchesStatus =
                      statusFilter === 'todos' ||
                      (statusFilter === 'ativo' && item.status === 'Ativo') ||
                      (statusFilter === 'inativo' && item.status === 'Inativo');

                    const query = searchTerm.trim().toLowerCase();
                    const matchesSearch =
                      !query ||
                      (item.nome && item.nome.toLowerCase().includes(query)) ||
                      (item.descricao && item.descricao.toLowerCase().includes(query)) ||
                      (item.sistemaNome && item.sistemaNome.toLowerCase().includes(query));

                    return matchesStatus && matchesSearch;
                  });

                  // If searching and table has no matching items, skip showing empty box unless table name matches search
                  if (searchTerm && items.length === 0 && !meta.label.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return null;
                  }

                  return (
                    <div
                      key={tableKey}
                      className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl p-5 space-y-4"
                    >
                      {/* Table Header & Create Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                            <span className="break-words">{meta.label}</span>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold shrink-0">
                              {items.length} {items.length === 1 ? 'opção' : 'opções'}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 break-words mt-0.5">
                            {meta.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenNewItemDrawer(tableKey)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-[1.02] shrink-0 self-start sm:self-auto"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Nova {meta.labelSingular}</span>
                        </button>
                      </div>

                      {/* Item Cards List */}
                      {items.length === 0 ? (
                        <div className="py-6 text-center bg-white dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                          <Info className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Nenhuma opção cadastrada nesta tabela {searchTerm ? 'com os filtros aplicados' : 'ainda'}.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleOpenNewItemDrawer(tableKey)}
                            className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                          >
                            + Cadastrar a primeira opção
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {items.map((item) => {
                            const isStatusOrPrioridade = isStatusOrPrioridadeTable(tableKey);
                            const ItemIcon = isStatusOrPrioridade && item.icon
                              ? EQUIPMENT_ICONS_LIST.find((i) => i.key === item.icon)?.icon || Box
                              : null;

                            return (
                              <div
                                key={item.id}
                                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {ItemIcon && (
                                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 shrink-0">
                                          <ItemIcon className="w-4 h-4" />
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        {isStatusOrPrioridade && item.color ? (
                                          renderBadgePill(item.nome, item.color)
                                        ) : (
                                          <h5 className="text-xs font-extrabold text-slate-900 dark:text-white break-words">
                                            {item.nome}
                                          </h5>
                                        )}
                                      </div>
                                    </div>

                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                                        item.status === 'Ativo'
                                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                  </div>

                                  {item.sistemaNome && (
                                    <span className="inline-block px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-bold">
                                      Sistema: {item.sistemaNome}
                                    </span>
                                  )}

                                  {item.descricao && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 break-words leading-relaxed line-clamp-2">
                                      {item.descricao}
                                    </p>
                                  )}
                                </div>

                                {/* Item Actions */}
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditItemDrawer(tableKey, item)}
                                    className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Editar opção"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleStatus(tableKey, item, e)}
                                    className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title={item.status === 'Ativo' ? 'Inativar opção' : 'Ativar opção'}
                                  >
                                    {item.status === 'Ativo' ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                    )}
                                  </button>

                                  {onDeleteItem && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteItem(tableKey, item, e)}
                                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                                      title="Excluir opção"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO CUSTOMIZADO */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirmar Exclusão</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Esta ação é irreversível.</p>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                Tem certeza que deseja excluir a opção <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">"{itemToDelete.item.nome}"</span>?
              </p>
              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>O item não poderá mais ser selecionado em novos formulários.</span>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <button
                onClick={() => {
                  console.log('[SIGI] Exclusão cancelada via botão Cancelar do modal.');
                  setItemToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  console.log('[SIGI] Exclusão confirmada via botão Excluir do modal.');
                  confirmDeletion();
                }}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                Excluir Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT DRAWER: OPTION ITEM CREATION / EDITING */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingItem ? `Editar ${targetTableMeta.labelSingular}` : `Nova ${targetTableMeta.labelSingular}`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tabela: <strong className="text-indigo-600 dark:text-indigo-400">{targetTableMeta.label}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nome do Item */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span>Nome da Opção</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={`Ex: ${targetTableMeta.labelSingular} Exemplo...`}
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Vinculo de Sistema (se aplicavel) */}
              {targetTableMeta.hasSistemaVinculo && (
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span>Sistema Vinculado</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSistemaId}
                    onChange={(e) => setFormSistemaId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione o sistema...</option>
                    {availableSistemas.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Descrição */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Descrição / Finalidade da Opção
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva a regra de uso ou instrução desta opção..."
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {isStatusOrPrioridadeTable(targetTableKey) && (
                <>
                  {/* Cor do Badge / Visual */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>Cor do Badge / Identificador Visual</span>
                      {formNome && renderBadgePill(formNome, formColor)}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {BADGE_COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setFormColor(c.key)}
                          className={`px-3 py-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                            formColor === c.key
                              ? `border-slate-900 dark:border-white ring-2 ring-slate-900/10 dark:ring-white/10 ${c.bg}`
                              : `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800`
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${c.bg} border border-current opacity-70`} />
                          <span className={`text-[11px] font-extrabold ${c.text}`}>{c.label}</span>
                          {formColor === c.key && <Check className="w-3.5 h-3.5 ml-auto text-current" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ícone Representativo */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      Ícone Representativo (Opcional)
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                      {EQUIPMENT_ICONS_LIST.map((ic) => {
                        const IconComp = ic.icon;
                        const isSelected = formIcon === ic.key;
                        return (
                          <button
                            key={ic.key}
                            type="button"
                            onClick={() => setFormIcon(ic.key)}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                            }`}
                            title={ic.label}
                          >
                            <IconComp className="w-4 h-4" />
                            <span className="text-[9px] font-bold truncate max-w-full">{ic.label.split('/')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Campos Condicionais para Tabelas Comuns de Cadastro */}
              {!isStatusOrPrioridadeTable(targetTableKey) && (
                <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                    <FolderTree className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Campos Específicos (Condicionais)
                    </h4>
                  </div>

                  {/* Arvore/Lista de Campos cadastrados */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Árvore de Campos Definidos ({formCamposDinamicos.length})
                    </label>

                    {formCamposDinamicos.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-center">
                        <p className="text-xs text-slate-400 italic">Nenhum campo adicional cadastrado. Este tipo usará apenas os campos fixos.</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {formCamposDinamicos.map((field) => (
                          <div
                            key={field.key}
                            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 shadow-2xs hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{field.label}</span>
                                {field.required && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-[9px] font-extrabold">Obrigatório</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-400 font-medium">
                                <span className="font-mono bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-500 dark:text-slate-400">Chave: {field.key}</span>
                                <span>•</span>
                                <span className="capitalize">Tipo: {field.type || 'Texto'}</span>
                                {field.options && field.options.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[200px]" title={field.options.join(', ')}>Opções: {field.options.join(', ')}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingFieldKey(field.key);
                                  setNewFieldLabel(field.label);
                                  setNewFieldType(field.type || 'text');
                                  setNewFieldRequired(!!field.required);
                                  setNewFieldOptionsString(field.options ? field.options.join(', ') : '');
                                  setNewFieldPlaceholder(field.placeholder || '');
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Editar campo"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormCamposDinamicos(formCamposDinamicos.filter((f) => f.key !== field.key));
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Excluir campo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form para Adicionar/Editar Campo */}
                  <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {editingFieldKey ? 'Editar Campo Existente' : 'Adicionar Novo Campo de Formulário'}
                      </span>
                      {editingFieldKey && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFieldKey(null);
                            setNewFieldLabel('');
                            setNewFieldType('text');
                            setNewFieldRequired(false);
                            setNewFieldOptionsString('');
                            setNewFieldPlaceholder('');
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-extrabold flex items-center gap-1"
                        >
                          Cancelar Edição
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Rótulo / Nome do Campo</label>
                        <input
                          type="text"
                          placeholder="Ex: Sistema Operacional"
                          value={newFieldLabel}
                          onChange={(e) => setNewFieldLabel(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Tipo do Input</label>
                        <select
                          value={newFieldType}
                          onChange={(e) => setNewFieldType(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="text">Texto Simples (text)</option>
                          <option value="number">Numérico (number)</option>
                          <option value="password">Senha / Oculto (password)</option>
                          <option value="textarea">Texto Grande (textarea)</option>
                          <option value="boolean">Sim/Não (boolean)</option>
                          <option value="date">Data (date)</option>
                          <option value="select">Seleção / Dropdown (select)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Placeholder (Opcional)</label>
                        <input
                          type="text"
                          placeholder="Ex: Ex: Windows 11 Pro"
                          value={newFieldPlaceholder}
                          onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="required_chk"
                          checked={newFieldRequired}
                          onChange={(e) => setNewFieldRequired(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="required_chk" className="text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                          Campo Obrigatório?
                        </label>
                      </div>
                    </div>

                    {newFieldType === 'select' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Opções da Seleção (Separadas por vírgula)</label>
                        <input
                          type="text"
                          placeholder="Ex: Opção A, Opção B, Opção C"
                          value={newFieldOptionsString}
                          onChange={(e) => setNewFieldOptionsString(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (!newFieldLabel.trim()) {
                          alert('Informe o rótulo do campo!');
                          return;
                        }

                        const generatedKey = editingFieldKey || newFieldLabel.trim()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '');

                        if (!editingFieldKey && formCamposDinamicos.some((f) => f.key === generatedKey)) {
                          alert('Já existe um campo com esse nome/identificador!');
                          return;
                        }

                        const parsedOptions = newFieldOptionsString
                          ? newFieldOptionsString.split(',').map((o) => o.trim()).filter(Boolean)
                          : undefined;

                        const updatedField: EquipmentCustomFieldDef = {
                          key: generatedKey,
                          label: newFieldLabel.trim(),
                          type: newFieldType as any,
                          required: newFieldRequired,
                          options: parsedOptions,
                          placeholder: newFieldPlaceholder.trim() || undefined
                        };

                        if (editingFieldKey) {
                          setFormCamposDinamicos(formCamposDinamicos.map((f) => f.key === editingFieldKey ? updatedField : f));
                          setEditingFieldKey(null);
                        } else {
                          setFormCamposDinamicos([...formCamposDinamicos, updatedField]);
                        }

                        setNewFieldLabel('');
                        setNewFieldType('text');
                        setNewFieldRequired(false);
                        setNewFieldOptionsString('');
                        setNewFieldPlaceholder('');
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingFieldKey ? 'Atualizar Campo na Árvore' : 'Adicionar Campo à Árvore'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Status no Sistema
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Ativo')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formStatus === 'Ativo'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Ativo
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('Inativo')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formStatus === 'Inativo'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Inativo
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                >
                  {editingItem ? 'Salvar Alterações' : 'Criar Opção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
