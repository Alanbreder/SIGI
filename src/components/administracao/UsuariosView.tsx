import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Shield,
  Phone,
  Mail,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  UserCheck,
  Building2,
  Briefcase,
  Smartphone,
  Save,
  MessageSquare,
  Key,
  Lock
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';

interface UsuariosViewProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  onShowToast?: (title: string, message: string) => void;
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | UserRole>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Ativo' | 'Inativo'>('todos');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [funcao, setFuncao] = useState('');
  const [role, setRole] = useState<UserRole>('Usuário');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [formError, setFormError] = useState('');

  // Filtered users
  const filteredUsers = users.filter((usr) => {
    const matchesSearch =
      usr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usr.funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usr.whatsapp.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'todos' || usr.role === roleFilter;
    const matchesStatus = statusFilter === 'todos' || usr.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenCreateDrawer = () => {
    setEditingUser(null);
    setNome('');
    setEmail('');
    setPassword('user123');
    setWhatsapp('');
    setFuncao('');
    setRole('Usuário');
    setStatus('Ativo');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (usr: UserAccount) => {
    setEditingUser(usr);
    setNome(usr.name);
    setEmail(usr.email);
    setPassword(usr.password || (usr.role === 'Administrador' ? 'admin123' : 'user123'));
    setWhatsapp(usr.whatsapp || '');
    setFuncao(usr.funcao || '');
    setRole(usr.role);
    setStatus(usr.status);
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      setFormError('O nome do usuário é obrigatório.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Informe um e-mail válido.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setFormError('Defina uma senha com pelo menos 4 caracteres.');
      return;
    }

    const initials = nome
      .trim()
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    if (editingUser) {
      const updated: UserAccount = {
        ...editingUser,
        name: nome.trim(),
        email: email.trim(),
        password: password.trim(),
        whatsapp: whatsapp.trim() || '(não informado)',
        funcao: funcao.trim() || 'Técnico / Suporte',
        role,
        status,
        avatarInitials: initials
      };
      onUpdateUser(updated);
      if (onShowToast) {
        onShowToast('Usuário Atualizado', `As informações e senha de ${updated.name} foram salvas.`);
      }
    } else {
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name: nome.trim(),
        email: email.trim(),
        password: password.trim(),
        whatsapp: whatsapp.trim() || '(não informado)',
        funcao: funcao.trim() || 'Técnico / Suporte',
        role,
        status,
        avatarInitials: initials,
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      onAddUser(newUser);
      if (onShowToast) {
        onShowToast('Usuário Cadastrado', `Usuário ${newUser.name} cadastrado com sucesso.`);
      }
    }

    setIsDrawerOpen(false);
  };

  const handleToggleStatus = (usr: UserAccount) => {
    const updated: UserAccount = {
      ...usr,
      status: usr.status === 'Ativo' ? 'Inativo' : 'Ativo'
    };
    onUpdateUser(updated);
    if (onShowToast) {
      onShowToast(
        'Status Alterado',
        `Usuário ${usr.name} agora está ${updated.status}.`
      );
    }
  };

  // Deletion confirmation state
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    // Check if trying to delete the last active administrator
    const activeAdmins = users.filter((u) => u.role === 'Administrador' && u.status === 'Ativo');
    if (userToDelete.role === 'Administrador' && activeAdmins.length <= 1) {
      if (onShowToast) {
        onShowToast('Ação Bloqueada', 'Não é permitido excluir o único Administrador ativo do sistema.');
      }
      setUserToDelete(null);
      return;
    }

    onDeleteUser(userToDelete.id);
    if (onShowToast) {
      onShowToast('Usuário Removido', `O usuário ${userToDelete.name} foi excluído com sucesso.`);
    }
    setUserToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Actions Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Gestão de Usuários e Permissões
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 text-[10px] font-extrabold">
              {users.length} Registrados
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cadastre técnicos, administradores e atendentes. O cadastro é realizado exclusivamente por administradores.
          </p>
        </div>

        <button
          onClick={handleOpenCreateDrawer}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2 w-full sm:w-80 border border-transparent focus-within:border-indigo-500/50 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, e-mail, whatsapp ou função..."
            className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 w-full"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setRoleFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                roleFilter === 'todos'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Todos Papéis
            </button>
            <button
              onClick={() => setRoleFilter('Administrador')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                roleFilter === 'Administrador'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Admins
            </button>
            <button
              onClick={() => setRoleFilter('Usuário')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                roleFilter === 'Usuário'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Usuários
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Todos Status
            </button>
            <button
              onClick={() => setStatusFilter('Ativo')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'Ativo'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setStatusFilter('Inativo')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'Inativo'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Inativos
            </button>
          </div>
        </div>
      </div>

      {/* Users List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((usr) => (
          <div
            key={usr.id}
            className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all relative overflow-hidden flex flex-col justify-between shadow-2xs ${
              usr.status === 'Inativo'
                ? 'opacity-65 border-slate-200 dark:border-slate-800 bg-slate-50/50'
                : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
            }`}
          >
            <div>
              {/* User Avatar & Badges Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-indigo-200 dark:shadow-none">
                    {usr.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {usr.name}
                    </h4>
                    <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3 shrink-0" />
                      {usr.funcao}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase flex items-center gap-1 ${
                      usr.role === 'Administrador'
                        ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Shield className="w-2.5 h-2.5" />
                    {usr.role}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(usr)}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      usr.status === 'Ativo'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800'
                    }`}
                    title="Clique para alternar status"
                  >
                    {usr.status === 'Ativo' ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-2.5 h-2.5 text-rose-500" />
                    )}
                    {usr.status}
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{usr.email}</span>
                </div>

                <div className="flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono text-[11px] font-semibold">{usr.whatsapp}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-bold shrink-0">
                    WhatsApp Integrável
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Criado em: {usr.createdAt || '01/01/2026'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditDrawer(usr)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Editar Usuário"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                </button>
                <button
                  onClick={() => setUserToDelete(usr)}
                  className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Excluir Usuário"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
              Nenhum usuário encontrado
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Ajuste os filtros de busca ou cadastre um novo usuário com as informações de acesso.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT DRAWER MODAL FOR CREATE / EDIT USER (Mandatory AGENTS.md Right Drawer Rule) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingUser ? 'Editar Usuário do Sistema' : 'Novo Usuário do Sistema'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Preencha as informações de cadastro e nível de permissão.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleSave} className="flex-1 p-6 overflow-y-auto space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {formError}
                </div>
              )}

              {/* Nome Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* E-mail de Acesso */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  E-mail de Acesso <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: carlos.silva@sip.com.br"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Senha de Acesso do Usuário */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  Senha Inicial de Acesso <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ex: admin123 ou Senha123!"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  required
                />
                <p className="text-[10px] text-slate-400">
                  Definida pelo Administrador e repassada ao usuário. O usuário poderá alterá-la no painel após acessar.
                </p>
              </div>

              {/* WhatsApp (Futura Integração) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                    WhatsApp
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Futura Integração
                  </span>
                </div>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400">
                  Número utilizado para futuras notificações automáticas de chamados e suporte.
                </p>
              </div>

              {/* Função / Cargo */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  Função / Cargo no Sistema
                </label>
                <input
                  type="text"
                  value={funcao}
                  onChange={(e) => setFuncao(e.target.value)}
                  placeholder="Ex: Suporte N2 / Especialista Fiscal / Atendente"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Papel de Acesso & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    Papel de Acesso (Perfil)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="Usuário">Usuário (Operacional / Suporte)</option>
                    <option value="Administrador">Administrador (Acesso Total)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Status da Conta
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Ativo' | 'Inativo')}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="Ativo">Ativo (Acesso Liberado)</option>
                    <option value="Inativo">Inativo (Bloqueado)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  Nota de Segurança
                </p>
                <p className="leading-relaxed">
                  Contas criadas por Administradores podem acessar imediatamente a plataforma. Em ambiente Proxmox, o usuário também é sincronizado com a tabela de usuários local do Supabase.
                </p>
              </div>

              {/* Drawer Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Confirmar Exclusão
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Esta ação é irreversível
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir permanentemente o usuário <strong className="font-bold text-slate-900 dark:text-white">{userToDelete.name}</strong> ({userToDelete.email})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer"
              >
                Sim, Excluir Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
