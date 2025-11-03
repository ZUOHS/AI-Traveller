import { env } from './env.js';
import { logger } from './logger.js';

/**
 * 验证环境变量配置
 * 如果缺少必需的环境变量，返回错误信息
 */
export function validateEnvironment() {
  const errors = [];
  const warnings = [];

  // 必需的环境变量
  const requiredVars = [
    { key: 'SUPABASE_URL', value: env.supabaseUrl, name: 'Supabase项目地址' },
    { key: 'SUPABASE_ANON_KEY', value: env.supabaseAnonKey, name: 'Supabase匿名密钥' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: env.supabaseServiceRoleKey, name: 'Supabase服务密钥' }
  ];

  // 可选但推荐的环境变量
  const recommendedVars = [
    { key: 'LLM_API_URL', value: env.llmApiUrl, name: 'LLM API地址', feature: 'AI行程规划' },
    { key: 'LLM_API_KEY', value: env.llmApiKey, name: 'LLM API密钥', feature: 'AI行程规划' },
    { key: 'IFLYTEK_APP_ID', value: env.iflytekAppId, name: '讯飞应用ID', feature: '语音识别' },
    { key: 'IFLYTEK_API_KEY', value: env.iflytekApiKey, name: '讯飞API Key', feature: '语音识别' },
    { key: 'IFLYTEK_API_SECRET', value: env.iflytekApiSecret, name: '讯飞API Secret', feature: '语音识别' },
    { key: 'AMAP_WEB_SERVICE_KEY', value: env.amapWebServiceKey, name: '高德地图服务端Key', feature: '地图服务' }
  ];

  // 检查必需的环境变量
  for (const varInfo of requiredVars) {
    if (!varInfo.value || varInfo.value.trim() === '') {
      errors.push({
        key: varInfo.key,
        name: varInfo.name,
        message: `缺少必需的环境变量 ${varInfo.key} (${varInfo.name})`
      });
    }
  }

  // 检查推荐的环境变量
  for (const varInfo of recommendedVars) {
    if (!varInfo.value || varInfo.value.trim() === '') {
      warnings.push({
        key: varInfo.key,
        name: varInfo.name,
        feature: varInfo.feature,
        message: `缺少环境变量 ${varInfo.key} (${varInfo.name})，${varInfo.feature}功能将不可用`
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasWarnings: warnings.length > 0
  };
}

/**
 * 在应用启动时检查环境变量
 * 记录缺失的配置，但允许启动
 */
export function checkEnvironmentOnStartup() {
  const validation = validateEnvironment();

  // 如果有错误，显示警告但允许启动
  if (!validation.isValid) {
    logger.warn('⚠️  环境变量配置不完整');
    logger.warn('缺少以下必需的环境变量：');
    validation.errors.forEach((error) => {
      logger.warn(`  - ${error.key}: ${error.name}`);
    });
    logger.warn('');
    logger.warn('请通过以下方式提供环境变量：');
    logger.warn('  1. 创建 .env 文件');
    logger.warn('  2. 使用命令行参数: KEY=value npm start');
    logger.warn('  3. 使用 Docker 环境变量: -e KEY=value');
    logger.warn('');
  } else if (validation.hasWarnings) {
    // 如果只有警告，记录日志
    logger.warn('⚠️  环境变量配置不完整，部分功能可能不可用：');
    validation.warnings.forEach((warning) => {
      logger.warn(`  - ${warning.key}: ${warning.name} (影响功能: ${warning.feature})`);
    });
    logger.warn('');
  } else {
    logger.info('✅ 环境变量配置完整');
  }

  return validation;
}
