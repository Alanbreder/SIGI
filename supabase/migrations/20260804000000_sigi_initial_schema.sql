-- =========================================================
-- SIGI - Sistema Integrado de Gestão e Inteligência
-- Migration Inicial para Supabase (Cloud & Self-Hosted Proxmox)
-- =========================================================

-- Enable RLS and UUID extensions
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

-- Habilitar RLS (Row Level Security) permissivo para leitura/escrita anonima de homologação e produção
ALTER TABLE public.sigi_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_atendimentos_fixos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_artigos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_sistemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigi_system_tables ENABLE ROW LEVEL SECURITY;

-- Politicas publicas permissivas para API anon/autenticada
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
CREATE POLICY "Public Full Access sigi_system_tables" ON public.sigi_system_tables FOR ALL USING (true) WITH CHECK (true);
