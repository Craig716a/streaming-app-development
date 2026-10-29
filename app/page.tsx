import StreamingApp from '@/components/streaming-app'

const fallbackPosters = [
  { id: 1, title: 'Street Fighter', image: 'https://image.tmdb.org/t/p/w500/4Zb4Z2HjX1q5QYv7NqYQY8gQ4mP.jpg', type: 'movie', rating: '8.4' },
  { id: 2, title: 'Spider-Man: Brand New Day', image: 'https://image.tmdb.org/t/p/w500/1Hq4A9wT7E7r5Y5F3pP7YQmGv1Y.jpg', type: 'movie' },
  { id: 3, title: 'Hope', image: 'https://image.tmdb.org/t/p/w500/6bB1f8aKq2p4wJ8gJY1F2V3s8yK.jpg', type: 'movie' },
  { id: 4, title: 'Whalefall', image: 'https://image.tmdb.org/t/p/w500/8mK2e0u7p4n1c9s5d3f6g2h1j0k.jpg', type: 'movie' },
]

async function getMovies() {
  const key = process.env.TMDB_API_KEY
  if (!key) return fallbackPosters
  try {
    const response = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${key}&language=en-US`, { next: { revalidate: 3600 } })
    if (!response.ok) return fallbackPosters
    const data = await response.json()
    const movies = (data.results ?? []).filter((item: any) => item.poster_path).slice(0, 16)
    return movies.map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      type: item.media_type === 'tv' ? 'tv' : 'movie',
      rating: item.vote_average ? item.vote_average.toFixed(1) : undefined,
      isNew: Math.random() > 0.72,
      update: item.media_type === 'tv' ? `Update to ${Math.max(2, Math.ceil(item.vote_average || 4))}` : undefined,
    }))
  } catch {
    return fallbackPosters
  }
}

export default async function Page() {
  const movies = await getMovies()
  return <StreamingApp movies={movies} />
}
