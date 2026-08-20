import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Boxes,
  Building2,
  Headphones,
  FileCode2,
  BookOpen,
  Clock,
  User,
  Plus,
  Trash2,
  Search,
  ExternalLink,
  CheckCircle2,
  MessageSquare,
  X,
  Eye,
  AlertCircle,
  Tag,
  FolderTree,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import {
  ModuloItem,
  SistemaItem,
  AtendimentoItem,
  RegistroItem,
  ArtigoKBItem,
  ModuloTimelineItem
} from '../../types';
import { QuickViewModal, QuickViewEntityType } from '../common/QuickViewModal';

interface ModuloWorkspaceProps {
  modulo: ModuloItem;
  sistemas: SistemaItem[];
  onBack: () => void;
  onUpdateModulo: (updatedModulo: ModuloItem) => void;
  onShowToast?: (title: string, message: string) => void;
  allAtendimentos?: AtendimentoItem[];
  allRegistros?: RegistroItem[];
  allArtigos?: ArtigoKBItem[];
  onOpenAtendimentoWorkspace?: (atdId: string) => void;
  onOpenRegistroWorkspace?: (regId: string) => void;
  onOpenArtigoWorkspace?: (artId: string) => void;
}

export const ModuloWorkspace: React.FC<ModuloWorkspaceProps> = ({
  modulo,
  sistemas,
  onBack,
  onUpdateModulo,
  onShowToast,
  allAtendimentos = [],
  allRegistros = [],
  allArtigos = [],
  onOpenAtendimentoWorkspace,
  onOpenRegistroWorkspace,
  onOpenArtigoWorkspace
}) => {
  const [activeTab, setActiveTab] = useState<
    'geral' | 'atendimentos' | 'registros' | 'base_conhecimento' | 'timeline'
  >('geral');

  // Editable Form State
  const [nome, setNome] = useState(modulo.nome);
  const [sistemaId, setSistemaId] = useState(modulo.sistemaId);
  const [descricao, setDescricao] = useState(modulo.descricao || '');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>(modulo.status);

  // Quick View State
  const [quickViewData, setQuickViewData] = useState<{
    type: QuickViewEntityType;
    data: any;
  } | null>(null);

  // Search states for tabs
  const [searchAtd, setSearchAtd] = useState('');
  const [searchReg, setSearchReg] = useState('');
  const [searchArt, setSearchArt] = useState('');

  // New Timeline Event Form
  const [newTLTitle, setNewTLTitle] = useState('');
  const [newTLDesc, setNewTLDesc] = useState('');
  const [newTLType, setNewTLType] = useState<ModuloTimelineItem['tipo']>('comentario');

  // Related items filtered dynamically or explicitly
  const modNameLower = modulo.nome.toLowerCase();
  const modCodeLower = (modulo.codigo || '').toLowerCase();

  let relatedAtendimentos = allAtendimentos.filter(
    (a) => {
      const aMod = (a.modulo || '').toLowerCase();
      return (
        aMod.includes(modNameLower) ||
        modNameLower.includes(aMod) ||
        (modCodeLower && aMod.includes(modCodeLower)) ||
        modulo.atendimentosVinculados?.some((v) => v.id === a.id)
      );
    }
  );
  if (relatedAtendimentos.length === 0 && (modulo.qtdAtendimentos || 0) > 0) {
    relatedAtendimentos = allAtendimentos.slice(0, modulo.qtdAtendimentos);
  }

  let relatedRegistros = allRegistros.filter(
    (r) => {
      const rMod = (r.modulo || '').toLowerCase();
      return (
        rMod.includes(modNameLower) ||
        modNameLower.includes(rMod) ||
        (modCodeLower && rMod.includes(modCodeLower)) ||
        modulo.registrosVinculados?.some((v) => v.id === r.id)
      );
    }
  );
  if (relatedRegistros.length === 0 && (modulo.qtdRegistros || 0) > 0) {
    relatedRegistros = allRegistros.slice(0, modulo.qtdRegistros);
  }

  let relatedArtigos = allArtigos.filter(
    (art) => {
      const artMod = (art.modulo || '').toLowerCase();
      return (
        artMod.includes(modNameLower) ||
        modNameLower.includes(artMod) ||
        (modCodeLower && artMod.includes(modCodeLower)) ||
        modulo.artigosVinculados?.some((v) => v.id === art.id)
      );
    }
  );
  if (relatedArtigos.length === 0 && (modulo.qtdArtigos || 0) > 0) {
    relatedArtigos = allArtigos.slice(0, modulo.qtdArtigos);
  }

  const currentSistema = sistemas.find((s) => s.id === sistemaId) || {
    id: sistemaId,
    nome: modulo.sistemaNome
  };

  const handleSaveGeral = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSis = sistemas.find((s) => s.id === sistemaId);
    const updatedModulo: ModuloItem = {
      ...modulo,
      nome,
      sistemaId,
      sistemaNome: updatedSis ? updatedSis.nome : modulo.sistemaNome,
      descricao,
      status,
      ultimaAtualizacao: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timelineEvents: [
        {
          id: `tl-edit-${Date.now()}`,
          tipo: 'edicao',
          titulo: 'Módulo Atualizado',
          descricao: `Informações gerais atualizadas. Nome: ${nome}, Status: ${status}`,
          autor: 'Carlos Eduardo Silva',
          data: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        },
        ...(modulo.timelineEvents || [])
      ]
    };

    onUpdateModulo(updatedModulo);
    if (onShowToast) {
      onShowToast('Módulo Salvo', `As alterações no módulo ${nome} foram salvas com sucesso.`);
    }
  };

  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTLTitle.trim()) return;

    const newEvt: ModuloTimelineItem = {
      id: `tl-custom-${Date.now()}`,
      tipo: newTLType,
      titulo: newTLTitle.trim(),
      descricao: newTLDesc.trim() || undefined,
      autor: 'Carlos Eduardo Silva',
      data: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedModulo: ModuloItem = {
      ...modulo,
      timelineEvents: [newEvt, ...(modulo.timelineEvents || [])]
    };

    onUpdateModulo(updatedModulo);
    setNewTLTitle('');
    setNewTLDesc('');
    if (onShowToast) {
      onShowToast('Histórico Atualizado', 'Novo registro adicionado à timeline do módulo.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Voltar para Sistemas e Módulos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800">
                {modulo.codigo}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {currentSistema.nome}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  status === 'Ativo'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800'
                }`}
              >
                {status}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Workspace do Módulo: {nome}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveGeral}
            type="button"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Módulo</span>
          </button>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('geral')}
          className={`px-4 py-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'geral'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Geral</span>
        </button>

        <button
          onClick={() => setActiveTab('atendimentos')}
          className={`px-4 py-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'atendimentos'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Atendimentos</span>
          <span className="ml-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
            {relatedAtendimentos.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('registros')}
          className={`px-4 py-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'registros'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Registros</span>
          <span className="ml-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
            {relatedRegistros.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('base_conhecimento')}
          className={`px-4 py-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'base_conhecimento'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Base de Conhecimento</span>
          <span className="ml-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
            {relatedArtigos.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timeline</span>
          <span className="ml-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
            {modulo.timelineEvents?.length || 0}
          </span>
        </button>
      </div>

      {/* Tab 1: Geral */}
      {activeTab === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveGeral} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-500" />
                Dados do Módulo
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nome do Módulo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Cadastros, Financeiro..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Sistema Pertencente <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={sistemaId}
                    onChange={(e) => setSistemaId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {sistemas.map((sis) => (
                      <option key={sis.id} value={sis.id}>
                        {sis.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Ativo"
                      checked={status === 'Ativo'}
                      onChange={() => setStatus('Ativo')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ativo</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Inativo"
                      checked={status === 'Inativo'}
                      onChange={() => setStatus('Inativo')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>Inativo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Descrição e Abrangência do Módulo
                </label>
                <textarea
                  rows={5}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  placeholder="Descreva as funcionalidades e objetivos deste módulo..."
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Summary Panel */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resumo Operacional
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <Headphones className="w-4 h-4 text-indigo-500" />
                    <span>Atendimentos Vinculados</span>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {relatedAtendimentos.length}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <FileCode2 className="w-4 h-4 text-amber-500" />
                    <span>Registros Vinculados</span>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {relatedRegistros.length}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>Artigos na KB</span>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {relatedArtigos.length}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-2 text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Data de Criação:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {modulo.dataCriacao || '10/01/2024'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Última Atualização:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {modulo.ultimaAtualizacao || 'Recentemente'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Atendimentos */}
      {activeTab === 'atendimentos' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Atendimentos Relacionados ao Módulo {nome}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lista de chamados e suporte vinculados a este módulo.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchAtd}
                onChange={(e) => setSearchAtd(e.target.value)}
                placeholder="Filtrar chamados..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {relatedAtendimentos.filter((a) =>
            a.assunto.toLowerCase().includes(searchAtd.toLowerCase()) ||
            a.codigo.toLowerCase().includes(searchAtd.toLowerCase()) ||
            (a.clienteNome && a.clienteNome.toLowerCase().includes(searchAtd.toLowerCase()))
          ).length === 0 ? (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <Headphones className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Nenhum atendimento associado a este módulo foi encontrado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">Código</th>
                    <th className="pb-3">Assunto</th>
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Prioridade</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {relatedAtendimentos
                    .filter((a) =>
                      a.assunto.toLowerCase().includes(searchAtd.toLowerCase()) ||
                      a.codigo.toLowerCase().includes(searchAtd.toLowerCase()) ||
                      (a.clienteNome && a.clienteNome.toLowerCase().includes(searchAtd.toLowerCase()))
                    )
                    .map((atd) => (
                      <tr key={atd.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 pl-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {atd.codigo}
                        </td>
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                          {atd.assunto}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 font-medium">
                          {atd.clienteNome || 'Cliente Interno'}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {atd.prioridade}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {atd.status}
                          </span>
                        </td>
                        <td className="py-3 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setQuickViewData({ type: 'atendimento', data: atd })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Visualização Rápida"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {onOpenAtendimentoWorkspace && (
                              <button
                                onClick={() => onOpenAtendimentoWorkspace(atd.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Abrir Workspace"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Registros */}
      {activeTab === 'registros' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-amber-500" />
                Registros Relacionados ao Módulo {nome}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bugs, melhorias e ideias registradas para este módulo.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchReg}
                onChange={(e) => setSearchReg(e.target.value)}
                placeholder="Filtrar registros..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {relatedRegistros.filter((r) =>
            r.titulo.toLowerCase().includes(searchReg.toLowerCase()) ||
            r.codigo.toLowerCase().includes(searchReg.toLowerCase())
          ).length === 0 ? (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <FileCode2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Nenhum registro encontrado para este módulo.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">Código</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Título</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Data</th>
                    <th className="pb-3 text-right pr-2">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {relatedRegistros
                    .filter((r) =>
                      r.titulo.toLowerCase().includes(searchReg.toLowerCase()) ||
                      r.codigo.toLowerCase().includes(searchReg.toLowerCase())
                    )
                    .map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 pl-2 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {reg.codigo}
                        </td>
                        <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                          {reg.tipo}
                        </td>
                        <td className="py-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {reg.titulo}
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">
                          {reg.data}
                        </td>
                        <td className="py-3 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setQuickViewData({ type: 'registro', data: reg })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Visualização Rápida"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {onOpenRegistroWorkspace && (
                              <button
                                onClick={() => onOpenRegistroWorkspace(reg.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Abrir Workspace"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Base de Conhecimento */}
      {activeTab === 'base_conhecimento' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Artigos da Base de Conhecimento para o Módulo {nome}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manuais, procedimentos e soluções documentadas na KB.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchArt}
                onChange={(e) => setSearchArt(e.target.value)}
                placeholder="Filtrar artigos..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {relatedArtigos.filter((a) =>
            a.titulo.toLowerCase().includes(searchArt.toLowerCase()) ||
            a.codigo.toLowerCase().includes(searchArt.toLowerCase())
          ).length === 0 ? (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Nenhum artigo da Base de Conhecimento relacionado a este módulo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedArtigos
                .filter((a) =>
                  a.titulo.toLowerCase().includes(searchArt.toLowerCase()) ||
                  a.codigo.toLowerCase().includes(searchArt.toLowerCase())
                )
                .map((art) => (
                  <div
                    key={art.id}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 bg-slate-50/50 dark:bg-slate-800/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800">
                          {art.codigo}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {art.categoria}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                        {art.titulo}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {art.conteudo || 'Sem conteúdo estendido.'}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Por {art.autor}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuickViewData({ type: 'artigo', data: art })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Visualização Rápida"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onOpenArtigoWorkspace && (
                          <button
                            type="button"
                            onClick={() => onOpenArtigoWorkspace(art.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Abrir Workspace"
                          >
                            <span>Workspace</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Timeline */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Histórico e Timeline do Módulo
              </h2>

              {(!modulo.timelineEvents || modulo.timelineEvents.length === 0) ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Nenhum evento registrado na timeline.
                </p>
              ) : (
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                  {modulo.timelineEvents.map((evt) => (
                    <div key={evt.id} className="relative group">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 dark:bg-indigo-400 border-4 border-white dark:border-slate-900" />
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {evt.titulo}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {evt.data}
                          </span>
                        </div>
                        {evt.descricao && (
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {evt.descricao}
                          </p>
                        )}
                        <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 pt-1">
                          Autor: {evt.autor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Timeline Note Form */}
          <div className="space-y-4">
            <form onSubmit={handleAddTimelineEvent} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" />
                Adicionar Nota na Timeline
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Evento
                </label>
                <input
                  type="text"
                  required
                  value={newTLTitle}
                  onChange={(e) => setNewTLTitle(e.target.value)}
                  placeholder="Ex: Atualização de Parâmetros, Homologação..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo
                </label>
                <select
                  value={newTLType}
                  onChange={(e) => setNewTLType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="comentario">Comentário / Nota</option>
                  <option value="edicao">Edição Técnica</option>
                  <option value="status">Mudança de Status</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detalhamento
                </label>
                <textarea
                  rows={3}
                  value={newTLDesc}
                  onChange={(e) => setNewTLDesc(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar ao Histórico</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick View Drawer Modal */}
      {quickViewData && (
        <QuickViewModal
          isOpen={Boolean(quickViewData)}
          onClose={() => setQuickViewData(null)}
          entityType={quickViewData.type}
          data={quickViewData.data}
          onOpenWorkspace={(type, data) => {
            setQuickViewData(null);
            if (type === 'atendimento' && onOpenAtendimentoWorkspace) {
              onOpenAtendimentoWorkspace(data.id);
            } else if (type === 'registro' && onOpenRegistroWorkspace) {
              onOpenRegistroWorkspace(data.id);
            }
          }}
        />
      )}
    </div>
  );
};
