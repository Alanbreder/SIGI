import React from 'react';
import {
  X,
  Bug,
  Sparkles,
  Lightbulb,
  ExternalLink,
  Tag,
  Clock,
  User,
  Building2,
  Headphones,
  BookOpen,
  FileCode2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { RegistroItem } from '../../types';

interface RegistroQuickViewProps {
  registro: RegistroItem | null;
  onClose: () => void;
  onOpenWorkspace: (reg: RegistroItem) => void;
  onOpenAtendimentoWorkspace?: (atdId: string) => void;
}

export const RegistroQuickView: React.FC<RegistroQuickViewProps> = ({
  registro,
  onClose,
  onOpenWorkspace,
  onOpenAtendimentoWorkspace
}) => {
  if (!registro) return null;

  const getTipoBadge = (t: string) => {
    switch (t) {
      case 'Bug':
        return {
          icon: <Bug className="w-4 h-4 text-rose-500" />,
          bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
        };
      case 'Melhoria':
        return {
          icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
          bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300'
        };
      case 'Ideia':
        return {
          icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
          bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300'
        };
      case 'Solicitação de Feature':
        return {
          icon: <FileCode2 className="w-4 h-4 text-sky-500" />,
          bg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-300'
        };
      default:
        return {
          icon: <FileCode2 className="w-4 h-4 text-slate-500" />,
          bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
        };
    }
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'Em Desenvolvimento':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300';
      case 'Concluído':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300';
      case 'Aprovado':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300';
      case 'Rejeitado':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border shadow-2xs ${getTipoBadge(registro.tipo).bg}`}>
              {getTipoBadge(registro.tipo).icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {registro.codigo}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getStatusColor(registro.status)}`}>
                  {registro.status}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                {registro.titulo}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Action Callout: Abrir Workspace */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between gap-3 shadow-2xs">
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                Edição & Gestão do Registro
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Para editar informações, adicionar análises ou vincular atendimentos, abra o Workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenWorkspace(registro)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20 shrink-0 cursor-pointer"
            >
              <span>Abrir Workspace</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Módulo</span>
              <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                {registro.modulo || 'Geral'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Prioridade</span>
              <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                {registro.prioridade || 'Média'}
              </p>
            </div>
            {(registro.tipo === 'Melhoria' || registro.tipo === 'Solicitação de Feature') && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Impacto</span>
                <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                  {registro.impacto || 'Baixo'}
                </p>
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Autor</span>
              <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate">
                {registro.autor}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Data Criação</span>
              <p className="font-medium text-slate-700 dark:text-slate-300 text-xs">
                {registro.data}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Última Atualização</span>
              <p className="font-medium text-slate-700 dark:text-slate-300 text-xs">
                {registro.ultimaAtualizacao || registro.data}
              </p>
            </div>
          </div>

          {/* Cliente Relacionado */}
          {registro.clienteNome && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  {registro.tipo === 'Solicitação de Feature' ? 'Solicitante (Cliente)' : 'Reportado por (Cliente)'}
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">
                  {registro.clienteNome}
                </p>
              </div>
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Descrição</h4>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {registro.descricao || 'Sem descrição cadastrada.'}
            </div>
          </div>

          {/* Análise Técnica */}
          {registro.analiseTecnica && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-indigo-500" />
                Análise Técnica
              </h4>
              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                {registro.analiseTecnica}
              </div>
            </div>
          )}

          {/* Tags */}
          {registro.tags && registro.tags.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {registro.tags.map((tg, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold"
                  >
                    #{tg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Atendimentos Vinculados */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Headphones className="w-4 h-4 text-indigo-500" />
              Atendimentos Vinculados ({registro.atendimentosVinculados?.length || 0})
            </h4>
            {registro.atendimentosVinculados && registro.atendimentosVinculados.length > 0 ? (
              <div className="space-y-2">
                {registro.atendimentosVinculados.map((atd) => (
                  <div
                    key={atd.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                          {atd.codigo}
                        </span>
                        <span className="text-slate-900 dark:text-white font-extrabold text-xs">
                          {atd.clienteNome}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {atd.assunto}
                      </p>
                    </div>
                    {onOpenAtendimentoWorkspace && (
                      <button
                        type="button"
                        onClick={() => onOpenAtendimentoWorkspace(atd.id)}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[10px] cursor-pointer transition-colors"
                      >
                        Ver Chamado
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-[11px] italic">Nenhum atendimento vinculado diretamente a este registro.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <button
            type="button"
            onClick={() => onOpenWorkspace(registro)}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
          >
            <span>Abrir Workspace Completo</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
