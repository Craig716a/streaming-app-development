import useSaved from '@/hooks/useSaved';

export default function useLocalData() {
  const [favorites, setFavorites] = useSaved('stream-world-favorites', []);
  const [history, setHistory] = useSaved('stream-world-history', []);
  const [language, setLanguage] = useSaved('stream-world-language', 'English');

  const toggleFavorite = (item) =>
    setFavorites((old) =>
      old.some((entry) => entry.id === item.id && entry.mediaType === item.mediaType)
        ? old.filter((entry) => !(entry.id === item.id && entry.mediaType === item.mediaType))
        : [item, ...old],
    );

  const addHistory = (item) =>
    setHistory((old) => [item, ...old.filter((entry) => !(entry.id === item.id && entry.mediaType === item.mediaType))].slice(0, 30));

  return { favorites, setFavorites, history, setHistory, language, setLanguage, toggleFavorite, addHistory };
}