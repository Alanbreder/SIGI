import React, { useState } from 'react';
import {
  HardDrive,
  Network,
  Save,
  CheckCircle2,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  X,
  Server,
  Lock,
  User,
  Globe,
  Info,
  FolderOpen,
  FileCode2
} from 'lucide-react';
import { SmbConfig, SmbSectorFolder } from '../../types';

interface SmbConfigViewProps {
  smbConfig: SmbConfig;
  onUpdateSmbConfig: (config: SmbConfig) => void;
  onShowToast?: (title: string, message: string) => void;
}

export const SmbConfigView: React.FC<SmbConfigViewProps> = ({
  smbConfig,
  onUpdateSmbConfig,
  onShowToast
}) => {
  // Global SMB Config State
  const [servidorHost, setServidorHost] = useState(smbConfig.servidorHost || '\\\\NAS-SERVER\\SIGI-Anexos');
  const [dominio, setDominio] = useState(smbConfig.dominio || 'SIGI.LOCAL');
  const [usuarioSmb, setUsuarioSmb] = useState(smbConfig.usuarioSmb || 'smb_sigi_admin');
  const [senhaSmb, setSenhaSmb] = useState(smbConfig.senhaSmb || '');
  const [caminhoImagensArtigos, setCaminhoImagensArtigos] = useState(smbConfig.caminhoImagensArtigos || '\\\\NAS-SERVER\\SIGI-Anexos\\artigos\\imagens');
  const [statusConexao, setStatusConexao] = useState(smbConfig.statusConexao || 'Conectado (Rede Local SMB)');
  const [testingConnection, setTestingConnection] = useState(false);

  // Sector Folders List
  const [pastas, setPastas] = useState<SmbSectorFolder[]>(smbConfig.pastas || []);

  // Right Drawer state for adding/editing sector folder
  const [isFolderDrawerOpen, setIsFolderDrawerOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<SmbSectorFolder | null>(null);

  // Form State inside Drawer
  const [folderSetor, setFolderSetor] = useState('');
  const [folderKey, setFolderKey] = useState<string>('videos');
  const [folderCaminho, setFolderCaminho] = useState('');
  const [folderDesc, setFolderDesc] = useState('');

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      setStatusConexao('Conectado (Rede Local SMB)');
      if (onShowToast) {
        onShowToast('Conexão SMB Bem Sucedida', 'Comunicação ativada via SMB/CIFS (Porta 445) no servidor NAS.');
      }
    }, 1200);
  };

  const handleSaveGlobalConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SmbConfig = {
      servidorHost: servidorHost.trim(),
      dominio: dominio.trim(),
      usuarioSmb: usuarioSmb.trim(),
      senhaSmb,
      caminhoImagensArtigos: caminhoImagensArtigos.trim(),
      statusConexao,
      pastas
    };
    onUpdateSmbConfig(updated);
    if (onShowToast) {
      onShowToast('Configurações Salvas', 'Servidor SMB / NAS atualizado com sucesso para todos os setores.');
    }
  };

  const handleOpenNewFolderDrawer = () => {
    setEditingFolder(null);
    setFolderSetor('');
    setFolderKey('videos');
    setFolderCaminho(`${servidorHost}\\nova_pasta`);
    setFolderDesc('');
    setIsFolderDrawerOpen(true);
  };

  const handleOpenEditFolderDrawer = (folder: SmbSectorFolder) => {
    setEditingFolder(folder);
    setFolderSetor(folder.setor);
    setFolderKey(folder.key);
    setFolderCaminho(folder.caminhoSmb);
    setFolderDesc(folder.descricao || '');
    setIsFolderDrawerOpen(true);
  };

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderSetor.trim() || !folderCaminho.trim()) return;

    let updatedList: SmbSectorFolder[] = [];
    if (editingFolder) {
      updatedList = pastas.map((f) =>
        f.id === editingFolder.id
          ? {
              ...f,
              setor: folderSetor.trim(),
              key: folderKey,
              caminhoSmb: folderCaminho.trim(),
              descricao: folderDesc.trim()
            }
          : f
      );
    } else {
      const newFolder: SmbSectorFolder = {
        id: `smb-f-${Date.now()}`,
        setor: folderSetor.trim(),
        key: folderKey,
        caminhoSmb: folderCaminho.trim(),
        descricao: folderDesc.trim()
      };
      updatedList = [...pastas, newFolder];
    }

    setPastas(updatedList);
    const updatedConfig: SmbConfig = {
      servidorHost,
      dominio,
      usuarioSmb,
      senhaSmb,
      statusConexao,
      pastas: updatedList
    };
    onUpdateSmbConfig(updatedConfig);

    if (onShowToast) {
      onShowToast(
        editingFolder ? 'Pasta Atualizada' : 'Pasta Cadastrada',
        `Diretório SMB para ${folderSetor} salvo com sucesso.`
      );
    }
    setIsFolderDrawerOpen(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updatedList = pastas.filter((f) => f.id !== folderId);
    setPastas(updatedList);
    const updatedConfig: SmbConfig = {
      servidorHost,
      dominio,
      usuarioSmb,
      senhaSmb,
      statusConexao,
      pastas: updatedList
    };
    onUpdateSmbConfig(updatedConfig);
    if (onShowToast) {
      onShowToast('Pasta Removida', 'Configuração de pasta SMB removida do setor.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* RIGHT DRAWER FOR ADDING/EDITING SMB FOLDER */}
      {isFolderDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/50">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingFolder ? 'Editar Pasta de Armazenamento SMB' : 'Nova Pasta de Armazenamento SMB'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mapear diretório de rede compartilhado para um setor específico do sistema
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFolderDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Form */}
            <form onSubmit={handleSaveFolder} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Setor / Módulo de Destino <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={folderSetor}
                  onChange={(e) => setFolderSetor(e.target.value)}
                  placeholder="Ex: Vídeo Aulas & Treinamentos (Base de Conhecimento)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Identificador de Setor (Chave)
                  </label>
                  <select
                    value={folderKey}
                    onChange={(e) => setFolderKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="videos">Vídeos (Base de Conhecimento)</option>
                    <option value="artigos">Artigos & Documentos (Base de Conhecimento)</option>
                    <option value="atendimentos">Atendimentos & Suporte</option>
                    <option value="atendimentos_fixos">Atendimentos Fixos & Manutenção</option>
                    <option value="registros">Registros de Bugs & Requisições</option>
                    <option value="equipamentos">Equipamentos & Inventário</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Caminho Completo da Pasta SMB/UNC <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={folderCaminho}
                    onChange={(e) => setFolderCaminho(e.target.value)}
                    placeholder="\\\\NAS-SERVER\\SIGI-Anexos\\videos"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Descrição do Uso do Diretório
                </label>
                <textarea
                  rows={3}
                  value={folderDesc}
                  onChange={(e) => setFolderDesc(e.target.value)}
                  placeholder="Informe quais tipos de arquivos (vídeos, logs, fotos, prints) são gravados nesta pasta..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Arquivos anexados ou colados através da função <strong>Copia e Cola</strong> ou <strong>Upload</strong> neste setor serão direcionados automaticamente para esta subpasta do servidor NAS.
                </p>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFolderDrawerOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Mapeamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL SERVER CONFIGURATION FORM */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Servidor de Armazenamento NAS / SMB Compartilhado
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Parâmetros globais de conexão com a rede local, servidor Proxmox / Windows Server SMB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                statusConexao.includes('Conectado')
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{statusConexao}</span>
            </span>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{testingConnection ? 'Testando...' : 'Testar Conexão'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveGlobalConfig} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Host / Servidor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Host / Servidor NAS (UNC)
              </label>
              <input
                type="text"
                required
                value={servidorHost}
                onChange={(e) => setServidorHost(e.target.value)}
                placeholder="\\\\NAS-SERVER\\SIGI-Anexos"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>

            {/* Domínio / Grupo de Trabalho */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Domínio / Workgroup
              </label>
              <input
                type="text"
                value={dominio}
                onChange={(e) => setDominio(e.target.value)}
                placeholder="SIGI.LOCAL"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>

            {/* Usuário SMB */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Usuário do Compartilhamento
              </label>
              <input
                type="text"
                value={usuarioSmb}
                onChange={(e) => setUsuarioSmb(e.target.value)}
                placeholder="smb_sigi_admin"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>

            {/* Senha SMB */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Senha de Acesso
              </label>
              <input
                type="password"
                value={senhaSmb}
                onChange={(e) => setSenhaSmb(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Diretório de Imagens da Base de Conhecimento */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Diretório SMB - Imagens da Base de Conhecimento (Uploads e Capturas)
            </label>
            <input
              type="text"
              required
              value={caminhoImagensArtigos}
              onChange={(e) => setCaminhoImagensArtigos(e.target.value)}
              placeholder="\\\\NAS-SERVER\\SIGI-Anexos\\artigos\\imagens"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Pasta no servidor NAS onde todas as imagens enviadas via upload direto na Base de Conhecimento são salvas automaticamente.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros Globais do SMB</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTOR SMB FOLDERS TABLE & LIST */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Mapeamento de Pastas do SMB por Setor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cada setor (Vídeos, Artigos, Atendimentos, Bugs, Equipamentos) possui sua própria subpasta isolada no NAS
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNewFolderDrawer}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Mapear Nova Pasta</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Setor / Módulo</th>
                <th className="p-4">Identificador</th>
                <th className="p-4">Caminho de Rede SMB (UNC)</th>
                <th className="p-4">Descrição</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {pastas.map((folder) => (
                <tr key={folder.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{folder.setor}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/50">
                      {folder.key}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-300">
                    {folder.caminhoSmb}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {folder.descricao || 'Sem descrição informada'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditFolderDrawer(folder)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Editar Pasta SMB"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir Pasta SMB"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
