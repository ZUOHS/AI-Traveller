import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from './logger.js';

/**
 * 环境变量热重载管理器
 * 支持在运行时重新加载环境变量，无需重启服务
 */
class EnvReloader {
  constructor() {
    this.envCache = { ...process.env };
  }

  /**
   * 重新加载环境变量
   * @param {string} envPath - .env 文件路径
   * @returns {Object} 重载结果
   */
  reload(envPath = '.env') {
    try {
      const fullPath = path.resolve(process.cwd(), envPath);
      
      // 检查文件是否存在
      if (!fs.existsSync(fullPath)) {
        return {
          success: false,
          error: `.env 文件不存在: ${fullPath}`
        };
      }

      // 读取并解析 .env 文件
      const envConfig = dotenv.parse(fs.readFileSync(fullPath, 'utf-8'));
      
      // 记录变更
      const changes = {
        added: [],
        updated: [],
        removed: []
      };

      // 更新 process.env
      for (const [key, value] of Object.entries(envConfig)) {
        if (!(key in this.envCache)) {
          changes.added.push(key);
        } else if (this.envCache[key] !== value) {
          changes.updated.push(key);
        }
        process.env[key] = value;
        this.envCache[key] = value;
      }

      logger.info('环境变量已热重载', {
        added: changes.added.length,
        updated: changes.updated.length,
        file: fullPath
      });

      return {
        success: true,
        changes,
        message: '环境变量已成功重载'
      };
    } catch (error) {
      logger.error('环境变量热重载失败', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取当前环境变量快照
   */
  getSnapshot() {
    return { ...this.envCache };
  }

  /**
   * 重置到初始状态
   */
  reset() {
    this.envCache = { ...process.env };
  }
}

// 导出单例
export const envReloader = new EnvReloader();

/**
 * 重新构建 env 对象
 * 从 process.env 重新读取所有配置
 */
export function rebuildEnvConfig() {
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

  return {
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
}
