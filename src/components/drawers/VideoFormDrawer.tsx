import React, { useState, useEffect } from 'react';
import { X, Video, Save, Tag, Link as LinkIcon, FileText } from 'lucide-react';
import { ArtigoKBItem, AnexoItem, SystemTablesData } from '../../types';
import { AttachmentSection } from '../common/AttachmentSection';

interface VideoFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (video: ArtigoKBItem) => void;
  editingVideo?: ArtigoKBItem | null;
  systemTables?: SystemTablesData;
  onShowToast?: (title: string, message: string) => void;
}

export const VideoFormDrawer: React.FC<VideoFormDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingVideo,
  systemTables,
  onShowToast
}) => {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [url, setUrl] = useState('');
  const [nivel, setNivel] = useState<'Básico' | 'Intermediário' | 'Avançado'>('Básico');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [anexos, setAnexos] = useState<AnexoItem[]>([]);
  const [error, setError] = useState('');

  // Lookup options from systemTables
  const categoriaOptions = systemTables?.categoriasVideo?.filter((i) => i.status === 'Ativo' || i.nome === editingVideo?.categoria) || [];
  const nivelOptions = systemTables?.niveisVideo?.filter((i) => i.status === 'Ativo' || i.nome === editingVideo?.nivel) || [];
  const statusOptions = systemTables?.statusVideo?.filter((i) => i.status === 'Ativo' || i.nome === editingVideo?.status) || [];

  useEffect(() => {
    if (editingVideo) {
      setTitulo(editingVideo.titulo || '');
      setCategoria(editingVideo.categoria || categoriaOptions[0]?.nome || 'Treinamento Operacional');
      setUrl(editingVideo.videoUrl || '');
      setNivel((editingVideo.nivel as any) || 'Básico');
      setDescricao(editingVideo.conteudo || '');
      setStatus((editingVideo.status as any) || 'Ativo');
      setAnexos(editingVideo.anexos || []);
    } else {
      setTitulo('');
      setCategoria(categoriaOptions[0]?.nome || 'Treinamento Operacional');
      setUrl('');
      setNivel('Básico');
      setDescricao('');
      setStatus('Ativo');
      setAnexos([]);
    }
    setError('');
  }, [editingVideo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('O título do vídeo é obrigatório.');
      return;
    }

    const videoToSave: ArtigoKBItem = {
      id: editingVideo?.id || `vid-${Date.now()}`,
      codigo: editingVideo?.codigo || `#VID-${Math.floor(1000 + Math.random() * 9000)}`,
      titulo: titulo.trim(),
      categoria,
      conteudo: descricao.trim() || 'Vídeo aula explicativo.',
      videoUrl: url.trim() || 'https://youtube.com',
      nivel,
      status: status === 'Ativo' ? 'Publicado' : 'Rascunho',
      tipoConteudo: 'video',
      tipoArtigo: 'Vídeo Aula',
      dataCriacao: editingVideo?.dataCriacao || new Date().toLocaleDateString('pt-BR'),
      ultimaAtualizacao: new Date().toLocaleDateString('pt-BR'),
      autor: 'Treinamento SIGI',
      visualizacoes: editingVideo?.visualizacoes || 0,
      tags: [categoria, nivel],
      anexos
    };

    onSave(videoToSave);
    if (onShowToast) {
      onShowToast(
        editingVideo ? 'Vídeo Atualizado' : 'Novo Vídeo Cadastrado',
        `"${videoToSave.titulo}" salvo com sucesso.`
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200/50 dark:border-rose-800/50">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingVideo ? 'Editar Vídeo' : 'Novo Vídeo Aula / Treinamento'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formulário de vídeos de capacitação e manuais audiovisuais.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Section 1: Título & Link */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Tag className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Título & Link
              </h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Título do Vídeo *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Treinamento Completo de Abertura de Caixa no PDV"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-rose-500" />
                URL / Link do Vídeo (YouTube, Vimeo ou Local SMB)
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                >
                  {categoriaOptions.length > 0 ? (
                    categoriaOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Treinamento Operacional">Treinamento Operacional</option>
                      <option value="Instalação de Servidores">Instalação de Servidores</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nível
                </label>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                >
                  {nivelOptions.length > 0 ? (
                    nivelOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Básico">Básico</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                >
                  {statusOptions.length > 0 ? (
                    statusOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Descrição do Conteúdo */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <FileText className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Descrição do Conteúdo
              </h4>
            </div>

            <div>
              <textarea
                rows={4}
                placeholder="Resumo do que é abordado neste vídeo..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 3: Attachments */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs">
            <AttachmentSection
              anexos={anexos}
              onChangeAnexos={setAnexos}
              entityPrefix="VID"
              onShowToast={onShowToast}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Vídeo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
