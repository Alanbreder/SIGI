import { SmbConfig } from '../types';

export const initialSmbConfig: SmbConfig = {
  servidorHost: '\\\\NAS-SERVER\\SIGI-Anexos',
  dominio: 'SIGI.LOCAL',
  usuarioSmb: 'smb_sigi_admin',
  senhaSmb: '••••••••••••',
  statusConexao: 'Conectado (Rede Local SMB)',
  caminhoImagensArtigos: '\\\\NAS-SERVER\\SIGI-Anexos\\artigos\\imagens',
  pastas: [
    {
      id: 'smb-f1',
      setor: 'Vídeo Aulas & Treinamentos (Base de Conhecimento)',
      key: 'videos',
      caminhoSmb: '\\\\NAS-SERVER\\SIGI-Anexos\\videos',
      descricao: 'Armazenamento de vídeos MP4/WebM e gravações de treinamentos da Base de Conhecimento.'
    },
    {
      id: 'smb-f2',
      setor: 'Artigos & Manuais (Base de Conhecimento)',
      key: 'artigos',
      caminhoSmb: '\\\\NAS-SERVER\\SIGI-Anexos\\artigos',
      descricao: 'Anexos, imagens e PDFs vinculados aos artigos e documentações da Base de Conhecimento.'
    },
    {
      id: 'smb-f3',
      setor: 'Atendimentos & Suporte N1/N2',
      key: 'atendimentos',
      caminhoSmb: '\\\\NAS-SERVER\\SIGI-Anexos\\atendimentos',
      descricao: 'Prints de erros, logs e evidências anexadas aos Chamados de Atendimento.'
    },
    {
      id: 'smb-f4',
      setor: 'Registros de Bugs & Requisições',
      key: 'registros',
      caminhoSmb: '\\\\NAS-SERVER\\SIGI-Anexos\\registros',
      descricao: 'Especificações técnicas, dumps de banco e relatórios de bugs do sistema.'
    },
    {
      id: 'smb-f5',
      setor: 'Equipamentos & Inventário',
      key: 'equipamentos',
      caminhoSmb: '\\\\NAS-SERVER\\SIGI-Anexos\\equipamentos',
      descricao: 'Manuais de equipamentos, fotos de patrimônio e relatórios de infraestrutura.'
    },
    {
      id: 'smb-f6',
      setor: 'Atendimentos Fixos & Manutenção Preventiva',
      key: 'atendimentos_fixos',
      caminhoSmb: '\\\\NAS-SERVER\\SIGI-Anexos\\atendimentos_fixos',
      descricao: 'Fotos de manutenção, ordens de serviço e fotos de equipamentos de clientes fixos.'
    }
  ]
};
