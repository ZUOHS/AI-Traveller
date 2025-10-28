import { v4 as uuid } from 'uuid';
import { DEFAULT_CURRENCY } from '@ai-traveller/common';

import { supabaseAdmin, useMockStore, memoryStore } from './supabaseClient.js';
import { generateItineraryPlan, generateBudgetPlan } from './aiService.js';
import { searchPois } from './mapService.js';
import { createNotFound, createServerError } from '../utils/apiError.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const toSupabaseTrip = (userId, trip) => ({
  id: trip.id,
  user_id: userId,
  destination: trip.destination,
  start_date: trip.startDate,
  end_date: trip.endDate,
  budget: trip.budget,
  currency: trip.currency,
  travelers: trip.travelers,
  preferences: trip.preferences,
  notes: trip.notes,
  created_at: trip.createdAt,
  updated_at: trip.updatedAt,
  ai_summary: trip.aiSummary,
  ai_budget: trip.aiBudget
});

const fromSupabaseTrip = (record) => ({
  id: record.id,
  destination: record.destination,
  startDate: record.start_date,
  endDate: record.end_date,
  budget: record.budget,
  currency: record.currency,
  travelers: record.travelers,
  preferences: record.preferences,
  notes: record.notes,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  aiSummary: record.ai_summary,
  aiBudget: record.ai_budget
});

const now = () => new Date().toISOString();

const geocodeCache = new Map();

const persistItinerary = async (tripId, plan) => {
  if (!useMockStore && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('itineraries')
      .upsert({
        trip_id: tripId,
        data: plan,
        updated_at: now()
      })
      .eq('trip_id', tripId);
    if (error) {
      throw createServerError('Failed to store itinerary', error.message);
    }
  } else {
    memoryStore.itineraries.set(tripId, plan);
  }
};

const fetchCoordinates = async (location, destination) => {
  const cacheKey = `${destination ?? ''}:${location}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }
  try {
    const results = await searchPois({
      keywords: location,
      city: destination
    });
    const match = results?.find((poi) => poi.lat && poi.lng);
    if (match) {
      const coords = {
        lat: Number(match.lat),
        lng: Number(match.lng)
      };
      geocodeCache.set(cacheKey, coords);
      return coords;
    }
  } catch (error) {
    logger.warn('Failed to fetch coordinates from Gaode', {
      error: error.message,
      location,
      destination
    });
  }
  geocodeCache.set(cacheKey, null);
  return null;
};

const enrichItineraryWithGeo = async (plan, { destination }) => {
  if (!plan?.days?.length || !env.amapWebServiceKey) {
    return { plan, changed: false };
  }

  let mutated = false;

  const days = await Promise.all(
    plan.days.map(async (day) => {
      let dayMutated = false;
      const items = await Promise.all(
        (day.items ?? []).map(async (item) => {
          if ((item.lat && item.lng) || !item.location) {
            return item;
          }
          const coords = await fetchCoordinates(item.location, destination);
          if (coords?.lat && coords?.lng) {
            dayMutated = true;
            mutated = true;
            return {
              ...item,
              ...coords
            };
          }
          return item;
        })
      );
      if (!dayMutated) {
        return day;
      }
      return {
        ...day,
        items
      };
    })
  );

  if (!mutated) {
    return { plan, changed: false };
  }

  return {
    plan: {
      ...plan,
      days
    },
    changed: true
  };
};

export const listTrips = async (userId) => {
  if (!userId) return [];

  if (!useMockStore && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: true });

    if (error) {
      throw createServerError('Failed to fetch trips', error.message);
    }

    return data.map(fromSupabaseTrip);
  }

  return Array.from(memoryStore.trips.values()).filter(
    (trip) => trip.userId === userId
  );
};

export const getTrip = async (userId, tripId) => {
  if (!useMockStore && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single();
    if (error || !data) {
      throw createNotFound('Trip not found');
    }
    return fromSupabaseTrip(data);
  }

  const trip = memoryStore.trips.get(tripId);
  if (!trip || trip.userId !== userId) {
    throw createNotFound('Trip not found');
  }
  return trip;
};

export const createTrip = async (userId, payload) => {
  const trip = {
    id: uuid(),
    userId,
    destination: payload.destination,
    startDate: payload.startDate,
    endDate: payload.endDate,
    budget: payload.budget,
    currency: payload.currency ?? DEFAULT_CURRENCY,
    travelers: payload.travelers ?? 1,
    preferences: payload.preferences ?? {},
    notes: payload.notes ?? '',
    createdAt: now(),
    updatedAt: now(),
    aiSummary: null,
    aiBudget: null
  };

  if (!useMockStore && supabaseAdmin) {
    const { error } = await supabaseAdmin.from('trips').insert(
      toSupabaseTrip(userId, trip)
    );
    if (error) {
      throw createServerError('Failed to create trip', error.message);
    }
  } else {
    memoryStore.trips.set(trip.id, trip);
  }

  return trip;
};

export const updateTrip = async (userId, tripId, updates) => {
  const existing = await getTrip(userId, tripId);
  const merged = {
    ...existing,
    ...updates,
    updatedAt: now()
  };

  if (!useMockStore && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('trips')
      .update(toSupabaseTrip(userId, merged))
      .eq('id', tripId)
      .eq('user_id', userId);
    if (error) {
      throw createServerError('Failed to update trip', error.message);
    }
  } else {
    memoryStore.trips.set(tripId, merged);
  }

  return merged;
};

export const deleteTrip = async (userId, tripId) => {
  await getTrip(userId, tripId);

  if (!useMockStore && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', userId);
    if (error) {
      throw createServerError('Failed to delete trip', error.message);
    }
  } else {
    memoryStore.trips.delete(tripId);
    memoryStore.itineraries.delete(tripId);
    memoryStore.itineraryItems.delete(tripId);
    memoryStore.expenses.delete(tripId);
  }

  return { success: true };
};

export const generateAndStoreItinerary = async (userId, tripId, input) => {
  const trip = await getTrip(userId, tripId);
  const plan = await generateItineraryPlan({
    ...input,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    travelers: trip.travelers,
    preferences: trip.preferences
  });

  const { plan: enrichedPlan } = await enrichItineraryWithGeo(plan, {
    destination: trip.destination
  });

  await persistItinerary(tripId, enrichedPlan);

  const updated = await updateTrip(userId, tripId, {
    aiSummary: enrichedPlan
  });

  return updated;
};

export const generateAndStoreBudget = async (userId, tripId, input) => {
  const trip = await getTrip(userId, tripId);
  const plan = await generateBudgetPlan({
    ...input,
    budget: trip.budget,
    destination: trip.destination,
    travelers: trip.travelers,
    preferences: trip.preferences
  });

  const updated = await updateTrip(userId, tripId, {
    aiBudget: plan
  });

  if (!useMockStore && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('budgets')
      .upsert({
        trip_id: tripId,
        data: plan,
        updated_at: now()
      })
      .eq('trip_id', tripId);
    if (error) {
      throw createServerError('Failed to store budget', error.message);
    }
  } else {
    const existing = memoryStore.trips.get(tripId);
    if (existing) {
      memoryStore.trips.set(tripId, { ...existing, aiBudget: plan });
    }
  }

  return updated;
};

export const getItinerary = async (userId, tripId) => {
  const trip = await getTrip(userId, tripId);
  let plan;

  if (!useMockStore && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('itineraries')
      .select('*')
      .eq('trip_id', tripId)
      .single();
    if (error || !data) {
      throw createNotFound('Itinerary not found');
    }
    plan = data.data;
  } else {
    plan = memoryStore.itineraries.get(tripId);
    if (!plan) {
      throw createNotFound('Itinerary not found');
    }
  }

  const { plan: enrichedPlan, changed } = await enrichItineraryWithGeo(plan, {
    destination: trip.destination
  });

  if (changed) {
    await persistItinerary(tripId, enrichedPlan);
    await updateTrip(userId, tripId, { aiSummary: enrichedPlan });
  }

  return enrichedPlan;
};

export const getBudget = async (userId, tripId) => {
  const trip = await getTrip(userId, tripId);
  if (trip.aiBudget) {
    return trip.aiBudget;
  }

  if (!useMockStore && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('budgets')
      .select('*')
      .eq('trip_id', tripId)
      .single();
    if (error || !data) {
      throw createNotFound('Budget not found');
    }
    return data.data;
  }

  throw createNotFound('Budget not found');
};
