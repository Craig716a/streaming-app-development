export async function tmdbRequest(action, params = {}) {
  const response = await fetch('/api/tmdb', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || data.error) {
    throw new Error((data && data.error) || 'Catalogue request failed');
  }
  return data;
}
