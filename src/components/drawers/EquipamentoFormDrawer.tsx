import React, { useState, useEffect } from 'react';
import { X, HardDrive, Save, Tag, Building2, Wrench, FileText } from 'lucide-react';
import { EquipamentoItem, Cliente, AnexoItem, SystemTablesData } from '../../types';
import { AttachmentSection } from '../common/AttachmentSection';
import { DynamicFieldsForm } from '../common/DynamicFieldsForm';

interface EquipamentoFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipamento: EquipamentoItem) => void;
  editingEquipamento?: EquipamentoItem | null;
  clients?: Cliente[];
  clientId?: string;
  systemTables?: SystemTablesData;
  onShowToast?: (title: string, message: string) => void;
}

export const EquipamentoFormDrawer: React.FC<EquipamentoFormDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEquipamento,
  clients = [],
  clientId,
  systemTables,
  onShowToast
}) => {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [patrimonio, setPatrimonio] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Manutenção' | 'Desativado'>('Ativo');
  const [localizacao, setLocalizacao] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [anexos, setAnexos] = useState<AnexoItem[]>([]);
  const [error, setError] = useState('');

  // Conditional custom fields state
  const [camposEspecificos, setCamposEspecificos] = useState<Record<string, string>>({});

  // Lookup options from systemTables
  const tipoOptions = systemTables?.tiposEquipamento?.filter((i) => i.status === 'Ativo' || i.nome === editingEquipamento?.tipo) || [];
  const statusOptions = systemTables?.statusEquipamento?.filter((i) => i.status === 'Ativo' || i.nome === editingEquipamento?.status) || [];
  const localizacaoOptions = systemTables?.localizacoesEquipamento?.filter((i) => i.status === 'Ativo' || i.nome === editingEquipamento?.localizacao) || [];

  useEffect(() => {
    if (editingEquipamento) {
      setCodigo(editingEquipamento.codigo || `#EQP-${Math.floor(1000 + Math.random() * 9000)}`);
      setNome(editingEquipamento.nome || '');
      setTipo(editingEquipamento.tipo || tipoOptions[0]?.nome || 'Computador');
      setNumeroSerie(editingEquipamento.numeroSerie || '');
      setPatrimonio(editingEquipamento.patrimonio || '');
      setStatus(editingEquipamento.status || 'Ativo');
      setLocalizacao(editingEquipamento.localizacao || '');
      setClienteId(editingEquipamento.clienteId || clientId || '');
      setObservacoes(editingEquipamento.observacoes || '');
      setAnexos(editingEquipamento.anexos || []);
      
      // Load and migrate legacy fields if they exist as top-level fields
      const specs = editingEquipamento.camposEspecificos || {};
      const mergedSpecs = { ...specs };
      if (editingEquipamento.marcaModelo) mergedSpecs.marcaModelo = editingEquipamento.marcaModelo;
      if (editingEquipamento.ip) mergedSpecs.ip = editingEquipamento.ip;
      if (editingEquipamento.usuario) mergedSpecs.usuario = editingEquipamento.usuario;
      if (editingEquipamento.senha) mergedSpecs.senha = editingEquipamento.senha;
      if (editingEquipamento.dataInstalacao) mergedSpecs.dataInstalacao = editingEquipamento.dataInstalacao;
      setCamposEspecificos(mergedSpecs);
    } else {
      setCodigo(`#EQP-${Math.floor(1000 + Math.random() * 9000)}`);
      setNome('');
      setTipo(tipoOptions[0]?.nome || 'Computador');
      setNumeroSerie('');
      setPatrimonio('');
      setStatus('Ativo');
      setLocalizacao(localizacaoOptions[0]?.nome || 'CPD');
      setClienteId(clientId || (clients || [])[0]?.id || '');
      setObservacoes('');
      setAnexos([]);
      setCamposEspecificos({});
    }
    setError('');
  }, [editingEquipamento, isOpen, clientId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('O nome do equipamento é obrigatório.');
      return;
    }

    const matchedClient = (clients || []).find((c) => c.id === clienteId);

    const eqpToSave: EquipamentoItem = {
      id: editingEquipamento?.id || `eqp-${Date.now()}`,
      codigo: codigo || `#EQP-${Math.floor(1000 + Math.random() * 9000)}`,
      nome: nome.trim(),
      tipo,
      numeroSerie: numeroSerie.trim() || 'S/N',
      patrimonio: patrimonio.trim() || undefined,
      status,
      localizacao: localizacao || undefined,
      clienteId: clienteId || undefined,
      clienteNome: matchedClient ? matchedClient.razaoSocial : undefined,
      observacoes: observacoes.trim() || undefined,
      camposEspecificos,
      // Map properties for legacy compatibility/easy read elsewhere
      marcaModelo: camposEspecificos.marcaModelo || undefined,
      ip: camposEspecificos.ip || undefined,
      usuario: camposEspecificos.usuario || undefined,
      senha: camposEspecificos.senha || undefined,
      dataInstalacao: camposEspecificos.dataInstalacao || new Date().toLocaleDateString('pt-BR'),
      anexos
    };

    onSave(eqpToSave);
    if (onShowToast) {
      onShowToast(
        editingEquipamento ? 'Equipamento Atualizado' : 'Novo Equipamento Cadastrado',
        `"${eqpToSave.nome}" foi salvo com sucesso.`
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
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingEquipamento ? 'Editar Equipamento' : 'Novo Equipamento'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formulário fixo de inventário e equipamentos do cliente.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Section 1: Identificação & Cliente */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Identificação & Cliente
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
                  Cliente Proprietário *
                </label>
                {clientId || clients.length === 1 ? (
                  <div className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between cursor-not-allowed">
                    <span className="truncate">
                      {clients.find((c) => c.id === (clientId || clienteId || clients[0]?.id))?.razaoSocial || clients[0]?.razaoSocial || 'Cliente Proprietário'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[9px] text-slate-500 dark:text-slate-400 font-extrabold select-none shrink-0 uppercase tracking-wider">
                      Fixo
                    </span>
                  </div>
                ) : (
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {(clients || []).map((cli) => (
                      <option key={cli.id} value={cli.id}>
                        {cli.razaoSocial}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Equipamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Servidor Principal Dell R640"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Equipamento
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {tipoOptions.length > 0 ? (
                    tipoOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Servidores">Servidores</option>
                      <option value="Roteador">Roteador</option>
                      <option value="Computadores">Computadores</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Especificações Gerais */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Tag className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Especificações Gerais (Fixas)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Número de Série
                </label>
                <input
                  type="text"
                  placeholder="S/N"
                  value={numeroSerie}
                  onChange={(e) => setNumeroSerie(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Patrimônio / Tag
                </label>
                <input
                  type="text"
                  placeholder="PAT-001"
                  value={patrimonio}
                  onChange={(e) => setPatrimonio(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
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
                      <option value="Ativo">Ativo</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Desativado">Desativado</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Localização
                </label>
                <select
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {localizacaoOptions.length > 0 ? (
                    localizacaoOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>
                        {opt.nome}
                      </option>
                    ))
                  ) : (
                    <option value="CPD / Rack">CPD / Rack</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Conditional Specifications */}
          {(() => {
            const selectedTipoObj = systemTables?.tiposEquipamento?.find((t) => t.nome === tipo);
            if (selectedTipoObj?.camposDinamicos && selectedTipoObj.camposDinamicos.length > 0) {
              return (
                <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs">
                  <DynamicFieldsForm
                    title={`Campos Específicos para ${tipo}`}
                    fields={selectedTipoObj.camposDinamicos}
                    values={camposEspecificos}
                    onChange={(key, val) => setCamposEspecificos((prev) => ({ ...prev, [key]: val }))}
                  />
                </div>
              );
            }
            return null;
          })()}

          {/* Section 3: Observações */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <FileText className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Observações
              </h4>
            </div>

            <div>
              <textarea
                rows={3}
                placeholder="Detalhes adicionais do equipamento..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 4: Attachments */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs">
            <AttachmentSection
              anexos={anexos}
              onChangeAnexos={setAnexos}
              entityPrefix="EQP"
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
            <span>Salvar Equipamento</span>
          </button>
        </div>
      </div>
    </div>
  );
};
