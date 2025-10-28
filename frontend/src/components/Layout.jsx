import { NavLink } from 'react-router-dom';

import { useSessionStore } from '../store/useSessionStore.js';

const navItems = [
  { to: '/', label: '行程总览' },
  { to: '/planner', label: '智能规划' }
];

export function Layout({ children }) {
  const { user, signOut } = useSessionStore((state) => ({
    user: state.user,
    signOut: state.signOut
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              AI Traveller
            </p>
            <h1 className="text-xl font-semibold text-primary">
              智能旅行助手
            </h1>
          </div>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary underline underline-offset-4'
                      : 'text-slate-600 hover:text-primary'
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">欢迎回来</p>
              <p className="text-sm font-medium text-slate-800">
                {user?.username || user?.email || user?.id}
              </p>
            </div>
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              onClick={signOut}
            >
              退出
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto min-h-[calc(100vh-80px)] max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
