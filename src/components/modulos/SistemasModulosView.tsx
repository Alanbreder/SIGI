import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Headphones,
  FileCode2,
  BookOpen,
  ExternalLink,
  ShieldAlert,
  X,
  Info,
  CheckCircle2,
  FolderTree,
  Filter,
  Monitor,
  RefreshCw
} from 'lucide-react';
import {
  SistemaItem,
  ModuloItem,
  AtendimentoItem,
  RegistroItem,
  ArtigoKBItem,
  SystemTablesData
} from '../../types';
import { ModuloWorkspace } from './ModuloWorkspace';
import { QuickViewModal, QuickViewEntityType } from '../common/QuickViewModal';
import { fetchSistemas } from '../../lib/supabaseService';
import { initialSistemas } from '../../data/mockSistemas';

interface SistemasModulosViewProps {
  sistemas: SistemaItem[];
  onUpdateSistema: (updatedSis: SistemaItem) => void;
  onUpdateModulo: (updatedMod: ModuloItem) => void;
  onShowToast?: (title: string, message: string) => void;
  allAtendimentos?: AtendimentoItem[];
  allRegistros?: RegistroItem[];
  allArtigos?: ArtigoKBItem[];
  onOpenAtendimentoWorkspace?: (atdId: string) => void;
  onOpenRegistroWorkspace?: (regId: string) => void;
  onOpenArtigoWorkspace?: (artId: string) => void;
  selectedWorkspaceModulo?: ModuloItem | null;
  onSelectWorkspaceModulo?: (mod: ModuloItem | null) => void;
  systemTables?: SystemTablesData;
}

export const SistemasModulosView: React.FC<SistemasModulosViewProps> = ({
  sistemas: propsSistemas,
  onUpdateSistema,
  onUpdateModulo,
  onShowToast,
  allAtendimentos = [],
  allRegistros = [],
  allArtigos = [],
  onOpenAtendimentoWorkspace,
  onOpenRegistroWorkspace,
  onOpenArtigoWorkspace,
  selectedWorkspaceModulo = null,
  onSelectWorkspaceModulo
}) => {
  const [sistemas, setSistemas] = useState<SistemaItem[]>(propsSistemas);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSistemas(propsSistemas);
  }, [propsSistemas]);

  const refreshSistemas = async () => {
    setLoading(true);
    const freshSistemas = await fetchSistemas(initialSistemas);
    setSistemas(freshSistemas);
    setLoading(false);
    if (onShowToast) onShowToast('Dados Atualizados', 'Lista de sistemas atualizada do servidor.');
  };
  // Search query for Systems and Modules
  const [searchTerm, setSearchTerm] = useState('');

  // Expand / Collapse state for Systems (keys: sis.id)
  const [expandedSystems, setExpandedSystems] = useState<Record<string, boolean>>(() => {
    // Default all systems to expanded
    const initial: Record<string, boolean> = {};
    sistemas.forEach((s) => {
      initial[s.id] = true;
    });
    return initial;
  });

  // Quick View Drawer State
  const [quickViewModule, setQuickViewModule] = useState<ModuloItem | null>(null);

  // Informative Drawer for "+ Novo Sistema" and "+ Novo Módulo"
  const [adminDrawerOpen, setAdminDrawerOpen] = useState<{
    open: boolean;
    type: 'sistema' | 'modulo';
  }>({ open: false, type: 'sistema' });

  // Workspace state
  const [activeWorkspaceModulo, setActiveWorkspaceModulo] = useState<ModuloItem | null>(
    selectedWorkspaceModulo
  );

  // Sync external workspace selection if changed
  React.useEffect(() => {
    if (selectedWorkspaceModulo !== activeWorkspaceModulo) {
      setActiveWorkspaceModulo(selectedWorkspaceModulo);
    }
  }, [selectedWorkspaceModulo]);

  const handleOpenWorkspace = (mod: ModuloItem) => {
    setActiveWorkspaceModulo(mod);
    if (onSelectWorkspaceModulo) {
      onSelectWorkspaceModulo(mod);
    }
  };

  const handleBackFromWorkspace = () => {
    setActiveWorkspaceModulo(null);
    if (onSelectWorkspaceModulo) {
      onSelectWorkspaceModulo(null);
    }
  };

  const toggleExpand = (sysId: string) => {
    setExpandedSystems((prev) => ({
      ...prev,
      [sysId]: !prev[sysId]
    }));
  };

  // Filter systems and modules in real-time
  const term = searchTerm.toLowerCase().trim();
  const filteredSistemas = sistemas
    .map((sys) => {
      const sysNameMatches = sys.nome.toLowerCase().includes(term) || (sys.descricao && sys.descricao.toLowerCase().includes(term));
      const matchingModules = sys.modulos.filter(
        (mod) =>
          mod.nome.toLowerCase().includes(term) ||
          mod.codigo.toLowerCase().includes(term) ||
          (mod.descricao && mod.descricao.toLowerCase().includes(term))
      );

      // If search term is present and module matches, include system with filtered modules
      if (!term) return sys;
      if (sysNameMatches) return sys;
      if (matchingModules.length > 0) {
        return {
          ...sys,
          modulos: matchingModules
        };
      }
      return null;
    })
    .filter((sys): sys is SistemaItem => sys !== null);

  // Render workspace if active
  if (activeWorkspaceModulo) {
    return (
      <ModuloWorkspace
        modulo={activeWorkspaceModulo}
        sistemas={sistemas}
        onBack={handleBackFromWorkspace}
        onUpdateModulo={(updated) => {
          onUpdateModulo(updated);
          setActiveWorkspaceModulo(updated);
          if (onSelectWorkspaceModulo) onSelectWorkspaceModulo(updated);
        }}
        onShowToast={onShowToast}
        allAtendimentos={allAtendimentos}
        allRegistros={allRegistros}
        allArtigos={allArtigos}
        onOpenAtendimentoWorkspace={onOpenAtendimentoWorkspace}
        onOpenRegistroWorkspace={onOpenRegistroWorkspace}
        onOpenArtigoWorkspace={onOpenArtigoWorkspace}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" />
            <span>Classificação do Sistema</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Sistemas e Módulos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Central de sistemas e módulos comercializados pela empresa. Utilize esses módulos para classificar Atendimentos, Registros e Artigos da Base de Conhecimento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshSistemas}
            type="button"
            disabled={loading}
            className={`p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Atualizar lista de sistemas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setAdminDrawerOpen({ open: true, type: 'sistema' })}
            type="button"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>+ Novo Sistema</span>
          </button>

          <button
            onClick={() => setAdminDrawerOpen({ open: true, type: 'modulo' })}
            type="button"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Módulo</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Stats Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Pesquisar por sistema ou módulo..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
          <div>
            Total de Sistemas: <strong className="text-slate-900 dark:text-white font-bold">{sistemas.length}</strong>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div>
            Total de Módulos: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{sistemas.reduce((acc, s) => acc + s.modulos.length, 0)}</strong>
          </div>
        </div>
      </div>

      {/* Systems & Modules List Cards */}
      {filteredSistemas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <Boxes className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Nenhum sistema ou módulo encontrado
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Nenhum resultado corresponde à sua pesquisa "{searchTerm}".
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
          >
            Limpar Filtro
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSistemas.map((sistema) => {
            const isExpanded = expandedSystems[sistema.id] ?? true;

            return (
              <div
                key={sistema.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* System Card Header */}
                <div
                  onClick={() => toggleExpand(sistema.id)}
                  className="p-5 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between gap-4 transition-colors select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🖥️</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                            {sistema.nome}
                          </h2>
                          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {sistema.codigo}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              (sistema.status || 'Ativo') === 'Ativo'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {sistema.status || 'Ativo'}
                          </span>
                        </div>
                        {sistema.descricao && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {sistema.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newStatus = (sistema.status || 'Ativo') === 'Ativo' ? 'Inativo' : 'Ativo';
                        onUpdateSistema({ ...sistema, status: newStatus });
                        if (onShowToast) {
                          onShowToast(
                            'Sistema ' + (newStatus === 'Ativo' ? 'Ativado' : 'Inativado'),
                            `O sistema ${sistema.nome} foi marcado como ${newStatus}.`
                          );
                        }
                      }}
                      className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                        (sistema.status || 'Ativo') === 'Ativo'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                          : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
                      }`}
                      title="Clique para alternar o status do sistema"
                    >
                      {(sistema.status || 'Ativo') === 'Ativo' ? '● Ativo' : '○ Inativo'}
                    </button>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-extrabold flex items-center gap-1.5">
                      <FolderTree className="w-3.5 h-3.5" />
                      <span>{sistema.modulos.length} {sistema.modulos.length === 1 ? 'módulo' : 'módulos'}</span>
                    </span>
                  </div>
                </div>

                {/* Modules List inside System */}
                {isExpanded && (
                  <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 divide-y divide-slate-100 dark:divide-slate-800/50">
                    {sistema.modulos.length === 0 ? (
                      <p className="p-4 text-xs text-slate-400 italic">
                        Nenhum módulo cadastrado neste sistema.
                      </p>
                    ) : (
                      sistema.modulos.map((mod) => {
                        // Calculate live counts matching ModuloWorkspace logic
                        const modNameLower = mod.nome.toLowerCase();
                        const modCodeLower = (mod.codigo || '').toLowerCase();

                        const matchedAtds = allAtendimentos.filter(
                          (a) => {
                            const aMod = (a.modulo || '').toLowerCase();
                            return (
                              aMod.includes(modNameLower) ||
                              modNameLower.includes(aMod) ||
                              (modCodeLower && aMod.includes(modCodeLower)) ||
                              mod.atendimentosVinculados?.some((v) => v.id === a.id)
                            );
                          }
                        );
                        const atdCount = matchedAtds.length > 0 ? matchedAtds.length : (mod.qtdAtendimentos || 0);

                        const matchedRegs = allRegistros.filter(
                          (r) => {
                            const rMod = (r.modulo || '').toLowerCase();
                            return (
                              rMod.includes(modNameLower) ||
                              modNameLower.includes(rMod) ||
                              (modCodeLower && rMod.includes(modCodeLower)) ||
                              mod.registrosVinculados?.some((v) => v.id === r.id)
                            );
                          }
                        );
                        const regCount = matchedRegs.length > 0 ? matchedRegs.length : (mod.qtdRegistros || 0);

                        const matchedArts = allArtigos.filter(
                          (art) => {
                            const artMod = (art.modulo || '').toLowerCase();
                            return (
                              artMod.includes(modNameLower) ||
                              modNameLower.includes(artMod) ||
                              (modCodeLower && artMod.includes(modCodeLower)) ||
                              mod.artigosVinculados?.some((v) => v.id === art.id)
                            );
                          }
                        );
                        const artCount = matchedArts.length > 0 ? matchedArts.length : (mod.qtdArtigos || 0);

                        return (
                          <div
                            key={mod.id}
                            onClick={() => setQuickViewModule(mod)}
                            className="p-3.5 hover:bg-indigo-50/40 dark:hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4 group"
                          >
                            <div className="flex items-center gap-3">
                              {/* Tree branch symbol */}
                              <span className="text-slate-300 dark:text-slate-600 font-mono text-sm pl-2 select-none">
                                ├──
                              </span>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {mod.nome}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    {mod.codigo}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newStatus = mod.status === 'Ativo' ? 'Inativo' : 'Ativo';
                                      onUpdateModulo({ ...mod, status: newStatus });
                                      if (onShowToast) {
                                        onShowToast(
                                          'Módulo ' + (newStatus === 'Ativo' ? 'Ativado' : 'Inativado'),
                                          `O módulo ${mod.nome} foi marcado como ${newStatus}.`
                                        );
                                      }
                                    }}
                                    className={`text-[9px] font-bold px-2 py-0.2 rounded-full border transition-all cursor-pointer ${
                                      mod.status === 'Ativo'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
                                    }`}
                                    title="Clique para alternar o status do módulo"
                                  >
                                    {mod.status}
                                  </button>
                                </div>
                                {mod.descricao && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-xl pl-0.5">
                                    {mod.descricao}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs">
                              <div className="hidden md:flex items-center gap-3">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1" title="Atendimentos vinculados">
                                  <Headphones className="w-3.5 h-3.5 text-indigo-500" />
                                  <strong className="text-slate-700 dark:text-slate-200">{atdCount}</strong> atd.
                                </span>

                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1" title="Registros vinculados">
                                  <FileCode2 className="w-3.5 h-3.5 text-amber-500" />
                                  <strong className="text-slate-700 dark:text-slate-200">{regCount}</strong> regs.
                                </span>

                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1" title="Base de Conhecimento vinculada">
                                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                                  <strong className="text-slate-700 dark:text-slate-200">{artCount}</strong> arts.
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenWorkspace(mod);
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>Workspace</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick View Modal for clicked module */}
      {quickViewModule && (
        <QuickViewModal
          isOpen={Boolean(quickViewModule)}
          onClose={() => setQuickViewModule(null)}
          entityType="modulo"
          data={quickViewModule}
          onOpenWorkspace={(type, data) => {
            setQuickViewModule(null);
            handleOpenWorkspace(data as ModuloItem);
          }}
        />
      )}

      {/* Informative Right Drawer for "+ Novo Sistema" / "+ Novo Módulo" (adhering strictly to AGENTS_md right drawer rule) */}
      {adminDrawerOpen.open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Info className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {adminDrawerOpen.type === 'sistema'
                      ? 'Cadastro de Novos Sistemas'
                      : 'Cadastro de Novos Módulos'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sessão de Administração do Sistema SIGI
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAdminDrawerOpen({ open: false, type: 'sistema' })}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Diretriz do Sistema (SIGI)</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Conforme definido no escopo arquitetural do SIGI, a administração completa (criação, versionamento e parametrização de novos Sistemas e Módulos) será gerida centralizadamente na <strong>Sessão Administração</strong>.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Estrutura Atual Homologada
                </h3>
                <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-300 list-disc pl-4">
                  <li><strong>INFOSERRA ERP</strong>: Cadastros, Financeiro, Estoque.</li>
                  <li><strong>INFOSERRA Fiscal</strong>: Emissor NF-e, Emissor NFC-e, MDF-e.</li>
                  <li><strong>INFOSERRASAC</strong>: Cargas, Acertos, Vendas.</li>
                  <li><strong>INFOSERRA PDV</strong>: Frente de Caixa, Fechamento.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Todas as edições e manutenções operacionais dos módulos atuais já podem ser realizadas diretamente através do seu <strong>Workspace</strong> nesta tela.
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setAdminDrawerOpen({ open: false, type: 'sistema' })}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
