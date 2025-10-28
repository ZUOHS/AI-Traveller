import dayjs from 'dayjs';
import { EXPENSE_CATEGORIES } from '@ai-traveller/common';

export function ExpenseList({ expenses, onDelete }) {
  if (!expenses?.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-400">
        暂无费用记录，可通过语音或手动方式添加。
      </p>
    );
  }

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
        <span>旅行当前总开销</span>
        <span className="font-semibold">
          {total.toFixed(2)} {expenses[0]?.currency}
        </span>
      </div>
      <ul className="space-y-3">
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {expense.title || '费用'}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {expense.category ?? EXPENSE_CATEGORIES[0]}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {dayjs(expense.spentAt).format('YYYY-MM-DD HH:mm')}
              </p>
              {expense.notes ? (
                <p className="mt-2 text-sm text-slate-500">{expense.notes}</p>
              ) : null}
              {expense.transcript ? (
                <p className="mt-2 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                  语音备注：{expense.transcript}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-base font-semibold text-slate-800">
                {Number(expense.amount).toFixed(2)} {expense.currency}
              </p>
              <button
                type="button"
                onClick={() => onDelete?.(expense.id)}
                className="text-xs text-rose-500 hover:text-rose-600"
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
