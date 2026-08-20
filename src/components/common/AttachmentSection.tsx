import React, { useEffect } from 'react';
import { Paperclip, Copy, UploadCloud, Camera, FileCode, Trash2 } from 'lucide-react';
import { AnexoItem } from '../../types';

interface AttachmentSectionProps {
  anexos: AnexoItem[];
  onChangeAnexos: (anexos: AnexoItem[]) => void;
  entityPrefix?: string; // e.g. "ATD", "CLI", "REG", "FIX", "EQP", "ART", "VID"
  onShowToast?: (title: string, message: string) => void;
  compact?: boolean;
}

export const AttachmentSection: React.FC<AttachmentSectionProps> = ({
  anexos = [],
  onChangeAnexos,
  entityPrefix = 'ATD',
  onShowToast,
  compact = false
}) => {
  const processFile = (file: File, source: 'upload' | 'clipboard' = 'upload') => {
    const isImage = file.type.startsWith('image/') || Boolean(file.name.match(/\.(png|jpe?g|gif|webp|svg)$/i));
    const codeTmp = `#${entityPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fileName = file.name || `captura_tela_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.png`;

    const createAnexo = (previewUrl?: string) => {
      const newAnx: AnexoItem = {
        id: `anx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nome: fileName,
        tamanho: `${(file.size / 1024).toFixed(1)} KB`,
        tipo: isImage ? 'image' : fileName.split('.').pop() || 'documento',
        dataUpload: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        autor: 'Usuário Atual',
        caminhoArmazenamento: `\\\\NAS-SERVER\\SIGI-Anexos\\${entityPrefix.toLowerCase()}\\${codeTmp}\\${fileName}`,
        storageType: 'SMB / NAS',
        previewUrl
      };

      onChangeAnexos([newAnx, ...anexos]);
      if (onShowToast) {
        onShowToast(
          source === 'clipboard' ? 'Print Colado (Ctrl+V)' : 'Anexo Adicionado',
          `Arquivo "${fileName}" vinculado com sucesso.`
        );
      }
    };

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        createAnexo(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      createAnexo();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFile(files[0], 'upload');
    e.target.value = '';
  };

  // Global Paste event listener for Ctrl+V
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
            const renamedFile = new File([blob], `captura_tela_${dateStr}.${ext}`, { type: blob.type });
            processFile(renamedFile, 'clipboard');
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [anexos]);

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-indigo-500" />
              Anexos (Armazenamento SMB)
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-1 shadow-2xs">
              <Copy className="w-2.5 h-2.5 text-emerald-500" /> Suporta Ctrl+V (Cole seu Print)
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Arquivos serão salvos no servidor SMB. Pressione Ctrl+V em qualquer lugar para colar um print da tela.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Anexar Arquivo</span>
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
          <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <Camera className="w-3.5 h-3.5" />
            <span>Tirar Foto</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* List of Uploaded Attachments */}
      {anexos.length > 0 && (
        <div className={`grid grid-cols-1 ${compact ? '' : 'sm:grid-cols-2'} gap-2 pt-1`}>
          {anexos.map((file) => (
            <div
              key={file.id}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {file.previewUrl ? (
                    <img src={file.previewUrl} alt={file.nome} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <FileCode className="w-4 h-4 text-indigo-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{file.nome}</p>
                  <p className="text-[9px] text-slate-400 font-mono truncate">{file.tamanho} • SMB: {file.caminhoArmazenamento}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChangeAnexos(anexos.filter((a) => a.id !== file.id))}
                className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                title="Remover anexo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
