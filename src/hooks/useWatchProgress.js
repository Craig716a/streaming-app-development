import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'stream-world-watch-progress';

const readProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

export function progressKey(mediaType, id) {
  return `${mediaType}:${id}`;
}

export default function useWatchProgress(mediaType, id) {
  const key = progressKey(mediaType, id);
  const [progress, setProgress] = useState(() => readProgress()[key] || null);

  const saveProgress = useCallback((next) => {
    setProgress(next);
    try {
      const all = readProgress();
      all[key] = { ...all[key], ...next, updatedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      /* storage unavailable */
    }
  }, [key]);

  useEffect(() => {
    const handleStorage = () => setProgress(readProgress()[key] || null);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return { progress, saveProgress };
}
