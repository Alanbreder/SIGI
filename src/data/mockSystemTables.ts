import { SystemTablesData, SystemTableKey } from '../types';

export type SystemTableGroupKey =
  | 'cliente'
  | 'atendimento'
  | 'atendimentosFixos'
  | 'registros'
  | 'equipamentos'
  | 'conhecimento'
  | 'videos'
  | 'sistemasModulos'
  | 'apoio';

export interface SystemTableGroupMeta {
  key: SystemTableGroupKey;
  label: string;
  description: string;
  iconName?: string;
  tableKeys: SystemTableKey[];
}

export interface SystemTableMeta {
  key: SystemTableKey;
  groupKey: SystemTableGroupKey;
  label: string;
  labelSingular: string;
  description: string;
  hasSistemaVinculo?: boolean;
  linkedToEntity?: 'equipamento' | 'atendimento' | 'registro';
}

export const systemTableGroups: SystemTableGroupMeta[] = [
  {
    key: 'cliente',
    label: 'Formulário de Cliente',
    description: 'Tabelas de configuração para o formulário e cadastro de Clientes (Status, Segmento, Classificação, Instalação).',
    tableKeys: ['statusCliente', 'segmentosCliente', 'classificacoesCliente', 'tiposInstalacao']
  },
  {
    key: 'atendimento',
    label: 'Formulário de Atendimento',
    description: 'Categorias, motivos, status e prioridades operacionais para o formulário de chamados.',
    tableKeys: ['statusAtendimento', 'prioridadesAtendimento', 'categoriasAtendimento', 'motivosAtendimento']
  },
  {
    key: 'atendimentosFixos',
    label: 'Formulário de Atendimento Fixo',
    description: 'Tipos de manutenção preventiva, status e origens de custo.',
    tableKeys: ['statusAtendimentoFixo', 'tiposManutencaoFixa', 'origensCusto']
  },
  {
    key: 'registros',
    label: 'Formulário de Registro',
    description: 'Tipos, prioridades, status e impactos para o formulário de demandas técnicas e bugs.',
    tableKeys: ['statusRegistro', 'tiposRegistro', 'prioridadesRegistro', 'impactosRegistro']
  },
  {
    key: 'equipamentos',
    label: 'Formulário de Inventário',
    description: 'Tipos de equipamento, marcas, status e localizações para o formulário de inventário.',
    tableKeys: ['tiposEquipamento', 'marcasEquipamento', 'statusEquipamento', 'localizacoesEquipamento']
  },
  {
    key: 'conhecimento',
    label: 'Formulário da Base de Conhecimento',
    description: 'Categorias e status para o formulário de artigos e manuais da base de conhecimento.',
    tableKeys: ['statusBaseConhecimento', 'tiposBaseConhecimento']
  },
  {
    key: 'videos',
    label: 'Formulário de Vídeo',
    description: 'Categorias, níveis de complexidade e status para o formulário de vídeos e aulas.',
    tableKeys: ['statusVideo', 'categoriasVideo', 'niveisVideo']
  },
  {
    key: 'sistemasModulos',
    label: 'Sistemas e Módulos',
    description: 'Softwares comercializados e seus módulos vinculados.',
    tableKeys: ['sistemas', 'modulos']
  },
  {
    key: 'apoio',
    label: 'Apoio Interno',
    description: 'Setores internos e tipos de suporte prestado.',
    tableKeys: ['setoresApoio', 'tiposApoio']
  }
];

export const systemTableDefinitions: SystemTableMeta[] = [
  // CLIENTE
  {
    key: 'statusCliente',
    groupKey: 'cliente',
    label: 'Status do Cliente',
    labelSingular: 'Status do Cliente',
    description: 'Estados do ciclo de vida do cliente (Ativo, Inativo, Em Prospecção, Suspenso).'
  },
  {
    key: 'segmentosCliente',
    groupKey: 'cliente',
    label: 'Segmentos de Cliente',
    labelSingular: 'Segmento de Cliente',
    description: 'Ramo de atuação do cliente (Supermercado, Padaria, Autopeças, Vestuário, Farmácia, etc).'
  },
  {
    key: 'classificacoesCliente',
    groupKey: 'cliente',
    label: 'Classificações do Cliente',
    labelSingular: 'Classificação do Cliente',
    description: 'Nível estratégico/SLA contratado (Padrão, Crítico, Especial).'
  },
  {
    key: 'tiposInstalacao',
    groupKey: 'cliente',
    label: 'Tipos de Instalação do Cliente',
    labelSingular: 'Tipo de Instalação',
    description: 'Modo como o sistema é implantado no cliente (Servidor, Cliente, Ambos).'
  },

  // ATENDIMENTO
  {
    key: 'categoriasAtendimento',
    groupKey: 'atendimento',
    label: 'Categorias de Atendimento',
    labelSingular: 'Categoria de Atendimento',
    description: 'Classificação primária para os chamados registrados no SIGI.'
  },
  {
    key: 'motivosAtendimento',
    groupKey: 'atendimento',
    label: 'Motivos do Atendimento',
    labelSingular: 'Motivo do Atendimento',
    description: 'Justificativas operacionais registradas nos atendimentos.'
  },
  {
    key: 'statusAtendimento',
    groupKey: 'atendimento',
    label: 'Status do Atendimento',
    labelSingular: 'Status do Atendimento',
    description: 'Estados do ciclo de vida dos chamados (Aberto, Em Andamento, Aguardando Cliente, Resolvido, Concluído, Cancelado).'
  },
  {
    key: 'prioridadesAtendimento',
    groupKey: 'atendimento',
    label: 'Prioridades do Atendimento',
    labelSingular: 'Prioridade do Atendimento',
    description: 'Níveis de urgência para tratamento (Baixa, Média, Alta, Urgente).'
  },

  // ATENDIMENTO FIXO
  {
    key: 'tiposManutencaoFixa',
    groupKey: 'atendimentosFixos',
    label: 'Tipos / Frequência de Manutenção',
    labelSingular: 'Tipo de Manutenção',
    description: 'Periodicidade do contrato fixo (Mensal, Trimestral, Semestral, Avulso).'
  },
  {
    key: 'statusAtendimentoFixo',
    groupKey: 'atendimentosFixos',
    label: 'Status da Manutenção',
    labelSingular: 'Status da Manutenção',
    description: 'Situação da manutenção do cliente fixo (Concluído, Aguardando, Em Andamento, Agendado, Pendente).'
  },
  {
    key: 'origensCusto',
    groupKey: 'atendimentosFixos',
    label: 'Origens de Custo',
    labelSingular: 'Origem de Custo',
    description: 'Quem pagou pelo item/peça na manutenção (Cliente, Infoserra, Sucata).'
  },

  // REGISTRO
  {
    key: 'tiposRegistro',
    groupKey: 'registros',
    label: 'Tipos de Registro',
    labelSingular: 'Tipo de Registro',
    description: 'Tipos de demandas técnicas (Bug, Melhoria, Ideia, Tarefa).'
  },
  {
    key: 'prioridadesRegistro',
    groupKey: 'registros',
    label: 'Prioridades de Registro',
    labelSingular: 'Prioridade de Registro',
    description: 'Nível de prioridade para a fila de desenvolvimento.'
  },
  {
    key: 'statusRegistro',
    groupKey: 'registros',
    label: 'Status de Registro',
    labelSingular: 'Status de Registro',
    description: 'Etapa do pipeline técnico (Aberto, Em Análise, Aprovado, Em Desenvolvimento, Concluído, Rejeitado).'
  },
  {
    key: 'impactosRegistro',
    groupKey: 'registros',
    label: 'Impactos do Registro',
    labelSingular: 'Impacto do Registro',
    description: 'Nível de impacto causado pelo bug ou demanda (Baixo, Médio, Alto).'
  },

  // EQUIPAMENTOS
  {
    key: 'tiposEquipamento',
    groupKey: 'equipamentos',
    label: 'Tipos de Equipamento & Campos',
    labelSingular: 'Tipo de Equipamento',
    description: 'Categorias de inventário (Roteador, Access Point, Wi-Fi, Computador, Servidor, Impressora, Balança).'
  },
  {
    key: 'marcasEquipamento',
    groupKey: 'equipamentos',
    label: 'Marcas de Equipamento',
    labelSingular: 'Marca de Equipamento',
    description: 'Fabricantes e marcas homologadas (Dell, Mikrotik, Ubiquiti, Bematech, Elgin, Toledo).'
  },
  {
    key: 'statusEquipamento',
    groupKey: 'equipamentos',
    label: 'Status do Equipamento',
    labelSingular: 'Status do Equipamento',
    description: 'Situação física do ativo (Ativo, Em Manutenção, Desativado, Reserva).'
  },
  {
    key: 'localizacoesEquipamento',
    groupKey: 'equipamentos',
    label: 'Localizações do Equipamento',
    labelSingular: 'Localização do Equipamento',
    description: 'Setor ou ambiente de instalação (Recepção, Caixa, CPD, Escritório, Depósito).'
  },

  // BASE DE CONHECIMENTO
  {
    key: 'tiposBaseConhecimento',
    groupKey: 'conhecimento',
    label: 'Categorias da Base de Conhecimento',
    labelSingular: 'Categoria da Base',
    description: 'Categorias dos manuais e procedimentos (Procedimento, Solução, Configuração, Documentação, Fiscal, Rede, Servidor).'
  },
  {
    key: 'statusBaseConhecimento',
    groupKey: 'conhecimento',
    label: 'Status do Artigo KB',
    labelSingular: 'Status do Artigo',
    description: 'Estado de publicação do artigo (Publicado, Rascunho, Arquivado).'
  },

  // VIDEOS
  {
    key: 'categoriasVideo',
    groupKey: 'videos',
    label: 'Categorias de Vídeo',
    labelSingular: 'Categoria de Vídeo',
    description: 'Módulo do vídeo treinamento (Fiscal, PDV, Financeiro, Estoque, Vendas).'
  },
  {
    key: 'niveisVideo',
    groupKey: 'videos',
    label: 'Nível de Complexidade',
    labelSingular: 'Nível de Vídeo',
    description: 'Nível do conteúdo (Básico, Intermediário, Avançado).'
  },
  {
    key: 'statusVideo',
    groupKey: 'videos',
    label: 'Status do Vídeo',
    labelSingular: 'Status do Vídeo',
    description: 'Situação da aula (Ativo, Inativo, Em Gravação).'
  },

  // SISTEMAS E MODULOS
  {
    key: 'sistemas',
    groupKey: 'sistemasModulos',
    label: 'Sistemas',
    labelSingular: 'Sistema',
    description: 'Sistemas principais comercializados e suportados pelo SIGI.'
  },
  {
    key: 'modulos',
    groupKey: 'sistemasModulos',
    label: 'Módulos',
    labelSingular: 'Módulo',
    description: 'Módulos operacionais vinculados obrigatoriamente a um Sistema.',
    hasSistemaVinculo: true
  },

  // APOIO INTERNO
  {
    key: 'setoresApoio',
    groupKey: 'apoio',
    label: 'Setores de Apoio',
    labelSingular: 'Setor de Apoio',
    description: 'Setores e departamentos internos que prestam apoio técnico.'
  },
  {
    key: 'tiposApoio',
    groupKey: 'apoio',
    label: 'Tipos de Apoio',
    labelSingular: 'Tipo de Apoio',
    description: 'Classificação do tipo de suporte interno prestado nos chamados.'
  }
];

export const initialSystemTables: SystemTablesData = {
  // CLIENTE
  statusCliente: [
    { id: 'stc-1', nome: 'Ativo', descricao: 'Cliente ativo com contrato vigente.', status: 'Ativo', color: 'emerald' },
    { id: 'stc-2', nome: 'Inativo', descricao: 'Cliente com contrato encerrado.', status: 'Ativo', color: 'rose' },
    { id: 'stc-3', nome: 'Em Prospecção', descricao: 'Lead/Prospect em fase de negociação.', status: 'Ativo', color: 'sky' },
    { id: 'stc-4', nome: 'Suspenso', descricao: 'Cliente suspenso temporariamente por pendência financeira.', status: 'Ativo', color: 'amber' }
  ],
  segmentosCliente: [
    { id: 'seg-1', nome: 'Supermercado / Hortifruti', descricao: 'Supermercados, minimercados e hortifrutis.', status: 'Ativo' },
    { id: 'seg-2', nome: 'Padaria & Confeitaria', descricao: 'Padarias e panificadoras.', status: 'Ativo' },
    { id: 'seg-3', nome: 'Autopeças & Oficinas', descricao: 'Lojas de peças e manutenção de veículos.', status: 'Ativo' },
    { id: 'seg-4', nome: 'Vestuário & Calçados', descricao: 'Lojas de roupas e calçados.', status: 'Ativo' },
    { id: 'seg-5', nome: 'Farmácia & Drogaria', descricao: 'Drogarias e produtos de saúde.', status: 'Ativo' },
    { id: 'seg-6', nome: 'Outro', descricao: 'Demais segmentos de mercado.', status: 'Ativo' }
  ],
  classificacoesCliente: [
    { id: 'cls-1', nome: 'Padrão', descricao: 'Classificação padrão para novos clientes.', status: 'Ativo', color: 'slate' }
  ],
  tiposInstalacao: [
    {
      id: 'tpi-1',
      nome: 'Servidor',
      descricao: 'Instalação executada diretamente no servidor do cliente.',
      status: 'Ativo',
      camposDinamicos: [
        { key: 'cf-tpi-1', label: 'Endereço IP do Servidor', type: 'text', required: true, placeholder: 'Ex: 192.168.1.100' },
        { key: 'cf-tpi-2', label: 'Sistema Operacional Server', type: 'select', required: true, options: ['Windows Server 2022', 'Windows Server 2019', 'Windows 11 Pro', 'Linux Ubuntu', 'Linux Debian'] },
        { key: 'cf-tpi-3', label: 'Backup em Nuvem Ativo?', type: 'boolean', required: false }
      ]
    },
    { id: 'tpi-2', nome: 'Cliente', descricao: 'Instalação executada em terminal/computador de usuário.', status: 'Ativo' },
    { id: 'tpi-3', nome: 'Ambos', descricao: 'Instalação completa atuando tanto como servidor quanto terminal cliente.', status: 'Ativo' }
  ],

  // SISTEMAS & MODULOS
  sistemas: [
    {
      id: 'sis-erp',
      codigo: '#SIS-01',
      nome: 'INFOSERRA ERP',
      descricao: 'Sistema Integrado de Gestão Empresarial com módulos para gestão de cadastros, fluxo financeiro e almoxarifado.',
      status: 'Ativo'
    },
    {
      id: 'sis-fiscal',
      codigo: '#SIS-02',
      nome: 'INFOSERRA Fiscal',
      descricao: 'Suíte completa para emissão de documentos fiscais eletrônicos (NF-e, NFC-e e MDF-e).',
      status: 'Ativo'
    },
    {
      id: 'sis-sac',
      codigo: '#SIS-03',
      nome: 'INFOSERRASAC',
      descricao: 'Sistema de automação comercial para força de vendas, distribuição e acerto de rotas.',
      status: 'Ativo'
    },
    {
      id: 'sis-pdv',
      codigo: '#SIS-04',
      nome: 'INFOSERRA PDV',
      descricao: 'Solução de alta disponibilidade para operação de frentes de caixa de varejo.',
      status: 'Ativo'
    }
  ],
  modulos: [
    {
      id: 'mod-erp-cadastros',
      codigo: '#MOD-101',
      nome: 'Cadastros',
      descricao: 'Gestão de pessoas, clientes, fornecedores, produtos e parâmetros globais.',
      status: 'Ativo',
      sistemaId: 'sis-erp',
      sistemaNome: 'INFOSERRA ERP'
    },
    {
      id: 'mod-erp-financeiro',
      codigo: '#MOD-102',
      nome: 'Financeiro',
      descricao: 'Contas a pagar, contas a receber, conciliação bancária e fluxo de caixa.',
      status: 'Ativo',
      sistemaId: 'sis-erp',
      sistemaNome: 'INFOSERRA ERP'
    },
    {
      id: 'mod-erp-estoque',
      codigo: '#MOD-103',
      nome: 'Estoque',
      descricao: 'Controle de lote, inventário físico, transferências e curva ABC.',
      status: 'Ativo',
      sistemaId: 'sis-erp',
      sistemaNome: 'INFOSERRA ERP'
    },
    {
      id: 'mod-fiscal-nfe',
      codigo: '#MOD-201',
      nome: 'Emissor NF-e',
      descricao: 'Emissão, assinatura digital, cancelamento e inutilização de NF-e (Modelo 55).',
      status: 'Ativo',
      sistemaId: 'sis-fiscal',
      sistemaNome: 'INFOSERRA Fiscal'
    },
    {
      id: 'mod-fiscal-nfce',
      codigo: '#MOD-202',
      nome: 'Emissor NFC-e',
      descricao: 'Emissão em tempo real de Nota Fiscal de Consumidor Eletrônica com contingência offline.',
      status: 'Ativo',
      sistemaId: 'sis-fiscal',
      sistemaNome: 'INFOSERRA Fiscal'
    },
    {
      id: 'mod-fiscal-mdfe',
      codigo: '#MOD-203',
      nome: 'MDF-e',
      descricao: 'Manifesto Eletrônico de Documentos Fiscais para transporte rodoviário de cargas.',
      status: 'Ativo',
      sistemaId: 'sis-fiscal',
      sistemaNome: 'INFOSERRA Fiscal'
    },
    {
      id: 'mod-sac-cargas',
      codigo: '#MOD-301',
      nome: 'Cargas',
      descricao: 'Montagem de rotas, capacidade de caminhões e ordem de entrega.',
      status: 'Ativo',
      sistemaId: 'sis-sac',
      sistemaNome: 'INFOSERRASAC'
    },
    {
      id: 'mod-sac-acertos',
      codigo: '#MOD-302',
      nome: 'Acertos',
      descricao: 'Conferência financeira do retorno das entregas e acerto de prestação de contas.',
      status: 'Ativo',
      sistemaId: 'sis-sac',
      sistemaNome: 'INFOSERRASAC'
    },
    {
      id: 'mod-sac-vendas',
      codigo: '#MOD-303',
      nome: 'Vendas',
      descricao: 'Sincronização de pedidos de vendedores externos e validação de crédito.',
      status: 'Ativo',
      sistemaId: 'sis-sac',
      sistemaNome: 'INFOSERRASAC'
    },
    {
      id: 'mod-pdv-frente',
      codigo: '#MOD-401',
      nome: 'Frente de Caixa',
      descricao: 'Passagem rápida de itens, integração com TEF, balanças e sangria de caixa.',
      status: 'Ativo',
      sistemaId: 'sis-pdv',
      sistemaNome: 'INFOSERRA PDV'
    },
    {
      id: 'mod-pdv-fechamento',
      codigo: '#MOD-402',
      nome: 'Fechamento',
      descricao: 'Fechamento cego de caixa, apuração de diferenças de numerário e suprimentos.',
      status: 'Ativo',
      sistemaId: 'sis-pdv',
      sistemaNome: 'INFOSERRA PDV'
    }
  ],

  // ATENDIMENTO
  categoriasAtendimento: [
    { id: 'cat-1', nome: 'Dúvida', descricao: 'Orientação de uso e dúvidas operacionais do usuário.', status: 'Ativo' },
    { id: 'cat-2', nome: 'Erro', descricao: 'Falha técnica, exceção ou inconsistência de sistema.', status: 'Ativo' },
    { id: 'cat-3', nome: 'Configuração', descricao: 'Ajuste de parâmetros, impressoras e certificados.', status: 'Ativo' },
    { id: 'cat-4', nome: 'Comercial', descricao: 'Licenciamento, alteração contratual e contratação de módulos.', status: 'Ativo' },
    { id: 'cat-5', nome: 'Financeiro', descricao: 'Faturamento, mensalidades e negociação financeira.', status: 'Ativo' },
    { id: 'cat-6', nome: 'Fiscal', descricao: 'Inconsistências fiscais, alíquotas e rejeições SEFAZ.', status: 'Ativo' },
    { id: 'cat-7', nome: 'Outro', descricao: 'Assuntos diversos não enquadrados nas demais categorias.', status: 'Ativo' }
  ],
  motivosAtendimento: [
    { id: 'mot-1', nome: 'Falta de treinamento', descricao: 'Usuário necessita de treinamento ou reciclagem operacional.', status: 'Ativo' },
    { id: 'mot-2', nome: 'Falta de funcionalidade', descricao: 'Recurso necessário ainda não disponível no sistema.', status: 'Ativo' },
    { id: 'mot-3', nome: 'Processo complexo', descricao: 'Regra de negócio que exige orientação passo a passo.', status: 'Ativo' },
    { id: 'mot-4', nome: 'Cliente preferiu suporte', descricao: 'Cliente optou por ligar/chamar em vez de consultar a documentação.', status: 'Ativo' },
    { id: 'mot-5', nome: 'Outro', descricao: 'Outro motivo detalhado no atendimento.', status: 'Ativo' }
  ],
  statusAtendimento: [
    { id: 'stat-1', nome: 'Aberto', descricao: 'Chamado recém criado aguardando atribuição ou primeiro contato.', status: 'Ativo', color: 'sky', icon: 'Clock' },
    { id: 'stat-2', nome: 'Em Andamento', descricao: 'Atendimento sendo tratado ativamente pela equipe técnica.', status: 'Ativo', color: 'indigo', icon: 'Sliders' },
    { id: 'stat-3', nome: 'Aguardando Cliente', descricao: 'Aguardando retorno, testes ou informações do cliente.', status: 'Ativo', color: 'amber', icon: 'Clock' },
    { id: 'stat-4', nome: 'Resolvido', descricao: 'Problema solucionado e pendente apenas de validação do cliente.', status: 'Ativo', color: 'emerald', icon: 'CheckCircle2' },
    { id: 'stat-5', nome: 'Concluído', descricao: 'Chamado encerrado com sucesso e soluçao documentada.', status: 'Ativo', color: 'slate', icon: 'CheckCircle2' },
    { id: 'stat-6', nome: 'Cancelado', descricao: 'Atendimento cancelado por duplicidade ou pedido do cliente.', status: 'Ativo', color: 'rose', icon: 'XCircle' }
  ],
  prioridadesAtendimento: [
    { id: 'prio-1', nome: 'Baixa', descricao: 'Dúvidas simples ou ajustes que não impedem a operação do cliente.', status: 'Ativo', color: 'emerald', icon: 'MoveDown' },
    { id: 'prio-2', nome: 'Média', descricao: 'Inconsistência parcial com contorno operacional disponível.', status: 'Ativo', color: 'amber', icon: 'Hash' },
    { id: 'prio-3', nome: 'Alta', descricao: 'Módulo vital com impacto direto mas operação parcialmente ativa.', status: 'Ativo', color: 'rose', icon: 'MoveUp' },
    { id: 'prio-4', nome: 'Urgente', descricao: 'Parada total de caixa, emissão fiscal ou servidor inoperante.', status: 'Ativo', color: 'rose', icon: 'AlertTriangle' }
  ],

  // ATENDIMENTO FIXO
  tiposManutencaoFixa: [
    { id: 'tmf-1', nome: 'Manutenção Preventiva Mensal', descricao: 'Limpeza de hardware, revisão de backups e conferência de logs mensais.', status: 'Ativo' },
    { id: 'tmf-2', nome: 'Manutenção Trimestral', descricao: 'Verificação profunda de discos, fontes, estabilizadores e Nobreaks.', status: 'Ativo' },
    { id: 'tmf-3', nome: 'Revisão de Rede & Servidores', descricao: 'Manutenção periódica do servidor principal e switches.', status: 'Ativo' }
  ],
  statusAtendimentoFixo: [
    { id: 'saf-1', nome: 'Concluído', descricao: 'Manutenção finalizada e laudo entregue ao cliente.', status: 'Ativo', color: 'emerald' },
    { id: 'saf-2', nome: 'Aguardando', descricao: 'Aguardando disponibilidade de janela técnica do cliente.', status: 'Ativo', color: 'amber' },
    { id: 'saf-3', nome: 'Em Andamento', descricao: 'Manutenção sendo executada presencialmente ou via acesso remoto.', status: 'Ativo', color: 'indigo' },
    { id: 'saf-4', nome: 'Agendado', descricao: 'Manutenção programada no calendário técnico.', status: 'Ativo', color: 'sky' },
    { id: 'saf-5', nome: 'Pendente', descricao: 'Pendente de aprovação de orçamento de peças ou insumos.', status: 'Ativo', color: 'rose' }
  ],
  origensCusto: [
    { id: 'ocu-1', nome: 'Pago pelo Cliente', descricao: 'Item adquirido e pago diretamente pelo cliente.', status: 'Ativo', color: 'emerald' },
    { id: 'ocu-2', nome: 'Infoserra (Valor a Receber)', descricao: 'Item fornecido pela Infoserra, gerando valor a receber demonstrativo.', status: 'Ativo', color: 'indigo' },
    { id: 'ocu-3', nome: 'Sucata do Cliente', descricao: 'Item de reaproveitamento/sucata do próprio cliente.', status: 'Ativo', color: 'amber' }
  ],

  // REGISTRO
  tiposRegistro: [
    { id: 'treg-1', nome: 'Bug', descricao: 'Defeito, falha ou comportamento incorreto no sistema.', status: 'Ativo', color: 'rose' },
    { id: 'treg-2', nome: 'Melhoria', descricao: 'Otimização ou aprimoramento de recurso existente.', status: 'Ativo', color: 'indigo' },
    { id: 'treg-3', nome: 'Ideia', descricao: 'Sugestão de nova funcionalidade ou inovação trazida pelo usuário.', status: 'Ativo', color: 'purple' },
    { id: 'treg-4', nome: 'Solicitação de Feature', descricao: 'Solicitação formal de novos módulos ou funcionalidades.', status: 'Ativo', color: 'sky' }
  ],
  prioridadesRegistro: [
    { id: 'prr-1', nome: 'Baixa', descricao: 'Ajuste estético ou melhoria menor.', status: 'Ativo', color: 'emerald' },
    { id: 'prr-2', nome: 'Média', descricao: 'Demanda padrão com fluxo regular.', status: 'Ativo', color: 'amber' },
    { id: 'prr-3', nome: 'Alta', descricao: 'Impacto direto no fluxo de trabalho de vários clientes.', status: 'Ativo', color: 'rose' },
    { id: 'prr-4', nome: 'Urgente', descricao: 'Bloqueio total de release ou falha crítica de segurança.', status: 'Ativo', color: 'rose' }
  ],
  statusRegistro: [
    { id: 'str-1', nome: 'Em Análise', descricao: 'Em análise pela equipe de produto/desenvolvimento.', status: 'Ativo', color: 'amber' },
    { id: 'str-2', nome: 'Em Desenvolvimento', descricao: 'Sendo codificado ativamente pelos programadores.', status: 'Ativo', color: 'indigo' },
    { id: 'str-3', nome: 'Concluído', descricao: 'Entregue em produção e validado.', status: 'Ativo', color: 'emerald' },
    { id: 'str-4', nome: 'Reparado', descricao: 'Bug corrigido e verificado em ambiente de produção.', status: 'Ativo', color: 'emerald' },
    { id: 'str-5', nome: 'Não Aprovado', descricao: 'Inviável, duplicado ou não aprovado.', status: 'Ativo', color: 'slate' }
  ],
  impactosRegistro: [
    { id: 'imp-1', nome: 'Alto', descricao: 'Nível de impacto alto (Vermelho)', status: 'Ativo', color: 'rose' },
    { id: 'imp-2', nome: 'Médio', descricao: 'Nível de impacto médio (Laranja)', status: 'Ativo', color: 'amber' },
    { id: 'imp-3', nome: 'Baixo', descricao: 'Nível de impacto baixo (Branco/Cinza)', status: 'Ativo', color: 'slate' }
  ],

  // EQUIPAMENTOS
  tiposEquipamento: [
    {
      id: 'te-roteador',
      nome: 'Roteador',
      descricao: 'Dispositivos de roteamento de rede e firewall.',
      status: 'Ativo',
      icon: 'Router',
      camposDinamicos: [
        { key: 'marcaModelo', label: 'Marca / Modelo', type: 'text', required: true, placeholder: 'Ex: Mikrotik Hex Lite' },
        { key: 'ip', label: 'Endereço IP', type: 'text', placeholder: 'Ex: 192.168.88.1' },
        { key: 'usuario', label: 'Usuário de Acesso', type: 'text', placeholder: 'Ex: admin' },
        { key: 'senha', label: 'Senha de Acesso', type: 'password', placeholder: '••••••••' },
        { key: 'portaWan', label: 'Porta WAN', type: 'text', placeholder: 'Ex: Ether1 (IP Fixo)' }
      ]
    },
    {
      id: 'te-access',
      nome: 'Access Point',
      descricao: 'Pontos de acesso e antenas Wi-Fi corporativas.',
      status: 'Ativo',
      icon: 'Wifi',
      camposDinamicos: [
        { key: 'marcaModelo', label: 'Marca / Modelo', type: 'text', required: true, placeholder: 'Ex: Ubiquiti UniFi U6 Lite' },
        { key: 'ip', label: 'Endereço IP', type: 'text', placeholder: 'Ex: 192.168.88.10' },
        { key: 'usuario', label: 'Usuário de Acesso', type: 'text', placeholder: 'Ex: admin' },
        { key: 'senha', label: 'Senha de Acesso', type: 'password', placeholder: '••••••••' },
        { key: 'canalWifi', label: 'Canal Configurado', type: 'text', placeholder: 'Ex: Auto (Ch 1/11)' }
      ]
    },
    {
      id: 'te-wifi',
      nome: 'Redes Wi-Fi',
      descricao: 'Configuração de redes sem fio e credenciais de acesso.',
      status: 'Ativo',
      icon: 'Radio',
      camposDinamicos: [
        { key: 'ssid', label: 'SSID / Nome da Rede', type: 'text', required: true, placeholder: 'Ex: Empresa_Visitantes' },
        { key: 'senhaWifi', label: 'Senha do Wi-Fi', type: 'password', placeholder: 'Ex: @MinhaSenhaSegura123' },
        { key: 'frequencia', label: 'Frequência', type: 'select', options: ['2.4 GHz', '5 GHz', 'Dual Band'] }
      ]
    },
    {
      id: 'te-computadores',
      nome: 'Computadores',
      descricao: 'Estações de trabalho, desktops e notebooks dos colaboradores.',
      status: 'Ativo',
      icon: 'Monitor',
      camposDinamicos: [
        { key: 'marcaModelo', label: 'Marca / Modelo', type: 'text', required: true, placeholder: 'Ex: Dell Optiplex 3080' },
        { key: 'processador', label: 'Processador', type: 'text', placeholder: 'Ex: Intel i5 10ª Gen' },
        { key: 'memoria', label: 'Memória RAM', type: 'text', placeholder: 'Ex: 16GB DDR4' },
        { key: 'armazenamento', label: 'Armazenamento', type: 'text', placeholder: 'Ex: 480GB SSD NVMe' },
        { key: 'so', label: 'Sistema Operacional', type: 'select', options: ['Windows 10 Pro', 'Windows 11 Pro', 'Linux Ubuntu', 'macOS'] },
        { key: 'usuario', label: 'Usuário do S.O.', type: 'text', placeholder: 'Ex: Suporte / Admin' },
        { key: 'senha', label: 'Senha do S.O.', type: 'password', placeholder: '••••••••' }
      ]
    },
    {
      id: 'te-servidores',
      nome: 'Servidores',
      descricao: 'Servidores físicos, máquinas virtuais e storages.',
      status: 'Ativo',
      icon: 'Server',
      camposDinamicos: [
        { key: 'marcaModelo', label: 'Marca / Modelo', type: 'text', required: true, placeholder: 'Ex: Dell PowerEdge R640' },
        { key: 'processador', label: 'Processador Xeon/EPYC', type: 'text', placeholder: 'Ex: 2x Intel Xeon Gold 6230' },
        { key: 'memoria', label: 'Memória RAM', type: 'text', placeholder: 'Ex: 64GB ECC DDR4' },
        { key: 'armazenamento', label: 'Armazenamento / RAID', type: 'text', placeholder: 'Ex: RAID 5 - 4x 1TB SSD' },
        { key: 'ip', label: 'Endereço IP', type: 'text', placeholder: 'Ex: 192.168.88.250' },
        { key: 'so', label: 'Sistema Operacional', type: 'text', placeholder: 'Ex: Windows Server 2022 / Proxmox VE' },
        { key: 'usuario', label: 'Usuário Admin', type: 'text', placeholder: 'Ex: Administrator / root' },
        { key: 'senha', label: 'Senha Admin', type: 'password', placeholder: '••••••••' }
      ]
    },
    {
      id: 'te-impressoras',
      nome: 'Impressora / Termica',
      descricao: 'Impressoras térmicas de cupom e multifuncionais de rede.',
      status: 'Ativo',
      icon: 'Printer',
      camposDinamicos: [
        { key: 'marcaModelo', label: 'Marca / Modelo', type: 'text', required: true, placeholder: 'Ex: Bematech MP-4200 TH' },
        { key: 'ip', label: 'Endereço IP (Se Rede)', type: 'text', placeholder: 'Ex: 192.168.88.80' },
        { key: 'tipoConexao', label: 'Tipo de Conexão', type: 'select', options: ['Rede (Ethernet)', 'USB', 'Serial (RS232)', 'Wi-Fi'] }
      ]
    }
  ],
  marcasEquipamento: [
    { id: 'mrc-1', nome: 'Dell', descricao: 'Servidores, Desktops e Notebooks.', status: 'Ativo' },
    { id: 'mrc-2', nome: 'Mikrotik', descricao: 'Roteadores e Switches.', status: 'Ativo' },
    { id: 'mrc-3', nome: 'Ubiquiti / UniFi', descricao: 'Access Points e switches gerenciáveis.', status: 'Ativo' },
    { id: 'mrc-4', nome: 'Bematech / Elgin', descricao: 'Impressoras térmicas e leitor de código de barras.', status: 'Ativo' },
    { id: 'mrc-5', nome: 'Toledo', descricao: 'Balanças de checkout e retaguarda.', status: 'Ativo' }
  ],
  statusEquipamento: [
    { id: 'ste-1', nome: 'Ativo', descricao: 'Equipamento instalado e operando em produção.', status: 'Ativo', color: 'emerald' },
    { id: 'ste-2', nome: 'Em Manutenção', descricao: 'Equipamento recolhido para reparo técnico.', status: 'Ativo', color: 'amber' },
    { id: 'ste-3', nome: 'Reserva / Estoque', descricao: 'Equipamento de backup disponível no laboratório.', status: 'Ativo', color: 'sky' },
    { id: 'ste-4', nome: 'Desativado', descricao: 'Equipamento obsoleto ou descartado.', status: 'Ativo', color: 'slate' }
  ],
  localizacoesEquipamento: [
    { id: 'loc-1', nome: 'Recepção / Frente de Loja', descricao: 'Caixas e atendimento.', status: 'Ativo' },
    { id: 'loc-2', nome: 'CPD / Rack Principal', descricao: 'Sala de servidores e switches central.', status: 'Ativo' },
    { id: 'loc-3', nome: 'Escritório / Adm', descricao: 'Salas administrativas e financeiro.', status: 'Ativo' },
    { id: 'loc-4', nome: 'Estoque / Depósito', descricao: 'Coleta de dados e conferência.', status: 'Ativo' }
  ],

  // BASE DE CONHECIMENTO
  tiposBaseConhecimento: [
    { id: 'tbase-1', nome: 'Procedimento', descricao: 'Passo a passo instrutivo de processos operacionais.', status: 'Ativo' },
    { id: 'tbase-2', nome: 'Solução', descricao: 'Solução para problemas ou mensagens de erro conhecidas.', status: 'Ativo' },
    { id: 'tbase-3', nome: 'Configuração', descricao: 'Guias de instalação, parâmetros e ambiente.', status: 'Ativo' },
    { id: 'tbase-4', nome: 'Documentação', descricao: 'Especificação técnica e regras do sistema.', status: 'Ativo' },
    { id: 'tbase-5', nome: 'Informação do Cliente', descricao: 'Anotações sobre regras de negócio específicas do cliente.', status: 'Ativo' },
    { id: 'tbase-6', nome: 'Rede & Conectividade', descricao: 'Parâmetros de rede, IPs, portas e VPNs.', status: 'Ativo' },
    { id: 'tbase-7', nome: 'Servidor & Banco de Dados', descricao: 'Manuais de servidores, bancos de dados e backups.', status: 'Ativo' }
  ],
  statusBaseConhecimento: [
    { id: 'sbk-1', nome: 'Publicado', descricao: 'Artigo ativo disponível para consulta rápida de toda a equipe.', status: 'Ativo', color: 'emerald' },
    { id: 'sbk-2', nome: 'Rascunho', descricao: 'Artigo em elaboração pendente de revisão.', status: 'Ativo', color: 'amber' },
    { id: 'sbk-3', nome: 'Arquivado', descricao: 'Artigo obsoleto mantido apenas para histórico.', status: 'Ativo', color: 'slate' }
  ],

  // VIDEOS
  categoriasVideo: [
    { id: 'cv-1', nome: 'Fiscal & Documentos Eletrônicos', descricao: 'Emissão de NFe, NFCe, MDFe e regras tributárias.', status: 'Ativo' },
    { id: 'cv-2', nome: 'Frente de Caixa (PDV)', descricao: 'Operação de caixa, cancelamentos, sangria e TEF.', status: 'Ativo' },
    { id: 'cv-3', nome: 'Estoque & Compras', descricao: 'Controle de lote, entrada de notas e inventário.', status: 'Ativo' },
    { id: 'cv-4', nome: 'Financeiro & DRE', descricao: 'Contas a pagar/receber e conciliação bancária.', status: 'Ativo' },
    { id: 'cv-5', nome: 'Infraestrutura & Redes', descricao: 'Configuração de impressoras, leitores e redes.', status: 'Ativo' }
  ],
  niveisVideo: [
    { id: 'nv-1', nome: 'Básico', descricao: 'Aulas introdutórias para iniciantes.', status: 'Ativo', color: 'emerald' },
    { id: 'nv-2', nome: 'Intermediário', descricao: 'Capacitação operacional para usuários do dia a dia.', status: 'Ativo', color: 'indigo' },
    { id: 'nv-3', nome: 'Avançado', descricao: 'Treinamento de parametrização avançada e regras complexas.', status: 'Ativo', color: 'purple' }
  ],
  statusVideo: [
    { id: 'sv-1', nome: 'Ativo', descricao: 'Vídeo disponível na biblioteca.', status: 'Ativo', color: 'emerald' },
    { id: 'sv-2', nome: 'Inativo', descricao: 'Vídeo temporariamente oculto.', status: 'Ativo', color: 'rose' },
    { id: 'sv-3', nome: 'Em Gravação', descricao: 'Aula em planejamento ou gravação.', status: 'Ativo', color: 'amber' }
  ],

  // APOIO INTERNO
  setoresApoio: [
    { id: 'set-1', nome: 'Desenvolvimento', descricao: 'Equipe de desenvolvimento e correção de bugs no código.', status: 'Ativo' },
    { id: 'set-2', nome: 'Comercial', descricao: 'Equipe de relacionamento comercial e executivos de conta.', status: 'Ativo' },
    { id: 'set-3', nome: 'Fiscal', descricao: 'Especialistas tributários e de suporte a legislação.', status: 'Ativo' },
    { id: 'set-4', nome: 'Financeiro', descricao: 'Cobrança, contas a receber e faturamento.', status: 'Ativo' },
    { id: 'set-5', nome: 'Implantação', descricao: 'Consultores de onboarding e implantação de novos clientes.', status: 'Ativo' },
    { id: 'set-6', nome: 'Outro', descricao: 'Outro setor ou departamento de apoio.', status: 'Ativo' }
  ],
  tiposApoio: [
    { id: 'tpo-1', nome: 'Dúvida Técnica', descricao: 'Apoio técnico para resolução de dúvida de regra de negócio.', status: 'Ativo' },
    { id: 'tpo-2', nome: 'Correção', descricao: 'Intervenção técnica direta em dados ou código.', status: 'Ativo' },
    { id: 'tpo-3', nome: 'Aprovação', descricao: 'Necessidade de alçada superior para procedimento restrito.', status: 'Ativo' },
    { id: 'tpo-4', nome: 'Configuração', descricao: 'Apoio especializado em infraestrutura e servidores.', status: 'Ativo' },
    { id: 'tpo-5', nome: 'Acesso', descricao: 'Liberação de permissões, chaves ou senhas especiais.', status: 'Ativo' },
    { id: 'tpo-6', nome: 'Outro', descricao: 'Outro tipo de apoio especializado.', status: 'Ativo' }
  ]
};
