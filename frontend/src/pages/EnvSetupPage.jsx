import { useState, useEffect } from 'react';
import {
  parseEnvContent,
  categorizeEnvVars,
  generateFrontendEnvContent,
  generateBackendEnvContent,
  REQUIRED_ENV_VARS,
  BACKEND_ENV_VARS
} from '../utils/envValidator';

export default function EnvSetupPage({ onComplete }) {
  const [envContent, setEnvContent] = useState('');
  const [parsedEnv, setParsedEnv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('paste'); // 'paste' or 'file'
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(true);

  // 检查后端是否可用
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/env/status', { 
          method: 'GET',
          signal: AbortSignal.timeout(3000) // 3秒超时
        });
        setBackendAvailable(response.ok);
        if (!response.ok) {
          setError('后端服务响应异常，请检查后端是否正常启动');
        }
      } catch (err) {
        setBackendAvailable(false);
        setError('⚠️ 无法连接到后端服务。请先启动后端服务：\n\n1. 打开新终端\n2. cd backend\n3. npm start\n\n后端启动后，此页面会自动刷新。');
      } finally {
        setCheckingBackend(false);
      }
    };
    checkBackend();
  }, []);

  // 处理文件上传
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setEnvContent(content);
        handleParseContent(content);
      }
    };
    reader.readAsText(file);
  };

  // 解析环境变量内容
  const handleParseContent = (content) => {
    try {
      const envVars = parseEnvContent(content);
      const categorized = categorizeEnvVars(envVars);
      
      // 验证前端变量
      const frontendMissing = Object.keys(REQUIRED_ENV_VARS).filter(
        key => !categorized.frontend[key]
      );
      
      // 验证后端变量
      const backendMissing = Object.keys(BACKEND_ENV_VARS).filter(
        key => !categorized.backend[key]
      );

      setParsedEnv({
        ...categorized,
        frontendMissing,
        backendMissing
      });
      setError(null);
    } catch (err) {
      setError('解析环境变量失败：' + err.message);
    }
  };

  // 提交配置
  const handleSubmit = async () => {
    if (!parsedEnv) {
      setError('请先输入或上传环境变量配置');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 生成前端和后端的 .env 文件内容
      const frontendEnv = generateFrontendEnvContent(parsedEnv.frontend);
      const backendEnv = generateBackendEnvContent(parsedEnv.backend);

      // 调用后端 API 保存配置
      const response = await fetch('/api/env/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          frontendEnv,
          backendEnv
        })
      });

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`服务器错误 (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        // 显示友好的成功提示
        const message = result.reloaded
          ? '✅ 配置已保存并立即生效！\n\n后端已自动加载新配置，无需重启。\n页面将自动刷新以应用前端配置。'
          : '✅ 配置已保存！\n\n页面将刷新以应用新配置。';
        
        alert(message);
        
        // 刷新页面以应用前端环境变量
        window.location.reload();
      } else {
        setError('保存配置失败：' + (result.message || '未知错误'));
      }
    } catch (err) {
      // 改进错误信息
      if (err.message.includes('Failed to fetch') || err.message.includes('ECONNREFUSED')) {
        setError('无法连接到后端服务。请确保后端服务已启动（端口 8080）');
      } else {
        setError('保存配置失败：' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">环境配置向导</h1>
          <p className="text-blue-100">
            检测到缺少必要的环境变量配置，请上传或粘贴您的 .env 文件内容
          </p>
          {/* 后端状态指示 */}
          {checkingBackend ? (
            <div className="mt-3 text-sm text-blue-200 flex items-center">
              <span className="animate-pulse mr-2">●</span>
              正在检查后端连接...
            </div>
          ) : backendAvailable ? (
            <div className="mt-3 text-sm text-green-200 flex items-center">
              <span className="mr-2">✓</span>
              后端服务已连接
            </div>
          ) : (
            <div className="mt-3 text-sm text-yellow-200 flex items-center">
              <span className="mr-2">⚠</span>
              后端服务未连接 - 请先启动后端服务
            </div>
          )}
        </div>

        <div className="p-8">
          {/* 上传方式选择 */}
          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setUploadMethod('paste')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  uploadMethod === 'paste'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📝 粘贴内容
              </button>
              <button
                onClick={() => setUploadMethod('file')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  uploadMethod === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📁 上传文件
              </button>
            </div>

            {uploadMethod === 'paste' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  粘贴 .env 文件内容
                </label>
                <textarea
                  value={envContent}
                  onChange={(e) => {
                    setEnvContent(e.target.value);
                    if (e.target.value.trim()) {
                      handleParseContent(e.target.value);
                    }
                  }}
                  placeholder="VITE_API_BASE_URL=http://localhost:8080/api&#10;VITE_SUPABASE_URL=https://xxxxx.supabase.co&#10;..."
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上传 .env 文件
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="w-full flex flex-col items-center px-4 py-8 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-sm text-gray-600">
                      点击选择文件或拖拽到这里
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      支持 .env 或 .txt 文件
                    </p>
                    <input
                      type="file"
                      accept=".env,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-red-600 mr-2">⚠️</span>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* 解析结果 */}
          {parsedEnv && (
            <div className="mb-6 space-y-4">
              {/* 前端配置 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <span className="mr-2">🎨</span>
                  前端配置
                </h3>
                <div className="text-sm space-y-1">
                  <p className="text-blue-700">
                    已识别：{Object.keys(parsedEnv.frontend).length} 个变量
                  </p>
                  {parsedEnv.frontendMissing.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 font-medium">
                        ⚠️ 缺少以下变量：
                      </p>
                      <ul className="list-disc list-inside text-yellow-700 mt-1">
                        {parsedEnv.frontendMissing.map((key) => (
                          <li key={key}>
                            {key} - {REQUIRED_ENV_VARS[key]?.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 后端配置 */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                  <span className="mr-2">⚙️</span>
                  后端配置
                </h3>
                <div className="text-sm space-y-1">
                  <p className="text-green-700">
                    已识别：{Object.keys(parsedEnv.backend).length} 个变量
                  </p>
                  {parsedEnv.backendMissing.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 font-medium">
                        ⚠️ 缺少以下变量：
                      </p>
                      <ul className="list-disc list-inside text-yellow-700 mt-1">
                        {parsedEnv.backendMissing.map((key) => (
                          <li key={key}>
                            {key} - {BACKEND_ENV_VARS[key]?.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 未知变量 */}
              {Object.keys(parsedEnv.unknown).length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">❓</span>
                    未识别的变量
                  </h3>
                  <p className="text-sm text-gray-600">
                    {Object.keys(parsedEnv.unknown).length} 个变量将被忽略
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading || !parsedEnv || !backendAvailable}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              title={!backendAvailable ? '请先启动后端服务' : ''}
            >
              {loading ? '保存中...' : !backendAvailable ? '等待后端连接...' : '💾 保存配置（无需重启）'}
            </button>
            {parsedEnv && (
              <button
                onClick={() => {
                  setEnvContent('');
                  setParsedEnv(null);
                  setError(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                重置
              </button>
            )}
          </div>

          {/* 帮助信息 */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <span className="mr-2">✨</span>
              使用说明
            </h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>您可以复制整个 .env 文件的内容并粘贴，系统会自动识别前端和后端配置</li>
              <li>也可以分别粘贴前端和后端的配置，系统会自动合并</li>
              <li>支持直接上传 .env 文件</li>
              <li className="font-semibold text-green-700">
                🚀 配置保存后立即生效，无需重启任何服务！
              </li>
              <li className="text-xs text-gray-500 ml-4">
                （后端使用热重载技术，前端自动刷新页面）
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
