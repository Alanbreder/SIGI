export type UserRole = 'Administrador' | 'Usuário';

export type ModuleType =
  | 'dashboard'
  | 'clientes'
  | 'atendimentos'
  | 'atendimentos_fixos'
  | 'registros'
  | 'base_conhecimento'
  | 'modulos'
  | 'relatorios'
  | 'monitor_sefaz'
  | 'consulta_fiscal'
  | 'administracao';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  whatsapp?: string;
  funcao?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  funcao: string;
  role: UserRole;
  status: 'Ativo' | 'Inativo';
  avatarInitials: string;
  createdAt?: string;
  password?: string;
}

export type ActivityType =
  | 'atendimento'
  | 'registro'
  | 'cliente'
  | 'artigo'
  | 'inventario';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardStats {
  clientes: number;
  atendimentos: number;
  registros: number;
  baseConhecimento: number;
}

export interface SmbSectorFolder {
  id: string;
  setor: string;
  key: 'videos' | 'artigos' | 'atendimentos' | 'registros' | 'equipamentos' | string;
  caminhoSmb: string;
  descricao?: string;
}

export interface SmbConfig {
  servidorHost: string;
  dominio: string;
  usuarioSmb: string;
  senhaSmb?: string;
  statusConexao: 'Conectado (Rede Local SMB)' | 'Desconectado' | 'Em Validação';
  pastas: SmbSectorFolder[];
  caminhoImagensArtigos?: string;
}

export interface Cliente {
  id: string;
  codigo: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj?: string;
  inscricaoEstadual?: string;
  responsavel: string;
  email?: string;
  telefone?: string;
  cidade: string;
  estado: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  qtdAtendimentos: number;
  ultimoAtendimento?: string;
  status: 'Ativo' | 'Inativo' | string;
  tipoCliente?: string;
  segmento?: string;
  classificacao?: string;
  observacoes?: string;
  sistemasModulos?: SistemaModuloVinculo[];
  quantidadeComputadores?: number;
  tipoInstalacao?: 'Cliente' | 'Servidor' | 'Ambos' | string;
  observacaoSistemas?: string;
  camposEspecificos?: Record<string, string>;
  createdAt?: string;
  logoUrl?: string;
  equipamentos?: EquipamentoItem[];
  dataUltimoStatus?: string;
}

export interface EquipmentCustomFieldDef {
  key: string;
  label: string;
  type?: 'text' | 'password' | 'select' | 'textarea' | 'number' | 'boolean' | 'date' | 'badge';
  options?: string[];
  badgeColors?: Record<string, string>;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

export interface EquipamentoHistoricoManutencaoItem {
  id: string;
  dataHora: string;
  autor: string;
  descricao: string; // qual manutencao realizada
  teveValor: 'Sim' | 'Não';
  valor?: number;
  pagoPor?: 'Infoserra' | 'Cliente';
  empresaResponsavel: string;
  observacoes?: string;
}

export interface EquipamentoItem {
  id: string;
  codigo: string;
  nome: string;
  numeroSerie: string;
  tipo: string;
  status: 'Ativo' | 'Manutenção' | 'Desativado';
  obsManutencao?: string;
  dataInstalacao: string;
  localizacao?: string;
  clienteId?: string;
  clienteNome?: string;
  usuario?: string;
  senha?: string;
  ip?: string;
  mac?: string;
  modelo?: string;
  ssid?: string;
  equipamentoVinculado?: string;
  quemUtiliza?: string;
  tipoFuncao?: string;
  processador?: string;
  memoria?: string;
  armazenamento?: string;
  fonte?: string;
  marcaModelo?: string;
  obsEspecifica?: string;
  so?: string;
  patrimonio?: string;
  observacoes?: string;
  camposEspecificos?: Record<string, string>;
  manutencoes?: EquipamentoHistoricoManutencaoItem[];
  anexos?: AnexoItem[];
}

export interface EquipamentoHistoricoItem {
  id: string;
  dataHora: string;
  autor: string;
  alteracao: string;
  detalhes: string;
}

export interface AnexoItem {
  id: string;
  nome: string;
  tamanho: string;
  tipo: string;
  dataUpload: string;
  autor: string;
  caminhoArmazenamento?: string; // e.g. \\NAS-SERVER\SIGI-Anexos\atendimentos\ATD-9040\log_erro_500.txt
  storageType?: 'SMB / NAS' | 'Local' | 'Cloud';
  previewUrl?: string;
}

export interface SistemaModuloVinculo {
  id?: string;
  sistema: string;
  modulo?: string;
}

export interface AtendimentoItem {
  id: string;
  codigo: string;
  assunto: string;
  descricao?: string;
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'Aberto' | 'Em Andamento' | 'Aguardando Cliente' | 'Resolvido' | 'Concluído' | 'Cancelado';
  dataAbertura: string;
  responsavel: string;
  clienteId?: string;
  clienteNome?: string;
  modulo?: string;
  sistemasModulos?: SistemaModuloVinculo[];
  categoria?: string;
  tags?: string[];
  solucaoAplicada?: string;
  tempoAtendimento?: string;
  anexos?: AnexoItem[];
  clientePoderiaExecutar?: 'Sim' | 'Não';
  motivoProcedimento?: string;
  motivoOutroDescricao?: string;
  necessitouApoioInterno?: 'Sim' | 'Não';
  motivoApoioInterno?: string;
  origemApoio?: string;
  origemApoioOutroDescricao?: string;
  tipoApoio?: string;
  tipoApoioOutroDescricao?: string;
  registrosVinculados?: RegistroItem[];
  artigosVinculados?: ArtigoKBItem[];
  dadosDinamicos?: Record<string, any>;
  camposEspecificos?: Record<string, string>;
}

export type SystemTableKey =
  | 'sistemas'
  | 'modulos'
  | 'statusCliente'
  | 'segmentosCliente'
  | 'classificacoesCliente'
  | 'categoriasAtendimento'
  | 'motivosAtendimento'
  | 'statusAtendimento'
  | 'prioridadesAtendimento'
  | 'tiposManutencaoFixa'
  | 'statusAtendimentoFixo'
  | 'tiposRegistro'
  | 'prioridadesRegistro'
  | 'statusRegistro'
  | 'tiposEquipamento'
  | 'marcasEquipamento'
  | 'statusEquipamento'
  | 'localizacoesEquipamento'
  | 'tiposBaseConhecimento'
  | 'statusBaseConhecimento'
  | 'categoriasVideo'
  | 'niveisVideo'
  | 'statusVideo'
  | 'setoresApoio'
  | 'tiposApoio'
  | 'origensCusto'
  | 'tiposInstalacao'
  | 'impactosRegistro';

export interface SystemTableItem {
  id: string;
  nome: string;
  descricao?: string;
  status: 'Ativo' | 'Inativo';
  sistemaId?: string;
  sistemaNome?: string;
  codigo?: string;
  icon?: string;
  color?: string;
  camposDinamicos?: EquipmentCustomFieldDef[];
  createdAt?: string;
  updatedAt?: string;
}

export type SystemTablesData = Record<string, SystemTableItem[]>;

export interface SystemOptionsConfig {
  origensApoio: string[];
  tiposApoio: string[];
  motivosProcedimento: string[];
  modulosAtendimento: string[];
  categoriasAtendimento: string[];
  statusAtendimento?: string[];
  prioridadesAtendimento?: string[];
}

export interface RegistroTimelineItem {
  id: string;
  tipo: 'criacao' | 'status' | 'atendimento' | 'artigo' | 'analise' | 'comentario' | 'edicao';
  titulo: string;
  descricao?: string;
  autor: string;
  data: string;
}

export interface RegistroItem {
  id: string;
  codigo: string;
  tipo: 'Bug' | 'Melhoria' | 'Ideia' | 'Solicitação de Feature' | string;
  titulo: string;
  descricao?: string;
  modulo?: string;
  sistema?: string;
  impacto?: 'Baixo' | 'Médio' | 'Alto' | string;
  status: 'Em Análise' | 'Em Desenvolvimento' | 'Concluído' | 'Reparado' | 'Não Aprovado' | 'Aberto' | 'Aprovado' | 'Rejeitado' | string;
  prioridade?: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  reportadoPor?: 'Cliente' | 'Infoserra' | string;
  solicitanteTipo?: 'Cliente' | 'Infoserra' | string;
  data: string;
  ultimaAtualizacao?: string;
  autor: string;
  tags?: string[];
  clienteId?: string;
  clienteNome?: string;
  analiseTecnica?: string;
  dataEmDesenvolvimento?: string;
  atendimentosVinculados?: AtendimentoItem[];
  artigosVinculados?: ArtigoKBItem[];
  anexos?: AnexoItem[];
  timelineEvents?: RegistroTimelineItem[];
  dadosDinamicos?: Record<string, any>;
  camposEspecificos?: Record<string, string>;
}

export interface ArtigoTimelineItem {
  id: string;
  tipo: 'criacao' | 'edicao' | 'status' | 'atendimento' | 'registro' | 'equipamento' | 'comentario';
  titulo: string;
  descricao?: string;
  autor: string;
  data: string;
}

export interface ArtigoKBItem {
  id: string;
  codigo: string;
  titulo: string;
  categoria: string;
  tipoArtigo?: 'Procedimento' | 'Configuração' | 'Solução' | 'Documentação' | 'Informação do Cliente' | 'Vídeo Aula' | 'Rede' | 'Servidor' | string;
  modulo?: string;
  videoUrl?: string;
  nivel?: 'Básico' | 'Intermediário' | 'Avançado' | string;
  tipoConteudo?: 'artigo' | 'video' | string;
  sistemaPertencente?: 'Sistema Sacoleiro' | 'Sistema ERP' | 'Emissão de NFe' | 'PDV & Caixa' | 'SIGI Geral' | string;
  conteudo?: string;
  tags: string[];
  status: 'Publicado' | 'Rascunho' | 'Arquivado';
  dataCriacao: string;
  ultimaAtualizacao?: string;
  autor: string;
  clienteId?: string;
  clienteNome?: string;
  visualizacoes?: number;
  atendimentosVinculados?: AtendimentoItem[];
  registrosVinculados?: RegistroItem[];
  equipamentosVinculados?: EquipamentoItem[];
  clientesVinculados?: Cliente[];
  anexos?: AnexoItem[];
  timelineEvents?: ArtigoTimelineItem[];
}

export interface ClientTimelineItem {
  id: string;
  type: 'atendimento' | 'registro' | 'artigo' | 'inventario' | 'cadastro';
  titulo: string;
  descricao: string;
  dataHora: string;
  autor: string;
  relatedCode?: string;
  data?: any;
}

export type ClienteFilterStatus = 'todos' | 'ativos' | 'inativos';

export interface ModuloTimelineItem {
  id: string;
  tipo: 'criacao' | 'edicao' | 'status' | 'atendimento' | 'registro' | 'artigo' | 'comentario';
  titulo: string;
  descricao?: string;
  autor: string;
  data: string;
}

export interface ModuloItem {
  id: string;
  codigo: string;
  nome: string;
  sistemaId: string;
  sistemaNome: string;
  descricao?: string;
  status: 'Ativo' | 'Inativo';
  qtdAtendimentos?: number;
  qtdRegistros?: number;
  qtdArtigos?: number;
  atendimentosVinculados?: AtendimentoItem[];
  registrosVinculados?: RegistroItem[];
  artigosVinculados?: ArtigoKBItem[];
  timelineEvents?: ModuloTimelineItem[];
  dataCriacao?: string;
  ultimaAtualizacao?: string;
}

export interface SistemaItem {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  status: 'Ativo' | 'Inativo';
  modulos: ModuloItem[];
}

export interface EquipamentoManutencaoItem {
  id: string;
  nome: string;
  tipo:
    | 'Comprado pela IS (cobrado na próxima mensalidade)'
    | 'Comprado pelo cliente'
    | 'Reaproveitamento do cliente'
    | 'Trocado'
    | 'Comprado'
    | 'Instalado'
    | 'Removido'
    | string;
  quantidade: number;
  valorUnitario?: number;
  origemCusto?: string; // Pago pelo cliente, Infoserra (gera valor a receber), Sucata do cliente
  numeroSerie?: string;
  observacoes?: string;
  cobrarNaMensalidade?: boolean;
}

export interface AtendimentoFixoTimelineItem {
  id: string;
  tipo: 'criacao' | 'anotacao' | 'equipamento' | 'status' | 'anexo' | 'conhecimento';
  titulo: string;
  descricao?: string;
  autor: string;
  data: string;
}

export interface AtendimentoFixoItem {
  id: string;
  codigo: string;
  clienteId?: string;
  clienteNome: string;
  unidade?: string;
  responsavelTecnico: string;
  dataManutencao: string;
  proximaManutencao?: string;
  status: 'Concluído' | 'Aguardando' | 'Em Andamento' | 'Agendado' | 'Pendente';
  periodoManutencao?: string;
  anotacoes: string;
  equipamentos?: EquipamentoManutencaoItem[];
  artigosVinculados?: ArtigoKBItem[];
  anexos?: AnexoItem[];
  timelineEvents?: AtendimentoFixoTimelineItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SigiBackupData {
  version: string;
  systemName: string;
  timestamp: string;
  systemTables?: SystemTablesData;
  users?: UserAccount[];
  clients?: Cliente[];
  atendimentos?: AtendimentoItem[];
  atendimentosFixos?: AtendimentoFixoItem[];
  registros?: RegistroItem[];
  artigos?: ArtigoKBItem[];
  sistemas?: SistemaItem[];
  smbConfig?: SmbConfig;
  systemOptions?: SystemOptionsConfig;
  customization?: SystemCustomization;
}

export interface SystemCustomization {
  nomeSistema: string;
  subtituloSistema: string;
  logoType: 'text' | 'image';
  logoImageUrl?: string;
  logoBgColor?: string;
  logoText?: string;
  corBase: 'indigo' | 'emerald' | 'sky' | 'violet' | 'rose' | 'amber' | 'slate' | 'custom';
  customHexColor?: string;
  fundoEstilo: 'default' | 'soft-tint' | 'warm-cream' | 'cool-zinc' | 'dark-pure' | 'custom';
  fundoCustomHex?: string;
  topbarEstilo: 'default' | 'dark-navy' | 'primary-gradient' | 'clean-white' | 'custom';
  topbarCustomHex?: string;
  sidebarEstilo: 'default' | 'dark-navy' | 'primary-accent' | 'clean-white' | 'custom';
  sidebarCustomHex?: string;
  rodapeTexto?: string;
  suporteContato?: string;
  diasAlertaMonitoramento?: number;
}

export const defaultCustomization: SystemCustomization = {
  nomeSistema: 'SIGI',
  subtituloSistema: 'Sistema Integrado de Gestão e Inteligência',
  logoType: 'text',
  logoImageUrl: '',
  logoBgColor: 'bg-indigo-600',
  logoText: 'SIGI',
  corBase: 'indigo',
  customHexColor: '#4f46e5',
  fundoEstilo: 'default',
  fundoCustomHex: '#f8fafc',
  topbarEstilo: 'default',
  topbarCustomHex: '#ffffff',
  sidebarEstilo: 'default',
  sidebarCustomHex: '#ffffff',
  rodapeTexto: 'SIGI © 2026 - Todos os direitos reservados',
  suporteContato: 'Suporte Técnico: (22) 99999-8888 | suporte@empresa.com.br',
  diasAlertaMonitoramento: 20
};

