import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retorna o ambiente ativo do aplicativo ('development' | 'production')
export const getAppEnvironment = (): 'development' | 'production' => {
  const env = (import.meta.env.VITE_APP_ENV || import.meta.env.APP_ENV || 'development').toLowerCase();
  return env === 'production' ? 'production' : 'development';
};

// Obtenção dinâmica das credenciais
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    if (!isSupabaseConfigured()) {
      console.warn(
        `[SIGI] Supabase não configurado para o ambiente '${getAppEnvironment()}'. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.`
      );
      // Retorna cliente dummy/placeholder se as variáveis não estiverem setadas
      // para evitar falhas imediatas de compilação/runtime na interface
      supabaseInstance = createClient(
        'https://placeholder.supabase.co',
        'placeholder-anon-key'
      );
    } else {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();
