import { RegistroItem } from '../types';

export const initialRegistros: RegistroItem[] = [
  {
    id: 'reg-1',
    codigo: '#REG-3310',
    tipo: 'Bug',
    titulo: 'Erro HTTP 500 no endpoint de consulta de saldo do PDV',
    descricao: 'Estouro do pool de conexões do banco de dados quando múltiplos terminais PDV realizam consultas simultâneas no horário de pico de vendas.',
    sistema: 'SIGI ERP',
    modulo: 'PDV & Caixa',
    status: 'Em Análise',
    prioridade: 'Alta',
    reportadoPor: 'Cliente',
    clienteId: 'cli-1',
    clienteNome: 'Beta Tech Soluções LTDA',
    data: '28/07/2026',
    ultimaAtualizacao: '29/07/2026 às 14:30',
    autor: 'Carlos Eduardo Silva',
    tags: ['PDV', 'REST API', 'Banco de Dados', 'Timeout', 'Erro 500'],
    analiseTecnica: 'Causa raiz identificada: falta de fechamento explícito da transação no DAO de Saldo do PDV. Correção envolve implementar HikariCP connection pooling e ajustar timeout maxLifetime para 30s.',
    atendimentosVinculados: [
      {
        id: 'atd-1',
        codigo: '#ATD-8821',
        clienteId: 'cli-1',
        clienteNome: 'Beta Tech Soluções LTDA',
        assunto: 'Falha na emissão de nota fiscal em lote - Erro HTTP 500',
        descricao: 'Ao tentar transmitir um lote de 15 notas fiscais, o sistema retorna timeout.',
        modulo: 'Faturamento',
        categoria: 'Erro',
        prioridade: 'Alta',
        status: 'Em Andamento',
        dataAbertura: '28/07/2026 às 09:40',
        responsavel: 'Carlos Eduardo Silva'
      }
    ],
    artigosVinculados: [
      {
        id: 'art-101',
        codigo: '#ART-055',
        titulo: 'Procedimento de Backup e Failover do Servidor Dell R640',
        categoria: 'Procedimento Técnico',
        conteudo: 'Manual detalhado com o passo a passo para execução do backup frio e alternância da VM para o nó secundário.',
        tags: ['Dell', 'Backup', 'Servidor', 'SLA'],
        status: 'Publicado',
        dataCriacao: '16/01/2025',
        autor: 'Engenharia de Infraestrutura'
      }
    ],
    timelineEvents: [
      {
        id: 'tl-1',
        tipo: 'criacao',
        titulo: 'Registro Criado',
        descricao: 'Bug registrado através do Atendimento #ATD-8821.',
        autor: 'Carlos Eduardo Silva',
        data: '28/07/2026 às 09:45'
      },
      {
        id: 'tl-2',
        tipo: 'atendimento',
        titulo: 'Atendimento Vinculado',
        descricao: 'Atendimento #ATD-8821 (Beta Tech Soluções LTDA) vinculado.',
        autor: 'Carlos Eduardo Silva',
        data: '28/07/2026 às 10:00'
      }
    ]
  },
  {
    id: 'reg-2',
    codigo: '#REG-3311',
    tipo: 'Melhoria',
    titulo: 'Aumento automático do timeout do pool de conexões REST',
    descricao: 'Melhoria arquitetural na camada de integração para suportar picos de até 500 req/s sem enfileiramento excessivo nem bloqueios de threads.',
    sistema: 'SIGI ERP',
    modulo: 'Integração & API',
    impacto: 'Alto',
    status: 'Em Desenvolvimento',
    dataEmDesenvolvimento: '2026-07-28T10:15:00.000Z',
    prioridade: 'Média',
    reportadoPor: 'Infoserra',
    data: '25/07/2026',
    ultimaAtualizacao: '28/07/2026 às 10:15',
    autor: 'Mariana Lima',
    tags: ['Arquitetura', 'Performance', 'REST API', 'Gargalo'],
    analiseTecnica: 'Inclusão de middleware de rate limiting com algoritmos Token Bucket e migração para servidor de aplicação assíncrono.'
  },
  {
    id: 'reg-3',
    codigo: '#REG-4401',
    tipo: 'Ideia',
    titulo: 'Notificação instantânea via Telegram / WhatsApp para chamados urgentes',
    descricao: 'Desenvolvimento de bot corporativo para alertar analistas de plantão quando um atendimento de prioridade Urgente for aberto.',
    sistema: 'SIGI Geral',
    modulo: 'Notificações',
    status: 'Em Análise',
    prioridade: 'Média',
    data: '27/07/2026',
    ultimaAtualizacao: '27/07/2026 às 16:00',
    autor: 'Roberto Souza',
    tags: ['WhatsApp', 'Bot', 'Alertas', 'Automatização'],
    analiseTecnica: 'Ideia em validação. Pode utilizar a API Oficial de WhatsApp Cloud da Meta ou Webhook do Telegram para envio direto ao grupo N3.'
  },
  {
    id: 'reg-4',
    codigo: '#REG-1205',
    tipo: 'Bug',
    titulo: 'Rejeição de NF-e com Alíquota Zerada de ICMS ST no Módulo Fiscal',
    descricao: 'Quando uma nota fiscal possui produtos com isenção fiscal de ST, a validação de schema XML falha na tag vICMSST.',
    sistema: 'Emissão de NFe',
    modulo: 'Módulo Fiscal',
    status: 'Reparado',
    prioridade: 'Urgente',
    reportadoPor: 'Cliente',
    clienteId: 'cli-3',
    clienteNome: 'Omega Distribuidora e Logística LTDA',
    data: '20/07/2026',
    ultimaAtualizacao: '24/07/2026 às 11:20',
    autor: 'Fernanda Oliveira',
    tags: ['Fiscal', 'NF-e', 'ICMS', 'Sefaz', 'XML'],
    analiseTecnica: 'Ajustado o gerador de XML fiscal para omitir as tags nulas quando o CST for 60 ou 41. Testes de homologação Sefaz validados.'
  },
  {
    id: 'reg-5',
    codigo: '#REG-5022',
    tipo: 'Solicitação de Feature',
    titulo: 'Exportação unificada de relatórios de estoque para formato XLSX / PDF',
    descricao: 'Permitir a exportação direta de inventário com colunas customizadas e formatação condicional de itens com estoque crítico.',
    sistema: 'Sistema Sacoleiro',
    modulo: 'Estoque & Almoxarifado',
    impacto: 'Médio',
    status: 'Concluído',
    prioridade: 'Baixa',
    reportadoPor: 'Cliente',
    clienteId: 'cli-1',
    clienteNome: 'Beta Tech Soluções LTDA',
    data: '29/07/2026',
    ultimaAtualizacao: '29/07/2026 às 08:00',
    autor: 'Aline Castro',
    tags: ['Estoque', 'Relatórios', 'Excel', 'PDF']
  }
];
