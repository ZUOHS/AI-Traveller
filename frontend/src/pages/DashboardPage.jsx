import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import dayjs from 'dayjs';

import { useTrips } from '../hooks/useTrips.js';
import { TripCard } from '../components/TripCard.jsx';

export function DashboardPage() {
  const { trips, isLoading } = useTrips();

  const upcoming = useMemo(() => {
    return [...trips].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
  }, [trips]);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/70 px-6 py-8 text-white shadow-lg">
        <div>
          <h2 className="text-2xl font-semibold">开始新的旅程</h2>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
            描述旅行需求，AI 将自动规划交通、住宿、景点与美食，生成行程表并同步预算。
          </p>
        </div>
        <Link
          to="/planner"
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition hover:bg-slate-100"
        >
          立即规划
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">即将出行</h3>
          <p className="text-sm text-slate-500">
            {upcoming.length
              ? `最近行程：${dayjs(upcoming[0].startDate).format('YYYY年MM月DD日')}`
              : '暂无计划，右上角立即创建'}
          </p>
        </div>
        {isLoading ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-400">
            正在加载行程…
          </p>
        ) : upcoming.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {upcoming.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-400">
            还没有旅行计划，使用“智能规划”快速创建一个吧。
          </div>
        )}
      </section>
    </div>
  );
}
