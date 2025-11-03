/**
 * 服务热重载管理器
 * 当环境变量更新时，重新初始化需要新配置的服务
 */

let supabaseClientInstance = null;
let servicesInitialized = false;

/**
 * 重新初始化所有依赖环境变量的服务
 */
export async function reinitializeServices() {
  console.log('🔄 重新初始化服务...');
  
  try {
    // 清除 Supabase 客户端缓存
    supabaseClientInstance = null;
    
    // 重新导入 supabaseClient 模块
    // 注意：由于 ES6 模块缓存，我们需要确保 supabaseClient 使用最新的环境变量
    const supabaseModule = await import('../services/supabaseClient.js');
    if (supabaseModule.resetSupabaseClient) {
      supabaseModule.resetSupabaseClient();
    }
    
    servicesInitialized = true;
    console.log('✅ 服务重新初始化完成');
    
    return { success: true };
  } catch (error) {
    console.error('❌ 服务重新初始化失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 检查服务是否已初始化
 */
export function areServicesInitialized() {
  return servicesInitialized;
}
