import React, { useState, useEffect } from 'react';
import { X, Headphones, Save, User, Building2, Tag, CheckCircle2, HelpCircle, FileText } from 'lucide-react';
import { AtendimentoItem, Cliente, AnexoItem, SystemTablesData, SistemaModuloVinculo, UserAccount } from '../../types';
import { AttachmentSection } from '../common/AttachmentSection';
import { initialUsers } from '../../data/mockUsers';

interface AtendimentoFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (atendimento: AtendimentoItem) => void;
  editingAtendimento?: AtendimentoItem | null;
  initialCliente?: Cliente | null;
  clients: Cliente[];
  systemTables?: SystemTablesData;
  systemUsers?: UserAccount[];
  onShowToast?: (title: string, message: string) => void;
}

export const AtendimentoFormDrawer: React.FC<AtendimentoFormDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAtendimento,
  initialCliente,
  clients,
  systemTables,
  systemUsers: propSystemUsers,
  onShowToast
}) => {
  const [codigo, setCodigo] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [assunto, setAssunto] = useState('');
  const [prioridade, setPrioridade] = useState<'Baixa' | 'Média' | 'Alta' | 'Urgente'>('Média');
  const [status, setStatus] = useState<any>('Aberto');
  const [responsavel, setResponsavel] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [solucaoAplicada, setSolucaoAplicada] = useState('');

  // Procedimento Cliente
  const [clientePoderiaExecutar, setClientePoderiaExecutar] = useState<'Sim' | 'Não'>('Não');
  const [motivoProcedimento, setMotivoProcedimento] = useState('');

  // Apoio Interno
  const [necessitouApoioInterno, setNecessitouApoioInterno] = useState<'Sim' | 'Não'>('Não');
  const [origemApoio, setOrigemApoio] = useState('');
  const [tipoApoio, setTipoApoio] = useState('');
  const [motivoApoioInterno, setMotivoApoioInterno] = useState('');

  // Sistemas / Módulos
  const [selectedSistemaId, setSelectedSistemaId] = useState('');
  const [selectedModuloNome, setSelectedModuloNome] = useState('');

  // System Users
  const [systemUsers, setSystemUsers] = useState<UserAccount[]>([]);

  // Attachments
  const [anexos, setAnexos] = useState<AnexoItem[]>([]);
  const [error, setError] = useState('');

  // Dynamic Lookup options from systemTables
  const statusOptions = systemTables?.statusAtendimento?.filter((i) => i.status === 'Ativo' || i.nome === editingAtendimento?.status) || [];
  const prioridadeOptions = systemTables?.prioridadesAtendimento?.filter((i) => i.status === 'Ativo' || i.nome === editingAtendimento?.prioridade) || [];
  const categoriaOptions = systemTables?.categoriasAtendimento?.filter((i) => i.status === 'Ativo' || i.nome === editingAtendimento?.categoria) || [];
  const motivoOptions = systemTables?.motivosAtendimento?.filter((i) => i.status === 'Ativo' || i.nome === editingAtendimento?.motivoProcedimento) || [];
  const setorApoioOptions = systemTables?.setoresApoio?.filter((i) => i.status === 'Ativo' || i.nome === editingAtendimento?.origemApoio) || [];
  const sistemasList = systemTables?.sistemas?.filter((i) => i.status === 'Ativo' || i.nome === editingAtendimento?.sistema) || [];
  const modulosList = systemTables?.modulos?.filter((i) => i.status === 'Ativo' || i.nome === editingAtendimento?.modulo) || [];

  useEffect(() => {
    // Carregar usuários do sistema
    let loadedUsers = propSystemUsers || [];
    if (loadedUsers.length === 0) {
      const saved = localStorage.getItem('sip_users');
      if (saved) {
        try {
          loadedUsers = JSON.parse(saved);
        } catch (e) {
          loadedUsers = initialUsers;
        }
      } else {
        loadedUsers = initialUsers;
      }
    }
    const activeUsers = loadedUsers.filter((u) => u.status === 'Ativo');
    setSystemUsers(loadedUsers);

    if (editingAtendimento) {
      setCodigo(editingAtendimento.codigo || `#ATD-${Math.floor(1000 + Math.random() * 9000)}`);
      setClienteId(editingAtendimento.clienteId || '');
      setAssunto(editingAtendimento.assunto || '');
      setPrioridade(editingAtendimento.prioridade || 'Média');
      setStatus(editingAtendimento.status || 'Aberto');
      setResponsavel(editingAtendimento.responsavel || (activeUsers[0]?.name || 'Suporte Técnico'));
      setCategoria(editingAtendimento.categoria || categoriaOptions[0]?.nome || '');
      setDescricao(editingAtendimento.descricao || '');
      setSolucaoAplicada(editingAtendimento.solucaoAplicada || '');
      setClientePoderiaExecutar(editingAtendimento.clientePoderiaExecutar || 'Não');
      setMotivoProcedimento(editingAtendimento.motivoProcedimento || '');
      setNecessitouApoioInterno(editingAtendimento.necessitouApoioInterno || 'Não');
      setOrigemApoio(editingAtendimento.origemApoio || '');
      setTipoApoio(editingAtendimento.tipoApoio || '');
      setMotivoApoioInterno(editingAtendimento.motivoApoioInterno || '');
      setAnexos(editingAtendimento.anexos || []);

      // Preencher sistema/módulo vinculados
      const firstVinculo = editingAtendimento.sistemasModulos?.[0];
      const systemName = firstVinculo?.sistema || editingAtendimento.modulo;
      const systemObj = systemTables?.sistemas?.find((s) => s.nome === systemName);
      setSelectedSistemaId(systemObj ? systemObj.id : '');
      setSelectedModuloNome(firstVinculo?.modulo || '');
    } else {
      setCodigo(`#ATD-${Math.floor(1000 + Math.random() * 9000)}`);
      setClienteId(initialCliente?.id || ((clients || [])[0]?.id || ''));
      setAssunto('');
      setPrioridade('Média');
      setStatus('Aberto');
      setResponsavel(activeUsers[0]?.name || 'Suporte Técnico');
      setCategoria(categoriaOptions[0]?.nome || '');
      setDescricao('');
      setSolucaoAplicada('');
      setClientePoderiaExecutar('Não');
      setMotivoProcedimento(motivoOptions[0]?.nome || '');
      setNecessitouApoioInterno('Não');
      setOrigemApoio(setorApoioOptions[0]?.nome || '');
      setTipoApoio('');
      setMotivoApoioInterno('');
      setAnexos([]);
      setSelectedSistemaId('');
      setSelectedModuloNome('');
    }
    setError('');
  }, [editingAtendimento, initialCliente, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de campos obrigatórios
    if (!assunto.trim()) {
      setError('O campo "Assunto / Título do Atendimento" é obrigatório.');
      return;
    }
    if (!responsavel || !responsavel.trim()) {
      setError('O campo "Responsável" é obrigatório.');
      return;
    }
    if (!selectedSistemaId) {
      setError('O campo "Sistema Vinculado" é obrigatório.');
      return;
    }
    if (!descricao || !descricao.trim()) {
      setError('O campo "Descrição do Problema / Relato do Cliente" é obrigatório.');
      return;
    }
    if (!solucaoAplicada || !solucaoAplicada.trim()) {
      setError('O campo "Solução Aplicada" é obrigatório.');
      return;
    }

    const matchedClient = clients.find((c) => c.id === clienteId);

    const sistemasModulosVinculo: SistemaModuloVinculo[] = [];
    if (selectedSistemaId) {
      const sisObj = sistemasList.find((s) => s.id === selectedSistemaId);
      if (sisObj) {
        sistemasModulosVinculo.push({
          sistema: sisObj.nome,
          modulo: selectedModuloNome || undefined
        });
      }
    }

    const atendimentoToSave: AtendimentoItem = {
      id: editingAtendimento?.id || `atd-${Date.now()}`,
      codigo: codigo || `#ATD-${Math.floor(1000 + Math.random() * 9000)}`,
      assunto: assunto.trim(),
      descricao: descricao.trim() || undefined,
      prioridade,
      status,
      dataAbertura: editingAtendimento?.dataAbertura || new Date().toLocaleString('pt-BR'),
      responsavel: responsavel.trim() || 'Suporte Técnico',
      clienteId: clienteId || undefined,
      clienteNome: matchedClient ? matchedClient.razaoSocial : 'Cliente Geral',
      categoria: categoria || undefined,
      solucaoAplicada: solucaoAplicada.trim() || undefined,
      clientePoderiaExecutar,
      motivoProcedimento: clientePoderiaExecutar === 'Sim' ? motivoProcedimento : undefined,
      necessitouApoioInterno,
      origemApoio: necessitouApoioInterno === 'Sim' ? origemApoio : undefined,
      tipoApoio: necessitouApoioInterno === 'Sim' ? tipoApoio : undefined,
      motivoApoioInterno: necessitouApoioInterno === 'Sim' ? motivoApoioInterno.trim() : undefined,
      sistemasModulos: sistemasModulosVinculo.length > 0 ? sistemasModulosVinculo : editingAtendimento?.sistemasModulos,
      anexos: anexos
    };

    onSave(atendimentoToSave);
    if (onShowToast) {
      onShowToast(
        editingAtendimento ? 'Atendimento Atualizado' : 'Novo Atendimento Registrado',
        `Chamado "${atendimentoToSave.codigo}" salvo com sucesso.`
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingAtendimento ? 'Editar Atendimento' : 'Novo Atendimento'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formulário fixo e padronizado de atendimento com suporte a anexos SMB e colagem de prints.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Cliente & Dados Básicos
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cliente *
                </label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {(clients || []).map((cli) => (
                    <option key={cli.id} value={cli.id}>
                      {cli.razaoSocial} ({cli.cidade})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assunto / Título do Atendimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Erro ao emitir NFC-e - Rejeição 539"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Responsável *
                </label>
                <select
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">Selecione o Responsável</option>
                  {systemUsers.filter(u => u.status === 'Ativo').map((usr) => (
                    <option key={usr.id} value={usr.name}>
                      {usr.name} ({usr.funcao})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Config options */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Tag className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Classificação & Tabelas do Sistema
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {statusOptions.length > 0 ? (
                    statusOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Aberto">Aberto</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Aguardando Cliente">Aguardando Cliente</option>
                      <option value="Resolvido">Resolvido</option>
                      <option value="Concluído">Concluído</option>
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
                  onChange={(e) => setPrioridade(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {categoriaOptions.length > 0 ? (
                    categoriaOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Dúvida">Dúvida</option>
                      <option value="Erro">Erro</option>
                      <option value="Configuração">Configuração</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Sistemas e Módulos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sistema Vinculado *
                </label>
                <select
                  value={selectedSistemaId}
                  onChange={(e) => {
                    setSelectedSistemaId(e.target.value);
                    setSelectedModuloNome('');
                  }}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
                  Módulo Vinculado
                </label>
                <select
                  value={selectedModuloNome}
                  onChange={(e) => setSelectedModuloNome(e.target.value)}
                  disabled={!selectedSistemaId}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-50"
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

          {/* Section 3: Procedimento Cliente & Apoio Interno */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Procedimento & Apoio Interno
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  O cliente poderia executar este procedimento sozinho?
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="clientePoderia"
                      value="Sim"
                      checked={clientePoderiaExecutar === 'Sim'}
                      onChange={() => setClientePoderiaExecutar('Sim')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="clientePoderia"
                      value="Não"
                      checked={clientePoderiaExecutar === 'Não'}
                      onChange={() => setClientePoderiaExecutar('Não')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    Não
                  </label>
                </div>

                {clientePoderiaExecutar === 'Sim' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Motivo
                    </label>
                    <select
                      value={motivoProcedimento}
                      onChange={(e) => setMotivoProcedimento(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                    >
                      {motivoOptions.map((opt) => (
                        <option key={opt.id} value={opt.nome}>
                          {opt.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Necessitou de Apoio Interno Especializado?
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="necessitouApoio"
                      value="Sim"
                      checked={necessitouApoioInterno === 'Sim'}
                      onChange={() => setNecessitouApoioInterno('Sim')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="necessitouApoio"
                      value="Não"
                      checked={necessitouApoioInterno === 'Não'}
                      onChange={() => setNecessitouApoioInterno('Não')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    Não
                  </label>
                </div>

                {necessitouApoioInterno === 'Sim' && (
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Setor
                        </label>
                        <select
                          value={origemApoio}
                          onChange={(e) => setOrigemApoio(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                        >
                          <option value="">Selecione o Setor</option>
                          {setorApoioOptions.map((opt) => (
                            <option key={opt.id} value={opt.nome}>
                              {opt.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Colaborador
                        </label>
                        <select
                          value={tipoApoio}
                          onChange={(e) => setTipoApoio(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                        >
                          <option value="">Selecione o Colaborador</option>
                          {systemUsers.filter(u => u.status === 'Ativo').map((usr) => (
                            <option key={usr.id} value={usr.name}>
                              {usr.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Motivo do Apoio Interno (Por escrito)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Descreva por escrito o motivo pelo qual necessitou do apoio interno..."
                        value={motivoApoioInterno}
                        onChange={(e) => setMotivoApoioInterno(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Description & Solution */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <FileText className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Detalhamento & Solução
              </h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Descrição do Problema / Relato do Cliente *
              </label>
              <textarea
                rows={3}
                placeholder="Descreva detalhadamente a solicitação do cliente..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Solução Aplicada *
              </label>
              <textarea
                rows={3}
                placeholder="Descreva o procedimento realizado para solucionar..."
                value={solucaoAplicada}
                onChange={(e) => setSolucaoAplicada(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 5: Attachment Area */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs">
            <AttachmentSection
              anexos={anexos}
              onChangeAnexos={setAnexos}
              entityPrefix="ATD"
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
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Atendimento</span>
          </button>
        </div>
      </div>
    </div>
  );
};
