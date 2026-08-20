import { UserAccount } from '../types';

export const initialUsers: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Carlos Silva',
    email: 'carlos.silva@sip.com.br',
    whatsapp: '(11) 98765-4321',
    funcao: 'Administrador / Suporte N2',
    role: 'Administrador',
    status: 'Ativo',
    avatarInitials: 'CS',
    createdAt: '15/01/2026',
    password: 'admin123'
  },
  {
    id: 'usr-2',
    name: 'Mariana Lima',
    email: 'mariana.lima@sip.com.br',
    whatsapp: '(11) 97123-4567',
    funcao: 'Engenharia de Software',
    role: 'Administrador',
    status: 'Ativo',
    avatarInitials: 'ML',
    createdAt: '20/01/2026',
    password: 'admin123'
  },
  {
    id: 'usr-3',
    name: 'Roberto Souza',
    email: 'roberto.souza@sip.com.br',
    whatsapp: '(21) 99888-7766',
    funcao: 'Infraestrutura / DBA',
    role: 'Administrador',
    status: 'Ativo',
    avatarInitials: 'RS',
    createdAt: '01/02/2026',
    password: 'admin123'
  },
  {
    id: 'usr-4',
    name: 'Ana Paula Costa',
    email: 'ana.costa@sip.com.br',
    whatsapp: '(31) 98877-6655',
    funcao: 'Especialista Fiscal',
    role: 'Usuário',
    status: 'Ativo',
    avatarInitials: 'AC',
    createdAt: '10/02/2026',
    password: 'user123'
  },
  {
    id: 'usr-5',
    name: 'Felipe Santos',
    email: 'felipe.santos@sip.com.br',
    whatsapp: '(41) 99111-2233',
    funcao: 'Gestor Comercial',
    role: 'Usuário',
    status: 'Ativo',
    avatarInitials: 'FS',
    createdAt: '18/02/2026',
    password: 'user123'
  },
  {
    id: 'usr-6',
    name: 'Juliana Mendes',
    email: 'juliana.mendes@sip.com.br',
    whatsapp: '(11) 98222-3344',
    funcao: 'Implantação & CS',
    role: 'Usuário',
    status: 'Ativo',
    avatarInitials: 'JM',
    createdAt: '01/03/2026',
    password: 'user123'
  }
];
