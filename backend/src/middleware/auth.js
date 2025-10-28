import { asyncHandler } from '../utils/asyncHandler.js';
import { requireUser } from '../services/authService.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const user = await requireUser(req);
  req.user = user;
  next();
});
