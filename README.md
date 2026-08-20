# SIGI — Sistema Integrado de Gestão e Inteligência

O **SIGI** é uma plataforma centralizada para gestão de clientes, atendimento técnico, bugs/registros, base de conhecimento e inventário de equipamentos.

## 🚀 Arquitetura e Filosofia Workspace-First

* **Ambientes Separados**:
  * **Desenvolvimento (`development`)**: Supabase Cloud com dados de homologação.
  * **Produção (`production`)**: Supabase Local hospedado no servidor Proxmox VE.
* **Toda Entidade possui seu Workspace**: Clientes, Atendimentos, Registros, Artigos e Equipamentos.
* **Dashboard Como Ponto de Entrada**: Timeline de atividades funciona como atalho rápido para cada Workspace.

## 📚 Documentação Completa do Sistema

Consulte o arquivo **[DOCUMENTATION.md](./DOCUMENTATION.md)** para o guia completo contendo:

1. Arquitetura de Ambientes e Variáveis de Ambiente (`.env.example`).
2. Guia de Instalação e Configuração no Proxmox VE (LXC/VM e Supabase Local em Docker).
3. Configuração de Deploy Automatizado via Git (`post-receive` hook).
4. Gerenciamento de Banco de Dados com Migrations Reproduzíveis (`supabase/migrations/`).
5. Scripts de Backup (`pg_dump`), Restore e Manutenção de Servidor.

## ⚙️ Variáveis de Ambiente

Crie o arquivo `.env` baseado no `.env.example`:

```env
APP_ENV="development" # ou "production"
VITE_APP_ENV="development"

VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
```

## 🛠️ Comandos Principais

```bash
# Executar em desenvolvimento
npm run dev

# Validar código e tipos
npm run lint

# Compilar para produção
npm run build
```
