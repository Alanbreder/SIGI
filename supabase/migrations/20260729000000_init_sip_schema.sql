-- ============================================================
-- SIP (Sistema de Inteligência do Cliente)
-- Migration Inicial Reproduzível v1.0
-- ============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function para atualizar automáticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- ------------------------------------------------------------
-- 1. TABELA DE CLIENTES (Workspace de Clientes)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj_cpf VARCHAR(20),
    email VARCHAR(255),
    telefone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Suspenso')),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON public.clientes(codigo);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON public.clientes(status);

-- Trigger updated_at
DROP TRIGGER IF EXISTS set_updated_at_clientes ON public.clientes;
CREATE TRIGGER set_updated_at_clientes
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 2. TABELA DE ATENDIMENTOS (Workspace de Atendimentos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.atendimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    cliente_nome VARCHAR(255),
    assunto VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    solucao TEXT,
    prioridade VARCHAR(20) DEFAULT 'Média' CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Urgente')),
    status VARCHAR(50) DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Em Andamento', 'Aguardando Cliente', 'Resolvido', 'Cancelado')),
    responsavel_nome VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_atendimentos_codigo ON public.atendimentos(codigo);
CREATE INDEX IF NOT EXISTS idx_atendimentos_cliente_id ON public.atendimentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON public.atendimentos(status);

-- Trigger updated_at
DROP TRIGGER IF EXISTS set_updated_at_atendimentos ON public.atendimentos;
CREATE TRIGGER set_updated_at_atendimentos
    BEFORE UPDATE ON public.atendimentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 3. TABELA DE REGISTROS (Workspace de Registros / Bugs / Melhorias)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Bug', 'Melhoria', 'Ideia', 'Suporte')),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Em Análise' CHECK (status IN ('Em Análise', 'Aprovado', 'Em Desenvolvimento', 'Concluído', 'Rejeitado')),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    autor_nome VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_registros_codigo ON public.registros(codigo);
CREATE INDEX IF NOT EXISTS idx_registros_tipo ON public.registros(tipo);
CREATE INDEX IF NOT EXISTS idx_registros_status ON public.registros(status);

-- Trigger updated_at
DROP TRIGGER IF EXISTS set_updated_at_registros ON public.registros;
CREATE TRIGGER set_updated_at_registros
    BEFORE UPDATE ON public.registros
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 4. TABELA DE BASE DE CONHECIMENTO (Workspace de Artigos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.artigos_kb (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    conteudo TEXT NOT NULL,
    autor_nome VARCHAR(255),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'Publicado' CHECK (status IN ('Rascunho', 'Publicado', 'Arquivado')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_artigos_kb_codigo ON public.artigos_kb(codigo);
CREATE INDEX IF NOT EXISTS idx_artigos_kb_categoria ON public.artigos_kb(categoria);

-- Trigger updated_at
DROP TRIGGER IF EXISTS set_updated_at_artigos_kb ON public.artigos_kb;
CREATE TRIGGER set_updated_at_artigos_kb
    BEFORE UPDATE ON public.artigos_kb
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 5. TABELA DE EQUIPAMENTOS / INVENTÁRIO (Workspace de Equipamentos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.equipamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    numero_serie VARCHAR(100),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    tipo VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Manutenção', 'Desativado')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_equipamentos_codigo ON public.equipamentos(codigo);
CREATE INDEX IF NOT EXISTS idx_equipamentos_cliente_id ON public.equipamentos(cliente_id);

-- Trigger updated_at
DROP TRIGGER IF EXISTS set_updated_at_equipamentos ON public.equipamentos;
CREATE TRIGGER set_updated_at_equipamentos
    BEFORE UPDATE ON public.equipamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
-- ------------------------------------------------------------
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artigos_kb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;

-- Permite acesso autenticado/anon conforme configuração de API
CREATE POLICY "Permitir leitura para usuarios do sistema" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Permitir leitura para usuarios do sistema" ON public.atendimentos FOR SELECT USING (true);
CREATE POLICY "Permitir leitura para usuarios do sistema" ON public.registros FOR SELECT USING (true);
CREATE POLICY "Permitir leitura para usuarios do sistema" ON public.artigos_kb FOR SELECT USING (true);
CREATE POLICY "Permitir leitura para usuarios do sistema" ON public.equipamentos FOR SELECT USING (true);

CREATE POLICY "Permitir escrita para usuarios do sistema" ON public.clientes FOR ALL USING (true);
CREATE POLICY "Permitir escrita para usuarios do sistema" ON public.atendimentos FOR ALL USING (true);
CREATE POLICY "Permitir escrita para usuarios do sistema" ON public.registros FOR ALL USING (true);
CREATE POLICY "Permitir escrita para usuarios do sistema" ON public.artigos_kb FOR ALL USING (true);
CREATE POLICY "Permitir escrita para usuarios do sistema" ON public.equipamentos FOR ALL USING (true);
