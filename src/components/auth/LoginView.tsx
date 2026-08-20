import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, UserCheck, Key, CheckCircle2, AlertCircle, Cpu, Server, Database } from 'lucide-react';
import { UserAccount, UserRole, User, SystemCustomization } from '../../types';

interface LoginViewProps {
  registeredUsers: UserAccount[];
  onLoginSuccess: (user: User) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  customization?: SystemCustomization;
}

export const LoginView: React.FC<LoginViewProps> = ({
  registeredUsers,
  onLoginSuccess,
  isDarkMode,
  onToggleDarkMode,
  customization
}) => {
  const [email, setEmail] = useState('carlos.silva@sip.com.br');
  const [password, setPassword] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedQuickUser, setSelectedQuickUser] = useState<UserAccount | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const targetEmail = email.trim().toLowerCase();

    // Special case for default super admin created via Proxmox SQL
    if (targetEmail === 'admin@sip.com.br') {
      if (password === 'SipAdmin2026!' || password === 'admin123' || password === 'admin') {
        onLoginSuccess({
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Administrador SIGI (ADM)',
          email: 'admin@sip.com.br',
          role: 'Administrador',
          avatarInitials: 'AD',
          funcao: 'Administrador Geral do Sistema'
        });
        return;
      } else {
        setErrorMessage('Senha incorreta para o usuário Administrador.');
        return;
      }
    }

    // Check if matches a registered user in database/system
    const foundUser = (registeredUsers || []).find(
      (u) => u.email.toLowerCase() === targetEmail
    );

    if (foundUser) {
      if (foundUser.status === 'Inativo') {
        setErrorMessage('Esta conta de usuário está Inativa. Entre em contato com o Administrador.');
        return;
      }

      // Password check
      const expectedPassword = foundUser.password || (foundUser.role === 'Administrador' ? 'admin123' : 'user123');
      if (password !== expectedPassword) {
        setErrorMessage('Senha incorreta. Verifique a senha digitada ou solicite o redefinimento ao Administrador.');
        return;
      }

      onLoginSuccess({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        avatarInitials: foundUser.avatarInitials,
        whatsapp: foundUser.whatsapp,
        funcao: foundUser.funcao
      });
      return;
    }

    setErrorMessage('E-mail não cadastrado no sistema. Não há autocadastro externo — os acessos são gerados pelo Administrador.');
  };

  const handleQuickSelectUser = (usr: UserAccount) => {
    setSelectedQuickUser(usr);
    setEmail(usr.email);
    setPassword(usr.password || (usr.role === 'Administrador' ? 'admin123' : 'user123'));
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* SIGI Logo Banner */}
        <div className="text-center space-y-2">
          {customization?.logoType === 'image' && customization.logoImageUrl ? (
            <div className="h-32 w-auto flex items-center justify-center overflow-hidden mx-auto mb-4">
              <img
                src={customization.logoImageUrl}
                alt={customization.nomeSistema || 'Logo'}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="w-32 h-32 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 text-white font-black text-4xl tracking-widest mx-auto border border-indigo-400/30 mb-4">
              {customization?.logoText || 'SIGI'}
            </div>
          )}
          <h1 className="text-2xl font-black text-white tracking-tight">
            <div>{customization?.nomeSistema || 'SIGI'}</div>
            <div className="text-lg font-medium text-slate-300">Sistema Integrado de Gestão e Inteligência</div>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Acesso Restrito ao Painel Operacional e Gestão de Atendimentos.
          </p>
        </div>


        {/* Main Login Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                Autenticação de Usuário
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Digite suas credenciais corporativas para entrar.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Proxmox Ready
            </span>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                E-mail Corporativo
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@sip.com.br"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            {/* Admin Notice */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 text-[11px] text-indigo-200/90 leading-relaxed space-y-1">
              <p className="font-extrabold flex items-center gap-1.5 text-indigo-300">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Aviso de Cadastro
              </p>
              <p>
                O cadastro de novos usuários é gerenciado exclusivamente pelo Administrador do sistema no painel de controle.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-[0.99]"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Selector for Testing */}
          {(registeredUsers || []).length > 0 && (
            <div className="pt-4 border-t border-slate-700/60 space-y-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3 h-3 text-indigo-400" />
                Acesso Rápido com Usuários Cadastrados:
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {(registeredUsers || []).map((usr) => (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => handleQuickSelectUser(usr)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      email === usr.email
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      {usr.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold truncate leading-tight">{usr.name.split(' ')[0]}</p>
                      <p className="text-[9px] text-slate-400 truncate">{usr.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3 text-slate-400" /> Proxmox Host
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-400" /> Supabase Local DB
          </span>
        </div>
      </div>
    </div>
  );
};
