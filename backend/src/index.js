import fs from 'node:fs';
import path from 'node:path';

import app from './app.js';
import { env, isProduction } from './config/env.js';
import { logger } from './config/logger.js';
import { checkEnvironmentOnStartup } from './config/envValidator.js';

// 在启动前检查环境变量配置（允许配置模式启动）
const envValidation = checkEnvironmentOnStartup();

// 如果配置不完整，显示配置模式提示
if (!envValidation.isValid) {
  logger.info('🔧 服务器已启动但处于配置模式');
  logger.info('📝 请访问前端页面完成环境配置');
}

const ensureTmpDir = () => {
  const dir = path.resolve(env.tmpDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureTmpDir();

const server = app.listen(env.port, () => {
  logger.info(`API server listening on port ${env.port}`, {
    environment: env.nodeEnv
  });
});

process.on('SIGINT', () => {
  logger.info('Graceful shutdown requested (SIGINT)');
  server.close(() => {
    logger.info('Server closed. Bye!');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Graceful shutdown requested (SIGTERM)');
  server.close(() => {
    logger.info('Server closed. Bye!');
    process.exit(0);
  });
});

if (!isProduction) {
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
  });
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error });
    process.exit(1);
  });
}
