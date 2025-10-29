import { v4 as uuid } from 'uuid';
import { DEFAULT_CURRENCY, EXPENSE_CATEGORIES } from '@ai-traveller/common';

import { supabaseAdmin, useMockStore, memoryStore } from './supabaseClient.js';
import { isTestAccountId } from './testAccount.js';
import { env } from '../config/env.js';
import { createBadRequest, createNotFound, createServerError } from '../utils/apiError.js';

const now = () => new Date().toISOString();

const toSupabaseExpense = (userId, tripId, expense) => ({
  id: expense.id,
  user_id: userId,
  trip_id: tripId,
  title: expense.title,
  category: expense.category,
  amount: expense.amount,
  currency: expense.currency,
  spent_at: expense.spentAt,
  notes: expense.notes,
  voice_note_url: expense.voiceNoteUrl,
  transcript: expense.transcript,
  created_at: expense.createdAt,
  updated_at: expense.updatedAt
});

const fromSupabaseExpense = (record) => ({
  id: record.id,
  tripId: record.trip_id,
  title: record.title,
  category: record.category,
  amount: record.amount,
  currency: record.currency,
  spentAt: record.spent_at,
  notes: record.notes,
  voiceNoteUrl: record.voice_note_url,
  transcript: record.transcript,
  createdAt: record.created_at,
  updatedAt: record.updated_at
});

const getStore = (tripId) => {
  if (!memoryStore.expenses.has(tripId)) {
    memoryStore.expenses.set(tripId, new Map());
  }
  return memoryStore.expenses.get(tripId);
};

const shouldUseSupabase = (userId) => {
  if (useMockStore || !supabaseAdmin) {
    return false;
  }

  if (isTestAccountId(userId) && !env.testAccountUseSupabase) {
    return false;
  }

  return true;
};

export const listExpenses = async (userId, tripId) => {
  if (shouldUseSupabase(userId)) {
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('trip_id', tripId)
      .order('spent_at', { ascending: true });
    if (error) {
      throw createServerError('Failed to fetch expenses', error.message);
    }
    return data.map(fromSupabaseExpense);
  }

  return Array.from(getStore(tripId).values());
};

export const createExpense = async (userId, tripId, payload) => {
  if (
    payload.category &&
    !EXPENSE_CATEGORIES.includes(payload.category)
  ) {
    throw createBadRequest('不支持的费用类别');
  }

  const expense = {
    id: uuid(),
    tripId,
    title: payload.title,
    category: payload.category,
    amount: Number(payload.amount ?? 0),
    currency: payload.currency ?? DEFAULT_CURRENCY,
    spentAt: payload.spentAt ?? now(),
    notes: payload.notes ?? '',
    transcript: payload.transcript ?? '',
    voiceNoteUrl: payload.voiceNoteUrl ?? '',
    createdAt: now(),
    updatedAt: now()
  };

  if (shouldUseSupabase(userId)) {
    const { error } = await supabaseAdmin
      .from('expenses')
      .insert(toSupabaseExpense(userId, tripId, expense));
    if (error) {
      throw createServerError('Failed to create expense', error.message);
    }
  } else {
    getStore(tripId).set(expense.id, expense);
  }

  return expense;
};

export const updateExpense = async (userId, tripId, expenseId, payload) => {
  if (
    payload.category &&
    !EXPENSE_CATEGORIES.includes(payload.category)
  ) {
    throw createBadRequest('不支持的费用类别');
  }

  if (shouldUseSupabase(userId)) {
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .update({
        ...toSupabaseExpense(userId, tripId, {
          id: expenseId,
          ...payload,
          updatedAt: now()
        })
      })
      .eq('id', expenseId)
      .eq('user_id', userId)
      .eq('trip_id', tripId)
      .select()
      .single();

    if (error || !data) {
      throw createServerError('Failed to update expense', error?.message);
    }
    return fromSupabaseExpense(data);
  }

  const store = getStore(tripId);
  const existing = store.get(expenseId);
  if (!existing) {
    throw createNotFound('Expense not found');
  }

  const merged = {
    ...existing,
    ...payload,
    amount: payload.amount ? Number(payload.amount) : existing.amount,
    updatedAt: now()
  };
  store.set(expenseId, merged);
  return merged;
};

export const deleteExpense = async (userId, tripId, expenseId) => {
  if (shouldUseSupabase(userId)) {
    const { error } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId)
      .eq('trip_id', tripId);
    if (error) {
      throw createServerError('Failed to delete expense', error.message);
    }
    return { success: true };
  }

  const store = getStore(tripId);
  if (!store.has(expenseId)) {
    throw createNotFound('Expense not found');
  }
  store.delete(expenseId);
  return { success: true };
};

