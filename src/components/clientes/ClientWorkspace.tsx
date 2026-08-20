import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Headphones,
  FileCode2,
  Boxes,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  ExternalLink,
  ShieldCheck,
  Tag,
  MoreVertical,
  Edit3,
  Copy,
  Save,
  BookOpen,
  History,
  Server,
  Search,
  X,
  ChevronRight,
  AlertCircle,
  Trash2,
  Check,
  FileCheck2,
  Wrench,
  CheckSquare,
  Calendar,
  CalendarDays,
  Loader2
} from 'lucide-react';
import {
  Cliente,
  ModuleType,
  EquipamentoItem,
  AtendimentoItem,
  RegistroItem,
  ArtigoKBItem,
  ClientTimelineItem,
  SystemTablesData,
  UserAccount,
} from '../../types';
import { getEquipmentTypeIcon } from '../../lib/equipmentIcons';
import { getSystemTableBadgeStyle } from '../../lib/badgeUtils';
import { EquipamentoFormDrawer } from '../drawers/EquipamentoFormDrawer';
import { AtendimentoFormDrawer } from '../drawers/AtendimentoFormDrawer';
import { RegistroFormDrawer } from '../drawers/RegistroFormDrawer';
import { ArtigoFormDrawer } from '../drawers/ArtigoFormDrawer';
import { VideoFormDrawer } from '../drawers/VideoFormDrawer';
import { RegistroWorkspace } from '../registros/RegistroWorkspace';
import { ArticleWorkspace } from '../conhecimento/ArticleWorkspace';
import { VideoDetailDrawer } from '../conhecimento/VideoDetailDrawer';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { DynamicFieldsForm } from '../common/DynamicFieldsForm';
import { saveAtendimento, saveRegistro, saveArtigo } from '../../lib/supabaseService';
import { initialUsers } from '../../data/mockUsers';
import {
  mockEquipamentos,
  mockAtendimentos,
  mockRegistros,
  mockArtigos,
  mockTimeline
} from '../../data/mockWorkspaceData';
import { QuickViewModal, QuickViewEntityType } from '../common/QuickViewModal';

// Date parsing helper
const parseDateString = (dateStr?: string): Date => {
  if (!dateStr) return new Date(0);
  const lower = dateStr.toLowerCase().trim();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (lower.includes('hoje') || lower.includes('agora')) {
    return today;
  }
  if (lower.includes('ontem')) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }

  const brMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1;
    const year = parseInt(brMatch[3], 10);
    return new Date(year, month, day);
  }

  const isoMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return new Date(year, month, day);
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  return today;
};


interface ClientWorkspaceProps {
  client: Cliente;
  systemTables?: SystemTablesData;
  onBack: () => void;
  onNavigateModule: (module: ModuleType) => void;
  onUpdateClient?: (updatedClient: Cliente) => void;
  onOpenQuickAction?: (actionType: 'atendimento' | 'registro' | 'cliente') => void;
  onOpenEquipmentWorkspace?: (eq: EquipamentoItem) => void;
  allAtendimentos?: AtendimentoItem[];
  allRegistros?: RegistroItem[];
  allArtigos?: ArtigoKBItem[];
  allClients?: Cliente[];
  onUpdateAtendimentosList?: (atendimentos: AtendimentoItem[]) => void;
  onUpdateRegistrosList?: (registros: RegistroItem[]) => void;
  onUpdateArtigosList?: (artigos: ArtigoKBItem[]) => void;
  onShowToast?: (title: string, message: string) => void;
  systemOptions?: any;
  onOpenRegistroWorkspace?: (reg: RegistroItem) => void;
  onOpenArtigoWorkspace?: (art: ArtigoKBItem) => void;
  systemUsers?: UserAccount[];
}

type WorkspaceTab =
  | 'geral'
  | 'inventario'
  | 'atendimentos'
  | 'registros'
  | 'conhecimento'
  | 'timeline';

export const ClientWorkspace: React.FC<ClientWorkspaceProps> = ({
  client,
  systemTables,
  onBack,
  onNavigateModule,
  onUpdateClient,
  onOpenQuickAction,
  onOpenEquipmentWorkspace,
  allAtendimentos,
  allRegistros,
  allArtigos,
  allClients,
  onUpdateAtendimentosList,
  onUpdateRegistrosList,
  onUpdateArtigosList,
  onShowToast,
  systemOptions,
  onOpenRegistroWorkspace,
  onOpenArtigoWorkspace,
  systemUsers = initialUsers,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('geral');
  const [currentClient, setCurrentClient] = useState<Cliente>(client);
  const [isEditingGeral, setIsEditingGeral] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Active Workspaces states
  const [selectedRegistroWorkspace, setSelectedRegistroWorkspace] = useState<RegistroItem | null>(null);
  const [selectedArticleWorkspace, setSelectedArticleWorkspace] = useState<ArtigoKBItem | null>(null);
  const [selectedVideoWorkspace, setSelectedVideoWorkspace] = useState<ArtigoKBItem | null>(null);
  const [isVideoDrawerOpen, setIsVideoDrawerOpen] = useState(false);

  // Quick View Modal State
  const [quickViewModal, setQuickViewModal] = useState<{
    isOpen: boolean;
    type: QuickViewEntityType;
    data: any;
  }>({
    isOpen: false,
    type: 'equipamento',
    data: null,
  });

  // Form State for Aba Geral
  const [editForm, setEditForm] = useState<Cliente>({ ...client });
  
  const [selectedSistemaId, setSelectedSistemaId] = useState('');
  const [selectedModuloNome, setSelectedModuloNome] = useState('');

  const handleAddSistemaModulo = () => {
    if (selectedSistemaId) {
      const sistemaObj = systemTables?.sistemas?.find((s: any) => s.id === selectedSistemaId);
      if (sistemaObj) {
        const currentSM = editForm.sistemasModulos || [];
        if (!currentSM.some((sm: any) => sm.sistema === sistemaObj.nome && sm.modulo === selectedModuloNome)) {
          setEditForm({
            ...editForm,
            sistemasModulos: [...currentSM, { sistema: sistemaObj.nome, modulo: selectedModuloNome || undefined }]
          });
        }
        setSelectedSistemaId('');
        setSelectedModuloNome('');
      }
    }
  };

  const handleRemoveSistemaModulo = (index: number) => {
    const currentSM = editForm.sistemasModulos || [];
    setEditForm({
      ...editForm,
      sistemasModulos: currentSM.filter((_, i: number) => i !== index)
    });
  };

  // CNPJ Query State for Edit Mode
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjError, setCnpjError] = useState('');

  const formatCnpj = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 2) return cleanValue;
    if (cleanValue.length <= 5) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
    if (cleanValue.length <= 8) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
    if (cleanValue.length <= 12) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`;
    return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12, 14)}`;
  };

  const handleConsultarCnpjForEdit = async () => {
    const rawCnpj = (editForm.cnpj || '').replace(/\D/g, '');
    if (!rawCnpj) {
      setCnpjError('Por favor, informe um CNPJ válido.');
      return;
    }
    if (rawCnpj.length !== 14) {
      setCnpjError('O CNPJ deve conter exatamente 14 dígitos.');
      return;
    }

    setLoadingCnpj(true);
    setCnpjError('');

    try {
      let data: any = null;
      let isCnpjWs = false;

      // Try publica.cnpj.ws first (has higher data quality, including emails)
      try {
        const response = await fetch(`https://publica.cnpj.ws/cnpj/${rawCnpj}`);
        if (response.ok) {
          data = await response.json();
          isCnpjWs = true;
        }
      } catch (e) {
        // Silently catch and fallback to BrasilAPI
      }

      if (!isCnpjWs) {
        // Fallback to BrasilAPI
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawCnpj}`);
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

      // If IE was not found in primary response, attempt secondary CNPJ.ws call for IE
      if (!mappedData.inscricaoEstadual) {
        try {
          const ieRes = await fetch(`https://publica.cnpj.ws/cnpj/${rawCnpj}`);
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

      setEditForm((prev) => ({
        ...prev,
        razaoSocial: mappedData.razaoSocial || prev.razaoSocial,
        nomeFantasia: mappedData.nomeFantasia || prev.nomeFantasia,
        inscricaoEstadual: mappedData.inscricaoEstadual || prev.inscricaoEstadual,
        cep: mappedData.cep || prev.cep,
        logradouro: mappedData.logradouro || prev.logradouro,
        numero: mappedData.numero || prev.numero,
        bairro: mappedData.bairro || prev.bairro,
        complemento: mappedData.complemento || prev.complemento,
        cidade: mappedData.cidade || prev.cidade,
        estado: mappedData.estado || prev.estado,
        email: mappedData.email || prev.email,
        telefone: mappedData.telefone || prev.telefone,
      }));
    } catch (err: any) {
      setCnpjError('Não foi possível consultar os dados automaticamente. Preencha manualmente.');
    } finally {
      setLoadingCnpj(false);
    }
  };

  // Workspace Local Collections
  const [equipamentos, setEquipamentos] = useState<EquipamentoItem[]>(() => {
    if (client.equipamentos && Array.isArray(client.equipamentos) && client.equipamentos.length > 0) {
      return client.equipamentos;
    }
    const saved = localStorage.getItem(`sip_equipamentos_${client.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse sip_equipamentos', e);
      }
    }
    return mockEquipamentos[client.id] || [];
  });

  const handleSaveEquipamentosList = (newList: EquipamentoItem[]) => {
    setEquipamentos(newList);
    try {
      localStorage.setItem(`sip_equipamentos_${currentClient.id}`, JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save sip_equipamentos', e);
    }
    const updatedClient = {
      ...currentClient,
      equipamentos: newList
    };
    setCurrentClient(updatedClient);
    if (onUpdateClient) {
      onUpdateClient(updatedClient);
    }
  };

  // Atendimentos reativos baseados em dados globais
  const clientAtendimentos = useMemo(() => {
    if (allAtendimentos) {
      return allAtendimentos.filter(a => 
        a.clienteId === client.id || 
        (a.clienteNome && (
          a.clienteNome.trim().toLowerCase() === (client.razaoSocial || '').trim().toLowerCase() ||
          a.clienteNome.trim().toLowerCase() === (client.nomeFantasia || '').trim().toLowerCase() ||
          a.clienteNome.trim().toLowerCase() === (client.codigo || '').trim().toLowerCase()
        ))
      );
    }
    return null;
  }, [allAtendimentos, client]);

  const [localAtendimentos, setLocalAtendimentos] = useState<AtendimentoItem[]>(() => {
    return mockAtendimentos[client.id] || [
      {
        id: `atd-def-${Date.now()}`,
        codigo: '#ATD-1001',
        assunto: 'Suporte à integração de faturamento',
        descricao: 'Verificação dos parâmetros do lote fiscal.',
        prioridade: 'Média',
        status: 'Em Andamento',
        dataAbertura: 'Hoje às 08:30',
        responsavel: client.responsavel || 'Carlos Eduardo',
      },
    ];
  });

  const atendimentos = clientAtendimentos !== null ? clientAtendimentos : localAtendimentos;

  const handleUpdateAtendimentos = (newList: AtendimentoItem[]) => {
    if (allAtendimentos && onUpdateAtendimentosList) {
      const otherClientsAtendimentos = allAtendimentos.filter(a => 
        a.clienteId !== client.id && 
        !(a.clienteNome && (
          a.clienteNome.trim().toLowerCase() === (client.razaoSocial || '').trim().toLowerCase() ||
          a.clienteNome.trim().toLowerCase() === (client.nomeFantasia || '').trim().toLowerCase() ||
          a.clienteNome.trim().toLowerCase() === (client.codigo || '').trim().toLowerCase()
        ))
      );
      onUpdateAtendimentosList([...newList, ...otherClientsAtendimentos]);
    } else {
      setLocalAtendimentos(newList);
    }
  };

  // Registros reativos baseados em dados globais
  const clientRegistros = useMemo(() => {
    if (allRegistros) {
      return allRegistros.filter(r => 
        r.clienteId === client.id || 
        (r.clienteNome && (
          r.clienteNome.trim().toLowerCase() === (client.razaoSocial || '').trim().toLowerCase() ||
          r.clienteNome.trim().toLowerCase() === (client.nomeFantasia || '').trim().toLowerCase() ||
          r.clienteNome.trim().toLowerCase() === (client.codigo || '').trim().toLowerCase()
        ))
      );
    }
    return null;
  }, [allRegistros, client]);

  const [localRegistros, setLocalRegistros] = useState<RegistroItem[]>(() => {
    return mockRegistros[client.id] || [
      {
        id: `reg-def-${Date.now()}`,
        codigo: '#REG-1001',
        tipo: 'Melhoria',
        titulo: 'Inclusão de atalho rápido de relatórios',
        descricao: 'Solicitado pelo gestor operacional.',
        status: 'Aprovado',
        data: '26/07/2026',
        autor: client.responsavel,
      },
    ];
  });

  const registros = clientRegistros !== null ? clientRegistros : localRegistros;

  const handleUpdateRegistros = (newList: RegistroItem[]) => {
    if (allRegistros && onUpdateRegistrosList) {
      const otherClientsRegistros = allRegistros.filter(r => 
        r.clienteId !== client.id && 
        !(r.clienteNome && (
          r.clienteNome.trim().toLowerCase() === (client.razaoSocial || '').trim().toLowerCase() ||
          r.clienteNome.trim().toLowerCase() === (client.nomeFantasia || '').trim().toLowerCase() ||
          r.clienteNome.trim().toLowerCase() === (client.codigo || '').trim().toLowerCase()
        ))
      );
      onUpdateRegistrosList([...newList, ...otherClientsRegistros]);
    } else {
      setLocalRegistros(newList);
    }
  };

  // Artigos reativos baseados em dados globais
  const clientArtigos = useMemo(() => {
    if (allArtigos) {
      return allArtigos.filter(art => 
        art.clienteId === client.id || 
        (art.clienteNome && (
          art.clienteNome.trim().toLowerCase() === (client.razaoSocial || '').trim().toLowerCase() ||
          art.clienteNome.trim().toLowerCase() === (client.nomeFantasia || '').trim().toLowerCase() ||
          art.clienteNome.trim().toLowerCase() === (client.codigo || '').trim().toLowerCase()
        ))
      );
    }
    return null;
  }, [allArtigos, client]);

  const [localArtigos, setLocalArtigos] = useState<ArtigoKBItem[]>(() => {
    return mockArtigos[client.id] || [
      {
        id: `art-def-${Date.now()}`,
        codigo: '#ART-1001',
        titulo: 'Guia de Configuração e Parâmetros Exclusivos',
        categoria: 'Configuração Técnica',
        conteudo: 'Artigo com as especificações particulares do cliente.',
        tags: ['Configuração', 'SLA', 'Guia'],
        status: 'Publicado',
        dataCriacao: '15/01/2025',
        autor: 'Suporte N2',
      },
    ];
  });

  const artigos = clientArtigos !== null ? clientArtigos : localArtigos;

  const handleUpdateArtigos = (newList: ArtigoKBItem[]) => {
    if (allArtigos && onUpdateArtigosList) {
      const otherClientsArtigos = allArtigos.filter(art => 
        art.clienteId !== client.id && 
        !(art.clienteNome && (
          art.clienteNome.trim().toLowerCase() === (client.razaoSocial || '').trim().toLowerCase() ||
          art.clienteNome.trim().toLowerCase() === (client.nomeFantasia || '').trim().toLowerCase() ||
          art.clienteNome.trim().toLowerCase() === (client.codigo || '').trim().toLowerCase()
        ))
      );
      onUpdateArtigosList([...newList, ...otherClientsArtigos]);
    } else {
      setLocalArtigos(newList);
    }
  };

  const [timeline, setTimeline] = useState<ClientTimelineItem[]>(
    mockTimeline[client.id] || [
      {
        id: `tl-def-${Date.now()}`,
        type: 'cadastro',
        titulo: 'Cliente Cadastrado no SIGI',
        descricao: 'Empresa cadastrada e workspace inicializado.',
        dataHora: client.createdAt || '15/01/2025',
        autor: 'Administrador',
        data: client
      },
    ]
  );

  // Dynamically compute timeline events from atendimentos, registros, equipamentos, artigos and state timeline
  const combinedTimeline = useMemo(() => {
    const events: ClientTimelineItem[] = [];

    // Map existing live lists' codes to avoid duplicates
    const collectionCodes = new Set([
      ...(atendimentos || []).map(a => a.codigo.trim().toUpperCase()),
      ...(registros || []).map(r => r.codigo.trim().toUpperCase()),
      ...(equipamentos || []).map(e => e.codigo.trim().toUpperCase()),
      ...(artigos || []).map(ar => ar.codigo.trim().toUpperCase())
    ]);

    // 1. Add manual timeline events from state timeline
    timeline.forEach(item => {
      const code = item.relatedCode ? item.relatedCode.trim().toUpperCase() : '';
      if (item.type === 'cadastro' || !code || !collectionCodes.has(code)) {
        events.push(item);
      }
    });

    // 2. Map Atendimentos to timeline events
    atendimentos.forEach(atd => {
      events.push({
        id: `atd-tl-${atd.id}`,
        type: 'atendimento',
        titulo: `Chamado: ${atd.assunto}`,
        descricao: `${atd.descricao || ''}${atd.status ? ` | Status: ${atd.status}` : ''}${atd.prioridade ? ` | Prioridade: ${atd.prioridade}` : ''}`,
        dataHora: atd.dataAbertura || 'N/D',
        autor: atd.responsavel || 'Suporte',
        relatedCode: atd.codigo,
        data: atd
      });
    });

    // 3. Map Registros to timeline events
    registros.forEach(reg => {
      events.push({
        id: `reg-tl-${reg.id}`,
        type: 'registro',
        titulo: `Registro de ${reg.tipo}: ${reg.titulo}`,
        descricao: reg.descricao || 'Nenhuma descrição fornecida.',
        dataHora: reg.data || 'N/D',
        autor: reg.autor || 'Usuário',
        relatedCode: reg.codigo,
        data: reg
      });
    });

    // 4. Map Equipamentos to timeline events
    equipamentos.forEach(eq => {
      events.push({
        id: `eq-tl-${eq.id}`,
        type: 'inventario',
        titulo: `Equipamento Vinculado: ${eq.nome}`,
        descricao: `Tipo: ${eq.tipo}${eq.numeroSerie ? ` | S/N: ${eq.numeroSerie}` : ''}${eq.localizacao ? ` | Localização: ${eq.localizacao}` : ''}`,
        dataHora: eq.dataInstalacao || 'N/D',
        autor: eq.usuario || 'Técnico de Campo',
        relatedCode: eq.codigo,
        data: eq
      });
    });

    // 5. Map Artigos to timeline events
    artigos.forEach(art => {
      events.push({
        id: `art-tl-${art.id}`,
        type: 'artigo',
        titulo: `Artigo da Base de Conhecimento: ${art.titulo}`,
        descricao: `Categoria: ${art.categoria}${art.conteudo ? ` | ${art.conteudo}` : ''}`,
        dataHora: art.dataCriacao || 'N/D',
        autor: art.autor || 'Autor',
        relatedCode: art.codigo,
        data: art
      });
    });

    // Sort events. Since dataHora can be "Hoje", "Hoje às HH:MM", "Ontem às HH:MM", or "DD/MM/YYYY", let's parse them using parseDateString helper to sort chronologically!
    return events.sort((a, b) => {
      const dateA = parseDateString(a.dataHora);
      const dateB = parseDateString(b.dataHora);
      return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    });
  }, [timeline, atendimentos, registros, equipamentos, artigos]);

  // Filter States for tabs
  const [eqSearch, setEqSearch] = useState('');
  const [selectedEqTab, setSelectedEqTab] = useState<string>('todos');
  const [atdSearch, setAtdSearch] = useState('');
  const [regSearch, setRegSearch] = useState('');
  const [artSearch, setArtSearch] = useState('');
  const [tlSearch, setTlSearch] = useState('');

  // Atendimento Date Filter States
  type AtdDatePreset = 'todos' | 'dia' | '3dias' | '1semana' | 'personalizado';
  const [atdDatePreset, setAtdDatePreset] = useState<AtdDatePreset>('todos');
  const [atdSelectedDay, setAtdSelectedDay] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [atdStartDate, setAtdStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [atdEndDate, setAtdEndDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Modals for creation
  const [isEqModalOpen, setIsEqModalOpen] = useState(false);
  const [isAtdModalOpen, setIsAtdModalOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isArtModalOpen, setIsArtModalOpen] = useState(false);

  // Details Modal
  const [selectedEquipamento, setSelectedEquipamento] = useState<EquipamentoItem | null>(null);
  const [selectedAtendimento, setSelectedAtendimento] = useState<AtendimentoItem | null>(null);
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroItem | null>(null);
  const [selectedArtigo, setSelectedArtigo] = useState<ArtigoKBItem | null>(null);

  // Quick Copy Client Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentClient.codigo);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Toggle Status
  const handleToggleStatus = () => {
    const newStatus = currentClient.status === 'Ativo' ? 'Inativo' : 'Ativo';
    const updated = { ...currentClient, status: newStatus as 'Ativo' | 'Inativo' };
    setCurrentClient(updated);
    setEditForm(updated);

    if (onUpdateClient) onUpdateClient(updated);

    // Add timeline record
    const newTl: ClientTimelineItem = {
      id: `tl-${Date.now()}`,
      type: 'cadastro',
      titulo: `Status alterado para ${newStatus}`,
      descricao: `O status da empresa foi atualizado para ${newStatus}.`,
      dataHora: 'Agora mesmo',
      autor: 'Usuário do SIGI',
    };
    setTimeline((prev) => [newTl, ...prev]);
    setShowDropdown(false);
  };

  // Save Aba Geral edits
  const handleSaveGeral = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentClient(editForm);
    setIsEditingGeral(false);
    if (onUpdateClient) onUpdateClient(editForm);

    // Add timeline record
    const newTl: ClientTimelineItem = {
      id: `tl-${Date.now()}`,
      type: 'cadastro',
      titulo: 'Dados Cadastrais Atualizados',
      descricao: 'Informações gerais da empresa foram atualizadas no Workspace.',
      dataHora: 'Agora mesmo',
      autor: 'Usuário do SIGI',
    };
    setTimeline((prev) => [newTl, ...prev]);
  };

  // Helper for status badge styling
  const getClientStatusBadge = (status: string) => {
    return getSystemTableBadgeStyle('statusCliente', status, systemTables, 'slate');
  };

  const getAtendimentoStatusBadge = (status: string) => {
    return getSystemTableBadgeStyle('statusAtendimento', status, systemTables, 'slate');
  };

  const getAtendimentoPriorityBadge = (priority: string) => {
    return getSystemTableBadgeStyle('prioridadesAtendimento', priority, systemTables, 'slate');
  };

  const getRegistroStatusBadge = (status: string) => {
    return getSystemTableBadgeStyle('statusRegistro', status, systemTables, 'slate');
  };

  const getEquipmentStatusBadge = (status: string) => {
    return getSystemTableBadgeStyle('statusEquipamento', status, systemTables, 'slate');
  };

  const getRegistroPriorityBadge = (priority: string) => {
    return getSystemTableBadgeStyle('prioridadesRegistro', priority, systemTables, 'slate');
  };

  return (
    <>
      {selectedRegistroWorkspace && (
        <RegistroWorkspace
          registro={selectedRegistroWorkspace}
          onBack={() => setSelectedRegistroWorkspace(null)}
          onUpdateRegistro={(updated) => {
            setSelectedRegistroWorkspace(updated);
            handleUpdateRegistros(registros.map((r) => r.id === updated.id ? updated : r));
            saveRegistro(updated);
          }}
          onShowToast={onShowToast}
          allClients={allClients || [currentClient]}
          allAtendimentos={atendimentos}
          allArtigos={artigos}
          onUpdateArtigosList={handleUpdateArtigos}
        />
      )}

      {selectedArticleWorkspace && (
        <ArticleWorkspace
          artigo={selectedArticleWorkspace}
          onBack={() => setSelectedArticleWorkspace(null)}
          onUpdateArtigo={(updated) => {
            setSelectedArticleWorkspace(updated);
            handleUpdateArtigos(artigos.map((a) => a.id === updated.id ? updated : a));
            saveArtigo(updated);
          }}
          onDeleteArtigo={(artId) => {
            const filtered = artigos.filter((a) => a.id !== artId);
            handleUpdateArtigos(filtered);
            setSelectedArticleWorkspace(null);
          }}
          onShowToast={onShowToast}
          allClients={allClients || [currentClient]}
          allAtendimentos={atendimentos}
          allRegistros={registros}
          systemUsers={[]}
        />
      )}

      {selectedVideoWorkspace && (
        <VideoDetailDrawer
          video={selectedVideoWorkspace}
          isOpen={!!selectedVideoWorkspace}
          onClose={() => setSelectedVideoWorkspace(null)}
          onUpdateVideo={(updated) => {
            setSelectedVideoWorkspace(updated);
            handleUpdateArtigos(artigos.map((a) => a.id === updated.id ? updated : a));
            saveArtigo(updated);
          }}
          allClients={allClients || [currentClient]}
          allAtendimentos={atendimentos}
          allRegistros={registros}
          onShowToast={onShowToast}
          systemUsers={[]}
        />
      )}

      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* 1. HEADER DO WORKSPACE DO CLIENTE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs relative">
        {/* Back Link & Code Bar */}
        <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Clientes
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700">
              Workspace do Cliente
            </span>
            <span className="text-[11px] font-mono font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-200/50 dark:border-indigo-800/50">
              {currentClient.codigo}
            </span>
          </div>
        </div>

        {/* Main Company Header Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            {/* Logo / Avatar Placeholder */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md border border-white/20 flex-shrink-0">
              {currentClient.nomeFantasia
                ? currentClient.nomeFantasia.substring(0, 2).toUpperCase()
                : currentClient.razaoSocial.substring(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                  {currentClient.nomeFantasia || currentClient.razaoSocial}
                </h1>

                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${getClientStatusBadge(
                    currentClient.status
                  )}`}
                >
                  {currentClient.status === 'Ativo' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  {currentClient.status}
                </span>

                {currentClient.classificacao && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSystemTableBadgeStyle(
                      'classificacoesCliente',
                      currentClient.classificacao || '',
                      systemTables,
                      'slate'
                    )}`}
                  >
                    <Tag className="w-3 h-3" />
                    {currentClient.classificacao}
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Razão Social: <span className="text-slate-700 dark:text-slate-200 font-semibold">{currentClient.razaoSocial}</span>
              </p>

              {/* Meta details bar */}
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
                {currentClient.cnpj && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    CNPJ: {currentClient.cnpj}
                  </span>
                )}
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentClient.cidade} / {currentClient.estado}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Resp: <strong className="text-slate-700 dark:text-slate-300">{currentClient.responsavel}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-center relative">
            <button
              onClick={() => {
                setActiveTab('atendimentos');
                setIsAtdModalOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Novo Atendimento
            </button>

            {/* Dropdown Menu "Mais Ações" */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Mais Ações"
              >
                <span>Mais Ações</span>
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 py-2 text-xs font-semibold animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setActiveTab('geral');
                      setIsEditingGeral(true);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-500" /> Editar Cadastro
                  </button>

                  <button
                    onClick={handleCopyCode}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                  >
                    {copiedCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    {copiedCode ? 'Código Copiado!' : `Copiar Código (${currentClient.codigo})`}
                  </button>

                  <button
                    onClick={handleToggleStatus}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                  >
                    {currentClient.status === 'Ativo' ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    Mudar para {currentClient.status === 'Ativo' ? 'Inativo' : 'Ativo'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. MENU DE ABAS */}
        <div className="flex items-center gap-1.5 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('geral')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'geral'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Geral
          </button>

          <button
            onClick={() => setActiveTab('inventario')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'inventario'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" /> Inventário ({equipamentos.length})
          </button>

          <button
            onClick={() => setActiveTab('atendimentos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'atendimentos'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" /> Atendimentos ({atendimentos.length})
          </button>

          <button
            onClick={() => setActiveTab('registros')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'registros'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" /> Registros ({registros.length})
          </button>

          <button
            onClick={() => setActiveTab('conhecimento')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'conhecimento'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Conhecimento ({artigos.length})
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Timeline ({combinedTimeline.length})
          </button>
        </div>
      </div>

      {/* 3. DYNAMIC TAB CONTENT PANELS */}

      {/* ---------------- ABA GERAL ---------------- */}
      {activeTab === 'geral' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                Informações Cadastrais da Empresa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualize ou atualize os dados cadastrais diretamente neste Workspace.
              </p>
            </div>

            {!isEditingGeral ? (
              <button
                onClick={() => {
                  setEditForm({ ...currentClient });
                  setIsEditingGeral(true);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Editar Informações
              </button>
            ) : (
              <button
                onClick={() => setIsEditingGeral(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar Edição
              </button>
            )}
          </div>

          {/* Form / View Content */}
          {!isEditingGeral ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* DIV 1: Identificação da Empresa, Contatos, Endereço e Segmento */}
              <div className="p-5 md:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    Identificação da Empresa, Contatos & Endereço
                  </h4>
                  {currentClient.segmento && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400">Segmento:</span>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getSystemTableBadgeStyle('segmentosCliente', currentClient.segmento || '', systemTables, 'slate')}`}>
                        {currentClient.segmento}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Identificação */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block border-b border-slate-200/40 dark:border-slate-700/40 pb-1">
                      Dados Cadastrais
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Razão Social</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {currentClient.razaoSocial}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Nome Fantasia</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {currentClient.nomeFantasia || 'Não informado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">CNPJ / CPF</span>
                      <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-100">
                        {currentClient.cnpj || 'Não cadastrado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Inscrição Estadual (I.E.)</span>
                      <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-100">
                        {currentClient.inscricaoEstadual || 'Isento / Não informada'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Código SIGI</span>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {currentClient.codigo}
                      </span>
                    </div>
                  </div>

                  {/* Contato Principal */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block border-b border-slate-200/40 dark:border-slate-700/40 pb-1">
                      Contato Principal
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Responsável</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {currentClient.responsavel}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Telefone</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {currentClient.telefone || 'Não informado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">E-mail Comercial</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 break-all">
                        {currentClient.email || 'Não informado'}
                      </span>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block border-b border-slate-200/40 dark:border-slate-700/40 pb-1">
                      Localização
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Cidade / Estado</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {currentClient.cidade} / {currentClient.estado}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">CEP</span>
                      <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-100">
                        {currentClient.cep || 'Não informado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Endereço</span>
                      <span className="text-xs text-slate-800 dark:text-slate-100 font-medium">
                        {currentClient.logradouro ? (
                          <>
                            {currentClient.logradouro}
                            {currentClient.numero ? `, Nº ${currentClient.numero}` : ''}
                            {currentClient.bairro ? ` - Bairro: ${currentClient.bairro}` : ''}
                            {currentClient.complemento ? ` (${currentClient.complemento})` : ''}
                          </>
                        ) : (
                          <span className="text-slate-400 italic font-normal">Nenhum endereço cadastrado</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DIV 2: Destaques de Sistema e Instalação (Observação Bem Aparente) */}
              <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50/60 to-white dark:from-indigo-950/30 dark:via-slate-900/80 dark:to-slate-900 border-2 border-indigo-200/80 dark:border-indigo-800/60 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-indigo-900/50">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Sistemas, Módulos & Estrutura de Instalação
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      Tipo: <strong className="text-indigo-600 dark:text-indigo-400">{currentClient.tipoInstalacao || 'Não informado'}</strong>
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      Estações: <strong className="text-indigo-600 dark:text-indigo-400">{currentClient.quantidadeComputadores || 0} PCs</strong>
                    </span>
                  </div>
                </div>

                {/* Sistemas e Módulos Vinculados */}
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-2">Sistemas & Módulos Utilizados</span>
                  {currentClient.sistemasModulos && currentClient.sistemasModulos.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentClient.sistemasModulos.map((sm, index) => (
                        <div key={index} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200/80 dark:border-slate-700 rounded-xl shadow-2xs flex items-center gap-2">
                          <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">{sm.sistema}</span>
                          {sm.modulo && (
                            <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                              {sm.modulo}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Nenhum sistema vinculado a este cliente.</span>
                  )}
                </div>

                {/* Campo de Observação BEM APARENTE (Particularidades do Sistema) */}
                <div className="pt-2">
                  <span className="text-[11px] uppercase font-extrabold tracking-wider text-indigo-900 dark:text-indigo-200 block mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Particularidades do Sistema nesse Cliente (Observações de Instalação)
                  </span>
                  <div className="p-4 bg-white dark:bg-slate-900/90 border-2 border-indigo-200/80 dark:border-indigo-800/80 rounded-xl shadow-2xs">
                    {currentClient.observacaoSistemas ? (
                      <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-medium whitespace-pre-wrap">
                        {currentClient.observacaoSistemas}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                        Nenhuma particularidade de sistema ou observação de instalação cadastrada para este cliente.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Campos Especificos / Condicionais Cadastrados */}
              {currentClient.camposEspecificos && Object.keys(currentClient.camposEspecificos).length > 0 && (
                <div className="p-5 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-900/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3 flex items-center gap-2">
                    <Boxes className="w-4 h-4" />
                    Informações Adicionais (Campos Condicionais)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(currentClient.camposEspecificos).map(([key, val]) => (
                      <div key={key} className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          {key}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {val || <span className="text-slate-400 italic font-normal">Vazio</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DIV 3: Observações Gerais do Cliente */}
              <div className="p-5 md:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Observações Gerais do Cliente & SLA
                </h4>
                <div className="p-4 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/60 rounded-xl">
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                    {currentClient.observacoes || 'Nenhuma observação geral cadastrada para este cliente.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Editing Form Mode */
            <form onSubmit={handleSaveGeral} className="space-y-4 animate-in fade-in duration-200">
              {/* CNPJ (FIRST FIELD WITH LOOKUP) */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  CNPJ / CPF do Cliente (Consulta Automática)
                </label>
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={editForm.cnpj || ''}
                      onChange={(e) => setEditForm({ ...editForm, cnpj: formatCnpj(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleConsultarCnpjForEdit}
                    disabled={loadingCnpj}
                    className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    {loadingCnpj ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Consultar</span>
                  </button>
                </div>
                {cnpjError && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium animate-in fade-in duration-200">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{cnpjError}</span>
                  </div>
                )}
              </div>

              {/* Razão Social, Nome Fantasia & Inscrição Estadual */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    value={editForm.razaoSocial}
                    onChange={(e) => setEditForm({ ...editForm, razaoSocial: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    value={editForm.nomeFantasia || ''}
                    onChange={(e) => setEditForm({ ...editForm, nomeFantasia: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Inscrição Estadual (I.E.)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 12.345.678-9 ou ISENTO"
                    value={editForm.inscricaoEstadual || ''}
                    onChange={(e) => setEditForm({ ...editForm, inscricaoEstadual: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                  />
                </div>
              </div>

              {/* Responsável e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={editForm.responsavel}
                    onChange={(e) => setEditForm({ ...editForm, responsavel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Segmento
                  </label>
                  <select
                    value={editForm.segmento || ''}
                    onChange={(e) => setEditForm({ ...editForm, segmento: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="">Selecione...</option>
                    {(systemTables?.segmentosCliente?.filter(s => s.status === 'Ativo' || s.nome === editForm.segmento) || []).map((s: any) => (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Classificação
                  </label>
                  <select
                    value={editForm.classificacao || ''}
                    onChange={(e) => setEditForm({ ...editForm, classificacao: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="">Selecione...</option>
                    {(systemTables?.classificacoesCliente?.filter(c => c.status === 'Ativo' || c.nome === editForm.classificacao) || []).map((c: any) => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {(systemTables?.statusCliente?.filter(s => s.status === 'Ativo' || s.nome === editForm.status) || []).map((s: any) => (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campos Condicionais para Segmento */}
              {(() => {
                const selectedSegmentoObj = systemTables?.segmentosCliente?.find((t) => t.nome === editForm.segmento);
                const hasSegFields = selectedSegmentoObj?.camposDinamicos && selectedSegmentoObj.camposDinamicos.length > 0;

                if (!hasSegFields) return null;

                return (
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-100/40 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-700/30 space-y-3">
                    {hasSegFields && (
                      <DynamicFieldsForm
                        title={`Campos Condicionais de Segmento: ${editForm.segmento}`}
                        fields={selectedSegmentoObj.camposDinamicos}
                        values={editForm.camposEspecificos || {}}
                        onChange={(key, val) => setEditForm((prev) => ({
                          ...prev,
                          camposEspecificos: {
                            ...(prev.camposEspecificos || {}),
                            [key]: val
                          }
                        }))}
                      />
                    )}
                  </div>
                );
              })()}

              {/* Email e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={editForm.telefone || ''}
                    onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              {/* CEP, Logradouro & Número */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={editForm.cep || ''}
                    onChange={(e) => setEditForm({ ...editForm, cep: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Logradouro (Rua, Av.)
                  </label>
                  <input
                    type="text"
                    placeholder="Rua Exemplo"
                    value={editForm.logradouro || ''}
                    onChange={(e) => setEditForm({ ...editForm, logradouro: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={editForm.numero || ''}
                    onChange={(e) => setEditForm({ ...editForm, numero: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              {/* Bairro, Complemento, Cidade & UF */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={editForm.bairro || ''}
                    onChange={(e) => setEditForm({ ...editForm, bairro: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    placeholder="Sala, Andar, etc."
                    value={editForm.complemento || ''}
                    onChange={(e) => setEditForm({ ...editForm, complemento: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={editForm.cidade}
                    onChange={(e) => setEditForm({ ...editForm, cidade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    UF
                  </label>
                  <select
                    value={editForm.estado}
                    onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer font-semibold"
                  >
                    {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
                      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
                      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sistemas e Instalação */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-indigo-500" />
                  Sistemas & Instalação
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Quantidade de Computadores
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ex: 5"
                      value={editForm.quantidadeComputadores || ''}
                      onChange={(e) => setEditForm({ ...editForm, quantidadeComputadores: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tipo de Instalação
                    </label>
                    <select
                      value={editForm.tipoInstalacao || ''}
                      onChange={(e) => setEditForm({ ...editForm, tipoInstalacao: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <option value="">Selecione...</option>
                      {(systemTables?.tiposInstalacao?.filter((i: any) => i.status === 'Ativo' || i.nome === editForm.tipoInstalacao) || [
                        { id: '1', nome: 'Servidor' },
                        { id: '2', nome: 'Cliente' },
                        { id: '3', nome: 'Ambos' }
                      ]).map((opt: any) => (
                        <option key={opt.id} value={opt.nome}>{opt.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Observação Sistemas & Instalação */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Observação (Sistemas & Instalação)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Modo pré venda ativada, um sistema fiscal e um sistema não fiscal..."
                    value={editForm.observacaoSistemas || ''}
                    onChange={(e) => setEditForm({ ...editForm, observacaoSistemas: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y min-h-[70px]"
                  />
                </div>

                {/* Campos Condicionais para Tipo de Instalação */}
                {(() => {
                  const selectedInstalacaoObj = systemTables?.tiposInstalacao?.find((t) => t.nome === editForm.tipoInstalacao);
                  const hasInstFields = selectedInstalacaoObj?.camposDinamicos && selectedInstalacaoObj.camposDinamicos.length > 0;

                  if (!hasInstFields) return null;

                  return (
                    <div className="p-4 rounded-2xl bg-slate-100/40 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-700/30">
                      <DynamicFieldsForm
                        title={`Campos Condicionais de Instalação: ${editForm.tipoInstalacao}`}
                        fields={selectedInstalacaoObj.camposDinamicos}
                        values={editForm.camposEspecificos || {}}
                        onChange={(key, val) => setEditForm((prev) => ({
                          ...prev,
                          camposEspecificos: {
                            ...(prev.camposEspecificos || {}),
                            [key]: val
                          }
                        }))}
                      />
                    </div>
                  );
                })()}

                <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-3">
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
                      className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <option value="">Selecione o Sistema</option>
                      {systemTables?.sistemas?.filter(s => s.status === 'Ativo').map((s) => (
                        <option key={s.id} value={s.id}>{s.nome}</option>
                      ))}
                    </select>

                    <select
                      value={selectedModuloNome}
                      onChange={(e) => setSelectedModuloNome(e.target.value)}
                      disabled={!selectedSistemaId}
                      className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
                    >
                      <option value="">Selecione o Módulo (Opcional)</option>
                      {systemTables?.modulos?.filter(m => m.status === 'Ativo' && m.sistemaId === selectedSistemaId).map((m) => (
                        <option key={m.id} value={m.nome}>{m.nome}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddSistemaModulo}
                      disabled={!selectedSistemaId}
                      className="px-3 py-2.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors"
                      title="Adicionar Sistema/Módulo"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {(editForm.sistemasModulos || []).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {(editForm.sistemasModulos || []).map((sm, index) => (
                        <div key={index} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
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

              {/* Observações */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações e SLA
                </label>
                <textarea
                  rows={3}
                  value={editForm.observacoes || ''}
                  onChange={(e) => setEditForm({ ...editForm, observacoes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y min-h-[80px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingGeral(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Salvar Alterações
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ---------------- ABA INVENTÁRIO ---------------- */}
      {activeTab === 'inventario' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Pesquisar equipamento, código ou número de série..."
                value={eqSearch}
                onChange={(e) => setEqSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <button
              onClick={() => setIsEqModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Novo Equipamento
            </button>
          </div>

          {/* Equipamentos Tabbed By Type */}
          {(() => {
            const filteredEqs = equipamentos.filter(
              (eq) =>
                !eqSearch ||
                eq.nome.toLowerCase().includes(eqSearch.toLowerCase()) ||
                eq.codigo.toLowerCase().includes(eqSearch.toLowerCase()) ||
                eq.numeroSerie.toLowerCase().includes(eqSearch.toLowerCase())
            );

            const allTypes: string[] = Array.from(new Set((equipamentos || []).map((eq) => eq.tipo || 'Outros')));

            const finalEqs = selectedEqTab === 'todos'
              ? filteredEqs
              : filteredEqs.filter((eq) => (eq.tipo || 'Outros') === selectedEqTab);

            return (
              <div className="space-y-4">
                {/* Tabs Bar */}
                {equipamentos.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedEqTab('todos')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        selectedEqTab === 'todos'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                      }`}
                    >
                      <span>Todos</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedEqTab === 'todos' ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        {equipamentos.length}
                      </span>
                    </button>

                    {allTypes.map((tName) => {
                      const TabIcon = getEquipmentTypeIcon(tName, systemTables);
                      const count = equipamentos.filter((eq) => (eq.tipo || 'Outros') === tName).length;
                      const isSelected = selectedEqTab === tName;
                      return (
                        <button
                          key={tName}
                          type="button"
                          onClick={() => setSelectedEqTab(tName)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                          }`}
                        >
                          <TabIcon className="w-3.5 h-3.5" />
                          <span>{tName}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {finalEqs.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center">
                    <Boxes className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum equipamento encontrado</p>
                    <p className="text-xs text-slate-400 mt-1">Tente ajustar sua busca ou selecione outra categoria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {finalEqs.map((eq) => {
                      const CardIcon = getEquipmentTypeIcon(eq.tipo, systemTables);
                      return (
                        <div
                          key={eq.id}
                          onClick={() =>
                            setQuickViewModal({
                              isOpen: true,
                              type: 'equipamento',
                              data: {
                                ...eq,
                                clienteNome: currentClient.nomeFantasia || currentClient.razaoSocial,
                                clienteId: currentClient.id,
                              },
                            })
                          }
                          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/60 transition-all shadow-xs cursor-pointer group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                  <CardIcon className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                                  {eq.codigo}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEquipmentStatusBadge(
                                  eq.status
                                )}`}
                              >
                                {eq.status}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {eq.nome}
                            </h4>

                            <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center justify-between">
                                <span>Nº de Série:</span>
                                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                                  {eq.numeroSerie}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Tipo:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{eq.tipo}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Localização:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                                  {eq.localizacao || 'Padrão'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                            <span>Instalado em: {eq.dataInstalacao}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Tem certeza que deseja excluir o equipamento "${eq.nome}" (${eq.codigo})?`)) {
                                    handleSaveEquipamentosList(equipamentos.filter((item) => item.id !== eq.id));
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir Equipamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ---------------- ABA ATENDIMENTOS ---------------- */}
      {activeTab === 'atendimentos' && (
        <div className="space-y-4">
          {/* Header Filter Bar with Date Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Pesquisar chamado por assunto ou código..."
                  value={atdSearch}
                  onChange={(e) => setAtdSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Date Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold overflow-x-auto">
                  <span className="text-[10px] font-extrabold uppercase px-2 text-slate-400 flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Data:
                  </span>
                  <button
                    type="button"
                    onClick={() => setAtdDatePreset('todos')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      atdDatePreset === 'todos'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setAtdDatePreset('dia')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      atdDatePreset === 'dia'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Selecionar Dia
                  </button>
                  <button
                    type="button"
                    onClick={() => setAtdDatePreset('3dias')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      atdDatePreset === '3dias'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Últimos 3 Dias
                  </button>
                  <button
                    type="button"
                    onClick={() => setAtdDatePreset('1semana')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      atdDatePreset === '1semana'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    1 Semana
                  </button>
                  <button
                    type="button"
                    onClick={() => setAtdDatePreset('personalizado')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      atdDatePreset === 'personalizado'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>

                <button
                  onClick={() => setIsAtdModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Novo Atendimento
                </button>
              </div>
            </div>

            {/* Conditional Sub-controls for Selected Day / Custom Date Range */}
            {atdDatePreset === 'dia' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-indigo-500" />
                  Filtrar por Dia:
                </span>
                <input
                  type="date"
                  value={atdSelectedDay}
                  onChange={(e) => setAtdSelectedDay(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <button
                  type="button"
                  onClick={() => setAtdSelectedDay(new Date().toISOString().slice(0, 10))}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Hoje
                </button>
              </div>
            )}

            {atdDatePreset === 'personalizado' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Data Inicial:</span>
                  <input
                    type="date"
                    value={atdStartDate}
                    onChange={(e) => setAtdStartDate(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Data Final:</span>
                  <input
                    type="date"
                    value={atdEndDate}
                    onChange={(e) => setAtdEndDate(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Atendimentos Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {atendimentos
              .filter((atd) => {
                // 1. Text Search Filter
                if (
                  atdSearch &&
                  !atd.assunto.toLowerCase().includes(atdSearch.toLowerCase()) &&
                  !atd.codigo.toLowerCase().includes(atdSearch.toLowerCase())
                ) {
                  return false;
                }

                // 2. Date Filter
                if (atdDatePreset !== 'todos') {
                  const atdDate = parseDateString(atd.dataAbertura);
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                  if (atdDatePreset === 'dia') {
                    const targetDay = atdSelectedDay ? parseDateString(atdSelectedDay) : today;
                    if (atdDate.getTime() !== targetDay.getTime()) return false;
                  } else if (atdDatePreset === '3dias') {
                    const threeDaysAgo = new Date(today);
                    threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
                    if (atdDate < threeDaysAgo || atdDate > today) return false;
                  } else if (atdDatePreset === '1semana') {
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
                    if (atdDate < sevenDaysAgo || atdDate > today) return false;
                  } else if (atdDatePreset === 'personalizado') {
                    if (atdStartDate) {
                      const start = parseDateString(atdStartDate);
                      if (atdDate < start) return false;
                    }
                    if (atdEndDate) {
                      const end = parseDateString(atdEndDate);
                      if (atdDate > end) return false;
                    }
                  }
                }

                return true;
              })
              .map((atd) => (
                <div
                  key={atd.id}
                  onClick={() =>
                    setQuickViewModal({
                      isOpen: true,
                      type: 'atendimento',
                      data: atd,
                    })
                  }
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/60 transition-all shadow-xs cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                        {atd.codigo}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getAtendimentoPriorityBadge(
                            atd.prioridade
                          )}`}
                        >
                          Prioridade {atd.prioridade}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getAtendimentoStatusBadge(
                            atd.status
                          )}`}
                        >
                          {atd.status}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {atd.assunto}
                    </h4>

                    {atd.descricao && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
                        {atd.descricao}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Aberto: {atd.dataAbertura}</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Resp: {atd.responsavel}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ---------------- ABA REGISTROS ---------------- */}
      {activeTab === 'registros' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Pesquisar bug, melhoria ou ideia..."
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <button
              onClick={() => setIsRegModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Novo Registro
            </button>
          </div>

          {/* Registros Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registros
              .filter(
                (reg) =>
                  !regSearch ||
                  reg.titulo.toLowerCase().includes(regSearch.toLowerCase()) ||
                  reg.codigo.toLowerCase().includes(regSearch.toLowerCase())
              )
              .map((reg) => (
                <div
                  key={reg.id}
                  onClick={() =>
                    setQuickViewModal({
                      isOpen: true,
                      type: 'registro',
                      data: reg,
                    })
                  }
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/60 transition-all shadow-xs cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                        {reg.codigo}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {reg.tipo}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRegistroStatusBadge(
                            reg.status
                          )}`}
                        >
                          {reg.status}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {reg.titulo}
                    </h4>

                    {reg.descricao && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
                        {reg.descricao}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Data: {reg.data}</span>
                    <span>Autor: {reg.autor}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ---------------- ABA BASE DE CONHECIMENTO ---------------- */}
      {activeTab === 'conhecimento' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Pesquisar artigos exclusivos deste cliente..."
                value={artSearch}
                onChange={(e) => setArtSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsArtModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Novo Artigo
              </button>
              <button
                onClick={() => setIsVideoDrawerOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Novo Vídeo
              </button>
            </div>
          </div>

          {/* Artigos KB Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artigos
              .filter(
                (art) =>
                  !artSearch ||
                  art.titulo.toLowerCase().includes(artSearch.toLowerCase()) ||
                  art.codigo.toLowerCase().includes(artSearch.toLowerCase()) ||
                  art.categoria.toLowerCase().includes(artSearch.toLowerCase())
              )
              .map((art) => (
                <div
                  key={art.id}
                  onClick={() =>
                    setQuickViewModal({
                      isOpen: true,
                      type: 'artigo',
                      data: art,
                    })
                  }
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/60 transition-all shadow-xs cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                        {art.codigo}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {art.categoria}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {art.titulo}
                    </h4>

                    {art.tags && art.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {art.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Criado: {art.dataCriacao}</span>
                    <span>Por: {art.autor}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ---------------- ABA TIMELINE ---------------- */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                Linha do Tempo de Acontecimentos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Histórico cronológico de todas as interações e atualizações do cliente.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar eventos..."
                value={tlSearch}
                onChange={(e) => setTlSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Timeline Stream */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {combinedTimeline
              .filter(
                (tl) =>
                  !tlSearch ||
                  tl.titulo.toLowerCase().includes(tlSearch.toLowerCase()) ||
                  tl.descricao.toLowerCase().includes(tlSearch.toLowerCase())
              )
              .map((tl) => (
                <div key={tl.id} className="relative group">
                  {/* Icon Indicator */}
                  <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs ring-4 ring-white dark:ring-slate-900">
                    {tl.type === 'atendimento' && <Headphones className="w-3 h-3" />}
                    {tl.type === 'registro' && <FileCode2 className="w-3 h-3" />}
                    {tl.type === 'inventario' && <Boxes className="w-3 h-3" />}
                    {tl.type === 'artigo' && <BookOpen className="w-3 h-3" />}
                    {tl.type === 'cadastro' && <Building2 className="w-3 h-3" />}
                  </div>

                  <div 
                    onClick={() => {
                      if (tl.data) {
                        let viewType: QuickViewEntityType = 'atendimento';
                        if (tl.type === 'inventario') viewType = 'equipamento';
                        else if (tl.type === 'registro') viewType = 'registro';
                        else if (tl.type === 'artigo') viewType = 'artigo';
                        else if (tl.type === 'cadastro') viewType = 'cliente';
                        else if (tl.type === 'atendimento') viewType = 'atendimento';
                        else return; // Don't open for unknown types

                        setQuickViewModal({
                          isOpen: true,
                          type: viewType,
                          data: tl.data
                        });
                      }
                    }}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 transition-all hover:bg-slate-100/70 dark:hover:bg-slate-800 cursor-pointer group/item"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover/item:text-indigo-600 transition-colors">
                          {tl.titulo}
                        </h4>
                        {tl.relatedCode && (
                          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                            {tl.relatedCode}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {tl.dataHora}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {tl.descricao}
                    </p>

                    <div className="mt-2 text-[10px] text-slate-400 font-semibold">
                      Por: {tl.autor}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4. MODALS PARA CRIAÇÃO DE ITENS NO WORKSPACE */}

      {/* Drawer Novo Equipamento */}
      {isEqModalOpen && (
        <EquipamentoFormDrawer
          isOpen={isEqModalOpen}
          onClose={() => setIsEqModalOpen(false)}
          systemTables={systemTables}
          clientId={currentClient.id}
          clients={[currentClient]}
          onSave={(newEq) => {
            handleSaveEquipamentosList([newEq, ...equipamentos]);
            setTimeline((prev) => [
              {
                id: `tl-${Date.now()}`,
                type: 'inventario',
                titulo: `Equipamento Adicionado: ${newEq.nome}`,
                descricao: `Registrado equipamento ${newEq.codigo} (${newEq.tipo}).`,
                dataHora: 'Agora mesmo',
                autor: 'Usuário SIGI',
                relatedCode: newEq.codigo,
              },
              ...prev,
            ]);
            setIsEqModalOpen(false);
          }}
          onShowToast={onShowToast}
        />
      )}

      {/* Drawer Novo Atendimento */}
      {isAtdModalOpen && (
        <AtendimentoFormDrawer
          isOpen={isAtdModalOpen}
          onClose={() => setIsAtdModalOpen(false)}
          clients={allClients || [currentClient]}
          systemTables={systemTables}
          systemUsers={systemUsers}
          onSave={(newAtd) => {
            handleUpdateAtendimentos([newAtd, ...atendimentos]);
            saveAtendimento(newAtd);
            setTimeline((prev) => [
              {
                id: `tl-${Date.now()}`,
                type: 'atendimento',
                titulo: `Chamado Criado: ${newAtd.codigo}`,
                descricao: newAtd.assunto,
                dataHora: 'Agora mesmo',
                autor: newAtd.responsavel,
                relatedCode: newAtd.codigo,
              },
              ...prev,
            ]);
            setIsAtdModalOpen(false);
          }}
          onShowToast={onShowToast}
        />
      )}

      {/* Drawer Novo Registro */}
      {isRegModalOpen && (
        <RegistroFormDrawer
          isOpen={isRegModalOpen}
          onClose={() => setIsRegModalOpen(false)}
          clients={allClients || [currentClient]}
          systemTables={systemTables}
          systemUsers={systemUsers}
          onSave={(newReg) => {
            handleUpdateRegistros([newReg, ...registros]);
            saveRegistro(newReg);
            setTimeline((prev) => [
              {
                id: `tl-${Date.now()}`,
                type: 'registro',
                titulo: `Registro de ${newReg.tipo}: ${newReg.codigo}`,
                descricao: newReg.titulo,
                dataHora: 'Agora mesmo',
                autor: newReg.autor,
                relatedCode: newReg.codigo,
              },
              ...prev,
            ]);
            setIsRegModalOpen(false);
            if (onOpenRegistroWorkspace) {
              onOpenRegistroWorkspace(newReg);
            } else {
              setSelectedRegistroWorkspace(newReg);
            }
          }}
          onShowToast={onShowToast}
        />
      )}

      {/* Drawer Novo Artigo KB */}
      {isArtModalOpen && (
        <ArtigoFormDrawer
          isOpen={isArtModalOpen}
          onClose={() => setIsArtModalOpen(false)}
          systemTables={systemTables}
          systemUsers={systemUsers}
          onSave={(newArt) => {
            handleUpdateArtigos([newArt, ...artigos]);
            saveArtigo(newArt);
            setTimeline((prev) => [
              {
                id: `tl-${Date.now()}`,
                type: 'artigo',
                titulo: `Artigo da KB Publicado: ${newArt.codigo}`,
                descricao: newArt.titulo,
                dataHora: 'Agora mesmo',
                autor: newArt.autor,
                relatedCode: newArt.codigo,
              },
              ...prev,
            ]);
            setIsArtModalOpen(false);
            if (onOpenArtigoWorkspace) {
              onOpenArtigoWorkspace(newArt);
            } else {
              setSelectedArticleWorkspace(newArt);
            }
          }}
          onShowToast={onShowToast}
        />
      )}

      {/* Drawer Novo Vídeo */}
      {isVideoDrawerOpen && (
        <VideoFormDrawer
          isOpen={isVideoDrawerOpen}
          onClose={() => setIsVideoDrawerOpen(false)}
          systemTables={systemTables}
          onSave={(newVid) => {
            handleUpdateArtigos([newVid, ...artigos]);
            saveArtigo(newVid);
            setTimeline((prev) => [
              {
                id: `tl-${Date.now()}`,
                type: 'artigo',
                titulo: `Vídeo Aula Publicado: ${newVid.codigo}`,
                descricao: newVid.titulo,
                dataHora: 'Agora mesmo',
                autor: newVid.autor,
                relatedCode: newVid.codigo,
              },
              ...prev,
            ]);
            setIsVideoDrawerOpen(false);
            setSelectedVideoWorkspace(newVid);
          }}
          onShowToast={onShowToast}
        />
      )}

      {/* 5. MODAL DE VISUALIZAÇÃO DE DETALHES DE EQUIPAMENTO */}
      {selectedEquipamento && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-lg h-full p-6 shadow-2xl space-y-4 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Detalhes do Equipamento
                </h3>
              </div>
              <button
                onClick={() => setSelectedEquipamento(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {selectedEquipamento.codigo}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {selectedEquipamento.nome}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Número de Série</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedEquipamento.numeroSerie}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Tipo</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedEquipamento.tipo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Status</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedEquipamento.status}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Data Instalação</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedEquipamento.dataInstalacao}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Localização Fons/Ponto</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedEquipamento.localizacao || 'Não informado'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedEquipamento(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES ATENDIMENTO */}
      {selectedAtendimento && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-lg h-full p-6 shadow-2xl space-y-4 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Detalhes do Atendimento
                </h3>
              </div>
              <button
                onClick={() => setSelectedAtendimento(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {selectedAtendimento.codigo}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">Status: {selectedAtendimento.status}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedAtendimento.assunto}
              </h4>

              <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                {selectedAtendimento.descricao || 'Sem descrição adicional.'}
              </p>

              <div className="flex items-center justify-between pt-2 text-slate-500">
                <span>Aberto em: {selectedAtendimento.dataAbertura}</span>
                <span>Atendente: {selectedAtendimento.responsavel}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedAtendimento(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES REGISTRO */}
      {selectedRegistro && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-lg h-full p-6 shadow-2xl space-y-4 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Detalhes do Registro / Bug
                </h3>
              </div>
              <button
                onClick={() => setSelectedRegistro(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {selectedRegistro.codigo}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">Tipo: {selectedRegistro.tipo}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedRegistro.titulo}
              </h4>

              <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                {selectedRegistro.descricao || 'Sem descrição.'}
              </p>

              <div className="flex items-center justify-between pt-2 text-slate-500">
                <span>Data: {selectedRegistro.data}</span>
                <span>Autor: {selectedRegistro.autor}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedRegistro(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES ARTIGO */}
      {selectedArtigo && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-lg h-full p-6 shadow-2xl space-y-4 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Artigo da Base de Conhecimento
                </h3>
              </div>
              <button
                onClick={() => setSelectedArtigo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {selectedArtigo.codigo}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">Categoria: {selectedArtigo.categoria}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedArtigo.titulo}
              </h4>

              <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl leading-relaxed">
                {selectedArtigo.conteudo || 'Conteúdo do artigo técnico do cliente.'}
              </p>

              <div className="flex items-center justify-between pt-2 text-slate-500">
                <span>Criado: {selectedArtigo.dataCriacao}</span>
                <span>Autor: {selectedArtigo.autor}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedArtigo(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visualização Rápida Modal Unificada */}
      <QuickViewModal
        isOpen={quickViewModal.isOpen}
        onClose={() => setQuickViewModal({ isOpen: false, type: 'equipamento', data: null })}
        entityType={quickViewModal.type}
        data={quickViewModal.data}
        systemTables={systemTables}
        onOpenWorkspace={(type, data) => {
          if (type === 'equipamento' && onOpenEquipmentWorkspace) {
            onOpenEquipmentWorkspace(data as EquipamentoItem);
          } else if (type === 'atendimento') {
            onNavigateModule('atendimentos');
          } else if (type === 'registro') {
            if (onOpenRegistroWorkspace) {
              onOpenRegistroWorkspace(data as RegistroItem);
            } else {
              setSelectedRegistroWorkspace(data as RegistroItem);
            }
            setQuickViewModal({ isOpen: false, type: 'equipamento', data: null });
          } else if (type === 'artigo') {
            const art = data as ArtigoKBItem;
            if (art.tipoArtigo === 'Vídeo Aula' || art.videoUrl) {
              setSelectedVideoWorkspace(art);
            } else {
              if (onOpenArtigoWorkspace) {
                onOpenArtigoWorkspace(art);
              } else {
                setSelectedArticleWorkspace(art);
              }
            }
            setQuickViewModal({ isOpen: false, type: 'equipamento', data: null });
          } else if (type === 'cliente') {
            onNavigateModule('clientes');
          }
        }}
      />
    </div>
    </>
  );
};


