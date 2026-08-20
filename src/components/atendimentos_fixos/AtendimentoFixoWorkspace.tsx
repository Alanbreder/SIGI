import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Wrench,
  Building2,
  UserCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Package,
  BookOpen,
  Paperclip,
  Upload,
  Plus,
  Trash2,
  Save,
  Share2,
  ExternalLink,
  History,
  Check,
  Pencil,
  Edit3,
  X,
  DollarSign,
  CreditCard,
  Camera,
} from 'lucide-react';
import {
  AtendimentoFixoItem,
  EquipamentoManutencaoItem,
  AnexoItem,
  ArtigoKBItem,
  AtendimentoFixoTimelineItem,
  Cliente,
  UserAccount,
  SystemTablesData,
} from '../../types';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { initialUsers } from '../../data/mockUsers';
import { ArtigoFormDrawer } from '../drawers/ArtigoFormDrawer';

interface AtendimentoFixoWorkspaceProps {
  atendimento: AtendimentoFixoItem;
  onBack: () => void;
  onUpdateAtendimento: (updated: AtendimentoFixoItem) => void;
  onDeleteAtendimento?: (id: string) => void;
  onShowToast?: (title: string, message: string) => void;
  allArtigos?: ArtigoKBItem[];
  allClients?: Cliente[];
  systemTables?: any;
  onOpenArtigoWorkspace?: (artigo: ArtigoKBItem) => void;
  onCreateArtigoFromMaintenance?: (artigo: ArtigoKBItem) => void;
  systemUsers?: UserAccount[];
}

export const AtendimentoFixoWorkspace: React.FC<AtendimentoFixoWorkspaceProps> = ({
  atendimento,
  onBack,
  onUpdateAtendimento,
  onDeleteAtendimento,
  onShowToast,
  allArtigos = [],
  allClients = [],
  systemTables,
  onOpenArtigoWorkspace,
  onCreateArtigoFromMaintenance,
  systemUsers = initialUsers,
}) => {
  // Local state initialized with atendimento props
  const [currentAtendimento, setCurrentAtendimento] = useState<AtendimentoFixoItem>(atendimento);
  const [activeTab, setActiveTab] = useState<'anotacoes' | 'equipamentos' | 'anexos' | 'conhecimento' | 'timeline'>('anotacoes');
  
  // Notes & General Edit state
  const [anotacoes, setAnotacoes] = useState(atendimento.anotacoes);
  const [status, setStatus] = useState<AtendimentoFixoItem['status']>(atendimento.status);
  const [responsavelTecnico, setResponsavelTecnico] = useState(atendimento.responsavelTecnico);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Edit Service Drawer state
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [localUsers, setLocalUsers] = useState<UserAccount[]>(systemUsers);

  const [editClienteNome, setEditClienteNome] = useState(atendimento.clienteNome);
  const [editUnidade, setEditUnidade] = useState(atendimento.unidade || '');
  const [editResponsavelTecnico, setEditResponsavelTecnico] = useState(atendimento.responsavelTecnico);
  const [editDataManutencao, setEditDataManutencao] = useState(atendimento.dataManutencao || new Date().toISOString().split('T')[0]);
  const [editProximaManutencao, setEditProximaManutencao] = useState(atendimento.proximaManutencao || '');
  const [editPeriodo, setEditPeriodo] = useState(atendimento.periodoManutencao || 'Manutenção Preventiva');
  const [editStatus, setEditStatus] = useState<AtendimentoFixoItem['status']>(atendimento.status);
  const [editAnotacoes, setEditAnotacoes] = useState(atendimento.anotacoes);
  const [editEquipamentos, setEditEquipamentos] = useState<EquipamentoManutencaoItem[]>(atendimento.equipamentos || []);

  // Drawer Equipment UI state
  const [editingEqIdInDrawer, setEditingEqIdInDrawer] = useState<string | null>(null);
  const [drawerNewEqNome, setDrawerNewEqNome] = useState('');
  const [drawerNewEqQtd, setDrawerNewEqQtd] = useState(1);
  const [drawerNewEqValor, setDrawerNewEqValor] = useState('');
  const [drawerNewEqOrigem, setDrawerNewEqOrigem] = useState('');

  const handleAddEqInDrawer = () => {
    if (!drawerNewEqNome.trim()) return;

    setEditEquipamentos((prev) => {
      if (editingEqIdInDrawer) {
        return prev.map((eq) =>
          eq.id === editingEqIdInDrawer
            ? {
                ...eq,
                nome: drawerNewEqNome.trim(),
                quantidade: drawerNewEqQtd,
                valorUnitario: drawerNewEqValor ? parseFloat(String(drawerNewEqValor).replace(',', '.')) : undefined,
                origemCusto: drawerNewEqOrigem || undefined,
                cobrarNaMensalidade: drawerNewEqOrigem.includes('Infoserra'),
              }
            : eq
        );
      } else {
        const newItem: EquipamentoManutencaoItem = {
          id: `eq-${Date.now()}`,
          nome: drawerNewEqNome.trim(),
          quantidade: drawerNewEqQtd,
          valorUnitario: drawerNewEqValor ? parseFloat(String(drawerNewEqValor).replace(',', '.')) : undefined,
          origemCusto: drawerNewEqOrigem || undefined,
          tipo: 'Peça de Reposição',
          cobrarNaMensalidade: drawerNewEqOrigem.includes('Infoserra'),
        };
        return [...prev, newItem];
      }
    });
    setEditingEqIdInDrawer(null);

    setDrawerNewEqNome('');
    setDrawerNewEqQtd(1);
    setDrawerNewEqValor('');
    setDrawerNewEqOrigem('');
  };

  const handleEditEqInDrawer = (eq: EquipamentoManutencaoItem) => {
    setEditingEqIdInDrawer(eq.id);
    setDrawerNewEqNome(eq.nome);
    setDrawerNewEqQtd(eq.quantidade);
    setDrawerNewEqValor(eq.valorUnitario?.toString() || '');
    setDrawerNewEqOrigem(eq.origemCusto || '');
  };

  const handleRemoveEqInDrawer = (id: string) => {
    setEditEquipamentos(editEquipamentos.filter(e => e.id !== id));
  };

  // Timeline Event Detail Drawer state
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<AtendimentoFixoTimelineItem | null>(null);

  // Equipments state
  const [equipamentos, setEquipamentos] = useState<EquipamentoManutencaoItem[]>(atendimento.equipamentos || []);
  const [isAddEqOpen, setIsAddEqOpen] = useState(false);
  const [newEqNome, setNewEqNome] = useState('');
  const [newEqTipo, setNewEqTipo] = useState<EquipamentoManutencaoItem['tipo']>('Comprado pela IS (cobrado na próxima mensalidade)');
  const [newEqQtd, setNewEqQtd] = useState(1);
  const [newEqValor, setNewEqValor] = useState('');
  const [newEqOrigemCusto, setNewEqOrigemCusto] = useState('');
  const [newEqObs, setNewEqObs] = useState('');

  // Editing individual equipment state
  const [editingEq, setEditingEq] = useState<EquipamentoManutencaoItem | null>(null);
  const [editEqNome, setEditEqNome] = useState('');
  const [editEqTipo, setEditEqTipo] = useState<EquipamentoManutencaoItem['tipo']>('Comprado pela IS (cobrado na próxima mensalidade)');
  const [editEqQtd, setEditEqQtd] = useState(1);
  const [editEqValor, setEditEqValor] = useState('');
  const [editEqOrigemCusto, setEditEqOrigemCusto] = useState('');
  const [editEqObs, setEditEqObs] = useState('');
  const [editEqCobrar, setEditEqCobrar] = useState(false);

  // Anexos state
  const [anexos, setAnexos] = useState<AnexoItem[]>(atendimento.anexos || []);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // KB linking state
  const [vinculadosArtigos, setVinculadosArtigos] = useState<ArtigoKBItem[]>(atendimento.artigosVinculados || []);
  const [isLinkArtigoOpen, setIsLinkArtigoOpen] = useState(false);
  const [searchArtigoText, setSearchArtigoText] = useState('');

  // Inline KB Creation modal
  const [isCreateArtigoOpen, setIsCreateArtigoOpen] = useState(false);
  const [newArtigoTitulo, setNewArtigoTitulo] = useState(`Procedimento: ${atendimento.periodoManutencao || 'Manutenção'} - ${atendimento.clienteNome}`);
  const [newArtigoCategoria, setNewArtigoCategoria] = useState('Procedimento Técnico');
  const [newArtigoConteudo, setNewArtigoConteudo] = useState(atendimento.anotacoes);

  // Sync state when props change
  useEffect(() => {
    // Carregar usuários do sistema
    const saved = localStorage.getItem('sip_users');
    if (saved) {
      try {
        setLocalUsers(JSON.parse(saved));
      } catch (e) {
        setLocalUsers(initialUsers);
      }
    } else {
      setLocalUsers(initialUsers);
    }
  }, []);

  useEffect(() => {
    setCurrentAtendimento(atendimento);
    setAnotacoes(atendimento.anotacoes);
    setStatus(atendimento.status);
    setResponsavelTecnico(atendimento.responsavelTecnico);
    setEquipamentos(atendimento.equipamentos || []);
    setAnexos(atendimento.anexos || []);
    setVinculadosArtigos(atendimento.artigosVinculados || []);

    // Also update edit states
    setEditClienteNome(atendimento.clienteNome);
    setEditUnidade(atendimento.unidade || '');
    setEditResponsavelTecnico(atendimento.responsavelTecnico);
    setEditDataManutencao(atendimento.dataManutencao || new Date().toISOString().split('T')[0]);
    setEditProximaManutencao(atendimento.proximaManutencao || '');
    setEditStatus(atendimento.status);
    setEditPeriodo(atendimento.periodoManutencao || 'Manutenção Preventiva');
    setEditAnotacoes(atendimento.anotacoes);
    setEditEquipamentos(atendimento.equipamentos || []);
  }, [atendimento]);

  // Paste screenshot handler (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData || !e.clipboardData.items) return;

      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const fileId = `anx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
            const fileName = `captura_tela_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
            const sizeInKb = (blob.size / 1024).toFixed(1);

            const reader = new FileReader();
            reader.onload = (event) => {
              const previewUrl = event.target?.result as string;
              const newAnexo: AnexoItem = {
                id: fileId,
                nome: fileName,
                tamanho: `${sizeInKb} KB`,
                tipo: blob.type,
                dataUpload: new Date().toLocaleDateString('pt-BR'),
                autor: responsavelTecnico,
                storageType: 'SMB / NAS',
                caminhoArmazenamento: `\\\\NAS-SERVER\\SIGI-Anexos\\atendimentos_fixos\\${atendimento.codigo}\\${fileName}`,
                previewUrl,
              };

              const updatedAnexos = [...anexos, newAnexo];
              setAnexos(updatedAnexos);

              const newTimelineEvent: AtendimentoFixoTimelineItem = {
                id: `tle-${Date.now()}`,
                tipo: 'anexo',
                titulo: 'Imagem Anexada (Ctrl+V)',
                descricao: `Captura de tela ${fileName} adicionada.`,
                autor: responsavelTecnico,
                data: `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
              };

              const updatedAtend = {
                ...currentAtendimento,
                anexos: updatedAnexos,
                timelineEvents: [newTimelineEvent, ...(currentAtendimento.timelineEvents || [])],
              };

              setCurrentAtendimento(updatedAtend);
              onUpdateAtendimento(updatedAtend);

              if (onShowToast) {
                onShowToast('Imagem Colada', 'Imagem colada da área de transferência com sucesso!');
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [anexos, currentAtendimento, responsavelTecnico, atendimento.codigo, onUpdateAtendimento, onShowToast]);

  // Handle Save Notes
  const handleSaveNotes = () => {
    const nowStr = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const timelineEvent: AtendimentoFixoTimelineItem = {
      id: `tle-${Date.now()}`,
      tipo: 'anotacao',
      titulo: 'Anotações Atualizadas',
      descricao: 'Resumo da manutenção de informática editado.',
      autor: responsavelTecnico,
      data: nowStr,
    };

    const updated: AtendimentoFixoItem = {
      ...currentAtendimento,
      anotacoes,
      status,
      responsavelTecnico,
      updatedAt: new Date().toISOString(),
      timelineEvents: [timelineEvent, ...(currentAtendimento.timelineEvents || [])],
    };

    setCurrentAtendimento(updated);
    onUpdateAtendimento(updated);
    setHasUnsavedChanges(false);
    setIsEditingNotes(false);
    if (onShowToast) {
      onShowToast('Alterações Salvas', 'Anotações do atendimento fixo atualizadas.');
    }
  };

  // Handle Save Full Atendimento Edits
  const handleSaveEditAtendimento = () => {
    const nowStr = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const timelineEvent: AtendimentoFixoTimelineItem = {
      id: `tle-${Date.now()}`,
      tipo: 'status',
      titulo: 'Atendimento Editado',
      descricao: `Dados alterados: Data (${editDataManutencao}), Técnico (${editResponsavelTecnico}), Status (${editStatus}).`,
      autor: editResponsavelTecnico,
      data: nowStr,
    };

    const updated: AtendimentoFixoItem = {
      ...currentAtendimento,
      clienteNome: editClienteNome,
      unidade: editUnidade,
      responsavelTecnico: editResponsavelTecnico,
      dataManutencao: editDataManutencao,
      proximaManutencao: editProximaManutencao,
      periodoManutencao: editPeriodo,
      status: editStatus,
      anotacoes: editAnotacoes,
      equipamentos: editEquipamentos,
      updatedAt: new Date().toISOString(),
      timelineEvents: [timelineEvent, ...(currentAtendimento.timelineEvents || [])],
    };

    setCurrentAtendimento(updated);
    setAnotacoes(editAnotacoes);
    setStatus(editStatus);
    setResponsavelTecnico(editResponsavelTecnico);
    setEquipamentos(editEquipamentos);
    onUpdateAtendimento(updated);
    setIsEditDrawerOpen(false);
    if (onShowToast) {
      onShowToast('Atendimento Atualizado', `Informações de ${updated.codigo} salvas com sucesso.`);
    }
  };

  // Open Edit Equipment modal
  const handleOpenEditEquipment = (eq: EquipamentoManutencaoItem) => {
    setEditingEq(eq);
    setEditEqNome(eq.nome);
    setEditEqTipo(eq.tipo);
    setEditEqQtd(eq.quantidade);
    setEditEqValor(eq.valorUnitario !== undefined ? String(eq.valorUnitario) : '');
    setEditEqOrigemCusto(eq.origemCusto || '');
    setEditEqObs(eq.observacoes || '');
    setEditEqCobrar(!!eq.cobrarNaMensalidade || eq.tipo.includes('Comprado pela IS') || eq.origemCusto?.includes('Infoserra'));
  };

  // Save Edit Equipment
  const handleSaveEditEquipment = () => {
    if (!editingEq || !editEqNome.trim()) return;

    const updatedItem: EquipamentoManutencaoItem = {
      ...editingEq,
      nome: editEqNome.trim(),
      tipo: editEqTipo,
      quantidade: Number(editEqQtd) || 1,
      valorUnitario: editEqValor ? parseFloat(String(editEqValor).replace(',', '.')) : undefined,
      origemCusto: editEqOrigemCusto || undefined,
      observacoes: editEqObs.trim() || undefined,
      cobrarNaMensalidade: editEqCobrar || editEqTipo.includes('Comprado pela IS') || editEqOrigemCusto?.includes('Infoserra'),
    };

    const updatedEqs = equipamentos.map((e) => (e.id === editingEq.id ? updatedItem : e));
    setEquipamentos(updatedEqs);
    setEditEquipamentos(updatedEqs); // Sync drawer state as well if it's open

    const timelineEvent: AtendimentoFixoTimelineItem = {
      id: `tle-${Date.now()}`,
      tipo: 'equipamento',
      titulo: `Equipamento Editado: ${updatedItem.nome}`,
      descricao: `Alterado para ${updatedItem.tipo} (Qtd: ${updatedItem.quantidade}).`,
      autor: responsavelTecnico,
      data: `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    };

    const updatedAtend: AtendimentoFixoItem = {
      ...currentAtendimento,
      equipamentos: updatedEqs,
      timelineEvents: [timelineEvent, ...(currentAtendimento.timelineEvents || [])],
    };

    setCurrentAtendimento(updatedAtend);
    onUpdateAtendimento(updatedAtend);
    setEditingEq(null);
    if (onShowToast) {
      onShowToast('Equipamento Atualizado', `${updatedItem.nome} alterado com sucesso.`);
    }
  };

  // Add Equipment
  const handleAddEquipment = () => {
    if (!newEqNome.trim()) return;
    const isCobrar = newEqTipo.includes('Comprado pela IS') || newEqOrigemCusto?.includes('Infoserra');
    const item: EquipamentoManutencaoItem = {
      id: `eqm-${Date.now()}`,
      nome: newEqNome.trim(),
      tipo: newEqTipo,
      quantidade: Number(newEqQtd) || 1,
      valorUnitario: newEqValor ? parseFloat(String(newEqValor).replace(',', '.')) : undefined,
      origemCusto: newEqOrigemCusto || undefined,
      observacoes: newEqObs.trim() || undefined,
      cobrarNaMensalidade: isCobrar,
    };

    const updatedEqs = [...equipamentos, item];
    setEquipamentos(updatedEqs);
    setEditEquipamentos(updatedEqs);

    const timelineEvent: AtendimentoFixoTimelineItem = {
      id: `tle-${Date.now()}`,
      tipo: 'equipamento',
      titulo: `Equipamento ${item.tipo}: ${item.nome}`,
      descricao: `Quantidade: ${item.quantidade}${item.origemCusto ? ` - Origem: ${item.origemCusto}` : ''}${item.observacoes ? ` - ${item.observacoes}` : ''}`,
      autor: responsavelTecnico,
      data: `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    };

    const updated: AtendimentoFixoItem = {
      ...currentAtendimento,
      equipamentos: updatedEqs,
      timelineEvents: [timelineEvent, ...(currentAtendimento.timelineEvents || [])],
    };

    setCurrentAtendimento(updated);
    onUpdateAtendimento(updated);
    setIsAddEqOpen(false);
    setNewEqNome('');
    setNewEqQtd(1);
    setNewEqValor('');
    setNewEqOrigemCusto('');
    setNewEqObs('');
    if (onShowToast) {
      onShowToast('Equipamento Adicionado', `${item.nome} registrado na manutenção.`);
    }
  };

  // Remove Equipment
  const handleRemoveEquipment = (id: string) => {
    const updatedEqs = equipamentos.filter((eq) => eq.id !== id);
    setEquipamentos(updatedEqs);
    setEditEquipamentos(updatedEqs);
    const updated: AtendimentoFixoItem = {
      ...currentAtendimento,
      equipamentos: updatedEqs,
    };
    setCurrentAtendimento(updated);
    onUpdateAtendimento(updated);
  };

  // Handle File Upload from Input/Drop
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const nowStr = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const newItems: AnexoItem[] = Array.from(files).map((file) => {
      const sizeInKb = (file.size / 1024).toFixed(1);
      return {
        id: `anx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        nome: file.name,
        tamanho: `${sizeInKb} KB`,
        tipo: file.type || 'arquivo',
        dataUpload: new Date().toLocaleDateString('pt-BR'),
        autor: responsavelTecnico,
        storageType: 'SMB / NAS',
        caminhoArmazenamento: `\\\\NAS-SERVER\\SIGI-Anexos\\atendimentos_fixos\\${currentAtendimento.codigo}\\${file.name}`,
      };
    });

    const updatedAnexos = [...anexos, ...newItems];
    setAnexos(updatedAnexos);

    const timelineEvent: AtendimentoFixoTimelineItem = {
      id: `tle-${Date.now()}`,
      tipo: 'anexo',
      titulo: `${newItems.length} Arquivo(s) Anexado(s)`,
      descricao: newItems.map((f) => f.nome).join(', '),
      autor: responsavelTecnico,
      data: nowStr,
    };

    const updated: AtendimentoFixoItem = {
      ...currentAtendimento,
      anexos: updatedAnexos,
      timelineEvents: [timelineEvent, ...(currentAtendimento.timelineEvents || [])],
    };

    setCurrentAtendimento(updated);
    onUpdateAtendimento(updated);
    if (onShowToast) {
      onShowToast('Arquivo(s) Anexado(s)', `${newItems.length} novo(s) anexo(s) adicionado(s).`);
    }
  };

  // Remove Anexo
  const handleRemoveAnexo = (id: string) => {
    const updatedAnexos = anexos.filter((a) => a.id !== id);
    setAnexos(updatedAnexos);
    const updated: AtendimentoFixoItem = {
      ...currentAtendimento,
      anexos: updatedAnexos,
    };
    setCurrentAtendimento(updated);
    onUpdateAtendimento(updated);
  };

  // Link existing KB Article
  const handleLinkArticle = (art: ArtigoKBItem) => {
    if (vinculadosArtigos.some((a) => a.id === art.id)) return;
    const updatedVinculados = [...vinculadosArtigos, art];
    setVinculadosArtigos(updatedVinculados);

    const timelineEvent: AtendimentoFixoTimelineItem = {
      id: `tle-${Date.now()}`,
      tipo: 'conhecimento',
      titulo: 'Artigo Vinculado',
      descricao: `Vinculado o artigo: ${art.titulo}`,
      autor: responsavelTecnico,
      data: `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    };

    const updated: AtendimentoFixoItem = {
      ...currentAtendimento,
      artigosVinculados: updatedVinculados,
      timelineEvents: [timelineEvent, ...(currentAtendimento.timelineEvents || [])],
    };

    setCurrentAtendimento(updated);
    onUpdateAtendimento(updated);
    setIsLinkArtigoOpen(false);
    if (onShowToast) {
      onShowToast('Base de Conhecimento', `Artigo "${art.titulo}" vinculado.`);
    }
  };

  const handleSaveArtigoDrawer = (newArtigo: ArtigoKBItem) => {
    if (onCreateArtigoFromMaintenance) {
      onCreateArtigoFromMaintenance(newArtigo);
    }

    const updatedVinculados = [...vinculadosArtigos, newArtigo];
    setVinculadosArtigos(updatedVinculados);

    const timelineEvent: AtendimentoFixoTimelineItem = {
      id: `tle-${Date.now()}`,
      tipo: 'conhecimento',
      titulo: 'Novo Artigo Criado na KB',
      descricao: `Gerado artigo: ${newArtigo.titulo}`,
      autor: responsavelTecnico,
      data: `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    };

    const updated: AtendimentoFixoItem = {
      ...currentAtendimento,
      artigosVinculados: updatedVinculados,
      timelineEvents: [timelineEvent, ...(currentAtendimento.timelineEvents || [])],
    };

    setCurrentAtendimento(updated);
    onUpdateAtendimento(updated);
    setIsCreateArtigoOpen(false);

    if (onShowToast) {
      onShowToast('Artigo Criado', `Artigo "${newArtigo.titulo}" adicionado à Base de Conhecimento.`);
    }
  };

  // Calculate total cost of equipment
  const totalEquipamentoValor = useMemo(() => {
    return equipamentos.reduce((acc, eq) => acc + (eq.valorUnitario || 0) * eq.quantidade, 0);
  }, [equipamentos]);

  const totalInfoserraValor = useMemo(() => {
    return equipamentos.reduce((acc, eq) => {
      const isInfoserra = eq.origemCusto === 'Infoserra (Valor a Receber)' || eq.tipo.includes('Comprado pela IS') || eq.cobrarNaMensalidade;
      return isInfoserra ? acc + (eq.valorUnitario || 0) * eq.quantidade : acc;
    }, 0);
  }, [equipamentos]);

  const totalClienteValor = useMemo(() => {
    return equipamentos.reduce((acc, eq) => {
      return eq.origemCusto === 'Pago pelo Cliente' ? acc + (eq.valorUnitario || 0) * eq.quantidade : acc;
    }, 0);
  }, [equipamentos]);

  const totalSucataValor = useMemo(() => {
    return equipamentos.reduce((acc, eq) => {
      return eq.origemCusto === 'Sucata do Cliente' ? acc + (eq.valorUnitario || 0) * eq.quantidade : acc;
    }, 0);
  }, [equipamentos]);


  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Top Bar Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900">
                  {currentAtendimento.codigo}
                </span>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                  {currentAtendimento.clienteNome}
                </h1>
                {currentAtendimento.unidade && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    {currentAtendimento.unidade}
                  </span>
                )}
                <span
                  className={`px-2.5 py-0.5 text-xs rounded-full font-bold uppercase tracking-wider ${
                    currentAtendimento.status === 'Concluído'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : currentAtendimento.status === 'Em Andamento'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                      : currentAtendimento.status === 'Agendado'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  }`}
                >
                  {currentAtendimento.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  {currentAtendimento.periodoManutencao || 'Manutenção de TI'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  Técnico: {currentAtendimento.responsavelTecnico}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {currentAtendimento.dataManutencao}
                </span>
                {currentAtendimento.proximaManutencao && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      Próxima: {new Date(currentAtendimento.proximaManutencao + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditClienteNome(currentAtendimento.clienteNome);
                setEditResponsavelTecnico(currentAtendimento.responsavelTecnico);
                setEditDataManutencao(currentAtendimento.dataManutencao);
                setEditPeriodo(currentAtendimento.periodoManutencao || 'Manutenção Preventiva');
                setEditStatus(currentAtendimento.status);
                setEditAnotacoes(currentAtendimento.anotacoes);
                setIsEditDrawerOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar Atendimento
            </button>

            {hasUnsavedChanges && (
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 animate-pulse"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            )}

            {onDeleteAtendimento && (
              <button
                onClick={() => {
                  if (confirm(`Deseja realmente excluir o atendimento fixo ${currentAtendimento.codigo}?`)) {
                    onDeleteAtendimento(currentAtendimento.id);
                    onBack();
                  }
                }}
                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors text-xs font-semibold"
                title="Excluir Registro"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-100 dark:border-slate-800 overflow-x-auto pb-0">
          <button
            onClick={() => setActiveTab('anotacoes')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'anotacoes'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Anotações da Manutenção
          </button>

          <button
            onClick={() => setActiveTab('equipamentos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'equipamentos'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Equipamentos ({equipamentos.length})
          </button>

          <button
            onClick={() => setActiveTab('anexos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'anexos'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            Anexos e Fotos ({anexos.length})
          </button>

          <button
            onClick={() => setActiveTab('conhecimento')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'conhecimento'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Base de Conhecimento ({vinculadosArtigos.length})
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Linha do Tempo
          </button>
        </div>
      </div>

      {/* Main Workspace Body Content */}
      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* TAB 1: Anotações da Manutenção */}
        {activeTab === 'anotacoes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Relatório / Anotações dos Serviços Executados
                  </h2>
                  <div className="flex items-center gap-2">
                    <VoiceInputButton
                      currentValue={anotacoes}
                      onTranscript={(txt) => {
                        setAnotacoes(txt);
                        setHasUnsavedChanges(true);
                      }}
                    />
                    <button
                      onClick={() => setIsEditingNotes(!isEditingNotes)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      {isEditingNotes ? 'Visualizar Leitura' : 'Editar Anotações'}
                    </button>
                  </div>
                </div>

                {isEditingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      rows={8}
                      value={anotacoes}
                      onChange={(e) => {
                        setAnotacoes(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-mono"
                      placeholder="Descreva detalhadamente o serviço executado nesta manutenção..."
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNotes}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" /> Salvar Anotação
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    {anotacoes || 'Nenhuma anotação registrada ainda.'}
                  </div>
                )}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Materiais (Total)
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      R$ {totalEquipamentoValor.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{equipamentos.length} item(ns) registrados</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl">
                    <Package className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Infoserra (IS)
                    </p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      R$ {totalInfoserraValor.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-indigo-500 mt-0.5">A faturar próximo ciclo</p>
                  </div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Pago pelo Cliente
                    </p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      R$ {totalClienteValor.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-emerald-500 mt-0.5">Sem impacto financeiro IS</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Sucata do Cliente
                    </p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                      R$ {totalSucataValor.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-amber-500 mt-0.5">Itens reaproveitados</p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl">
                    <Package className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Controls Panel */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                  Detalhes do Atendimento Fixo
                </h3>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Status da Manutenção
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as AtendimentoFixoItem['status']);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  >
                    {systemTables?.statusAtendimentoFixo?.filter((s: any) => s.status === 'Ativo' || s.nome === status).map((s: any) => (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    )) || (
                      <>
                        <option value="Concluído">Concluído</option>
                        <option value="Em Andamento">Em Andamento</option>
                        <option value="Agendado">Agendado</option>
                        <option value="Pendente">Pendente</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Responsável Técnico
                  </label>
                  <input
                    type="text"
                    value={responsavelTecnico}
                    onChange={(e) => {
                      setResponsavelTecnico(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Cliente Fixo
                  </label>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {currentAtendimento.clienteNome}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Pasta no Servidor SMB
                  </label>
                  <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg break-all">
                    \\NAS-SERVER\SIGI-Anexos\atendimentos_fixos\{currentAtendimento.codigo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Equipamentos trocados ou comprados */}
        {activeTab === 'equipamentos' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  Equipamentos e Peças de Manutenção
                </h2>
                <p className="text-xs text-slate-500">
                  Registro de equipamentos trocados, comprados ou reaproveitados para o cliente.
                </p>
              </div>

              <button
                onClick={() => setIsAddEqOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Registrar Equipamento
              </button>
            </div>

            {/* Billing Summary Banner - Detailed */}
            {(() => {
              const itemsInfoserra = equipamentos.filter(
                (eq) => eq.origemCusto?.includes('Infoserra') || eq.tipo.includes('Comprado pela IS') || eq.cobrarNaMensalidade
              );
              const itemsOutros = equipamentos.filter(
                (eq) => !(eq.origemCusto?.includes('Infoserra') || eq.tipo.includes('Comprado pela IS') || eq.cobrarNaMensalidade)
              );
              
              const totalInfoserra = itemsInfoserra.reduce((acc, eq) => acc + (eq.valorUnitario || 0) * eq.quantidade, 0);
              const totalOutros = itemsOutros.reduce((acc, eq) => acc + (eq.valorUnitario || 0) * eq.quantidade, 0);
              const totalGeral = totalInfoserra + totalOutros;

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <h4 className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                        A Receber (Infoserra)
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">R$ {totalInfoserra.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                      {itemsInfoserra.length} item(ns) para faturamento IS
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg">
                        <Package className="w-4 h-4" />
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Outros (Cliente/Sucata)
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-700 dark:text-slate-300">R$ {totalOutros.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      {itemsOutros.length} item(ns) sem custo IS
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-lg">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <h4 className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                        Investimento Total
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-amber-700 dark:text-amber-300">R$ {totalGeral.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                      Valor total mobilizado em materiais
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* List Table */}
            {equipamentos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500">
                      <th className="py-3 px-4 font-semibold">Equipamento / Peça</th>
                      <th className="py-3 px-4 font-semibold">Origem / Custo</th>
                      <th className="py-3 px-4 font-semibold">Tipo</th>
                      <th className="py-3 px-4 font-semibold text-center">Qtd</th>
                      <th className="py-3 px-4 font-semibold">Cálculo Detalhado</th>
                      <th className="py-3 px-4 font-semibold text-right">Valor Total</th>
                      <th className="py-3 px-4 font-semibold">Faturar?</th>
                      <th className="py-3 px-4 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {equipamentos.map((eq) => {
                      const isCobrar = eq.cobrarNaMensalidade || eq.tipo.includes('Comprado pela IS') || eq.origemCusto?.includes('Infoserra');
                      const subtotal = (eq.valorUnitario || 0) * eq.quantidade;
                      
                      return (
                        <tr key={eq.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {eq.nome}
                            </span>
                            {eq.observacoes && (
                              <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                                {eq.observacoes}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                {eq.origemCusto || 'Não informado'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 text-[9px] rounded-md font-bold uppercase ${
                                eq.tipo.includes('Comprado pela IS') || eq.origemCusto?.includes('Infoserra')
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {eq.tipo}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                            {eq.quantidade}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-500 font-medium">
                                {eq.quantidade} x R$ {eq.valorUnitario?.toFixed(2) || '0,00'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`text-xs font-black ${isCobrar ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>
                              R$ {subtotal.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {isCobrar ? (
                              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Faturar IS</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[10px] italic">Sem cobrança</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditEquipment(eq)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Editar Item"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveEquipment(eq.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                                title="Excluir Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Nenhum equipamento registrado nesta manutenção
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Clique em "Registrar Equipamento" para adicionar itens trocados ou comprados.
                </p>
              </div>
            )}

            {/* Modal to add equipment */}
            {isAddEqOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Adicionar Equipamento / Peça
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nome do Equipamento / Peça *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: SSD 500GB, Cabo Cat6, Memória RAM 8GB"
                        value={newEqNome}
                        onChange={(e) => setNewEqNome(e.target.value)}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Origem / Tipo do Equipamento *
                      </label>
                      <select
                        value={newEqTipo}
                        onChange={(e) => setNewEqTipo(e.target.value as EquipamentoManutencaoItem['tipo'])}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                      >
                        <option value="Comprado pela IS (cobrado na próxima mensalidade)">
                          Comprado pela IS (cobrado na próxima mensalidade)
                        </option>
                        <option value="Comprado pelo cliente">Comprado pelo cliente</option>
                        <option value="Reaproveitamento do cliente">Reaproveitamento do cliente</option>
                        <option value="Trocado">Trocado</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={newEqQtd}
                          onChange={(e) => setNewEqQtd(parseInt(e.target.value) || 1)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Valor Unit. (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newEqValor}
                          onChange={(e) => setNewEqValor(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Origem do Custo (Quem pagou?)
                      </label>
                      <select
                        value={newEqOrigemCusto}
                        onChange={(e) => setNewEqOrigemCusto(e.target.value)}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                      >
                        <option value="">Selecione...</option>
                        {systemTables?.origensCusto?.filter((o: any) => o.status === 'Ativo' || o.nome === newEqOrigemCusto).map((o: any) => (
                          <option key={o.id} value={o.nome}>{o.nome}</option>
                        )) || (
                          <>
                            <option value="Pago pelo Cliente">Pago pelo Cliente</option>
                            <option value="Infoserra (Valor a Receber)">Infoserra (Valor a Receber)</option>
                            <option value="Sucata do Cliente">Sucata do Cliente</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Observação / N° Série
                      </label>
                      <input
                        type="text"
                        placeholder="Detalhes adicionais..."
                        value={newEqObs}
                        onChange={(e) => setNewEqObs(e.target.value)}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setIsAddEqOpen(false)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddEquipment}
                      disabled={!newEqNome.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal/Drawer to edit existing equipment */}
            {editingEq && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Editar Equipamento / Peça
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nome do Equipamento *
                      </label>
                      <input
                        type="text"
                        value={editEqNome}
                        onChange={(e) => setEditEqNome(e.target.value)}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Origem / Tipo
                      </label>
                      <select
                        value={editEqTipo}
                        onChange={(e) => setEditEqTipo(e.target.value as EquipamentoManutencaoItem['tipo'])}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                      >
                        <option value="Comprado pela IS (cobrado na próxima mensalidade)">
                          Comprado pela IS (cobrado na próxima mensalidade)
                        </option>
                        <option value="Comprado pelo cliente">Comprado pelo cliente</option>
                        <option value="Reaproveitamento do cliente">Reaproveitamento do cliente</option>
                        <option value="Trocado">Trocado</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={editEqQtd}
                          onChange={(e) => setEditEqQtd(parseInt(e.target.value) || 1)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Valor Unit. (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editEqValor}
                          onChange={(e) => setEditEqValor(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Origem do Custo (Quem pagou?)
                      </label>
                      <select
                        value={editEqOrigemCusto}
                        onChange={(e) => setEditEqOrigemCusto(e.target.value)}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                      >
                        <option value="">Selecione...</option>
                        {systemTables?.origensCusto?.filter((o: any) => o.status === 'Ativo' || o.nome === editEqOrigemCusto).map((o: any) => (
                          <option key={o.id} value={o.nome}>{o.nome}</option>
                        )) || (
                          <>
                            <option value="Pago pelo Cliente">Pago pelo Cliente</option>
                            <option value="Infoserra (Valor a Receber)">Infoserra (Valor a Receber)</option>
                            <option value="Sucata do Cliente">Sucata do Cliente</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="editEqCobrarCheck"
                        checked={editEqCobrar}
                        onChange={(e) => setEditEqCobrar(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                      />
                      <label htmlFor="editEqCobrarCheck" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                        Cobrar este valor na próxima mensalidade do cliente
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Observação / N° Série
                      </label>
                      <input
                        type="text"
                        value={editEqObs}
                        onChange={(e) => setEditEqObs(e.target.value)}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setEditingEq(null)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveEditEquipment}
                      disabled={!editEqNome.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Anexos e Fotos (com Paste Ctrl+V) */}
        {activeTab === 'anexos' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                Anexos da Manutenção
              </h2>
              <p className="text-xs text-slate-500">
                Faça upload de comprovantes, relatórios ou cole um print diretamente com Ctrl+V.
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Upload className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Clique ou arraste arquivos para anexar
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Dica profissional: você também pode pressionar <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono border text-[10px]">Ctrl+V</kbd> a qualquer momento para colar um print da tela!
              </p>
            </div>

            <div className="flex gap-2 mt-2">
              <label className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs">
                <Camera className="w-3.5 h-3.5" />
                <span>Tirar Foto (Mobile)</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>
            </div>

            {/* List of attachments */}
            {anexos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {anexos.map((anx) => (
                  <div
                    key={anx.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 overflow-hidden">
                      {anx.previewUrl ? (
                        <img
                          src={anx.previewUrl}
                          alt={anx.nome}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 rounded-xl shrink-0">
                          <Paperclip className="w-5 h-5" />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {anx.nome}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {anx.tamanho} • {anx.dataUpload} por {anx.autor}
                        </p>
                        {anx.caminhoArmazenamento && (
                          <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                            {anx.caminhoArmazenamento}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveAnexo(anx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remover anexo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">
                Nenhum anexo salvo ainda.
              </p>
            )}
          </div>
        )}

        {/* TAB 4: Base de Conhecimento */}
        {activeTab === 'conhecimento' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Registro na Base de Conhecimento
                </h2>
                <p className="text-xs text-slate-500">
                  Documente procedimentos técnicos desta manutenção para consulta futura da equipe.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLinkArtigoOpen(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Paperclip className="w-3.5 h-3.5" /> Vincular Existente
                </button>
                <button
                  onClick={() => setIsCreateArtigoOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Gerar Novo Artigo
                </button>
              </div>
            </div>

            {/* List of linked KB articles */}
            {vinculadosArtigos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vinculadosArtigos.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded">
                        {art.codigo}
                      </span>
                      {onOpenArtigoWorkspace && (
                        <button
                          onClick={() => onOpenArtigoWorkspace(art)}
                          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          Ver Artigo <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {art.titulo}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {art.conteudo || art.categoria}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Nenhum artigo vinculado a esta manutenção
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Clique em "Gerar Novo Artigo" para documentar o procedimento técnico executado.
                </p>
              </div>
            )}

            {/* Link Existing Modal */}
            {isLinkArtigoOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Vincular Artigo da Base de Conhecimento
                  </h3>

                  <input
                    type="text"
                    placeholder="Buscar por título ou código..."
                    value={searchArtigoText}
                    onChange={(e) => setSearchArtigoText(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {allArtigos
                      .filter(
                        (a) =>
                          a.titulo.toLowerCase().includes(searchArtigoText.toLowerCase()) ||
                          a.codigo.toLowerCase().includes(searchArtigoText.toLowerCase())
                      )
                      .map((art) => (
                        <div
                          key={art.id}
                          onClick={() => handleLinkArticle(art)}
                          className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {art.codigo} - {art.titulo}
                            </p>
                            <p className="text-[10px] text-slate-400">{art.categoria}</p>
                          </div>
                          <Plus className="w-4 h-4 text-purple-600" />
                        </div>
                      ))}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setIsLinkArtigoOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Centralized Article Drawer */}
            {isCreateArtigoOpen && (
              <ArtigoFormDrawer
                isOpen={isCreateArtigoOpen}
                onClose={() => setIsCreateArtigoOpen(false)}
                systemTables={systemTables}
                systemUsers={localUsers}
                clients={allClients || []}
                onSave={handleSaveArtigoDrawer}
                onShowToast={onShowToast}
              />
            )}
          </div>
        )}

        {/* TAB 5: Linha do Tempo */}
        {activeTab === 'timeline' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <History className="w-4 h-4 text-indigo-600" />
              Histórico / Linha do Tempo da Manutenção
            </h2>

            <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
              {(currentAtendimento.timelineEvents || []).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedTimelineEvent(ev)}
                  className="relative group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 p-3 rounded-2xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                >
                  <div className="absolute -left-[31px] top-4 p-1 bg-white dark:bg-slate-900 rounded-full border-2 border-indigo-500">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {ev.data} • {ev.autor}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                        Ver Detalhes →
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {ev.titulo}
                    </h4>
                    {ev.descricao && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 line-clamp-2">
                        {ev.descricao}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT DRAWER 1: Edit Full Atendimento Fixo */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Editar Atendimento Fixo
                  </h2>
                  <p className="text-xs text-slate-500">
                    {currentAtendimento.codigo} • {currentAtendimento.clienteNome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cliente Fixo
                  </label>
                  <input
                    type="text"
                    value={editClienteNome}
                    onChange={(e) => setEditClienteNome(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unidade / Local
                  </label>
                  <input
                    type="text"
                    value={editUnidade}
                    onChange={(e) => setEditUnidade(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Responsável Técnico
                  </label>
                  <select
                    value={editResponsavelTecnico}
                    onChange={(e) => setEditResponsavelTecnico(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="">Selecione o Técnico</option>
                    {localUsers.filter(u => u.status === 'Ativo' || u.name === editResponsavelTecnico).map((usr) => (
                      <option key={usr.id} value={usr.name}>
                        {usr.name} ({usr.funcao})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data da Manutenção
                  </label>
                  <input
                    type="date"
                    value={editDataManutencao}
                    onChange={(e) => setEditDataManutencao(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Próxima Manutenção
                  </label>
                  <input
                    type="date"
                    value={editProximaManutencao}
                    onChange={(e) => setEditProximaManutencao(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status da Manutenção
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as AtendimentoFixoItem['status'])}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    {systemTables?.statusAtendimentoFixo?.filter((s: any) => s.status === 'Ativo' || s.nome === editStatus).map((s: any) => (
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo / Período da Manutenção
                  </label>
                  <select
                    value={editPeriodo}
                    onChange={(e) => setEditPeriodo(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    {systemTables?.tiposManutencaoFixa?.filter((t: any) => t.status === 'Ativo' || t.nome === editPeriodo).map((t: any) => (
                      <option key={t.id} value={t.nome}>{t.nome}</option>
                    )) || (
                      <>
                        <option value="Mensal">Mensal</option>
                        <option value="Bimestral">Bimestral</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                        <option value="Avulso">Avulso</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-500" />
                    Lançamentos (Peças / Custos / Equipamentos)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                    {editEquipamentos.length} Itens
                  </span>
                </div>

                {/* Real-time Summary in Drawer */}
                {(() => {
                  const itemsInfoserra = editEquipamentos.filter(
                    (eq) => eq.origemCusto?.includes('Infoserra') || eq.cobrarNaMensalidade
                  );
                  const totalInfoserra = itemsInfoserra.reduce((acc, eq) => acc + (eq.valorUnitario || 0) * eq.quantidade, 0);
                  const totalGeral = editEquipamentos.reduce((acc, eq) => acc + (eq.valorUnitario || 0) * eq.quantidade, 0);

                  return (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase block">Resumo de Lançamentos</span>
                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                          {editEquipamentos.length} itens registrados
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase block">Total Infoserra</span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          R$ {totalInfoserra.toFixed(2)}
                        </span>
                        <span className="block text-[9px] text-slate-400 font-medium">Geral: R$ {totalGeral.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* List of items in drawer */}
                <div className="space-y-2">
                  {editEquipamentos.map((eq) => (
                    <div key={eq.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 group">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{eq.nome}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-medium">Qtd: {eq.quantidade}</span>
                          {eq.valorUnitario && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">• R$ {eq.valorUnitario.toFixed(2)}</span>
                          )}
                          {eq.origemCusto && (
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                              eq.origemCusto.includes('Infoserra') 
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                                : eq.origemCusto.includes('Cliente')
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            }`}>
                              {eq.origemCusto}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleEditEqInDrawer(eq)}
                          className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveEqInDrawer(eq.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add/Edit Item Form in Drawer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome do Item / Peça</label>
                      <input
                        type="text"
                        placeholder="Ex: Teclado USB, Roteador..."
                        value={drawerNewEqNome}
                        onChange={(e) => setDrawerNewEqNome(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        value={drawerNewEqQtd}
                        onChange={(e) => setDrawerNewEqQtd(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor Unitário</label>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={drawerNewEqValor}
                        onChange={(e) => setDrawerNewEqValor(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Origem do Custo</label>
                      <select
                        value={drawerNewEqOrigem}
                        onChange={(e) => setDrawerNewEqOrigem(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      >
                        <option value="">Selecione a Origem</option>
                        {systemTables?.origensCusto?.filter((o: any) => o.status === 'Ativo' || o.nome === drawerNewEqOrigem).map((o: any) => (
                          <option key={o.id} value={o.nome}>{o.nome}</option>
                        )) || (
                          <>
                            <option value="Pago pelo Cliente">Pago pelo Cliente</option>
                            <option value="Infoserra (Valor a Receber)">Infoserra (Valor a Receber)</option>
                            <option value="Sucata do Cliente">Sucata do Cliente</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddEqInDrawer}
                      className={`flex-1 px-3 py-2.5 ${editingEqIdInDrawer ? 'bg-amber-500' : 'bg-slate-900 dark:bg-slate-100'} text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity`}
                    >
                      {editingEqIdInDrawer ? 'Atualizar Item' : 'Adicionar Item'}
                    </button>
                    {editingEqIdInDrawer && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEqIdInDrawer(null);
                          setDrawerNewEqNome('');
                          setDrawerNewEqQtd(1);
                          setDrawerNewEqValor('');
                          setDrawerNewEqOrigem('');
                        }}
                        className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Anotações da Manutenção
                  </label>
                  <VoiceInputButton
                    currentValue={editAnotacoes}
                    onTranscript={setEditAnotacoes}
                  />
                </div>
                <textarea
                  rows={8}
                  value={editAnotacoes}
                  onChange={(e) => setEditAnotacoes(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                onClick={() => setIsEditDrawerOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditAtendimento}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT DRAWER 2: Detailed Timeline Event Modal */}
      {selectedTimelineEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Detalhes do Evento na Linha do Tempo
                  </h2>
                  <p className="text-xs text-slate-500">
                    {currentAtendimento.codigo} • {currentAtendimento.clienteNome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTimelineEvent(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    {selectedTimelineEvent.tipo}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {selectedTimelineEvent.data}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedTimelineEvent.titulo}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>
                    Registrado por: <strong>{selectedTimelineEvent.autor}</strong>
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Descrição Completa do Evento
                </h4>
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-xs">
                  {selectedTimelineEvent.descricao || 'Nenhuma descrição adicional foi fornecida para este evento.'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/50">
              <button
                onClick={() => setSelectedTimelineEvent(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
