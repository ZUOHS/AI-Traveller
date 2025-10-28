import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createTrip,
  generateItinerary,
  generateBudget,
  analyzeTripDescription
} from '../services/tripService.js';
import { useTrips } from '../hooks/useTrips.js';
import { VoiceInput } from '../components/VoiceInput.jsx';
import { ItineraryDayCard } from '../components/ItineraryDayCard.jsx';
import { AssistantPanel } from '../components/AssistantPanel.jsx';

const todayIso = new Date().toISOString().slice(0, 10);
const DEFAULT_TRIP_DAYS = 5;

const computeEndDate = (startDate, days = DEFAULT_TRIP_DAYS) => {
  if (!startDate) return '';
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(days - 1, 0));
  return end.toISOString().slice(0, 10);
};

const initialForm = {
  destination: '',
  startDate: todayIso,
  endDate: computeEndDate(todayIso),
  budget: 10000,
  currency: 'CNY',
  travelers: 2,
  preferences: {
    interests: [],
    notes: ''
  }
};

export function PlannerPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [budgetPlan, setBudgetPlan] = useState(null);
  const [message, setMessage] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const { mutate } = useTrips();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm((prev) => {
      if (field === 'startDate') {
        const computed = computeEndDate(value);
        const shouldOverride =
          !prev.endDate ||
          prev.endDate === computeEndDate(prev.startDate) ||
          prev.endDate < value;
        return {
          ...prev,
          startDate: value,
          endDate: shouldOverride ? computed : prev.endDate
        };
      }
      if (field === 'endDate' && value && prev.startDate && value < prev.startDate) {
        return {
          ...prev,
          endDate: computeEndDate(prev.startDate)
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handlePreferenceUpdate = (text) => {
    setForm((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notes: `${prev.preferences.notes} ${text}`.trim()
      }
    }));
  };

  const handleAnalyze = useCallback(async () => {
    const description = form.preferences.notes.trim();
    if (!description || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setMessage('');
    try {
      const result = await analyzeTripDescription(description);
      setForm((prev) => {
        const cleanedDestination = result.destination?.trim();
        const cleanedInterests =
          result.preferences?.interests?.map((item) => item.trim()).filter(Boolean) ?? [];
        const parsedBudget =
          typeof result.budget === 'number' && !Number.isNaN(result.budget)
            ? Math.round(result.budget)
            : null;
        const parsedTravelers =
          typeof result.travelers === 'number' && !Number.isNaN(result.travelers)
            ? Math.max(1, Math.round(result.travelers))
            : null;
        const fallbackStartDate = result.startDate || prev.startDate || todayIso;
        const fallbackEndDate =
          result.endDate || (fallbackStartDate ? computeEndDate(fallbackStartDate) : prev.endDate);

        return {
          ...prev,
          destination: cleanedDestination || prev.destination,
          startDate: fallbackStartDate,
          endDate: fallbackEndDate,
          budget: parsedBudget ?? prev.budget,
          travelers: parsedTravelers ?? prev.travelers,
          preferences: {
            ...prev.preferences,
            interests: cleanedInterests.length ? cleanedInterests : prev.preferences.interests,
            notes: result.notes?.trim() || prev.preferences.notes
          }
        };
      });
      setMessage('已根据描述更新表单信息，请确认后生成行程。');
    } catch (error) {
      setMessage(error.response?.data?.error?.message ?? '解析旅行描述失败，请稍后重试。');
    } finally {
      setIsAnalyzing(false);
    }
  }, [form.preferences.notes, isAnalyzing]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const payload = {
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget),
        currency: form.currency,
        travelers: Number(form.travelers),
        preferences: form.preferences
      };
      const trip = await createTrip(payload);
      setMessage('创建行程成功，正在生成 AI 规划…');

      const plan = await generateItinerary(trip.id, {
        notes: form.preferences.notes,
        interests: form.preferences.interests
      });
      setItinerary(plan);
      setMessage('行程生成完成，正在估算预算…');

      const budget = await generateBudget(trip.id, {
        notes: form.preferences.notes
      });
      setBudgetPlan(budget);

      mutate();
      setMessage('智能规划完成，即将跳转到详情页。');
      setTimeout(() => {
        navigate(`/trips/${trip.id}`);
      }, 1200);
    } catch (error) {
      setMessage(error.response?.data?.error?.message ?? '生成失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">输入旅行需求</h2>
          <p className="mt-1 text-sm text-slate-500">
            支持语音或文字描述旅行需求（开始日期默认今天），填写“旅行描述”后可点击“AI 识别填入”自动补全部分信息。
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              目的地
              <input
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.destination}
                onChange={(event) => handleChange('destination', event.target.value)}
                placeholder="例如：日本东京"
              />
            </label>
            <label className="text-sm text-slate-600">
              预算（元）
              <input
                type="number"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.budget}
                onChange={(event) => handleChange('budget', event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-600">
              出发日期（默认今天）
              <input
                type="date"
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.startDate}
                onChange={(event) => handleChange('startDate', event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-600">
              结束日期
              <input
                type="date"
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.endDate}
                onChange={(event) => handleChange('endDate', event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-600">
              同行人数
              <input
                type="number"
                min="1"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.travelers}
                onChange={(event) => handleChange('travelers', event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-600">
              旅行偏好
              <input
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.preferences.interests.join(', ')}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      interests: event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                    }
                  }))
                }
                placeholder="例如：美食, 亲子, 博物馆体验"
              />
            </label>
          </div>
          <label className="block text-sm text-slate-600">
              旅行描述输入
            <div className="relative mt-2">
              <textarea
                className="h-28 w-full rounded-md border border-slate-200 px-3 py-2 pr-28 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.preferences.notes}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, notes: event.target.value }
                  }))
                }
                placeholder="语音或文字描述旅行需求：目的地、时间、预算、同行人、偏好等。"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <VoiceInput
                  variant="inline"
                  buttonLabel="开始语音录入"
                  recordingLabel="结束语音录入"
                  onTranscript={handlePreferenceUpdate}
                  onStatusChange={(text) => {
                    setVoiceMessage(text);
                    setVoiceError('');
                  }}
                  onError={(text) => {
                    setVoiceError(text);
                    setVoiceMessage('');
                  }}
                  disabled={isAnalyzing}
                />
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!form.preferences.notes.trim() || isAnalyzing}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAnalyzing ? '识别中…' : 'AI 识别填入'}
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              录入描述后，可使用输入框右下角的“AI 识别填入”按钮自动补全目的地、日期、预算等字段。
            </p>
            {voiceMessage ? (
              <p className="mt-1 text-xs text-slate-500">{voiceMessage}</p>
            ) : null}
            {voiceError ? (
              <p className="mt-1 text-xs text-rose-500">{voiceError}</p>
            ) : null}
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'AI 正在生成…' : '生成智能行程'}
          </button>
          {message ? <p className="text-sm text-slate-500">{message}</p> : null}
        </form>
      </section>
      <section className="space-y-4">
        <AssistantPanel itinerary={itinerary} budget={budgetPlan} />
        {itinerary?.days?.length ? (
          <div className="space-y-4">
            {itinerary.days.slice(0, 2).map((day) => (
              <ItineraryDayCard key={day.day} day={day} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-400">
            生成的行程亮点将展示在这里，包含每日安排、餐厅与交通建议。
          </div>
        )}
        {budgetPlan ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">预算概览</h3>
            <p className="mt-2 text-sm text-slate-500">
              总预算：{budgetPlan.total} {budgetPlan.currency} · 日均{' '}
              {budgetPlan.dailyAverage?.toFixed(0)} {budgetPlan.currency}
            </p>
            <ul className="mt-4 space-y-3">
              {budgetPlan.breakdown.map((item) => (
                <li
                  key={item.category}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600"
                >
                  <span>{item.category}</span>
                  <span>
                    {Number(item.amount).toFixed(0)} {budgetPlan.currency}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
