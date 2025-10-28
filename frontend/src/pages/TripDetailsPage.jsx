import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { EXPENSE_CATEGORIES } from '@ai-traveller/common';

import {
  getTrip,
  fetchItinerary,
  fetchBudget
} from '../services/tripService.js';
import {
  listExpenses,
  createExpense,
  deleteExpense,
  analyzeExpenseDescription
} from '../services/expenseService.js';
import { MapView } from '../components/MapView.jsx';
import { ItineraryDayCard } from '../components/ItineraryDayCard.jsx';
import { AssistantPanel } from '../components/AssistantPanel.jsx';
import { ExpenseList } from '../components/ExpenseList.jsx';
import { VoiceInput } from '../components/VoiceInput.jsx';

export function TripDetailsPage() {
  const { tripId } = useParams();
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    notes: ''
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [expenseAnalyzing, setExpenseAnalyzing] = useState(false);
  const [expenseVoiceMessage, setExpenseVoiceMessage] = useState('');
  const [expenseVoiceError, setExpenseVoiceError] = useState('');

  const { data: trip, mutate: mutateTrip } = useSWR(
    tripId ? `/trips/${tripId}` : null,
    () => getTrip(tripId)
  );

  const { data: itinerary, mutate: mutateItinerary } = useSWR(
    tripId ? `/trips/${tripId}/plan` : null,
    () => fetchItinerary(tripId),
    { revalidateOnFocus: false }
  );

  const { data: budget, mutate: mutateBudget } = useSWR(
    tripId ? `/trips/${tripId}/budget` : null,
    () => fetchBudget(tripId),
    { revalidateOnFocus: false }
  );

  const {
    data: expenses,
    mutate: mutateExpenses
  } = useSWR(
    tripId ? `/trips/${tripId}/expenses` : null,
    () => listExpenses(tripId),
    { revalidateOnFocus: false }
  );

  const handleExpenseTranscript = (text) => {
    setExpenseForm((prev) => ({
      ...prev,
      notes: `${prev.notes} ${text}`.trim()
    }));
  };

  const handleExpenseAnalyze = async () => {
    const description = expenseForm.notes.trim();
    if (!tripId || !description || expenseAnalyzing) {
      return;
    }

    setExpenseAnalyzing(true);
    setStatusMessage('');
    try {
      const result = await analyzeExpenseDescription(tripId, description);
      setExpenseForm((prev) => {
        const normalizedCategory = EXPENSE_CATEGORIES.includes(result.category)
          ? result.category
          : prev.category;
        const normalizedAmount =
          typeof result.amount === 'number' && !Number.isNaN(result.amount)
            ? String(result.amount)
            : prev.amount;
        return {
          ...prev,
          title: result.title?.trim() || prev.title,
          category: normalizedCategory,
          amount: normalizedAmount,
          notes: result.notes?.trim() || prev.notes
        };
      });
      setStatusMessage('已根据描述补全费用信息。');
    } catch (error) {
      setStatusMessage(error.response?.data?.error?.message ?? '解析费用描述失败，请稍后重试。');
    } finally {
      setExpenseAnalyzing(false);
    }
  };

  const handleExpenseSubmit = async (event) => {
    event.preventDefault();
    if (!tripId) return;
    setSubmittingExpense(true);
    setStatusMessage('');
    try {
      await createExpense(tripId, {
        ...expenseForm,
        amount: Number(expenseForm.amount),
        spentAt: new Date().toISOString()
      });
      await mutateExpenses();
      setExpenseForm({
        title: '',
        category: EXPENSE_CATEGORIES[0],
        amount: '',
        notes: ''
      });
      setStatusMessage('已记录费用。');
    } catch (err) {
      setStatusMessage(
        err.response?.data?.error?.message ?? '记录失败，请稍后再试。'
      );
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    await deleteExpense(tripId, expenseId);
    mutateExpenses();
  };

  if (!trip) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
        正在加载行程详情…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-800">
            {trip.destination}
          </h2>
          <p className="text-sm text-slate-500">
            {dayjs(trip.startDate).format('YYYY/MM/DD')} -{' '}
            {dayjs(trip.endDate).format('YYYY/MM/DD')} · {trip.travelers} 人
          </p>
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              预算：{trip.budget} {trip.currency}
            </p>
            <p className="mt-1">偏好：{trip.preferences?.notes ?? '—'}</p>
          </div>
        </div>
        <AssistantPanel itinerary={itinerary} budget={budget} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">地图概览</h3>
          <MapView itinerary={itinerary} destination={trip.destination} />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">预算分配</h3>
          {budget ? (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>总预算</span>
                <span>
                  {budget.total} {budget.currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>日均预算</span>
                <span>
                  {Number(budget.dailyAverage).toFixed(0)} {budget.currency}
                </span>
              </div>
              <ul className="space-y-2">
                {budget.breakdown.map((item) => (
                  <li
                    key={item.category}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-600"
                  >
                    <span>{item.category}</span>
                    <span>
                      {Number(item.amount).toFixed(0)} {budget.currency}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-400">
              暂无预算数据，可在“智能规划”重新生成。
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">每日行程</h3>
          <button
            type="button"
            onClick={() => {
              mutateTrip();
              mutateItinerary();
              mutateBudget();
            }}
            className="text-sm text-primary hover:underline"
          >
            刷新
          </button>
        </div>
        {itinerary?.days?.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {itinerary.days.map((day) => (
              <ItineraryDayCard key={day.day} day={day} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-400">
            暂无行程数据，可在“智能规划”重新生成。
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">费用记录</h3>
          <ExpenseList expenses={expenses ?? []} onDelete={handleDeleteExpense} />
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="text-base font-semibold text-slate-800">新增费用</h4>
          <form className="space-y-3" onSubmit={handleExpenseSubmit}>
            <label className="block text-sm text-slate-600">
              标题
              <input
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={expenseForm.title}
                onChange={(event) =>
                  setExpenseForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </label>
            <label className="block text-sm text-slate-600">
              分类
              <select
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={expenseForm.category}
                onChange={(event) =>
                  setExpenseForm((prev) => ({ ...prev, category: event.target.value }))
                }
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-600">
              金额
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={expenseForm.amount}
                onChange={(event) =>
                  setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="例如 200"
              />
            </label>
            <label className="block text-sm text-slate-600">
              备注
              <div className="relative mt-1">
                <textarea
                  className="h-24 w-full rounded-md border border-slate-200 px-3 py-2 pr-28 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={expenseForm.notes}
                  onChange={(event) =>
                    setExpenseForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  placeholder="语音或文字描述：项目、金额、类别等信息"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <VoiceInput
                    variant="inline"
                    buttonLabel="开始语音录入"
                    recordingLabel="结束语音录入"
                    onTranscript={handleExpenseTranscript}
                    onStatusChange={(text) => {
                      setExpenseVoiceMessage(text);
                      setExpenseVoiceError('');
                    }}
                    onError={(text) => {
                      setExpenseVoiceError(text);
                      setExpenseVoiceMessage('');
                    }}
                    disabled={expenseAnalyzing}
                  />
                  <button
                    type="button"
                    onClick={handleExpenseAnalyze}
                    disabled={!expenseForm.notes.trim() || expenseAnalyzing}
                    className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {expenseAnalyzing ? '识别中…' : 'AI 识别填入'}
                  </button>
                </div>
              </div>
            </label>
            {expenseVoiceMessage ? (
              <p className="text-xs text-slate-500">{expenseVoiceMessage}</p>
            ) : null}
            {expenseVoiceError ? (
              <p className="text-xs text-rose-500">{expenseVoiceError}</p>
            ) : null}
            <button
              type="submit"
              disabled={submittingExpense}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submittingExpense ? '提交中…' : '保存费用'}
            </button>
          </form>
          {statusMessage ? (
            <p className="text-xs text-slate-500">{statusMessage}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
