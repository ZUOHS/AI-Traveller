/**
 * 环境变量验证工具
 * 检查前端应用所需的所有环境变量是否完整且有效
 */

// 定义所有必需的前端环境变量
export const REQUIRED_ENV_VARS = {
  VITE_API_BASE_URL: {
    name: 'API服务地址',
    example: 'http://localhost:8080/api',
    validator: (value) => value && value.startsWith('http'),
    errorMsg: 'API地址必须以http或https开头'
  },
  VITE_SUPABASE_URL: {
    name: 'Supabase项目地址',
    example: 'https://xxxxx.supabase.co',
    validator: (value) => value && value.includes('supabase.co'),
    errorMsg: 'Supabase地址格式不正确'
  },
  VITE_SUPABASE_ANON_KEY: {
    name: 'Supabase匿名密钥',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    validator: (value) => value && value.length > 50,
    errorMsg: 'Supabase密钥格式不正确'
  },
  VITE_SUPABASE_REDIRECT_TO: {
    name: 'Supabase重定向地址',
    example: 'http://localhost:5173',
    validator: (value) => value && value.startsWith('http'),
    errorMsg: '重定向地址必须以http或https开头'
  },
  VITE_AMAP_JS_KEY: {
    name: '高德地图JS API Key',
    example: 'your_amap_key_here',
    validator: (value) => value && value.length > 10,
    errorMsg: '高德地图Key格式不正确'
  },
  VITE_AMAP_JS_SECURITY_CODE: {
    name: '高德地图安全密钥',
    example: 'your_amap_security_code',
    validator: (value) => value && value.length > 10,
    errorMsg: '高德地图安全密钥格式不正确'
  },
  VITE_SPEECH_MODE: {
    name: '语音识别模式',
    example: 'browser',
    validator: (value) => ['browser', 'iflytek', 'disabled'].includes(value),
    errorMsg: '语音模式必须是 browser、iflytek 或 disabled'
  }
};

/**
 * 验证单个环境变量
 */
export function validateEnvVar(key, value) {
  const config = REQUIRED_ENV_VARS[key];
  if (!config) {
    return { valid: false, error: '未知的环境变量' };
  }

  if (!value || value.trim() === '') {
    return { valid: false, error: '值不能为空' };
  }

  if (config.validator && !config.validator(value)) {
    return { valid: false, error: config.errorMsg };
  }

  return { valid: true };
}

/**
 * 检查所有前端环境变量
 */
export function checkFrontendEnv() {
  const missing = [];
  const invalid = [];
  const valid = [];
  const runtimeEnv = typeof window !== 'undefined' ? window.__APP_CONFIG__ ?? {} : {};
  const metaEnv = typeof import.meta !== 'undefined' ? import.meta.env ?? {} : {};

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = runtimeEnv[key] ?? metaEnv[key];
    
    if (!value || value.trim() === '') {
      missing.push({ key, ...config });
    } else {
      const validation = validateEnvVar(key, value);
      if (validation.valid) {
        valid.push({ key, value, ...config });
      } else {
        invalid.push({ key, value, error: validation.error, ...config });
      }
    }
  }

  const isComplete = missing.length === 0 && invalid.length === 0;

  return {
    isComplete,
    missing,
    invalid,
    valid,
    summary: {
      total: Object.keys(REQUIRED_ENV_VARS).length,
      valid: valid.length,
      missing: missing.length,
      invalid: invalid.length
    }
  };
}

/**
 * 从文本内容中解析环境变量
 */
export function parseEnvContent(content) {
  const lines = content.split('\n');
  const envVars = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 跳过注释和空行
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // 解析 KEY=VALUE 格式
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      // 移除可能的引号
      const cleanValue = value.replace(/^["']|["']$/g, '').trim();
      envVars[key] = cleanValue;
    }
  }
  
  return envVars;
}

/**
 * 将环境变量分类为前端和后端
 */
export function categorizeEnvVars(envVars) {
  const frontend = {};
  const backend = {};
  const unknown = {};

  for (const [key, value] of Object.entries(envVars)) {
    if (key.startsWith('VITE_')) {
      frontend[key] = value;
    } else if (BACKEND_ENV_VARS.hasOwnProperty(key)) {
      backend[key] = value;
    } else {
      unknown[key] = value;
    }
  }

  return { frontend, backend, unknown };
}

/**
 * 生成前端 .env 文件内容
 */
export function generateFrontendEnvContent(envVars) {
  const lines = [
    '# 前端环境变量配置',
    '# 由系统自动生成',
    ''
  ];

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    lines.push(`# ${config.name}`);
    const value = envVars[key] || config.example || '';
    lines.push(`${key}=${value}`);
    lines.push('');
  }

  return lines.join('\n');
}

// 后端环境变量定义（用于分类识别）
export const BACKEND_ENV_VARS = {
  NODE_ENV: { name: 'Node环境', example: 'development' },
  PORT: { name: '服务端口', example: '8080' },
  FRONTEND_ORIGIN: { name: '前端地址', example: 'http://localhost:5173' },
  SUPABASE_URL: { name: 'Supabase项目地址', example: 'https://xxxxx.supabase.co' },
  SUPABASE_ANON_KEY: { name: 'Supabase匿名密钥', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
  SUPABASE_SERVICE_ROLE_KEY: { name: 'Supabase服务密钥', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
  LLM_API_URL: { name: 'LLM API地址', example: 'https://api.deepseek.com/v1' },
  LLM_API_KEY: { name: 'LLM API密钥', example: 'sk-xxxxx' },
  LLM_MODEL: { name: 'LLM模型', example: 'deepseek-chat' },
  IFLYTEK_APP_ID: { name: '讯飞应用ID', example: 'xxxxx' },
  IFLYTEK_API_KEY: { name: '讯飞API Key', example: 'xxxxx' },
  IFLYTEK_API_SECRET: { name: '讯飞API Secret', example: 'xxxxx' },
  AMAP_WEB_SERVICE_KEY: { name: '高德地图服务端Key', example: 'xxxxx' },
  STORAGE_BUCKET: { name: '存储桶名称', example: 'voice-memos' },
  TMP_DIR: { name: '临时目录', example: 'tmp' }
};

/**
 * 生成后端 .env 文件内容
 */
export function generateBackendEnvContent(envVars) {
  const lines = [
    '# 后端环境变量配置',
    '# 由系统自动生成',
    ''
  ];

  for (const [key, config] of Object.entries(BACKEND_ENV_VARS)) {
    lines.push(`# ${config.name}`);
    const value = envVars[key] || config.example || '';
    lines.push(`${key}=${value}`);
    lines.push('');
  }

  return lines.join('\n');
}
