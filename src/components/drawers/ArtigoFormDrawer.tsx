import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookOpen,
  Save,
  Tag,
  FileText,
  Bold,
  Italic,
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
  Eye,
  Copy,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ArtigoKBItem, AnexoItem, SystemTablesData, UserAccount } from '../../types';
import { AttachmentSection } from '../common/AttachmentSection';
import { initialUsers } from '../../data/mockUsers';

interface ArtigoFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (artigo: ArtigoKBItem) => void;
  editingArtigo?: ArtigoKBItem | null;
  systemTables?: SystemTablesData;
  systemUsers?: UserAccount[];
  clients?: any[];
  onShowToast?: (title: string, message: string) => void;
}

// Repositório de imagens SMB de exemplo
const mockSmbImages = [
  {
    id: 'smb-1',
    nome: 'print_config_nfe_cert.png',
    caminhoSmb: '\\\\smb-server\\arquivos_sip\\imagens\\print_config_nfe_cert.png',
    categoria: 'Fiscal / NF-e',
    previewUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'smb-2',
    nome: 'print_topologia_rede.png',
    caminhoSmb: '\\\\smb-server\\arquivos_sip\\imagens\\print_topologia_rede.png',
    categoria: 'Redes & Infra',
    previewUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'smb-3',
    nome: 'print_pdv_caixa_pdv.png',
    caminhoSmb: '\\\\smb-server\\arquivos_sip\\imagens\\print_pdv_caixa_pdv.png',
    categoria: 'PDV & Caixa',
    previewUrl: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'smb-4',
    nome: 'print_backup_postgresql.png',
    caminhoSmb: '\\\\smb-server\\arquivos_sip\\imagens\\print_backup_postgresql.png',
    categoria: 'Servidores / DB',
    previewUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'
  }
];

// Document Preview Renderer Component
const DocumentPreviewRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) {
    return (
      <div className="p-8 text-center text-slate-400 font-medium italic text-xs">
        Nenhum conteúdo documentado para este artigo. Utilize o modo Editor para adicionar texto e formatação.
      </div>
    );
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableRows: string[][] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeLanguage = '';

  const flushTable = (keyIndex: number) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const bodyRows = tableRows.slice(2);

    elements.push(
      <div key={`table-${keyIndex}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-emerald-50/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
              {headerRow.map((col, idx) => (
                <th key={idx} className="p-2.5 font-extrabold">{col.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 text-slate-700 dark:text-slate-300 font-medium">{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  const flushCodeBlock = (keyIndex: number) => {
    const codeText = codeBlockLines.join('\n');
    elements.push(
      <div key={`code-${keyIndex}`} className="my-3 rounded-xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-xs text-slate-100 relative shadow-md">
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-400 mb-1.5 pb-1.5 border-b border-slate-800">
          <span>💻 {codeLanguage || 'Comando / Script'}</span>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(codeText)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>Copiar</span>
          </button>
        </div>
        <pre className="overflow-x-auto leading-relaxed text-emerald-400 whitespace-pre-wrap">{codeText}</pre>
      </div>
    );
    codeBlockLines = [];
    inCodeBlock = false;
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(index);
      } else {
        if (inTable) flushTable(index);
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '');
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line.trim().split('|').slice(1, -1);
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(index);
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-base font-black text-slate-900 dark:text-white mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          {line.replace('# ', '')}
        </h1>
      );
      return;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-3 mb-1.5 flex items-center gap-2">
          <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
          {line.replace('## ', '')}
        </h2>
      );
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-2.5 mb-1">
          {line.replace('### ', '')}
        </h3>
      );
      return;
    }

    if (line.startsWith('> ')) {
      elements.push(
        <div key={index} className="my-2.5 p-3 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 rounded-r-xl text-xs leading-relaxed font-medium flex items-start gap-2 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>{line.replace('> ', '')}</div>
        </div>
      );
      return;
    }

    if (line.trim().startsWith('- ')) {
      elements.push(
        <div key={index} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 my-1 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
          <span>{line.trim().replace('- ', '')}</span>
        </div>
      );
      return;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <div key={index} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 my-1 pl-2 font-medium">
            <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200/50">
              {match[1]}.
            </span>
            <span>{match[2]}</span>
          </div>
        );
        return;
      }
    }

    const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const url = imgMatch[2];
      elements.push(
        <div key={index} className="my-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-500" />
              SMB Image: {alt}
            </span>
          </div>
          <img src={url} alt={alt} className="max-h-64 w-auto rounded-lg object-contain border border-slate-200/80 dark:border-slate-700 shadow-2xs mx-auto" />
        </div>
      );
      return;
    }

    if (line.trim()) {
      elements.push(
        <p key={index} className="text-xs text-slate-700 dark:text-slate-200 my-1 leading-relaxed">
          {line}
        </p>
      );
    }
  });

  if (inTable) flushTable(lines.length);
  if (inCodeBlock) flushCodeBlock(lines.length);

  return <div className="space-y-1">{elements}</div>;
};

export const ArtigoFormDrawer: React.FC<ArtigoFormDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingArtigo,
  systemTables,
  systemUsers = initialUsers,
  onShowToast
}) => {
  const [codigo, setCodigo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<'Publicado' | 'Rascunho' | 'Arquivado'>('Publicado');
  const [sistemaPertencente, setSistemaPertencente] = useState('');
  const [autor, setAutor] = useState('Suporte Técnico');
  const [anexos, setAnexos] = useState<AnexoItem[]>([]);
  const [error, setError] = useState('');

  // Editor mode tab: 'edit' | 'preview' | 'split'
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isSmbModalOpen, setIsSmbModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Lookup options from systemTables
  const categoriaOptions = systemTables?.tiposBaseConhecimento?.filter((i: any) => i.status === 'Ativo' || i.nome === editingArtigo?.categoria) || [];
  const statusOptions = systemTables?.statusBaseConhecimento?.filter((i: any) => i.status === 'Ativo' || i.nome === editingArtigo?.status) || [];
  const sistemasList = systemTables?.sistemas?.filter((i: any) => i.status === 'Ativo' || i.nome === editingArtigo?.sistemaPertencente) || [];

  useEffect(() => {
    if (editingArtigo) {
      setCodigo(editingArtigo.codigo || `#ART-${Math.floor(1000 + Math.random() * 9000)}`);
      setTitulo(editingArtigo.titulo || '');
      setCategoria(editingArtigo.categoria || categoriaOptions[0]?.nome || 'Fiscal / Tributário');
      setConteudo(editingArtigo.conteudo || '');
      setTagsInput(editingArtigo.tags ? editingArtigo.tags.join(', ') : '');
      setStatus(editingArtigo.status || 'Publicado');
      setSistemaPertencente(editingArtigo.sistemaPertencente || '');
      setAutor(editingArtigo.autor || 'Suporte Técnico');
      setAnexos(editingArtigo.anexos || []);
    } else {
      setCodigo(`#ART-${Math.floor(1000 + Math.random() * 9000)}`);
      setTitulo('');
      setCategoria(categoriaOptions[0]?.nome || 'Fiscal / Tributário');
      setConteudo('');
      setTagsInput('');
      setStatus('Publicado');
      setSistemaPertencente(sistemasList[0]?.nome || 'SIGI ERP');
      setAutor('Suporte Técnico');
      setAnexos([]);
    }
    setError('');
    setEditorMode('edit');
  }, [editingArtigo, isOpen]);

  if (!isOpen) return null;

  // Insert formatting helper
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setConteudo((prev) => prev + `${prefix}${defaultText}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = conteudo;
    const selectedText = currentText.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);

    setConteudo(newText);

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

  const handleInsertSmbImage = (item: typeof mockSmbImages[0]) => {
    const markdown = `\n\n![${item.nome}](${item.previewUrl})\n*📁 Repositório SMB: \`${item.caminhoSmb}\`*\n\n`;
    insertFormatting(markdown, '', '');
    setIsSmbModalOpen(false);
    if (onShowToast) {
      onShowToast('Imagem SMB Inserida', `A imagem ${item.nome} foi vinculada ao artigo.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('O título do artigo é obrigatório.');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const artigoToSave: ArtigoKBItem = {
      id: editingArtigo?.id || `art-${Date.now()}`,
      codigo: codigo || `#ART-${Math.floor(1000 + Math.random() * 9000)}`,
      titulo: titulo.trim(),
      categoria,
      conteudo: conteudo.trim() || 'Sem conteúdo.',
      tags: tagsArray,
      status,
      dataCriacao: editingArtigo?.dataCriacao || new Date().toLocaleDateString('pt-BR'),
      ultimaAtualizacao: new Date().toLocaleDateString('pt-BR'),
      autor: autor.trim() || 'Suporte Técnico',
      sistemaPertencente: sistemaPertencente || undefined,
      visualizacoes: editingArtigo?.visualizacoes || 0,
      anexos
    };

    onSave(artigoToSave);
    if (onShowToast) {
      onShowToast(
        editingArtigo ? 'Artigo Atualizado' : 'Novo Artigo Publicado',
        `"${artigoToSave.titulo}" salvo com sucesso.`
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingArtigo ? 'Editar Artigo de Conhecimento' : 'Novo Artigo de Conhecimento'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Editor completo da Base de Conhecimento com formatação rica e integração SMB.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Meta Fields */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Tag className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Título & Categorização
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={codigo}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-extrabold text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Artigo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Como configurar Certificado Digital A1 no TEF / NFC-e"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {categoriaOptions.length > 0 ? (
                    categoriaOptions.map((opt: any) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Fiscal / Tributário">Fiscal / Tributário</option>
                      <option value="Instalação / Configuração">Instalação / Configuração</option>
                      <option value="Suporte Técnico">Suporte Técnico</option>
                      <option value="Procedimento Operacional">Procedimento Operacional</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sistema Pertencente
                </label>
                <select
                  value={sistemaPertencente}
                  onChange={(e) => setSistemaPertencente(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">Geral</option>
                  {sistemasList.map((s: any) => (
                    <option key={s.id} value={s.nome}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {statusOptions.length > 0 ? (
                    statusOptions.map((opt: any) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Publicado">Publicado</option>
                      <option value="Rascunho">Rascunho</option>
                      <option value="Arquivado">Arquivado</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="certificado, nfce, a1, tef, friburgo"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Autor / Responsável
                </label>
                <select
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">Selecione...</option>
                  {systemUsers.map((u) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content Editor Section with Workspace Toolbar & Mode Switcher */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Conteúdo do Artigo & Editor de Texto
              </h4>

              {/* View Mode Tabs (Editor | Visualização | Dividido) */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditorMode('edit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    editorMode === 'edit'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    editorMode === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Visualização</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('split')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    editorMode === 'split'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Split className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Dividido</span>
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            {editorMode !== 'preview' && (
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**', 'negrito')}
                  title="Negrito"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*', 'itálico')}
                  title="Itálico"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Italic className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

                <button
                  type="button"
                  onClick={() => insertFormatting('# ', '', 'Título 1')}
                  title="Título 1"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('## ', '', 'Título 2')}
                  title="Título 2"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('### ', '', 'Título 3')}
                  title="Título 3"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Heading3 className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

                <button
                  type="button"
                  onClick={() => insertFormatting('- ', '', 'Item de lista')}
                  title="Lista com Marcadores"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('1. ', '', 'Item numerado')}
                  title="Lista Numerada"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

                <button
                  type="button"
                  onClick={() => insertFormatting('| Coluna 1 | Coluna 2 |\n|---|---|\n| Dado 1 | Dado 2 |', '', '')}
                  title="Inserir Tabela"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Table className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('```bash\n', '\n```', 'sudo systemctl restart postgresql')}
                  title="Bloco de Código"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('> Destaque importante: ', '', '')}
                  title="Citação / Destaque"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSmbModalOpen(true)}
                  title="Inserir Imagem do Servidor SMB"
                  className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Inserir Imagem SMB</span>
                </button>
              </div>
            )}

            {/* Editor & Preview Area */}
            <div className={`grid gap-3 ${editorMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {(editorMode === 'edit' || editorMode === 'split') && (
                <div>
                  <textarea
                    ref={textareaRef}
                    rows={12}
                    onPaste={handlePaste}
                    placeholder="Escreva as instruções passo a passo do procedimento... (Cole prints de tela diretamente com Ctrl+V)"
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed shadow-inner"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <span>💡 Dica: Você pode colar imagens (print screens) diretamente com Ctrl+V no campo acima.</span>
                  </p>
                </div>
              )}

              {(editorMode === 'preview' || editorMode === 'split') && (
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-y-auto max-h-[350px]">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 mb-2 pb-1 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span>👁️ Pré-visualização ao Vivo</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">Renderização Markdown</span>
                  </div>
                  <DocumentPreviewRenderer content={conteudo} />
                </div>
              )}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs">
            <AttachmentSection
              anexos={anexos}
              onChangeAnexos={setAnexos}
              entityPrefix="ART"
              onShowToast={onShowToast}
            />
          </div>
        </form>

        {/* SMB Image Selection Modal inside Drawer */}
        {isSmbModalOpen && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Selecionar Imagem do Servidor SMB</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSmbModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {mockSmbImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => handleInsertSmbImage(img)}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer transition-all"
                  >
                    <img src={img.previewUrl} alt={img.nome} className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{img.nome}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{img.caminhoSmb}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-bold rounded">
                        {img.categoria}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSmbModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Artigo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
