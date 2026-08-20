import React from 'react';
import {
  X,
  ExternalLink,
  Boxes,
  Headphones,
  FileCode2,
  BookOpen,
  UserCheck,
  Building2,
  Calendar,
  User,
  MapPin,
  Tag,
  ShieldCheck,
  Cpu,
  HardDrive,
  Globe,
  Hash,
  Clock,
  AlertCircle,
  CheckCircle2,
  Layers
} from 'lucide-react';
import {
  EquipamentoItem,
  AtendimentoItem,
  RegistroItem,
  ArtigoKBItem,
  Cliente,
  RecentActivity,
  ModuloItem,
  SystemTablesData
} from '../../types';
import { getEquipmentTypeIcon } from '../../lib/equipmentIcons';
import { DocumentPreviewRenderer } from './DocumentPreviewRenderer';
import { DynamicFieldsForm } from './DynamicFieldsForm';

export type QuickViewEntityType =
  | 'equipamento'
  | 'atendimento'
  | 'registro'
  | 'artigo'
  | 'cliente'
  | 'recent_activity'
  | 'modulo';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: QuickViewEntityType;
  data: EquipamentoItem | AtendimentoItem | RegistroItem | ArtigoKBItem | Cliente | RecentActivity | ModuloItem | null;
  onOpenWorkspace: (type: QuickViewEntityType, data: any) => void;
  systemTables?: SystemTablesData;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  isOpen,
  onClose,
  entityType,
  data,
  onOpenWorkspace,
  systemTables,
}) => {
  if (!isOpen || !data) return null;

  // Helper badge styles
  const getBadgeStyle = (statusStr: string) => {
    switch (statusStr) {
      case 'Ativo':
      case 'Resolvido':
      case 'Concluído':
      case 'Publicado':
        return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Em Andamento':
      case 'Em Desenvolvimento':
      case 'Manutenção':
        return 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Aberto':
      case 'Aprovado':
      case 'Em Análise':
        return 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Urgente':
        return 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const renderContent = () => {
    switch (entityType) {
      case 'equipamento': {
        const eq = data as EquipamentoItem;
        const eqTipoDef = systemTables?.tiposEquipamento?.find(
          (t) => t.nome.toLowerCase() === eq.tipo.toLowerCase()
        );
        const CardIcon = getEquipmentTypeIcon ? getEquipmentTypeIcon(eq.tipo, systemTables) : Cpu;

        return (
          <div className="space-y-5">
            {/* Header com Ícone e Informações Principais */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200/30 dark:border-indigo-800/30 shrink-0">
                <CardIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                    {eq.codigo}
                  </span>
                  {eq.patrimonio && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/50">
                      Patr: {eq.patrimonio}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                      eq.status
                    )}`}
                  >
                    {eq.status}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {eq.nome}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tipo: <strong className="text-slate-700 dark:text-slate-200">{eq.tipo}</strong>
                </p>
                {eq.clienteNome && (
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3" />
                    {eq.clienteNome}
                  </p>
                )}
              </div>
            </div>

            {/* Grid de Informações de Cadastro */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {/* Seção Única: Dados Gerais de Cadastro */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Dados de Cadastro
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Nome do Equipamento</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                      {eq.nome}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Número de Série</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                      {eq.numeroSerie || 'Não informado'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Status</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                      {eq.status}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Data de Instalação</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                      {eq.dataInstalacao || 'Não informada'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Localização Física</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                      {eq.localizacao || 'Padrão'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Tipo do Equipamento</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                      {eq.tipo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seção Adicional: Detalhes Técnicos se disponíveis */}
              {(eq.modelo || eq.marcaModelo || eq.ip || eq.so) && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    Detalhes Técnicos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(eq.modelo || eq.marcaModelo) && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Modelo / Marca</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                          {eq.modelo || eq.marcaModelo}
                        </span>
                      </div>
                    )}
                    {eq.so && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Sistema Operacional</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                          {eq.so}
                        </span>
                      </div>
                    )}
                    {eq.ip && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Endereço IP</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                          {eq.ip}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seção 4: Campos Dinâmicos Específicos do Tipo */}
              {(() => {
                const hasDynamicFields = eqTipoDef?.camposDinamicos && eqTipoDef.camposDinamicos.length > 0;
                const hasSpecificValues = eq.camposEspecificos && Object.keys(eq.camposEspecificos).length > 0;

                if (hasDynamicFields || hasSpecificValues) {
                  return (
                    <DynamicFieldsForm
                      title={`Campos Personalizados (${eq.tipo})`}
                      fields={eqTipoDef?.camposDinamicos || []}
                      values={eq.camposEspecificos || {}}
                      onChange={() => {}}
                      readOnly={true}
                    />
                  );
                }
                return null;
              })()}

              {/* Observações Gerais */}
              {eq.observacoes && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Observações Gerais do Equipamento
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {eq.observacoes}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'atendimento': {
        const atd = data as AtendimentoItem;
        return (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                  {atd.codigo}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {atd.assunto}
              </h3>

              {atd.clienteNome && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Cliente: <strong className="text-slate-700 dark:text-slate-200">{atd.clienteNome}</strong></span>
                </p>
              )}

              {/* Badges de Status e Prioridade em uma linha abaixo do cliente */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                    atd.status
                  )}`}
                >
                  {atd.status}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                    atd.prioridade
                  )}`}
                >
                  Prioridade {atd.prioridade}
                </span>
              </div>
            </div>

            {atd.descricao && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Descrição do Chamado
                </span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  {atd.descricao}
                </p>
              </div>
            )}

            {/* Solução Aplicada / Parecer Técnico */}
            {atd.solucaoAplicada ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Solução Aplicada / Parecer Técnico
                </span>
                <p className="text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed whitespace-pre-line">
                  {atd.solucaoAplicada}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Solução Aplicada
                </span>
                <p className="text-slate-500 italic">Nenhum parecer técnico ou solução registrada até o momento.</p>
              </div>
            )}

            {/* Sistemas e Módulos Envolvidos */}
            {atd.sistemasModulos && atd.sistemasModulos.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Sistemas & Módulos Envolvidos
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {atd.sistemasModulos.map((sm, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1"
                    >
                      <span className="font-extrabold">{sm.sistema}</span>
                      {sm.modulo && <span className="text-indigo-500 dark:text-indigo-400 font-normal">• {sm.modulo}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Módulo / Categoria
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {atd.modulo || 'Geral'} {atd.categoria ? `• ${atd.categoria}` : ''}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Responsável
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {atd.responsavel}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Data de Abertura
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {atd.dataAbertura}
                </span>
              </div>
            </div>

            {atd.tags && atd.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {atd.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'registro': {
        const reg = data as RegistroItem;
        return (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                  {reg.codigo}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {reg.titulo}
                </h3>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {reg.tipo}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                    reg.status
                  )}`}
                >
                  {reg.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Sistema / Módulo</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {reg.sistema || 'N/A'} {reg.modulo ? `> ${reg.modulo}` : ''}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Prioridade / Impacto</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {reg.prioridade || 'Média'} / {reg.impacto || 'Médio'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Cliente</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {reg.clienteNome || 'Geral'}
                </span>
              </div>
            </div>

            {reg.descricao && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Detalhamento / Descrição
                </span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {reg.descricao}
                </p>
              </div>
            )}

            {reg.analiseTecnica && (
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  Análise Técnica
                </span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {reg.analiseTecnica}
                </p>
              </div>
            )}

            {/* Linked Atendimentos */}
            {reg.atendimentosVinculados && reg.atendimentosVinculados.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Atendimentos Vinculados ({reg.atendimentosVinculados.length})
                </span>
                <div className="space-y-1.5">
                  {reg.atendimentosVinculados.map((atd) => (
                    <div key={atd.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{atd.codigo}</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{atd.assunto}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{atd.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Artigos */}
            {reg.artigosVinculados && reg.artigosVinculados.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Artigos da Base de Conhecimento ({reg.artigosVinculados.length})
                </span>
                <div className="space-y-1.5">
                  {reg.artigosVinculados.map((art) => (
                    <div key={art.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{art.codigo}</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{art.titulo}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{art.categoria}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reg.tags && reg.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {reg.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Autor / Criação
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {reg.autor} em {reg.data}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Última Atualização
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {reg.ultimaAtualizacao || reg.data}
                </span>
              </div>
            </div>

            {reg.anexos && reg.anexos.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Anexos ({reg.anexos.length})
                </span>
                <div className="space-y-1.5">
                  {reg.anexos.map((anexo) => (
                    <div key={anexo.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{anexo.nome}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{anexo.tamanho}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline History */}
            {reg.timelineEvents && reg.timelineEvents.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Histórico de Atividades ({reg.timelineEvents.length})
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {reg.timelineEvents.map((evt) => (
                    <div key={evt.id} className="text-xs p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{evt.autor}</span>
                        <span>{evt.data}</span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{evt.titulo}</p>
                      {evt.descricao && <p className="text-slate-600 dark:text-slate-400 mt-0.5">{evt.descricao}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'artigo': {
        const art = data as ArtigoKBItem;
        return (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                  {art.codigo}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {art.titulo}
                </h3>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {art.categoria}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  {art.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Tipo / Nível</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {art.tipoArtigo || 'Procedimento'} / {art.nivel || 'Básico'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Sistema / Módulo</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {art.sistemaPertencente || 'SIGI Geral'} {art.modulo ? `> ${art.modulo}` : ''}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Visualizações</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {art.visualizacoes || 0} acessos
                </span>
              </div>
            </div>

            {art.conteudo && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs uppercase font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Visualizar Documento (Formato Completo)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Renderização Técnica</span>
                </div>
                <div className="max-h-80 overflow-y-auto pr-2">
                  <DocumentPreviewRenderer content={art.conteudo} />
                </div>
              </div>
            )}

            {/* Linked Atendimentos */}
            {art.atendimentosVinculados && art.atendimentosVinculados.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Atendimentos Vinculados ({art.atendimentosVinculados.length})
                </span>
                <div className="space-y-1.5">
                  {art.atendimentosVinculados.map((atd) => (
                    <div key={atd.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{atd.codigo}</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{atd.assunto}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{atd.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Registros */}
            {art.registrosVinculados && art.registrosVinculados.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Registros Vinculados ({art.registrosVinculados.length})
                </span>
                <div className="space-y-1.5">
                  {art.registrosVinculados.map((reg) => (
                    <div key={reg.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{reg.codigo}</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{reg.titulo}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{reg.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {art.tags && art.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {art.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Autor / Criação
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {art.autor} em {art.dataCriacao}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Última Atualização
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {art.ultimaAtualizacao || art.dataCriacao}
                </span>
              </div>
            </div>

            {art.anexos && art.anexos.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Anexos ({art.anexos.length})
                </span>
                <div className="space-y-1.5">
                  {art.anexos.map((anexo) => (
                    <div key={anexo.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{anexo.nome}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{anexo.tamanho}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline History */}
            {art.timelineEvents && art.timelineEvents.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Histórico de Atividades ({art.timelineEvents.length})
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {art.timelineEvents.map((evt) => (
                    <div key={evt.id} className="text-xs p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{evt.autor}</span>
                        <span>{evt.data}</span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{evt.titulo}</p>
                      {evt.descricao && <p className="text-slate-600 dark:text-slate-400 mt-0.5">{evt.descricao}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'cliente': {
        const cli = data as Cliente;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                  {cli.codigo}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {cli.nomeFantasia || cli.razaoSocial}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Razão Social: <strong className="text-slate-700 dark:text-slate-200">{cli.razaoSocial}</strong>
                </p>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${getBadgeStyle(
                  cli.status
                )}`}
              >
                {cli.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  CNPJ
                </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {cli.cnpj || 'Não informado'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Responsável
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {cli.responsavel}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Cidade / Estado
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {cli.cidade} - {cli.estado}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Atendimentos
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {cli.qtdAtendimentos} chamados registrados
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'recent_activity': {
        const act = data as RecentActivity;
        return (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                {act.type.toUpperCase()}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                {act.title}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5" />
                Registrado em {act.timestamp}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Resumo da Atividade
              </span>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                {act.description}
              </p>
            </div>
          </div>
        );
      }

      case 'modulo': {
        const mod = data as ModuloItem;
        return (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                  {mod.codigo}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getBadgeStyle(mod.status)}`}>
                  {mod.status}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                {mod.nome}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-indigo-500" />
                Sistema: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{mod.sistemaNome}</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Descrição do Módulo
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {mod.descricao || 'Nenhuma descrição fornecida.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Atendimentos Relacionados
                </span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                  {mod.qtdAtendimentos ?? 0} chamados
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Registros Relacionados
                </span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                  {mod.qtdRegistros ?? 0} registros
                </span>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const getEntityTitle = () => {
    switch (entityType) {
      case 'equipamento':
        return 'Visualização Rápida de Equipamento';
      case 'atendimento':
        return 'Visualização Rápida de Atendimento';
      case 'registro':
        return 'Visualização Rápida de Registro';
      case 'artigo':
        return 'Visualização Rápida de Artigo';
      case 'cliente':
        return 'Visualização Rápida de Cliente';
      case 'recent_activity':
        return 'Visualização Rápida de Evento';
      case 'modulo':
        return 'Visualização Rápida de Módulo';
      default:
        return 'Visualização Rápida';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-lg h-full p-6 shadow-2xl relative space-y-5 animate-in slide-in-from-right duration-300 flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {getEntityTitle()}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                SIGI Consulta Rápida
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Summary Content */}
        {renderContent()}

        {/* Actions Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenWorkspace(entityType, data);
            }}
            type="button"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Abrir Workspace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
