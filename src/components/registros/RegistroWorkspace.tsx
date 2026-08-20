import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Bug,
  Sparkles,
  Lightbulb,
  Building2,
  Tag,
  Headphones,
  BookOpen,
  Clock,
  User,
  Plus,
  Trash2,
  Search,
  FileCode2,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  MessageSquare,
  X,
  Eye,
  Copy,
  AlertCircle
} from 'lucide-react';
import {
  RegistroItem,
  AtendimentoItem,
  ArtigoKBItem,
  Cliente,
  RegistroTimelineItem,
  SystemTablesData,
  UserAccount,
} from '../../types';
import { SystemTableMeta } from '../../data/mockSystemTables';
import { initialClients } from '../../data/mockClients';
import { initialAtendimentos } from '../../data/mockAtendimentos';
import { mockArtigos } from '../../data/mockWorkspaceData';
import { initialUsers } from '../../data/mockUsers';
import { QuickViewModal, QuickViewEntityType } from '../common/QuickViewModal';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { ArtigoFormDrawer } from '../drawers/ArtigoFormDrawer';
import { saveArtigo } from '../../lib/supabaseService';
import { getSystemTableBadgeStyle, formatTempoEmDesenvolvimento } from '../../lib/badgeUtils';

interface RegistroWorkspaceProps {
  registro: RegistroItem;
  onBack: () => void;
  onUpdateRegistro: (updatedReg: RegistroItem) => void;
  onShowToast?: (title: string, message: string) => void;
  allClients?: Cliente[];
  allAtendimentos?: AtendimentoItem[];
  onOpenAtendimentoWorkspace?: (atdId: string) => void;
  allArtigos?: ArtigoKBItem[];
  onUpdateArtigosList?: (artigos: ArtigoKBItem[]) => void;
  systemTableDefinitions?: SystemTableMeta[];
  systemTables?: SystemTablesData;
  systemUsers?: UserAccount[];
}

// Pool of default KB articles for search/linking
const defaultKBPool: ArtigoKBItem[] = [
  {
    id: 'art-101',
    codigo: '#ART-055',
    titulo: 'Procedimento de Backup e Failover do Servidor Dell R640',
    categoria: 'Procedimento Técnico',
    conteudo: 'Manual detalhado com o passo a passo para execução do backup frio e alternância da VM para o nó secundário.',
    tags: ['Dell', 'Backup', 'Servidor', 'SLA'],
    status: 'Publicado',
    dataCriacao: '16/01/2025',
    autor: 'Engenharia de Infraestrutura'
  },
  {
    id: 'art-102',
    codigo: '#ART-058',
    titulo: 'Configuração de VPN e IPs Autorizados da Beta Tech',
    categoria: 'Redes & Segurança',
    conteudo: 'Lista de faixas de IP público autorizadas para tráfego seguro e autenticação mTLS.',
    tags: ['VPN', 'Segurança', 'IPs', 'Rede'],
    status: 'Publicado',
    dataCriacao: '02/02/2025',
    autor: 'Suporte N3'
  },
  {
    id: 'art-201',
    codigo: '#ART-102',
    titulo: 'Guia de Integração REST API XPTO - Token Bearer & Rate Limits',
    categoria: 'Integração & API',
    conteudo: 'Documentação com limites de requisição por minuto e renovação automatizada de tokens OAuth2.',
    tags: ['API', 'OAuth2', 'REST', 'XPTO'],
    status: 'Publicado',
    dataCriacao: '15/11/2024',
    autor: 'Equipe de Desenvolvimento'
  },
  {
    id: 'art-301',
    codigo: '#ART-210',
    titulo: 'Solução de Erros de Emissão NF-e (CST 60 / ICMS ST Zerado)',
    categoria: 'Módulo Fiscal',
    conteudo: 'Artigo explicativo para desativar a validação de vICMSST quando o CST for 60 ou 41 e evitar rejeição Sefaz 539.',
    tags: ['Fiscal', 'NF-e', 'ICMS', 'Sefaz'],
    status: 'Publicado',
    dataCriacao: '20/07/2026',
    autor: 'Equipe Fiscal'
  }
];

export const RegistroWorkspace: React.FC<RegistroWorkspaceProps> = ({
  registro,
  onBack,
  onUpdateRegistro,
  onShowToast,
  allClients = initialClients,
  allAtendimentos = initialAtendimentos,
  onOpenAtendimentoWorkspace,
  allArtigos,
  onUpdateArtigosList,
  systemTableDefinitions,
  systemTables,
  systemUsers = initialUsers,
}) => {
  const [currentReg, setCurrentReg] = useState<RegistroItem>({ ...registro });
  const [activeTab, setActiveTab] = useState<'geral' | 'atendimentos' | 'conhecimento' | 'timeline'>('geral');
  const [hasChanges, setHasChanges] = useState(false);

  // Quick View Modal state
  const [quickViewEntity, setQuickViewEntity] = useState<{
    type: QuickViewEntityType;
    data: any;
  } | null>(null);

  // Modals state (All open as Right Drawers)
  const [isVincularAtdOpen, setIsVincularAtdOpen] = useState(false);
  const [searchAtdText, setSearchAtdText] = useState('');

  const [isVincularArtigoOpen, setIsVincularArtigoOpen] = useState(false);
  const [searchArtigoText, setSearchArtigoText] = useState('');

  const [isCriarArtigoOpen, setIsCriarArtigoOpen] = useState(false);
  const [newArtigoTitulo, setNewArtigoTitulo] = useState('');
  const [newArtigoCategoria, setNewArtigoCategoria] = useState('Geral');
  const [newArtigoConteudo, setNewArtigoConteudo] = useState('');

  const [isAddTimelineNoteOpen, setIsAddTimelineNoteOpen] = useState(false);
  const [timelineNoteTitulo, setTimelineNoteTitulo] = useState('');
  const [timelineNoteDesc, setTimelineNoteDesc] = useState('');
  const [timelineNoteTipo, setTimelineNoteTipo] = useState<'comentario' | 'analise' | 'status'>('comentario');

  // Tag Input State in Geral
  const [tagInput, setTagInput] = useState('');

  // Dropdown "Mais Ações"
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);

  // Helper to append event to timeline
  const addTimelineEvent = (
    tipo: RegistroTimelineItem['tipo'],
    titulo: string,
    descricao?: string
  ) => {
    const newEvent: RegistroTimelineItem = {
      id: `tl-${Date.now()}`,
      tipo,
      titulo,
      descricao,
      autor: currentReg.autor || 'Usuário Atual',
      data: `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    };
    return [newEvent, ...(currentReg.timelineEvents || [])];
  };

  const handleSave = () => {
    const updatedEvents = addTimelineEvent('edicao', 'Informações Editadas', 'Atualização dos dados gerais do registro.');
    const updated: RegistroItem = {
      ...currentReg,
      timelineEvents: updatedEvents,
      ultimaAtualizacao: `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    };
    setCurrentReg(updated);
    onUpdateRegistro(updated);
    setHasChanges(false);
    if (onShowToast) {
      onShowToast('Registro Salvo', `As alterações do registro ${updated.codigo} foram salvas.`);
    }
  };

  // Tag Handlers
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim();
    if (currentReg.tags?.includes(cleanTag)) {
      setTagInput('');
      return;
    }
    const newTags = [...(currentReg.tags || []), cleanTag];
    setCurrentReg({ ...currentReg, tags: newTags });
    setHasChanges(true);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = (currentReg.tags || []).filter((t) => t !== tagToRemove);
    setCurrentReg({ ...currentReg, tags: newTags });
    setHasChanges(true);
  };

  // Linking Handlers
  const handleVincularAtendimento = (atd: AtendimentoItem) => {
    if ((currentReg.atendimentosVinculados || []).some((v) => v.id === atd.id)) return;
    const newVinculados = [...(currentReg.atendimentosVinculados || []), atd];
    const newTl = addTimelineEvent('atendimento', 'Atendimento Vinculado', `Atendimento ${atd.codigo} (${atd.clienteNome}) vinculado.`);
    setCurrentReg({
      ...currentReg,
      atendimentosVinculados: newVinculados,
      timelineEvents: newTl
    });
    setHasChanges(true);
    setIsVincularAtdOpen(false);
    setSearchAtdText('');
    if (onShowToast) {
      onShowToast('Atendimento Vinculado', `O atendimento ${atd.codigo} foi vinculado ao registro.`);
    }
  };

  const handleDesvincularAtendimento = (atdId: string, atdCodigo: string) => {
    const newVinculados = (currentReg.atendimentosVinculados || []).filter((a) => a.id !== atdId);
    const newTl = addTimelineEvent('atendimento', 'Atendimento Desvinculado', `Atendimento ${atdCodigo} desvinculado.`);
    setCurrentReg({
      ...currentReg,
      atendimentosVinculados: newVinculados,
      timelineEvents: newTl
    });
    setHasChanges(true);
    if (onShowToast) {
      onShowToast('Atendimento Desvinculado', `O atendimento ${atdCodigo} foi removido deste registro.`);
    }
  };

  const handleVincularArtigo = (art: ArtigoKBItem) => {
    if ((currentReg.artigosVinculados || []).some((a) => a.id === art.id)) return;
    const newVinculados = [...(currentReg.artigosVinculados || []), art];
    const newTl = addTimelineEvent('artigo', 'Artigo KB Vinculado', `Artigo ${art.codigo} (${art.titulo}) vinculado.`);
    setCurrentReg({
      ...currentReg,
      artigosVinculados: newVinculados,
      timelineEvents: newTl
    });
    setHasChanges(true);
    setIsVincularArtigoOpen(false);
    setSearchArtigoText('');

    if (onUpdateArtigosList && allArtigos) {
      if (!allArtigos.some((a) => a.id === art.id)) {
        onUpdateArtigosList([art, ...allArtigos]);
      }
    }

    if (onShowToast) {
      onShowToast('Artigo Vinculado', `O artigo ${art.codigo} foi vinculado ao registro.`);
    }
  };

  const handleDesvincularArtigo = (artId: string, artCodigo: string) => {
    const newVinculados = (currentReg.artigosVinculados || []).filter((a) => a.id !== artId);
    const newTl = addTimelineEvent('artigo', 'Artigo KB Desvinculado', `Artigo ${artCodigo} desvinculado.`);
    setCurrentReg({
      ...currentReg,
      artigosVinculados: newVinculados,
      timelineEvents: newTl
    });
    setHasChanges(true);
    if (onShowToast) {
      onShowToast('Artigo Desvinculado', `O artigo ${artCodigo} foi removido deste registro.`);
    }
  };

  const handleCriarArtigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtigoTitulo.trim()) return;

    const newArt: ArtigoKBItem = {
      id: `art-${Date.now()}`,
      codigo: `#ART-${Math.floor(100 + Math.random() * 900)}`,
      titulo: newArtigoTitulo,
      categoria: newArtigoCategoria,
      conteudo: newArtigoConteudo,
      tags: [currentReg.tipo, currentReg.modulo || 'Geral'],
      status: 'Publicado',
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: currentReg.autor || 'Usuário Atual'
    };

    handleVincularArtigo(newArt);
    setIsCriarArtigoOpen(false);
    setNewArtigoTitulo('');
    setNewArtigoConteudo('');
  };

  const handleAddTimelineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineNoteTitulo.trim()) return;

    const newTl = addTimelineEvent(timelineNoteTipo, timelineNoteTitulo, timelineNoteDesc);
    setCurrentReg({ ...currentReg, timelineEvents: newTl });
    setHasChanges(true);
    setIsAddTimelineNoteOpen(false);
    setTimelineNoteTitulo('');
    setTimelineNoteDesc('');
    if (onShowToast) {
      onShowToast('Nota Adicionada', 'A nova nota foi registrada na Timeline.');
    }
  };

  const getTipoBadge = (t: string) => {
    const style = getSystemTableBadgeStyle('tiposRegistro', t, systemTables, 'slate');
    
    // Tenta encontrar o ícone na tabela do sistema
    const itemObj = systemTables?.tiposRegistro?.find(i => i.nome === t);
    let IconComponent: any = FileCode2;
    
    if (itemObj?.icon) {
      // Aqui poderíamos mapear o nome do ícone para o componente, 
      // mas como usamos strings no storage, simplificamos com fallbacks conhecidos
      if (t === 'Bug') IconComponent = Bug;
      else if (t === 'Melhoria') IconComponent = Sparkles;
      else if (t === 'Ideia') IconComponent = Lightbulb;
    } else {
      if (t === 'Bug') IconComponent = Bug;
      else if (t === 'Melhoria') IconComponent = Sparkles;
      else if (t === 'Ideia') IconComponent = Lightbulb;
    }

    return { icon: <IconComponent className="w-4 h-4" />, bg: style };
  };

  const getStatusBadge = (st: string) => {
    return getSystemTableBadgeStyle('statusRegistro', st, systemTables, 'slate');
  };

  // Filter available atendimentos for linking
  const filteredAvailableAtds = allAtendimentos.filter(
    (a) =>
      (a.codigo.toLowerCase().includes(searchAtdText.toLowerCase()) ||
        a.assunto.toLowerCase().includes(searchAtdText.toLowerCase()) ||
        a.clienteNome.toLowerCase().includes(searchAtdText.toLowerCase())) &&
      !(currentReg.atendimentosVinculados || []).some((v) => v.id === a.id)
  );

  // Filter available articles for linking
  const articlesPool = allArtigos || [];

  const filteredAvailableArticles = articlesPool.filter(
    (art) =>
      (art.codigo.toLowerCase().includes(searchArtigoText.toLowerCase()) ||
        art.titulo.toLowerCase().includes(searchArtigoText.toLowerCase()) ||
        art.categoria.toLowerCase().includes(searchArtigoText.toLowerCase())) &&
      !(currentReg.artigosVinculados || []).some((v) => v.id === art.id)
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Quick View Modal */}
      {quickViewEntity && (
        <QuickViewModal
          isOpen={true}
          onClose={() => setQuickViewEntity(null)}
          entityType={quickViewEntity.type}
          data={quickViewEntity.data}
          onOpenWorkspace={(type, data) => {
            if (type === 'atendimento' && onOpenAtendimentoWorkspace) {
              setQuickViewEntity(null);
              onOpenAtendimentoWorkspace(data.id);
            }
          }}
        />
      )}

      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Registros</span>
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-900/50">
                {currentReg.codigo}
              </span>
              <div
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold flex items-center gap-1 border ${
                  getTipoBadge(currentReg.tipo).bg
                }`}
              >
                {getTipoBadge(currentReg.tipo).icon}
                <span>{currentReg.tipo}</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getStatusBadge(
                  currentReg.status
                )}`}
              >
                {currentReg.status}
              </span>
              {(currentReg.status === 'Em Desenvolvimento' || currentReg.status === 'Em desenvolvimento') && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  {formatTempoEmDesenvolvimento(currentReg.dataEmDesenvolvimento, currentReg.data)}
                </span>
              )}

            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              {currentReg.titulo}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Módulo: <strong className="text-slate-700 dark:text-slate-200">{currentReg.modulo || 'Geral'}</strong> • Criado em: {currentReg.data}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {hasChanges && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold animate-pulse hidden sm:inline">
              ● Alterações pendentes
            </span>
          )}

          {/* Mais Ações Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <MoreVertical className="w-4 h-4" />
              <span>Mais Ações</span>
            </button>

            {isMoreActionsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-30 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Alterar Status Rápido
                </div>
                {((systemTables?.statusRegistro?.filter((s) => s.status === 'Ativo' || s.nome === currentReg.status) || [])
                ).map((stObj) => stObj.nome).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      const isEmDev = st === 'Em Desenvolvimento' || st === 'Em desenvolvimento';
                      const newTl = addTimelineEvent('status', 'Status Alterado', `Status alterado para ${st}`);
                      setCurrentReg({
                        ...currentReg,
                        status: st,
                        dataEmDesenvolvimento: isEmDev ? (currentReg.dataEmDesenvolvimento || new Date().toISOString()) : currentReg.dataEmDesenvolvimento,
                        timelineEvents: newTl
                      });
                      setHasChanges(true);
                      setIsMoreActionsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>{st}</span>
                    {currentReg.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`${currentReg.codigo} - ${currentReg.titulo}`);
                    setIsMoreActionsOpen(false);
                    if (onShowToast) onShowToast('Copiado!', 'Código e título copiados.');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Código & Título</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20 cursor-pointer text-xs shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('geral')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'geral'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Geral
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('atendimentos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'atendimentos'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>Atendimentos ({currentReg.atendimentosVinculados?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('conhecimento')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'conhecimento'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Conhecimento ({currentReg.artigosVinculados?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline ({currentReg.timelineEvents?.length || 0})</span>
        </button>
      </div>

      {/* ABA GERAL - DIVIDIDA EM 2 CARDS NO PADRÃO SIGI */}
      {activeTab === 'geral' && (
        <div className="space-y-6">
          {/* Card 1 — Informações do Registro */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-indigo-500" />
                Informações do Registro
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">ID: {currentReg.id}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Tipo
                </label>
                <select
                  value={currentReg.tipo}
                  onChange={(e) => {
                    setCurrentReg({ ...currentReg, tipo: e.target.value as any });
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {(systemTables?.tiposRegistro?.filter((t: any) => t.status === 'Ativo' || t.nome === currentReg.tipo) || []).map((t: any) => (
                    <option key={t.id} value={t.nome}>{t.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={currentReg.status}
                  onChange={(e) => {
                    setCurrentReg({ ...currentReg, status: e.target.value as any });
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {(systemTables?.statusRegistro?.filter((s: any) => s.status === 'Ativo' || s.nome === currentReg.status) || [])
                    .map((s: any) => (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Prioridade
                </label>
                <select
                  value={currentReg.prioridade || ''}
                  onChange={(e) => {
                    setCurrentReg({ ...currentReg, prioridade: e.target.value as any });
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {(systemTables?.prioridadesRegistro?.filter((p: any) => p.status === 'Ativo' || p.nome === currentReg.prioridade) || []).map((p: any) => (
                    <option key={p.id} value={p.nome}>{p.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Sistema
                </label>
                <select
                  value={systemTables?.sistemas?.find(s => s.nome === currentReg.sistema)?.id || ''}
                  onChange={(e) => {
                    const sisObj = systemTables?.sistemas?.find(s => s.id === e.target.value);
                    setCurrentReg({ ...currentReg, sistema: sisObj ? sisObj.nome : '', modulo: '' });
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  <option value="">Nenhum Sistema</option>
                  {systemTables?.sistemas?.filter(s => s.status === 'Ativo' || s.nome === currentReg.sistema).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Módulo
                </label>
                <select
                  value={currentReg.modulo || ''}
                  onChange={(e) => {
                    setCurrentReg({ ...currentReg, modulo: e.target.value });
                    setHasChanges(true);
                  }}
                  disabled={!currentReg.sistema}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 disabled:opacity-50"
                >
                  <option value="">Nenhum Módulo</option>
                  {systemTables?.modulos?.filter((m: any) => m.status === 'Ativo' && m.sistemaId === systemTables?.sistemas?.find(s => s.nome === currentReg.sistema)?.id).map((m: any) => (
                    <option key={m.id} value={m.nome}>{m.nome}</option>
                  ))}
                </select>
              </div>

              {(currentReg.tipo === 'Melhoria' || currentReg.tipo === 'Solicitação de Feature') && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Nível de Impacto
                  </label>
                  <select
                    value={currentReg.impacto || ''}
                    onChange={(e) => {
                      setCurrentReg({ ...currentReg, impacto: e.target.value as any });
                      setHasChanges(true);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                  >
                    {systemTables?.impactosRegistro?.filter((i: any) => i.status === 'Ativo' || i.nome === currentReg.impacto).map((i: any) => (
                      <option key={i.id} value={i.nome}>{i.nome}</option>
                    )) || (
                      <>
                        <option value="Baixo">Baixo</option>
                        <option value="Médio">Médio</option>
                        <option value="Alto">Alto</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              <div className="lg:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Título do Registro
                </label>
                <input
                  type="text"
                  value={currentReg.titulo}
                  onChange={(e) => {
                    setCurrentReg({ ...currentReg, titulo: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Responsável / Autor
                </label>
                <select
                  value={currentReg.autor}
                  onChange={(e) => {
                    setCurrentReg({ ...currentReg, autor: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  <option value="">Selecione...</option>
                  {systemUsers.map((u) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Cliente Origem (opcional)
                </label>
                <select
                  value={currentReg.clienteId || ''}
                  onChange={(e) => {
                    const found = allClients.find((c) => c.id === e.target.value);
                    setCurrentReg({
                      ...currentReg,
                      clienteId: found?.id,
                      clienteNome: found?.razaoSocial
                    });
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
                >
                  <option value="">Nenhum cliente (Geral)</option>
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} - {c.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic System Table Fields */}
              {systemTableDefinitions
                ?.filter((d) => d.linkedToEntity === 'registro')
                .map((table) => (
                  <div key={table.key}>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {table.labelSingular}
                    </label>
                    <select
                      value={currentReg.camposEspecificos?.[table.key] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrentReg({
                          ...currentReg,
                          camposEspecificos: {
                            ...(currentReg.camposEspecificos || {}),
                            [table.key]: val,
                          },
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Selecione...</option>
                      {(systemTables?.[table.key] || []).filter((opt: any) => opt.status === 'Ativo' || opt.nome === (currentReg.camposEspecificos?.[table.key])).map((opt: any) => (
                        <option key={opt.id} value={opt.nome}>
                          {opt.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>

            {/* Read-Only Carimbos / Metadata */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-4">
                <span>Data de Criação: <strong className="text-slate-800 dark:text-slate-200">{currentReg.data}</strong></span>
                <span>Última Atualização: <strong className="text-slate-800 dark:text-slate-200">{currentReg.ultimaAtualizacao || currentReg.data}</strong></span>
              </div>
              {currentReg.clienteNome && (
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Building2 className="w-3.5 h-3.5" />
                  {currentReg.clienteNome}
                </span>
              )}
            </div>
          </div>

          {/* Card 2 — Descrição & Observações */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Bug className="w-4 h-4 text-indigo-500" />
              Descrição Completa, Análise & Tags
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Descrição Completa do Problema ou Funcionalidade
                  </label>
                  <VoiceInputButton
                    currentValue={currentReg.descricao || ''}
                    onTranscript={(txt) => {
                      setCurrentReg({ ...currentReg, descricao: txt });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <textarea
                  rows={4}
                  value={currentReg.descricao || ''}
                  onChange={(e) => {
                    setCurrentReg({ ...currentReg, descricao: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 leading-relaxed min-h-[100px]"
                  placeholder="Descreva detalhadamente o comportamento inesperado ou os requisitos..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Análise Técnica & Observações
                  </label>
                  <VoiceInputButton
                    currentValue={currentReg.analiseTecnica || ''}
                    onTranscript={(txt) => {
                      setCurrentReg({ ...currentReg, analiseTecnica: txt });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="Causa raiz, trechos de código, tabelas de banco de dados impactadas, scripts SQL ou instruções de teste..."
                  value={currentReg.analiseTecnica || ''}
                  onChange={(e) => {
                    setCurrentReg({ ...currentReg, analiseTecnica: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 leading-relaxed min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-500" />
                  Tags do Registro
                </label>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {(currentReg.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Adicionar tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs w-32"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="p-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA ATENDIMENTOS */}
      {activeTab === 'atendimentos' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Headphones className="w-4 h-4 text-indigo-500" />
                Atendimentos Relacionados
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Consulte todos os chamados de clientes associados a esta ocorrência ou vincule novos.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsVincularAtdOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Vincular Atendimento</span>
            </button>
          </div>

          {currentReg.atendimentosVinculados && currentReg.atendimentosVinculados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentReg.atendimentosVinculados.map((atd) => (
                <div
                  key={atd.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-900/50">
                        {atd.codigo}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSystemTableBadgeStyle('statusAtendimento', atd.status, systemTables, 'indigo')}`}>
                        {atd.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {atd.clienteNome}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 mt-1.5">
                      {atd.assunto}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickViewEntity({ type: 'atendimento', data: atd })}
                        className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualização Rápida</span>
                      </button>
                      {onOpenAtendimentoWorkspace && (
                        <button
                          type="button"
                          onClick={() => onOpenAtendimentoWorkspace(atd.id)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer ml-2"
                        >
                          <span>Workspace</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDesvincularAtendimento(atd.id, atd.codigo)}
                      className="text-slate-400 hover:text-rose-500 text-xs font-bold p-1 cursor-pointer"
                      title="Desvincular Atendimento"
                    >
                      Desvincular
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-3">
              <Headphones className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-medium">Nenhum atendimento vinculado a este registro até o momento.</p>
              <button
                type="button"
                onClick={() => setIsVincularAtdOpen(true)}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Vincular Primeiro Atendimento</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ABA CONHECIMENTO */}
      {activeTab === 'conhecimento' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Artigos da Base de Conhecimento
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Artigos técnicos, manuais e procedimentos relacionados a este registro.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVincularArtigoOpen(true)}
                className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Vincular Artigo Existente</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCriarArtigoOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Criar Novo Artigo</span>
              </button>
            </div>
          </div>

          {currentReg.artigosVinculados && currentReg.artigosVinculados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentReg.artigosVinculados.map((art) => (
                <div
                  key={art.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-900/50">
                        {art.codigo}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                        {art.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      {art.titulo}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Categoria: <strong className="text-slate-700 dark:text-slate-200">{art.categoria}</strong>
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setQuickViewEntity({ type: 'artigo', data: art })}
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visualização Rápida</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDesvincularArtigo(art.id, art.codigo)}
                      className="text-slate-400 hover:text-rose-500 text-xs font-bold p-1 cursor-pointer"
                    >
                      Desvincular
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-medium">Nenhum artigo da Base de Conhecimento vinculado.</p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsVincularArtigoOpen(true)}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Vincular Artigo
                </button>
                <button
                  type="button"
                  onClick={() => setIsCriarArtigoOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Criar Novo Artigo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Histórico & Linha do Tempo do Registro
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Rastreabilidade completa de edições, alterações de status e atendimentos ou artigos vinculados.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddTimelineNoteOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Nota à Timeline</span>
            </button>
          </div>

          {currentReg.timelineEvents && currentReg.timelineEvents.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {currentReg.timelineEvents.map((evt) => {
                const getEventIcon = () => {
                  switch (evt.tipo) {
                    case 'criacao':
                      return <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />;
                    case 'status':
                      return <Clock className="w-3.5 h-3.5 text-amber-500" />;
                    case 'atendimento':
                      return <Headphones className="w-3.5 h-3.5 text-blue-500" />;
                    case 'artigo':
                      return <BookOpen className="w-3.5 h-3.5 text-violet-500" />;
                    case 'analise':
                      return <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
                    default:
                      return <MessageSquare className="w-3.5 h-3.5 text-slate-500" />;
                  }
                };

                return (
                  <div key={evt.id} className="relative group">
                    <div className="absolute -left-6 top-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-2xs">
                      {getEventIcon()}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {evt.titulo}
                        </strong>
                        <span className="text-[10px] font-mono text-slate-400">
                          {evt.data}
                        </span>
                      </div>
                      {evt.descricao && (
                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                          {evt.descricao}
                        </p>
                      )}
                      <div className="pt-1 text-[10px] text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Por: <strong>{evt.autor}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
              Nenhum evento registrado no histórico até o momento.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VINCULAR ATENDIMENTO (RIGHT DRAWER) */}
      {/* ========================================================================= */}
      {isVincularAtdOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col z-50 relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Vincular Atendimento
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Selecione um chamado de cliente para associar ao registro {currentReg.codigo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVincularAtdOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Content */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Pesquisar por código, cliente ou assunto..."
                  value={searchAtdText}
                  onChange={(e) => setSearchAtdText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-2 pt-2">
                {filteredAvailableAtds.length > 0 ? (
                  filteredAvailableAtds.map((atd) => (
                    <div
                      key={atd.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-indigo-300 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {atd.codigo}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                            {atd.status}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate mt-0.5">
                          {atd.clienteNome}
                        </h4>
                        <p className="text-slate-500 text-xs truncate">{atd.assunto}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVincularAtendimento(atd)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Vincular
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Nenhum atendimento disponível para vincular.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VINCULAR ARTIGO KB (RIGHT DRAWER) */}
      {/* ========================================================================= */}
      {isVincularArtigoOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col z-50 relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Vincular Artigo da Base de Conhecimento
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Selecione um artigo técnico para associar ao registro {currentReg.codigo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVincularArtigoOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Content */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Pesquisar por código, título ou categoria..."
                  value={searchArtigoText}
                  onChange={(e) => setSearchArtigoText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-2 pt-2">
                {filteredAvailableArticles.length > 0 ? (
                  filteredAvailableArticles.map((art) => (
                    <div
                      key={art.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-indigo-300 transition-all"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                          {art.codigo}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          {art.categoria}
                        </span>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate mt-1">
                          {art.titulo}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVincularArtigo(art)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Vincular
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Nenhum artigo encontrado.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Criar Artigo KB */}
      <ArtigoFormDrawer
        isOpen={isCriarArtigoOpen}
        onClose={() => setIsCriarArtigoOpen(false)}
        clients={allClients}
        systemTables={systemTables}
        systemUsers={[]}
        onSave={(newArt) => {
          handleVincularArtigo(newArt);
          saveArtigo(newArt);
          setIsCriarArtigoOpen(false);
          if (onShowToast) {
            onShowToast('Artigo Criado', `O artigo ${newArt.codigo} foi criado e vinculado com sucesso.`);
          }
        }}
        onShowToast={onShowToast}
      />

      {/* ========================================================================= */}
      {/* MODAL: ADICIONAR NOTA NA TIMELINE (RIGHT DRAWER) */}
      {/* ========================================================================= */}
      {isAddTimelineNoteOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-xl h-full shadow-2xl flex flex-col z-50 relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Adicionar Nota à Timeline
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Registre uma atualização interna, observação ou alteração no histórico do registro
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTimelineNoteOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddTimelineNote} className="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Tipo de Evento
                </label>
                <select
                  value={timelineNoteTipo}
                  onChange={(e) => setTimelineNoteTipo(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="comentario">💬 Comentário / Nota Interna</option>
                  <option value="analise">✨ Atualização de Análise Técnica</option>
                  <option value="status">⏱️ Alteração de Status / Prioridade</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Título da Nota
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teste em homologação concluído..."
                  value={timelineNoteTitulo}
                  onChange={(e) => setTimelineNoteTitulo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    Detalhes / Descrição / Análise
                  </label>
                  <VoiceInputButton currentValue={timelineNoteDesc} onTranscript={setTimelineNoteDesc} />
                </div>
                <textarea
                  rows={5}
                  placeholder="Descreva as alterações ou observações de acompanhamento..."
                  value={timelineNoteDesc}
                  onChange={(e) => setTimelineNoteDesc(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed font-sans"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddTimelineNoteOpen(false)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Registrar na Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
