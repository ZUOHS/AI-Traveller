import crypto from 'node:crypto';

import {
  createBadRequest,
  createConflict,
  createUnauthorized,
  createServerError
} from '../utils/apiError.js';
import { env } from '../config/env.js';
import {
  supabase,
  supabaseAdmin,
  useMockStore,
  memoryStore
} from './supabaseClient.js';

const sanitize = (value) => value?.trim() ?? '';
const OTP_EXPIRY_MS = 10 * 60 * 1000;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const toKey = (email) => email.toLowerCase();

const ensureProfileExists = async (userId, email, preferredUsername) => {
  if (!supabaseAdmin) {
    return preferredUsername ?? '';
  }

  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, username')
    .eq('id', userId)
    .maybeSingle();

  if (existingProfile?.username) {
    return existingProfile.username;
  }

  let baseUsername =
    preferredUsername ||
    email.split('@')[0] ||
    `traveller_${Math.random().toString(36).slice(2, 8)}`;
  baseUsername = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!baseUsername) {
    baseUsername = `traveller_${Math.random().toString(36).slice(2, 8)}`;
  }

  let candidate = baseUsername;
  for (let attempt = 0; attempt < Number.MAX_SAFE_INTEGER; attempt += 1) {
    const { data: existingUsername } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', candidate)
      .maybeSingle();
    if (!existingUsername) {
      break;
    }
    candidate = `${baseUsername}_${attempt + 1}`;
  }

  const { error } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    username: candidate,
    email
  });

  if (error) {
    throw createServerError('创建用户资料失败', error.message);
  }

  return candidate;
};

const getProfileByEmail = async (email) => {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, username, email')
    .eq('email', email)
    .maybeSingle();
  return data;
};

const getProfileByUsername = async (username) => {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, email, username')
    .eq('username', username)
    .maybeSingle();
  return data;
};

export const getUserFromToken = async (accessToken) => {
  if (!accessToken) {
    return null;
  }

  if (!useMockStore && supabase) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) {
      return null;
    }
    let username = data.user.user_metadata?.username ?? '';
    if (supabaseAdmin) {
      const profile = await getProfileByEmail(data.user.email);
      if (profile?.username) {
        username = profile.username;
      }
    }
    return {
      id: data.user.id,
      email: data.user.email,
      username,
      metadata: data.user.user_metadata ?? {}
    };
  }

  const fallback = memoryStore.users.get(accessToken);
  return fallback ?? null;
};

export const requireUser = async (req) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const user = await getUserFromToken(token || req.cookies?.sb_access_token);

  if (!user) {
    throw createUnauthorized();
  }

  req.accessToken = token;
  return user;
};

export const sendOtp = async ({ email, username }) => {
	let cleanedEmail = sanitize(email).toLowerCase();
	const cleanedUsernameInput = sanitize(username);

	if (!cleanedEmail && cleanedUsernameInput) {
		if (!useMockStore && supabaseAdmin) {
			const profileByUsername = await getProfileByUsername(cleanedUsernameInput);
			if (!profileByUsername?.email) {
				throw createBadRequest('未找到该用户名对应的邮箱');
			}
			cleanedEmail = sanitize(profileByUsername.email).toLowerCase();
		} else {
			const existingUser = Array.from(memoryStore.users.values()).find(
				(user) => user.username === cleanedUsernameInput
			);
			if (!existingUser?.email) {
				throw createBadRequest('未找到该用户名对应的邮箱');
			}
			cleanedEmail = sanitize(existingUser.email).toLowerCase();
		}
	}

	if (!cleanedEmail) {
		throw createBadRequest('邮箱或用户名不能为空');
	}

	if (!useMockStore && supabase && supabaseAdmin) {
		const existingProfile = await getProfileByEmail(cleanedEmail);

		let mode = 'login';
		let cleanedUsername = cleanedUsernameInput;

		if (!existingProfile) {
			mode = 'signup';
			if (!cleanedUsername) {
				throw createBadRequest('首次注册需要填写用户名');
			}
			const usernameConflict = await getProfileByUsername(cleanedUsername);
			if (usernameConflict) {
				throw createConflict('该用户名已被占用');
			}
		}

		const { error } = await supabase.auth.signInWithOtp({
			email: cleanedEmail,
			options: {
				shouldCreateUser: mode === 'signup',
				emailRedirectTo: env.frontendOrigin || 'http://localhost:5173',
				data: mode === 'signup' ? { username: cleanedUsername } : undefined
			}
		});

		if (error) {
			const detail = error.message ?? '';
			const match = detail.match(/(\d+)\s*seconds?/i);
			const friendly = match
				? `发送过于频繁，请在 ${match[1]} 秒后重试。`
				: `发送验证码失败，${detail || '请稍后再试。'}`;
			throw createBadRequest(friendly, detail || undefined);
		}

		return {
			mode,
			message: '验证码已发送，请查收邮箱。',
			email: cleanedEmail
		};
	}

	// Mock fallback
	const code = generateOtp();
	const cleanedUsername = cleanedUsernameInput || cleanedEmail.split('@')[0];
	memoryStore.pendingOtps.set(toKey(cleanedEmail), {
		code,
		expiresAt: Date.now() + OTP_EXPIRY_MS,
		username: cleanedUsername
	});

	return {
		mode: 'mock',
		message: `模拟模式验证码：${code}`,
		email: cleanedEmail
	};
};

export const verifyOtp = async ({ email, token }) => {
  const cleanedEmail = sanitize(email).toLowerCase();
  const cleanedToken = sanitize(token);

  if (!cleanedEmail || !cleanedToken) {
    throw createBadRequest('邮箱和验证码均为必填项');
  }

  if (!useMockStore && supabase && supabaseAdmin) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanedEmail,
      token: cleanedToken,
      type: 'email'
    });

    if (error || !data?.session?.access_token || !data.user) {
      throw createUnauthorized('验证码无效或已过期');
    }

    const username = await ensureProfileExists(
      data.user.id,
      cleanedEmail,
      data.user.user_metadata?.username
    );

    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: cleanedEmail,
        username
      }
    };
  }

  const otpEntry = memoryStore.pendingOtps.get(toKey(cleanedEmail));
  if (!otpEntry || otpEntry.code !== cleanedToken) {
    throw createUnauthorized('验证码无效或已过期');
  }

  if (otpEntry.expiresAt < Date.now()) {
    memoryStore.pendingOtps.delete(toKey(cleanedEmail));
    throw createUnauthorized('验证码已过期，请重新获取');
  }

  memoryStore.pendingOtps.delete(toKey(cleanedEmail));

  const existingUser = Array.from(memoryStore.users.values()).find(
    (user) => user.email === cleanedEmail
  );

  const user =
    existingUser ??
    (() => {
      const newUser = {
        id: crypto.randomUUID(),
        email: cleanedEmail,
        username: otpEntry.username
      };
      memoryStore.users.set(newUser.id, newUser);
      return newUser;
    })();

  const tokenValue = `${user.id}:${user.email}`;
  memoryStore.users.set(tokenValue, user);

  return {
    token: tokenValue,
    user
  };
};

