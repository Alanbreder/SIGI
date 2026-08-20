import React, { useState, useEffect, useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { SideBar } from './components/SideBar';
import { Breadcrumb } from './components/Breadcrumb';
import { DashboardView } from './components/DashboardView';
import { ClientesView } from './components/clientes/ClientesView';
import { AtendimentosView } from './components/atendimentos/AtendimentosView';
import { AtendimentoWorkspace } from './components/atendimentos/AtendimentoWorkspace';
import { AtendimentosFixosView } from './components/atendimentos_fixos/AtendimentosFixosView';
import { RegistrosView } from './components/registros/RegistrosView';
import { ModulePlaceholder } from './components/ModulePlaceholder';
import { AdministracaoView } from './components/administracao/AdministracaoView';
import { KnowledgeBaseView } from './components/conhecimento/KnowledgeBaseView';
import { MonitorSefazView } from './components/monitor/MonitorSefazView';
import { ConsultaFiscalView } from './components/fiscal/ConsultaFiscalView';
import { SistemasModulosView } from './components/modulos/SistemasModulosView';
import { RelatoriosView } from './components/relatorios/RelatoriosView';
import { LoginView } from './components/auth/LoginView';
import { QuickActionModal, QuickActionType } from './components/QuickActionModal';
import { QuickViewModal, QuickViewEntityType } from './components/common/QuickViewModal';
import { ModuleType, User, UserRole, UserAccount, RecentActivity, DashboardStats, Cliente, AtendimentoItem, AtendimentoFixoItem, RegistroItem, ArtigoKBItem, SistemaItem, ModuloItem, SystemTableKey, SystemTableItem, SystemTablesData, SystemOptionsConfig, SmbConfig, SigiBackupData, EquipamentoItem, SystemCustomization, defaultCustomization } from './types';
import { initialClients } from './data/mockClients';
import { initialAtendimentos } from './data/mockAtendimentos';
import { initialAtendimentosFixos } from './data/mockAtendimentosFixos';
import { initialRegistros } from './data/mockRegistros';
import { initialArtigos } from './data/mockArtigos';
import { initialSistemas } from './data/mockSistemas';
import { initialSystemOptions } from './data/defaultOptions';
import { initialSmbConfig } from './data/defaultSmbConfig';
import { initialUsers } from './data/mockUsers';
import { systemTableDefinitions as initialDefinitions, systemTableGroups as initialGroups, initialSystemTables, SystemTableMeta, SystemTableGroupMeta } from './data/mockSystemTables';
import { Info, X } from 'lucide-react';

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours} h`;
  if (diffDays === 1) return 'Ontem';
  return `Há ${diffDays} dias`;
}

import {
  fetchClientes,
  saveCliente,
  deleteCliente,
  fetchAtendimentos,
  saveAtendimento,
  deleteAtendimento,
  fetchRegistros,
  saveRegistro,
  fetchArtigos,
  saveArtigo,
  deleteArtigo,
  fetchAtendimentosFixos,
  saveAtendimentoFixo,
  deleteAtendimentoFixo,
  fetchSistemas,
  saveSistema,
  fetchSystemTables,
  saveSystemTables,
  clearTransactionalData
} from './lib/supabaseService';

export function App() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [clients, setClients] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('sip_clients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((c: any) => {
            if (c.classificacao === 'VIP / Prioritário') {
              return { ...c, classificacao: 'Padrão' };
            }
            return c;
          });
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse sip_clients', e);
      }
    }
    return initialClients;
  });

  const [atendimentos, setAtendimentos] = useState<AtendimentoItem[]>(() => {
    const saved = localStorage.getItem('sip_atendimentos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sip_atendimentos', e);
      }
    }
    return initialAtendimentos;
  });

  const [atendimentosFixos, setAtendimentosFixos] = useState<AtendimentoFixoItem[]>(() => {
    const saved = localStorage.getItem('sip_atendimentos_fixos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sip_atendimentos_fixos', e);
      }
    }
    return initialAtendimentosFixos;
  });

  const [registros, setRegistros] = useState<RegistroItem[]>(() => {
    const saved = localStorage.getItem('sip_registros');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sip_registros', e);
      }
    }
    return initialRegistros;
  });

  const [artigos, setArtigos] = useState<ArtigoKBItem[]>(() => {
    const saved = localStorage.getItem('sip_artigos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sip_artigos', e);
      }
    }
    return initialArtigos;
  });

  const [sistemas, setSistemas] = useState<SistemaItem[]>(() => {
    const saved = localStorage.getItem('sip_sistemas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sip_sistemas', e);
      }
    }
    return initialSistemas;
  });

  const [customization, setCustomization] = useState<SystemCustomization>(() => {
    const saved = localStorage.getItem('sip_customization');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sip_customization', e);
      }
    }
    return defaultCustomization;
  });

  const handleUpdateCustomization = (newConfig: SystemCustomization) => {
    setCustomization(newConfig);
    localStorage.setItem('sip_customization', JSON.stringify(newConfig));
  };

  // Carregamento inicial assíncrono sincronizado com o Supabase (Cloud ou Proxmox)
  useEffect(() => {
    async function initSupabaseSync() {
      try {
        const [
          fetchedClients,
          fetchedAtend,
          fetchedReg,
          fetchedArt,
          fetchedFixos,
          fetchedSis,
          fetchedTables
        ] = await Promise.all([
          fetchClientes(initialClients),
          fetchAtendimentos(initialAtendimentos),
          fetchRegistros(initialRegistros),
          fetchArtigos(initialArtigos),
          fetchAtendimentosFixos(initialAtendimentosFixos),
          fetchSistemas(initialSistemas),
          fetchSystemTables(initialSystemTables)
        ]);

        if (fetchedClients && fetchedClients.length > 0) {
          const sanitized = fetchedClients.map((c: any) => {
            if (c.classificacao === 'VIP / Prioritário') {
              return { ...c, classificacao: 'Padrão' };
            }
            return c;
          });
          setClients(sanitized);
        }
        if (fetchedAtend) setAtendimentos(fetchedAtend);
        if (fetchedReg) setRegistros(fetchedReg);
        if (fetchedArt) setArtigos(fetchedArt);
        if (fetchedFixos) setAtendimentosFixos(fetchedFixos);
        if (fetchedSis) setSistemas(fetchedSis);
        if (fetchedTables) setSystemTables(fetchedTables);
      } catch (e) {
        console.warn('[SIGI Init] Falha ao sincronizar com Supabase no arranque:', e);
      }
    }
    initSupabaseSync();
  }, []);

  // Auto-persist main collections to localStorage as fallback cache
  useEffect(() => {
    localStorage.setItem('sip_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('sip_atendimentos', JSON.stringify(atendimentos));
  }, [atendimentos]);

  useEffect(() => {
    localStorage.setItem('sip_registros', JSON.stringify(registros));
  }, [registros]);

  useEffect(() => {
    localStorage.setItem('sip_artigos', JSON.stringify(artigos));
  }, [artigos]);

  useEffect(() => {
    localStorage.setItem('sip_sistemas', JSON.stringify(sistemas));
  }, [sistemas]);
  const [selectedAtendimentoWorkspace, setSelectedAtendimentoWorkspace] = useState<AtendimentoItem | null>(null);
  const [selectedRegistroWorkspace, setSelectedRegistroWorkspace] = useState<RegistroItem | null>(null);
  const [selectedArtigoWorkspace, setSelectedArtigoWorkspace] = useState<ArtigoKBItem | null>(null);
  const [selectedModuloWorkspace, setSelectedModuloWorkspace] = useState<ModuloItem | null>(null);

  // States for cross-module navigation with specific entity selection
  const [initialClientForWorkspace, setInitialClientForWorkspace] = useState<Cliente | null>(null);
  const [initialEquipmentForWorkspace, setInitialEquipmentForWorkspace] = useState<EquipamentoItem | null>(null);
  const [quickViewEntity, setQuickViewEntity] = useState<{
    type: QuickViewEntityType;
    data: any;
  } | null>(null);

  const handleAddAtendimentoFixo = (newAtend: AtendimentoFixoItem) => {
    setAtendimentosFixos((prev) => {
      const updated = [newAtend, ...prev];
      localStorage.setItem('sip_atendimentos_fixos', JSON.stringify(updated));
      return updated;
    });
    saveAtendimentoFixo(newAtend);
  };

  const handleUpdateAtendimentoFixo = (updated: AtendimentoFixoItem) => {
    setAtendimentosFixos((prev) => {
      const list = prev.map((a) => (a.id === updated.id ? updated : a));
      localStorage.setItem('sip_atendimentos_fixos', JSON.stringify(list));
      return list;
    });
    saveAtendimentoFixo(updated);
  };

  const handleDeleteAtendimentoFixo = (id: string) => {
    setAtendimentosFixos((prev) => {
      const list = prev.filter((a) => a.id !== id);
      localStorage.setItem('sip_atendimentos_fixos', JSON.stringify(list));
      return list;
    });
    deleteAtendimentoFixo(id);
  };

  const handleSystemReset = async () => {
    try {
      await clearTransactionalData();
      
      // Update local states to empty
      setClients([]);
      setAtendimentos([]);
      setAtendimentosFixos([]);
      setRegistros([]);
      setArtigos([]);
      
      showToast(
        'Sistema Reiniciado',
        'Todos os dados transacionais foram apagados. As tabelas do sistema e usuários foram preservados.'
      );
      
      // Redirect to dashboard if in a module that uses transactional data
      setCurrentModule('dashboard');
    } catch (e) {
      console.error('Erro ao resetar sistema:', e);
      showToast('Erro', 'Ocorreu uma falha ao tentar resetar os dados do sistema.');
    }
  };

  // SMB / NAS Storage Configuration State
  const [smbConfig, setSmbConfig] = useState<SmbConfig>(() => {
    const saved = localStorage.getItem('sip_smb_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sip_smb_config', e);
      }
    }
    return initialSmbConfig;
  });

  const handleUpdateSmbConfig = (newConfig: SmbConfig) => {
    setSmbConfig(newConfig);
    localStorage.setItem('sip_smb_config', JSON.stringify(newConfig));
  };

  const handleRestoreBackup = (backup: SigiBackupData) => {
    if (backup.clients) setClients(backup.clients);
    if (backup.atendimentos) setAtendimentos(backup.atendimentos);
    if (backup.atendimentosFixos) {
      setAtendimentosFixos(backup.atendimentosFixos);
      localStorage.setItem('sip_atendimentos_fixos', JSON.stringify(backup.atendimentosFixos));
    }
    if (backup.registros) setRegistros(backup.registros);
    if (backup.artigos) setArtigos(backup.artigos);
    if (backup.sistemas) setSistemas(backup.sistemas);
    if (backup.systemTables) {
      setSystemTables(backup.systemTables);
      localStorage.setItem('sip_system_tables', JSON.stringify(backup.systemTables));
    }
    if (backup.users) {
      setRegisteredUsers(backup.users);
      localStorage.setItem('sip_users', JSON.stringify(backup.users));
    }
    if (backup.smbConfig) {
      setSmbConfig(backup.smbConfig);
      localStorage.setItem('sip_smb_config', JSON.stringify(backup.smbConfig));
    }
    if (backup.systemOptions) {
      setSystemOptions(backup.systemOptions);
      localStorage.setItem('sip_system_options', JSON.stringify(backup.systemOptions));
    }
  };

  // System Tables state for Administração -> Tabelas do Sistema
  const [systemTables, setSystemTables] = useState<SystemTablesData>(() => {
    const saved = localStorage.getItem('sip_system_tables');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.classificacoesCliente) {
          // Remove legacy mock values that shouldn't be in a production-ready system
          const legacyNames = ['Ativação | Retenção', 'Faturado', 'Crítico', 'Estratégico', 'VIP / Prioritário'];
          parsed.classificacoesCliente = parsed.classificacoesCliente.filter(
            (c: any) => !legacyNames.includes(c.nome) && c.id !== 'cls-2'
          );
          
          // Ensure we have at least "Padrão"
          if (parsed.classificacoesCliente.length === 0) {
            parsed.classificacoesCliente = [{ id: 'cls-1', nome: 'Padrão', descricao: 'Classificação padrão para novos clientes.', status: 'Ativo', color: 'slate' }];
          }
        }
        return { ...initialSystemTables, ...parsed };
      } catch (e) {
        console.error('Failed to parse sip_system_tables', e);
      }
    }
    return initialSystemTables;
  });

  // Synchronize systemTables and sistemas state
  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleUpdateSystemTableItem = (tableKey: SystemTableKey, item: SystemTableItem) => {
    setSystemTables((prev) => {
      const currentList = Array.isArray(prev?.[tableKey]) ? prev[tableKey] : [];
      const updatedList = currentList.map((i) => (i.id === item.id ? item : i));
      const nextData = { ...prev, [tableKey]: updatedList };
      saveSystemTables(nextData);
      return nextData;
    });

    if (tableKey === 'sistemas') {
      setSistemas((prev) => {
        const updated = prev.map((s) =>
          s.id === item.id ? { ...s, nome: item.nome, status: item.status as any, descricao: item.descricao } : s
        );
        localStorage.setItem('sip_sistemas', JSON.stringify(updated));
        return updated;
      });
    } else if (tableKey === 'modulos') {
      setSistemas((prev) => {
        const updated = prev.map((s) => ({
          ...s,
          modulos: s.modulos.map((m) =>
            m.id === item.id ? { ...m, nome: item.nome, status: item.status as any, descricao: item.descricao } : m
          )
        }));
        localStorage.setItem('sip_sistemas', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleAddSystemTableItem = (tableKey: SystemTableKey, item: SystemTableItem) => {
    setSystemTables((prev) => {
      const currentList = Array.isArray(prev?.[tableKey]) ? prev[tableKey] : [];
      const nextData = { ...prev, [tableKey]: [...currentList, item] };
      saveSystemTables(nextData);
      return nextData;
    });
  };

  const handleDeleteSystemTableItem = (tableKey: SystemTableKey, itemId: string) => {
    setSystemTables((prev) => {
      if (!prev || !prev[tableKey]) return prev;
      
      const currentList = Array.isArray(prev[tableKey]) ? prev[tableKey] : [];
      const nextData = { ...prev, [tableKey]: currentList.filter((i) => i.id !== itemId) };
      
      // Persistência
      saveSystemTables(nextData);
      
      showToast('Sucesso', 'Item removido da tabela do sistema.');
      return nextData;
    });
  };


  // System Options for Admin & Dropdowns
  const [systemOptions, setSystemOptions] = useState<SystemOptionsConfig>(() => {
    const saved = localStorage.getItem('sip_system_options');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sip_system_options', e);
      }
    }
    return initialSystemOptions;
  });

  const [systemTableDefinitions, setSystemTableDefinitions] = useState<SystemTableMeta[]>(initialDefinitions);
  const [systemTableGroups, setSystemTableGroups] = useState<SystemTableGroupMeta[]>(initialGroups);

  const handleUpdateSystemOptions = (newOptions: SystemOptionsConfig) => {
    setSystemOptions(newOptions);
    localStorage.setItem('sip_system_options', JSON.stringify(newOptions));
  };
  // System Users state for Administração -> Usuários
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('sip_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sip_users', e);
      }
    }
    return initialUsers;
  });

  const handleAddUser = (user: UserAccount) => {
    setRegisteredUsers((prev) => {
      const updated = [user, ...prev];
      localStorage.setItem('sip_users', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateUser = (user: UserAccount) => {
    setRegisteredUsers((prev) => {
      const updated = prev.map((u) => (u.id === user.id ? user : u));
      localStorage.setItem('sip_users', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteUser = (userId: string) => {
    setRegisteredUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      localStorage.setItem('sip_users', JSON.stringify(updated));
      return updated;
    });
  };

  const handleChangePassword = (newPassword: string) => {
    if (!currentUser) return;
    setRegisteredUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return { ...u, password: newPassword };
        }
        return u;
      });
      localStorage.setItem('sip_users', JSON.stringify(updated));
      return updated;
    });
    showToast('Senha Alterada', 'Sua senha foi atualizada com sucesso no sistema.');
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('sigi_theme') === 'dark';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem('sip_logged_user');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        console.error('Failed to parse session', e);
      }
    }
    return {
      id: 'usr-1',
      name: 'Carlos Silva',
      email: 'carlos.silva@sip.com.br',
      role: 'Administrador',
      avatarInitials: 'CS',
      funcao: 'Administrador / Suporte N2'
    };
  });

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sigi_logged_user', JSON.stringify(user));
    showToast('Acesso Concedido', `Bem-vindo ao SIGI, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sigi_logged_user');
  };
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  // Dynamic Dashboard Stats calculated directly from live data arrays
  const stats: DashboardStats = useMemo(() => ({
    clientes: clients.length,
    atendimentos: atendimentos.length,
    registros: registros.length,
    baseConhecimento: artigos.length,
  }), [clients.length, atendimentos.length, registros.length, artigos.length]);

  // Dynamic Activities computed from real app data
  const activities: RecentActivity[] = useMemo(() => {
    const list: (RecentActivity & { rawDate?: Date })[] = [];

    // 1. Atendimentos
    atendimentos.forEach((a) => {
      const dateObj = a.dataAbertura ? new Date(a.dataAbertura) : new Date();
      list.push({
        id: `atd-${a.id}`,
        type: 'atendimento',
        title: `Atendimento ${a.codigo} (${a.status})`,
        description: `${a.clienteNome || 'Cliente'} - ${a.assunto}`,
        timestamp: formatRelativeTime(dateObj),
        rawDate: dateObj,
      });
    });

    // 2. Registros
    registros.forEach((r) => {
      const dateObj = r.createdAt ? new Date(r.createdAt) : new Date();
      list.push({
        id: `reg-${r.id}`,
        type: 'registro',
        title: `Registro ${r.tipo} ${r.codigo}`,
        description: r.titulo,
        timestamp: formatRelativeTime(dateObj),
        rawDate: dateObj,
      });
    });

    // 3. Artigos
    artigos.forEach((art) => {
      const dateObj = art.createdAt ? new Date(art.createdAt) : new Date();
      list.push({
        id: `art-${art.id}`,
        type: 'artigo',
        title: `Artigo KB ${art.codigo}`,
        description: art.titulo,
        timestamp: formatRelativeTime(dateObj),
        rawDate: dateObj,
      });
    });

    // 4. Clientes
    clients.forEach((c) => {
      const dateObj = c.createdAt ? new Date(c.createdAt) : new Date();
      list.push({
        id: `cli-${c.id}`,
        type: 'cliente',
        title: `Cliente ${c.codigo}`,
        description: `Novo cadastro: ${c.razaoSocial}`,
        timestamp: formatRelativeTime(dateObj),
        rawDate: dateObj,
      });
    });

    // Sort by most recent date
    list.sort((a, b) => (b.rawDate?.getTime() || 0) - (a.rawDate?.getTime() || 0));

    // If empty, return helpful placeholders
    if (list.length === 0) {
      return [
        {
          id: 'mock-1',
          type: 'cliente',
          title: 'Sistema pronto para uso',
          description: 'Nenhum lançamento recente. Cadastre clientes ou atendimentos para iniciar.',
          timestamp: 'Agora',
        }
      ];
    }

    return list.slice(0, 15); // Top 15 recent activities
  }, [atendimentos, registros, artigos, clients]);

  // Modal states
  const [quickActionType, setQuickActionType] = useState<QuickActionType>(null);

  // Synchronize Dark Mode Class on Document Root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sigi_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sigi_theme', 'light');
    }
  }, [isDarkMode]);

  // Handle Role Switching
  const handleToggleRole = (newRole: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role: newRole }));
    showToast(
      'Perfil Atualizado',
      `Perfil alterado para ${newRole}. ${
        newRole === 'Usuário'
          ? 'O menu de Administração foi ocultado conforme as permissões.'
          : 'Acesso total ao menu de Administração ativado.'
      }`
    );

    if (newRole === 'Usuário' && currentModule === 'administracao') {
      setCurrentModule('dashboard');
    }
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleAddClient = (newClient: Cliente) => {
    setClients((prev) => [newClient, ...prev]);
    saveCliente(newClient);

    showToast(
      'Cliente Cadastrado',
      `Cliente ${newClient.razaoSocial} foi cadastrado com sucesso. Redirecionando para seu Workspace.`
    );
  };

  const handleUpdateClient = (updatedClient: Cliente) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
    saveCliente(updatedClient);
  };

  // Funções de Sincronização de Vínculos Bidirecionais
  const updateAtendimentoGlobal = (updatedAtd: AtendimentoItem) => {
    // 1. Atualiza a lista de atendimentos
    setAtendimentos((prev) => prev.map((a) => (a.id === updatedAtd.id ? updatedAtd : a)));
    saveAtendimento(updatedAtd);

    // 2. Propaga vínculos para os Registros
    const linkedRegs = updatedAtd.registrosVinculados || [];
    setRegistros((prevRegs) => {
      return prevRegs.map((reg) => {
        const isCurrentlyLinked = linkedRegs.some((r) => r.id === reg.id);
        const hasAtdInReg = (reg.atendimentosVinculados || []).some((a) => a.id === updatedAtd.id);

        if (isCurrentlyLinked && !hasAtdInReg) {
          const updatedReg = {
            ...reg,
            atendimentosVinculados: [...(reg.atendimentosVinculados || []), updatedAtd]
          };
          saveRegistro(updatedReg);
          return updatedReg;
        } else if (!isCurrentlyLinked && hasAtdInReg) {
          const updatedReg = {
            ...reg,
            atendimentosVinculados: (reg.atendimentosVinculados || []).filter((a) => a.id !== updatedAtd.id)
          };
          saveRegistro(updatedReg);
          return updatedReg;
        }
        return reg;
      });
    });

    // 3. Propaga vínculos para os Artigos
    const linkedArts = updatedAtd.artigosVinculados || [];
    setArtigos((prevArts) => {
      return prevArts.map((art) => {
        const isCurrentlyLinked = linkedArts.some((a) => a.id === art.id);
        const hasAtdInArt = (art.atendimentosVinculados || []).some((a) => a.id === updatedAtd.id);

        if (isCurrentlyLinked && !hasAtdInArt) {
          const updatedArt = {
            ...art,
            atendimentosVinculados: [...(art.atendimentosVinculados || []), updatedAtd]
          };
          saveArtigo(updatedArt);
          return updatedArt;
        } else if (!isCurrentlyLinked && hasAtdInArt) {
          const updatedArt = {
            ...art,
            atendimentosVinculados: (art.atendimentosVinculados || []).filter((a) => a.id !== updatedAtd.id)
          };
          saveArtigo(updatedArt);
          return updatedArt;
        }
        return art;
      });
    });
  };

  const updateRegistroGlobal = (updatedReg: RegistroItem) => {
    setRegistros((prev) => prev.map((r) => (r.id === updatedReg.id ? updatedReg : r)));
    saveRegistro(updatedReg);

    // Propaga vínculos para Atendimentos
    const linkedAtds = updatedReg.atendimentosVinculados || [];
    setAtendimentos((prevAtds) => {
      return prevAtds.map((atd) => {
        const isCurrentlyLinked = linkedAtds.some((a) => a.id === atd.id);
        const hasRegInAtd = (atd.registrosVinculados || []).some((r) => r.id === updatedReg.id);

        if (isCurrentlyLinked && !hasRegInAtd) {
          const updatedAtd = {
            ...atd,
            registrosVinculados: [...(atd.registrosVinculados || []), updatedReg]
          };
          saveAtendimento(updatedAtd);
          return updatedAtd;
        } else if (!isCurrentlyLinked && hasRegInAtd) {
          const updatedAtd = {
            ...atd,
            registrosVinculados: (atd.registrosVinculados || []).filter((r) => r.id !== updatedReg.id)
          };
          saveAtendimento(updatedAtd);
          return updatedAtd;
        }
        return atd;
      });
    });

    // Propaga vínculos para Artigos KB
    const linkedArts = updatedReg.artigosVinculados || [];
    setArtigos((prevArts) => {
      return prevArts.map((art) => {
        const isCurrentlyLinked = linkedArts.some((a) => a.id === art.id);
        const hasRegInArt = (art.registrosVinculados || []).some((r) => r.id === updatedReg.id);

        if (isCurrentlyLinked && !hasRegInArt) {
          const updatedArt = {
            ...art,
            registrosVinculados: [...(art.registrosVinculados || []), updatedReg]
          };
          saveArtigo(updatedArt);
          return updatedArt;
        } else if (!isCurrentlyLinked && hasRegInArt) {
          const updatedArt = {
            ...art,
            registrosVinculados: (art.registrosVinculados || []).filter((r) => r.id !== updatedReg.id)
          };
          saveArtigo(updatedArt);
          return updatedArt;
        }
        return art;
      });
    });
  };

  const updateArtigoGlobal = (updatedArt: ArtigoKBItem) => {
    setArtigos((prev) => prev.map((a) => (a.id === updatedArt.id ? updatedArt : a)));
    saveArtigo(updatedArt);

    // Propaga vínculos para Atendimentos
    const linkedAtds = updatedArt.atendimentosVinculados || [];
    setAtendimentos((prevAtds) => {
      return prevAtds.map((atd) => {
        const isCurrentlyLinked = linkedAtds.some((a) => a.id === atd.id);
        const hasArtInAtd = (atd.artigosVinculados || []).some((a) => a.id === updatedArt.id);

        if (isCurrentlyLinked && !hasArtInAtd) {
          const updatedAtd = {
            ...atd,
            artigosVinculados: [...(atd.artigosVinculados || []), updatedArt]
          };
          saveAtendimento(updatedAtd);
          return updatedAtd;
        } else if (!isCurrentlyLinked && hasArtInAtd) {
          const updatedAtd = {
            ...atd,
            artigosVinculados: (atd.artigosVinculados || []).filter((a) => a.id !== updatedArt.id)
          };
          saveAtendimento(updatedAtd);
          return updatedAtd;
        }
        return atd;
      });
    });

    // Propaga vínculos para Registros
    const linkedRegs = updatedArt.registrosVinculados || [];
    setRegistros((prevRegs) => {
      return prevRegs.map((reg) => {
        const isCurrentlyLinked = linkedRegs.some((r) => r.id === reg.id);
        const hasArtInReg = (reg.artigosVinculados || []).some((a) => a.id === updatedArt.id);

        if (isCurrentlyLinked && !hasArtInReg) {
          const updatedReg = {
            ...reg,
            artigosVinculados: [...(reg.artigosVinculados || []), updatedArt]
          };
          saveRegistro(updatedReg);
          return updatedReg;
        } else if (!isCurrentlyLinked && hasArtInReg) {
          const updatedReg = {
            ...reg,
            artigosVinculados: (reg.artigosVinculados || []).filter((a) => a.id !== updatedArt.id)
          };
          saveRegistro(updatedReg);
          return updatedReg;
        }
        return reg;
      });
    });
  };

  const handleQuickActionSuccess = (
    newActivity: RecentActivity,
    category: 'atendimentos' | 'registros' | 'clientes' | 'atendimentos_fixos',
    createdItem?: any
  ) => {
    // Increment corresponding card metric and update lists
    if (category === 'atendimentos') {
      const newAtd: AtendimentoItem = createdItem || {
        id: `atd-${Date.now()}`,
        codigo: `#ATD-${Math.floor(1000 + Math.random() * 9000)}`,
        clienteNome: newActivity.title.replace('Atendimento criado: ', ''),
        assunto: newActivity.description,
        descricao: newActivity.description,
        prioridade: 'Média',
        status: 'Aberto',
        dataAbertura: 'Hoje agora mesmo',
        responsavel: currentUser.name,
        modulo: 'Suporte',
        categoria: 'Solicitação',
        tags: ['Geral'],
      };
      setAtendimentos((prev) => [newAtd, ...prev]);
      saveAtendimento(newAtd);
      setCurrentModule('atendimentos');
      setSelectedAtendimentoWorkspace(newAtd);
    } else if (category === 'atendimentos_fixos') {
      const newAtdFixo: AtendimentoFixoItem = createdItem;
      handleAddAtendimentoFixo(newAtdFixo);
    } else if (category === 'clientes') {
      const newCli: Cliente = createdItem;
      handleAddClient(newCli);
    } else if (category === 'registros') {
      const newReg = createdItem;
      setRegistros((prev) => [newReg, ...prev]);
      saveRegistro(newReg);
    }

    showToast(
      'Cadastro Realizado',
      `${newActivity.title} com sucesso! O indicador e o histórico do Dashboard foram atualizados.`
    );
  };

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        registeredUsers={registeredUsers}
        customization={customization}
      />
    );
  }

  const getAppBgConfig = (darkMode: boolean) => {
    const estilo = customization?.fundoEstilo || 'default';

    // When in LIGHT MODE (!darkMode):
    if (!darkMode) {
      if (estilo === 'soft-tint') {
        return {
          className: 'min-h-screen bg-indigo-50/70 text-slate-900 flex flex-col font-sans transition-colors duration-200 overflow-hidden h-screen'
        };
      }
      if (estilo === 'warm-cream') {
        return {
          className: 'min-h-screen bg-amber-50/60 text-slate-900 flex flex-col font-sans transition-colors duration-200 overflow-hidden h-screen'
        };
      }
      if (estilo === 'cool-zinc') {
        return {
          className: 'min-h-screen bg-zinc-100 text-slate-900 flex flex-col font-sans transition-colors duration-200 overflow-hidden h-screen'
        };
      }
      if (estilo === 'custom' && customization?.fundoCustomHex) {
        return {
          className: 'min-h-screen text-slate-900 flex flex-col font-sans transition-colors duration-200 overflow-hidden h-screen',
          style: { backgroundColor: customization.fundoCustomHex }
        };
      }
      return {
        className: 'min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans transition-colors duration-200 overflow-hidden h-screen'
      };
    }

    // When in DARK MODE (darkMode):
    if (estilo === 'custom' && customization?.fundoCustomHex) {
      return {
        className: 'min-h-screen text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-hidden h-screen',
        style: { backgroundColor: customization.fundoCustomHex }
      };
    }
    if (estilo === 'soft-tint') {
      return {
        className: 'min-h-screen bg-indigo-950/40 text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-hidden h-screen'
      };
    }
    if (estilo === 'warm-cream') {
      return {
        className: 'min-h-screen bg-amber-950/20 text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-hidden h-screen'
      };
    }
    if (estilo === 'cool-zinc') {
      return {
        className: 'min-h-screen bg-zinc-900 text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-hidden h-screen'
      };
    }
    if (estilo === 'dark-pure') {
      return {
        className: 'min-h-screen bg-black text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-hidden h-screen'
      };
    }

    return {
      className: 'min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-hidden h-screen'
    };
  };

  const appBg = getAppBgConfig(isDarkMode);

  return (
    <div className={appBg.className} style={appBg.style}>
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex-shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 pr-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{toast.title}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      {!isFullScreen && (
        <TopBar
          currentUser={currentUser}
          onToggleRole={handleToggleRole}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onLogout={handleLogout}
          onChangePassword={handleChangePassword}
          clients={clients}
          atendimentos={atendimentos}
          registros={registros}
          artigos={artigos}
          onSelectSearchResult={(type, data) => setQuickViewEntity({ type, data })}
          customization={customization}
        />
      )}

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Fixed Left Sidebar */}
        {!isFullScreen && (
          <SideBar
            currentModule={currentModule}
            onSelectModule={(module) => {
              setSelectedAtendimentoWorkspace(null);
              setSelectedArtigoWorkspace(null);
              setSelectedModuloWorkspace(null);
              setCurrentModule(module);
            }}
            userRole={currentUser.role}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            customization={customization}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Center & Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
          {/* Breadcrumb Bar */}
          {!isFullScreen && (
            <Breadcrumb
              currentModule={currentModule}
              onNavigate={(mod) => {
                setSelectedAtendimentoWorkspace(null);
                setSelectedArtigoWorkspace(null);
                setSelectedModuloWorkspace(null);
                setCurrentModule(mod);
              }}
            />
          )}

          {/* Scrollable View Content Container */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            {currentModule === 'dashboard' ? (
              <DashboardView
                currentUser={currentUser}
                stats={stats}
                activities={activities}
                atendimentos={atendimentos}
                registros={registros}
                artigos={artigos}
                onNavigate={(mod) => setCurrentModule(mod)}
                onOpenQuickAction={(actionType) => setQuickActionType(actionType)}
                clients={clients}
                onOpenEquipmentWorkspace={(client, equipment) => {
                  setInitialClientForWorkspace(client);
                  setInitialEquipmentForWorkspace(equipment);
                  setCurrentModule('clientes');
                }}
                customization={customization}
              />
            ) : currentModule === 'clientes' ? (
              <ClientesView
                clients={clients}
                onAddClient={handleAddClient}
                onUpdateClient={handleUpdateClient}
                systemTables={systemTables}
                systemTableDefinitions={systemTableDefinitions}
                onNavigateModule={(mod) => setCurrentModule(mod)}
                initialClient={initialClientForWorkspace}
                initialEquipment={initialEquipmentForWorkspace}
                onClearInitialSelection={() => {
                  setInitialClientForWorkspace(null);
                  setInitialEquipmentForWorkspace(null);
                }}
                onOpenRegistroWorkspace={(reg) => {
                  setSelectedRegistroWorkspace(reg);
                  setCurrentModule('registros');
                }}
                onOpenArtigoWorkspace={(art) => {
                  setSelectedArtigoWorkspace(art);
                  setCurrentModule('base_conhecimento');
                }}
                onOpenQuickAction={(actionType) => setQuickActionType(actionType)}
                onShowToast={showToast}
                allAtendimentos={atendimentos}
                allRegistros={registros}
                allArtigos={artigos}
                onUpdateAtendimentosList={(newList) => {
                  setAtendimentos(newList);
                  newList.forEach((a) => saveAtendimento(a));
                }}
                onUpdateRegistrosList={(newList) => {
                  setRegistros(newList);
                  newList.forEach((r) => saveRegistro(r));
                }}
                onUpdateArtigosList={(newList) => {
                  setArtigos(newList);
                  newList.forEach((art) => saveArtigo(art));
                }}
              />
            ) : currentModule === 'atendimentos' ? (
              selectedAtendimentoWorkspace ? (
                <AtendimentoWorkspace
                  atendimento={selectedAtendimentoWorkspace}
                  onBack={() => setSelectedAtendimentoWorkspace(null)}
                  onNavigateModule={(mod) => {
                    setSelectedAtendimentoWorkspace(null);
                    setCurrentModule(mod);
                  }}
                  onUpdateAtendimento={(updated) => {
                    updateAtendimentoGlobal(updated);
                    setSelectedAtendimentoWorkspace(updated);
                  }}
                  onShowToast={showToast}
                  allClients={clients}
                  allRegistros={registros}
                  allArtigos={artigos}
                  systemTableDefinitions={systemTableDefinitions}
                  systemTables={systemTables}
                  onUpdateRegistrosList={(newList) => {
                    setRegistros(newList);
                    newList.forEach((r) => saveRegistro(r));
                  }}
                  onUpdateArtigosList={(newList) => {
                    setArtigos(newList);
                    newList.forEach((art) => saveArtigo(art));
                  }}
                />
              ) : (
                <AtendimentosView
                  atendimentos={atendimentos}
                  onNavigateModule={(mod) => setCurrentModule(mod)}
                  onOpenQuickAction={(actionType) => setQuickActionType(actionType)}
                  onShowToast={showToast}
                  onOpenWorkspace={(atd) => setSelectedAtendimentoWorkspace(atd)}
                  systemTables={systemTables}
                  systemTableDefinitions={systemTableDefinitions}
                />
              )
            ) : currentModule === 'atendimentos_fixos' ? (
              <AtendimentosFixosView
                atendimentosFixos={atendimentosFixos}
                onAddAtendimentoFixo={handleAddAtendimentoFixo}
                onUpdateAtendimentoFixo={handleUpdateAtendimentoFixo}
                onDeleteAtendimentoFixo={handleDeleteAtendimentoFixo}
                allClients={clients}
                systemUsers={registeredUsers}
                allArtigos={artigos}
                currentUserName={currentUser?.name}
                systemTables={systemTables}
                onShowToast={showToast}
                onOpenArtigoWorkspace={(art) => {
                  setSelectedArtigoWorkspace(art);
                  setCurrentModule('base_conhecimento');
                }}
                onCreateArtigoFromMaintenance={(newArt) => {
                  setArtigos((prev) => [newArt as ArtigoKBItem, ...prev]);
                }}
              />
            ) : currentModule === 'registros' ? (
              <RegistrosView
                registrosList={registros}
                allClients={clients}
                allAtendimentos={atendimentos}
                allArtigos={artigos}
                systemOptions={systemOptions}
                systemTables={systemTables}
                systemTableDefinitions={systemTableDefinitions}
                selectedWorkspace={selectedRegistroWorkspace}
                onOpenWorkspace={(reg) => setSelectedRegistroWorkspace(reg)}
                onUpdateRegistrosList={(newList) => {
                  setRegistros(newList);
                  newList.forEach((reg) => {
                    const oldReg = registros.find((r) => r.id === reg.id);
                    if (
                      !oldReg ||
                      JSON.stringify(oldReg.atendimentosVinculados || []) !== JSON.stringify(reg.atendimentosVinculados || []) ||
                      JSON.stringify(oldReg.artigosVinculados || []) !== JSON.stringify(reg.artigosVinculados || [])
                    ) {
                      updateRegistroGlobal(reg);
                    } else {
                      saveRegistro(reg);
                    }
                  });
                }}
                onUpdateArtigosList={(newList) => {
                  setArtigos(newList);
                  newList.forEach((art) => saveArtigo(art));
                }}
                onShowToast={showToast}
                onOpenAtendimentoWorkspace={(atdId) => {
                  const targetAtd = atendimentos.find((a) => a.id === atdId);
                  if (targetAtd) {
                    setSelectedAtendimentoWorkspace(targetAtd);
                    setCurrentModule('atendimentos');
                  }
                }}
                systemUsers={registeredUsers}
              />
            ) : currentModule === 'base_conhecimento' ? (
              <KnowledgeBaseView
                artigos={artigos}
                selectedWorkspaceArtigo={selectedArtigoWorkspace}
                onSelectWorkspaceArtigo={setSelectedArtigoWorkspace}
                onAddArtigo={(newArt) => {
                  setArtigos((prev) => [newArt, ...prev]);
                  saveArtigo(newArt);
                }}
                onUpdateArtigo={updateArtigoGlobal}
                onDeleteArtigo={(artigoId) => {
                  setArtigos((prev) => prev.filter((a) => a.id !== artigoId));
                  deleteArtigo(artigoId);
                }}
                smbConfig={smbConfig}
                allClients={clients}
                allAtendimentos={atendimentos}
                allRegistros={registros}
                onShowToast={showToast}
                onOpenAtendimentoWorkspace={(atdId) => {
                  const targetAtd = atendimentos.find((a) => a.id === atdId);
                  if (targetAtd) {
                    setSelectedAtendimentoWorkspace(targetAtd);
                    setCurrentModule('atendimentos');
                  }
                }}
                onOpenRegistroWorkspace={(regId) => {
                  setCurrentModule('registros');
                }}
                systemUsers={registeredUsers}
                systemTables={systemTables}
              />
            ) : currentModule === 'modulos' ? (
              <SistemasModulosView
                sistemas={sistemas}
                systemTables={systemTables}
                onUpdateSistema={(updatedSis) => {
                  setSistemas((prev) => prev.map((s) => (s.id === updatedSis.id ? updatedSis : s)));
                  saveSistema(updatedSis);
                }}
                onUpdateModulo={(updatedMod) => {
                  setSistemas((prev) => {
                    const newList = prev.map((s) => {
                      if (s.id === updatedMod.sistemaId) {
                        const updatedSystem = {
                          ...s,
                          modulos: s.modulos.map((m) => (m.id === updatedMod.id ? updatedMod : m))
                        };
                        saveSistema(updatedSystem);
                        return updatedSystem;
                      }
                      return s;
                    });
                    return newList;
                  });
                }}
                onShowToast={showToast}
                allAtendimentos={atendimentos}
                allRegistros={registros}
                allArtigos={artigos}
                onOpenAtendimentoWorkspace={(atdId) => {
                  const targetAtd = atendimentos.find((a) => a.id === atdId);
                  if (targetAtd) {
                    setSelectedAtendimentoWorkspace(targetAtd);
                    setCurrentModule('atendimentos');
                  }
                }}
                onOpenRegistroWorkspace={(regId) => {
                  const targetReg = registros.find((r) => r.id === regId);
                  if (targetReg) {
                    setSelectedRegistroWorkspace(targetReg);
                    setCurrentModule('registros');
                  }
                }}
                onOpenArtigoWorkspace={(artId) => {
                  const targetArt = artigos.find((a) => a.id === artId);
                  if (targetArt) {
                    setSelectedArtigoWorkspace(targetArt);
                    setCurrentModule('base_conhecimento');
                  }
                }}
                selectedWorkspaceModulo={selectedModuloWorkspace}
                onSelectWorkspaceModulo={(mod) => setSelectedModuloWorkspace(mod)}
              />
            ) : currentModule === 'administracao' ? (
              <AdministracaoView
                systemTables={systemTables}
                systemTableDefinitions={systemTableDefinitions}
                systemTableGroups={systemTableGroups}
                onUpdateSystemTableDefinitions={(defs) => {
                  setSystemTableDefinitions(defs);
                }}
                onUpdateSystemTableGroups={(grps) => {
                  setSystemTableGroups(grps);
                }}
                onUpdateSystemTableItem={handleUpdateSystemTableItem}
                onAddSystemTableItem={handleAddSystemTableItem}
                onDeleteSystemTableItem={handleDeleteSystemTableItem}
                systemOptions={systemOptions}
                onShowToast={showToast}
                users={registeredUsers}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                smbConfig={smbConfig}
                onUpdateSmbConfig={handleUpdateSmbConfig}
                clients={clients}
                atendimentos={atendimentos}
                atendimentosFixos={atendimentosFixos}
                registros={registros}
                artigos={artigos}
                sistemas={sistemas}
                onRestoreBackup={handleRestoreBackup}
                onSystemReset={handleSystemReset}
                customization={customization}
                onSaveCustomization={handleUpdateCustomization}
              />
            ) : currentModule === 'monitor_sefaz' ? (
              <MonitorSefazView isFullScreen={isFullScreen} setIsFullScreen={setIsFullScreen} />
            ) : currentModule === 'consulta_fiscal' ? (
              <ConsultaFiscalView />
            ) : currentModule === 'relatorios' ? (
              <RelatoriosView
                atendimentos={atendimentos}
                clients={clients}
                registros={registros}
                artigos={artigos}
                sistemas={sistemas}
                onOpenAtendimentoWorkspace={(atd) => {
                  setSelectedAtendimentoWorkspace(atd);
                  setCurrentModule('atendimentos');
                }}
                onOpenRegistroWorkspace={(reg) => {
                  setSelectedRegistroWorkspace(reg);
                  setCurrentModule('registros');
                }}
                onOpenArtigoWorkspace={(art) => {
                  setSelectedArtigoWorkspace(art);
                  setCurrentModule('base_conhecimento');
                }}
                onOpenClientesModule={() => {
                  setCurrentModule('clientes');
                }}
              />
            ) : (
              <ModulePlaceholder
                module={currentModule}
                onNavigate={(mod) => setCurrentModule(mod)}
                onQuickAction={(actionName) => showToast('Módulo em Desenvolvimento', `Ação "${actionName}" selecionada.`)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Quick Action Creation Modal */}
      <QuickActionModal
        actionType={quickActionType}
        onClose={() => setQuickActionType(null)}
        onSuccess={handleQuickActionSuccess}
        allClients={clients}
        systemOptions={systemOptions}
        systemUsers={registeredUsers}
        currentUserName={currentUser?.name}
        systemTables={systemTables}
        systemTableDefinitions={systemTableDefinitions}
        onShowToast={showToast}
        onOpenWorkspaceAtendimento={(atd) => {
          setCurrentModule('atendimentos');
          setSelectedAtendimentoWorkspace(atd);
        }}
      />

      {/* Quick View Modal for Global Search & Fast Inspection */}
      <QuickViewModal
        isOpen={!!quickViewEntity}
        onClose={() => setQuickViewEntity(null)}
        entityType={quickViewEntity?.type || 'atendimento'}
        data={quickViewEntity?.data || null}
        systemTables={systemTables}
        onOpenWorkspace={(type, data) => {
          setQuickViewEntity(null);
          if (type === 'atendimento') {
            setSelectedAtendimentoWorkspace(data as AtendimentoItem);
            setCurrentModule('atendimentos');
          } else if (type === 'artigo') {
            setSelectedArtigoWorkspace(data as ArtigoKBItem);
            setCurrentModule('base_conhecimento');
          } else if (type === 'modulo') {
            setSelectedModuloWorkspace(data as ModuloItem);
            setCurrentModule('modulos');
          } else if (type === 'cliente') {
            setInitialClientForWorkspace(data as Cliente);
            setCurrentModule('clientes');
          } else if (type === 'equipamento') {
            const eq = data as EquipamentoItem;
            const client = clients.find(c => c.id === eq.clienteId);
            if (client) {
              setInitialClientForWorkspace(client);
              setInitialEquipmentForWorkspace(eq);
            }
            setCurrentModule('clientes');
          } else if (type === 'registro') {
            setCurrentModule('registros');
          }
        }}
      />
    </div>
  );
}

export default App;

