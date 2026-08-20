import React from 'react';
import {
  Users,
  Headphones,
  FileCode2,
  BookOpen,
  Boxes,
  BarChart3,
  Settings,
  Layers,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { ModuleType } from '../types';

interface ModulePlaceholderProps {
  module: ModuleType;
  onNavigate: (module: ModuleType) => void;
  onQuickAction: (actionName: string) => void;
}

const moduleDetails: Record<
  ModuleType,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
    features: string[];
  }
> = {
  dashboard: {
    title: 'Dashboard',
    description: 'Painel principal de indicadores e atividades do sistema.',
    icon: <Layers className="w-6 h-6 text-indigo-600" />,
    features: ['Resumo Geral', 'Atividades Recentes', 'Acesso Rápido'],
  },
  clientes: {
    title: 'Clientes',
    description: 'Gestão de empresas, contatos e inventário contratado.',
    icon: <Users className="w-6 h-6 text-blue-600" />,
    features: ['Cadastro de Clientes', 'Contatos Vinculados', 'Inventário de Módulos', 'Histórico de Atendimentos'],
  },
  atendimentos: {
    title: 'Atendimentos',
    description: 'Registro de suporte técnico, causas e vinculos de produto.',
    icon: <Headphones className="w-6 h-6 text-indigo-600" />,
    features: ['Chamados de Suporte', 'Classificação de Causas', 'Vinculação com Clientes', 'Status de Resolução'],
  },
  atendimentos_fixos: {
    title: 'Atendimentos Fixos',
    description: 'Gestão de atendimentos de manutenção periódica de TI para clientes fixos.',
    icon: <Headphones className="w-6 h-6 text-indigo-600" />,
    features: ['Manutenções Periódicas', 'Registro de Equipamentos Trocados', 'Fotos e Anexos', 'Histórico e Linha do Tempo'],
  },
  registros: {
    title: 'Registros',
    description: 'Centralização de bugs, melhorias do produto e sugestões/ideias.',
    icon: <FileCode2 className="w-6 h-6 text-emerald-600" />,
    features: ['Registro de Bugs', 'Acompanhamento de Melhorias', 'Priorização de Ideias', 'Vínculo com Atendimentos'],
  },
  base_conhecimento: {
    title: 'Base de Conhecimento',
    description: 'Artigos técnicos, procedimentos e resoluções de problemas.',
    icon: <BookOpen className="w-6 h-6 text-purple-600" />,
    features: ['Repositório de Artigos', 'Busca por Categoria', 'Modelos de Solução', 'Manuais Operacionais'],
  },
  modulos: {
    title: 'Módulos',
    description: 'Catálogo de funcionalidades e inventários por cliente.',
    icon: <Boxes className="w-6 h-6 text-amber-600" />,
    features: ['Catálogo de Módulos', 'Mapeamento por Cliente', 'Status de Ativação', 'Controle de Versões'],
  },
  relatorios: {
    title: 'Relatórios',
    description: 'Relatórios inteligentes, estatísticas e análise de causas raiz.',
    icon: <BarChart3 className="w-6 h-6 text-rose-600" />,
    features: ['Análise de Causas Recorrentes', 'Relatório por Cliente', 'Métricas de Suporte', 'Exportação de Dados'],
  },
  monitor_sefaz: {
    title: 'Monitor Sefaz',
    description: 'Monitoramento em tempo real dos serviços de autorização da SEFAZ.',
    icon: <Settings className="w-6 h-6 text-slate-700 dark:text-slate-200" />,
    features: ['Status por Estado', 'Tempo Médio de Resposta', 'Acompanhamento Online/Offline', 'Atualização Automática'],
  },
  consulta_fiscal: {
    title: 'Consultar CNPJ',
    description: 'Consulta e verificação de situação cadastral e fiscal de CNPJ para emissão de NFE/NFCE.',
    icon: <Building2 className="w-6 h-6 text-indigo-600" />,
    features: ['Situação do CNPJ na Receita', 'Habilitação de NFE', 'Status de Inscrição Estadual', 'Atividades Econômicas (CNAE)'],
  },
  administracao: {
    title: 'Administração',
    description: 'Configurações gerais do sistema, usuários e permissões de acesso.',
    icon: <Settings className="w-6 h-6 text-slate-700 dark:text-slate-200" />,
    features: ['Controle de Usuários', 'Perfis de Acesso (Admin/Usuário)', 'Parâmetros do Sistema', 'Logs de Auditoria'],
  },
};

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  module,
  onNavigate,
  onQuickAction,
}) => {
  const details = moduleDetails[module];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Module Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl flex-shrink-0">
              {details.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                  Estrutura de Shell Pronta
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Módulo: {details.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {details.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors self-start sm:self-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Dashboard
          </button>
        </div>

        {/* Status Box */}
        <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Área reservada e estruturada no SIGI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Este espaço está totalmente integrado à navegação, responsividade e sistema de temas do SIGI. Quando você indicar a especificação de negócio deste módulo, as tabelas, formulários e fluxos serão acoplados aqui.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Preview Grid */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Escopo Planejado para {details.title}:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {details.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  {feature}
                </span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
                  Aguardando
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => onQuickAction(`Ação para Módulo ${details.title}`)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Testar Interação do Shell ({details.title})
          </button>
        </div>
      </div>
    </div>
  );
};
