import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getUserFromToken,
  sendOtp,
  verifyOtp
} from '../services/authService.js';
import { createUnauthorized } from '../utils/apiError.js';

export const getProfileController = asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({ data: user });
});

export const exchangeTokenController = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  const user = await getUserFromToken(accessToken);
  if (!user) {
    throw createUnauthorized();
  }
  res.json({ data: user });
});

export const sendOtpController = asyncHandler(async (req, res) => {
  const { email, username } = req.body ?? {};
  const result = await sendOtp({ email, username });
  res.status(200).json({ data: result });
});

export const verifyOtpController = asyncHandler(async (req, res) => {
  const { email, token } = req.body ?? {};
  const result = await verifyOtp({ email, token });
  res.status(200).json({ data: result });
});
