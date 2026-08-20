import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { ModuleType } from '../types';

interface BreadcrumbProps {
  currentModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
}

const moduleLabels: Record<ModuleType, string> = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  atendimentos: 'Atendimentos',
  atendimentos_fixos: 'Atendimentos Fixos',
  registros: 'Registros',
  base_conhecimento: 'Base de Conhecimento',
  modulos: 'Módulos',
  relatorios: 'Relatórios',
  monitor_sefaz: 'Monitor Sefaz',
  consulta_fiscal: 'Consultar CNPJ',
  administracao: 'Administração',
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentModule, onNavigate }) => {
  return (
    <nav className="flex items-center gap-2 text-xs py-2 px-8 bg-slate-100/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/60">
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-bold group cursor-pointer"
      >
        <Home className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
        <span>Início</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />

      <span className="font-extrabold text-slate-950 dark:text-slate-100">
        {moduleLabels[currentModule]}
      </span>
    </nav>
  );
};
