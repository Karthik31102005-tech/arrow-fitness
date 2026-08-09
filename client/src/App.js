import { useState, useEffect } from 'react';
import RegistrationForm from './components/RegistrationForm';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  const [view, setView] = useState('public');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setView('public');
  };

  return (
    <div>
      <nav style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
        <button onClick={() => setView('public')} style={{ marginRight: '1rem', cursor: 'pointer' }}>
          Home
        </button>
        <button onClick={() => setView('admin')} style={{ cursor: 'pointer' }}>
          Admin
        </button>
      </nav>

      {view === 'public' && (
        <>
          <h1 style={{ textAlign: 'center', marginTop: '2rem' }}>Arrow Fitness</h1>
          <RegistrationForm />
        </>
      )}

      {view === 'admin' && (
        token
          ? <AdminDashboard token={token} onLogout={handleLogout} />
          : <AdminLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;