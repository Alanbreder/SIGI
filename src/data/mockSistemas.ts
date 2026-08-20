import { SistemaItem, ModuloItem } from '../types';

export const initialSistemas: SistemaItem[] = [
  {
    id: 'sis-erp',
    codigo: '#SIS-01',
    nome: 'INFOSERRA ERP',
    descricao: 'Sistema Integrado de Gestão Empresarial com módulos para gestão de cadastros, fluxo financeiro e almoxarifado.',
    status: 'Ativo',
    modulos: [
      {
        id: 'mod-erp-cadastros',
        codigo: '#MOD-101',
        nome: 'Cadastros',
        sistemaId: 'sis-erp',
        sistemaNome: 'INFOSERRA ERP',
        descricao: 'Gestão de pessoas, clientes, fornecedores, produtos, tributações e parâmetros globais do sistema.',
        status: 'Ativo',
        qtdAtendimentos: 14,
        qtdRegistros: 3,
        qtdArtigos: 5,
        dataCriacao: '10/01/2024',
        ultimaAtualizacao: '25/07/2026 às 10:15',
        timelineEvents: [
          {
            id: 'tl-mod-1',
            tipo: 'criacao',
            titulo: 'Módulo Cadastrado',
            descricao: 'Módulo de Cadastros homologado para o INFOSERRA ERP.',
            autor: 'Suporte N3',
            data: '10/01/2024 às 09:00'
          },
          {
            id: 'tl-mod-2',
            tipo: 'edicao',
            titulo: 'Atualização de Parâmetros',
            descricao: 'Inclusão de campos adicionais para validação de Inscrição Estadual.',
            autor: 'Carlos Eduardo Silva',
            data: '15/06/2026 às 14:30'
          }
        ]
      },
      {
        id: 'mod-erp-financeiro',
        codigo: '#MOD-102',
        nome: 'Financeiro',
        sistemaId: 'sis-erp',
        sistemaNome: 'INFOSERRA ERP',
        descricao: 'Contas a pagar, contas a receber, conciliação bancária, fluxo de caixa e emissão de boletos.',
        status: 'Ativo',
        qtdAtendimentos: 8,
        qtdRegistros: 2,
        qtdArtigos: 4,
        dataCriacao: '15/01/2024',
        ultimaAtualizacao: '20/07/2026 às 16:00',
        timelineEvents: [
          {
            id: 'tl-mod-fin-1',
            tipo: 'criacao',
            titulo: 'Módulo Criado',
            descricao: 'Lançamento do módulo Financeiro.',
            autor: 'Carlos Eduardo Silva',
            data: '15/01/2024 às 10:00'
          }
        ]
      },
      {
        id: 'mod-erp-estoque',
        codigo: '#MOD-103',
        nome: 'Estoque',
        sistemaId: 'sis-erp',
        sistemaNome: 'INFOSERRA ERP',
        descricao: 'Controle de lote, inventário, inventário físico, transferências entre filiais e curva ABC.',
        status: 'Ativo',
        qtdAtendimentos: 11,
        qtdRegistros: 5,
        qtdArtigos: 3,
        dataCriacao: '20/01/2024',
        ultimaAtualizacao: '22/07/2026 às 11:20',
        timelineEvents: [
          {
            id: 'tl-mod-est-1',
            tipo: 'criacao',
            titulo: 'Módulo Criado',
            descricao: 'Lançamento do módulo de Estoque.',
            autor: 'Suporte N3',
            data: '20/01/2024 às 11:00'
          }
        ]
      }
    ]
  },
  {
    id: 'sis-fiscal',
    codigo: '#SIS-02',
    nome: 'INFOSERRA Fiscal',
    descricao: 'Suíte completa para emissão de documentos fiscais eletrônicos com validações junto às SEFAZ estaduais e transmissão via Webservices.',
    status: 'Ativo',
    modulos: [
      {
        id: 'mod-fiscal-nfe',
        codigo: '#MOD-201',
        nome: 'Emissor NF-e',
        sistemaId: 'sis-fiscal',
        sistemaNome: 'INFOSERRA Fiscal',
        descricao: 'Emissão, assinatura digital A1/A3, cancelamento, carta de correção e inutilização de Nota Fiscal Eletrônica (NF-e modelo 55).',
        status: 'Ativo',
        qtdAtendimentos: 22,
        qtdRegistros: 8,
        qtdArtigos: 7,
        dataCriacao: '05/02/2024',
        ultimaAtualizacao: '29/07/2026 às 17:30',
        timelineEvents: [
          {
            id: 'tl-mod-nfe-1',
            tipo: 'criacao',
            titulo: 'Módulo Homologado',
            descricao: 'Módulo de Emissão de NF-e integrado com Sefaz.',
            autor: 'Equipe Fiscal',
            data: '05/02/2024 às 08:30'
          }
        ]
      },
      {
        id: 'mod-fiscal-nfce',
        codigo: '#MOD-202',
        nome: 'Emissor NFC-e',
        sistemaId: 'sis-fiscal',
        sistemaNome: 'INFOSERRA Fiscal',
        descricao: 'Emissão em tempo real de Nota Fiscal de Consumidor Eletrônica (NFC-e modelo 65) com contingência offline e integração com impressoras térmicas.',
        status: 'Ativo',
        qtdAtendimentos: 18,
        qtdRegistros: 4,
        qtdArtigos: 6,
        dataCriacao: '10/02/2024',
        ultimaAtualizacao: '28/07/2026 às 14:10',
        timelineEvents: [
          {
            id: 'tl-mod-nfce-1',
            tipo: 'criacao',
            titulo: 'Módulo Criado',
            descricao: 'Contingência Offline NFC-e ativada.',
            autor: 'Equipe Fiscal',
            data: '10/02/2024 às 09:15'
          }
        ]
      },
      {
        id: 'mod-fiscal-mdfe',
        codigo: '#MOD-203',
        nome: 'MDF-e',
        sistemaId: 'sis-fiscal',
        sistemaNome: 'INFOSERRA Fiscal',
        descricao: 'Manifesto Eletrônico de Documentos Fiscais para transporte rodoviário intermunicipal e interestadual de cargas.',
        status: 'Ativo',
        qtdAtendimentos: 9,
        qtdRegistros: 1,
        qtdArtigos: 2,
        dataCriacao: '25/02/2024',
        ultimaAtualizacao: '18/07/2026 às 08:45',
        timelineEvents: [
          {
            id: 'tl-mod-mdfe-1',
            tipo: 'criacao',
            titulo: 'Módulo MDF-e Ativo',
            descricao: 'Suporte a encerramento automático de MDF-e pendente.',
            autor: 'Suporte N3',
            data: '25/02/2024 às 14:00'
          }
        ]
      }
    ]
  },
  {
    id: 'sis-sac',
    codigo: '#SIS-03',
    nome: 'INFOSERRASAC',
    descricao: 'Sistema de automação comercial para força de vendas, distribuição, acerto de motoristas e romaneio de cargas.',
    status: 'Ativo',
    modulos: [
      {
        id: 'mod-sac-cargas',
        codigo: '#MOD-301',
        nome: 'Cargas',
        sistemaId: 'sis-sac',
        sistemaNome: 'INFOSERRASAC',
        descricao: 'Montagem de rotas, capacidade volumétrica de caminhões, peso máximo por veículo e ordem de entrega.',
        status: 'Ativo',
        qtdAtendimentos: 7,
        qtdRegistros: 2,
        qtdArtigos: 3,
        dataCriacao: '12/03/2024',
        ultimaAtualizacao: '15/07/2026 às 13:00',
        timelineEvents: [
          {
            id: 'tl-mod-cargas-1',
            tipo: 'criacao',
            titulo: 'Módulo Cargas Lançado',
            descricao: 'Gerenciamento de expedição e cubagem.',
            autor: 'Carlos Eduardo Silva',
            data: '12/03/2024 às 10:00'
          }
        ]
      },
      {
        id: 'mod-sac-acertos',
        codigo: '#MOD-302',
        nome: 'Acertos',
        sistemaId: 'sis-sac',
        sistemaNome: 'INFOSERRASAC',
        descricao: 'Conferência financeira do retorno das entregas, recebimentos em dinheiro/cheque/PIX e acerto de prestação de contas.',
        status: 'Ativo',
        qtdAtendimentos: 5,
        qtdRegistros: 1,
        qtdArtigos: 2,
        dataCriacao: '20/03/2024',
        ultimaAtualizacao: '10/07/2026 às 11:30',
        timelineEvents: [
          {
            id: 'tl-mod-acertos-1',
            tipo: 'criacao',
            titulo: 'Módulo Criado',
            descricao: 'Acerto financeiro de rotas de entrega.',
            autor: 'Carlos Eduardo Silva',
            data: '20/03/2024 às 11:00'
          }
        ]
      },
      {
        id: 'mod-sac-vendas',
        codigo: '#MOD-303',
        nome: 'Vendas',
        sistemaId: 'sis-sac',
        sistemaNome: 'INFOSERRASAC',
        descricao: 'Sincronização de pedidos de vendedores externos via aplicativo móvel e validação de limite de crédito.',
        status: 'Ativo',
        qtdAtendimentos: 12,
        qtdRegistros: 3,
        qtdArtigos: 4,
        dataCriacao: '28/03/2024',
        ultimaAtualizacao: '24/07/2026 às 15:45',
        timelineEvents: [
          {
            id: 'tl-mod-vendas-1',
            tipo: 'criacao',
            titulo: 'Módulo Vendas Liberado',
            descricao: 'Integração mobile com pré-venda.',
            autor: 'Suporte N3',
            data: '28/03/2024 às 16:30'
          }
        ]
      }
    ]
  },
  {
    id: 'sis-pdv',
    codigo: '#SIS-04',
    nome: 'INFOSERRA PDV',
    descricao: 'Solução ágil e de alta disponibilidade para operação de frentes de caixa de supermercados, lojas e comércio varejista.',
    status: 'Ativo',
    modulos: [
      {
        id: 'mod-pdv-frente',
        codigo: '#MOD-401',
        nome: 'Frente de Caixa',
        sistemaId: 'sis-pdv',
        sistemaNome: 'INFOSERRA PDV',
        descricao: 'Passagem rápida de itens com leitor de código de barras, integração com TEF, balanças filizola/toledo e sangria de caixa.',
        status: 'Ativo',
        qtdAtendimentos: 31,
        qtdRegistros: 9,
        qtdArtigos: 8,
        dataCriacao: '02/04/2024',
        ultimaAtualizacao: '29/07/2026 às 18:20',
        timelineEvents: [
          {
            id: 'tl-mod-pdv-1',
            tipo: 'criacao',
            titulo: 'Módulo PDV Homologado',
            descricao: 'Inclusão de suporte a Multi-TEF e leitor de QR Code PIX.',
            autor: 'Equipe de Desenvolvimento',
            data: '02/04/2024 às 09:00'
          }
        ]
      },
      {
        id: 'mod-pdv-fechamento',
        codigo: '#MOD-402',
        nome: 'Fechamento',
        sistemaId: 'sis-pdv',
        sistemaNome: 'INFOSERRA PDV',
        descricao: 'Fechamento cego de caixa, apuração de diferenças de numerário, relatório de sangrias/suprimentos e espelho de vendas por operador.',
        status: 'Ativo',
        qtdAtendimentos: 15,
        qtdRegistros: 4,
        qtdArtigos: 4,
        dataCriacao: '15/04/2024',
        ultimaAtualizacao: '21/07/2026 às 17:00',
        timelineEvents: [
          {
            id: 'tl-mod-fech-1',
            tipo: 'criacao',
            titulo: 'Módulo Fechamento Criado',
            descricao: 'Relatório sintético de conferência cega.',
            autor: 'Suporte N3',
            data: '15/04/2024 às 10:15'
          }
        ]
      }
    ]
  }
];
