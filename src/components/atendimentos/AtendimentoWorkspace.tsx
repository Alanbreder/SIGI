import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  User,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  Tag,
  MoreVertical,
  Edit3,
  Copy,
  Save,
  BookOpen,
  Search,
  X,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Check,
  Layers,
  Paperclip,
  UploadCloud,
  FileCode,
  Download,
  Trash2,
  HardDrive,
  Server,
  ExternalLink,
  Camera,
  Bug,
  Lightbulb,
  Sparkles,
  HelpCircle,
  Wrench,
  ShieldCheck,
  Info
} from 'lucide-react';
import {
  AtendimentoItem,
  Cliente,
  ModuleType,
  RegistroItem,
  ArtigoKBItem,
  ClientTimelineItem,
  AnexoItem,
  SystemTablesData,
  UserAccount
} from '../../types';
import { SystemTableMeta } from '../../data/mockSystemTables';
import { initialClients } from '../../data/mockClients';
import { QuickViewModal, QuickViewEntityType } from '../common/QuickViewModal';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { initialUsers } from '../../data/mockUsers';
import { RegistroFormDrawer } from '../drawers/RegistroFormDrawer';
import { ArtigoFormDrawer } from '../drawers/ArtigoFormDrawer';
import { saveAtendimento, saveRegistro, saveArtigo } from '../../lib/supabaseService';
import { getSystemTableBadgeStyle } from '../../lib/badgeUtils';

interface AtendimentoWorkspaceProps {
  atendimento: AtendimentoItem;
  onBack: () => void;
  onNavigateModule: (module: ModuleType) => void;
  onUpdateAtendimento?: (updatedAtendimento: AtendimentoItem) => void;
  onShowToast?: (title: string, message: string) => void;
  allClients?: Cliente[];
  allRegistros?: RegistroItem[];
  allArtigos?: ArtigoKBItem[];
  systemTableDefinitions?: SystemTableMeta[];
  systemTables?: SystemTablesData;
  onUpdateRegistrosList?: (registros: RegistroItem[]) => void;
  onUpdateArtigosList?: (artigos: ArtigoKBItem[]) => void;
  systemUsers?: UserAccount[];
}

type WorkspaceTab = 'geral' | 'registros' | 'conhecimento' | 'timeline';

export const AtendimentoWorkspace: React.FC<AtendimentoWorkspaceProps> = ({
  atendimento,
  onBack,
  onNavigateModule,
  onUpdateAtendimento,
  onShowToast,
  allClients = initialClients,
  allRegistros,
  allArtigos,
  systemTableDefinitions,
  systemTables,
  onUpdateRegistrosList,
  onUpdateArtigosList,
  systemUsers = initialUsers,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('geral');
  const [currentAtendimento, setCurrentAtendimento] = useState<AtendimentoItem>(atendimento);
  
  // Identify linked system tables for Atendimentos
  const linkedTables = useMemo(() => {
    if (!systemTableDefinitions) return [];
    return systemTableDefinitions.filter(d => d.linkedToEntity === 'atendimento');
  }, [systemTableDefinitions]);

  const [isEditingGeral, setIsEditingGeral] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // System Users
  const [localUsers, setLocalUsers] = useState<UserAccount[]>([]);

  useEffect(() => {
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

  // Form State for Aba Geral
  const [editForm, setEditForm] = useState<AtendimentoItem>({ ...atendimento });

  // Quick View Modal State
  const [quickViewModal, setQuickViewModal] = useState<{
    isOpen: boolean;
    type: QuickViewEntityType;
    data: any;
  }>({
    isOpen: false,
    type: 'registro',
    data: null,
  });

  // Modal State for Vincular Registro
  const [isVincularRegistroOpen, setIsVincularRegistroOpen] = useState(false);
  const [searchRegistro, setSearchRegistro] = useState('');

  // Modal State for Criar Registro
  const [isCriarRegistroOpen, setIsCriarRegistroOpen] = useState(false);
  const [newRegistroForm, setNewRegistroForm] = useState<{
    tipo: 'Bug' | 'Melhoria' | 'Ideia';
    titulo: string;
    descricao: string;
    prioridade: 'Urgente' | 'Alta' | 'Média' | 'Baixa';
    status: 'Aberto' | 'Em Análise' | 'Em Desenvolvimento' | 'Concluído';
  }>({
    tipo: 'Bug',
    titulo: '',
    descricao: '',
    prioridade: 'Média',
    status: 'Aberto',
  });

  // Modal State for Vincular Artigo
  const [isVincularArtigoOpen, setIsVincularArtigoOpen] = useState(false);
  const [searchArtigo, setSearchArtigo] = useState('');

  // Modal State for Criar Artigo KB
  const [isCriarArtigoOpen, setIsCriarArtigoOpen] = useState(false);
  const [newArtigoForm, setNewArtigoForm] = useState<{
    titulo: string;
    categoria: string;
    conteudo: string;
    tags: string;
    status: 'Publicado' | 'Rascunho';
  }>({
    titulo: '',
    categoria: 'Integração & API',
    conteudo: '',
    tags: '',
    status: 'Publicado',
  });

  // Attachments State
  const [anexos, setAnexos] = useState<AnexoItem[]>(atendimento.anexos || []);

  // Attachment Preview Modal
  const [previewAnexo, setPreviewAnexo] = useState<AnexoItem | null>(null);

  // Linked Registros State
  const [vinculadosRegistros, setVinculadosRegistros] = useState<RegistroItem[]>(
    atendimento.registrosVinculados || []
  );

  // Linked Artigos KB State
  const [vinculadosArtigos, setVinculadosArtigos] = useState<ArtigoKBItem[]>(
    atendimento.artigosVinculados || [
      {
        id: 'art-linked-1',
        codigo: '#ART-055',
        titulo: 'Guia de Resolução de Erro 500 em Endpoints REST API',
        categoria: 'Integração & API',
        conteudo: 'Procedimento técnico para aumento do pool de conexões e reciclagem de threads do serviço.',
        tags: ['API', 'REST', 'Pool', 'Erro 500'],
        status: 'Publicado',
        dataCriacao: '15/01/2025',
        autor: 'Engenharia de Software'
      }
    ]
  );

  // Local Timeline Events for this Atendimento
  const [atendimentoTimeline, setAtendimentoTimeline] = useState<ClientTimelineItem[]>([
    {
      id: 'tl-atd-1',
      type: 'atendimento',
      titulo: 'Atendimento Criado',
      descricao: `Abertura do atendimento ${currentAtendimento.codigo} para o cliente ${currentAtendimento.clienteNome || 'Cliente'}.`,
      dataHora: currentAtendimento.dataAbertura,
      autor: currentAtendimento.responsavel,
      relatedCode: currentAtendimento.codigo
    },
    {
      id: 'tl-atd-2',
      type: 'registro',
      titulo: 'Registro Vinculado: #REG-3310',
      descricao: 'Bug de estouro de pool de conexões vinculado a este atendimento.',
      dataHora: 'Hoje às 10:30',
      autor: 'Carlos Eduardo Silva',
      relatedCode: '#REG-3310'
    },
    {
      id: 'tl-atd-3',
      type: 'artigo',
      titulo: 'Artigo Vinculado: #ART-055',
      descricao: 'Guia de Resolução de Erro 500 em Endpoints REST API adicionado às referências.',
      dataHora: 'Hoje às 10:35',
      autor: 'Carlos Eduardo Silva',
      relatedCode: '#ART-055'
    }
  ]);

  // Handle Save Geral Edit Form
  const handleSaveGeral = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...editForm, anexos };
    setCurrentAtendimento(updated);
    setIsEditingGeral(false);
    if (onUpdateAtendimento) onUpdateAtendimento(updated);

    // Register event in timeline
    const newTimelineItem: ClientTimelineItem = {
      id: `tl-${Date.now()}`,
      type: 'atendimento',
      titulo: 'Informações Alteradas',
      descricao: 'Dados gerais do atendimento foram atualizados no Workspace.',
      dataHora: 'Agora mesmo',
      autor: 'Usuário Atual',
      relatedCode: updated.codigo
    };
    setAtendimentoTimeline((prev) => [newTimelineItem, ...prev]);

    if (onShowToast) {
      onShowToast('Atendimento Atualizado', 'As alterações foram salvas com sucesso no Workspace.');
    }
  };

  // Handle Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentAtendimento.codigo);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Helper to process file (from file input, drag-and-drop, or Ctrl+V paste)
  const processFileAttachment = (file: File, source: 'upload' | 'clipboard' = 'upload') => {
    const isImage = file.type.startsWith('image/') || Boolean(file.name.match(/\.(png|jpe?g|gif|webp|svg)$/i));

    const createAnexoItem = (previewUrl?: string) => {
      const fileName = file.name || `captura_tela_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.png`;
      const newAnexo: AnexoItem = {
        id: `anx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nome: fileName,
        tamanho: `${(file.size / 1024).toFixed(1)} KB`,
        tipo: isImage ? 'image' : file.name.split('.').pop() || 'arquivo',
        dataUpload: 'Hoje agora mesmo',
        autor: 'Usuário Atual',
        storageType: 'SMB / NAS',
        previewUrl
      };

      setAnexos((prev) => [newAnexo, ...prev]);

      const newTl: ClientTimelineItem = {
        id: `tl-${Date.now()}`,
        type: 'atendimento',
        titulo: source === 'clipboard' ? 'Captura de Tela Anexada (Ctrl+V)' : 'Anexo Adicionado',
        descricao: source === 'clipboard'
          ? `Print de tela colado do clipboard ("${fileName}") e vinculado ao atendimento.`
          : `Arquivo "${fileName}" vinculado com sucesso ao atendimento.`,
        dataHora: 'Agora mesmo',
        autor: 'Usuário Atual',
        relatedCode: currentAtendimento.codigo
      };
      setAtendimentoTimeline((prev) => [newTl, ...prev]);

      if (onShowToast) {
        onShowToast(
          source === 'clipboard' ? 'Print Anexado (Ctrl+V)' : 'Anexo Salvo',
          `Arquivo "${fileName}" anexado com sucesso.`
        );
      }
    };

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        createAnexoItem(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      createAnexoItem();
    }
  };

  // Handle Add Attachment from Input
  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFileAttachment(files[0], 'upload');
    e.target.value = '';
  };

  // Listen to Window Paste Event for Screenshots (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData || !e.clipboardData.items) return;
      const items = e.clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            const now = new Date();
            const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
            const ext = blob.type.split('/')[1] || 'png';
            const renamedFile = new File(
              [blob],
              `captura_tela_${dateStr}.${ext}`,
              { type: blob.type }
            );
            processFileAttachment(renamedFile, 'clipboard');
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [currentAtendimento.codigo]);

  // Remove attachment
  const handleRemoveAttachment = (anexoId: string, nome: string) => {
    setAnexos((prev) => prev.filter((a) => a.id !== anexoId));
    if (onShowToast) {
      onShowToast('Anexo Removido', `Arquivo "${nome}" foi desvinculado do atendimento.`);
    }
  };

  // Sincronização e Salvamento do Atendimento com Vínculos
  const saveCurrentAtendimentoWithLinks = (regs: RegistroItem[], arts: ArtigoKBItem[]) => {
    const updated = {
      ...currentAtendimento,
      registrosVinculados: regs,
      artigosVinculados: arts
    };
    setCurrentAtendimento(updated);
    if (onUpdateAtendimento) {
      onUpdateAtendimento(updated);
    }
  };

  const handleDesvincularRegistro = (regId: string, regCodigo: string) => {
    const newRegs = vinculadosRegistros.filter((r) => r.id !== regId);
    setVinculadosRegistros(newRegs);
    saveCurrentAtendimentoWithLinks(newRegs, vinculadosArtigos);

    setAtendimentoTimeline((prev) => [
      {
        id: `tl-${Date.now()}`,
        type: 'registro',
        titulo: `Registro Desvinculado: ${regCodigo}`,
        descricao: `Registro ${regCodigo} desvinculado deste atendimento.`,
        dataHora: 'Agora mesmo',
        autor: 'Usuário Atual',
        relatedCode: regCodigo
      },
      ...prev
    ]);

    if (onShowToast) {
      onShowToast('Registro Desvinculado', `O registro ${regCodigo} foi desvinculado.`);
    }
  };

  const handleDesvincularArtigo = (artId: string, artCodigo: string) => {
    const newArts = vinculadosArtigos.filter((a) => a.id !== artId);
    setVinculadosArtigos(newArts);
    saveCurrentAtendimentoWithLinks(vinculadosRegistros, newArts);

    setAtendimentoTimeline((prev) => [
      {
        id: `tl-${Date.now()}`,
        type: 'artigo',
        titulo: `Artigo de Conhecimento Desvinculado: ${artCodigo}`,
        descricao: `Artigo ${artCodigo} desvinculado deste atendimento.`,
        dataHora: 'Agora mesmo',
        autor: 'Usuário Atual',
        relatedCode: artCodigo
      },
      ...prev
    ]);

    if (onShowToast) {
      onShowToast('Artigo Desvinculado', `O artigo ${artCodigo} foi desvinculado.`);
    }
  };

  // Handle Link Artigo
  const handleVincularArtigo = (art: ArtigoKBItem) => {
    if (vinculadosArtigos.some((a) => a.id === art.id)) {
      if (onShowToast) onShowToast('Aviso', 'Este artigo já está vinculado.');
      return;
    }
    const newArts = [...vinculadosArtigos, art];
    setVinculadosArtigos(newArts);
    setIsVincularArtigoOpen(false);
    saveCurrentAtendimentoWithLinks(vinculadosRegistros, newArts);

    setAtendimentoTimeline((prev) => [
      {
        id: `tl-${Date.now()}`,
        type: 'artigo',
        titulo: `Artigo de Conhecimento Vinculado: ${art.codigo}`,
        descricao: `Artigo "${art.titulo}" vinculado a este atendimento.`,
        dataHora: 'Agora mesmo',
        autor: 'Usuário Atual',
        relatedCode: art.codigo
      },
      ...prev
    ]);

    if (onShowToast) {
      onShowToast('Artigo Vinculado', `O artigo ${art.codigo} foi vinculado com sucesso.`);
    }
  };

  // Handle Link Registro
  const handleVincularRegistro = (reg: RegistroItem) => {
    if (vinculadosRegistros.some((r) => r.id === reg.id)) {
      if (onShowToast) onShowToast('Aviso', 'Este registro já está vinculado.');
      return;
    }
    const newRegs = [...vinculadosRegistros, reg];
    setVinculadosRegistros(newRegs);
    setIsVincularRegistroOpen(false);
    saveCurrentAtendimentoWithLinks(newRegs, vinculadosArtigos);

    setAtendimentoTimeline((prev) => [
      {
        id: `tl-${Date.now()}`,
        type: 'registro',
        titulo: `Registro Vinculado: ${reg.codigo}`,
        descricao: `Registro "${reg.titulo}" vinculado a este atendimento.`,
        dataHora: 'Agora mesmo',
        autor: 'Usuário Atual',
        relatedCode: reg.codigo
      },
      ...prev
    ]);

    if (onShowToast) {
      onShowToast('Registro Vinculado', `O registro ${reg.codigo} foi vinculado com sucesso.`);
    }
  };

  const handleSaveNovoRegistro = (newReg: RegistroItem) => {
    setIsCriarRegistroOpen(false);
    const newRegs = [newReg, ...vinculadosRegistros];
    setVinculadosRegistros(newRegs);
    saveCurrentAtendimentoWithLinks(newRegs, vinculadosArtigos);

    if (onUpdateRegistrosList && allRegistros) {
      onUpdateRegistrosList([newReg, ...allRegistros]);
    }

    setAtendimentoTimeline((prev) => [
      {
        id: `tl-${Date.now()}`,
        type: 'registro',
        titulo: `Novo Registro Criado: ${newReg.codigo}`,
        descricao: `${newReg.tipo} "${newReg.titulo}" criado e vinculado ao atendimento.`,
        dataHora: 'Agora mesmo',
        autor: newReg.autor || 'Usuário Atual',
        relatedCode: newReg.codigo,
      },
      ...prev,
    ]);

    if (onShowToast) {
      onShowToast('Registro Criado', `O ${newReg.tipo.toLowerCase()} ${newReg.codigo} foi criado e vinculado com sucesso.`);
    }
  };

  const handleSaveNovoArtigo = (newArt: ArtigoKBItem) => {
    setIsCriarArtigoOpen(false);
    const newArts = [newArt, ...vinculadosArtigos];
    setVinculadosArtigos(newArts);
    saveCurrentAtendimentoWithLinks(vinculadosRegistros, newArts);

    if (onUpdateArtigosList && allArtigos) {
      onUpdateArtigosList([newArt, ...allArtigos]);
    }

    setAtendimentoTimeline((prev) => [
      {
        id: `tl-${Date.now()}`,
        type: 'artigo',
        titulo: `Novo Artigo de Conhecimento Criado: ${newArt.codigo}`,
        descricao: `Artigo "${newArt.titulo}" publicado na Base de Conhecimento e vinculado ao atendimento.`,
        dataHora: 'Agora mesmo',
        autor: newArt.autor || 'Usuário Atual',
        relatedCode: newArt.codigo,
      },
      ...prev,
    ]);

    if (onShowToast) {
      onShowToast('Artigo Criado', `O artigo ${newArt.codigo} foi criado e vinculado com sucesso.`);
    }
  };

  // Badge styles helper
  const getStatusStyle = (statusStr: string) => {
    return getSystemTableBadgeStyle('statusAtendimento', statusStr, systemTables, 'slate');
  };

  const getPriorityStyle = (prioridadeStr: string) => {
    return getSystemTableBadgeStyle('prioridadesAtendimento', prioridadeStr, systemTables, 'slate');
  };

  // Mock global pool of registros to link
  const poolRegistros: RegistroItem[] = [
    {
      id: 'reg-pool-1',
      codigo: '#REG-3310',
      tipo: 'Bug',
      titulo: 'Erro HTTP 500 no endpoint de consulta de saldo do PDV',
      descricao: 'Timeout na consulta de saldo quando a conexão estoura o limite do pool.',
      status: 'Em Desenvolvimento',
      data: '28/07/2026',
      autor: 'Carlos Eduardo Silva'
    },
    {
      id: 'reg-pool-2',
      codigo: '#REG-3311',
      tipo: 'Melhoria',
      titulo: 'Aumento automático do timeout do pool de conexões REST',
      descricao: 'Melhoria para suportar picos de até 500 req/s sem estouro de fila.',
      status: 'Aprovado',
      data: '25/07/2026',
      autor: 'Mariana Lima'
    },
    {
      id: 'reg-pool-3',
      codigo: '#REG-4401',
      tipo: 'Ideia',
      titulo: 'Notificação instantânea via Telegram para chamados urgentes',
      descricao: 'Integração de bot para alertar plantonistas em incidentes críticos.',
      status: 'Em Análise',
      data: '27/07/2026',
      autor: 'Roberto Souza'
    }
  ];

  // Mock global pool of artigos to link
  const poolArtigos: ArtigoKBItem[] = [
    {
      id: 'art-pool-1',
      codigo: '#ART-055',
      titulo: 'Guia de Resolução de Erro 500 em Endpoints REST API',
      categoria: 'Integração & API',
      conteudo: 'Procedimento técnico para aumento do pool de conexões e reciclagem de threads do serviço.',
      tags: ['API', 'REST', 'Pool', 'Erro 500'],
      status: 'Publicado',
      dataCriacao: '15/01/2025',
      autor: 'Engenharia de Software'
    },
    {
      id: 'art-pool-2',
      codigo: '#ART-058',
      titulo: 'Configuração de VPN e IPs Autorizados para Webhooks',
      categoria: 'Redes & Segurança',
      conteudo: 'Lista de faixas de IP público autorizadas para tráfego seguro e autenticação mTLS.',
      tags: ['VPN', 'Segurança', 'IPs', 'Rede'],
      status: 'Publicado',
      dataCriacao: '02/02/2025',
      autor: 'Suporte N3'
    },
    {
      id: 'art-pool-3',
      codigo: '#ART-102',
      titulo: 'Guia de Integração REST API XPTO - Token Bearer & Rate Limits',
      categoria: 'Integração & API',
      conteudo: 'Documentação com limites de requisição por minuto e renovação automatizada de tokens OAuth2.',
      tags: ['API', 'OAuth2', 'REST', 'XPTO'],
      status: 'Publicado',
      dataCriacao: '15/11/2024',
      autor: 'Equipe de Desenvolvimento'
    }
  ];

  const recordsPool = allRegistros && allRegistros.length > 0 ? allRegistros : poolRegistros;
  const articlesPool = allArtigos && allArtigos.length > 0 ? allArtigos : poolArtigos;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 w-full">
      {/* 1. Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Atendimentos</span>
        </button>

        {/* Action Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <MoreVertical className="w-4 h-4 text-slate-500" />
            <span>Mais Ações</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 py-1 text-xs">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setIsEditingGeral(true);
                  setActiveTab('geral');
                }}
                className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 font-semibold"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                Editar Atendimento
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  const updated = { ...currentAtendimento, status: 'Resolvido' as const };
                  setCurrentAtendimento(updated);
                  if (onUpdateAtendimento) onUpdateAtendimento(updated);
                  if (onShowToast) onShowToast('Status Alterado', 'Atendimento marcado como Resolvido.');
                }}
                className="w-full text-left px-4 py-2.5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Marcar como Resolvido
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  const updated = { ...currentAtendimento, status: 'Concluído' as const };
                  setCurrentAtendimento(updated);
                  if (onUpdateAtendimento) onUpdateAtendimento(updated);
                  if (onShowToast) onShowToast('Status Alterado', 'Atendimento encerrado e concluído.');
                }}
                className="w-full text-left px-4 py-2.5 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                Encerrar Atendimento
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                onClick={() => {
                  setShowDropdown(false);
                  if (onShowToast) onShowToast('Exportação', 'Relatório do atendimento exportado em formato PDF/JSON.');
                }}
                className="w-full text-left px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 font-medium"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                Exportar Detalhes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Workspace Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-4xl">
            {/* Top Row: Cliente Name & Code */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50 font-mono">
                {currentAtendimento.codigo}
              </span>

              {currentAtendimento.clienteNome && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span>Cliente: <strong className="text-slate-800 dark:text-slate-200">{currentAtendimento.clienteNome}</strong></span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                title="Copiar Código"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Title / Assunto */}
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {currentAtendimento.assunto}
            </h1>

            {/* Sub-Badges Line: Status, Prioridade, Data, Responsável pelo Atendimento */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {/* Interactive Status Selector Badge */}
              <div className="relative inline-flex items-center">
                <select
                  value={currentAtendimento.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    const updated = { ...currentAtendimento, status: newStatus };
                    setCurrentAtendimento(updated);
                    setEditForm(updated);
                    if (onUpdateAtendimento) onUpdateAtendimento(updated);
                    setAtendimentoTimeline((prev) => [
                      {
                        id: `tl-${Date.now()}`,
                        type: 'atendimento',
                        titulo: 'Status Alterado Directamente',
                        descricao: `Status do atendimento alterado para "${newStatus}".`,
                        dataHora: 'Agora mesmo',
                        autor: 'Usuário Atual',
                        relatedCode: currentAtendimento.codigo
                      },
                      ...prev
                    ]);
                    if (onShowToast) {
                      onShowToast('Status Alterado', `Status atualizado para "${newStatus}".`);
                    }
                  }}
                  className={`appearance-none cursor-pointer text-xs font-extrabold px-3 py-1 pr-7 rounded-full border shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${getStatusStyle(currentAtendimento.status)}`}
                  title="Clique para alterar o Status diretamente"
                >
                  {systemTables?.statusAtendimento?.filter((s: any) => s.status === 'Ativo' || s.nome === currentAtendimento.status).map((s: any) => (
                    <option key={s.id} value={s.nome} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                      {s.nome}
                    </option>
                  )) || (
                    <>
                      <option value="Aberto" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Aberto</option>
                      <option value="Em Andamento" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Em Andamento</option>
                      <option value="Aguardando Cliente" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Aguardando Cliente</option>
                      <option value="Resolvido" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Resolvido</option>
                      <option value="Concluído" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Concluído</option>
                      <option value="Cancelado" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Cancelado</option>
                    </>
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none opacity-70" />
              </div>

              {/* Interactive Prioridade Selector Badge */}
              <div className="relative inline-flex items-center">
                <select
                  value={currentAtendimento.prioridade}
                  onChange={(e) => {
                    const newPriority = e.target.value as any;
                    const updated = { ...currentAtendimento, prioridade: newPriority };
                    setCurrentAtendimento(updated);
                    setEditForm(updated);
                    if (onUpdateAtendimento) onUpdateAtendimento(updated);
                    setAtendimentoTimeline((prev) => [
                      {
                        id: `tl-${Date.now()}`,
                        type: 'atendimento',
                        titulo: 'Prioridade Alterada Directamente',
                        descricao: `Prioridade alterada para "${newPriority}".`,
                        dataHora: 'Agora mesmo',
                        autor: 'Usuário Atual',
                        relatedCode: currentAtendimento.codigo
                      },
                      ...prev
                    ]);
                    if (onShowToast) {
                      onShowToast('Prioridade Alterada', `Prioridade atualizada para "${newPriority}".`);
                    }
                  }}
                  className={`appearance-none cursor-pointer text-xs font-extrabold px-3 py-1 pr-7 rounded-full border shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${getPriorityStyle(currentAtendimento.prioridade)}`}
                  title="Clique para alterar a Prioridade diretamente"
                >
                  {systemTables?.prioridadesAtendimento?.filter((p: any) => p.status === 'Ativo' || p.nome === currentAtendimento.prioridade).map((p: any) => (
                    <option key={p.id} value={p.nome} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                      {p.nome}
                    </option>
                  )) || (
                    <>
                      <option value="Baixa" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Prioridade Baixa</option>
                      <option value="Média" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Prioridade Média</option>
                      <option value="Alta" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Prioridade Alta</option>
                      <option value="Urgente" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Prioridade Urgente</option>
                    </>
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none opacity-70" />
              </div>

              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-800 text-[11px] font-medium">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                Aberto em: <strong>{currentAtendimento.dataAbertura}</strong>
              </span>

              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-800 text-[11px] font-medium">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Responsável pelo Atendimento: <strong>{currentAtendimento.responsavel}</strong>
              </span>
            </div>
          </div>

          {/* Header Quick Metrics / SLA */}
          <div className="flex flex-row lg:flex-col gap-3 lg:items-end justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6 text-xs shrink-0">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tempo Registrado</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                {currentAtendimento.tempoAtendimento || '01h 45min'}
              </span>
            </div>

            <div className="space-y-0.5 text-right lg:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Anexos & Registros</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {anexos.length} anexo(s) • {vinculadosRegistros.length} registro(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'geral'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('registros')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'registros'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Bug className="w-4 h-4" />
            <span>Registros</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded-md font-mono">
              {vinculadosRegistros.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('conhecimento')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'conhecimento'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Conhecimento</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded-md font-mono">
              {vinculadosArtigos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Timeline</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded-md font-mono">
              {atendimentoTimeline.length}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Tab Content Body */}
      {activeTab === 'geral' && (
        <div className="space-y-6">
          {/* Form / Details Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Informações Completas do Atendimento
              </h2>

              {!isEditingGeral ? (
                <button
                  type="button"
                  onClick={() => setIsEditingGeral(true)}
                  className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Campos</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({ ...currentAtendimento });
                      setIsEditingGeral(false);
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGeral}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar</span>
                  </button>
                </div>
              )}
            </div>

            {isEditingGeral ? (
              /* Editable Form */
              <form onSubmit={handleSaveGeral} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Cliente Vinculado
                    </label>
                    <select
                      value={editForm.clienteId || ''}
                      onChange={(e) => {
                        const cli = allClients.find((c) => c.id === e.target.value);
                        setEditForm({
                          ...editForm,
                          clienteId: e.target.value,
                          clienteNome: cli ? cli.razaoSocial : editForm.clienteNome
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Selecione um cliente...</option>
                      {allClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.codigo} - {c.razaoSocial}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Responsável pelo Atendimento *
                    </label>
                    <select
                      value={editForm.responsavel}
                      onChange={(e) => setEditForm({ ...editForm, responsavel: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="">Selecione o Responsável</option>
                      {systemUsers.filter(u => u.status === 'Ativo').map((usr) => (
                        <option key={usr.id} value={usr.name}>
                          {usr.name} ({usr.funcao})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Status do Atendimento
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    >
                      {(systemTables?.statusAtendimento?.filter((s: any) => s.status === 'Ativo' || s.nome === editForm.status) || []).map((s: any) => (
                        <option key={s.id} value={s.nome}>{s.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={editForm.prioridade}
                      onChange={(e) => setEditForm({ ...editForm, prioridade: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    >
                      {(systemTables?.prioridadesAtendimento?.filter((p: any) => p.status === 'Ativo' || p.nome === editForm.prioridade) || []).map((p: any) => (
                        <option key={p.id} value={p.nome}>{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Módulo do Sistema
                    </label>
                    <input
                      type="text"
                      value={editForm.modulo || ''}
                      onChange={(e) => setEditForm({ ...editForm, modulo: e.target.value })}
                      placeholder="Ex: Suporte, Financeiro, API"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Categoria
                    </label>
                    <select
                      value={editForm.categoria || ''}
                      onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Selecione...</option>
                      {(systemTables?.categoriasAtendimento || []).map((c: any) => (
                        <option key={c.id} value={c.nome}>{c.nome}</option>
                      ))}
                    </select>
                  </div>

                  {/* Linked System Tables Fields */}
                  {linkedTables.map((table) => {
                    const options = (systemTables?.[table.key] || []).filter((opt: any) => opt.status === 'Ativo' || opt.nome === (editForm.camposEspecificos?.[table.key]));
                    return (
                      <div key={table.key}>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {table.labelSingular}
                        </label>
                        <select
                          value={editForm.camposEspecificos?.[table.key] || ''}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              camposEspecificos: {
                                ...(prev.camposEspecificos || {}),
                                [table.key]: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200"
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

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Assunto / Título do Atendimento
                  </label>
                  <input
                    type="text"
                    value={editForm.assunto}
                    onChange={(e) => setEditForm({ ...editForm, assunto: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Descrição Completa do Problema
                    </label>
                    <VoiceInputButton
                      currentValue={editForm.descricao || ''}
                      onTranscript={(txt) => setEditForm({ ...editForm, descricao: txt })}
                    />
                  </div>
                  <textarea
                    rows={4}
                    value={editForm.descricao || ''}
                    onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Solução Aplicada / Parecer Técnico
                    </label>
                    <VoiceInputButton
                      currentValue={editForm.solucaoAplicada || ''}
                      onTranscript={(txt) => setEditForm({ ...editForm, solucaoAplicada: txt })}
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={editForm.solucaoAplicada || ''}
                    onChange={(e) => setEditForm({ ...editForm, solucaoAplicada: e.target.value })}
                    placeholder="Descreva a solução, comandos executados ou instrução dada ao cliente..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed"
                  />
                </div>
              </form>
            ) : (
              /* Read Only Mode Grid */
              <div className="space-y-6 text-xs">
                {/* Details 4 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Cliente
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      {currentAtendimento.clienteNome || 'Não informado'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Responsável pelo Atendimento
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      {currentAtendimento.responsavel}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Módulo & Categoria
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      {currentAtendimento.modulo || 'Geral'}{' '}
                      {currentAtendimento.categoria && (
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSystemTableBadgeStyle('categoriasAtendimento', currentAtendimento.categoria, systemTables, 'slate')}`}>
                          {currentAtendimento.categoria}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Data de Abertura
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      {currentAtendimento.dataAbertura}
                    </span>
                  </div>

                  {/* Linked System Tables Fields (View Mode) */}
                  {linkedTables.map((table) => (
                    <div key={table.key} className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        {table.labelSingular}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {currentAtendimento.camposEspecificos?.[table.key] || 'Não informado'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Descrição Completa */}
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                    Descrição Completa
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                    {currentAtendimento.descricao || 'Nenhuma descrição detalhada informada.'}
                  </p>
                </div>

                {/* Cliente Poderia Executar Este Procedimento? */}
                {currentAtendimento.clientePoderiaExecutar && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block">
                      Cliente poderia executar este procedimento?
                    </span>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {currentAtendimento.clientePoderiaExecutar}
                      {currentAtendimento.clientePoderiaExecutar === 'Sim' && currentAtendimento.motivoProcedimento && (
                        <span className="font-semibold text-slate-600 dark:text-slate-400 ml-2">
                          — Motivo: <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSystemTableBadgeStyle('motivosProcedimento', currentAtendimento.motivoProcedimento, systemTables, 'amber')}`}>
                            {currentAtendimento.motivoProcedimento}
                          </span>
                          {currentAtendimento.motivoProcedimento === 'Outro' && currentAtendimento.motivoOutroDescricao && (
                            <span> ({currentAtendimento.motivoOutroDescricao})</span>
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Necessitou Apoio Interno? */}
                {currentAtendimento.necessitouApoioInterno && (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-800 dark:text-indigo-400 block flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Necessitou Apoio Interno?
                    </span>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {currentAtendimento.necessitouApoioInterno}
                      {currentAtendimento.necessitouApoioInterno === 'Sim' && (
                        <span className="font-semibold text-slate-600 dark:text-slate-400 ml-2">
                          — Origem: <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSystemTableBadgeStyle('origensApoio', currentAtendimento.origemApoio || '', systemTables, 'indigo')}`}>
                            {currentAtendimento.origemApoio}
                          </span>
                          {currentAtendimento.origemApoio === 'Outro' && currentAtendimento.origemApoioOutroDescricao && (
                            <span> ({currentAtendimento.origemApoioOutroDescricao})</span>
                          )}
                          {' '}• Tipo: <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSystemTableBadgeStyle('tiposApoio', currentAtendimento.tipoApoio || '', systemTables, 'indigo')}`}>
                            {currentAtendimento.tipoApoio}
                          </span>
                          {currentAtendimento.tipoApoio === 'Outro' && currentAtendimento.tipoApoioOutroDescricao && (
                            <span> ({currentAtendimento.tipoApoioOutroDescricao})</span>
                          )}
                        </span>
                      )}
                    </p>
                    {currentAtendimento.necessitouApoioInterno === 'Sim' && currentAtendimento.motivoApoioInterno && (
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 pt-1 border-t border-indigo-100 dark:border-indigo-900/50 mt-1">
                        <strong className="font-bold text-indigo-900 dark:text-indigo-300">Motivo:</strong> {currentAtendimento.motivoApoioInterno}
                      </p>
                    )}
                  </div>
                )}

                {/* Solução Aplicada */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solução Aplicada / Parecer
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                    {currentAtendimento.solucaoAplicada || 'Ainda em processo de diagnóstico e resolução. Nenhuma solução formalizada até o momento.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Área de Anexos */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-indigo-500" />
                    Área de Anexos
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-1 shadow-2xs">
                    <Copy className="w-3 h-3 text-emerald-500" /> Suporta Ctrl+V (Cole seu Print)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Anexe arquivos ou cole uma captura de tela da área de transferência (Ctrl+V) em qualquer lugar.
                </p>
              </div>

              {/* Upload Input Button */}
              <div className="flex gap-2">
                <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs">
                  <UploadCloud className="w-4 h-4" />
                  <span>+ Adicionar Anexo</span>
                  <input type="file" onChange={handleAddAttachment} className="hidden" />
                </label>
                <label className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs">
                  <Camera className="w-4 h-4" />
                  <span>Tirar Foto</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleAddAttachment} className="hidden" />
                </label>
              </div>
            </div>

            {/* Compact Attachments Grid with Thumbnails */}
            {anexos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {anexos.map((file) => {
                  const isImg =
                    file.tipo === 'image' ||
                    Boolean(file.previewUrl) ||
                    Boolean(file.nome.match(/\.(png|jpe?g|gif|webp|svg)$/i));

                  return (
                    <div
                      key={file.id}
                      onClick={() => setPreviewAnexo(file)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 group hover:border-indigo-500/50 transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Thumbnail Box */}
                        <div className="w-12 h-12 rounded-xl bg-slate-200/70 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {isImg ? (
                            <img
                              src={
                                file.previewUrl ||
                                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=150&q=80'
                              }
                              alt={file.nome}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <FileCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {file.nome}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {file.tamanho} • {file.dataUpload}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setPreviewAnexo(file)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Visualizar / Ampliar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(file.id, file.nome)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Remover Anexo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400 space-y-2">
                <Paperclip className="w-6 h-6 mx-auto text-slate-300" />
                <p className="font-semibold">Nenhum anexo salvo para este atendimento.</p>
                <p className="text-[11px]">Clique em "+ Adicionar Anexo" para enviar imagens ou documentos.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* activeTab === 'registros' */}
      {activeTab === 'registros' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bug className="w-5 h-5 text-indigo-500" />
                  Registros Vinculados (Bugs, Melhorias e Ideias)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Itens técnicos originados ou associados a este atendimento.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVincularRegistroOpen(true)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>+ Vincular Registro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCriarRegistroOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Criar Registro</span>
                </button>
              </div>
            </div>

            {vinculadosRegistros.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vinculadosRegistros.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => setQuickViewModal({ isOpen: true, type: 'registro', data: reg })}
                    className="p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                          {reg.codigo}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                            {reg.tipo}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                            {reg.status}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {reg.titulo}
                      </h4>

                      {reg.descricao && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {reg.descricao}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <span className="hover:underline">Visualização Rápida</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDesvincularRegistro(reg.id, reg.codigo);
                        }}
                        className="text-rose-500 hover:text-rose-700 hover:underline cursor-pointer transition-colors"
                      >
                        Desvincular
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400 space-y-2">
                <Bug className="w-6 h-6 mx-auto text-slate-300" />
                <p className="font-semibold">Nenhum registro vinculado a este atendimento.</p>
                <p className="text-[11px]">Clique em "+ Vincular Registro" para selecionar um item existente ou "+ Criar Registro" para cadastrar um novo bug/melhoria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* activeTab === 'conhecimento' */}
      {activeTab === 'conhecimento' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  Artigos da Base de Conhecimento
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Procedimentos, documentações técnicas e soluções de contorno associadas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVincularArtigoOpen(true)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>+ Vincular Artigo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCriarArtigoOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Criar Artigo</span>
                </button>
              </div>
            </div>

            {vinculadosArtigos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vinculadosArtigos.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setQuickViewModal({ isOpen: true, type: 'artigo', data: art })}
                    className="p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                          {art.codigo}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {art.categoria}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {art.titulo}
                      </h4>

                      {art.conteudo && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {art.conteudo}
                        </p>
                      )}

                      {art.tags && art.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {art.tags.map((t) => (
                            <span key={t} className="text-[10px] font-medium bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.2 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <span className="hover:underline">Visualização Rápida</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDesvincularArtigo(art.id, art.codigo);
                        }}
                        className="text-rose-500 hover:text-rose-700 hover:underline cursor-pointer transition-colors"
                      >
                        Desvincular
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400 space-y-2">
                <BookOpen className="w-6 h-6 mx-auto text-slate-300" />
                <p className="font-semibold">Nenhum artigo vinculado a este atendimento.</p>
                <p className="text-[11px]">Clique em "+ Vincular Artigo" para relacionar um existente ou "+ Criar Artigo" para publicar uma nova solução na Base de Conhecimento.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* activeTab === 'timeline' */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Timeline de Eventos do Atendimento
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Histórico cronológico completo de ações, alterações e relacionamentos deste chamado.
            </p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {atendimentoTimeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline Dot Icon */}
                <div className="absolute -left-6 top-0.5 p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs">
                  <Clock className="w-3.5 h-3.5" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {item.titulo}
                      {item.relatedCode && (
                        <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 rounded font-bold">
                          {item.relatedCode}
                        </span>
                      )}
                    </span>

                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {item.dataHora}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.descricao}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Autor: <strong className="text-slate-700 dark:text-slate-300">{item.autor}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Vincular Registro */}
      {isVincularRegistroOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full p-6 shadow-2xl space-y-4 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Bug className="w-4 h-4 text-indigo-500" />
                Vincular Registro ao Atendimento
              </h3>
              <button onClick={() => setIsVincularRegistroOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por código ou título..."
                value={searchRegistro}
                onChange={(e) => setSearchRegistro(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
              {recordsPool
                .filter((r) => r.titulo.toLowerCase().includes(searchRegistro.toLowerCase()) || r.codigo.toLowerCase().includes(searchRegistro.toLowerCase()))
                .map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleVincularRegistro(r)}
                    className="pt-2 first:pt-0 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-600">{r.codigo}</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{r.titulo}</p>
                    </div>
                    <button className="px-2.5 py-1 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-[10px] hover:bg-indigo-600 hover:text-white cursor-pointer">
                      Vincular
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Vincular Artigo */}
      {isVincularArtigoOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full p-6 shadow-2xl space-y-4 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Vincular Artigo de Conhecimento
              </h3>
              <button onClick={() => setIsVincularArtigoOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por código ou título de artigo..."
                value={searchArtigo}
                onChange={(e) => setSearchArtigo(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
              {articlesPool
                .filter((a) => a.titulo.toLowerCase().includes(searchArtigo.toLowerCase()) || a.codigo.toLowerCase().includes(searchArtigo.toLowerCase()))
                .map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleVincularArtigo(a)}
                    className="pt-2 first:pt-0 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-600">{a.codigo}</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{a.titulo}</p>
                    </div>
                    <button className="px-2.5 py-1 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-[10px] hover:bg-indigo-600 hover:text-white cursor-pointer">
                      Vincular
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Criar Registro */}
      <RegistroFormDrawer
        isOpen={isCriarRegistroOpen}
        onClose={() => setIsCriarRegistroOpen(false)}
        clients={allClients}
        systemTables={systemTables}
        systemUsers={systemUsers}
        onSave={handleSaveNovoRegistro}
        onShowToast={onShowToast}
      />

      {/* Drawer: Criar Artigo KB */}
      <ArtigoFormDrawer
        isOpen={isCriarArtigoOpen}
        onClose={() => setIsCriarArtigoOpen(false)}
        clients={allClients}
        systemTables={systemTables}
        systemUsers={systemUsers}
        onSave={handleSaveNovoArtigo}
        onShowToast={onShowToast}
      />

      {/* Modal: Attachment Preview / Enlarged Image View */}
      {previewAnexo && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-2xl h-full p-6 shadow-2xl space-y-4 relative overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {previewAnexo.nome}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {previewAnexo.tamanho} • Enviado por {previewAnexo.autor} ({previewAnexo.dataUpload})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewAnexo(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Image or File Viewer */}
            <div className="py-2">
              {previewAnexo.tipo === 'image' || previewAnexo.previewUrl || previewAnexo.nome.match(/\.(png|jpe?g|gif|webp|svg)$/i) ? (
                <div className="bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-2 min-h-[250px] max-h-[60vh]">
                  <img
                    src={
                      previewAnexo.previewUrl ||
                      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80'
                    }
                    alt={previewAnexo.nome}
                    className="max-h-[55vh] w-auto object-contain rounded-xl shadow-lg"
                  />
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                    <FileCode className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Visualização direta não disponível
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Arquivos do tipo <strong className="uppercase font-mono text-indigo-600 dark:text-indigo-400">.{previewAnexo.tipo}</strong> necessitam de download para abertura no seu visualizador local.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Anexo ID: {previewAnexo.id}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewAnexo(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    if (onShowToast) onShowToast('Download', `Iniciando download de "${previewAnexo.nome}"...`);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Quick View Modal */}
      <QuickViewModal
        isOpen={quickViewModal.isOpen}
        onClose={() => setQuickViewModal({ ...quickViewModal, isOpen: false })}
        entityType={quickViewModal.type}
        data={quickViewModal.data}
        onOpenWorkspace={() => {
          setQuickViewModal({ ...quickViewModal, isOpen: false });
        }}
      />
    </div>
  );
};
