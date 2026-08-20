import React, { useState, useEffect } from 'react';
import { X, Building2, Save, UserCheck, Phone, MapPin, Tag, Search, Loader2, AlertCircle, Plus, Trash2, Monitor, Server, HardDrive, FileText } from 'lucide-react';
import { Cliente, SystemTablesData } from '../../types';
import { DynamicFieldsForm } from '../common/DynamicFieldsForm';

interface ClienteFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Cliente) => void;
  editingCliente?: Cliente | null;
  systemTables?: SystemTablesData;
  onShowToast?: (title: string, message: string) => void;
}

export const ClienteFormDrawer: React.FC<ClienteFormDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCliente,
  systemTables,
  onShowToast
}) => {
  const [codigo, setCodigo] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [tipoPessoa, setTipoPessoa] = useState<'J' | 'F'>('J');
  const [responsavel, setResponsavel] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('Nova Friburgo');
  const [estado, setEstado] = useState('RJ');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [segmento, setSegmento] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [sistemasModulos, setSistemasModulos] = useState<{ sistema: string; modulo?: string }[]>([]);
  const [quantidadeComputadores, setQuantidadeComputadores] = useState('');
  const [tipoInstalacao, setTipoInstalacao] = useState('');
  const [observacaoSistemas, setObservacaoSistemas] = useState('');
  const [error, setError] = useState('');
  const [camposEspecificos, setCamposEspecificos] = useState<Record<string, string>>({});

  const [selectedSistemaId, setSelectedSistemaId] = useState('');
  const [selectedModuloNome, setSelectedModuloNome] = useState('');

  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjError, setCnpjError] = useState('');

  // Get active options from system tables
  const statusOptions = systemTables?.statusCliente?.filter((i) => i.status === 'Ativo' || i.nome === editingCliente?.status) || [];
  const segmentoOptions = systemTables?.segmentosCliente?.filter((i) => i.status === 'Ativo' || i.nome === editingCliente?.segmento) || [];
  const classificacaoOptions = systemTables?.classificacoesCliente?.filter((i) => i.status === 'Ativo' || i.nome === editingCliente?.classificacao) || [];
  const tipoInstalacaoOptions = systemTables?.tiposInstalacao?.filter((i) => i.status === 'Ativo' || i.nome === editingCliente?.tipoInstalacao) || [];
  
  const sistemasList = systemTables?.sistemas?.filter((i) => i.status === 'Ativo') || [];
  const modulosList = systemTables?.modulos?.filter((i) => i.status === 'Ativo') || [];

  const handleAddSistemaModulo = () => {
    if (selectedSistemaId) {
      const sistemaObj = sistemasList.find(s => s.id === selectedSistemaId);
      if (sistemaObj) {
        // Prevent duplicate exact matches
        if (!sistemasModulos.some(sm => sm.sistema === sistemaObj.nome && sm.modulo === selectedModuloNome)) {
          setSistemasModulos([...sistemasModulos, { sistema: sistemaObj.nome, modulo: selectedModuloNome || undefined }]);
        }
        setSelectedSistemaId('');
        setSelectedModuloNome('');
      }
    }
  };

  const handleRemoveSistemaModulo = (index: number) => {
    setSistemasModulos(sistemasModulos.filter((_, i) => i !== index));
  };

  const formatDocumento = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    // CPF
    if (cleanValue.length <= 11) {
      if (cleanValue.length <= 3) return cleanValue;
      if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
      if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
      return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
    }
    
    // CNPJ
    if (cleanValue.length <= 14) {
      if (cleanValue.length <= 2) return cleanValue;
      if (cleanValue.length <= 5) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
      if (cleanValue.length <= 8) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
      if (cleanValue.length <= 12) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`;
      return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12, 14)}`;
    }

    return cleanValue.slice(0, 14);
  };

  const validarCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
  };

  const handleConsultarCnpj = async () => {
    const rawDoc = cnpj.replace(/\D/g, '');
    
    if (!rawDoc) {
      setCnpjError('Por favor, informe um CNPJ ou CPF válido.');
      return;
    }

    if (rawDoc.length !== 11 && rawDoc.length !== 14) {
      setCnpjError('O documento deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ).');
      return;
    }

    setLoadingCnpj(true);
    setCnpjError('');

    try {
      if (rawDoc.length === 11) {
        const isValid = validarCPF(rawDoc);
        setLoadingCnpj(false);
        
        if (!isValid) {
          setCnpjError('Este CPF não é válido. Por favor, verifique os números.');
          if (onShowToast) onShowToast('Erro de Validação', 'O CPF informado é inválido.', 'error');
          return;
        }

        setTipoPessoa('F');
        if (onShowToast) {
          onShowToast('CPF Válido', 'O CPF informado é válido. Como não há consulta pública para CPF, continue com o preenchimento manual.');
        }
        return;
      }

      // CNPJ Logic (Existing)
      setTipoPessoa('J');
      let data: any = null;
      let isCnpjWs = false;

      // Try publica.cnpj.ws first (has higher data quality, including emails)
      try {
        const response = await fetch(`https://publica.cnpj.ws/cnpj/${rawDoc}`);
        if (response.ok) {
          data = await response.json();
          isCnpjWs = true;
        }
      } catch (e) {
        // Silently catch and fallback to BrasilAPI
      }

      if (!isCnpjWs) {
        // Fallback to BrasilAPI
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawDoc}`);
        if (!response.ok) {
          throw new Error('Não foi possível encontrar este CNPJ.');
        }
        data = await response.json();
      }

      let mappedData = {
        razaoSocial: '',
        nomeFantasia: '',
        inscricaoEstadual: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        complemento: '',
        cidade: '',
        estado: '',
        email: '',
        telefone: '',
      };

      if (isCnpjWs) {
        const est = data.estabelecimento || {};
        mappedData.razaoSocial = data.razao_social || '';
        mappedData.nomeFantasia = est.nome_fantasia || '';
        mappedData.cep = est.cep ? est.cep.replace(/\D/g, '') : '';
        
        const ies = est.inscricoes_estaduais || data.inscricoes_estaduais || [];
        if (Array.isArray(ies) && ies.length > 0) {
          const activeIe = ies.find((i: any) => i.ativo) || ies[0];
          if (activeIe && activeIe.inscricao_estadual) {
            mappedData.inscricaoEstadual = activeIe.inscricao_estadual;
          }
        }
        
        const tipoLogradouro = est.tipo_logradouro || '';
        const logradouroName = est.logradouro || '';
        mappedData.logradouro = tipoLogradouro 
          ? `${tipoLogradouro} ${logradouroName}`.trim() 
          : logradouroName;
          
        mappedData.numero = est.numero || '';
        mappedData.bairro = est.bairro || '';
        mappedData.complemento = est.complemento || '';
        mappedData.cidade = est.cidade?.nome || '';
        mappedData.estado = est.estado?.sigla ? est.estado.sigla.toUpperCase() : '';
        mappedData.email = est.email ? est.email.toLowerCase() : '';
        
        const ddd = est.ddd1 || '';
        const tel = est.telefone1 || '';
        const rawPhone = `${ddd}${tel}`.replace(/\D/g, '');
        if (rawPhone) {
          if (rawPhone.length === 10) {
            mappedData.telefone = `(${rawPhone.slice(0, 2)}) ${rawPhone.slice(2, 6)}-${rawPhone.slice(6)}`;
          } else if (rawPhone.length === 11) {
            mappedData.telefone = `(${rawPhone.slice(0, 2)}) ${rawPhone.slice(2, 7)}-${rawPhone.slice(7)}`;
          } else {
            mappedData.telefone = rawPhone;
          }
        }
      } else {
        // BrasilAPI mapping
        mappedData.razaoSocial = data.razao_social || '';
        mappedData.nomeFantasia = data.nome_fantasia || '';
        mappedData.cep = data.cep ? data.cep.replace(/\D/g, '') : '';

        const ies = data.inscricoes_estaduais || data.estabelecimento?.inscricoes_estaduais || [];
        if (Array.isArray(ies) && ies.length > 0) {
          const activeIe = ies.find((i: any) => i.ativo) || ies[0];
          if (activeIe && activeIe.inscricao_estadual) {
            mappedData.inscricaoEstadual = activeIe.inscricao_estadual;
          }
        }
        
        const tipoLogradouro = data.descricao_tipo_de_logradouro || '';
        const logradouroName = data.logradouro || '';
        mappedData.logradouro = tipoLogradouro 
          ? `${tipoLogradouro} ${logradouroName}`.trim() 
          : logradouroName;
          
        mappedData.numero = data.numero || '';
        mappedData.bairro = data.bairro || '';
        mappedData.complemento = data.complemento || '';
        mappedData.cidade = data.municipio || '';
        mappedData.estado = data.uf ? data.uf.toUpperCase() : '';
        mappedData.email = data.email ? data.email.toLowerCase() : '';
        
        let formattedTelefone = data.ddd_telefone_1 || '';
        if (formattedTelefone) {
          formattedTelefone = formattedTelefone.replace(/\D/g, '');
          if (formattedTelefone.length === 10) {
            mappedData.telefone = `(${formattedTelefone.slice(0, 2)}) ${formattedTelefone.slice(2, 6)}-${formattedTelefone.slice(6)}`;
          } else if (formattedTelefone.length === 11) {
            mappedData.telefone = `(${formattedTelefone.slice(0, 2)}) ${formattedTelefone.slice(2, 7)}-${formattedTelefone.slice(7)}`;
          } else {
            mappedData.telefone = formattedTelefone;
          }
        } else if (data.telefone) {
          mappedData.telefone = data.telefone;
        }
      }

      // If IE was not found in the primary response, attempt secondary CNPJ.ws call for IE
      if (!mappedData.inscricaoEstadual) {
        try {
          const ieRes = await fetch(`https://publica.cnpj.ws/cnpj/${rawDoc}`);
          if (ieRes.ok) {
            const ieData = await ieRes.json();
            const ies = ieData.estabelecimento?.inscricoes_estaduais || ieData.inscricoes_estaduais || [];
            if (Array.isArray(ies) && ies.length > 0) {
              const activeIe = ies.find((i: any) => i.ativo) || ies[0];
              if (activeIe && activeIe.inscricao_estadual) {
                mappedData.inscricaoEstadual = activeIe.inscricao_estadual;
              }
            }
          }
        } catch (e) {
          // Silently ignore secondary lookup error
        }
      }

      if (mappedData.razaoSocial) setRazaoSocial(mappedData.razaoSocial);
      if (mappedData.nomeFantasia) setNomeFantasia(mappedData.nomeFantasia);
      if (mappedData.inscricaoEstadual) setInscricaoEstadual(mappedData.inscricaoEstadual);
      if (mappedData.logradouro) setLogradouro(mappedData.logradouro);
      if (mappedData.numero) setNumero(mappedData.numero);
      if (mappedData.bairro) setBairro(mappedData.bairro);
      if (mappedData.cidade) setCidade(mappedData.cidade);
      if (mappedData.estado) setEstado(mappedData.estado);
      if (mappedData.email) setEmail(mappedData.email);
      if (mappedData.telefone) setTelefone(mappedData.telefone);

      if (onShowToast) {
        onShowToast('CNPJ Consultado', 'Dados preenchidos com sucesso.');
      }
    } catch (err: any) {
      setCnpjError('Não foi possível consultar os dados automaticamente. Preencha manualmente.');
    } finally {
      setLoadingCnpj(false);
    }
  };

  useEffect(() => {
    if (editingCliente) {
      setCodigo(editingCliente.codigo || `#CLI-${Math.floor(1000 + Math.random() * 9000)}`);
      setRazaoSocial(editingCliente.razaoSocial || '');
      setNomeFantasia(editingCliente.nomeFantasia || '');
      const docValue = editingCliente.cnpj || '';
      setCnpj(docValue);
      setInscricaoEstadual(editingCliente.inscricaoEstadual || '');
      setTipoPessoa(docValue.replace(/\D/g, '').length === 11 ? 'F' : 'J');
      setResponsavel(editingCliente.responsavel || '');
      setEmail(editingCliente.email || '');
      setTelefone(editingCliente.telefone || '');
      setCidade(editingCliente.cidade || 'Nova Friburgo');
      setEstado(editingCliente.estado || 'RJ');
      setLogradouro(editingCliente.logradouro || '');
      setNumero(editingCliente.numero || '');
      setBairro(editingCliente.bairro || '');
      setStatus(editingCliente.status || 'Ativo');
      setSegmento(editingCliente.segmento || '');
      setClassificacao(editingCliente.classificacao || '');
      setObservacoes(editingCliente.observacoes || '');
      setSistemasModulos(editingCliente.sistemasModulos || []);
      setQuantidadeComputadores(editingCliente.quantidadeComputadores ? editingCliente.quantidadeComputadores.toString() : '');
      setTipoInstalacao(editingCliente.tipoInstalacao || '');
      setObservacaoSistemas(editingCliente.observacaoSistemas || '');
      setCamposEspecificos(editingCliente.camposEspecificos || {});
    } else {
      setCodigo(`#CLI-${Math.floor(1000 + Math.random() * 9000)}`);
      setRazaoSocial('');
      setNomeFantasia('');
      setCnpj('');
      setInscricaoEstadual('');
      setTipoPessoa('J');
      setResponsavel('');
      setEmail('');
      setTelefone('');
      setCidade('Nova Friburgo');
      setEstado('RJ');
      setLogradouro('');
      setNumero('');
      setBairro('');
      setStatus('Ativo');
      setSegmento(segmentoOptions[0]?.nome || '');
      setClassificacao(classificacaoOptions[0]?.nome || '');
      setObservacoes('');
      setSistemasModulos([]);
      setQuantidadeComputadores('');
      setTipoInstalacao('');
      setObservacaoSistemas('');
      setCamposEspecificos({});
    }
    setError('');
  }, [editingCliente, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razaoSocial.trim()) {
      setError('Razão Social / Nome do Cliente é obrigatório.');
      return;
    }

    const clienteToSave: Cliente = {
      id: editingCliente?.id || `cli-${Date.now()}`,
      codigo: codigo || `#CLI-${Math.floor(1000 + Math.random() * 9000)}`,
      razaoSocial: razaoSocial.trim(),
      nomeFantasia: nomeFantasia.trim() || undefined,
      cnpj: cnpj.trim() || undefined,
      inscricaoEstadual: inscricaoEstadual.trim() || undefined,
      responsavel: responsavel.trim() || 'Não informado',
      email: email.trim() || undefined,
      telefone: telefone.trim() || undefined,
      cidade: cidade.trim() || 'Nova Friburgo',
      estado: estado.trim() || 'RJ',
      logradouro: logradouro.trim() || undefined,
      numero: numero.trim() || undefined,
      bairro: bairro.trim() || undefined,
      status: status,
      tipoCliente: editingCliente?.tipoCliente || undefined,
      segmento: segmento || undefined,
      classificacao: classificacao || undefined,
      qtdAtendimentos: editingCliente?.qtdAtendimentos || 0,
      observacoes: observacoes.trim() || undefined,
      sistemasModulos: sistemasModulos,
      quantidadeComputadores: quantidadeComputadores ? parseInt(quantidadeComputadores, 10) : undefined,
      tipoInstalacao: tipoInstalacao || undefined,
      observacaoSistemas: observacaoSistemas.trim() || undefined,
      camposEspecificos: camposEspecificos,
      createdAt: editingCliente?.createdAt || new Date().toLocaleDateString('pt-BR')
    };

    onSave(clienteToSave);
    if (onShowToast) {
      onShowToast(
        editingCliente ? 'Cliente Atualizado' : 'Novo Cliente Cadastrado',
        `"${clienteToSave.razaoSocial}" salvo com sucesso.`
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
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formulário fixo de cadastro de cliente e parâmetros comerciais.
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

          {/* Identification */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <UserCheck className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Identificação & Razão Social
              </h4>
            </div>

            {/* CNPJ / CPF do Cliente (Consulta Automática) - FIRST FIELD */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  CNPJ / CPF do Cliente (Consulta Automática)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoPessoa('J')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${tipoPessoa === 'J' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}
                  >
                    CNPJ
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoPessoa('F')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${tipoPessoa === 'F' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}
                  >
                    CPF
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={tipoPessoa === 'J' ? "00.000.000/0000-00" : "000.000.000-00"}
                  value={cnpj}
                  onChange={(e) => setCnpj(formatDocumento(e.target.value))}
                  className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleConsultarCnpj}
                  disabled={loadingCnpj}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-65 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  {loadingCnpj ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>{tipoPessoa === 'J' ? 'Consultar CNPJ' : 'Verificar CPF'}</span>
                </button>
              </div>
              {cnpjError && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{cnpjError}</span>
                </div>
              )}
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
                  Razão Social / Nome *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Supermercado Friburgo Ltda"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  placeholder="Ex: Super Friburgo"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Inscrição Estadual (I.E.)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 12.345.678-9 ou ISENTO"
                  value={inscricaoEstadual}
                  onChange={(e) => setInscricaoEstadual(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Classification & Status */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Tag className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Classificação & Status
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status do Cliente
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.id} value={opt.nome}>
                      {opt.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Segmento
                </label>
                <select
                  value={segmento}
                  onChange={(e) => setSegmento(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">Selecione...</option>
                  {segmentoOptions.map((opt) => (
                    <option key={opt.id} value={opt.nome}>
                      {opt.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Classificação
                </label>
                <select
                  value={classificacao}
                  onChange={(e) => setClassificacao(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">Selecione...</option>
                  {classificacaoOptions.map((opt) => (
                    <option key={opt.id} value={opt.nome}>
                      {opt.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campos Condicionais baseados nas Opções Selecionadas */}
            {(() => {
              const selectedSegmentoObj = systemTables?.segmentosCliente?.find((t) => t.nome === segmento);
              const hasSegFields = selectedSegmentoObj?.camposDinamicos && selectedSegmentoObj.camposDinamicos.length > 0;

              if (!hasSegFields) return null;

              return (
                <div className="space-y-3 pt-2">
                  {hasSegFields && (
                    <DynamicFieldsForm
                      title={`Campos Condicionais de Segmento: ${segmento}`}
                      fields={selectedSegmentoObj.camposDinamicos}
                      values={camposEspecificos}
                      onChange={(key, val) => setCamposEspecificos((prev) => ({ ...prev, [key]: val }))}
                    />
                  )}
                </div>
              );
            })()}
          </div>

          {/* Sistemas e Instalação */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <HardDrive className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Sistemas & Instalação
              </h4>
            </div>

            {/* Configuração de Instalação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quantidade de Computadores
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Monitor className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 5"
                    value={quantidadeComputadores}
                    onChange={(e) => setQuantidadeComputadores(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Instalação
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Server className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    value={tipoInstalacao}
                    onChange={(e) => setTipoInstalacao(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="">Selecione...</option>
                    {tipoInstalacaoOptions.map((opt) => (
                      <option key={opt.id} value={opt.nome}>{opt.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Observação Sistemas & Instalação */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Observação (Sistemas & Instalação)
              </label>
              <textarea
                rows={3}
                placeholder="Modo pré venda ativada, um sistema fiscal e um sistema não fiscal..."
                value={observacaoSistemas}
                onChange={(e) => setObservacaoSistemas(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-y min-h-[70px]"
              />
            </div>

            {/* Campos Condicionais para Tipo de Instalação */}
            {(() => {
              const selectedInstalacaoObj = systemTables?.tiposInstalacao?.find((t) => t.nome === tipoInstalacao);
              const hasInstFields = selectedInstalacaoObj?.camposDinamicos && selectedInstalacaoObj.camposDinamicos.length > 0;

              if (!hasInstFields) return null;

              return (
                <div className="pt-1">
                  <DynamicFieldsForm
                    title={`Campos Condicionais de Instalação: ${tipoInstalacao}`}
                    fields={selectedInstalacaoObj.camposDinamicos}
                    values={camposEspecificos}
                    onChange={(key, val) => setCamposEspecificos((prev) => ({ ...prev, [key]: val }))}
                  />
                </div>
              );
            })()}

            {/* Inclusão de Sistemas e Módulos */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Sistemas e Módulos Utilizados
              </label>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedSistemaId}
                  onChange={(e) => {
                    setSelectedSistemaId(e.target.value);
                    setSelectedModuloNome('');
                  }}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">Selecione o Sistema</option>
                  {sistemasList.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>

                <select
                  value={selectedModuloNome}
                  onChange={(e) => setSelectedModuloNome(e.target.value)}
                  disabled={!selectedSistemaId}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-50"
                >
                  <option value="">Selecione o Módulo (Opcional)</option>
                  {modulosList
                    .filter((m) => m.sistemaId === selectedSistemaId)
                    .map((m) => (
                      <option key={m.id} value={m.nome}>{m.nome}</option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddSistemaModulo}
                  disabled={!selectedSistemaId}
                  className="px-3 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors"
                  title="Adicionar Sistema/Módulo"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {sistemasModulos.length > 0 && (
                <div className="mt-3 space-y-2">
                  {sistemasModulos.map((sm, index) => (
                    <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{sm.sistema}</span>
                        {sm.modulo && <span className="text-[10px] text-slate-500">{sm.modulo}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSistemaModulo(index)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <Phone className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Contato Principal
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Responsável
                </label>
                <input
                  type="text"
                  placeholder="Ex: Roberto Silva"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(22) 99999-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="contato@cliente.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
              <MapPin className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Endereço & Localização
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Logradouro / Rua
                </label>
                <input
                  type="text"
                  placeholder="Ex: Av. Alberto Braune"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  placeholder="100"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  placeholder="Centro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
              <FileText className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Observações Gerais
              </h4>
            </div>
            <textarea
              rows={3}
              placeholder="Anotações comerciais ou operacionais do cliente..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-y min-h-[80px]"
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
            <span>Salvar Cliente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
