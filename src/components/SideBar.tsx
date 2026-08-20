import React from 'react';
import {
  LayoutDashboard,
  Users,
  Headphones,
  Wrench,
  FileCode2,
  BookOpen,
  Boxes,
  BarChart3,
  Settings,
  ShieldAlert,
  AlertTriangle,
  CloudLightning,
  Activity,
  Building2
} from 'lucide-react';
import { ModuleType, UserRole, SystemCustomization } from '../types';

interface SideBarProps {
  currentModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  userRole: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  customization?: SystemCustomization;
  isDarkMode: boolean;
}

export const SideBar: React.FC<SideBarProps> = ({
  currentModule,
  onSelectModule,
  userRole,
  isMobileOpen = false,
  onCloseMobile,
  customization,
  isDarkMode,
}) => {
  const menuItems: { id: ModuleType; label: string; icon: React.ReactNode; requiresAdmin?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'clientes', label: 'Clientes', icon: <Users className="w-4 h-4" /> },
    { id: 'atendimentos', label: 'Atendimentos', icon: <Headphones className="w-4 h-4" /> },
    { id: 'atendimentos_fixos', label: 'Atendimentos Fixos', icon: <Wrench className="w-4 h-4" /> },
    { id: 'registros', label: 'Registros', icon: <FileCode2 className="w-4 h-4" /> },
    { id: 'base_conhecimento', label: 'Base de Conhecimento', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'modulos', label: 'Sistemas e Módulos', icon: <Boxes className="w-4 h-4" /> },
    { id: 'relatorios', label: 'Relatórios', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'consulta_fiscal', label: 'Consultar CNPJ', icon: <Building2 className="w-4 h-4" /> },
    { id: 'monitor_sefaz', label: 'Monitor Sefaz', icon: <Activity className="w-4 h-4" /> },
    { id: 'administracao', label: 'Administração', icon: <Settings className="w-4 h-4" />, requiresAdmin: true },
  ];

  const visibleItems = menuItems.filter((item) => !item.requiresAdmin || userRole === 'Administrador');

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

  const getSideBarConfig = () => {
    const estilo = customization?.sidebarEstilo || 'default';

    // When in LIGHT MODE (!isDarkMode):
    if (!isDarkMode) {
      if (estilo === 'custom' && customization?.sidebarCustomHex) {
        const isDark = isHexColorDark(customization.sidebarCustomHex);
        return {
          className: `fixed md:static inset-y-0 left-0 z-40 w-64 border-r ${
            isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-800'
          } flex flex-col h-full transition-all duration-200 flex-shrink-0 select-none ${
            isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`,
          style: { backgroundColor: customization.sidebarCustomHex }
        };
      }
      return {
        className: `fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-slate-200/90 bg-white text-slate-800 flex flex-col h-full transition-all duration-200 flex-shrink-0 select-none ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`
      };
    }

    // When in DARK MODE (isDarkMode):
    if (estilo === 'custom' && customization?.sidebarCustomHex) {
      return {
        className: `fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-slate-700/30 text-white flex flex-col h-full transition-all duration-200 flex-shrink-0 select-none ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`,
        style: { backgroundColor: customization.sidebarCustomHex }
      };
    }

    if (estilo === 'primary-accent') {
      return {
        className: `fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-indigo-900/50 bg-slate-950 text-indigo-100 flex flex-col h-full transition-all duration-200 flex-shrink-0 select-none ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`
      };
    }

    return {
      className: `fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-900 text-slate-100 flex flex-col h-full transition-all duration-200 flex-shrink-0 select-none ${
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`
    };
  };

  const getPrimaryAccent = () => {
    const cor = customization?.corBase || 'indigo';
    if (cor === 'custom' && customization?.customHexColor) {
      return {
        className: 'text-white font-bold shadow-xs',
        style: { backgroundColor: customization.customHexColor, color: '#ffffff' }
      };
    }
    const bgMap: Record<string, string> = {
      emerald: 'bg-emerald-600 text-white font-bold shadow-xs',
      sky: 'bg-sky-600 text-white font-bold shadow-xs',
      violet: 'bg-violet-600 text-white font-bold shadow-xs',
      rose: 'bg-rose-600 text-white font-bold shadow-xs',
      amber: 'bg-amber-600 text-white font-bold shadow-xs',
      slate: 'bg-slate-700 text-white font-bold shadow-xs',
      indigo: 'bg-indigo-600 text-white font-bold shadow-xs',
    };
    return {
      className: bgMap[cor] || bgMap.indigo,
      style: undefined
    };
  };

  const activeAccent = getPrimaryAccent();
  const sidebarStyle = getSideBarConfig();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      <aside className={sidebarStyle.className} style={sidebarStyle.style}>
        {/* Navigation Heading */}
        <div className="py-2.5 px-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
            Navegação Principal
          </p>
        </div>

        {/* Menu Items List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? activeAccent.className
                    : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-slate-100 font-semibold'
                }`}
                style={isActive ? activeAccent.style : undefined}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'}>
                  {item.icon}
                </span>
                <span className="truncate flex-1 text-left">{item.label}</span>
                {item.requiresAdmin && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'}`}>
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Role Status & Homologação Notice */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
          {/* Homologação Alert Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200/90 dark:border-amber-800/80 rounded-2xl p-3 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-extrabold text-[11px]">
                <CloudLightning className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                <span>Ambiente de Homologação</span>
              </div>
              <span className="text-[9px] font-extrabold uppercase bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded">
                Cloud
              </span>
            </div>
            <p className="text-[10px] font-medium text-amber-800 dark:text-amber-300/80 leading-tight">
              Sincronizado com <strong>Supabase Cloud (Dev)</strong>. Não utilizar dados reais de produção.
            </p>
          </div>

          <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-300">
              <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Perfil: {userRole}</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1 leading-tight">
              {userRole === 'Administrador'
                ? 'Acesso completo ao menu de Administração ativado.'
                : 'Menu de Administração oculto para perfil Usuário.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
