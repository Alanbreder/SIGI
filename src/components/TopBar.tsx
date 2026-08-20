import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Moon,
  Sun,
  UserCheck,
  Shield,
  ChevronDown,
  Menu,
  X,
  Cpu,
  LogOut,
  Building2,
  Headphones,
  Bug,
  BookOpen,
  ArrowRight,
  Key,
  Lock,
  Save,
  CheckCircle2
} from 'lucide-react';
import {
  User,
  UserRole,
  Cliente,
  AtendimentoItem,
  RegistroItem,
  ArtigoKBItem,
  SystemCustomization,
  defaultCustomization
} from '../types';
import { QuickViewEntityType } from './common/QuickViewModal';

interface TopBarProps {
  currentUser: User;
  onToggleRole: (newRole: UserRole) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
  onLogout?: () => void;
  onChangePassword?: (newPassword: string) => void;
  clients?: Cliente[];
  atendimentos?: AtendimentoItem[];
  registros?: RegistroItem[];
  artigos?: ArtigoKBItem[];
  onSelectSearchResult?: (type: QuickViewEntityType, data: any) => void;
  customization?: SystemCustomization;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onToggleRole,
  isDarkMode,
  onToggleDarkMode,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
  onLogout,
  onChangePassword,
  clients = [],
  atendimentos = [],
  registros = [],
  artigos = [],
  onSelectSearchResult,
  customization = defaultCustomization
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Change Password Drawer States
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleOpenChangePassword = () => {
    setIsUserMenuOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setIsChangePasswordOpen(true);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 4) {
      setPasswordError('A nova senha deve possuir pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    if (onChangePassword) {
      onChangePassword(newPassword);
    }

    setPasswordSuccess('Sua senha foi alterada com sucesso!');
    setTimeout(() => {
      setIsChangePasswordOpen(false);
    }, 1800);
  };

  // Close search results dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = searchValue.trim().toLowerCase();
  const isQueryActive = query.length >= 2;

  // Search Filters
  const matchingClientes = isQueryActive
    ? clients.filter(
        (c) =>
          c.razaoSocial.toLowerCase().includes(query) ||
          (c.nomeFantasia && c.nomeFantasia.toLowerCase().includes(query)) ||
          c.codigo.toLowerCase().includes(query) ||
          (c.cnpj && c.cnpj.includes(query)) ||
          (c.responsavel && c.responsavel.toLowerCase().includes(query)) ||
          (c.cidade && c.cidade.toLowerCase().includes(query))
      )
    : [];

  const matchingAtendimentos = isQueryActive
    ? atendimentos.filter(
        (a) =>
          a.codigo.toLowerCase().includes(query) ||
          a.assunto.toLowerCase().includes(query) ||
          (a.descricao && a.descricao.toLowerCase().includes(query)) ||
          (a.clienteNome && a.clienteNome.toLowerCase().includes(query)) ||
          (a.modulo && a.modulo.toLowerCase().includes(query)) ||
          a.responsavel.toLowerCase().includes(query) ||
          (a.solucaoAplicada && a.solucaoAplicada.toLowerCase().includes(query))
      )
    : [];

  const matchingRegistros = isQueryActive
    ? registros.filter(
        (r) =>
          r.codigo.toLowerCase().includes(query) ||
          r.titulo.toLowerCase().includes(query) ||
          (r.descricao && r.descricao.toLowerCase().includes(query)) ||
          r.tipo.toLowerCase().includes(query) ||
          (r.clienteNome && r.clienteNome.toLowerCase().includes(query)) ||
          (r.modulo && r.modulo.toLowerCase().includes(query))
      )
    : [];

  const matchingArtigos = isQueryActive
    ? artigos.filter(
        (art) =>
          art.codigo.toLowerCase().includes(query) ||
          art.titulo.toLowerCase().includes(query) ||
          art.categoria.toLowerCase().includes(query) ||
          (art.conteudo && art.conteudo.toLowerCase().includes(query)) ||
          (art.tags && art.tags.some((t) => t.toLowerCase().includes(query)))
      )
    : [];

  const totalResults =
    matchingClientes.length +
    matchingAtendimentos.length +
    matchingRegistros.length +
    matchingArtigos.length;

  const handleItemClick = (type: QuickViewEntityType, data: any) => {
    if (onSelectSearchResult) {
      onSelectSearchResult(type, data);
    }
    setSearchValue('');
    setIsSearchFocused(false);
  };

// Helper to calculate whether a hex color is dark
function isHexColorDark(hex?: string): boolean {
  if (!hex || !hex.startsWith('#')) return true;
  const c = hex.substring(1);
  const rgb = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  if (isNaN(rgb)) return true;
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 140;
}

  const getTopBarConfig = (darkMode: boolean) => {
    const estilo = customization?.topbarEstilo || 'default';

    // When in LIGHT MODE (!darkMode):
    if (!darkMode) {
      if (estilo === 'custom' && customization?.topbarCustomHex) {
        const isDark = isHexColorDark(customization.topbarCustomHex);
        return {
          className: `h-20 border-b ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'} px-4 md:px-8 flex items-center justify-between z-20 transition-all duration-200 flex-shrink-0 relative`,
          style: { backgroundColor: customization.topbarCustomHex },
          isDarkHeader: isDark
        };
      }
      return {
        className: 'h-20 bg-white border-b border-slate-200/90 text-slate-900 px-4 md:px-8 flex items-center justify-between z-20 transition-all duration-200 flex-shrink-0 relative shadow-2xs',
        isDarkHeader: false
      };
    }

    // When in DARK MODE (darkMode):
    if (estilo === 'custom' && customization?.topbarCustomHex) {
      const isDark = isHexColorDark(customization.topbarCustomHex);
      return {
        className: `h-20 border-b ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'} px-4 md:px-8 flex items-center justify-between z-20 transition-all duration-200 flex-shrink-0 relative`,
        style: { backgroundColor: customization.topbarCustomHex },
        isDarkHeader: isDark
      };
    }

    if (estilo === 'primary-gradient') {
      return {
        className: 'h-20 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border-b border-indigo-900/50 text-white px-4 md:px-8 flex items-center justify-between z-20 transition-all duration-200 flex-shrink-0 relative',
        isDarkHeader: true
      };
    }

    return {
      className: 'h-20 bg-slate-900 border-b border-slate-800 text-slate-100 px-4 md:px-8 flex items-center justify-between z-20 transition-all duration-200 flex-shrink-0 relative',
      isDarkHeader: true
    };
  };

  const getPrimaryAccent = (_darkMode: boolean) => {
    const cor = customization?.corBase || 'indigo';
    if (cor === 'custom' && customization?.customHexColor) {
      return {
        className: 'text-white font-bold shadow-xs',
        style: { backgroundColor: customization.customHexColor, color: '#ffffff' }
      };
    }
    const bgMap: Record<string, string> = {
      emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs',
      sky: 'bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs',
      violet: 'bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-xs',
      rose: 'bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs',
      amber: 'bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs',
      slate: 'bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-xs',
      indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs',
    };
    return {
      className: bgMap[cor] || bgMap.indigo,
      style: undefined
    };
  };

  const primaryAccent = getPrimaryAccent(isDarkMode);
  const topbarStyle = getTopBarConfig(isDarkMode);

  return (
    <header className={topbarStyle.className} style={topbarStyle.style}>
      {/* Left: Mobile Menu Trigger + SIGI Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className={`md:hidden p-2 rounded-xl transition-colors ${
            topbarStyle.isDarkHeader
              ? 'text-slate-200 hover:bg-white/10'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          aria-label="Abrir menu"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5">
          {customization?.logoType === 'image' && customization.logoImageUrl ? (
            <div className="h-12 w-auto max-w-[180px] flex items-center justify-center overflow-hidden">
              <img
                src={customization.logoImageUrl}
                alt={customization.nomeSistema || 'Logo'}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div
              style={primaryAccent.style}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md text-white font-black text-xs tracking-wider transition-colors ${primaryAccent.className}`}
            >
              {customization?.logoText || 'SIGI'}
            </div>
          )}

          <div className="hidden sm:flex flex-col">
            <span
              className={`font-black text-base tracking-tight leading-tight ${
                topbarStyle.isDarkHeader
                  ? 'text-white'
                  : 'text-slate-950 dark:text-white'
              }`}
            >
              {customization?.nomeSistema || 'SIGI'}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest line-clamp-1 ${
                topbarStyle.isDarkHeader
                  ? 'text-slate-300'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {customization?.subtituloSistema || 'Sistema Integrado de Gestão e Inteligência'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div ref={searchContainerRef} className="relative hidden md:block w-80 lg:w-96 z-30">
        <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl px-4 py-2.5 border border-slate-200/80 dark:border-slate-700/60 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Pesquisar clientes, chamados, artigos..."
            className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm font-medium text-slate-900 dark:text-slate-200 placeholder-slate-400 w-full"
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue('');
                setIsSearchFocused(false);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {isSearchFocused && isQueryActive && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 max-h-[75vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                Resultados da Busca Global
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full text-[11px]">
                {totalResults} encontrado{totalResults !== 1 ? 's' : ''}
              </span>
            </div>

            {totalResults === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhum resultado encontrado para "<strong className="text-slate-600 dark:text-slate-300">{searchValue}</strong>".
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Clientes */}
                {matchingClientes.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-indigo-500" />
                      Clientes ({matchingClientes.length})
                    </span>
                    <div className="space-y-1">
                      {matchingClientes.slice(0, 4).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleItemClick('cliente', c)}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-indigo-50/70 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {c.razaoSocial}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              CNPJ: {c.cnpj || 'Não informado'} • {c.cidade || 'Não informado'}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded shrink-0">
                            {c.codigo}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Atendimentos */}
                {matchingAtendimentos.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5 flex items-center gap-1">
                      <Headphones className="w-3 h-3 text-emerald-500" />
                      Atendimentos / Chamados ({matchingAtendimentos.length})
                    </span>
                    <div className="space-y-1">
                      {matchingAtendimentos.slice(0, 5).map((a) => (
                        <button
                          key={a.id}
                          onClick={() => handleItemClick('atendimento', a)}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-indigo-50/70 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {a.codigo}
                              </span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {a.assunto}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              Cliente: {a.clienteNome || 'Geral'} • Status: {a.status}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Registros */}
                {matchingRegistros.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5 flex items-center gap-1">
                      <Bug className="w-3 h-3 text-amber-500" />
                      Registros / Bugs / Melhorias ({matchingRegistros.length})
                    </span>
                    <div className="space-y-1">
                      {matchingRegistros.slice(0, 4).map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleItemClick('registro', r)}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-indigo-50/70 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                                {r.codigo}
                              </span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                {r.titulo}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              Tipo: {r.tipo} • Cliente: {r.clienteNome || 'Geral'}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Base de Conhecimento */}
                {matchingArtigos.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-purple-500" />
                      Base de Conhecimento ({matchingArtigos.length})
                    </span>
                    <div className="space-y-1">
                      {matchingArtigos.slice(0, 4).map((art) => (
                        <button
                          key={art.id}
                          onClick={() => handleItemClick('artigo', art)}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-indigo-50/70 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                              {art.titulo}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              Categoria: {art.categoria} • {art.codigo}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: User Profile + Theme Switcher */}
      <div className="flex items-center gap-3">
        {/* Dark/Light Mode Switcher */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 p-1.5 pl-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <div className="flex flex-col text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                {currentUser.name}
              </p>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-end gap-1">
                <Shield className="w-2.5 h-2.5" />
                {currentUser.role}
              </span>
            </div>

            <div 
              className={`w-8 h-8 rounded-xl text-white font-bold flex items-center justify-center text-xs shadow-xs ${primaryAccent.className}`}
              style={primaryAccent.style}
            >
              {currentUser.avatarInitials}
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
          </button>

          {/* User Menu Popover */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400">{currentUser.email}</p>
              </div>

              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                Controle de Acesso (Perfil)
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    onToggleRole('Administrador');
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    currentUser.role === 'Administrador'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    Administrador
                  </span>
                  {currentUser.role === 'Administrador' && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                </button>

                <button
                  onClick={() => {
                    onToggleRole('Usuário');
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    currentUser.role === 'Usuário'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    Usuário
                  </span>
                  {currentUser.role === 'Usuário' && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <button
                  onClick={handleOpenChangePassword}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Alterar Minha Senha</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair do Sistema</span>
                  </button>
                )}
                <div className="text-[10px] text-slate-400 px-2 text-center pt-1">
                  Alterne o perfil para testar o menu de Administração.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Drawer: Alterar Minha Senha */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Alterar Minha Senha
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentUser.name} ({currentUser.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Form */}
            <form onSubmit={handleSavePassword} className="flex-1 p-6 overflow-y-auto space-y-5">
              {passwordError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Senha Atual */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Sua senha atual"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  Nova Senha <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo de 4 caracteres"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  Confirmar Nova Senha <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-[11px] text-indigo-900 dark:text-indigo-200 space-y-1">
                <p className="font-extrabold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  Privacidade de Acesso
                </p>
                <p className="leading-relaxed text-indigo-700 dark:text-indigo-300">
                  Após atualizar sua senha, utilize a nova combinação em seus próximos logins no sistema SIGI.
                </p>
              </div>

              {/* Drawer Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Nova Senha</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
