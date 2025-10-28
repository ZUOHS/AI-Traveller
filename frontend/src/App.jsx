import { Routes, Route, Navigate } from 'react-router-dom';

import { Layout } from './components/Layout.jsx';
import { LoginGate } from './components/LoginGate.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { PlannerPage } from './pages/PlannerPage.jsx';
import { TripDetailsPage } from './pages/TripDetailsPage.jsx';
import { useSessionStore } from './store/useSessionStore.js';

export default function App() {
  const { user, loading } = useSessionStore((state) => ({
    user: state.user,
    loading: state.loading
  }));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        正在加载您的旅行数据...
      </div>
    );
  }

  if (!user) {
    return <LoginGate />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/trips/:tripId" element={<TripDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
