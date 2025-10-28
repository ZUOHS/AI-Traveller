import { useState } from 'react';

import { requestOtp, verifyOtp } from '../services/authService.js';
import { useSessionStore } from '../store/useSessionStore.js';

const initialRegisterForm = {
  email: '',
  username: ''
};

export function LoginGate() {
  const setSession = useSessionStore((state) => state.setSession);
  const loading = useSessionStore((state) => state.loading);
  const error = useSessionStore((state) => state.error);

  const [authMode, setAuthMode] = useState('login');

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPending, setLoginPending] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [loginError, setLoginError] = useState('');

  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [registerPending, setRegisterPending] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  const [registerError, setRegisterError] = useState('');

  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpMode, setOtpMode] = useState('');
  const [otpPending, setOtpPending] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSendOtp = async ({ email = '', username = '' }) => {
    setOtpError('');
    setOtpMessage('');

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    if (!trimmedEmail && !trimmedUsername) {
      throw new Error('请输入邮箱或用户名');
    }

    const response = await requestOtp({
      email: trimmedEmail || undefined,
      username: trimmedUsername || undefined
    });

    const resolvedEmail = response.email?.trim() || trimmedEmail;
    if (!resolvedEmail) {
      throw new Error('未找到对应的邮箱，请稍后再试。');
    }

    setOtpEmail(resolvedEmail);
    setOtpMode(response.mode);
    setOtpMessage(response.message);
    setOtpCode('');
    setAuthMode(response.mode === 'signup' ? 'signup' : 'login');
    return response;
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');
    setLoginMessage('');
    try {
      setLoginPending(true);
      const identifier = loginIdentifier.trim();
      const isEmail = identifier.includes('@');
      const response = await handleSendOtp({
        email: isEmail ? identifier : '',
        username: isEmail ? '' : identifier
      });
      setLoginMessage(response.message ?? '验证码已发送，请检查邮箱。');
    } catch (err) {
      setLoginError(
        err.response?.data?.error?.message ??
          err.message ??
          '发送验证码失败，请稍后再试。'
      );
    } finally {
      setLoginPending(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegisterError('');
    setRegisterMessage('');
    try {
      setRegisterPending(true);
      const response = await handleSendOtp(registerForm);
      setRegisterMessage(
        response.message ?? '验证码已发送，请查收并输入 6 位验证码完成注册。'
      );
    } catch (err) {
      setRegisterError(err.response?.data?.error?.message ?? err.message);
    } finally {
      setRegisterPending(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setOtpError('');
    try {
      if (!otpEmail) {
        throw new Error('请先获取验证码');
      }
      if (!otpCode.trim()) {
        throw new Error('请输入验证码');
      }
      setOtpPending(true);
      const result = await verifyOtp({
        email: otpEmail,
        token: otpCode.trim()
      });
      await setSession(result.token);
      setOtpMessage('登录成功，即将跳转。');
      setLoginIdentifier('');
      setRegisterForm(initialRegisterForm);
      setLoginMessage('');
      setRegisterMessage('');
      setLoginError('');
      setRegisterError('');
      setAuthMode('login');
      setOtpEmail('');
      setOtpCode('');
      setOtpMode('');
    } catch (err) {
      setOtpError(err.response?.data?.error?.message ?? err.message);
    } finally {
      setOtpPending(false);
    }
  };

  const isLogin = authMode === 'login';
  const submitPending = isLogin ? loginPending : registerPending;
  const submitMessage = isLogin ? loginMessage : registerMessage;
  const submitError = isLogin ? loginError : registerError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <header className="border-b border-slate-100 pb-6">
          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm font-medium text-slate-600">
              <button
                type="button"
                className={`rounded-full px-4 py-1 transition ${
                  isLogin ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                }`}
                onClick={() => setAuthMode('login')}
              >
                登录
              </button>
              <button
                type="button"
                className={`rounded-full px-4 py-1 transition ${
                  !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                }`}
                onClick={() => setAuthMode('signup')}
              >
                注册
              </button>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-slate-800">
              {isLogin ? '登录账号' : '注册新账号'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isLogin
                ? '输入邮箱或用户名获取 6 位验证码，通过验证即可登录。'
                : '填写邮箱与唯一用户名，我们会发送 6 位验证码，完成验证即可注册并登录。'}
            </p>
          </div>
        </header>

        <form
          className="mt-6 space-y-4"
          onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}
        >
          <label className="block text-sm font-medium text-slate-600">
            {isLogin ? '邮箱/用户名' : '邮箱'}
            <input
              type={isLogin ? 'text' : 'email'}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={isLogin ? loginIdentifier : registerForm.email}
              onChange={(event) =>
                isLogin
                  ? setLoginIdentifier(event.target.value)
                  : setRegisterForm((prev) => ({
                      ...prev,
                      email: event.target.value
                    }))
              }
              placeholder={isLogin ? 'you@example.com 或 unique_name' : 'you@example.com'}
            />
          </label>

          <div className="min-h-[6.5rem]">
            {!isLogin ? (
              <label className="block text-sm font-medium text-slate-600">
                用户名
                <input
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={registerForm.username}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      username: event.target.value
                    }))
                  }
                  placeholder="至少 3 个字符，支持字母和数字"
                />
              </label>
            ) : (
              <div aria-hidden className="h-full" />
            )}
          </div>

          <button
            type="submit"
            disabled={submitPending || (isLogin && loading)}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLogin
              ? submitPending
                ? '发送中...'
                : '获取验证码'
              : submitPending
              ? '处理中...'
              : '注册并发送验证码'}
          </button>

          {submitMessage ? (
            <p className="text-xs text-emerald-600">{submitMessage}</p>
          ) : null}
          {submitError ? <p className="text-xs text-rose-500">{submitError}</p> : null}
          {error ? (
            <p className="text-xs text-rose-500">系统错误：{error.message}</p>
          ) : null}
        </form>

        <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold text-slate-700">验证码</h3>
          <p className="mt-2 text-xs text-slate-500">
            {otpEmail
              ? `验证码已发送至 ${otpEmail}，当前操作为${otpMode === 'signup' ? '注册' : '登录'}。`
              : '请先发送验证码，该输入区域将一直保留在这里。'}
            {otpMessage ? (
              <span className="ml-1 text-emerald-600">{otpMessage}</span>
            ) : null}
          </p>

          <form
            className="mt-4 flex flex-col gap-3 md:flex-row"
            onSubmit={handleVerifyOtp}
          >
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 md:max-w-xs"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
              placeholder="输入 6 位验证码"
              disabled={!otpEmail}
            />
            <button
              type="submit"
              disabled={otpPending || !otpEmail || !otpCode.trim()}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {otpPending ? '验证中...' : '提交验证码'}
            </button>
          </form>
          {otpError ? <p className="mt-2 text-xs text-rose-500">{otpError}</p> : null}
        </div>
      </section>
    </div>
  );
}
