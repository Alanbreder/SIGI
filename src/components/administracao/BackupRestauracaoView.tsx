import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  HardDrive,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderSync,
  Server,
  Users,
  Briefcase,
  FileText,
  Package,
  BookOpen,
  Sliders,
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  SigiBackupData,
  SystemTablesData,
  UserAccount,
  Cliente,
  AtendimentoItem,
  AtendimentoFixoItem,
  RegistroItem,
  ArtigoKBItem,
  SistemaItem,
  SmbConfig,
  SystemOptionsConfig
} from '../../types';

interface BackupRestauracaoViewProps {
  systemTables: SystemTablesData;
  users: UserAccount[];
  clients: Cliente[];
  atendimentos: AtendimentoItem[];
  atendimentosFixos: AtendimentoFixoItem[];
  registros: RegistroItem[];
  artigos: ArtigoKBItem[];
  sistemas: SistemaItem[];
  smbConfig: SmbConfig;
  systemOptions?: SystemOptionsConfig;
  onRestoreBackup: (backup: SigiBackupData) => void;
  onSystemReset?: () => void;
  onShowToast?: (title: string, message: string) => void;
}

export const BackupRestauracaoView: React.FC<BackupRestauracaoViewProps> = ({
  systemTables,
  users,
  clients,
  atendimentos,
  atendimentosFixos,
  registros,
  artigos,
  sistemas,
  smbConfig,
  systemOptions,
  onRestoreBackup,
  onSystemReset,
  onShowToast
}) => {
  // Export State
  const [includeFiles, setIncludeFiles] = useState(true);

  // Import / Restore State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<SigiBackupData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Path Remapping State
  const [findSmbHost, setFindSmbHost] = useState('');
  const [replaceSmbHost, setReplaceSmbHost] = useState('');
  const [editableSmbConfig, setEditableSmbConfig] = useState<SmbConfig | null>(null);
  const [remappedCount, setRemappedCount] = useState<number>(0);
  const [isAppliedReplace, setIsAppliedReplace] = useState(false);

  // Step indicator: 1 = File Upload, 2 = Path Remap & Preview, 3 = Confirmation
  const [importStep, setImportStep] = useState<1 | 2>(1);

  // Deletion Confirmation State
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetConfirmCode, setResetConfirmCode] = useState('');
  const REQUIRED_RESET_CODE = 'LIMPAR-DADOS-TRANSACIONAIS';

  // Handle Export Download
  const handleExportBackup = () => {
    const backupData: SigiBackupData = {
      version: '2.5.0',
      systemName: 'SIP - Sistema de Inteligência do Cliente',
      timestamp: new Date().toISOString(),
      systemTables,
      users,
      clients,
      atendimentos,
      atendimentosFixos,
      registros,
      artigos,
      sistemas,
      smbConfig,
      systemOptions
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `sigi_backup_completo_${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast(
        'Backup Exportado!',
        `Arquivo ${fileName} gerado com sucesso contendo todos os registros e caminhos SMB.`
      );
    }
  };

  // Handle File Upload and Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content) as SigiBackupData;

        if (!data.timestamp || (!data.clients && !data.atendimentos && !data.atendimentosFixos)) {
          throw new Error('Formato de backup inválido ou incompatível com o SIGI.');
        }

        // Ensure default smbConfig folders exist if missing
        let bkpSmbConfig: SmbConfig = data.smbConfig
          ? JSON.parse(JSON.stringify(data.smbConfig))
          : JSON.parse(JSON.stringify(smbConfig));

        if (!bkpSmbConfig.pastas || bkpSmbConfig.pastas.length === 0) {
          bkpSmbConfig.pastas = JSON.parse(JSON.stringify(smbConfig.pastas || []));
        }

        // Ensure atendimentos_fixos folder is present
        const hasFixosFolder = bkpSmbConfig.pastas.some((f) => f.key === 'atendimentos_fixos');
        if (!hasFixosFolder) {
          const host = bkpSmbConfig.servidorHost || '\\\\NAS-SERVER\\SIGI-Anexos';
          bkpSmbConfig.pastas.push({
            id: 'smb-f6',
            setor: 'Atendimentos Fixos & Manutenção Preventiva',
            key: 'atendimentos_fixos',
            caminhoSmb: `${host}\\atendimentos_fixos`,
            descricao: 'Fotos de manutenção, ordens de serviço e fotos de equipamentos de clientes fixos.'
          });
        }

        data.smbConfig = bkpSmbConfig;

        setParsedBackup(data);
        setEditableSmbConfig(bkpSmbConfig);
        setFindSmbHost(bkpSmbConfig.servidorHost || '\\\\NAS-SERVER');
        setReplaceSmbHost(smbConfig.servidorHost || '\\\\PROXMOX-NAS');

        setImportStep(2);
        if (onShowToast) {
          onShowToast('Arquivo Carregado', `Backup lido com sucesso. Verifique os caminhos SMB por sessão.`);
        }
      } catch (err: any) {
        setParseError(err.message || 'Erro ao processar o arquivo JSON de backup.');
        setParsedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  // Update Individual Folder UNC Path
  const handleFolderUncChange = (folderKey: string, newPath: string) => {
    if (!parsedBackup || !editableSmbConfig) return;

    const oldFolder = editableSmbConfig.pastas.find((f) => f.key === folderKey);
    const oldPath = oldFolder?.caminhoSmb || '';

    // Update editableSmbConfig
    const updatedFolders = editableSmbConfig.pastas.map((f) => {
      if (f.key === folderKey) {
        return { ...f, caminhoSmb: newPath };
      }
      return f;
    });

    const newSmbConfig: SmbConfig = {
      ...editableSmbConfig,
      pastas: updatedFolders
    };
    setEditableSmbConfig(newSmbConfig);

    // Deep copy backup and update paths
    const updatedData: SigiBackupData = JSON.parse(JSON.stringify(parsedBackup));
    updatedData.smbConfig = newSmbConfig;

    if (oldPath && oldPath !== newPath) {
      if (folderKey === 'atendimentos_fixos' && updatedData.atendimentosFixos) {
        updatedData.atendimentosFixos = updatedData.atendimentosFixos.map((item) => {
          if (item.anexos) {
            item.anexos = item.anexos.map((anx) => {
              if (anx.caminhoArmazenamento && anx.caminhoArmazenamento.includes(oldPath)) {
                return { ...anx, caminhoArmazenamento: anx.caminhoArmazenamento.replace(oldPath, newPath) };
              }
              return anx;
            });
          }
          return item;
        });
      } else if (folderKey === 'atendimentos' && updatedData.atendimentos) {
        updatedData.atendimentos = updatedData.atendimentos.map((item) => {
          if (item.anexos) {
            item.anexos = item.anexos.map((anx) => {
              if (anx.caminhoArmazenamento && anx.caminhoArmazenamento.includes(oldPath)) {
                return { ...anx, caminhoArmazenamento: anx.caminhoArmazenamento.replace(oldPath, newPath) };
              }
              return anx;
            });
          }
          return item;
        });
      } else if (folderKey === 'artigos' && updatedData.artigos) {
        updatedData.artigos = updatedData.artigos.map((item) => {
          if (item.anexos) {
            item.anexos = item.anexos.map((anx) => {
              if (anx.caminhoArmazenamento && anx.caminhoArmazenamento.includes(oldPath)) {
                return { ...anx, caminhoArmazenamento: anx.caminhoArmazenamento.replace(oldPath, newPath) };
              }
              return anx;
            });
          }
          return item;
        });
      } else if (folderKey === 'registros' && updatedData.registros) {
        updatedData.registros = updatedData.registros.map((item) => {
          if (item.anexos) {
            item.anexos = item.anexos.map((anx) => {
              if (anx.caminhoArmazenamento && anx.caminhoArmazenamento.includes(oldPath)) {
                return { ...anx, caminhoArmazenamento: anx.caminhoArmazenamento.replace(oldPath, newPath) };
              }
              return anx;
            });
          }
          return item;
        });
      }
    }

    setParsedBackup(updatedData);
  };

  // Replace SMB Host Paths in Bulk
  const handleApplyPathReplacement = () => {
    if (!parsedBackup || !findSmbHost.trim() || !replaceSmbHost.trim()) return;

    const oldStr = findSmbHost.trim();
    const newStr = replaceSmbHost.trim();
    let count = 0;

    // Deep clone backup
    const updatedData: SigiBackupData = JSON.parse(JSON.stringify(parsedBackup));

    // 1. Remap smbConfig
    if (updatedData.smbConfig) {
      if (updatedData.smbConfig.servidorHost.includes(oldStr)) {
        updatedData.smbConfig.servidorHost = updatedData.smbConfig.servidorHost.replace(oldStr, newStr);
        count++;
      }
      updatedData.smbConfig.pastas = updatedData.smbConfig.pastas.map((folder) => {
        if (folder.caminhoSmb.includes(oldStr)) {
          count++;
          return { ...folder, caminhoSmb: folder.caminhoSmb.replace(oldStr, newStr) };
        }
        return folder;
      });
      setEditableSmbConfig(updatedData.smbConfig);
    }

    // 2. Remap anexos in Atendimentos
    if (updatedData.atendimentos) {
      updatedData.atendimentos = updatedData.atendimentos.map((atd) => {
        if (atd.anexos) {
          const newAnexos = atd.anexos.map((anx) => {
            if (anx.caminhoArmazenamento && anx.caminhoArmazenamento.includes(oldStr)) {
              count++;
              return { ...anx, caminhoArmazenamento: anx.caminhoArmazenamento.replace(oldStr, newStr) };
            }
            return anx;
          });
          return { ...atd, anexos: newAnexos };
        }
        return atd;
      });
    }

    // 3. Remap anexos in Atendimentos Fixos
    if (updatedData.atendimentosFixos) {
      updatedData.atendimentosFixos = updatedData.atendimentosFixos.map((atdf) => {
        if (atdf.anexos) {
          const newAnexos = atdf.anexos.map((anx) => {
            if (anx.caminhoArmazenamento && anx.caminhoArmazenamento.includes(oldStr)) {
              count++;
              return { ...anx, caminhoArmazenamento: anx.caminhoArmazenamento.replace(oldStr, newStr) };
            }
            return anx;
          });
          return { ...atdf, anexos: newAnexos };
        }
        return atdf;
      });
    }

    // 4. Remap anexos in Artigos
    if (updatedData.artigos) {
      updatedData.artigos = updatedData.artigos.map((art) => {
        if (art.anexos) {
          const newAnexos = art.anexos.map((anx) => {
            if (anx.caminhoArmazenamento && anx.caminhoArmazenamento.includes(oldStr)) {
              count++;
              return { ...anx, caminhoArmazenamento: anx.caminhoArmazenamento.replace(oldStr, newStr) };
            }
            return anx;
          });
          return { ...art, anexos: newAnexos };
        }
        return art;
      });
    }

    // 5. Remap anexos in Registros
    if (updatedData.registros) {
      updatedData.registros = updatedData.registros.map((reg) => {
        if (reg.anexos) {
          const newAnexos = reg.anexos.map((anx) => {
            if (anx.caminhoArmazenamento && anx.caminhoArmazenamento.includes(oldStr)) {
              count++;
              return { ...anx, caminhoArmazenamento: anx.caminhoArmazenamento.replace(oldStr, newStr) };
            }
            return anx;
          });
          return { ...reg, anexos: newAnexos };
        }
        return reg;
      });
    }

    setParsedBackup(updatedData);
    setRemappedCount(count);
    setIsAppliedReplace(true);

    if (onShowToast) {
      onShowToast(
        'Caminhos Re-mapeados',
        `Substituição concluída! ${count} ocorrência(s) de "${oldStr}" alteradas para "${newStr}".`
      );
    }
  };

  // Final Confirmation Restore
  const handleConfirmRestore = () => {
    if (!parsedBackup) return;

    onRestoreBackup(parsedBackup);

    if (onShowToast) {
      onShowToast(
        'Restauração Concluída com Sucesso!',
        'Todos os dados, tabelas e caminhos SMB foram restaurados e sincronizados.'
      );
    }

    // Reset state
    setParsedBackup(null);
    setSelectedFile(null);
    setImportStep(1);
    setIsAppliedReplace(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 shadow-2xs shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Backup e Restauração de Dados do Sistema
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider">
                Export / Import SMB
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exporte backups completos JSON e restaure com re-mapeamento inteligente de caminhos NAS / SMB de rede.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: EXPORTAR BACKUP */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-500" />
                1. Exportar Backup Completo (JSON)
              </h4>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold rounded-md text-[10px]">
                Pronto para Download
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O backup exportado inclui todos os clientes, chamados, atendimentos fixos de manutenção, artigos da base de conhecimento, registros, usuários, tabelas do sistema e os **caminhos de armazenamento de anexos SMB**.
            </p>

            {/* Current System Counts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clientes</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{clients.length}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Atendimentos</span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{atendimentos.length}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Atend. Fixos</span>
                <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{atendimentosFixos.length}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Artigos KB</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{artigos.length}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                <span>Servidor SMB Atual no Backup:</span>
              </div>
              <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 truncate">
                {smbConfig.servidorHost} (Share: \{smbConfig.servidorHost}\SIGI-Anexos)
              </p>
            </div>
          </div>

          <button
            onClick={handleExportBackup}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Gerar e Baixar Backup Completo (.JSON)</span>
          </button>
        </div>

        {/* CARD 2: IMPORTAR BACKUP & RE-MAPEAR CAMINHOS SMB */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" />
                2. Importação e Restauração com Ajuste SMB
              </h4>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold rounded-md text-[10px]">
                Passo {importStep} de 2
              </span>
            </div>

            {importStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Selecione um arquivo de backup <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-indigo-600 dark:text-indigo-400">.json</code> do SIGI. Na próxima etapa, você poderá alterar os caminhos do servidor SMB/NAS caso o IP ou nome do servidor de rede tenha mudado!
                </p>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors">
                  <FileJson className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                  <label htmlFor="backupFileInput" className="cursor-pointer block">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                      Clique para selecionar o arquivo JSON
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      Arquivos gerados pelo SIGI Backup (.json)
                    </span>
                  </label>
                  <input
                    id="backupFileInput"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {parseError && (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{parseError}</span>
                  </div>
                )}
              </div>
            )}

            {importStep === 2 && parsedBackup && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Arquivo Lido: {selectedFile?.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold">
                    {new Date(parsedBackup.timestamp).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Sub-section 1: Path Remapping Tool (Bulk Host Replace) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <FolderSync className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      1. Substituição Global em Massa de Servidor SMB Host
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Se o seu novo servidor Proxmox/NAS possui outro IP ou nome, substitua o endereço de host antigo pelo novo em todos os caminhos de uma só vez:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                        Caminho / Host Antigo no Backup
                      </label>
                      <input
                        type="text"
                        value={findSmbHost}
                        onChange={(e) => setFindSmbHost(e.target.value)}
                        placeholder="\\\\NAS-SERVER"
                        className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                        Novo Servidor / Host Proxmox
                      </label>
                      <input
                        type="text"
                        value={replaceSmbHost}
                        onChange={(e) => setReplaceSmbHost(e.target.value)}
                        placeholder="\\\\PROXMOX-NAS"
                        className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleApplyPathReplacement}
                    disabled={!findSmbHost.trim() || !replaceSmbHost.trim()}
                    className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Aplicar Substituição em Massa</span>
                  </button>

                  {isAppliedReplace && (
                    <div className="p-2.5 bg-indigo-100/70 dark:bg-indigo-950/60 rounded-xl text-[11px] font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{remappedCount} ocorrência(s) de caminho re-mapeadas no backup!</span>
                    </div>
                  )}
                </div>

                {/* Sub-section 2: Per-session Folder UNC Paths Editable List */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        2. Ajuste Individual dos Caminhos UNC por Sessão do Sistema
                      </h5>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                      Pastas Separadas
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Cada sessão possui sua pasta de rede SMB dedicada. Altere o caminho UNC de qualquer sessão individualmente caso estejam em discos ou compartilhamentos separados:
                  </p>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {editableSmbConfig?.pastas.map((folder) => (
                      <div
                        key={folder.id}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                            {folder.setor}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-slate-600 dark:text-slate-300">
                            Key: {folder.key}
                          </span>
                        </div>
                        {folder.descricao && (
                          <p className="text-[10px] text-slate-400 line-clamp-1">{folder.descricao}</p>
                        )}
                        <div>
                          <label className="block text-[9px] font-extrabold uppercase text-slate-400 mb-0.5">
                            Caminho de Rede SMB (UNC):
                          </label>
                          <input
                            type="text"
                            value={folder.caminhoSmb}
                            onChange={(e) => handleFolderUncChange(folder.key, e.target.value)}
                            placeholder="\\\\SERVIDOR\\compartilhamento\\pasta"
                            className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-indigo-600 dark:text-indigo-400 font-bold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Import Preview summary */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Resumo dos itens a restaurar:</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <strong>{parsedBackup.clients?.length || 0}</strong> Clientes
                    </div>
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <strong>{parsedBackup.atendimentos?.length || 0}</strong> Chamados
                    </div>
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <strong>{parsedBackup.atendimentosFixos?.length || 0}</strong> Atend. Fixos
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {importStep === 2 && parsedBackup && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setImportStep(1);
                  setParsedBackup(null);
                }}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Trocar Arquivo
              </button>
              <button
                onClick={handleConfirmRestore}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirmar e Restaurar Backup</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CARD 3: ZONA DE PERIGO - LIMPEZA DE DADOS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200/50 dark:border-rose-900/30 shadow-xs space-y-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200/50 dark:border-rose-800/50 shadow-2xs shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Zona de Perigo: Limpeza de Dados Transacionais
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Esta ação irá apagar permanentemente todos os Clientes, Atendimentos, Registros e Artigos, mantendo apenas as Tabelas do Sistema (ADM) e Usuários.
            </p>
          </div>
        </div>

        {!isResetConfirmOpen ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
            <div className="space-y-1">
              <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Deseja iniciar o sistema do zero?</p>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">Recomendamos exportar um backup antes de prosseguir.</p>
            </div>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Iniciar Limpeza
            </button>
          </div>
        ) : (
          <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-sm font-extrabold">Confirmação de Segurança Requerida</h4>
            </div>
            
            <p className="text-xs text-rose-700/80 dark:text-rose-300/80 leading-relaxed">
              Para evitar exclusão acidental, digite o código de confirmação abaixo. Esta ação <strong className="underline">não pode ser desfeita</strong>.
              <br />
              Código: <code className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded font-mono font-bold select-all">{REQUIRED_RESET_CODE}</code>
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={resetConfirmCode}
                onChange={(e) => setResetConfirmCode(e.target.value)}
                placeholder="Digite o código de confirmação aqui..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-xl text-sm font-bold text-rose-600 placeholder:text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsResetConfirmOpen(false);
                    setResetConfirmCode('');
                  }}
                  className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  disabled={resetConfirmCode !== REQUIRED_RESET_CODE}
                  onClick={() => {
                    if (onSystemReset) onSystemReset();
                    setIsResetConfirmOpen(false);
                    setResetConfirmCode('');
                  }}
                  className="flex-[2] py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 dark:disabled:bg-rose-900 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>APAGAR TUDO E REINICIAR SISTEMA</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
