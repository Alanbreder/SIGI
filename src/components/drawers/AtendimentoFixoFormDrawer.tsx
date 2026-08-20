import React, { useState, useEffect } from 'react';
import { X, Calendar, Save, Building2, Tag, FileText, Wrench, Pencil } from 'lucide-react';
import { AtendimentoFixoItem, Cliente, AnexoItem, SystemTablesData, EquipamentoManutencaoItem, UserAccount } from '../../types';
import { AttachmentSection } from '../common/AttachmentSection';
import { initialUsers } from '../../data/mockUsers';

interface AtendimentoFixoFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (atendimentoFixo: AtendimentoFixoItem) => void;
  editingAtendimentoFixo?: AtendimentoFixoItem | null;
  clients: Cliente[];
  systemTables?: SystemTablesData;
  onShowToast?: (title: string, message: string) => void;
}

export const AtendimentoFixoFormDrawer: React.FC<AtendimentoFixoFormDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAtendimentoFixo,
  clients,
  systemTables,
  onShowToast
}) => {
  const [codigo, setCodigo] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [unidade, setUnidade] = useState('');
  const [responsavelTecnico, setResponsavelTecnico] = useState('Suporte Técnico');
  const [dataManutencao, setDataManutencao] = useState('');
  const [proximaManutencao, setProximaManutencao] = useState('');
  const [status, setStatus] = useState<any>('Agendado');
  const [periodoManutencao, setPeriodoManutencao] = useState('Mensal');
  const [anotacoes, setAnotacoes] = useState('');
  const [anexos, setAnexos] = useState<AnexoItem[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipamentoManutencaoItem[]>([]);
  const [error, setError] = useState('');
  const [systemUsers, setSystemUsers] = useState<UserAccount[]>([]);

  // Editing individual equipment state within the drawer
  const [editingEqId, setEditingEqId] = useState<string | null>(null);

  // Local state for adding equipment in the drawer
  const [newEqNome, setNewEqNome] = useState('');
  const [newEqQtd, setNewEqQtd] = useState(1);
  const [newEqValor, setNewEqValor] = useState('');
  const [newEqOrigemCusto, setNewEqOrigemCusto] = useState('');

  // Dynamic Lookup options from systemTables
  const statusOptions = systemTables?.statusAtendimentoFixo?.filter((i) => i.status === 'Ativo' || i.nome === editingAtendimentoFixo?.status) || [];
  const manutencaoOptions = systemTables?.tiposManutencaoFixa?.filter((i) => i.status === 'Ativo' || i.nome === editingAtendimentoFixo?.periodoManutencao) || [];
  const origemCustoOptions = systemTables?.origensCusto?.filter((i) => i.status === 'Ativo') || [];

  const handleAddEquipment = () => {
    if (!newEqNome.trim()) return;

    if (editingEqId) {
      // Save edit
      setEquipamentos(equipamentos.map(eq => 
        eq.id === editingEqId 
          ? { 
              ...eq, 
              nome: newEqNome.trim(), 
              quantidade: newEqQtd, 
              valorUnitario: newEqValor ? parseFloat(newEqValor) : undefined,
              origemCusto: newEqOrigemCusto || undefined,
              cobrarNaMensalidade: newEqOrigemCusto?.includes('Infoserra')
            } 
          : eq
      ));
      setEditingEqId(null);
    } else {
      // Add new
      const item: EquipamentoManutencaoItem = {
        id: `eq-${Date.now()}`,
        nome: newEqNome.trim(),
        quantidade: newEqQtd,
        valorUnitario: newEqValor ? parseFloat(newEqValor) : undefined,
        origemCusto: newEqOrigemCusto || undefined,
        tipo: 'Peça de Reposição',
        cobrarNaMensalidade: newEqOrigemCusto?.includes('Infoserra')
      };
      setEquipamentos([...equipamentos, item]);
    }

    setNewEqNome('');
    setNewEqQtd(1);
    setNewEqValor('');
    setNewEqOrigemCusto('');
  };

  const handleEditEquipment = (eq: EquipamentoManutencaoItem) => {
    setEditingEqId(eq.id);
    setNewEqNome(eq.nome);
    setNewEqQtd(eq.quantidade);
    setNewEqValor(eq.valorUnitario?.toString() || '');
    setNewEqOrigemCusto(eq.origemCusto || '');
  };

  const handleCancelEditEquipment = () => {
    setEditingEqId(null);
    setNewEqNome('');
    setNewEqQtd(1);
    setNewEqValor('');
    setNewEqOrigemCusto('');
  };

  const handleRemoveEquipment = (id: string) => {
    setEquipamentos(equipamentos.filter((e) => e.id !== id));
  };

  useEffect(() => {
    // Carregar usuários do sistema
    const saved = localStorage.getItem('sip_users');
    if (saved) {
      try {
        setSystemUsers(JSON.parse(saved));
      } catch (e) {
        setSystemUsers(initialUsers);
      }
    } else {
      setSystemUsers(initialUsers);
    }

    if (editingAtendimentoFixo) {
      setCodigo(editingAtendimentoFixo.codigo || `#FIX-${Math.floor(1000 + Math.random() * 9000)}`);
      setClienteId(editingAtendimentoFixo.clienteId || '');
      setUnidade(editingAtendimentoFixo.unidade || '');
      setResponsavelTecnico(editingAtendimentoFixo.responsavelTecnico || 'Suporte Técnico');
      setDataManutencao(editingAtendimentoFixo.dataManutencao || new Date().toISOString().split('T')[0]);
      setProximaManutencao(editingAtendimentoFixo.proximaManutencao || '');
      setStatus(editingAtendimentoFixo.status || 'Agendado');
      setPeriodoManutencao(editingAtendimentoFixo.periodoManutencao || 'Mensal');
      setAnotacoes(editingAtendimentoFixo.anotacoes || '');
      setAnexos(editingAtendimentoFixo.anexos || []);
      setEquipamentos(editingAtendimentoFixo.equipamentos || []);
    } else {
      setCodigo(`#FIX-${Math.floor(1000 + Math.random() * 9000)}`);
      setClienteId((clients || [])[0]?.id || '');
      setUnidade('');
      setResponsavelTecnico('Suporte Técnico');
      setDataManutencao(new Date().toISOString().split('T')[0]);
      setProximaManutencao('');
      setStatus('Agendado');
      setPeriodoManutencao('Mensal');
      setAnotacoes('');
      setAnexos([]);
      setEquipamentos([]);
    }
    setError('');
    setEditingEqId(null);
    setNewEqNome('');
    setNewEqQtd(1);
    setNewEqValor('');
    setNewEqOrigemCusto('');
  }, [editingAtendimentoFixo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      setError('Selecione um cliente para a manutenção fixa.');
      return;
    }
    if (!responsavelTecnico) {
      setError('Selecione o Responsável Técnico da manutenção.');
      return;
    }

    const matchedClient = (clients || []).find((c) => c.id === clienteId);

    const fixoToSave: AtendimentoFixoItem = {
      id: editingAtendimentoFixo?.id || `fix-${Date.now()}`,
      codigo: codigo || `#FIX-${Math.floor(1000 + Math.random() * 9000)}`,
      clienteId,
      clienteNome: matchedClient ? matchedClient.razaoSocial : 'Cliente Geral',
      unidade,
      responsavelTecnico: responsavelTecnico.trim() || 'Suporte Técnico',
      dataManutencao: dataManutencao || new Date().toLocaleDateString('pt-BR'),
      proximaManutencao,
      status,
      periodoManutencao,
      anotacoes: anotacoes.trim() || 'Manutenção de rotina contratual.',
      equipamentos,
      anexos
    };

    onSave(fixoToSave);
    if (onShowToast) {
      onShowToast(
        editingAtendimentoFixo ? 'Atendimento Fixo Atualizado' : 'Manutenção Agendada',
        `Manutenção "${fixoToSave.codigo}" salva com sucesso.`
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
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingAtendimentoFixo ? 'Editar Atendimento Fixo' : 'Novo Atendimento Fixo'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formulário de manutenção preventiva periódica e controle contratual.
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

          {/* Section 1: Cliente & Responsável */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Building2 className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Cliente & Responsável
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
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {(clients || []).map((cli) => (
                    <option key={cli.id} value={cli.id}>
                      {cli.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Unidade / Local
                </label>
                <input
                  type="text"
                  placeholder="Ex: Matriz, Filial 01..."
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Data Programada
                </label>
                <input
                  type="date"
                  value={dataManutencao}
                  onChange={(e) => setDataManutencao(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Próxima Manutenção
                </label>
                <input
                  type="date"
                  value={proximaManutencao}
                  onChange={(e) => setProximaManutencao(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status da Manutenção
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
                      <option value="Agendado">Agendado</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Aguardando">Aguardando</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Responsável Técnico *
                </label>
                <select
                  value={responsavelTecnico}
                  onChange={(e) => setResponsavelTecnico(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="">Selecione o Técnico</option>
                  {systemUsers.filter(u => u.status === 'Ativo').map((usr) => (
                    <option key={usr.id} value={usr.name}>
                      {usr.name} ({usr.funcao})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Frequência / Tipo
                </label>
                <select
                  value={periodoManutencao}
                  onChange={(e) => setPeriodoManutencao(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {manutencaoOptions.length > 0 ? (
                    manutencaoOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Mensal">Manutenção Preventiva Mensal</option>
                      <option value="Trimestral">Manutenção Trimestral</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Anotações da Manutenção */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <FileText className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Anotações da Manutenção
              </h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Laudo Técnico / Observações
              </label>
              <textarea
                rows={4}
                placeholder="Checklist de limpeza de coolers, testes de nobreak, verificação de backup, etc..."
                value={anotacoes}
                onChange={(e) => setAnotacoes(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 3: Equipamentos / Peças / Custos */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Wrench className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Equipamentos / Peças / Custos
              </h4>
            </div>

            {/* Equipment List */}
            {equipamentos.length > 0 && (
              <div className="space-y-2 mb-4">
                {equipamentos.map((eq) => (
                    <div key={eq.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{eq.nome}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500">Qtd: {eq.quantidade}</span>
                          {eq.valorUnitario && (
                            <span className="text-[10px] text-slate-500">• R$ {eq.valorUnitario.toFixed(2)}</span>
                          )}
                          {eq.origemCusto && (
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                              eq.origemCusto.includes('Infoserra') 
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                                : eq.origemCusto.includes('Cliente')
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            }`}>
                              {eq.origemCusto}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditEquipment(eq)}
                          className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipment(eq.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            )}

            {/* Add Equipment Row */}
            <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Item / Peça</label>
                  <input
                    type="text"
                    placeholder="Ex: Teclado USB, SSD 240GB..."
                    value={newEqNome}
                    onChange={(e) => setNewEqNome(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Origem do Custo</label>
                  <select
                    value={newEqOrigemCusto}
                    onChange={(e) => setNewEqOrigemCusto(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="">Selecione...</option>
                    {origemCustoOptions.map(opt => (
                      <option key={opt.id} value={opt.nome}>{opt.nome}</option>
                    ))}
                    {origemCustoOptions.length === 0 && (
                      <>
                        <option value="Pago pelo Cliente">Pago pelo Cliente</option>
                        <option value="Infoserra (Valor a Receber)">Infoserra (Valor a Receber)</option>
                        <option value="Sucata do Cliente">Sucata do Cliente</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className={`flex-1 px-3 py-2 ${editingEqId ? 'bg-amber-500' : 'bg-slate-900 dark:bg-slate-100'} text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity`}
                  >
                    {editingEqId ? 'Atualizar Item' : 'Adicionar Item'}
                  </button>
                  {editingEqId && (
                    <button
                      type="button"
                      onClick={handleCancelEditEquipment}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={newEqQtd}
                    onChange={(e) => setNewEqQtd(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Valor Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={newEqValor}
                    onChange={(e) => setNewEqValor(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Attachments */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs">
            <AttachmentSection
              anexos={anexos}
              onChangeAnexos={setAnexos}
              entityPrefix="FIX"
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
            <span>Salvar Atendimento Fixo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
