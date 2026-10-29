import { base44 } from '@/api/base44Client';

export async function tmdbRequest(action, params = {}) {
  const response = await base44.functions.invoke('tmdb', { action, ...params });
  const data = response && response.data;
  if (!data || data.error) throw new Error((data && data.error) || 'Catalogue request failed');
  return data;
}