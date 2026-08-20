import React, { useState } from 'react';
import {
  Settings,
  Users,
  Sliders,
  Server,
  HardDrive,
  Database,
  Palette
} from 'lucide-react';
import {
  SystemTablesData,
  SystemTableKey,
  SystemTableItem,
  SystemOptionsConfig,
  UserAccount,
  SmbConfig,
  Cliente,
  AtendimentoItem,
  AtendimentoFixoItem,
  RegistroItem,
  ArtigoKBItem,
  SistemaItem,
  SigiBackupData,
  SystemCustomization,
  defaultCustomization
} from '../../types';
import { SystemTableMeta, SystemTableGroupMeta } from '../../data/mockSystemTables';
import { TabelasDoSistemaView } from './TabelasDoSistemaView';
import { UsuariosView } from './UsuariosView';
import { ProxmoxSupabaseGuide } from './ProxmoxSupabaseGuide';
import { SmbConfigView } from './SmbConfigView';
import { BackupRestauracaoView } from './BackupRestauracaoView';
import { CustomizacaoView } from './CustomizacaoView';

interface AdministracaoViewProps {
  systemTables: SystemTablesData;
  systemTableDefinitions: SystemTableMeta[];
  systemTableGroups: SystemTableGroupMeta[];
  onUpdateSystemTableDefinitions: (defs: SystemTableMeta[]) => void;
  onUpdateSystemTableGroups: (grps: SystemTableGroupMeta[]) => void;
  onUpdateSystemTableItem: (tableKey: SystemTableKey, item: SystemTableItem) => void;
  onAddSystemTableItem: (tableKey: SystemTableKey, item: SystemTableItem) => void;
  onDeleteSystemTableItem?: (tableKey: SystemTableKey, itemId: string) => void;
  systemOptions?: SystemOptionsConfig;
  onShowToast?: (title: string, message: string) => void;
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  smbConfig: SmbConfig;
  onUpdateSmbConfig: (config: SmbConfig) => void;
  clients: Cliente[];
  atendimentos: AtendimentoItem[];
  atendimentosFixos: AtendimentoFixoItem[];
  registros: RegistroItem[];
  artigos: ArtigoKBItem[];
  sistemas: SistemaItem[];
  onRestoreBackup: (backup: SigiBackupData) => void;
  onSystemReset?: () => void;
  customization?: SystemCustomization;
  onSaveCustomization?: (newConfig: SystemCustomization) => void;
}

type TabType = 'customizacao' | 'tabelas' | 'usuarios' | 'smb' | 'backup' | 'integracoes';

export const AdministracaoView: React.FC<AdministracaoViewProps> = ({
  systemTables,
  systemTableDefinitions,
  systemTableGroups,
  onUpdateSystemTableDefinitions,
  onUpdateSystemTableGroups,
  onUpdateSystemTableItem,
  onAddSystemTableItem,
  onDeleteSystemTableItem,
  onShowToast,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  smbConfig,
  onUpdateSmbConfig,
  clients,
  atendimentos,
  atendimentosFixos,
  registros,
  artigos,
  sistemas,
  systemOptions,
  onRestoreBackup,
  onSystemReset,
  customization = defaultCustomization,
  onSaveCustomization = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('customizacao');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 shadow-2xs">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Painel de Administração
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider">
                Apenas Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gestão de customização do sistema, tabelas, armazenamento SMB/NAS, usuários, backups e infraestrutura.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-start md:self-auto flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setActiveTab('customizacao')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'customizacao'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Customização</span>
          </button>

          <button
            onClick={() => setActiveTab('tabelas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'tabelas'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Tabelas do Sistema</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'usuarios'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários & Permissões</span>
          </button>

          <button
            onClick={() => setActiveTab('smb')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'smb'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>SMB / NAS</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('integracoes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'integracoes'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Proxmox</span>
          </button>
        </div>
      </div>

      {/* TAB 0: CUSTOMIZAÇÃO DO SISTEMA */}
      {activeTab === 'customizacao' && (
        <CustomizacaoView
          customization={customization}
          onSaveCustomization={onSaveCustomization}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB 1: TABELAS DO SISTEMA */}
      {activeTab === 'tabelas' && (
        <TabelasDoSistemaView
          systemTables={systemTables}
          systemTableDefinitions={systemTableDefinitions}
          systemTableGroups={systemTableGroups}
          onUpdateDefinitions={onUpdateSystemTableDefinitions}
          onUpdateGroups={onUpdateSystemTableGroups}
          onUpdateItem={onUpdateSystemTableItem}
          onAddItem={onAddSystemTableItem}
          onDeleteItem={onDeleteSystemTableItem}
          onShowToast={onShowToast}
          clients={clients}
          atendimentos={atendimentos}
          atendimentosFixos={atendimentosFixos}
          registros={registros}
          artigos={artigos}
        />
      )}

      {/* TAB 2: USUÁRIOS & PERMISSÕES */}
      {activeTab === 'usuarios' && (
        <UsuariosView
          users={users}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB 3: ARMAZENAMENTO SMB / NAS */}
      {activeTab === 'smb' && (
        <SmbConfigView
          smbConfig={smbConfig}
          onUpdateSmbConfig={onUpdateSmbConfig}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB 4: BACKUP E RESTAURACAO COM AJUSTE SMB */}
      {activeTab === 'backup' && (
        <BackupRestauracaoView
          systemTables={systemTables}
          users={users}
          clients={clients}
          atendimentos={atendimentos}
          atendimentosFixos={atendimentosFixos}
          registros={registros}
          artigos={artigos}
          sistemas={sistemas}
          smbConfig={smbConfig}
          systemOptions={systemOptions}
          onRestoreBackup={onRestoreBackup}
          onSystemReset={onSystemReset}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB 5: SERVIDOR & SUPABASE (PROXMOX GUIDE) */}
      {activeTab === 'integracoes' && (
        <ProxmoxSupabaseGuide onShowToast={onShowToast} />
      )}
    </div>
  );
};


