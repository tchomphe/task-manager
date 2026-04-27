import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../AuthContext';
import { Button } from '../components/Button';

export function TasksPage() {
  const { clearToken } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">Task Manager</span>
        <Button variant="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">Your tasks will appear here</p>
      </main>
    </div>
  );
}
