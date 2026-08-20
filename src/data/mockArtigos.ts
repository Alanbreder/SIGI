import { ArtigoKBItem } from '../types';

export const initialArtigos: ArtigoKBItem[] = [
  {
    id: 'vid-301',
    codigo: '#VID-001',
    titulo: 'Vídeo Aula: Cadastro de Cliente e Vendedoras no Sistema Sacoleiro',
    categoria: 'Vídeo Aula',
    tipoArtigo: 'Vídeo Aula',
    modulo: 'PDV & Caixa',
    sistemaPertencente: 'Sistema Sacoleiro',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    conteudo: 'Vídeo aula prática e passo a passo ensinando como cadastrar novos clientes, definir limite de crédito e associar vendedoras Sacoleiras no sistema Sacoleiro.',
    tags: ['Vídeo Aula', 'Sacoleiro', 'Cadastro', 'Treinamento', 'Cliente'],
    status: 'Publicado',
    dataCriacao: '20/07/2026',
    ultimaAtualizacao: '20/07/2026 às 15:30',
    autor: 'Mariana Lima',
    visualizacoes: 154,
    timelineEvents: [
      {
        id: 'tl-vid-1',
        tipo: 'criacao',
        titulo: 'Vídeo Aula Cadastrada',
        descricao: 'Vídeo aula para o Sistema Sacoleiro cadastrado com sucesso.',
        autor: 'Mariana Lima',
        data: '20/07/2026 às 15:30'
      }
    ]
  },
  {
    id: 'vid-302',
    codigo: '#VID-002',
    titulo: 'Vídeo Aula: Cadastro Completo de Clientes e Faturamento no Sistema ERP',
    categoria: 'Vídeo Aula',
    tipoArtigo: 'Vídeo Aula',
    modulo: 'Faturamento',
    sistemaPertencente: 'Sistema ERP',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    conteudo: 'Treinamento detalhado sobre o módulo ERP de gestão de clientes corporativos, tributação, tabela de preços e limite de faturamento.',
    tags: ['Vídeo Aula', 'ERP', 'Faturamento', 'Treinamento', 'Cliente'],
    status: 'Publicado',
    dataCriacao: '22/07/2026',
    ultimaAtualizacao: '22/07/2026 às 10:15',
    autor: 'Carlos Eduardo Silva',
    visualizacoes: 210,
    timelineEvents: [
      {
        id: 'tl-vid-2',
        tipo: 'criacao',
        titulo: 'Vídeo Aula Cadastrada',
        descricao: 'Vídeo aula referente ao Sistema ERP publicada.',
        autor: 'Carlos Eduardo Silva',
        data: '22/07/2026 às 10:15'
      }
    ]
  },
  {
    id: 'vid-303',
    codigo: '#VID-003',
    titulo: 'Vídeo Aula: Como Emitir e Transmitir Nota Fiscal (NF-e) de Venda e Devolução',
    categoria: 'Vídeo Aula',
    tipoArtigo: 'Vídeo Aula',
    modulo: 'Módulo Fiscal',
    sistemaPertencente: 'Emissão de NFe',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    conteudo: 'Passo a passo prático de como emitir NF-e, selecionar CFOP, resolver rejeições da SEFAZ e enviar DANFE por e-mail ao cliente.',
    tags: ['Vídeo Aula', 'NFe', 'Fiscal', 'SEFAZ', 'Treinamento'],
    status: 'Publicado',
    dataCriacao: '25/07/2026',
    ultimaAtualizacao: '25/07/2026 às 16:45',
    autor: 'Roberto Souza',
    visualizacoes: 340,
    timelineEvents: [
      {
        id: 'tl-vid-3',
        tipo: 'criacao',
        titulo: 'Vídeo Aula Cadastrada',
        descricao: 'Vídeo aula sobre Emissão de NFe adicionada à Base de Conhecimento.',
        autor: 'Roberto Souza',
        data: '25/07/2026 às 16:45'
      }
    ]
  },
  {
    id: 'art-101',
    codigo: '#ART-055',
    titulo: 'Procedimento de Backup e Failover do Servidor Dell R640',
    categoria: 'Procedimento',
    tipoArtigo: 'Procedimento',
    modulo: 'Servidor & Infraestrutura',
    conteudo: 'Manual detalhado com o passo a passo para execução do backup frio e alternância da VM para o nó secundário em caso de falha no host principal.',
    tags: ['Dell', 'Backup', 'Servidor', 'SLA', 'Proxmox'],
    status: 'Publicado',
    dataCriacao: '16/01/2025',
    ultimaAtualizacao: '28/07/2026 às 14:20',
    autor: 'Carlos Eduardo Silva',
    visualizacoes: 42,
    atendimentosVinculados: [
      {
        id: 'atd-1',
        codigo: '#ATD-8821',
        clienteNome: 'Beta Tech Soluções LTDA',
        assunto: 'Servidor Proxmox com alta latência em disco no nó 1',
        prioridade: 'Alta',
        status: 'Em Andamento',
        dataAbertura: '28/07/2026 às 09:40',
        responsavel: 'Carlos Eduardo Silva'
      }
    ],
    registrosVinculados: [
      {
        id: 'reg-101',
        codigo: '#REG-1049',
        tipo: 'Bug',
        titulo: 'Lentidão no expurgo de logs temporários do sistema de PDV',
        status: 'Em Desenvolvimento',
        prioridade: 'Alta',
        data: '28/07/2026',
        autor: 'Carlos Eduardo Silva'
      }
    ],
    timelineEvents: [
      {
        id: 'tl-art-1',
        tipo: 'criacao',
        titulo: 'Artigo Publicado',
        descricao: 'Artigo criado na Base de Conhecimento.',
        autor: 'Carlos Eduardo Silva',
        data: '16/01/2025 às 10:00'
      },
      {
        id: 'tl-art-2',
        tipo: 'atendimento',
        titulo: 'Atendimento Vinculado',
        descricao: 'Vinculado ao atendimento #ATD-8821 da Beta Tech.',
        autor: 'Carlos Eduardo Silva',
        data: '28/07/2026 às 11:30'
      }
    ]
  },
  {
    id: 'art-102',
    codigo: '#ART-058',
    titulo: 'Configuração de VPN IPSec e IPs Autorizados no Firewall Mikrotik',
    categoria: 'Configuração',
    tipoArtigo: 'Configuração',
    modulo: 'Redes & Segurança',
    conteudo: 'Lista de faixas de IP público autorizadas para tráfego seguro e autenticação mTLS. Inclui chaves de criptografia AES-256 e regras de NAT.',
    tags: ['VPN', 'Segurança', 'Mikrotik', 'Rede', 'Firewall'],
    status: 'Publicado',
    dataCriacao: '02/02/2025',
    ultimaAtualizacao: '25/07/2026 às 09:15',
    autor: 'Suporte N3',
    visualizacoes: 89,
    timelineEvents: [
      {
        id: 'tl-art-102-1',
        tipo: 'criacao',
        titulo: 'Artigo Publicado',
        descricao: 'Artigo de configuração de VPN criado.',
        autor: 'Suporte N3',
        data: '02/02/2025 às 16:00'
      }
    ]
  },
  {
    id: 'art-201',
    codigo: '#ART-102',
    titulo: 'Guia de Integração REST API XPTO - Token Bearer & Rate Limits',
    categoria: 'Documentação',
    tipoArtigo: 'Documentação',
    modulo: 'Integração & API',
    conteudo: 'Documentação técnica com os endpoints da API, limites de 100 requisições por minuto por chave API e renovação automatizada de tokens OAuth2.',
    tags: ['API', 'OAuth2', 'REST', 'XPTO', 'Webhooks'],
    status: 'Publicado',
    dataCriacao: '15/11/2024',
    ultimaAtualizacao: '20/07/2026 às 11:00',
    autor: 'Equipe de Desenvolvimento',
    visualizacoes: 120
  },
  {
    id: 'art-301',
    codigo: '#ART-210',
    titulo: 'Solução para Rejeição Sefaz 539 e Emissão de NF-e com CST 60',
    categoria: 'Solução',
    tipoArtigo: 'Solução',
    modulo: 'Módulo Fiscal',
    conteudo: 'Procedimento definitivo para desativar a validação do campo vICMSSTDeson quando o CST do item for 60 ou 41 e a empresa for optante do Simples com substituição prévia.',
    tags: ['Fiscal', 'NF-e', 'ICMS', 'Sefaz', 'CST60'],
    status: 'Publicado',
    dataCriacao: '20/07/2026',
    ultimaAtualizacao: '29/07/2026 às 16:45',
    autor: 'Equipe Fiscal',
    visualizacoes: 64,
    registrosVinculados: [
      {
        id: 'reg-101',
        codigo: '#REG-1049',
        tipo: 'Bug',
        titulo: 'Lentidão no expurgo de logs temporários do sistema de PDV',
        status: 'Em Desenvolvimento',
        prioridade: 'Alta',
        data: '28/07/2026',
        autor: 'Carlos Eduardo Silva'
      }
    ]
  },
  {
    id: 'art-401',
    codigo: '#ART-305',
    titulo: 'Informações de Acesso e Topologia do Cliente Beta Tech',
    categoria: 'Informação do Cliente',
    tipoArtigo: 'Informação do Cliente',
    modulo: 'Suporte',
    clienteId: 'cli-1',
    clienteNome: 'Beta Tech Soluções LTDA',
    conteudo: 'Cadastro de IPs de gerência, contrassenhas de emergência do PABX IP, horário de atendimento preferencial e contatos da diretoria de T.I.',
    tags: ['BetaTech', 'VIP', 'Topologia', 'Contatos'],
    status: 'Publicado',
    dataCriacao: '10/05/2025',
    ultimaAtualizacao: '15/07/2026 às 18:00',
    autor: 'Carlos Eduardo Silva',
    visualizacoes: 35
  },
  {
    id: 'art-501',
    codigo: '#ART-412',
    titulo: 'Mapeamento de VLANs e Roteamento L3 na Matriz Alpha',
    categoria: 'Rede',
    tipoArtigo: 'Rede',
    modulo: 'Redes & Segurança',
    clienteId: 'cli-2',
    clienteNome: 'Alpha Logistics S.A.',
    conteudo: 'Esquema de sub-redes IPv4 /24 para VLAN 10 (Dados), VLAN 20 (Voz/VoIP), VLAN 30 (CFTV) e VLAN 99 (Gerência) com servidor DHCP redundante.',
    tags: ['Rede', 'VLAN', 'Cisco', 'DHCP', 'Alpha'],
    status: 'Publicado',
    dataCriacao: '05/03/2025',
    ultimaAtualizacao: '12/06/2026 às 10:20',
    autor: 'Engenharia de Redes',
    visualizacoes: 53
  },
  {
    id: 'art-601',
    codigo: '#ART-520',
    titulo: 'Instalação e Docker Compose para Banco Postgres e Supabase Local',
    categoria: 'Servidor',
    tipoArtigo: 'Servidor',
    modulo: 'Servidor & Infraestrutura',
    conteudo: 'Script automatizado de inicialização do ambiente de banco de dados PostgreSQL com containerização Docker e réplicas de leitura.',
    tags: ['Docker', 'PostgreSQL', 'Supabase', 'Proxmox', 'Linux'],
    status: 'Publicado',
    dataCriacao: '01/06/2025',
    ultimaAtualizacao: '19/07/2026 às 15:10',
    autor: 'SRE / DevOps',
    visualizacoes: 110
  }
];
