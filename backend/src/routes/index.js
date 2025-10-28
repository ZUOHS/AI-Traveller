import express from 'express';
import multer from 'multer';

import { authenticate } from '../middleware/auth.js';
import {
  getTripsController,
  createTripController,
  getTripController,
  updateTripController,
  deleteTripController,
  generatePlanController,
  getItineraryController,
  generateBudgetController,
  getBudgetController,
  extractTripDetailsController
} from '../controllers/tripController.js';
import {
  listExpensesController,
  createExpenseController,
  updateExpenseController,
  deleteExpenseController,
  analyzeExpenseController
} from '../controllers/expenseController.js';
import {
  recognizeSpeechController
} from '../controllers/speechController.js';
import {
  searchPoisController,
  reverseGeocodeController
} from '../controllers/mapController.js';
import {
  getProfileController,
  exchangeTokenController,
  sendOtpController,
  verifyOtpController
} from '../controllers/authController.js';

const upload = multer({ storage: multer.memoryStorage() });

export const router = express.Router();

router.post('/auth/otp/send', sendOtpController);
router.post('/auth/otp/verify', verifyOtpController);
router.post('/auth/token', exchangeTokenController);

router.use(authenticate);

router.get('/auth/me', getProfileController);
router.post('/trips/analyze', extractTripDetailsController);

router
  .route('/trips')
  .get(getTripsController)
  .post(createTripController);

router
  .route('/trips/:tripId')
  .get(getTripController)
  .put(updateTripController)
  .delete(deleteTripController);

router
  .route('/trips/:tripId/plan')
  .post(generatePlanController)
  .get(getItineraryController);

router
  .route('/trips/:tripId/budget')
  .post(generateBudgetController)
  .get(getBudgetController);

router
  .route('/trips/:tripId/expenses')
  .get(listExpensesController)
  .post(createExpenseController);

router.post('/trips/:tripId/expenses/analyze', analyzeExpenseController);

router
  .route('/trips/:tripId/expenses/:expenseId')
  .put(updateExpenseController)
  .delete(deleteExpenseController);

router.post(
  '/speech/recognize',
  upload.single('audio'),
  recognizeSpeechController
);

router.get('/maps/pois', searchPoisController);
router.get('/maps/reverse', reverseGeocodeController);
