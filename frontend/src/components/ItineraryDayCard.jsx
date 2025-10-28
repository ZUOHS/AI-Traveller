import { Fragment } from 'react';
import dayjs from 'dayjs';

export function ItineraryDayCard({ day }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Day {day.day}
          </p>
          <h4 className="text-lg font-semibold text-slate-800">
            {day.theme || '行程安排'}
          </h4>
        </div>
        <span className="text-sm text-slate-500">
          {dayjs(day.date).format('MM月DD日')}
        </span>
      </div>
      <ul className="mt-4 space-y-4">
        {day.items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">
                  {item.time} · {item.title}
                </p>
                {item.category ? (
                  <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {item.category}
                  </span>
                ) : null}
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                <p className="mt-1 text-xs text-slate-400">{item.location}</p>
              </div>
            </div>
            {item.tips?.length ? (
              <div className="mt-2 rounded-md bg-white p-3 text-xs text-slate-500">
                <p className="font-medium text-slate-600">小贴士</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {item.tips.map((tip, tipIndex) => (
                    <Fragment key={tipIndex}>
                      <li>{tip}</li>
                    </Fragment>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
