export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  supabaseRedirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_TO ?? '',
  amapJsKey: import.meta.env.VITE_AMAP_JS_KEY ?? '',
  amapJsSecurityCode: import.meta.env.VITE_AMAP_JS_SECURITY_CODE ?? '',
  speechMode: import.meta.env.VITE_SPEECH_MODE ?? 'browser'
};

export const isSupabaseEnabled =
  Boolean(appConfig.supabaseUrl) && Boolean(appConfig.supabaseAnonKey);
