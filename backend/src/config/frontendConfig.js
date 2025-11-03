import { env } from './env.js';

const sanitize = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value);
};

/**
 * 构建前端运行时需要的环境配置
 * 优先使用 VITE_ 前缀的变量，其次回退到后端已有的配置
 */
export function getFrontendRuntimeConfig() {
  return {
    VITE_API_BASE_URL:
      sanitize(process.env.VITE_API_BASE_URL) || '/api',
    VITE_SUPABASE_URL:
      sanitize(process.env.VITE_SUPABASE_URL) || sanitize(env.supabaseUrl),
    VITE_SUPABASE_ANON_KEY:
      sanitize(process.env.VITE_SUPABASE_ANON_KEY) || sanitize(env.supabaseAnonKey),
    VITE_SUPABASE_REDIRECT_TO:
      sanitize(process.env.VITE_SUPABASE_REDIRECT_TO) || sanitize(process.env.FRONTEND_ORIGIN),
    VITE_AMAP_JS_KEY:
      sanitize(process.env.VITE_AMAP_JS_KEY),
    VITE_AMAP_JS_SECURITY_CODE:
      sanitize(process.env.VITE_AMAP_JS_SECURITY_CODE),
    VITE_SPEECH_MODE:
      sanitize(process.env.VITE_SPEECH_MODE) || 'browser'
  };
}

/**
 * 生成 runtime-config.js 文件内容
 */
export function buildFrontendRuntimeScript() {
  const config = getFrontendRuntimeConfig();
  const json = JSON.stringify(config).replace(/</g, '\\u003c');
  return `window.__APP_CONFIG__ = ${json};`;
}
