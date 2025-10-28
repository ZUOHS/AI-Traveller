import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listTrips,
  createTrip,
  getTrip,
  updateTrip,
  deleteTrip,
  generateAndStoreItinerary,
  getItinerary,
  generateAndStoreBudget,
  getBudget
} from '../services/itineraryService.js';
import { createBadRequest } from '../utils/apiError.js';
import { extractTripDetails } from '../services/aiService.js';

const tripSchemaKeys = ['destination', 'startDate', 'endDate', 'budget', 'currency', 'travelers', 'preferences', 'notes'];

const pickAllowed = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([key]) => tripSchemaKeys.includes(key))
  );

export const getTripsController = asyncHandler(async (req, res) => {
  const trips = await listTrips(req.user.id);
  res.json({ data: trips });
});

export const createTripController = asyncHandler(async (req, res) => {
  if (!req.body.destination) {
    throw createBadRequest('目的地是必填项');
  }
  const trip = await createTrip(req.user.id, pickAllowed(req.body));
  res.status(201).json({ data: trip });
});

export const getTripController = asyncHandler(async (req, res) => {
  const trip = await getTrip(req.user.id, req.params.tripId);
  res.json({ data: trip });
});

export const updateTripController = asyncHandler(async (req, res) => {
  const updates = pickAllowed(req.body);
  const trip = await updateTrip(req.user.id, req.params.tripId, updates);
  res.json({ data: trip });
});

export const deleteTripController = asyncHandler(async (req, res) => {
  await deleteTrip(req.user.id, req.params.tripId);
  res.status(204).send();
});

export const generatePlanController = asyncHandler(async (req, res) => {
  const trip = await generateAndStoreItinerary(
    req.user.id,
    req.params.tripId,
    req.body
  );
  res.json({ data: trip.aiSummary });
});

export const getItineraryController = asyncHandler(async (req, res) => {
  const plan = await getItinerary(req.user.id, req.params.tripId);
  res.json({ data: plan });
});

export const generateBudgetController = asyncHandler(async (req, res) => {
  const trip = await generateAndStoreBudget(
    req.user.id,
    req.params.tripId,
    req.body
  );
  res.json({ data: trip.aiBudget });
});

export const getBudgetController = asyncHandler(async (req, res) => {
  const budget = await getBudget(req.user.id, req.params.tripId);
  res.json({ data: budget });
});

export const extractTripDetailsController = asyncHandler(async (req, res) => {
  const description = req.body?.description ?? '';
  if (!description.trim()) {
    throw createBadRequest('请输入旅行描述。');
  }
  const result = await extractTripDetails(description);
  res.json({ data: result });
});
