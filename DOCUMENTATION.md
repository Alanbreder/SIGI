# SIP - Sistema de Inteligência do Cliente (SIGI)

> **Manual de Arquitetura, Instalação no Proxmox, Deploy via Git e Manutenção do Sistema**

---

## 📋 Sumário
1. [Visão Geral e Filosofia do SIP](#1-visão-geral-e-filosofia-do-sip)
2. [Arquitetura de Ambientes (Desenvolvimento vs. Produção)](#2-arquitetura-de-ambientes)
3. [Estrutura de Workspaces e Módulos Principais](#3-estrutura-de-workspaces-e-módulos-principais)
4. [Configuração de Variáveis de Ambiente](#4-configuração-de-variáveis-de-ambiente)
5. [Guia de Instalação e Hospedagem no Proxmox](#5-guia-de-instalação-e-hospedagem-no-proxmox)
6. [Fluxo de Deploy Automatizado via Git](#6-fluxo-de-deploy-automatizado-via-git)
7. [Gerenciamento do Banco de Dados e Migrations](#7-gerenciamento-do-banco-de-dados-e-migrations)
8. [Relatório Daily Report e Gestão de Atividades](#8-relatório-daily-report-e-gestão-de-atividades)
9. [Procedimentos de Manutenção, Backup e Suporte](#9-procedimentos-de-manutenção-backup-e-suporte)

---

## 1. Visão Geral e Filosofia do SIP

O **SIP (Sistema de Inteligência do Cliente / SIGI)** é uma plataforma centralizada projetada para gerenciar o relacionamento, atendimento técnico, bugs/melhorias, inventário de equipamentos e base de conhecimento.

### Diretrizes Fundamentais:
* **Filosofia Workspace-First**: Toda entidade principal possui seu próprio espaço de trabalho dedicado (Workspace) em Painel Lateral (Right Drawer) ou página dedicada.
* **Navegação limpa no Dashboard**: O Dashboard funciona como ponto de entrada e roteador rápido para os Workspaces, com indicadores destacados para Bugs em Aberto/Análise e Registros de Alta/Urgente.
* **Terminologia de Conhecimento**: Nomenclatura padronizada para artigos e vídeos de Conhecimento (substituindo siglas legadas).
* **Baixa complexidade de manutenção**: Código enxuto, operando no mesmo código-fonte em desenvolvimento e produção.

---

## 2. Arquitetura de Ambientes

O SIP opera com dois ambientes totalmente isolados:

| Característica | Ambiente de Desenvolvimento (`development`) | Ambiente de Produção (`production`) |
| :--- | :--- | :--- |
| **Finalidade** | Vibe Coding, testes, novas features | Execução real no servidor da empresa |
| **Hospedagem DB** | Supabase Cloud (Cloud-hosted) | Supabase Local no Proxmox VE |
| **Dados** | Homologação / Dados de teste | Dados reais e confidenciais |
| **Alteração DB** | Migrations criadas em `/supabase/migrations` | Migrations aplicadas via CLI / script |

> **REGRA DE OURO**: O banco de dados de Produção NUNCA deve ser utilizado diretamente durante o desenvolvimento. Toda alteração de estrutura é entregue como uma migration reproduzível.

---

## 3. Estrutura de Workspaces e Módulos Principais

| Entidade | Módulo / Workspace | Descrição |
| :--- | :--- | :--- |
| **Cliente** | `/clientes` | Cadastro de empresas, contatos, CNPJ/CPF e histórico |
| **Atendimento** | `/atendimentos` | Chamados, suporte técnico, acompanhamento e resoluções |
| **Registro** | `/registros` | Bugs, melhorias, oportunidades e ideias de produtos |
| **Conhecimento** | `/base_conhecimento` | Guias de suporte, artigos técnicos e vídeo-aulas |
| **Equipamento** | `/modulos` | Inventário de equipamentos, número de série e alocação |
| **Relatórios** | `/relatorios` | Visão gerencial, Causa Raiz, Matriz e **Daily Report** |

---

## 4. Configuração de Variáveis de Ambiente

As configurações do sistema são carregadas **dinamicamente** do arquivo de variáveis de ambiente.

### Arquivo `.env.example`:
```env
# Define o ambiente ativo: 'development' ou 'production'
APP_ENV="development"
VITE_APP_ENV="development"

# Credenciais do Supabase (Carregadas automaticamente conforme o ambiente)
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
```

---

## 5. Guia de Instalação e Hospedagem no Proxmox

Este guia detalha a preparação de um container LXC ou Máquina Virtual no Proxmox VE rodando Ubuntu 22.04 LTS / 24.04 LTS.

### Passo 1: Preparar o Container LXC ou VM no Proxmox
1. No Proxmox VE, crie um Container LXC com **Ubuntu 22.04 LTS** (Mínimo recomendado: 2 vCPUs, 2GB RAM, 20GB Disco).
2. Habilite **Docker** no Container LXC (se usar LXC, marque a opção `nesting=1` e `keyctl=1` em *Options -> Features*).

### Passo 2: Instalar Docker e Supabase Local
Acesse o terminal do seu servidor Proxmox (LXC/VM):

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git docker.io docker-compose-plugin nginx

# Habilitar serviços
sudo systemctl enable --now docker nginx

# Clonar o repositório oficial do Supabase Docker
git clone --depth 1 https://github.com/supabase/supabase /opt/supabase
cd /opt/supabase/docker

# Copiar arquivo de exemplo de ambiente do Supabase
cp .env.example .env

# Gerar chaves e iniciar a pilha de containers do Supabase Local
docker compose up -d
```

O Supabase Local estará disponível na porta `54321` (API/Gateway) e porta `54323` (Dashboard Studio).

---

## 6. Fluxo de Deploy Automatizado via Git

Você fará o deploy no Proxmox através de um repositório Git bare no servidor com um hook de `post-receive`.

### Passo 1: Configurar Repositório Git no Servidor Proxmox
No servidor Proxmox:

```bash
# 1. Criar pasta da aplicação e pasta do repositório bare
sudo mkdir -p /var/www/sip
sudo mkdir -p /var/repo/sip.git

# 2. Inicializar repositório Git Bare
cd /var/repo/sip.git
sudo git init --bare

# 3. Criar o Hook de Deploy (`post-receive`)
sudo nano /var/repo/sip.git/hooks/post-receive
```

Adicione o seguinte conteúdo no script `/var/repo/sip.git/hooks/post-receive`:

```bash
#!/bin/bash
TARGET="/var/www/sip"
GIT_DIR="/var/repo/sip.git"

echo "=== [SIP DEPLOY] Recebendo nova versão via Git ==="
git --work-tree=$TARGET --git-dir=$GIT_DIR checkout -f main

cd $TARGET

echo "=== [SIP DEPLOY] Instalando dependências ==="
npm install --production=false

echo "=== [SIP DEPLOY] Aplicando Migrations no Supabase Local ==="
npx supabase db push --local || true

echo "=== [SIP DEPLOY] Compilando aplicação ==="
APP_ENV=production VITE_APP_ENV=production npm run build

echo "=== [SIP DEPLOY] Reiniciando serviço da aplicação ==="
pm2 restart sip || pm2 start "npm run preview -- --port 3000 --host 0.0.0.0" --name "sip"

echo "=== [SIP DEPLOY] Deploy concluído com sucesso! ==="
```

Defina permissão de execução no hook:
```bash
sudo chmod +x /var/repo/sip.git/hooks/post-receive
```

### Passo 2: Adicionar o Remote no seu Computador de Desenvolvimento
No seu ambiente local/Vibe Coding:

```bash
git remote add proxmox usuario@IP_DO_PROXMOX:/var/repo/sip.git
```

Para publicar alterações em Produção:
```bash
git push proxmox main
```

---

## 7. Gerenciamento do Banco de Dados e Migrations

Toda alteração de banco de dados deve ser salva na pasta `supabase/migrations/`.

### Adicionar uma Nova Migration:
1. Crie um novo arquivo de migração na pasta `/supabase/migrations/` (exemplo: `20260801000000_adiciona_campo_prioridade.sql`).
2. Adicione os comandos SQL DDL (`CREATE TABLE`, `ALTER TABLE`, `CREATE INDEX`).
3. Ao realizar o `git push proxmox main`, o script de deploy aplicará a migração no Supabase Local automaticamente.

---

## 8. Relatório Daily Report e Gestão de Atividades

O **Daily Report** é um relatório executivo integrado ao sistema projetado para fornecer um resumo imediato e organizado de todas as atividades ocorridas em um dia específico (padrão automático: dia anterior).

### Principais Características:
* **Filtro de Data Interativo**: Alternadores rápidos ("Ontem", "Hoje") e seletor de data customizado.
* **Resumo Consolidado (KPIs)**: Contagem total de atividades, atendimentos, registros/bugs e artigos/vídeos de conhecimento publicados.
* **Linha do Tempo Completa**: Lista organizada cronologicamente de todas as ações e registros do dia.
* **Painel Drawer de Detalhes**: Ao clicar em qualquer evento da linha do tempo, um Painel Lateral (Right Drawer) exibe todas as informações e dados brutos do evento.
* **Botão "Abrir no Workspace"**: Redireciona instantaneamente o operador para o workspace específico daquele registro para edição ou aprofundamento.

---

## 9. Procedimentos de Manutenção, Backup e Suporte

### Realizar Backup do Banco de Dados em Produção (Proxmox):
```bash
# Executar backup do banco PostgreSQL do Supabase Local
docker exec -t supabase-db pg_dumpall -U postgres > /var/backups/sip_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Backup:
```bash
cat /var/backups/sip_backup_ARQUIVO.sql | docker exec -i supabase-db psql -U postgres
```

### Verificação de Logs do Sistema no Proxmox:
* **Logs da aplicação Web**: `pm2 logs sip`
* **Logs do Banco de Dados**: `docker logs supabase-db --tail 100`
* **Logs do Nginx**: `sudo tail -f /var/log/nginx/error.log`

---

*Documentação mantida e atualizada automaticamente a cada ciclo do SIP / SIGI.*

