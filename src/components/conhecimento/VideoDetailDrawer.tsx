import React, { useState, useEffect } from 'react';
import {
  X,
  Video,
  Play,
  Copy,
  Check,
  ExternalLink,
  Save,
  Tag,
  Building2,
  Layers,
  HelpCircle,
  Bug,
  Clock,
  User,
  Share2,
  Trash2
} from 'lucide-react';
import { ArtigoKBItem, Cliente, AtendimentoItem, RegistroItem, UserAccount, SystemTablesData } from '../../types';

interface VideoDetailDrawerProps {
  video: ArtigoKBItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateVideo: (updated: ArtigoKBItem) => void;
  onDeleteVideo?: (videoId: string) => void;
  allClients?: Cliente[];
  allAtendimentos?: AtendimentoItem[];
  allRegistros?: RegistroItem[];
  onShowToast?: (title: string, message: string) => void;
  onOpenAtendimentoWorkspace?: (atdId: string) => void;
  onOpenRegistroWorkspace?: (regId: string) => void;
  systemUsers?: UserAccount[];
  systemTables?: SystemTablesData;
}

export const VideoDetailDrawer: React.FC<VideoDetailDrawerProps> = ({
  video,
  isOpen,
  onClose,
  onUpdateVideo,
  onDeleteVideo,
  allClients = [],
  allAtendimentos = [],
  allRegistros = [],
  onShowToast,
  onOpenAtendimentoWorkspace,
  onOpenRegistroWorkspace,
  systemUsers = [],
  systemTables
}) => {
  // Form State initialized from video
  const [titulo, setTitulo] = useState(video?.titulo || '');
  const [sistemaPertencente, setSistemaPertencente] = useState(video?.sistemaPertencente || 'Sistema Sacoleiro');
  const [modulo, setModulo] = useState(video?.modulo || 'PDV & Caixa');
  const [videoUrl, setVideoUrl] = useState(video?.videoUrl || '');
  const [conteudo, setConteudo] = useState(video?.conteudo || '');
  const [clienteId, setClienteId] = useState(video?.clienteId || '');
  const [status, setStatus] = useState<'Publicado' | 'Rascunho' | 'Arquivado'>(video?.status || 'Publicado');
  const [tags, setTags] = useState<string[]>(video?.tags || ['Vídeo Aula']);
  const [tagInput, setTagInput] = useState('');
  
  const initialAtdId = video?.atendimentosVinculados && video.atendimentosVinculados.length > 0 ? video.atendimentosVinculados[0].id : '';
  const initialRegId = video?.registrosVinculados && video.registrosVinculados.length > 0 ? video.registrosVinculados[0].id : '';
  const [selectedAtendimentoId, setSelectedAtendimentoId] = useState(initialAtdId);
  const [selectedRegistroId, setSelectedRegistroId] = useState(initialRegId);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const handleDelete = () => {
    if (onDeleteVideo && video) {
      onDeleteVideo(video.id);
      if (onShowToast) {
        onShowToast('Vídeo Excluído', `Vídeo ${video.codigo} removido permanentemente.`);
      }
      setIsConfirmDeleteOpen(false);
      onClose();
    }
  };

  // Sync state if video prop changes
  useEffect(() => {
    if (video) {
      setTitulo(video.titulo || '');
      setSistemaPertencente(video.sistemaPertencente || 'Sistema Sacoleiro');
      setModulo(video.modulo || 'PDV & Caixa');
      setVideoUrl(video.videoUrl || '');
      setConteudo(video.conteudo || '');
      setClienteId(video.clienteId || '');
      setStatus(video.status || 'Publicado');
      setTags(video.tags || ['Vídeo Aula']);
      setSelectedAtendimentoId(video.atendimentosVinculados && video.atendimentosVinculados.length > 0 ? video.atendimentosVinculados[0].id : '');
      setSelectedRegistroId(video.registrosVinculados && video.registrosVinculados.length > 0 ? video.registrosVinculados[0].id : '');
    }
  }, [video]);

  if (!isOpen || !video) return null;

  const handleCopyLink = () => {
    const urlToCopy = videoUrl || video.videoUrl || '';
    if (!urlToCopy) return;
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    if (onShowToast) {
      onShowToast('Link Copiado', 'Link do vídeo copiado para a área de transferência!');
    }
    setTimeout(() => setCopiedLink(false), 3000);
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

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim();
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tg: string) => {
    setTags(tags.filter((t) => t !== tg));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const selectedClient = allClients.find((c) => c.id === clienteId);
    const selectedAtd = allAtendimentos.find((a) => a.id === selectedAtendimentoId);
    const selectedReg = allRegistros.find((r) => r.id === selectedRegistroId);

    const nowFormatted = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const updatedVideo: ArtigoKBItem = {
      ...video,
      titulo: titulo.trim(),
      sistemaPertencente,
      modulo,
      videoUrl: videoUrl.trim(),
      conteudo: conteudo.trim(),
      status,
      tags,
      clienteId: selectedClient?.id,
      clienteNome: selectedClient ? selectedClient.razaoSocial : undefined,
      ultimaAtualizacao: nowFormatted,
      atendimentosVinculados: selectedAtd ? [selectedAtd] : [],
      registrosVinculados: selectedReg ? [selectedReg] : []
    };

    onUpdateVideo(updatedVideo);
    if (onShowToast) {
      onShowToast('Vídeo Atualizado', `Vídeo ${video.codigo} atualizado com sucesso.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-200/50 dark:border-purple-900/50">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded border border-purple-200/50 dark:border-purple-900/50">
                  {video.codigo}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                  Vídeo Aula
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  status === 'Publicado'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                }`}>
                  {status}
                </span>
              </div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white mt-1 line-clamp-1">
                {video.titulo}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* VIDEO PLAYER CONTAINER */}
          <div className="space-y-2">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-md border border-slate-800">
              <iframe
                src={getEmbedUrl(videoUrl || video.videoUrl)}
                title={video.titulo}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* PLAYER ACTION BAR */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-xs">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold truncate">
                <Play className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">{videoUrl || video.videoUrl || 'Sem URL informada'}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>

                {(videoUrl || video.videoUrl) && (
                  <a
                    href={videoUrl || video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-lg transition-colors"
                    title="Abrir vídeo em nova aba"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* EDITABLE FORM SECTION */}
          <form id="edit-video-form" onSubmit={handleSave} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Editar Dados do Vídeo
              </h3>
              <span className="text-[11px] text-slate-400">
                Alterações salvas atualizam a base em tempo real
              </span>
            </div>

            {/* Título do Vídeo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Título do Vídeo
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
              />
            </div>

            {/* Link do Vídeo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Link do Vídeo (URL)
              </label>
              <input
                type="url"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-purple-700 dark:text-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
              />
            </div>

            {/* Sistema e Módulo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sistema Pertencente
                </label>
                <select
                  value={sistemaPertencente}
                  onChange={(e) => setSistemaPertencente(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none cursor-pointer"
                >
                  {systemTables?.sistemas?.map((sis) => (
                    <option key={sis.id} value={sis.nome}>
                      {sis.nome}
                    </option>
                  )) || (
                    <>
                      <option value="Sistema Sacoleiro">Sistema Sacoleiro</option>
                      <option value="Sistema ERP">Sistema ERP</option>
                      <option value="Emissão de NFe">Emissão de NFe</option>
                      <option value="PDV & Caixa">PDV & Caixa</option>
                      <option value="SIGI Geral">SIGI Geral</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Módulo
                </label>
                <select
                  value={modulo}
                  onChange={(e) => setModulo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none cursor-pointer"
                >
                  {systemTables?.modulos?.map((mod) => (
                    <option key={mod.id} value={mod.nome}>
                      {mod.nome}
                    </option>
                  )) || (
                    <>
                      <option value="PDV & Caixa">PDV & Caixa</option>
                      <option value="Faturamento">Faturamento</option>
                      <option value="Módulo Fiscal">Módulo Fiscal</option>
                      <option value="Estoque">Estoque</option>
                      <option value="Clientes & Vendas">Clientes & Vendas</option>
                      <option value="Cadastros">Cadastros</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Geral">Geral</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Status e Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status de Publicação
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none cursor-pointer"
                >
                  {systemTables?.statusVideo?.map((sv) => (
                    <option key={sv.id} value={sv.nome}>
                      {sv.nome}
                    </option>
                  )) || (
                    <>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Em Gravação">Em Gravação</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cliente Vinculado
                </label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none cursor-pointer"
                >
                  <option value="">Geral (Todos os clientes)</option>
                  {allClients.map((cli) => (
                    <option key={cli.id} value={cli.id}>
                      {cli.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Descrição do Conteúdo
              </label>
              <textarea
                rows={3}
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none resize-none"
              />
            </div>

            {/* Vínculo com Atendimentos & Registros */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                Vínculos Operacionais (Atendimentos e Bugs)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Chamado / Atendimento
                  </label>
                  <select
                    value={selectedAtendimentoId}
                    onChange={(e) => setSelectedAtendimentoId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">Nenhum atendimento vinculado</option>
                    {allAtendimentos.map((atd) => (
                      <option key={atd.id} value={atd.id}>
                        {atd.codigo} - {atd.assunto}
                      </option>
                    ))}
                  </select>
                  {selectedAtendimentoId && onOpenAtendimentoWorkspace && (
                    <button
                      type="button"
                      onClick={() => onOpenAtendimentoWorkspace(selectedAtendimentoId)}
                      className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-bold mt-1 inline-block cursor-pointer"
                    >
                      Abrir Workspace do Chamado →
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Registro / Bug
                  </label>
                  <select
                    value={selectedRegistroId}
                    onChange={(e) => setSelectedRegistroId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">Nenhum registro vinculado</option>
                    {allRegistros.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.codigo} - {reg.titulo}
                      </option>
                    ))}
                  </select>
                  {selectedRegistroId && onOpenRegistroWorkspace && (
                    <button
                      type="button"
                      onClick={() => onOpenRegistroWorkspace(selectedRegistroId)}
                      className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-bold mt-1 inline-block cursor-pointer"
                    >
                      Abrir Workspace do Registro →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tags do Vídeo
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Adicionar tag..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
                >
                  + Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {tags.map((tg) => (
                  <span
                    key={tg}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[11px] rounded-md border border-purple-200/50 dark:border-purple-800/50"
                  >
                    #{tg}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tg)}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          {onDeleteVideo ? (
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200/60 dark:border-rose-900/60"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Vídeo</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Atualizado: {video.ultimaAtualizacao || video.dataCriacao}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="submit"
              form="edit-video-form"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Right Drawer Overlay */}
        {isConfirmDeleteOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between p-6 animate-in slide-in-from-right duration-200">
              <div className="space-y-4">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl w-fit">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Excluir Vídeo da Base de Conhecimento?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tem certeza que deseja remover o vídeo <strong className="text-slate-900 dark:text-white">{video.codigo} - {video.titulo}</strong>? Esta ação é irreversível e o vídeo deixará de estar acessível no repositório.
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
                  onClick={handleDelete}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sim, Excluir Permanentemente</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
