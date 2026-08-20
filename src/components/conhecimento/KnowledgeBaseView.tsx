import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Clock,
  Tag,
  Building2,
  ChevronRight,
  Eye,
  FileCode2,
  Layers,
  LayoutGrid,
  List,
  Video,
  Play,
  Copy,
  Check,
  ExternalLink,
  Edit,
  Sparkles,
  RefreshCw,
  X,
  Trash2
} from 'lucide-react';
import { ArtigoKBItem, Cliente, AtendimentoItem, RegistroItem, UserAccount, SmbConfig, SystemTablesData } from '../../types';
import { ArtigoFormDrawer } from '../drawers/ArtigoFormDrawer';
import { ArticleWorkspace } from './ArticleWorkspace';
import { QuickViewModal } from '../common/QuickViewModal';
import { VideoFormDrawer } from '../drawers/VideoFormDrawer';
import { VideoDetailDrawer } from './VideoDetailDrawer';

interface KnowledgeBaseViewProps {
  artigos: ArtigoKBItem[];
  onAddArtigo: (newArt: ArtigoKBItem) => void;
  onUpdateArtigo: (updated: ArtigoKBItem) => void;
  onDeleteArtigo?: (artigoId: string) => void;
  smbConfig?: SmbConfig;
  allClients?: Cliente[];
  allAtendimentos?: AtendimentoItem[];
  allRegistros?: RegistroItem[];
  onShowToast?: (title: string, message: string) => void;
  onOpenAtendimentoWorkspace?: (atdId: string) => void;
  onOpenRegistroWorkspace?: (regId: string) => void;
  selectedWorkspaceArtigo?: ArtigoKBItem | null;
  onSelectWorkspaceArtigo?: (art: ArtigoKBItem | null) => void;
  systemUsers?: UserAccount[];
  systemTables?: SystemTablesData;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  artigos,
  onAddArtigo,
  onUpdateArtigo,
  onDeleteArtigo,
  smbConfig,
  allClients = [],
  allAtendimentos = [],
  allRegistros = [],
  onShowToast,
  onOpenAtendimentoWorkspace,
  onOpenRegistroWorkspace,
  selectedWorkspaceArtigo,
  onSelectWorkspaceArtigo,
  systemUsers = [],
  systemTables
}) => {
  // Main Navigation Tab: 'artigos' or 'videos'
  const [mainTab, setMainTab] = useState<'artigos' | 'videos'>('artigos');

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('todos');
  const [selectedModuloFilter, setSelectedModuloFilter] = useState<string>('todos');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Modals & Drawers state
  const [isNovoArtigoModalOpen, setIsNovoArtigoModalOpen] = useState(false);
  const [isNovoVideoDrawerOpen, setIsNovoVideoDrawerOpen] = useState(false);
  const [selectedVideoForDetail, setSelectedVideoForDetail] = useState<ArtigoKBItem | null>(null);

  // Quick View Modal
  const [quickViewArtigo, setQuickViewArtigo] = useState<ArtigoKBItem | null>(null);

  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState<ArtigoKBItem | null>(null);

  const handleDeleteItem = (e: React.MouseEvent, item: ArtigoKBItem) => {
    e.stopPropagation();
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (itemToDelete && onDeleteArtigo) {
      onDeleteArtigo(itemToDelete.id);
      if (onShowToast) {
        onShowToast(
          itemToDelete.tipoConteudo === 'video' ? 'Vídeo Excluído' : 'Artigo Excluído',
          `${itemToDelete.codigo} - ${itemToDelete.titulo} removido com sucesso.`
        );
      }
      setItemToDelete(null);
    }
  };

  // Active workspace state if not controlled externally
  const [localWorkspaceArtigo, setLocalWorkspaceArtigo] = useState<ArtigoKBItem | null>(null);

  const activeWorkspaceArtigo = selectedWorkspaceArtigo !== undefined ? selectedWorkspaceArtigo : localWorkspaceArtigo;

  const handleOpenWorkspace = (art: ArtigoKBItem) => {
    if (onSelectWorkspaceArtigo) {
      onSelectWorkspaceArtigo(art);
    } else {
      setLocalWorkspaceArtigo(art);
    }
  };

  const handleCloseWorkspace = () => {
    if (onSelectWorkspaceArtigo) {
      onSelectWorkspaceArtigo(null);
    } else {
      setLocalWorkspaceArtigo(null);
    }
  };

  // Separation of items into Articles vs Videos
  const articlesList = useMemo(() => {
    return artigos.filter((a) => a.tipoArtigo !== 'Vídeo Aula' && !a.videoUrl);
  }, [artigos]);

  const videosList = useMemo(() => {
    return artigos.filter((a) => a.tipoArtigo === 'Vídeo Aula' || !!a.videoUrl);
  }, [artigos]);

  // Available unique modules
  const availableModulos = useMemo(() => {
    const mods = new Set<string>();
    artigos.forEach((a) => {
      if (a.modulo) mods.add(a.modulo);
    });
    return Array.from(mods);
  }, [artigos]);

  // Filtered list based on active tab & selected filters
  const filteredItems = useMemo(() => {
    const baseList = mainTab === 'artigos' ? articlesList : videosList;

    return baseList.filter((item) => {
      // Search filter
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        item.titulo.toLowerCase().includes(term) ||
        item.codigo.toLowerCase().includes(term) ||
        (item.conteudo && item.conteudo.toLowerCase().includes(term)) ||
        item.tags.some((t) => t.toLowerCase().includes(term)) ||
        (item.clienteNome && item.clienteNome.toLowerCase().includes(term)) ||
        (item.modulo && item.modulo.toLowerCase().includes(term));

      // Category filter (Articles tab only)
      const matchCat =
        mainTab === 'videos' ||
        selectedCategory === 'todos' ||
        item.tipoArtigo === selectedCategory ||
        item.categoria === selectedCategory;

      // Client filter
      const matchClient =
        selectedClientFilter === 'todos' ||
        (selectedClientFilter === 'geral' && !item.clienteId) ||
        item.clienteId === selectedClientFilter;

      // Module filter
      const matchModulo =
        selectedModuloFilter === 'todos' || item.modulo === selectedModuloFilter;

      // System filter
      const matchSystem =
        selectedSystemFilter === 'todos' || item.sistemaPertencente === selectedSystemFilter;

      return matchSearch && matchCat && matchClient && matchModulo && matchSystem;
    });
  }, [mainTab, articlesList, videosList, searchTerm, selectedCategory, selectedClientFilter, selectedModuloFilter, selectedSystemFilter]);

  if (activeWorkspaceArtigo) {
    return (
      <ArticleWorkspace
        artigo={activeWorkspaceArtigo}
        onBack={handleCloseWorkspace}
        onUpdateArtigo={onUpdateArtigo}
        onDeleteArtigo={(artigoId) => {
          if (onDeleteArtigo) onDeleteArtigo(artigoId);
          handleCloseWorkspace();
        }}
        onShowToast={onShowToast}
        allClients={allClients}
        allAtendimentos={allAtendimentos}
        allRegistros={allRegistros}
        onOpenAtendimentoWorkspace={onOpenAtendimentoWorkspace}
        onOpenRegistroWorkspace={onOpenRegistroWorkspace}
        systemUsers={systemUsers}
        systemTables={systemTables}
        smbConfig={smbConfig}
      />
    );
  }

  const handleCopyVideoLink = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (!url) return;
    navigator.clipboard.writeText(url);
    if (onShowToast) {
      onShowToast('Link Copiado', 'Link do vídeo copiado para a área de transferência! Pronto para enviar ao cliente.');
    }
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  // Categories list for articles
  const articleCategories = [
    { id: 'todos', label: 'Todas as Categorias' },
    ...(systemTables?.tiposBaseConhecimento?.map((c) => ({ id: c.nome, label: c.nome })) || [
      { id: 'Procedimento', label: 'Procedimentos' },
      { id: 'Configuração', label: 'Configurações' },
      { id: 'Solução', label: 'Soluções' },
      { id: 'Documentação', label: 'Documentação' },
      { id: 'Informação do Cliente', label: 'Info do Cliente' },
      { id: 'Rede', label: 'Redes' },
      { id: 'Servidor', label: 'Servidores' }
    ])
  ];

  // Systems list
  const availableSystems = [
    'todos',
    ...(systemTables?.sistemas?.map((s) => s.nome) || [
      'Sistema Sacoleiro',
      'Sistema ERP',
      'Emissão de NFe',
      'PDV & Caixa',
      'SIGI Geral'
    ])
  ];

  // Handle new article save
  const handleSaveNewArticle = (newArt: ArtigoKBItem) => {
    onAddArtigo(newArt);
    if (onShowToast) {
      onShowToast('Artigo Criado', `Artigo ${newArt.codigo} cadastrado com sucesso.`);
    }
    handleOpenWorkspace(newArt);
  };

  // Handle new video save
  const handleSaveNewVideo = (newVid: ArtigoKBItem) => {
    onAddArtigo(newVid);
    if (onShowToast) {
      onShowToast('Vídeo Cadastrado', `Vídeo ${newVid.codigo} cadastrado com sucesso.`);
    }
    setSelectedVideoForDetail(newVid);
  };

  // If a workspace is active, render ArticleWorkspace
  if (activeWorkspaceArtigo) {
    return (
      <ArticleWorkspace
        artigo={activeWorkspaceArtigo}
        onBack={handleCloseWorkspace}
        onUpdateArtigo={(updated) => {
          onUpdateArtigo(updated);
          if (onSelectWorkspaceArtigo) {
            onSelectWorkspaceArtigo(updated);
          } else {
            setLocalWorkspaceArtigo(updated);
          }
        }}
        onShowToast={onShowToast}
        allClients={allClients}
        allAtendimentos={allAtendimentos}
        allRegistros={allRegistros}
        onOpenAtendimentoWorkspace={onOpenAtendimentoWorkspace}
        onOpenRegistroWorkspace={onOpenRegistroWorkspace}
        systemUsers={systemUsers}
        systemTables={systemTables}
        smbConfig={smbConfig}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Quick View Modal */}
      {quickViewArtigo && (
        <QuickViewModal
          isOpen={true}
          onClose={() => setQuickViewArtigo(null)}
          entityType="artigo"
          data={quickViewArtigo}
          onOpenWorkspace={(_, data) => {
            setQuickViewArtigo(null);
            handleOpenWorkspace(data as ArtigoKBItem);
          }}
        />
      )}



      {/* Detail / Edit Video Drawer */}
      <VideoDetailDrawer
        video={selectedVideoForDetail}
        isOpen={!!selectedVideoForDetail}
        onClose={() => setSelectedVideoForDetail(null)}
        onUpdateVideo={onUpdateArtigo}
        allClients={allClients}
        allAtendimentos={allAtendimentos}
        allRegistros={allRegistros}
        onShowToast={onShowToast}
        onOpenAtendimentoWorkspace={onOpenAtendimentoWorkspace}
        onOpenRegistroWorkspace={onOpenRegistroWorkspace}
        systemUsers={systemUsers}
      />

      {/* TOP BANNER */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-900/50">
                Central de Conhecimento SIGI
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Base de Conhecimento
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Documentação técnica, procedimentos operacionais, manuais de sistemas e vídeo aulas.
            </p>
          </div>
        </div>

        {/* Action Button: Dynamic according to mainTab */}
        <div>
          {mainTab === 'artigos' ? (
            <button
              type="button"
              onClick={() => setIsNovoArtigoModalOpen(true)}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Artigo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsNovoVideoDrawerOpen(true)}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>+ Novo Vídeo</span>
            </button>
          )}
        </div>
      </div>

      {/* 2 LARGE MODE SELECTOR BUTTONS (FULL WIDTH EQUAL SIZE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* BUTTON 1: ARTIGOS */}
        <button
          type="button"
          onClick={() => {
            setMainTab('artigos');
            setSelectedCategory('todos');
          }}
          className={`p-5 rounded-3xl border-2 transition-all duration-200 text-left flex items-start justify-between cursor-pointer group relative overflow-hidden ${
            mainTab === 'artigos'
              ? 'bg-slate-900 dark:bg-indigo-950 text-white border-slate-900 dark:border-indigo-500 shadow-lg'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 hover:shadow-md'
          }`}
        >
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-2xl ${
                  mainTab === 'artigos'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform'
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight">Artigos</h3>
                <p
                  className={`text-xs ${
                    mainTab === 'artigos'
                      ? 'text-slate-300 dark:text-indigo-200'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Manuais, procedimentos e guias
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between h-full z-10">
            <span
              className={`text-xs font-black px-3 py-1 rounded-full font-mono ${
                mainTab === 'artigos'
                  ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {articlesList.length} artigo(s)
            </span>
          </div>
        </button>

        {/* BUTTON 2: VÍDEOS */}
        <button
          type="button"
          onClick={() => {
            setMainTab('videos');
            setSelectedCategory('todos');
          }}
          className={`p-5 rounded-3xl border-2 transition-all duration-200 text-left flex items-start justify-between cursor-pointer group relative overflow-hidden ${
            mainTab === 'videos'
              ? 'bg-purple-900 dark:bg-purple-950 text-white border-purple-800 dark:border-purple-500 shadow-lg'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-md'
          }`}
        >
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-2xl ${
                  mainTab === 'videos'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform'
                }`}
              >
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight">Vídeos</h3>
                <p
                  className={`text-xs ${
                    mainTab === 'videos'
                      ? 'text-purple-200 dark:text-purple-300'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Vídeo aulas e treinamentos passo a passo
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between h-full z-10">
            <span
              className={`text-xs font-black px-3 py-1 rounded-full font-mono ${
                mainTab === 'videos'
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
              }`}
            >
              {videosList.length} vídeo(s)
            </span>
          </div>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Field */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                mainTab === 'artigos'
                  ? 'Buscar por título, código (#ART-055), módulo, tags...'
                  : 'Buscar vídeo aulas (#VID-001), sistemas, módulos, tags...'
              }
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* System Filter */}
          <div className="w-full lg:w-48 shrink-0">
            <select
              value={selectedSystemFilter}
              onChange={(e) => setSelectedSystemFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
            >
              <option value="todos">Todos os Sistemas</option>
              {availableSystems.filter((s) => s !== 'todos').map((sys) => (
                <option key={sys} value={sys}>
                  {sys}
                </option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div className="w-full lg:w-44 shrink-0">
            <select
              value={selectedModuloFilter}
              onChange={(e) => setSelectedModuloFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
            >
              <option value="todos">Todos os Módulos</option>
              {availableModulos.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          {/* Client Filter */}
          <div className="w-full lg:w-48 shrink-0">
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
            >
              <option value="todos">Todos os Clientes</option>
              <option value="geral">Geral (Sem cliente específico)</option>
              {allClients.map((cli) => (
                <option key={cli.id} value={cli.id}>
                  {cli.razaoSocial}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills (Articles tab only) */}
        {mainTab === 'artigos' && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Categoria:
            </span>
            {articleCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Active Filters Summary & Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Exibindo <strong>{filteredItems.length}</strong> {mainTab === 'artigos' ? 'artigo(s)' : 'vídeo(s)'}
          </span>

          {(searchTerm || selectedCategory !== 'todos' || selectedClientFilter !== 'todos' || selectedModuloFilter !== 'todos' || selectedSystemFilter !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('todos');
                setSelectedClientFilter('todos');
                setSelectedModuloFilter('todos');
                setSelectedSystemFilter('todos');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-bold"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* CONTENT DISPLAY SECTION */}
      {filteredItems.length > 0 ? (
        mainTab === 'artigos' ? (
          /* ============================================================ */
          /* ARTICLES DISPLAY (GRID OR LIST)                            */
          /* ============================================================ */
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleOpenWorkspace(art)}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group relative"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-900/50">
                          {art.codigo}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {art.tipoArtigo || art.categoria}
                        </span>
                        {art.sistemaPertencente && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                            {art.sistemaPertencente}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          art.status === 'Publicado'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}
                      >
                        {art.status}
                      </span>
                    </div>

                    {/* Title & Module */}
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                        {art.titulo}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Módulo: <strong className="text-slate-700 dark:text-slate-200">{art.modulo || 'Geral'}</strong>
                      </p>
                    </div>

                    {/* Excerpt / Conteúdo */}
                    {art.conteudo && (
                      <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {art.conteudo}
                      </p>
                    )}

                    {/* Tags */}
                    {art.tags && art.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {art.tags.slice(0, 4).map((tg) => (
                          <span
                            key={tg}
                            className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{art.ultimaAtualizacao || art.dataCriacao}</span>
                    </div>

                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Ver Artigo
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Código</th>
                      <th className="p-4">Título do Artigo</th>
                      <th className="p-4">Sistema</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Módulo</th>
                      <th className="p-4">Atualização</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredItems.map((art) => (
                      <tr
                        key={art.id}
                        onClick={() => handleOpenWorkspace(art)}
                        className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {art.codigo}
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {art.titulo}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-bold text-[10px]">
                            {art.sistemaPertencente || 'SIGI Geral'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-[10px]">
                            {art.tipoArtigo || art.categoria}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                          {art.modulo || 'Geral'}
                        </td>
                        <td className="p-4 text-slate-400 font-mono text-[11px]">
                          {art.ultimaAtualizacao || art.dataCriacao}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              art.status === 'Publicado'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                            }`}
                          >
                            {art.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenWorkspace(art)}
                              className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>Ver Workspace</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteArtigo && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteItem(e, art)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir Artigo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* ============================================================ */
          /* VIDEOS DISPLAY (CUSTOM VIDEO TABLE / GRID WITH COPYS & DRAWER)*/
          /* ============================================================ */
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => setSelectedVideoForDetail(vid)}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-3 p-5">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/70 px-2 py-0.5 rounded border border-purple-200/50 dark:border-purple-900/50">
                          {vid.codigo}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 flex items-center gap-1">
                          <Video className="w-3 h-3 text-purple-600 dark:text-purple-300" />
                          Vídeo Aula
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          vid.status === 'Publicado'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}
                      >
                        {vid.status}
                      </span>
                    </div>

                    {/* Title & System */}
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                        {vid.titulo}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                          {vid.sistemaPertencente || 'SIGI Geral'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Módulo: <strong>{vid.modulo || 'Geral'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Excerpt */}
                    {vid.conteudo && (
                      <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {vid.conteudo}
                      </p>
                    )}

                    {/* Tags */}
                    {vid.tags && vid.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {vid.tags.slice(0, 4).map((tg) => (
                          <span
                            key={tg}
                            className="text-[10px] font-medium bg-purple-50/50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-100/50 dark:border-purple-900/40"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopyVideoLink(e, vid.videoUrl)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Copiar Link</span>
                    </button>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedVideoForDetail(vid)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      {onDeleteArtigo && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteItem(e, vid)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                          title="Excluir Vídeo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Código</th>
                      <th className="p-4">Título da Vídeo Aula</th>
                      <th className="p-4">Sistema</th>
                      <th className="p-4">Módulo</th>
                      <th className="p-4">Data</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredItems.map((vid) => (
                      <tr
                        key={vid.id}
                        onClick={() => setSelectedVideoForDetail(vid)}
                        className="hover:bg-purple-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="p-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {vid.codigo}
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span>{vid.titulo}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-bold text-[10px]">
                            {vid.sistemaPertencente || 'SIGI Geral'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                          {vid.modulo || 'Geral'}
                        </td>
                        <td className="p-4 text-slate-400 font-mono text-[11px]">
                          {vid.dataCriacao}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              vid.status === 'Publicado'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                            }`}
                          >
                            {vid.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleCopyVideoLink(e, vid.videoUrl)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                              title="Copiar Link do Vídeo"
                            >
                              <Copy className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                              <span>Copiar Link</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedVideoForDetail(vid)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Editar / Assistir Vídeo"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Editar</span>
                            </button>

                            {onDeleteArtigo && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteItem(e, vid)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir Vídeo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )
      ) : (
        /* EMPTY STATE */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            {mainTab === 'artigos' ? <BookOpen className="w-8 h-8" /> : <Video className="w-8 h-8 text-purple-500" />}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              Nenhum {mainTab === 'artigos' ? 'artigo' : 'vídeo'} encontrado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Tente redefinir seus termos de busca ou filtros aplicados para visualizar outros itens da Base de Conhecimento.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('todos');
              setSelectedClientFilter('todos');
              setSelectedModuloFilter('todos');
              setSelectedSystemFilter('todos');
            }}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Limpar Filtros de Busca
          </button>
        </div>
      )}

      {/* Modals and Drawers */}
      <ArtigoFormDrawer
        isOpen={isNovoArtigoModalOpen}
        onClose={() => setIsNovoArtigoModalOpen(false)}
        onSave={(art) => {
          onAddArtigo(art);
          if (onShowToast) onShowToast('Artigo Criado', `Artigo ${art.codigo} adicionado com sucesso.`);
        }}
        systemTables={systemTables}
        onShowToast={onShowToast}
      />

      <VideoFormDrawer
        isOpen={isNovoVideoDrawerOpen}
        onClose={() => setIsNovoVideoDrawerOpen(false)}
        onSave={(v) => {
          onAddArtigo(v);
          if (onShowToast) onShowToast('Vídeo Publicado', `Vídeo ${v.titulo} adicionado com sucesso.`);
        }}
        systemTables={systemTables}
        onShowToast={onShowToast}
      />

      <VideoDetailDrawer
        video={selectedVideoForDetail}
        isOpen={!!selectedVideoForDetail}
        onClose={() => setSelectedVideoForDetail(null)}
        onUpdateVideo={(updated) => {
          onUpdateArtigo(updated);
          setSelectedVideoForDetail(updated);
          if (onShowToast) onShowToast('Vídeo Atualizado', 'Alterações do vídeo salvas com sucesso.');
        }}
        onDeleteVideo={(videoId) => {
          if (onDeleteArtigo) onDeleteArtigo(videoId);
          setSelectedVideoForDetail(null);
        }}
        allClients={allClients}
        allAtendimentos={allAtendimentos}
        allRegistros={allRegistros}
        onShowToast={onShowToast}
        onOpenAtendimentoWorkspace={onOpenAtendimentoWorkspace}
        onOpenRegistroWorkspace={onOpenRegistroWorkspace}
        systemUsers={systemUsers}
      />

      {/* Item Deletion Confirmation Right Drawer */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between p-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl w-fit">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Excluir {itemToDelete.tipoConteudo === 'video' ? 'Vídeo' : 'Artigo'}?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tem certeza que deseja remover permanentemente o {itemToDelete.tipoConteudo === 'video' ? 'vídeo' : 'artigo'} <strong className="text-slate-900 dark:text-white">{itemToDelete.codigo} - {itemToDelete.titulo}</strong>? Esta operação não pode ser desfeita.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
