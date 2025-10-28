import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

export function TripCard({ trip }) {
  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-primary">
          {trip.destination}
        </h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {trip.currency} {trip.budget ?? '--'}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {dayjs(trip.startDate).format('YYYY年MM月DD日')} -{' '}
        {dayjs(trip.endDate).format('YYYY年MM月DD日')} · {trip.travelers} 人
      </p>
      {trip.aiSummary ? (
        <p className="mt-3 line-clamp-3 text-sm text-slate-600">
          {trip.aiSummary.summary}
        </p>
      ) : (
        <p className="mt-3 text-sm text-slate-400">
          尚未生成 AI 行程，点击进入规划。
        </p>
      )}
    </Link>
  );
}
