import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/health`)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('Backend not reachable'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Arrow Fitness</h1>
      <p>Backend says: <strong>{status}</strong></p>
    </div>
  );
}

export default App;