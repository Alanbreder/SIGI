import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  BookOpen,
  FileText,
  Building2,
  Tag,
  Headphones,
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
  Cpu,
  Layers,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Table,
  Code,
  Quote,
  Image as ImageIcon,
  FolderOpen,
  Split,
  Edit3,
  ChevronRight,
  Upload,
  Check
} from 'lucide-react';
import {
  ArtigoKBItem,
  AtendimentoItem,
  RegistroItem,
  EquipamentoItem,
  Cliente,
  ArtigoTimelineItem,
  UserAccount,
  SmbConfig
} from '../../types';
import { initialClients } from '../../data/mockClients';
import { initialAtendimentos } from '../../data/mockAtendimentos';
import { initialRegistros } from '../../data/mockRegistros';
import { QuickViewModal, QuickViewEntityType } from '../common/QuickViewModal';
import { DocumentPreviewRenderer } from '../common/DocumentPreviewRenderer';

interface ArticleWorkspaceProps {
  artigo: ArtigoKBItem;
  onBack: () => void;
  onUpdateArtigo: (updated: ArtigoKBItem) => void;
  onDeleteArtigo?: (artigoId: string) => void;
  onShowToast?: (title: string, message: string) => void;
  allClients?: Cliente[];
  allAtendimentos?: AtendimentoItem[];
  allRegistros?: RegistroItem[];
  onOpenAtendimentoWorkspace?: (atdId: string) => void;
  onOpenRegistroWorkspace?: (regId: string) => void;
  systemUsers?: UserAccount[];
  systemTables?: any;
  smbConfig?: SmbConfig;
}

// Repositório de imagens de exemplo no SMB
const mockSmbImages = [
  {
    id: 'smb-1',
    nome: 'print_config_nfe_cert.png',
    caminhoSmb: '\\\\smb-server\\arquivos_sip\\imagens\\print_config_nfe_cert.png',
    categoria: 'Fiscal / NF-e',
    tamanho: '245 KB',
    data: '28/07/2026',
    previewUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'smb-2',
    nome: 'print_topologia_rede.png',
    caminhoSmb: '\\\\smb-server\\arquivos_sip\\imagens\\print_topologia_rede.png',
    categoria: 'Redes & Infra',
    tamanho: '512 KB',
    data: '29/07/2026',
    previewUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'smb-3',
    nome: 'print_pdv_caixa_pdv.png',
    caminhoSmb: '\\\\smb-server\\arquivos_sip\\imagens\\print_pdv_caixa_pdv.png',
    categoria: 'PDV & Caixa',
    tamanho: '180 KB',
    data: '30/07/2026',
    previewUrl: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'smb-4',
    nome: 'print_backup_postgresql.png',
    caminhoSmb: '\\\\smb-server\\arquivos_sip\\imagens\\print_backup_postgresql.png',
    categoria: 'Servidores / DB',
    tamanho: '320 KB',
    data: '31/07/2026',
    previewUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'
  }
];

export const ArticleWorkspace: React.FC<ArticleWorkspaceProps> = ({
  artigo,
  onBack,
  onUpdateArtigo,
  onDeleteArtigo,
  onShowToast,
  allClients = initialClients,
  allAtendimentos = initialAtendimentos,
  allRegistros = initialRegistros,
  onOpenAtendimentoWorkspace,
  onOpenRegistroWorkspace,
  systemUsers = [],
  systemTables,
  smbConfig
}) => {
  const defaultUserList = systemUsers.length > 0
    ? systemUsers.map((u) => u.name)
    : ['Carlos Silva', 'Mariana Lima', 'Roberto Souza', 'Ana Paula Costa', 'Felipe Santos'];

  const [currentArt, setCurrentArt] = useState<ArtigoKBItem>({ ...artigo });
  const [activeTab, setActiveTab] = useState<'geral' | 'atendimentos' | 'registros' | 'relacionados' | 'timeline'>('geral');
  const [hasChanges, setHasChanges] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const handleDeleteArtigo = () => {
    if (onDeleteArtigo) {
      onDeleteArtigo(currentArt.id);
      if (onShowToast) {
        onShowToast('Artigo Excluído', `O artigo ${currentArt.codigo} foi removido com sucesso.`);
      }
      setIsConfirmDeleteOpen(false);
      onBack();
    }
  };

  // Workspace Mode (Default Consultation / Read-only)
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);

  // Document Editor State (Default to preview / Visualizar Documento)
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('preview');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Timeline Inspection Drawer State
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<ArtigoTimelineItem | null>(null);

  // SMB Drawer State
  const [isSmbDrawerOpen, setIsSmbDrawerOpen] = useState(false);
  const [smbFilterText, setSmbFilterText] = useState('');
  const [customSmbPath, setCustomSmbPath] = useState('');
  const [customSmbCaption, setCustomSmbCaption] = useState('');

  // Rich formatting helper
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      const updated = (currentArt.conteudo || '') + `${prefix}${defaultText}${suffix}`;
      setCurrentArt((prev) => ({ ...prev, conteudo: updated }));
      setHasChanges(true);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = currentArt.conteudo || '';
    const selectedText = currentText.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);

    setCurrentArt((prev) => ({ ...prev, conteudo: newText }));
    setHasChanges(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  // Clipboard Paste Handler for direct image screenshots
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const timestamp = Date.now();
            const smbFileName = `print_colado_${timestamp}.png`;
            const smbPath = `\\\\smb-server\\compartilhado\\prints\\${smbFileName}`;

            const imageMarkdown = `\n\n![Print Colado (${smbFileName})](${dataUrl})\n*📁 Imagem salva no repositório SMB: \`${smbPath}\`*\n\n`;

            insertFormatting(imageMarkdown, '', '');
            if (onShowToast) {
              onShowToast(
                'Print Colado (SMB)',
                `Imagem colada da área de transferência e registrada no repositório SMB: ${smbPath}`
              );
            }
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const handleInsertSmbImage = (path: string, caption: string) => {
    const cleanCaption = caption || 'Imagem Anexada (SMB)';
    const markdown = `\n\n![${cleanCaption}](${path})\n*📁 Repositório SMB: \`${path}\`*\n\n`;
    insertFormatting(markdown, '', '');
    setIsSmbDrawerOpen(false);
    setCustomSmbPath('');
    setCustomSmbCaption('');
    if (onShowToast) {
      onShowToast('Imagem Inserida', `Imagem do servidor SMB adicionada ao documento.`);
    }
  };

  // Quick View Modal
  const [quickViewEntity, setQuickViewEntity] = useState<{
    type: QuickViewEntityType;
    data: any;
  } | null>(null);

  // Modals / Drawers (Right Drawer format)
  const [isVincularAtdOpen, setIsVincularAtdOpen] = useState(false);
  const [searchAtdText, setSearchAtdText] = useState('');

  const [isVincularRegOpen, setIsVincularRegOpen] = useState(false);
  const [searchRegText, setSearchRegText] = useState('');

  const [isAddTimelineNoteOpen, setIsAddTimelineNoteOpen] = useState(false);
  const [timelineNoteTitulo, setTimelineNoteTitulo] = useState('');
  const [timelineNoteDesc, setTimelineNoteDesc] = useState('');
  const [timelineNoteTipo, setTimelineNoteTipo] = useState<ArtigoTimelineItem['tipo']>('comentario');

  // Tag Input State
  const [tagInput, setTagInput] = useState('');

  // Dropdown "Mais Ações"
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);

  // Helper to append event to timeline
  const addTimelineEvent = (
    tipo: ArtigoTimelineItem['tipo'],
    titulo: string,
    descricao?: string
  ) => {
    const newEvent: ArtigoTimelineItem = {
      id: `tl-${Date.now()}`,
      tipo,
      titulo,
      descricao,
      autor: currentArt.autor || 'Usuário Atual',
      data: `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    };
    return [newEvent, ...(currentArt.timelineEvents || [])];
  };

  const handleSave = () => {
    const changesList: string[] = [];
    if (currentArt.titulo !== artigo.titulo) changesList.push(`• Título alterado para: "${currentArt.titulo}"`);
    if (currentArt.modulo !== artigo.modulo) changesList.push(`• Módulo: ${artigo.modulo || 'Geral'} ➔ ${currentArt.modulo}`);
    if (currentArt.categoria !== artigo.categoria) changesList.push(`• Categoria: ${artigo.categoria} ➔ ${currentArt.categoria}`);
    if (currentArt.status !== artigo.status) changesList.push(`• Status: ${artigo.status} ➔ ${currentArt.status}`);
    if (currentArt.autor !== artigo.autor) changesList.push(`• Autor: ${currentArt.autor}`);
    if (currentArt.conteudo !== artigo.conteudo) changesList.push(`• Conteúdo do documento atualizado (${(currentArt.conteudo || '').length} caracteres)`);
    if (JSON.stringify(currentArt.tags) !== JSON.stringify(artigo.tags)) changesList.push(`• Tags: ${(currentArt.tags || []).join(', ')}`);

    const descNotes = changesList.length > 0 
      ? `Resumo das alterações realizadas:\n${changesList.join('\n')}` 
      : 'Atualização do conteúdo e metadados do documento.';

    const updatedEvents = addTimelineEvent('edicao', 'Alteração Registrada', descNotes);
    const updated: ArtigoKBItem = {
      ...currentArt,
      timelineEvents: updatedEvents,
      ultimaAtualizacao: `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    };
    setCurrentArt(updated);
    onUpdateArtigo(updated);
    setHasChanges(false);
    setIsEditingWorkspace(false);
    setEditorMode('preview');
    if (onShowToast) {
      onShowToast('Artigo Salvo', `As alterações do artigo ${updated.codigo} foram salvas.`);
    }
  };

  // Tag Handlers
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim();
    if (currentArt.tags?.includes(cleanTag)) {
      setTagInput('');
      return;
    }
    const newTags = [...(currentArt.tags || []), cleanTag];
    setCurrentArt({ ...currentArt, tags: newTags });
    setHasChanges(true);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = (currentArt.tags || []).filter((t) => t !== tagToRemove);
    setCurrentArt({ ...currentArt, tags: newTags });
    setHasChanges(true);
  };

  // Linking Atendimento Handlers
  const handleVincularAtendimento = (atd: AtendimentoItem) => {
    if ((currentArt.atendimentosVinculados || []).some((v) => v.id === atd.id)) return;
    const newVinculados = [...(currentArt.atendimentosVinculados || []), atd];
    const newTl = addTimelineEvent('atendimento', 'Atendimento Vinculado', `Atendimento ${atd.codigo} (${atd.clienteNome}) vinculado.`);
    setCurrentArt({
      ...currentArt,
      atendimentosVinculados: newVinculados,
      timelineEvents: newTl
    });
    setHasChanges(true);
    setIsVincularAtdOpen(false);
    setSearchAtdText('');
    if (onShowToast) {
      onShowToast('Atendimento Vinculado', `O atendimento ${atd.codigo} foi vinculado a este artigo.`);
    }
  };

  const handleDesvincularAtendimento = (atdId: string, atdCodigo: string) => {
    const newVinculados = (currentArt.atendimentosVinculados || []).filter((a) => a.id !== atdId);
    const newTl = addTimelineEvent('atendimento', 'Atendimento Desvinculado', `Atendimento ${atdCodigo} desvinculado.`);
    setCurrentArt({
      ...currentArt,
      atendimentosVinculados: newVinculados,
      timelineEvents: newTl
    });
    setHasChanges(true);
    if (onShowToast) {
      onShowToast('Atendimento Desvinculado', `O atendimento ${atdCodigo} foi removido deste artigo.`);
    }
  };

  // Linking Registro Handlers
  const handleVincularRegistro = (reg: RegistroItem) => {
    if ((currentArt.registrosVinculados || []).some((r) => r.id === reg.id)) return;
    const newVinculados = [...(currentArt.registrosVinculados || []), reg];
    const newTl = addTimelineEvent('registro', 'Registro Vinculado', `Registro ${reg.codigo} (${reg.titulo}) vinculado.`);
    setCurrentArt({
      ...currentArt,
      registrosVinculados: newVinculados,
      timelineEvents: newTl
    });
    setHasChanges(true);
    setIsVincularRegOpen(false);
    setSearchRegText('');
    if (onShowToast) {
      onShowToast('Registro Vinculado', `O registro ${reg.codigo} foi vinculado a este artigo.`);
    }
  };

  const handleDesvincularRegistro = (regId: string, regCodigo: string) => {
    const newVinculados = (currentArt.registrosVinculados || []).filter((r) => r.id !== regId);
    const newTl = addTimelineEvent('registro', 'Registro Desvinculado', `Registro ${regCodigo} desvinculado.`);
    setCurrentArt({
      ...currentArt,
      registrosVinculados: newVinculados,
      timelineEvents: newTl
    });
    setHasChanges(true);
    if (onShowToast) {
      onShowToast('Registro Desvinculado', `O registro ${regCodigo} foi removido deste artigo.`);
    }
  };

  const handleAddTimelineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineNoteTitulo.trim()) return;

    const newTl = addTimelineEvent(timelineNoteTipo, timelineNoteTitulo, timelineNoteDesc);
    setCurrentArt({ ...currentArt, timelineEvents: newTl });
    setHasChanges(true);
    setIsAddTimelineNoteOpen(false);
    setTimelineNoteTitulo('');
    setTimelineNoteDesc('');
    if (onShowToast) {
      onShowToast('Nota Adicionada', 'A nova nota foi registrada na Timeline.');
    }
  };

  // Filter available items
  const filteredAvailableAtds = allAtendimentos.filter(
    (a) =>
      (a.codigo.toLowerCase().includes(searchAtdText.toLowerCase()) ||
        a.assunto.toLowerCase().includes(searchAtdText.toLowerCase()) ||
        a.clienteNome.toLowerCase().includes(searchAtdText.toLowerCase())) &&
      !(currentArt.atendimentosVinculados || []).some((v) => v.id === a.id)
  );

  const filteredAvailableRegs = allRegistros.filter(
    (r) =>
      (r.codigo.toLowerCase().includes(searchRegText.toLowerCase()) ||
        r.titulo.toLowerCase().includes(searchRegText.toLowerCase()) ||
        r.tipo.toLowerCase().includes(searchRegText.toLowerCase())) &&
      !(currentArt.registrosVinculados || []).some((v) => v.id === r.id)
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
            } else if (type === 'registro' && onOpenRegistroWorkspace) {
              setQuickViewEntity(null);
              onOpenRegistroWorkspace(data.id);
            }
          }}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Base de Conhecimento</span>
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-900/50">
                {currentArt.codigo}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {currentArt.tipoArtigo || currentArt.categoria}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                  currentArt.status === 'Publicado'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200'
                }`}
              >
                {currentArt.status}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              {currentArt.titulo}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Módulo: <strong className="text-slate-700 dark:text-slate-200">{currentArt.modulo || 'Geral'}</strong> • Criado em: {currentArt.dataCriacao} por {currentArt.autor}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {hasChanges && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold animate-pulse hidden sm:inline">
              ● Alterações pendentes
            </span>
          )}

          {/* Mais Ações */}
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
                  Alterar Status
                </div>
                {(systemTables?.statusBaseConhecimento?.filter((s: any) => s.status === 'Ativo' || s.nome === currentArt.status).map((s: any) => s.nome) || ['Publicado', 'Rascunho', 'Arquivado']).map((st: string) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      const newTl = addTimelineEvent('status', 'Status Alterado', `Status alterado para ${st}`);
                      setCurrentArt({ ...currentArt, status: st as any, timelineEvents: newTl });
                      setHasChanges(true);
                      setIsMoreActionsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>{st}</span>
                    {currentArt.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`${currentArt.codigo} - ${currentArt.titulo}\n\n${currentArt.conteudo || ''}`);
                    setIsMoreActionsOpen(false);
                    if (onShowToast) onShowToast('Copiado!', 'Título e conteúdo copiados.');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Conteúdo do Artigo</span>
                </button>

                {onDeleteArtigo && (
                  <>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreActionsOpen(false);
                        setIsConfirmDeleteOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Excluir Artigo</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {!isEditingWorkspace ? (
            <button
              type="button"
              onClick={() => {
                setIsEditingWorkspace(true);
                setEditorMode('edit');
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20 cursor-pointer text-xs shrink-0"
            >
              <Edit3 className="w-4 h-4" />
              <span>Alterar</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentArt({ ...artigo });
                  setHasChanges(false);
                  setIsEditingWorkspace(false);
                  setEditorMode('preview');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer text-xs shrink-0 border border-slate-200 dark:border-slate-700"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer text-xs shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
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
          <span>Atendimentos ({currentArt.atendimentosVinculados?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('registros')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'registros'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Registros / Bugs ({currentArt.registrosVinculados?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('relacionados')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'relacionados'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Cliente & Metadados</span>
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
          <span>Timeline ({currentArt.timelineEvents?.length || 0})</span>
        </button>
      </div>

      {/* ABA GERAL - DIVIDIDA EM 2 CARDS NO PADRÃO SIGI */}
      {activeTab === 'geral' && (
        <div className="space-y-6">
          {/* Card 1 — Informações do Artigo */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Informações do Artigo
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">ID: {currentArt.id}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Tipo / Categoria
                </label>
                <select
                  value={currentArt.tipoArtigo || currentArt.categoria}
                  onChange={(e) => {
                    setCurrentArt({ ...currentArt, tipoArtigo: e.target.value as any, categoria: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {systemTables?.tiposBaseConhecimento?.filter((t: any) => t.status === 'Ativo' || t.nome === (currentArt.tipoArtigo || currentArt.categoria)).map((t: any) => (
                    <option key={t.id} value={t.nome}>{t.nome}</option>
                  )) || (
                    <>
                      <option value="Procedimento">Procedimento</option>
                      <option value="Configuração">Configuração</option>
                      <option value="Solução">Solução</option>
                      <option value="Documentação">Documentação</option>
                      <option value="Informação do Cliente">Informação do Cliente</option>
                      <option value="Rede">Rede</option>
                      <option value="Servidor">Servidor</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Módulo
                </label>
                <select
                  value={currentArt.modulo || 'Suporte'}
                  onChange={(e) => {
                    setCurrentArt({ ...currentArt, modulo: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {systemTables?.modulos?.filter((m: any) => m.status === 'Ativo' || m.nome === currentArt.modulo).map((m: any) => (
                    <option key={m.id} value={m.nome}>{m.nome}</option>
                  )) || (
                    <>
                      <option value="Suporte">Suporte</option>
                      <option value="Módulo Fiscal">Módulo Fiscal</option>
                      <option value="Faturamento">Faturamento</option>
                      <option value="PDV & Caixa">PDV & Caixa</option>
                      <option value="Estoque & Almoxarifado">Estoque & Almoxarifado</option>
                      <option value="Integração & API">Integração & API</option>
                      <option value="Redes & Segurança">Redes & Segurança</option>
                      <option value="Servidor & Infraestrutura">Servidor & Infraestrutura</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  Autor do Artigo
                </label>
                <select
                  value={currentArt.autor}
                  onChange={(e) => {
                    setCurrentArt({ ...currentArt, autor: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {defaultUserList.map((usr) => (
                    <option key={usr} value={usr}>
                      {usr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Cliente Específico
                </label>
                <select
                  value={currentArt.clienteId || ''}
                  onChange={(e) => {
                    const found = allClients.find((c) => c.id === e.target.value);
                    setCurrentArt({
                      ...currentArt,
                      clienteId: found?.id,
                      clienteNome: found?.razaoSocial
                    });
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
                >
                  <option value="">Nenhum (Artigo Geral)</option>
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} - {c.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Título do Artigo
                </label>
                <input
                  type="text"
                  value={currentArt.titulo}
                  onChange={(e) => {
                    setCurrentArt({ ...currentArt, titulo: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-4">
                <span>Data de Criação: <strong className="text-slate-800 dark:text-slate-200">{currentArt.dataCriacao}</strong></span>
                <span>Última Atualização: <strong className="text-slate-800 dark:text-slate-200">{currentArt.ultimaAtualizacao || currentArt.dataCriacao}</strong></span>
                <span>Visualizações: <strong className="text-slate-800 dark:text-slate-200">{currentArt.visualizacoes || 0}</strong></span>
              </div>
              {currentArt.clienteNome && (
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Building2 className="w-3.5 h-3.5" />
                  {currentArt.clienteNome}
                </span>
              )}
            </div>
          </div>

          {/* Card 2 — Editor do Documento / Conteúdo Detalhado Rich Text */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Editor de Documentação Técnica
              </h3>

              {/* Editor Mode Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEditorMode('edit')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                    editorMode === 'edit'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Escrever</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('preview')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                    editorMode === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visualizar Documento</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('split')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all hidden md:flex ${
                    editorMode === 'split'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Lado a Lado</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Rich Formatting Toolbar (Visible in edit and split modes) */}
              {(editorMode === 'edit' || editorMode === 'split') && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1">
                    {/* Format Buttons */}
                    <button
                      type="button"
                      title="Negrito (**texto**)"
                      onClick={() => insertFormatting('**', '**', 'negrito')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Itálico (*texto*)"
                      onClick={() => insertFormatting('*', '*', 'itálico')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Sublinhado (<u>texto</u>)"
                      onClick={() => insertFormatting('<u>', '</u>', 'sublinhado')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Tachado (~~texto~~)"
                      onClick={() => insertFormatting('~~', '~~', 'tachado')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <Strikethrough className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Headings */}
                    <button
                      type="button"
                      title="Título H1 (# Título)"
                      onClick={() => insertFormatting('\n# ', '', 'Título Principal\n')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                    >
                      <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Subtítulo H2 (## Subtítulo)"
                      onClick={() => insertFormatting('\n## ', '', 'Subtítulo\n')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Seção H3 (### Seção)"
                      onClick={() => insertFormatting('\n### ', '', 'Seção\n')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                    >
                      <Heading3 className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Lists */}
                    <button
                      type="button"
                      title="Lista de Marcadores (- Item)"
                      onClick={() => insertFormatting('\n- ', '', 'Item da lista')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Lista Numerada (1. Passo)"
                      onClick={() => insertFormatting('\n1. ', '', 'Primeiro passo')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Table, Code, Quote */}
                    <button
                      type="button"
                      title="Inserir Tabela"
                      onClick={() =>
                        insertFormatting(
                          '\n| Parâmetro / Campo | Configuração Recomendada | Observação |\n|---|---|---|\n| Host Banco | 192.168.1.10 | Servidor Proxmox |\n| Porta | 5432 | PostgreSQL |\n\n',
                          '',
                          ''
                        )
                      }
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-lg text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                    >
                      <Table className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Tabela</span>
                    </button>

                    <button
                      type="button"
                      title="Bloco de Comando / Código"
                      onClick={() =>
                        insertFormatting(
                          '\n```bash\n# Comando executado no servidor:\nsudo systemctl restart postgresql\n```\n',
                          '',
                          ''
                        )
                      }
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-lg text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                    >
                      <Code className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Comando / Code</span>
                    </button>

                    <button
                      type="button"
                      title="Caixa de Alerta / Dica"
                      onClick={() => insertFormatting('\n> ⚠️ **ATENÇÃO:** ', '\n', 'Informação técnica importante.')}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-amber-600 cursor-pointer"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Anexar / Inserir Imagem SMB */}
                  <button
                    type="button"
                    onClick={() => setIsSmbDrawerOpen(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs text-[11px] shrink-0"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Inclusão de Imagem (SMB)</span>
                  </button>
                </div>
              )}

              {/* Editor Workspaces (Edit / Preview / Split) */}
              {editorMode === 'edit' && (
                <div>
                  <textarea
                    ref={textareaRef}
                    rows={16}
                    value={currentArt.conteudo || ''}
                    onPaste={handlePaste}
                    onChange={(e) => {
                      setCurrentArt({ ...currentArt, conteudo: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed min-h-[300px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Escreva a documentação passo a passo, comandos, tabelas e cole prints direto com Ctrl+V..."
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>
                      Você pode <strong>copiar e colar prints de tela direto no editor (Ctrl+V)</strong> ou buscar no repositório SMB. As imagens serão vinculadas automaticamente ao servidor de arquivos.
                    </span>
                  </p>
                </div>
              )}

              {editorMode === 'preview' && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl min-h-[300px]">
                  <DocumentPreviewRenderer content={currentArt.conteudo || ''} />
                </div>
              )}

              {editorMode === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                      Editor (Markdown / Código)
                    </label>
                    <textarea
                      ref={textareaRef}
                      rows={16}
                      value={currentArt.conteudo || ''}
                      onPaste={handlePaste}
                      onChange={(e) => {
                        setCurrentArt({ ...currentArt, conteudo: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed min-h-[300px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                      Visualização do Documento
                    </label>
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl min-h-[300px] overflow-y-auto max-h-[400px]">
                      <DocumentPreviewRenderer content={currentArt.conteudo || ''} />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-500" />
                  Tags de Busca e Agrupamento
                </label>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                  {(currentArt.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 rounded-lg font-bold flex items-center gap-1.5"
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
                Atendimentos Relacionados a Este Artigo
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Consulte os atendimentos que utilizaram este procedimento ou vincule novos.
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

          {currentArt.atendimentosVinculados && currentArt.atendimentosVinculados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentArt.atendimentosVinculados.map((atd) => (
                <div
                  key={atd.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-900/50">
                        {atd.codigo}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
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
              <p className="text-xs font-medium">Nenhum atendimento vinculado a este artigo.</p>
              <button
                type="button"
                onClick={() => setIsVincularAtdOpen(true)}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Vincular Atendimento</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ABA REGISTROS */}
      {activeTab === 'registros' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-indigo-500" />
                Registros / Bugs Relacionados
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Bugs e Melhorias vinculados a este artigo de solução ou procedimento.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsVincularRegOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Vincular Registro</span>
            </button>
          </div>

          {currentArt.registrosVinculados && currentArt.registrosVinculados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentArt.registrosVinculados.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-900/50">
                        {reg.codigo}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                        {reg.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      {reg.titulo}
                    </h4>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickViewEntity({ type: 'registro', data: reg })}
                        className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualização Rápida</span>
                      </button>
                      {onOpenRegistroWorkspace && (
                        <button
                          type="button"
                          onClick={() => onOpenRegistroWorkspace(reg.id)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer ml-2"
                        >
                          <span>Workspace</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDesvincularRegistro(reg.id, reg.codigo)}
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
              <FileCode2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-medium">Nenhum registro de Bug/Melhoria vinculado.</p>
              <button
                type="button"
                onClick={() => setIsVincularRegOpen(true)}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Vincular Registro</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ABA CLIENTE & METADADOS */}
      {activeTab === 'relacionados' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              Cliente & Atribuição de Contexto
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Associe este artigo a um cliente específico caso se trate de documentação de infraestrutura dedicada.
            </p>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Cliente Vinculado
              </label>
              <select
                value={currentArt.clienteId || ''}
                onChange={(e) => {
                  const found = allClients.find((c) => c.id === e.target.value);
                  setCurrentArt({
                    ...currentArt,
                    clienteId: found?.id,
                    clienteNome: found?.razaoSocial
                  });
                  setHasChanges(true);
                }}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
              >
                <option value="">Artigo Geral (Todas as empresas/público)</option>
                {allClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} - {c.razaoSocial} ({c.cidade}/{c.estado})
                  </option>
                ))}
              </select>
            </div>

            {currentArt.clienteNome ? (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">{currentArt.clienteNome}</span>
                    <span className="block text-[10px] text-indigo-600 dark:text-indigo-400">Documentação restrita ao contexto deste cliente</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-[11px]">
                Este artigo está configurado como <strong>Geral</strong> e é acessível para resoluções de todos os clientes.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ABA TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Histórico & Timeline do Artigo
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Rastreabilidade de revisões, notas técnicas e vínculos executados no artigo.
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

          {currentArt.timelineEvents && currentArt.timelineEvents.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {currentArt.timelineEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  <div className="absolute -left-6 top-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
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
                      <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl my-1">
                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                          {evt.descricao}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        Por: <strong className="text-slate-600 dark:text-slate-300">{evt.autor}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedTimelineEvent(evt)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Consultar Alteração</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
              <p className="text-xs">Nenhum evento registrado na Timeline até o momento.</p>
            </div>
          )}
        </div>
      )}

      {/* DRAWER VINCULAR ATENDIMENTO (Right Drawer) */}
      {isVincularAtdOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-xl h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-indigo-500" />
                  Vincular Atendimento
                </h3>
                <button
                  type="button"
                  onClick={() => setIsVincularAtdOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar atendimento por código, assunto ou cliente..."
                  value={searchAtdText}
                  onChange={(e) => setSearchAtdText(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredAvailableAtds.length > 0 ? (
                  filteredAvailableAtds.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{a.codigo}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{a.clienteNome}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{a.assunto}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVincularAtendimento(a)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer shrink-0"
                      >
                        Vincular
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-6 text-xs">Nenhum atendimento disponível encontrado.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsVincularAtdOpen(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER VINCULAR REGISTRO (Right Drawer) */}
      {isVincularRegOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-xl h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-indigo-500" />
                  Vincular Registro / Bug
                </h3>
                <button
                  type="button"
                  onClick={() => setIsVincularRegOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar registro por código ou título..."
                  value={searchRegText}
                  onChange={(e) => setSearchRegText(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredAvailableRegs.length > 0 ? (
                  filteredAvailableRegs.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{r.codigo}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">{r.tipo}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-bold line-clamp-1 mt-0.5">{r.titulo}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVincularRegistro(r)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer shrink-0"
                      >
                        Vincular
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-6 text-xs">Nenhum registro disponível encontrado.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsVincularRegOpen(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER ADICIONAR NOTA A TIMELINE (Right Drawer) */}
      {isAddTimelineNoteOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <form onSubmit={handleAddTimelineNote} className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Adicionar Nota à Timeline
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddTimelineNoteOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo da Nota
                </label>
                <select
                  value={timelineNoteTipo}
                  onChange={(e) => setTimelineNoteTipo(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="comentario">Comentário / Observação</option>
                  <option value="edicao">Revisão do Artigo</option>
                  <option value="status">Mudança de Status</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Ocorrência
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Atualização do link de download da chave mTLS"
                  value={timelineNoteTitulo}
                  onChange={(e) => setTimelineNoteTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Evento
                </label>
                <textarea
                  rows={4}
                  placeholder="Detalhamento..."
                  value={timelineNoteDesc}
                  onChange={(e) => setTimelineNoteDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTimelineNoteOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs"
                >
                  Registrar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER LATERAL DIREITO - REPOSITÓRIO E SELEÇÃO DE IMAGENS SMB */}
      {isSmbDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/50">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Inclusão de Imagem no Servidor SMB
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    \\smb-server\arquivos_sip\imagens
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSmbDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Option 1: Direct File Upload to SMB */}
              <div className="p-4 bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  Fazer Upload de Nova Imagem (Salvar no SMB)
                </h3>

                <div className="mb-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Legenda / Descrição da Imagem (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Print da tela de erro de conexão"
                    value={customSmbCaption}
                    onChange={(e) => setCustomSmbCaption(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center pt-1">
                  <label className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors text-xs">
                    <ImageIcon className="w-4 h-4" />
                    <span>Selecionar Imagem do Computador</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const baseDir = smbConfig?.caminhoImagensArtigos || '\\\\NAS-SERVER\\SIGI-Anexos\\artigos\\imagens';
                            const path = `${baseDir}\\${file.name}`;
                            handleInsertSmbImage(path, customSmbCaption || file.name);
                            if (onShowToast) {
                              onShowToast('Upload Realizado e Salvo no SMB', `Imagem salva em: ${path}`);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Option 2: Select from SMB Storage Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-indigo-500" />
                    Galeria de Imagens do Servidor SMB
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {mockSmbImages.length} arquivos disponíveis
                  </span>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome ou categoria..."
                    value={smbFilterText}
                    onChange={(e) => setSmbFilterText(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {mockSmbImages
                    .filter(
                      (img) =>
                        img.nome.toLowerCase().includes(smbFilterText.toLowerCase()) ||
                        img.categoria.toLowerCase().includes(smbFilterText.toLowerCase())
                    )
                    .map((img) => (
                      <div
                        key={img.id}
                        className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-2 hover:border-indigo-500 transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="aspect-video w-full rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
                            <img
                              src={img.previewUrl}
                              alt={img.nome}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 right-2 bg-slate-900/80 text-white font-mono text-[9px] px-2 py-0.5 rounded-full">
                              {img.tamanho}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                              {img.categoria}
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                              {img.nome}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                              {img.caminhoSmb}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleInsertSmbImage(img.caminhoSmb, img.nome)}
                          className="w-full mt-3 py-2 bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-600 text-indigo-600 hover:text-white dark:text-indigo-400 dark:hover:text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Inserir no Documento</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER CONSULTA DE ALTERAÇÃO NA TIMELINE (Right Drawer) */}
      {selectedTimelineEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-xl h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="space-y-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Detalhes da Alteração na Timeline
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTimelineEvent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold uppercase tracking-wider text-[10px]">
                      {selectedTimelineEvent.tipo}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {selectedTimelineEvent.data}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedTimelineEvent.titulo}
                  </h4>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-slate-500">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Registrado por: <strong className="text-slate-800 dark:text-slate-200">{selectedTimelineEvent.autor}</strong></span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Histórico do que foi alterado
                  </label>
                  <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-2xl border border-slate-800 leading-relaxed whitespace-pre-wrap shadow-inner">
                    {selectedTimelineEvent.descricao || 'Nenhuma descrição detalhada informada.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedTimelineEvent(null)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Fechar Consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Article Confirmation Right Drawer */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between p-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl w-fit">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Excluir Artigo da Base de Conhecimento?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tem certeza que deseja excluir o artigo <strong className="text-slate-900 dark:text-white">{currentArt.codigo} - {currentArt.titulo}</strong>? Esta ação removerá o artigo permanentemente e desvinculará todos os atendimentos e registros operacionais associados.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteArtigo}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir Artigo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
