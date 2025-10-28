export const EXPENSE_CATEGORIES = [
  '交通',
  '住宿',
  '餐饮',
  '门票',
  '购物',
  '其他'
];

export const SUPPORTED_LANGUAGES = ['zh-CN', 'en-US', 'ja-JP'];

export const DEFAULT_CURRENCY = 'CNY';

export const API_ROUTES = {
  TRIPS: '/api/trips',
  BUDGET: (tripId) => `/api/trips/${tripId}/budget`,
  PLAN: (tripId) => `/api/trips/${tripId}/plan`,
  EXPENSES: (tripId) => `/api/trips/${tripId}/expenses`,
  PROFILE: '/api/auth/me',
  SPEECH: '/api/speech/recognize',
  MAP_POIS: '/api/maps/pois'
};
