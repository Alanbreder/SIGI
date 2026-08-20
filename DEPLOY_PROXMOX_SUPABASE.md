# Guia Completo de Instalação e Deploy: Proxmox VE + Supabase Local + Sistema SIP / SIGI

Este documento descreve o passo a passo completo e detalhado para realizar o provisionamento da Máquina Virtual (VM) no **Proxmox VE**, a instalação do **Supabase Local (Self-Hosted via Docker)** e a implantação e execução em produção do **Sistema SIP / SIGI (Sistema de Inteligência do Cliente)** clonado via Git.

---

## 📋 Sumário
1. [Requisitos Mínimos do Servidor](#1-requisitos-mínimos-do-servidor)
2. [Criação da Máquina Virtual no Proxmox VE](#2-criação-da-máquina-virtual-no-proxmox-ve)
3. [Configuração Inicial do Sistema Operacional (Ubuntu Server 22.04 LTS)](#3-configuração-inicial-do-sistema-operacional-ubuntu-server-2204-lts)
4. [Instalação do Docker, Docker Compose e Git](#4-instalação-do-docker-docker-compose-e-git)
5. [Instalação e Configuração do Supabase Local](#5-instalação-e-configuração-do-supabase-local)
6. [Execução das Migrations SQL no Supabase Local](#6-execução-das-migrations-sql-no-supabase-local)
7. [Clonagem e Implantação da Aplicação SIP / SIGI](#7-clonagem-e-implantação-da-aplicação-sip--sigi)
8. [Configuração do Nginx como Reverse Proxy e Servidor Web](#8-configuração-do-nginx-como-reverse-proxy-e-servidor-web)
9. [Configuração de Compartilhamentos SMB / NAS para Anexos](#9-configuração-de-compartilhamentos-smb--nas-para-anexos)
10. [Procedimentos de Backup e Restauração Automatizada](#10-procedimentos-de-backup-e-restauração-automatizada)

---

## 1. Requisitos Mínimos do Servidor

Para rodar o Supabase Local e o Frontend do SIP com alta performance no Proxmox VE:

* **CPU**: 4 vCPUs (x86_64)
* **Memória RAM**: 8 GB de RAM (Mínimo 4 GB)
* **Disco**: 60 GB SSD / NVMe (Armazenamento do sistema + Postgres + Docker)
* **Rede**: IP Fixo / Estático na LAN corporativa (Exemplo: `192.168.1.200/24`, Gateway: `192.168.1.1`)
* **ISO recomendada**: Ubuntu Server 22.04.4 LTS ou Debian 12 (Bookworm)

---

## 2. Criação da Máquina Virtual no Proxmox VE

1. Acesse o painel web do Proxmox VE (`https://<IP_PROXMOX>:8006`).
2. Clique no botão **Create VM** (no canto superior direito).
3. **Aba General**:
   * **Node**: Selecione seu nó Proxmox.
   * **VM ID**: Exemplo `105`.
   * **Name**: `sigi-production-srv`.
4. **Aba OS**:
   * Selecione a ISO baixada (`ubuntu-22.04.4-live-server-amd64.iso`).
   * **Type**: Linux (Kernel 6.x / 5.x).
5. **Aba System**:
   * **Graphic card**: Default.
   * **Machine**: q35.
   * **BIOS**: OVMF (UEFI) ou SeaBIOS.
   * Marque **Qemu Agent** (Importante para métricas do Proxmox).
6. **Aba Disks**:
   * **Storage**: `local-lvm` ou `ceph`.
   * **Disk size**: `60 GB`.
   * **Cache**: `Write back` ou `Default`.
   * **Discard**: Marcado (TRIM para SSD).
7. **Aba CPU**:
   * **Sockets**: 1.
   * **Cores**: 4.
   * **Type**: `host` (melhor desempenho de instrução).
8. **Aba Memory**:
   * **Memory (MiB)**: `8192` (8 GB).
   * **Ballooning**: Desmarcado ou Mínimo 4096.
9. **Aba Network**:
   * **Bridge**: `vmbr0`.
   * **Model**: VirtIO (paravirtualized).
10. Finalize a criação e inicie a VM.

---

## 3. Configuração Inicial do Sistema Operacional (Ubuntu Server 22.04 LTS)

Após finalizar a instalação do Ubuntu Server pela console do Proxmox:

### 3.1. Configuração de IP Fixo via Netplan
Edite o arquivo de configuração de rede:

```bash
sudo nano /etc/netplan/00-installer-config.yaml
```

Adicione/Ajuste a estrutura (substitua a interface e os IPs pela sua rede):

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0: # ou ens18
      dhcp4: no
      addresses:
        - 192.168.1.200/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses:
          - 1.1.1.1
          - 8.8.8.8
```

Aplique as alterações:
```bash
sudo netplan apply
```

### 3.2. Atualização dos Pacotes do Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git htop unzip ufw ca-certificates gnupg cifs-utils
```

### 3.3. Configuração do Fuso Horário
```bash
sudo timedatectl set-timezone America/Sao_Paulo
```

---

## 4. Instalação do Docker, Docker Compose e Git

O Supabase Local e os serviços de apoio utilizam contêineres Docker.

### 4.1. Instalação Oficial do Docker Engine
```bash
# Adicionar chave GPG do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Adicionar repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine e Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Adicionar usuário atual ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

Verifique a instalação:
```bash
docker --version
docker compose version
```

---

## 5. Instalação e Configuração do Supabase Local

Utilizaremos o repositório oficial de orquestração Docker do Supabase (`supabase/setup`).

### 5.1. Clonando o Repositório de Orquestração
```bash
cd /opt
sudo git clone --depth 1 https://github.com/supabase/supabase /opt/supabase
cd /opt/supabase/docker
```

### 5.2. Configuração do Arquivo de Variáveis de Ambiente (`.env`)
Copie o arquivo de exemplo `.env.example`:
```bash
sudo cp .env.example .env
```

Edite o arquivo `.env`:
```bash
sudo nano .env
```

Configure as seguintes variáveis críticas:
```env
############
# SEGREDO DO BANCO E JWT
############
POSTGRES_PASSWORD=SuaSenhaUltraSeguraDoPostgres2026!
JWT_SECRET=SuaChaveChaveSecretaComNoMinimo32CaracteresAleatorios!!
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Gerada para a API pública)
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Gerada para admin)

############
# URLS DE ACESSO
############
SITE_URL=http://192.168.1.200
API_EXTERNAL_URL=http://192.168.1.200:8000
SUPABASE_PUBLIC_URL=http://192.168.1.200:8000

############
# PORTAS DOS SERVIÇOS
############
POSTGRES_PORT=5432
KONG_HTTP_PORT=8000
STUDIO_PORT=54323
```

### 5.3. Inicializando os Contêineres do Supabase
```bash
sudo docker compose up -d
```

Verifique se todos os contêineres estão em execução (`Up` / `Healthy`):
```bash
sudo docker compose ps
```

Serviços iniciados:
* **Kong API Gateway**: `http://192.168.1.200:8000`
* **Supabase Studio (Dashboard)**: `http://192.168.1.200:54323`
* **PostgreSQL Database**: `192.168.1.200:5432`

---

## 6. Execução das Migrations SQL no Supabase Local

Com o Supabase rodando, aplique a estrutura do banco de dados do SIP.

### 6.1. Acesso ao PostgreSQL Local via Docker
```bash
docker exec -it supabase-db psql -U postgres -d postgres
```

### 6.2. Script SQL de Criação das Tabelas do Sistema
Você pode colar o script de migration das tabelas principais ou executar o arquivo SQL fornecido no repositório:

```bash
docker exec -i supabase-db psql -U postgres -d postgres < /var/www/sigi/supabase/migrations/001_initial_schema.sql
```

A estrutura criará as seguintes tabelas com RLS habilitado:
- `clientes`
- `atendimentos`
- `atendimentos_fixos`
- `registros`
- `artigos_kb`
- `sistemas_modulos`
- `tabelas_sistema`
- `configuracao_smb`

---

## 7. Clonagem e Implantação da Aplicação SIP / SIGI

### 7.1. Clonando o Repositório do Código-Fonte do Projeto
```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/SeuUsuarioOuOrg/sip-sistema-inteligencia.git sigi
cd /var/www/sigi
```

### 7.2. Configurando as Variáveis de Ambiente da Aplicação (`.env`)
Crie o arquivo `.env` para o Frontend conectar no Supabase Local:

```bash
sudo nano /var/www/sigi/.env
```

Conteúdo do arquivo `/var/www/sigi/.env`:
```env
# Conexão com o Supabase Local no Proxmox
VITE_SUPABASE_URL=http://192.168.1.200:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ENV=producao
```

### 7.3. Instalação das Dependências e Compilação
Instale o Node.js v20 (LTS):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Instale os pacotes e realize o build estático para produção:
```bash
cd /var/www/sigi
sudo npm install
sudo npm run build
```

O comando criará a pasta `/var/www/sigi/dist` contendo os arquivos otimizados e prontos para o Nginx.

---

## 8. Configuração do Nginx como Reverse Proxy e Servidor Web

### 8.1. Instalação do Nginx
```bash
sudo apt install -y nginx
```

### 8.2. Criação do VirtualHost do Nginx
Crie um novo arquivo de site:
```bash
sudo nano /etc/nginx/sites-available/sigi.conf
```

Cole a seguinte configuração:

```nginx
server {
    listen 80;
    server_name 192.168.1.200 sigi.empresa.local;

    root /var/www/sigi/dist;
    index index.html;

    # Suporte a rotas do React Router (SPA Fallback)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy reverso para a API do Supabase Local (Kong)
    location /api/supabase/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache estático para performance de assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    error_log  /var/log/nginx/sigi_error.log;
    access_log /var/log/nginx/sigi_access.log;
}
```

### 8.3. Habilitando o Site e Reiniciando o Nginx
```bash
sudo ln -s /etc/nginx/sites-available/sigi.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

Acesse no seu navegador: `http://192.168.1.200`

---

## 9. Configuração de Compartilhamentos SMB / NAS para Anexos

O sistema armazena os caminhos dos arquivos anexos apontando para o servidor de arquivos NAS / SMB via rotas UNC (Ex: `\\PROXMOX-NAS\SIGI-Anexos\atendimentos_fixos`).

Para montar o compartilhamento de rede no Linux da VM para cópias de segurança locais:

```bash
sudo mkdir -p /mnt/nas_sigi
sudo nano /etc/fstab
```

Adicione a seguinte linha ao `/etc/fstab`:
```fstab
//192.168.1.250/SIGI-Anexos /mnt/nas_sigi cifs username=usuario_nas,password=senha_nas,iocharset=utf8,vers=3.0 0 0
```

Monte os diretórios:
```bash
sudo mount -a
```

---

## 10. Procedimentos de Backup e Restauração Automatizada

### 10.1. Backup Automático do Banco PostgreSQL Supabase (Cron Job)
Crie um script de backup em `/usr/local/bin/backup_sigi.sh`:

```bash
sudo nano /usr/local/bin/backup_sigi.sh
```

Conteúdo do script:
```bash
#!/bin/bash
BACKUP_DIR="/mnt/nas_sigi/backups_db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Executa pg_dump dentro do container Postgres do Supabase
docker exec supabase-db pg_dump -U postgres postgres | gzip > $BACKUP_DIR/sigi_db_$TIMESTAMP.sql.gz

# Remove backups com mais de 30 dias
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```

Torne o script executável:
```bash
sudo chmod +x /usr/local/bin/backup_sigi.sh
```

Agende no `crontab` para rodar todos os dias às 02:00 da manhã:
```bash
sudo crontab -e
```
Adicione:
```cron
0 2 * * * /usr/local/bin/backup_sigi.sh
```

### 10.2. Restauração de Backup JSON pelo Painel de ADM
O sistema também permite exportar e importar um arquivo `.json` completo com todos os registros, usuários, tabelas do sistema e configurações SMB na aba **Administração -> Backup & Restauração**.

Ao restaurar o arquivo `.json`:
1. Faça upload do arquivo de backup no painel.
2. O sistema exibirá o **Re-mapeamento de Servidor SMB Host** e o **Ajuste Individual por Sessão** para reconfigurar os caminhos UNC caso o novo servidor Proxmox tenha um novo IP ou compartilhamento.
3. Clique em **Confirmar Restauração**.

---

📌 **Status do Deploy**: Pronto para Execução em Produção no Proxmox VE.
