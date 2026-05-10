import { useAuthStore } from './store/auth';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

export default function App() {
  const token = useAuthStore((s) => s.token);

  if (!token) return <LoginPage />;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Dashboard />
      </main>
    </div>
  );
}
