import { useEffect, useState } from 'react';
import { BarChart3, LockKeyhole } from 'lucide-react';

const ranges = ['day', 'week', 'month', 'year', 'all'];

async function request(payload) {
  const response = await fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: 'rebelstream', password: '' });
  const [range, setRange] = useState('day');
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loggedIn) return;
    request({ action: 'metrics', range }).then(setMetrics).catch((err) => { setLoggedIn(false); setError(err.message); });
  }, [loggedIn, range]);

  const login = async (event) => {
    event.preventDefault();
    setError('');
    try { await request({ action: 'login', ...credentials }); setLoggedIn(true); } catch (err) { setError('Invalid username or password.'); }
  };

  if (!loggedIn) return <main className="admin-page"><form className="admin-card" onSubmit={login}><LockKeyhole size={30} /><h1>Admin portal</h1><p>Sign in to view RebelStream analytics.</p><label>Username<input value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} autoComplete="username" /></label><label>Password<input type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} autoComplete="current-password" /></label>{error && <div className="admin-error">{error}</div>}<button type="submit" className="admin-submit">Sign in</button></form></main>;

  return <main className="admin-page"><div className="admin-header"><div><p className="eyebrow">RebelStream</p><h1>Analytics</h1></div><BarChart3 size={32} /></div><div className="admin-ranges">{ranges.map((item) => <button key={item} className={range === item ? 'active' : ''} onClick={() => setRange(item)}>{item === 'all' ? 'All time' : `This ${item}`}</button>)}</div><section className="admin-stats"><article><span>Visitors</span><strong>{metrics?.visits ?? 0}</strong></article><article><span>Unique users</span><strong>{metrics?.unique_users ?? 0}</strong></article><article><span>Watch time</span><strong>{metrics?.hours ?? 0}h</strong></article></section><section className="admin-panel"><h2>Top 10 watched today</h2>{(metrics?.top || []).map((item, index) => <div className="admin-title-row" key={item.id}><b>{index + 1}</b><span>{item.title || 'Untitled'}</span><strong>{item.watches} watches</strong></div>)}{!metrics?.top?.length && <p className="admin-empty">No watch events recorded for this range.</p>}</section></main>;
}
