import { AtendimentoFixoItem } from '../types';

export const initialAtendimentosFixos: AtendimentoFixoItem[] = [
  {
    id: 'atdf-101',
    codigo: '#ATF-1001',
    clienteId: 'cli-1',
    clienteNome: 'Beta Tech Soluções LTDA',
    responsavelTecnico: 'Carlos Eduardo Silva',
    dataManutencao: 'Hoje às 09:00',
    status: 'Concluído',
    periodoManutencao: 'Manutenção Preventiva Mensal - Agosto/2026',
    anotacoes: 'Realizado checklist completo de infraestrutura: limpeza interna dos racks de servidores, verificação dos nobreaks (baterias em 98%), rotina de backup semanal confirmada com sucesso. Substituído cabo de rede principal do switch central.',
    equipamentos: [
      {
        id: 'eqm-1',
        nome: 'Cabo de Rede Furukawa Cat6 (2m)',
        tipo: 'Trocado',
        quantidade: 2,
        valorUnitario: 35.00,
        observacoes: 'Substituição por desgaste na trava do conector RJ45',
      },
      {
        id: 'eqm-2',
        nome: 'Filtro de Linha Clamper 8 Tomadas',
        tipo: 'Comprado',
        quantidade: 1,
        valorUnitario: 149.90,
        observacoes: 'Adicionado para proteção do rack principal',
      }
    ],
    anexos: [
      {
        id: 'anx-f1',
        nome: 'relatorio_manutencao_betatech.pdf',
        tamanho: '1.4 MB',
        tipo: 'application/pdf',
        dataUpload: 'Hoje às 10:15',
        autor: 'Carlos Eduardo Silva',
        storageType: 'SMB / NAS',
        caminhoArmazenamento: '\\\\NAS-SERVER\\SIGI-Anexos\\atendimentos_fixos\\ATF-1001\\relatorio_manutencao_betatech.pdf',
      }
    ],
    timelineEvents: [
      {
        id: 'tle-1',
        tipo: 'criacao',
        titulo: 'Manutenção Fixa Criada',
        descricao: 'Atendimento fixo agendado para o cliente Beta Tech Soluções LTDA.',
        autor: 'Carlos Eduardo Silva',
        data: 'Hoje às 08:30',
      },
      {
        id: 'tle-2',
        tipo: 'equipamento',
        titulo: 'Equipamentos Registrados',
        descricao: 'Registrada troca de 2x Cabo Cat6 e compra de 1x Filtro Clamper.',
        autor: 'Carlos Eduardo Silva',
        data: 'Hoje às 09:45',
      },
      {
        id: 'tle-3',
        tipo: 'status',
        titulo: 'Status alterado para Concluído',
        descricao: 'Manutenção finalizada com sucesso.',
        autor: 'Carlos Eduardo Silva',
        data: 'Hoje às 10:20',
      }
    ]
  },
  {
    id: 'atdf-102',
    codigo: '#ATF-1002',
    clienteId: 'cli-2',
    clienteNome: 'XPTO Tecnologia e Inovação SA',
    responsavelTecnico: 'Fernanda Lima',
    dataManutencao: 'Ontem às 14:00',
    status: 'Concluído',
    periodoManutencao: 'Manutenção Quinzenal de TI',
    anotacoes: 'Verificação do servidor de impressão e estações de trabalho do setor comercial. Formatação de 1 computador que apresentava lentidão no Windows 11.',
    equipamentos: [
      {
        id: 'eqm-3',
        nome: 'SSD Kingston NV2 500GB NVMe',
        tipo: 'Comprado',
        quantidade: 1,
        valorUnitario: 240.00,
        numeroSerie: 'SN-9988231',
        observacoes: 'Upgrade no PC do setor financeiro',
      }
    ],
    anexos: [],
    timelineEvents: [
      {
        id: 'tle-10',
        tipo: 'criacao',
        titulo: 'Atendimento Fixo Criado',
        descricao: 'Manutenção agendada para o cliente XPTO Tecnologia.',
        autor: 'Fernanda Lima',
        data: 'Ontem às 13:30',
      }
    ]
  },
  {
    id: 'atdf-103',
    codigo: '#ATF-1003',
    clienteId: 'cli-3',
    clienteNome: 'Acme Corporation do Brasil LTDA',
    responsavelTecnico: 'Carlos Eduardo Silva',
    dataManutencao: 'Amanhã às 10:00',
    status: 'Agendado',
    periodoManutencao: 'Manutenção Preventiva Mensal',
    anotacoes: 'Revisão periódica de backups, atualização de firmware dos roteadores e inspeção visual das impressoras de rede.',
    equipamentos: [],
    anexos: [],
    timelineEvents: [
      {
        id: 'tle-20',
        tipo: 'criacao',
        titulo: 'Atendimento Fixo Agendado',
        descricao: 'Agendado para o dia 04/08/2026.',
        autor: 'Carlos Eduardo Silva',
        data: 'Hoje às 11:00',
      }
    ]
  }
];
