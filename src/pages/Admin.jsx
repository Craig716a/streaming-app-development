import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Clock3, Eye, LockKeyhole, RefreshCw, Users } from 'lucide-react';

const ranges = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: '7 days' },
  { value: 'month', label: '30 days' },
  { value: 'year', label: '12 months' },
  { value: 'all', label: 'All time' },
];

async function request(payload) {
  const response = await fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: 'rebelstream', password: '' });
  const [range, setRange] = useState('day');
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      setMetrics(await request({ action: 'metrics', range }));
      setError('');
    } catch (err) {
      setLoggedIn(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    if (loggedIn) loadMetrics();
  }, [loggedIn, loadMetrics]);

  const resetAnalytics = async () => {
    if (!window.confirm('Clear all analytics collected before today? This cannot be undone.')) return;
    setResetting(true);
    try { await request({ action: 'reset', confirmation: 'RESET_ANALYTICS' }); await loadMetrics(); } finally { setResetting(false); }
  };

  const login = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await request({ action: 'login', ...credentials });
      setLoggedIn(true);
    } catch {
      setError('Invalid username or password.');
    }
  };

  if (!loggedIn) {
    return (
      <main className="admin-page admin-auth-page">
        <form className="admin-card" onSubmit={login}>
          <div className="admin-icon"><LockKeyhole size={22} /></div>
          <p className="eyebrow">Private workspace</p>
          <h1>Admin portal</h1>
          <p className="admin-subtitle">Sign in to view RebelStream performance.</p>
          <label>Username<input value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} autoComplete="username" /></label>
          <label>Password<input type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} autoComplete="current-password" /></label>
          {error && <div className="admin-error" role="alert">{error}</div>}
          <button type="submit" className="admin-submit">Sign in securely</button>
        </form>
      </main>
    );
  }

  const selectedRange = ranges.find((item) => item.value === range);
  return (
    <main className="admin-page">
      <div className="admin-header">
        <div><p className="eyebrow">RebelStream / Insights</p><h1>Analytics overview</h1><p className="admin-subtitle">{selectedRange.label} · live activity from your audience</p></div>
        <div className="admin-header-actions"><button className="admin-refresh" onClick={loadMetrics} disabled={loading} aria-label="Refresh metrics"><RefreshCw size={17} className={loading ? 'spin' : ''} /></button><button className="admin-reset" onClick={resetAnalytics} disabled={resetting}>Reset data</button><BarChart3 size={30} /></div>
      </div>
      <div className="admin-ranges" role="tablist" aria-label="Analytics time range">{ranges.map((item) => <button type="button" key={item.value} className={range === item.value ? 'active' : ''} onClick={() => setRange(item.value)}>{item.label}</button>)}</div>
      <section className="admin-stats">
        <article><div className="stat-icon"><Eye size={17} /></div><span>Visitors</span><strong>{formatNumber(metrics?.visits)}</strong><small>{selectedRange.label.toLowerCase()}</small></article>
        <article><div className="stat-icon"><Users size={17} /></div><span>Unique users</span><strong>{formatNumber(metrics?.unique_users)}</strong><small>distinct devices</small></article>
        <article><div className="stat-icon"><Clock3 size={17} /></div><span>Watch time</span><strong>{metrics?.hours ?? 0}h</strong><small>total viewing</small></article>
      </section>
      <section className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">Content performance</p><h2>Top watched titles</h2></div><span className="panel-range">{selectedRange.label}</span></div>{(metrics?.top || []).map((item, index) => <div className="admin-title-row" key={item.id}><b>{String(index + 1).padStart(2, '0')}</b><span>{item.title || 'Untitled'}</span><strong>{formatNumber(item.watches)} <em>plays</em></strong></div>)}{!metrics?.top?.length && <p className="admin-empty">No watch events recorded for this range.</p>}</section><section className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">Audience geography</p><h2>Users by location</h2></div><span className="panel-range">Unique visitors</span></div>{(metrics?.locations || []).map((location) => <div className="location-row" key={location.country}><span>{location.country}</span><div className="location-bar"><i style={{ width: `${location.percentage}%` }} /></div><strong>{location.percentage}%</strong></div>)}{!metrics?.locations?.length && <p className="admin-empty">Location data will appear after the first visit in a deployed environment.</p>}</section>
    </main>
  );
}
