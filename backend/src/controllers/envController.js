import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { envReloader } from '../config/envReloader.js';
import { resetSupabaseClient } from '../services/supabaseClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../config/logger.js';

/**
 * 检查后端环境变量配置状态
 */
export const checkEnvStatus = asyncHandler(async (req, res) => {
  const requiredVars = {
    SUPABASE_URL: env.supabaseUrl,
    SUPABASE_ANON_KEY: env.supabaseAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: env.supabaseServiceRoleKey,
    LLM_API_URL: env.llmApiUrl,
    LLM_API_KEY: env.llmApiKey,
    IFLYTEK_APP_ID: env.iflytekAppId,
    IFLYTEK_API_KEY: env.iflytekApiKey,
    IFLYTEK_API_SECRET: env.iflytekApiSecret,
    AMAP_WEB_SERVICE_KEY: env.amapWebServiceKey
  };

  const missing = [];
  const configured = [];

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value.trim() === '') {
      missing.push(key);
    } else {
      configured.push(key);
    }
  }

  res.json({
    isComplete: missing.length === 0,
    configured,
    missing,
    summary: {
      total: Object.keys(requiredVars).length,
      configured: configured.length,
      missing: missing.length
    }
  });
});

/**
 * 上传并保存环境变量配置
 */
export const uploadEnvConfig = asyncHandler(async (req, res) => {
  const { frontendEnv, backendEnv } = req.body;

  if (!frontendEnv || !backendEnv) {
    return res.status(400).json({
      success: false,
      error: '前端和后端环境变量配置都是必需的'
    });
  }

  const results = {
    frontend: { success: false, path: '', error: null },
    backend: { success: false, path: '', error: null }
  };

  // 保存前端 .env 文件
  try {
    const frontendEnvPath = path.resolve(process.cwd(), '../frontend/.env');
    await fs.promises.writeFile(frontendEnvPath, frontendEnv, 'utf-8');
    results.frontend = {
      success: true,
      path: frontendEnvPath,
      error: null
    };
  } catch (error) {
    results.frontend = {
      success: false,
      path: '',
      error: error.message
    };
  }

  // 保存后端 .env 文件
  try {
    const backendEnvPath = path.resolve(process.cwd(), '.env');
    await fs.promises.writeFile(backendEnvPath, backendEnv, 'utf-8');
    results.backend = {
      success: true,
      path: backendEnvPath,
      error: null
    };
  } catch (error) {
    results.backend = {
      success: false,
      path: '',
      error: error.message
    };
  }

  const allSuccess = results.frontend.success && results.backend.success;

  // 如果后端配置保存成功，热重载环境变量并重新初始化服务
  let reloadResult = null;
  if (results.backend.success) {
    logger.info('📝 配置文件已保存，开始热重载...');
    
    // 1. 热重载环境变量
    reloadResult = envReloader.reload('.env');
    
    if (reloadResult.success) {
      logger.info('✅ 环境变量已热重载');
      
      // 2. 重新初始化 Supabase 客户端
      try {
        resetSupabaseClient();
        logger.info('✅ Supabase 客户端已重新初始化');
      } catch (error) {
        logger.warn('⚠️ Supabase 客户端重新初始化失败:', error.message);
      }
      
      logger.info('🎉 热重载完成，配置已生效！');
    } else {
      logger.warn('⚠️ 环境变量热重载失败:', reloadResult.error);
    }
  }

  res.json({
    success: allSuccess,
    results,
    reloaded: reloadResult?.success ?? false,
    changes: reloadResult?.changes,
    message: allSuccess
      ? (reloadResult?.success 
          ? '✅ 配置已保存并立即生效！后端已自动加载新配置，前端将自动刷新。'
          : '配置已保存，建议刷新页面以使配置完全生效')
      : '部分环境变量配置保存失败，请检查错误信息'
  });
});

/**
 * 验证环境变量内容的格式
 */
export const validateEnvContent = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({
      success: false,
      error: '环境变量内容不能为空'
    });
  }

  // 解析环境变量
  const envVars = parseEnvContent(content);

  // 分类为前端和后端
  const categorized = categorizeEnvVars(envVars);

  // 验证前端变量
  const frontendValidation = validateFrontendVars(categorized.frontend);
  
  // 验证后端变量
  const backendValidation = validateBackendVars(categorized.backend);

  res.json({
    success: true,
    frontend: {
      vars: categorized.frontend,
      validation: frontendValidation
    },
    backend: {
      vars: categorized.backend,
      validation: backendValidation
    },
    unknown: categorized.unknown
  });
});

// 辅助函数：解析环境变量内容
function parseEnvContent(content) {
  const lines = content.split('\n');
  const envVars = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      const cleanValue = value.replace(/^["']|["']$/g, '').trim();
      envVars[key] = cleanValue;
    }
  }
  
  return envVars;
}

// 辅助函数：分类环境变量
function categorizeEnvVars(envVars) {
  const frontend = {};
  const backend = {};
  const unknown = {};

  const backendKeys = [
    'NODE_ENV', 'PORT', 'FRONTEND_ORIGIN',
    'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
    'LLM_API_URL', 'LLM_API_KEY', 'LLM_MODEL',
    'IFLYTEK_APP_ID', 'IFLYTEK_API_KEY', 'IFLYTEK_API_SECRET',
    'AMAP_WEB_SERVICE_KEY', 'STORAGE_BUCKET', 'TMP_DIR'
  ];

  for (const [key, value] of Object.entries(envVars)) {
    if (key.startsWith('VITE_')) {
      frontend[key] = value;
    } else if (backendKeys.includes(key)) {
      backend[key] = value;
    } else {
      unknown[key] = value;
    }
  }

  return { frontend, backend, unknown };
}

// 辅助函数：验证前端变量
function validateFrontendVars(vars) {
  const required = [
    'VITE_API_BASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_REDIRECT_TO',
    'VITE_AMAP_JS_KEY',
    'VITE_AMAP_JS_SECURITY_CODE',
    'VITE_SPEECH_MODE'
  ];

  const missing = required.filter(key => !vars[key] || vars[key].trim() === '');
  const present = required.filter(key => vars[key] && vars[key].trim() !== '');

  return {
    isComplete: missing.length === 0,
    missing,
    present,
    total: required.length
  };
}

// 辅助函数：验证后端变量
function validateBackendVars(vars) {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'LLM_API_URL',
    'LLM_API_KEY',
    'IFLYTEK_APP_ID',
    'IFLYTEK_API_KEY',
    'IFLYTEK_API_SECRET',
    'AMAP_WEB_SERVICE_KEY'
  ];

  const missing = required.filter(key => !vars[key] || vars[key].trim() === '');
  const present = required.filter(key => vars[key] && vars[key].trim() !== '');

  return {
    isComplete: missing.length === 0,
    missing,
    present,
    total: required.length
  };
}
