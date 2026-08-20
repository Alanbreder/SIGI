import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Terminal,
  Copy,
  Check,
  Shield,
  ExternalLink,
  Code2,
  HardDrive,
  GitBranch,
  FolderGit2,
  Layers,
  Info,
  Package,
  FileCode,
  DollarSign,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { checkSupabaseHealth, SupabaseHealthStatus } from '../../lib/supabaseService';

interface ProxmoxSupabaseGuideProps {
  onShowToast?: (title: string, message: string) => void;
}

export const ProxmoxSupabaseGuide: React.FC<ProxmoxSupabaseGuideProps> = ({ onShowToast }) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);
  const [copiedMigrationSql, setCopiedMigrationSql] = useState(false);

  const [healthStatus, setHealthStatus] = useState<SupabaseHealthStatus | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const runHealthCheck = async () => {
    setIsTestingConnection(true);
    const status = await checkSupabaseHealth();
    setHealthStatus(status);
    setIsTestingConnection(false);
    if (onShowToast) {
      if (status.isConnected) {
        onShowToast('Conexão Ativa!', 'Supabase conectado com sucesso.');
      } else {
        onShowToast('Atenção Conexão', status.errorMessage || 'Verifique o .env do servidor.');
      }
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const gitDeployScript = `# =========================================================
# GUIA DE DEPLOY DO SIGI NO PROXMOX VIA GIT
# Executar dentro do Container LXC ou VM Debian/Ubuntu no Proxmox
# =========================================================

# 1. Atualizar pacotes do sistema e instalar git / node.js 20+
sudo apt update && sudo apt install -y git curl nginx build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Clonar o repositório do SIGI no diretório do servidor
sudo mkdir -p /var/www/sigi
sudo chown -R $USER:$USER /var/www/sigi
git clone https://github.com/sua-empresa/sigi-app.git /var/www/sigi
cd /var/www/sigi

# 3. Configurar as variáveis de ambiente (.env)
cp .env.example .env
nano .env # (Ajustar VITE_SUPABASE_URL com o IP local da VM Proxmox)

# 4. Instalar dependências e realizar o build de produção
npm install
npm run build

# 5. Configurar atualização contínua (Git Pull Pipeline)
# Toda nova alteração entregue via Git:
git pull origin main
npm install
npm run build
sudo systemctl reload nginx`;

  const migrationSqlScript = `-- =========================================================
-- SIGI - Sistema Integrado de Gestão e Inteligência
-- Migration Inicial Completa para Supabase (Cloud & Self-Hosted Proxmox)
-- Executar no Supabase Studio -> SQL Editor
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.sigi_clientes (
  id TEXT PRIMARY KEY,
  codigo TEXT,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT,
  responsavel TEXT,
  email TEXT,
  telefone TEXT,
  cidade TEXT,
  estado TEXT,
  status TEXT DEFAULT 'Ativo',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Atendimentos (Chamados / Suporte)
CREATE TABLE IF NOT EXISTS public.sigi_atendimentos (
  id TEXT PRIMARY KEY,
  codigo TEXT,
  assunto TEXT NOT NULL,
  status TEXT DEFAULT 'Aberto',
  prioridade TEXT DEFAULT 'Média',
  cliente_id TEXT,
  cliente_nome TEXT,
  responsavel TEXT,
  modulo TEXT,
  categoria TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Atendimentos Fixos / Manutenções Recorrentes
CREATE TABLE IF NOT EXISTS public.sigi_atendimentos_fixos (
  id TEXT PRIMARY KEY,
  codigo TEXT,
  cliente_id TEXT,
  cliente_nome TEXT,
  responsavel_tecnico TEXT,
  data_manutencao TEXT,
  status TEXT DEFAULT 'Agendado',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Registros (Bugs, Melhorias, Ideias)
CREATE TABLE IF NOT EXISTS public.sigi_registros (
  id TEXT PRIMARY KEY,
  codigo TEXT,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  status TEXT DEFAULT 'Em Análise',
  prioridade TEXT,
  cliente_id TEXT,
  cliente_nome TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela da Base de Conhecimento (Artigos KB)
CREATE TABLE IF NOT EXISTS public.sigi_artigos (
  id TEXT PRIMARY KEY,
  codigo TEXT,
  titulo TEXT NOT NULL,
  categoria TEXT,
  status TEXT DEFAULT 'Publicado',
  cliente_id TEXT,
  cliente_nome TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Sistemas e Módulos
CREATE TABLE IF NOT EXISTS public.sigi_sistemas (
  id TEXT PRIMARY KEY,
  codigo TEXT,
  nome TEXT NOT NULL,
  status TEXT DEFAULT 'Ativo',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Tabelas de Sistema / Auxiliares
CREATE TABLE IF NOT EXISTS public.sigi_system_tables (
  id TEXT PRIMARY KEY,
  key TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.sigi_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_atendimentos_fixos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_artigos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_sistemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_system_tables ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso irrestrito para a API
DROP POLICY IF EXISTS "Public Full Access sigi_clientes" ON public.sigi_clientes;
CREATE POLICY "Public Full Access sigi_clientes" ON public.sigi_clientes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access sigi_atendimentos" ON public.sigi_atendimentos;
CREATE POLICY "Public Full Access sigi_atendimentos" ON public.sigi_atendimentos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access sigi_atendimentos_fixos" ON public.sigi_atendimentos_fixos;
CREATE POLICY "Public Full Access sigi_atendimentos_fixos" ON public.sigi_atendimentos_fixos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access sigi_registros" ON public.sigi_registros;
CREATE POLICY "Public Full Access sigi_registros" ON public.sigi_registros FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access sigi_artigos" ON public.sigi_artigos;
CREATE POLICY "Public Full Access sigi_artigos" ON public.sigi_artigos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access sigi_sistemas" ON public.sigi_sistemas;
CREATE POLICY "Public Full Access sigi_sistemas" ON public.sigi_sistemas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access sigi_system_tables" ON public.sigi_system_tables;
CREATE POLICY "Public Full Access sigi_system_tables" ON public.sigi_system_tables FOR ALL USING (true) WITH CHECK (true);`;

  const sqlAdmScript = `-- =========================================================
-- SCRIPT DE CRIAÇÃO DO USUÁRIO ADMINISTRADOR (ADM) INICIAL
-- Executar no Supabase SQL Editor ou psql em Produção (Proxmox)
-- =========================================================

-- 1. Inserção do Usuário na Tabela auth.users do Supabase Auth
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  aud,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@sip.com.br',
  crypt('SipAdmin2026!', gen_salt('bf')),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Administrador SIGI","role":"Administrador","funcao":"Administrador do Sistema"}'::jsonb,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 2. Inserção do Perfil Completo na Tabela pública usuarios
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  whatsapp,
  funcao,
  role,
  status,
  created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Carlos Silva (Administrador ADM)',
  'admin@sip.com.br',
  '(11) 98765-4321',
  'Administrador do Sistema',
  'Administrador',
  'Ativo',
  now()
) ON CONFLICT (id) DO UPDATE SET
  status = 'Ativo',
  role = 'Administrador';`;

  const envConfigText = `# =========================================================
# CONFIGURAÇÃO DE AMBIENTE LOCAL PROXMOX (.env)
# =========================================================
VITE_SUPABASE_URL=http://<IP_DA_VM_PROXMOX>:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:postgres@<IP_DA_VM_PROXMOX>:54322/postgres`;

  const handleCopyGit = () => {
    navigator.clipboard.writeText(gitDeployScript);
    setCopiedGit(true);
    if (onShowToast) onShowToast('Copiado!', 'Comandos SSH de Deploy por Git copiados.');
    setTimeout(() => setCopiedGit(false), 3000);
  };

  const handleCopyMigrationSql = () => {
    navigator.clipboard.writeText(migrationSqlScript);
    setCopiedMigrationSql(true);
    if (onShowToast) onShowToast('Copiado!', 'Migration SQL de Atendimentos Fixos copiada.');
    setTimeout(() => setCopiedMigrationSql(false), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlAdmScript);
    setCopiedSql(true);
    if (onShowToast) onShowToast('Copiado!', 'Script SQL para criação do ADM copiado.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envConfigText);
    setCopiedEnv(true);
    if (onShowToast) onShowToast('Copiado!', 'Variáveis de ambiente .env copiadas.');
    setTimeout(() => setCopiedEnv(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-2xs shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Guia de Deploy no Proxmox por Git & Conexão Local Supabase
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                Produção Proxmox Local
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instruções de deploy contínuo por Git, migrations do banco Supabase local e comandos de configuração de infraestrutura no Proxmox.
            </p>
          </div>
        </div>
      </div>

      {/* Live Supabase Connection Monitor */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Status da Conexão com Banco Supabase
              </h4>
              <p className="text-[11px] text-slate-400">
                Ambiente Ativo: <strong className="text-slate-700 dark:text-slate-200 capitalize">{healthStatus?.environment || 'development'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={runHealthCheck}
            disabled={isTestingConnection}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
            <span>{isTestingConnection ? 'Testando Conexão...' : 'Testar Conexão Agora'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Variáveis do .env
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              {healthStatus?.isConfigured ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {healthStatus?.isConfigured ? 'Preenchidas' : 'Não Configuradas'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Status da Conexão
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              {healthStatus?.isConnected ? (
                healthStatus.needsMigration ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Conectado (Migration Pendente)
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Conectado & Tabelas OK
                    </span>
                  </>
                )
              ) : healthStatus?.isConfigured ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Erro ao Acessar Tabela
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Supabase Não Configurado
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Endpoint Ativo
            </span>
            <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate pt-0.5">
              {healthStatus?.supabaseUrl || 'Nenhum'}
            </p>
          </div>
        </div>

        {healthStatus?.needsMigration && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="space-y-1">
              <strong className="font-extrabold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Conexão Supabase OK — Tabelas do SIGI pendentes no banco
              </strong>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                O Supabase está acessível e credenciais ativas. Abra o <strong>SQL Editor</strong> no painel do Supabase e execute a Migration SQL inicial para criar as tabelas (<code className="font-mono">sigi_clientes</code>, etc.).
              </p>
            </div>
            <button
              onClick={handleCopyMigrationSql}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedMigrationSql ? 'Migration Copiada!' : 'Copiar Migration SQL'}</span>
            </button>
          </div>
        )}

        {healthStatus?.errorMessage && !healthStatus?.needsMigration && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            <strong>Detalhe da resposta:</strong> {healthStatus.errorMessage}
          </div>
        )}
      </div>

      {/* Grid Section 1: Git Deploy & Local Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1A: Git Deploy Workflow */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-500" />
                1. Deploy e Atualização Contínua por Git no Proxmox
              </h4>
              <button
                onClick={handleCopyGit}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedGit ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGit ? 'Copiado!' : 'Copiar Shell Script'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Toda alteração estrutural e funcional deve ser entregue como **migration reproduzível** via Git. Siga o passo a passo SSH abaixo para clonar e atualizar a produção local no Proxmox:
            </p>

            <pre className="p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed border border-slate-800 scrollbar-thin">
              {gitDeployScript}
            </pre>
          </div>

          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 rounded-2xl text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
            <p className="font-extrabold flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Diretriz de Troca de Variáveis de Ambiente:
            </p>
            <p className="text-[11px] leading-relaxed text-indigo-700 dark:text-indigo-300">
              O sistema foi construído para funcionar **apenas trocando variáveis de ambiente no <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">.env</code>**, mantendo total paridade entre a Nuvem (Dev/HML) e o Proxmox (Produção).
            </p>
          </div>
        </div>

        {/* Section 1B: Local Access Endpoints */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-500" />
              2. Endpoints Locais do Supabase no Proxmox
            </h4>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Docker / LXC</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Em ambiente de produção no Proxmox, o Supabase roda localmente dentro de uma VM ou Container LXC via Docker. Utilize os seguintes caminhos de rede e portas:
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                  Supabase Studio (Dashboard Web Local)
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">Porta 54323</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                http://&lt;IP_DA_VM_PROXMOX&gt;:54323
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  API Gateway (REST / Auth / Storage)
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">Porta 54321</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                http://&lt;IP_DA_VM_PROXMOX&gt;:54321
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-purple-500" />
                  Conexão Direta ao PostgreSQL (psql / DBeaver)
                </span>
                <span className="font-mono text-purple-600 dark:text-purple-400">Porta 54322</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                postgresql://postgres:postgres@&lt;IP_DA_VM_PROXMOX&gt;:54322/postgres
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section 2: Migrations SQL & ADM Script */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Migration Script for Atendimentos Fixos */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                3. Migration SQL Reproduzível: Atendimentos Fixos & Peças
              </h4>
              <button
                onClick={handleCopyMigrationSql}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedMigrationSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMigrationSql ? 'SQL Copiado!' : 'Copiar Migration'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Contém a nova estrutura de **Atendimentos Fixos**, incluindo campos de status, manutenções preventivas, array JSONB de peças (`cobrar_na_mensalidade`) e pasta de anexos SMB:
            </p>

            <pre className="p-4 rounded-2xl bg-slate-950 text-purple-300 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed border border-slate-800 scrollbar-thin">
              {migrationSqlScript}
            </pre>
          </div>

          <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/60 rounded-2xl text-xs text-purple-900 dark:text-purple-200">
            <p className="font-extrabold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Recurso de Cobrança em Mensalidade:
            </p>
            <p className="text-[11px] leading-relaxed text-purple-700 dark:text-purple-300">
              O campo <code className="bg-purple-100 dark:bg-purple-900 px-1 py-0.5 rounded font-mono">equipamentos</code> armazena peças compradas pela IS marcadas com a flag de cobrança automática no próximo faturamento.
            </p>
          </div>
        </div>

        {/* Script Admin User & Step-by-Step */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                4. Passo a Passo: Criação do ADM Inicial no Proxmox
              </h4>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL Copiado!' : 'Copiar ADM SQL'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Como o sistema <strong>não possui autocadastro público externo</strong>, em um servidor Proxmox recém-instalado (sem usuários no banco) é necessário instanciar o <strong>Administrador Inicial</strong> diretamente pelo Supabase Studio.
            </p>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <h5 className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs">
                Roteiro de Instalação do ADM:
              </h5>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
                <li>Acesse o <strong>Supabase Studio Local</strong> no navegador: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">http://&lt;IP_PROXMOX&gt;:54323</code>.</li>
                <li>No menu esquerdo, vá em <strong>SQL Editor</strong> e clique em <strong>New Query</strong>.</li>
                <li>Cole o script SQL abaixo para inserir o registro do ADM nas tabelas de autenticação e no cadastro de usuários.</li>
                <li>Clique no botão <strong>RUN</strong> para executar o script.</li>
                <li>Acesse a tela de login do SIGI com o e-mail <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">admin@sip.com.br</code> e senha <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">SipAdmin2026!</code>.</li>
                <li>Cadastre os demais usuários no painel <strong>Administração &rarr; Usuários</strong> e repasse o e-mail e senha inicial para cada pessoa. O usuário poderá alterar sua senha a qualquer momento clicando em <strong>Alterar Minha Senha</strong> no menu superior.</li>
              </ol>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-64 leading-relaxed border border-slate-800 scrollbar-thin">
              {sqlAdmScript}
            </pre>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 space-y-1 text-xs text-amber-900 dark:text-amber-200">
            <p className="font-extrabold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Credenciais Padrão do ADM Master:
            </p>
            <p className="text-[11px] leading-relaxed">
              <strong>E-mail:</strong> <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">admin@sip.com.br</code> • <strong>Senha Inicial:</strong> <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">SipAdmin2026!</code>
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Environment Variables .env guide */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-purple-500" />
            5. Configuração do arquivo .env da Aplicação
          </h4>
          <button
            onClick={handleCopyEnv}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEnv ? 'Copiado!' : 'Copiar .env'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          Substitua o IP no arquivo <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-indigo-600 dark:text-indigo-400">.env</code> do SIGI pelo endereço de IP estático da sua máquina virtual Proxmox.
        </p>

        <pre className="p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
          {envConfigText}
        </pre>
      </div>
    </div>
  );
};
