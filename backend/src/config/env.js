import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['true', '1', 'yes', 'y', 'on'].includes(normalized);
  }
  return Boolean(value);
};

/**
 * 创建环境配置对象
 * 使用 Getter 确保每次访问都能获取最新的 process.env 值
 */
function createEnvConfig() {
  return {
    get nodeEnv() { return process.env.NODE_ENV ?? 'development'; },
    get port() { return number(process.env.PORT, 8080); },
    get frontendOrigin() { return process.env.FRONTEND_ORIGIN ?? ''; },
    get supabaseUrl() { return process.env.SUPABASE_URL ?? ''; },
    get supabaseAnonKey() { return process.env.SUPABASE_ANON_KEY ?? ''; },
    get supabaseServiceRoleKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''; },
    get llmApiUrl() { return process.env.LLM_API_URL ?? ''; },
    get llmApiKey() { return process.env.LLM_API_KEY ?? ''; },
    get llmModel() { return process.env.LLM_MODEL ?? 'deepseek-chat'; },
    get iflytekAppId() { return process.env.IFLYTEK_APP_ID ?? ''; },
    get iflytekApiKey() { return process.env.IFLYTEK_API_KEY ?? ''; },
    get iflytekApiSecret() { return process.env.IFLYTEK_API_SECRET ?? ''; },
    get amapWebServiceKey() { return process.env.AMAP_WEB_SERVICE_KEY ?? ''; },
    get storageBucket() { return process.env.STORAGE_BUCKET ?? 'voice-memos'; },
    get tmpDir() { return process.env.TMP_DIR ?? 'tmp'; },
    get testAccountUseSupabase() { return toBoolean(process.env.TEST_ACCOUNT_USE_SUPABASE, true); }
  };
}

// 使用 getter 创建动态环境配置对象
export const env = createEnvConfig();

export const isProduction = env.nodeEnv === 'production';
