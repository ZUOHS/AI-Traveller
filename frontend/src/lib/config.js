const runtimeConfig = typeof window !== 'undefined' ? window.__APP_CONFIG__ ?? {} : {};

const getValue = (key, fallback = '') =>
  runtimeConfig[key] ?? import.meta.env[key] ?? fallback;

export const appConfig = {
  apiBaseUrl: getValue('VITE_API_BASE_URL', ''),
  supabaseUrl: getValue('VITE_SUPABASE_URL', ''),
  supabaseAnonKey: getValue('VITE_SUPABASE_ANON_KEY', ''),
  supabaseRedirectTo: getValue('VITE_SUPABASE_REDIRECT_TO', ''),
  amapJsKey: getValue('VITE_AMAP_JS_KEY', ''),
  amapJsSecurityCode: getValue('VITE_AMAP_JS_SECURITY_CODE', ''),
  speechMode: getValue('VITE_SPEECH_MODE', 'browser')
};

export const isSupabaseEnabled =
  Boolean(appConfig.supabaseUrl) && Boolean(appConfig.supabaseAnonKey);
