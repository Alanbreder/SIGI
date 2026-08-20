import { supabase, isSupabaseConfigured, getAppEnvironment } from './supabase';
import {
  Cliente,
  AtendimentoItem,
  AtendimentoFixoItem,
  RegistroItem,
  ArtigoKBItem,
  SistemaItem,
  SystemTablesData
} from '../types';

export interface SupabaseHealthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  needsMigration?: boolean;
  environment: 'development' | 'production';
  supabaseUrl: string;
  errorMessage?: string;
}

// Chaves do localStorage para fallback e cache local
const STORAGE_KEYS = {
  CLIENTS: 'sip_clients',
  ATENDIMENTOS: 'sip_atendimentos',
  ATENDIMENTOS_FIXOS: 'sip_atendimentos_fixos',
  REGISTROS: 'sip_registros',
  ARTIGOS: 'sip_artigos',
  SISTEMAS: 'sip_sistemas',
  SYSTEM_TABLES: 'sip_system_tables'
};

/**
  Verifica se a conexão com o Supabase (Cloud ou Self-Hosted Proxmox) está ativa e operacional.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const env = getAppEnvironment();
  const configured = isSupabaseConfigured();
  const url = import.meta.env.VITE_SUPABASE_URL || 'Não informada';

  if (!configured) {
    return {
      isConfigured: false,
      isConnected: false,
      environment: env,
      supabaseUrl: url,
      errorMessage: 'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram preenchidas no .env'
    };
  }

  try {
    // Tenta uma consulta rápida na tabela sigi_clientes
    const { error } = await supabase.from('sigi_clientes').select('id').limit(1);

    if (error) {
      // PGRST205: Could not find table in schema cache
      // 42P01: relation "sigi_clientes" does not exist
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return {
          isConfigured: true,
          isConnected: true,
          needsMigration: true,
          environment: env,
          supabaseUrl: url,
          errorMessage: 'Conexão estabelecida! As tabelas do SIGI ainda não foram criadas no Supabase. Copie e execute o arquivo de Migration SQL no SQL Editor do Supabase.'
        };
      }

      if (error.code !== 'PGRST116') {
        return {
          isConfigured: true,
          isConnected: false,
          environment: env,
          supabaseUrl: url,
          errorMessage: `Erro de conexão com Supabase: ${error.message} (${error.code})`
        };
      }
    }

    return {
      isConfigured: true,
      isConnected: true,
      needsMigration: false,
      environment: env,
      supabaseUrl: url
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      environment: env,
      supabaseUrl: url,
      errorMessage: err?.message || 'Falha ao conectar no endpoint Supabase'
    };
  }
}

// Helper genérico para ler dados locais do localStorage
function getLocalCache<T>(key: string, defaultData: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Erro ao ler localStorage [${key}]:`, e);
  }
  return defaultData;
}

// Helper genérico para salvar dados locais no localStorage
function setLocalCache<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Erro ao salvar localStorage [${key}]:`, e);
  }
}

// =========================================================
// OPERAÇÕES DE CLIENTES (sigi_clientes)
// =========================================================

export async function fetchClientes(defaultClients: Cliente[]): Promise<Cliente[]> {
  const localData = getLocalCache(STORAGE_KEYS.CLIENTS, defaultClients);

  if (!isSupabaseConfigured()) {
    return localData;
  }

  try {
    const { data, error } = await supabase.from('sigi_clientes').select('*');
    if (error || !data) {
      console.warn('[SIGI Supabase] Não foi possível buscar clientes do Supabase, usando cache local:', error?.message);
      return localData;
    }

    const fetchedClients: Cliente[] = data.map((row) => {
      if (row.data) {
        return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      }
      return {
        id: row.id,
        codigo: row.codigo || row.id,
        razaoSocial: row.razao_social || 'Sem razão social',
        nomeFantasia: row.nome_fantasia,
        cnpj: row.cnpj,
        responsavel: row.responsavel || 'Não informado',
        email: row.email,
        telefone: row.telefone,
        cidade: row.cidade || 'Não informada',
        estado: row.estado || 'UF',
        status: row.status || 'Ativo',
        qtdAtendimentos: 0
      };
    });

    setLocalCache(STORAGE_KEYS.CLIENTS, fetchedClients);
    return fetchedClients;
  } catch (err) {
    console.error('[SIGI Supabase] Exceção ao buscar clientes:', err);
  }

  return localData;
}

export async function saveCliente(cliente: Cliente): Promise<void> {
  // 1. Atualiza no cache local primeiro
  const current = getLocalCache<Cliente>(STORAGE_KEYS.CLIENTS, []);
  const index = current.findIndex((c) => c.id === cliente.id);
  let updatedList: Cliente[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = cliente;
  } else {
    updatedList = [cliente, ...current];
  }
  setLocalCache(STORAGE_KEYS.CLIENTS, updatedList);

  // 2. Tenta persistir no Supabase se configurado
  if (isSupabaseConfigured()) {
    try {
      const payload = {
        id: cliente.id,
        codigo: cliente.codigo,
        razao_social: cliente.razaoSocial,
        nome_fantasia: cliente.nomeFantasia || null,
        cnpj: cliente.cnpj || null,
        responsavel: cliente.responsavel || null,
        email: cliente.email || null,
        telefone: cliente.telefone || null,
        cidade: cliente.cidade || null,
        estado: cliente.estado || null,
        status: cliente.status || 'Ativo',
        data: cliente,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('sigi_clientes').upsert(payload);
      if (error) {
        console.warn('[SIGI Supabase] Erro ao upsert cliente:', error.message);
      }
    } catch (err) {
      console.error('[SIGI Supabase] Exceção ao salvar cliente:', err);
    }
  }
}

export async function deleteCliente(clienteId: string): Promise<void> {
  const current = getLocalCache<Cliente>(STORAGE_KEYS.CLIENTS, []);
  const updatedList = current.filter((c) => c.id !== clienteId);
  setLocalCache(STORAGE_KEYS.CLIENTS, updatedList);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('sigi_clientes').delete().eq('id', clienteId);
    } catch (err) {
      console.error('[SIGI Supabase] Erro ao deletar cliente:', err);
    }
  }
}

// =========================================================
// OPERAÇÕES DE ATENDIMENTOS (sigi_atendimentos)
// =========================================================

export async function fetchAtendimentos(defaultAtendimentos: AtendimentoItem[]): Promise<AtendimentoItem[]> {
  const localData = getLocalCache(STORAGE_KEYS.ATENDIMENTOS, defaultAtendimentos);

  if (!isSupabaseConfigured()) {
    return localData;
  }

  try {
    const { data, error } = await supabase.from('sigi_atendimentos').select('*');
    if (error || !data) {
      console.warn('[SIGI Supabase] Não foi possível buscar atendimentos do Supabase:', error?.message);
      return localData;
    }

    const fetched: AtendimentoItem[] = data.map((row) => {
      if (row.data) {
        return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      }
      return row;
    });

    setLocalCache(STORAGE_KEYS.ATENDIMENTOS, fetched);
    return fetched;
  } catch (err) {
    console.error('[SIGI Supabase] Exceção ao buscar atendimentos:', err);
  }

  return localData;
}

export async function saveAtendimento(atendimento: AtendimentoItem): Promise<void> {
  const current = getLocalCache<AtendimentoItem>(STORAGE_KEYS.ATENDIMENTOS, []);
  const index = current.findIndex((a) => a.id === atendimento.id);
  let updatedList: AtendimentoItem[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = atendimento;
  } else {
    updatedList = [atendimento, ...current];
  }
  setLocalCache(STORAGE_KEYS.ATENDIMENTOS, updatedList);

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        id: atendimento.id,
        codigo: atendimento.codigo,
        assunto: atendimento.assunto,
        status: atendimento.status,
        prioridade: atendimento.prioridade,
        cliente_id: atendimento.clienteId || null,
        cliente_nome: atendimento.clienteNome || null,
        responsavel: atendimento.responsavel,
        modulo: atendimento.modulo || null,
        categoria: atendimento.categoria || null,
        data: atendimento,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('sigi_atendimentos').upsert(payload);
      if (error) {
        console.warn('[SIGI Supabase] Erro ao salvar atendimento no Supabase:', error.message);
      }
    } catch (err) {
      console.error('[SIGI Supabase] Exceção ao salvar atendimento:', err);
    }
  }
}

export async function deleteAtendimento(atendimentoId: string): Promise<void> {
  const current = getLocalCache<AtendimentoItem>(STORAGE_KEYS.ATENDIMENTOS, []);
  const updatedList = current.filter((a) => a.id !== atendimentoId);
  setLocalCache(STORAGE_KEYS.ATENDIMENTOS, updatedList);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('sigi_atendimentos').delete().eq('id', atendimentoId);
    } catch (err) {
      console.error('[SIGI Supabase] Erro ao deletar atendimento:', err);
    }
  }
}

// =========================================================
// OPERAÇÕES DE REGISTROS (sigi_registros)
// =========================================================

export async function fetchRegistros(defaultRegistros: RegistroItem[]): Promise<RegistroItem[]> {
  const localData = getLocalCache(STORAGE_KEYS.REGISTROS, defaultRegistros);

  if (!isSupabaseConfigured()) {
    return localData;
  }

  try {
    const { data, error } = await supabase.from('sigi_registros').select('*');
    if (error || !data) {
      return localData;
    }

    const fetched: RegistroItem[] = data.map((row) => {
      if (row.data) {
        return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      }
      return row;
    });

    setLocalCache(STORAGE_KEYS.REGISTROS, fetched);
    return fetched;
  } catch (err) {
    console.error('[SIGI Supabase] Exceção ao buscar registros:', err);
  }

  return localData;
}

export async function saveRegistro(registro: RegistroItem): Promise<void> {
  const current = getLocalCache<RegistroItem>(STORAGE_KEYS.REGISTROS, []);
  const index = current.findIndex((r) => r.id === registro.id);
  let updatedList: RegistroItem[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = registro;
  } else {
    updatedList = [registro, ...current];
  }
  setLocalCache(STORAGE_KEYS.REGISTROS, updatedList);

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        id: registro.id,
        codigo: registro.codigo,
        tipo: registro.tipo,
        titulo: registro.titulo,
        status: registro.status,
        prioridade: registro.prioridade || null,
        cliente_id: registro.clienteId || null,
        cliente_nome: registro.clienteNome || null,
        data: registro,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('sigi_registros').upsert(payload);
      if (error) {
        console.warn('[SIGI Supabase] Erro ao salvar registro:', error.message);
      }
    } catch (err) {
      console.error('[SIGI Supabase] Exceção ao salvar registro:', err);
    }
  }
}

// =========================================================
// OPERAÇÕES DE ARTIGOS / KB (sigi_artigos)
// =========================================================

export async function fetchArtigos(defaultArtigos: ArtigoKBItem[]): Promise<ArtigoKBItem[]> {
  const localData = getLocalCache(STORAGE_KEYS.ARTIGOS, defaultArtigos);

  if (!isSupabaseConfigured()) {
    return localData;
  }

  try {
    const { data, error } = await supabase.from('sigi_artigos').select('*');
    if (error || !data) {
      return localData;
    }

    const fetched: ArtigoKBItem[] = data.map((row) => {
      if (row.data) {
        return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      }
      return row;
    });

    setLocalCache(STORAGE_KEYS.ARTIGOS, fetched);
    return fetched;
  } catch (err) {
    console.error('[SIGI Supabase] Exceção ao buscar artigos:', err);
  }

  return localData;
}

export async function saveArtigo(artigo: ArtigoKBItem): Promise<void> {
  const current = getLocalCache<ArtigoKBItem>(STORAGE_KEYS.ARTIGOS, []);
  const index = current.findIndex((a) => a.id === artigo.id);
  let updatedList: ArtigoKBItem[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = artigo;
  } else {
    updatedList = [artigo, ...current];
  }
  setLocalCache(STORAGE_KEYS.ARTIGOS, updatedList);

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        id: artigo.id,
        codigo: artigo.codigo,
        titulo: artigo.titulo,
        categoria: artigo.categoria,
        status: artigo.status,
        cliente_id: artigo.clienteId || null,
        cliente_nome: artigo.clienteNome || null,
        data: artigo,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('sigi_artigos').upsert(payload);
      if (error) {
        console.warn('[SIGI Supabase] Erro ao salvar artigo:', error.message);
      }
    } catch (err) {
      console.error('[SIGI Supabase] Exceção ao salvar artigo:', err);
    }
  }
}

export async function deleteArtigo(artigoId: string): Promise<void> {
  const current = getLocalCache<ArtigoKBItem>(STORAGE_KEYS.ARTIGOS, []);
  const updatedList = current.filter((a) => a.id !== artigoId);
  setLocalCache(STORAGE_KEYS.ARTIGOS, updatedList);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('sigi_artigos').delete().eq('id', artigoId);
    } catch (err) {
      console.error('[SIGI Supabase] Erro ao deletar artigo KB:', err);
    }
  }
}

// =========================================================
// OPERAÇÕES DE ATENDIMENTOS FIXOS (sigi_atendimentos_fixos)
// =========================================================

export async function fetchAtendimentosFixos(defaultFixos: AtendimentoFixoItem[]): Promise<AtendimentoFixoItem[]> {
  const localData = getLocalCache(STORAGE_KEYS.ATENDIMENTOS_FIXOS, defaultFixos);

  if (!isSupabaseConfigured()) {
    return localData;
  }

  try {
    const { data, error } = await supabase.from('sigi_atendimentos_fixos').select('*');
    if (error || !data) {
      return localData;
    }

    const fetched: AtendimentoFixoItem[] = data.map((row) => {
      if (row.data) {
        return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      }
      return row;
    });

    setLocalCache(STORAGE_KEYS.ATENDIMENTOS_FIXOS, fetched);
    return fetched;
  } catch (err) {
    console.error('[SIGI Supabase] Exceção ao buscar atendimentos fixos:', err);
  }

  return localData;
}

export async function saveAtendimentoFixo(fixo: AtendimentoFixoItem): Promise<void> {
  const current = getLocalCache<AtendimentoFixoItem>(STORAGE_KEYS.ATENDIMENTOS_FIXOS, []);
  const index = current.findIndex((f) => f.id === fixo.id);
  let updatedList: AtendimentoFixoItem[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = fixo;
  } else {
    updatedList = [fixo, ...current];
  }
  setLocalCache(STORAGE_KEYS.ATENDIMENTOS_FIXOS, updatedList);

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        id: fixo.id,
        codigo: fixo.codigo,
        cliente_id: fixo.clienteId || null,
        cliente_nome: fixo.clienteNome,
        responsavel_tecnico: fixo.responsavelTecnico,
        data_manutencao: fixo.dataManutencao,
        status: fixo.status,
        data: fixo,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('sigi_atendimentos_fixos').upsert(payload);
      if (error) {
        console.warn('[SIGI Supabase] Erro ao salvar atendimento fixo:', error.message);
      }
    } catch (err) {
      console.error('[SIGI Supabase] Exceção ao salvar atendimento fixo:', err);
    }
  }
}

export async function deleteAtendimentoFixo(id: string): Promise<void> {
  const current = getLocalCache<AtendimentoFixoItem>(STORAGE_KEYS.ATENDIMENTOS_FIXOS, []);
  const updatedList = current.filter((f) => f.id !== id);
  setLocalCache(STORAGE_KEYS.ATENDIMENTOS_FIXOS, updatedList);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('sigi_atendimentos_fixos').delete().eq('id', id);
    } catch (err) {
      console.error('[SIGI Supabase] Erro ao deletar atendimento fixo:', err);
    }
  }
}

// =========================================================
// OPERAÇÕES DE SISTEMAS (sigi_sistemas)
// =========================================================

export async function fetchSistemas(defaultSistemas: SistemaItem[]): Promise<SistemaItem[]> {
  const localData = getLocalCache(STORAGE_KEYS.SISTEMAS, defaultSistemas);

  if (!isSupabaseConfigured()) {
    return localData;
  }

  try {
    const { data, error } = await supabase.from('sigi_sistemas').select('*');
    if (error) {
      console.error('[SIGI Supabase] Erro ao buscar sistemas:', error);
      return localData;
    }
    if (!data) {
      return localData;
    }
    console.log('[SIGI Supabase] Sistemas encontrados:', data);

    const fetched: SistemaItem[] = data.map((row) => {
      if (row.data) {
        const parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return {
          ...parsedData,
          id: row.id,
        };
      }
      return {
        id: row.id,
        codigo: row.codigo,
        nome: row.nome,
        status: row.status,
        modulos: []
      };
    });

    setLocalCache(STORAGE_KEYS.SISTEMAS, fetched);
    return fetched;
  } catch (err) {
    console.error('[SIGI Supabase] Exceção ao buscar sistemas:', err);
  }

  return localData;
}

// =========================================================
// OPERAÇÕES DE TABELAS DO SISTEMA (sigi_system_tables)
// =========================================================

export async function fetchSystemTables(defaultTables: SystemTablesData): Promise<SystemTablesData> {
  let localData: Partial<SystemTablesData> = {};
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SYSTEM_TABLES);
    if (saved) {
      localData = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Erro ao ler STORAGE_KEYS.SYSTEM_TABLES:', e);
  }
  const mergedLocal: SystemTablesData = { ...defaultTables, ...localData };
  if (mergedLocal.classificacoesCliente) {
    mergedLocal.classificacoesCliente = mergedLocal.classificacoesCliente.filter(
      (c: any) => c.id !== 'cls-2' && c.nome !== 'VIP / Prioritário'
    );
  }

  if (!isSupabaseConfigured()) {
    try {
      localStorage.setItem(STORAGE_KEYS.SYSTEM_TABLES, JSON.stringify(mergedLocal));
    } catch (e) {
      console.error('Erro ao salvar local STORAGE_KEYS.SYSTEM_TABLES:', e);
    }
    return mergedLocal;
  }

  try {
    const { data, error } = await supabase.from('sigi_system_tables').select('*');
    if (error || !data || data.length === 0) {
      console.warn('[SIGI Supabase] Não foi possível buscar sigi_system_tables, usando local:', error?.message);
      return mergedLocal;
    }

    const result: SystemTablesData = { ...mergedLocal };

    for (const row of data) {
      if (row.key && row.data) {
        if (Array.isArray(row.data)) {
          let list = row.data;
          if (row.key === 'classificacoesCliente') {
            list = list.filter((c: any) => c.id !== 'cls-2' && c.nome !== 'VIP / Prioritário');
          }
          (result as any)[row.key] = list;
        }
      }
    }

    try {
      localStorage.setItem(STORAGE_KEYS.SYSTEM_TABLES, JSON.stringify(result));
    } catch (e) {
      console.error('Erro ao salvar local STORAGE_KEYS.SYSTEM_TABLES:', e);
    }
    return result;
  } catch (err) {
    console.error('[SIGI Supabase] Exceção ao buscar system_tables:', err);
  }

  return mergedLocal;
}

export async function saveSystemTables(tables: SystemTablesData): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_TABLES, JSON.stringify(tables));
  } catch (e) {
    console.error('Erro ao salvar local system_tables:', e);
  }

  if (isSupabaseConfigured()) {
    try {
      const records = Object.entries(tables).map(([key, list]) => ({
        id: `table_${key}`,
        key: key,
        data: list,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('sigi_system_tables').upsert(records);
      if (error) {
        console.warn('[SIGI Supabase] Erro ao salvar sigi_system_tables no Supabase:', error.message);
      }
    } catch (err) {
      console.error('[SIGI Supabase] Exceção ao salvar sigi_system_tables:', err);
    }
  }
}

export async function saveSistema(sistema: SistemaItem): Promise<void> {
  const current = getLocalCache<SistemaItem>(STORAGE_KEYS.SISTEMAS, []);
  const index = current.findIndex((s) => s.id === sistema.id);
  let updatedList: SistemaItem[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = sistema;
  } else {
    updatedList = [sistema, ...current];
  }
  setLocalCache(STORAGE_KEYS.SISTEMAS, updatedList);

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        id: sistema.id,
        codigo: sistema.codigo,
        nome: sistema.nome,
        status: sistema.status,
        data: sistema,
        updated_at: new Date().toISOString()
      };

      await supabase.from('sigi_sistemas').upsert(payload);
    } catch (err) {
      console.error('[SIGI Supabase] Exceção ao salvar sistema:', err);
    }
  }
}

/**
 * Limpa todos os dados transacionais (clientes, atendimentos, registros, artigos)
 * Mantém tabelas do sistema, usuários e configurações.
 */
export async function clearTransactionalData(): Promise<void> {
  // 1. Limpa cache local
  setLocalCache(STORAGE_KEYS.CLIENTS, []);
  setLocalCache(STORAGE_KEYS.ATENDIMENTOS, []);
  setLocalCache(STORAGE_KEYS.ATENDIMENTOS_FIXOS, []);
  setLocalCache(STORAGE_KEYS.REGISTROS, []);
  setLocalCache(STORAGE_KEYS.ARTIGOS, []);

  // Limpa também chaves de equipamentos e atividades no localStorage
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('sip_equipamentos_') || key.startsWith('sip_atendimento_') || key.startsWith('sip_registro_'))) {
      localStorage.removeItem(key);
    }
  }

  // 2. Limpa Supabase se configurado
  if (isSupabaseConfigured()) {
    try {
      const tables = [
        'sigi_clientes',
        'sigi_atendimentos',
        'sigi_atendimentos_fixos',
        'sigi_registros',
        'sigi_artigos'
      ];

      for (const table of tables) {
        // Deleta todos os registros da tabela usando uma condição sempre verdadeira
        const { error } = await (supabase.from(table) as any).delete().gte('created_at', '1970-01-01');
        if (error) {
          // Fallback se created_at não existir
          await (supabase.from(table) as any).delete().not('id', 'is', null);
        }
      }
    } catch (err) {
      console.error('[SIGI Supabase] Exceção ao limpar dados transacionais:', err);
    }
  }
}
