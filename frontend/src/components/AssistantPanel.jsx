import { useMemo } from 'react';

export function AssistantPanel({ itinerary, budget }) {
  const insights = useMemo(() => {
    const notes = [];
    if (budget?.tips?.length) {
      notes.push(...budget.tips);
    }
    if (itinerary?.notes?.length) {
      notes.push(...itinerary.notes);
    }
    return notes;
  }, [budget, itinerary]);

  const transportation = itinerary?.transportation ?? [];
  const accommodation = itinerary?.accommodation ?? [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-primary/10 via-white to-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800">AI 旅行助手</h3>
      <p className="mt-1 text-sm text-slate-500">
        根据当前行程和预算提供实时提示，出发前别忘了核对天气、证件与交通信息。
      </p>
      {transportation.length ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700">交通建议</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {transportation.map((item, index) => (
              <li key={`${item}-${index}`} className="rounded-lg bg-white p-3 shadow-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {accommodation.length ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700">住宿建议</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {accommodation.map((item, index) => (
              <li key={`${item}-${index}`} className="rounded-lg bg-white p-3 shadow-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {insights.length ? (
          insights.map((note, index) => (
            <li
              key={`${note}-${index}`}
              className="flex items-start gap-2 rounded-lg bg-white p-3 shadow-sm"
            >
              <span className="mt-0.5 text-primary">•</span>
              <span>{note}</span>
            </li>
          ))
        ) : (
          <li className="rounded-lg bg-white p-3 text-slate-400 shadow-sm">
            生成行程后，AI 将在此展示每日提醒与旅行建议。
          </li>
        )}
      </ul>
    </section>
  );
}
