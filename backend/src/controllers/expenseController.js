import { asyncHandler } from '../utils/asyncHandler.js';
import { createBadRequest } from '../utils/apiError.js';
import { extractExpenseDetails } from '../services/aiService.js';
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} from '../services/expenseService.js';

export const listExpensesController = asyncHandler(async (req, res) => {
  const expenses = await listExpenses(req.user.id, req.params.tripId);
  res.json({ data: expenses });
});

export const createExpenseController = asyncHandler(async (req, res) => {
  const expense = await createExpense(
    req.user.id,
    req.params.tripId,
    req.body
  );
  res.status(201).json({ data: expense });
});

export const updateExpenseController = asyncHandler(async (req, res) => {
  const expense = await updateExpense(
    req.user.id,
    req.params.tripId,
    req.params.expenseId,
    req.body
  );
  res.json({ data: expense });
});

export const deleteExpenseController = asyncHandler(async (req, res) => {
  await deleteExpense(req.user.id, req.params.tripId, req.params.expenseId);
  res.status(204).send();
});

export const analyzeExpenseController = asyncHandler(async (req, res) => {
  const description = req.body?.description ?? '';
  if (!description.trim()) {
    throw createBadRequest('请输入费用描述。');
  }
  const result = await extractExpenseDetails(description);
  res.json({ data: result });
});
