export const TEST_ACCOUNT = Object.freeze({
	id: '00000000-0000-4000-8000-000000000001',
	username: 'test',
	displayUsername: 'Test',
	email: 'test@example.com',
	otp: '123456',
	token: 'test-access-token'
});

const normalize = (value) => value?.trim().toLowerCase() ?? '';

export const isTestAccountId = (maybeId) => maybeId === TEST_ACCOUNT.id;

export const isTestAccountEmail = (maybeEmail) =>
	normalize(maybeEmail) === TEST_ACCOUNT.email;

export const isTestAccountUsername = (maybeUsername) =>
	normalize(maybeUsername) === TEST_ACCOUNT.username;

export const isTestAccountToken = (maybeToken) =>
	maybeToken === TEST_ACCOUNT.token;

