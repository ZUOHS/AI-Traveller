import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value.trim() === '') {
    return defaultValue;
  }
  const normalized = value.trim().toLowerCase();
  return ['true', '1', 'yes', 'y', 'on'].includes(normalized);
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: number(process.env.PORT, 8080),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? '',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  llmApiUrl: process.env.LLM_API_URL ?? '',
  llmApiKey: process.env.LLM_API_KEY ?? '',
  llmModel: process.env.LLM_MODEL ?? 'gpt-4o-mini',
  iflytekAppId: process.env.IFLYTEK_APP_ID ?? '',
  iflytekApiKey: process.env.IFLYTEK_API_KEY ?? '',
  iflytekApiSecret: process.env.IFLYTEK_API_SECRET ?? '',
  amapWebServiceKey: process.env.AMAP_WEB_SERVICE_KEY ?? '',
  storageBucket: process.env.STORAGE_BUCKET ?? 'voice-memos',
  tmpDir: process.env.TMP_DIR ?? 'tmp',
  testAccountUseSupabase: toBoolean(process.env.TEST_ACCOUNT_USE_SUPABASE, true)
};

export const isProduction = env.nodeEnv === 'production';
