import { useAuthStore } from './store/auth';
import LoginPage from './components/LoginPage';
import TopBar from './components/Sidebar';
import Dashboard from './components/Dashboard';

export default function App() {
  const token = useAuthStore((s) => s.token);

  if (!token) return <LoginPage />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <TopBar />
      <main className="px-6 py-6">
        <Dashboard />
      </main>
    </div>
  );
}
