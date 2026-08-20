import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Save, Bug, Tag, FileText, User } from 'lucide-react';
import { RegistroItem, Cliente, AnexoItem, SystemTablesData, UserAccount } from '../../types';
import { AttachmentSection } from '../common/AttachmentSection';

interface RegistroFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (registro: RegistroItem) => void;
  editingRegistro?: RegistroItem | null;
  clients: Cliente[];
  systemTables?: SystemTablesData;
  systemUsers?: UserAccount[];
  onShowToast?: (title: string, message: string) => void;
}

export const RegistroFormDrawer: React.FC<RegistroFormDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRegistro,
  clients,
  systemTables,
  systemUsers = [],
  onShowToast
}) => {
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<any>('Média');
  const [status, setStatus] = useState<any>('Em Análise');
  const [sistema, setSistema] = useState('');
  const [modulo, setModulo] = useState('');
  const [impacto, setImpacto] = useState('Baixo');
  const [reportadoPor, setReportadoPor] = useState<'Cliente' | 'Infoserra'>('Cliente');
  const [clienteId, setClienteId] = useState('');
  const [analiseTecnica, setAnaliseTecnica] = useState('');
  const [autor, setAutor] = useState('');
  const [anexos, setAnexos] = useState<AnexoItem[]>([]);
  const [error, setError] = useState('');

  // Sistemas / Módulos
  const [selectedSistemaId, setSelectedSistemaId] = useState('');
  const [selectedModuloNome, setSelectedModuloNome] = useState('');

  // Lookup options from systemTables
  const tipoOptions = systemTables?.tiposRegistro?.filter((i) => i.status === 'Ativo' || i.nome === editingRegistro?.tipo) || [];
  const rawStatusOptions = systemTables?.statusRegistro?.filter((i) => i.status === 'Ativo' || i.nome === editingRegistro?.status) || [];
  const prioridadeOptions = systemTables?.prioridadesRegistro?.filter((i) => i.status === 'Ativo' || i.nome === editingRegistro?.prioridade) || [];
  const impactoOptions = systemTables?.impactosRegistro?.filter((i) => i.status === 'Ativo' || i.nome === editingRegistro?.impacto) || [];
  const sistemasList = systemTables?.sistemas?.filter((i) => i.status === 'Ativo' || i.nome === editingRegistro?.sistema) || [];
  const modulosList = systemTables?.modulos?.filter((i) => i.status === 'Ativo' || i.nome === editingRegistro?.modulo) || [];

  // Use all active status options from system tables
  const statusOptions = rawStatusOptions;

  const handleTipoChange = (newTipo: string) => {
    setTipo(newTipo);
  };

  useEffect(() => {
    if (editingRegistro) {
      setCodigo(editingRegistro.codigo || `#REG-${Math.floor(1000 + Math.random() * 9000)}`);
      setTipo(editingRegistro.tipo || tipoOptions[0]?.nome || '');
      setTitulo(editingRegistro.titulo || '');
      setDescricao(editingRegistro.descricao || '');
      setPrioridade(editingRegistro.prioridade || prioridadeOptions[0]?.nome || '');
      setStatus(editingRegistro.status || statusOptions[0]?.nome || '');
      setImpacto(editingRegistro.impacto || impactoOptions[0]?.nome || 'Baixo');
      setReportadoPor((editingRegistro.reportadoPor as any) || (editingRegistro.clienteId ? 'Cliente' : 'Infoserra'));
      setClienteId(editingRegistro.clienteId || '');
      setAnaliseTecnica(editingRegistro.analiseTecnica || '');
      setAutor(editingRegistro.autor || '');
      setAnexos(editingRegistro.anexos || []);

      // Preencher sistema/módulo vinculados
      const systemObj = systemTables?.sistemas?.find((s) => s.nome === editingRegistro.sistema);
      setSelectedSistemaId(systemObj ? systemObj.id : '');
      setSelectedModuloNome(editingRegistro.modulo || '');
    } else {
      setCodigo(`#REG-${Math.floor(1000 + Math.random() * 9000)}`);
      setTipo(tipoOptions[0]?.nome || '');
      setTitulo('');
      setDescricao('');
      setPrioridade(prioridadeOptions[0]?.nome || '');
      setStatus(statusOptions[0]?.nome || '');
      setImpacto(impactoOptions[0]?.nome || 'Baixo');
      setReportadoPor('Cliente');
      setClienteId('');
      setAnaliseTecnica('');
      setAutor('');
      setAnexos([]);
      setSelectedSistemaId('');
      setSelectedModuloNome('');
    }
    setError('');
  }, [editingRegistro, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('O título do registro é obrigatório.');
      return;
    }

    const isClienteOrigin = reportadoPor === 'Cliente' && (tipo === 'Bug' || tipo === 'Melhoria' || tipo === 'Solicitação de Feature');
    const matchedClient = isClienteOrigin ? (clients || []).find((c) => c.id === clienteId) : undefined;
    const sisObj = sistemasList.find((s) => s.id === selectedSistemaId);

    const hasImpacto = tipo === 'Melhoria' || tipo === 'Solicitação de Feature';
    const hasReportado = tipo === 'Bug' || tipo === 'Melhoria' || tipo === 'Solicitação de Feature';

    let dataEmDesenv = editingRegistro?.dataEmDesenvolvimento;
    if (status === 'Em Desenvolvimento' && !dataEmDesenv) {
      dataEmDesenv = new Date().toISOString();
    }

    const registroToSave: RegistroItem = {
      id: editingRegistro?.id || `reg-${Date.now()}`,
      codigo: codigo || `#REG-${Math.floor(1000 + Math.random() * 9000)}`,
      tipo,
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      sistema: sisObj ? sisObj.nome : undefined,
      modulo: selectedModuloNome || undefined,
      impacto: hasImpacto ? impacto : undefined,
      status,
      dataEmDesenvolvimento: dataEmDesenv,
      prioridade,
      reportadoPor: hasReportado ? reportadoPor : undefined,
      solicitanteTipo: hasReportado ? reportadoPor : undefined,
      data: editingRegistro?.data || new Date().toLocaleDateString('pt-BR'),
      ultimaAtualizacao: new Date().toLocaleDateString('pt-BR'),
      autor: autor || 'Sistema',
      clienteId: isClienteOrigin ? clienteId || undefined : undefined,
      clienteNome: isClienteOrigin ? (matchedClient ? matchedClient.razaoSocial : undefined) : (hasReportado ? 'Infoserra' : undefined),
      analiseTecnica: analiseTecnica.trim() || undefined,
      anexos
    };

    onSave(registroToSave);
    if (onShowToast) {
      onShowToast(
        editingRegistro ? 'Registro Atualizado' : 'Novo Registro Criado',
        `Demanda "${registroToSave.codigo}" salva com sucesso.`
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingRegistro ? 'Editar Registro' : 'Novo Registro Técnico'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formulário fixo para bugs, melhorias, ideias e tarefas técnicas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Section 1: Identificação do Registro */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Identificação do Registro
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={codigo}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-extrabold text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Registro *
                </label>
                <select
                  value={tipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {tipoOptions.length > 0 ? (
                    tipoOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : null}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Título do Registro *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Título descritivo do Bug, Melhoria, Ideia ou Feature"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 2: Sistemas e Módulos */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Tag className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Sistemas e Módulos
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sistema *
                </label>
                <select
                  value={selectedSistemaId}
                  onChange={(e) => {
                    setSelectedSistemaId(e.target.value);
                    setSelectedModuloNome('');
                  }}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="">Selecione o Sistema *</option>
                  {sistemasList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Módulo
                </label>
                <select
                  value={selectedModuloNome}
                  onChange={(e) => setSelectedModuloNome(e.target.value)}
                  disabled={!selectedSistemaId}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden disabled:opacity-50"
                >
                  <option value="">Selecione o Módulo</option>
                  {modulosList
                    .filter((m) => m.sistemaId === selectedSistemaId)
                    .map((m) => (
                      <option key={m.id} value={m.nome}>
                        {m.nome}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Atributos do Modelo */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Tag className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Atributos do Modelo ({tipo})
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {statusOptions.length > 0 ? (
                    statusOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Em Análise">Em Análise</option>
                      <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Reparado">Reparado</option>
                      <option value="Não Aprovado">Não Aprovado</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {prioridadeOptions.length > 0 ? (
                    prioridadeOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                      <option value="Urgente">Urgente</option>
                    </>
                  )}
                </select>
              </div>

              {/* Nivel de Impacto: Only for Melhoria or Solicitacao de Feature */}
              {(tipo === 'Melhoria' || tipo === 'Solicitação de Feature') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nível de Impacto *
                  </label>
                  <select
                    value={impacto}
                    onChange={(e) => setImpacto(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {impactoOptions.length > 0 ? (
                      impactoOptions.map((opt) => (
                        <option key={opt.id} value={opt.nome}>
                          {opt.nome}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Alto">Alto</option>
                        <option value="Médio">Médio</option>
                        <option value="Baixo">Baixo</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Autor / Responsável
                </label>
                <select
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="">Selecione...</option>
                  {systemUsers.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reportado / Solicitante (Bug, Melhoria, Solicitacao de Feature) */}
            {(tipo === 'Bug' || tipo === 'Melhoria' || tipo === 'Solicitação de Feature') && (
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tipo === 'Solicitação de Feature' ? 'Solicitante *' : 'Reportado por *'}
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="reportadoOrigin"
                      value="Cliente"
                      checked={reportadoPor === 'Cliente'}
                      onChange={() => setReportadoPor('Cliente')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    Cliente (Vínculo)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="reportadoOrigin"
                      value="Infoserra"
                      checked={reportadoPor === 'Infoserra'}
                      onChange={() => {
                        setReportadoPor('Infoserra');
                        setClienteId('');
                      }}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    Infoserra (Interno)
                  </label>
                </div>

                {reportadoPor === 'Cliente' && (
                  <div>
                    <select
                      value={clienteId}
                      onChange={(e) => setClienteId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    >
                      <option value="">Selecione o Cliente Vinculado...</option>
                      {(clients || []).map((cli) => (
                        <option key={cli.id} value={cli.id}>
                          {cli.razaoSocial}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Detalhamento Técnico */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <FileText className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Detalhamento Técnico
              </h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Descrição do Problema / Ideia
              </label>
              <textarea
                rows={3}
                placeholder="Passo a passo para reproduzir o bug ou detalhes da funcionalidade..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Análise Técnica / Solução Proposta
              </label>
              <textarea
                rows={3}
                placeholder="Notas técnicas de desenvolvimento, arquivo fonte alterado, etc..."
                value={analiseTecnica}
                onChange={(e) => setAnaliseTecnica(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 5: Attachments */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs">
            <AttachmentSection
              anexos={anexos}
              onChangeAnexos={setAnexos}
              entityPrefix="REG"
              onShowToast={onShowToast}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Registro</span>
          </button>
        </div>
      </div>
    </div>
  );
};
