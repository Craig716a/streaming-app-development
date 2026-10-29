'use client'

import { useMemo, useState } from 'react'
import { Bookmark, Clock3, Folder, Gamepad2, Grid2X2, House, Menu, PlaySquare, Search, Share2, UserRound, WandSparkles, X } from 'lucide-react'

type Movie = { id: number; title: string; image: string; type: string; rating?: string; isNew?: boolean; update?: string }

const categories = ['All', 'Adventure', 'Romance', 'Horror', 'Crime', 'Animation', 'Science Fiction', 'Comedy', 'Music & Musical', 'Reality-TV', 'Documentary', 'Sport', 'War', 'Drama']
const years = ['All', '2026', '2025', '2024', '2023', '2022', '2021', '2020']
const episodes = Array.from({ length: 6 }, (_, index) => index + 1)

function posterMovie(index: number, movies: Movie[]): Movie {
  return movies[index % movies.length]
}

function Card({ movie, wide = false }: { movie: Movie; wide?: boolean }) {
  return (
    <article className={wide ? 'poster-card poster-card-wide' : 'poster-card'}>
      <a href={movie.type === 'tv' ? `https://vidly.pro/tv/${movie.id}/1/1` : `https://vidly.pro/movie/${movie.id}`} target="_blank" rel="noreferrer" className="poster-link">
        <div className="poster-image-wrap">
          <img src={movie.image} alt={movie.title} className="poster-image" />
          {movie.isNew && <span className="new-badge">New episode</span>}
          {movie.update && <span className="update-label">{movie.update}</span>}
          {movie.rating && !movie.update && <span className="rating-label">{movie.rating}</span>}
        </div>
        <p className="poster-title">{movie.title}</p>
      </a>
    </article>
  )
}

function BottomNav({ active, onChange }: { active: string; onChange: (value: string) => void }) {
  const items = [['home', House, 'Home'], ['streaming', PlaySquare, 'Streaming'], ['categories', Folder, 'Categories'], ['promotion', Gamepad2, 'Promotion'], ['me', UserRound, 'Me']] as const
  return <nav className="bottom-nav">{items.map(([id, Icon, label]) => <button key={id} className={active === id ? 'nav-item active' : 'nav-item'} onClick={() => onChange(id)}><Icon /><span>{label}</span></button>)}</nav>
}

export default function StreamingApp({ movies }: { movies: Movie[] }) {
  const [active, setActive] = useState('home')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [episodePage, setEpisodePage] = useState(0)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [showPlayer, setShowPlayer] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const filtered = useMemo(() => search ? movies.filter((movie) => movie.title.toLowerCase().includes(search.toLowerCase())) : movies, [movies, search])
  const items = filtered.length ? filtered : movies
  const related = items.slice(0, 8)

  if (showPlayer) return <main className="player-page"><button className="back-button" onClick={() => setShowPlayer(false)}><X /></button><iframe className="vidly-frame" src={`https://vidly.pro/tv/1399/1/${selectedEpisode}`} title="Vidly player" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="origin" /></main>

  return <main className="app-shell">
    {active === 'categories' ? <section className="screen categories-screen">
      <header className="page-header"><h1>Categories</h1><button className="icon-button" onClick={() => setShowSearch(true)} aria-label="Search"><Search /></button></header>
      <div className="segmented"><button className="selected">Movies</button><button>TV Shows</button></div>
      <div className="chip-scroller">{categories.map((item) => <button key={item} className={category === item ? 'chip selected' : 'chip'} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="chip-scroller year-scroller">{years.map((item) => <button key={item} className={item === 'All' ? 'chip selected' : 'chip'}>{item}</button>)}</div>
      <div className="segmented sort"><button className="selected">Popularity</button><button>Latest</button><button>Top today</button></div>
      <div className="poster-grid poster-grid-four">{items.slice(0, 12).map((movie, index) => <Card movie={movie} key={`${movie.id}-${index}`} />)}</div>
    </section> : active === 'me' ? <section className="screen me-screen"><div className="profile-avatar"><UserRound /></div><div className="vip-card"><div><strong>VIP</strong><span>VIP has expired</span></div><h2>Join VIP and enjoy ad-free viewing of all videos</h2><p>40%+ discount currently!</p><button>Subscribe</button></div><div className="account-list">{[['Share', Share2], ['Language Switching', Menu], ['History', Clock3], ['My Favorites', Bookmark], ['Feedback', WandSparkles]].map(([label, Icon]) => <button key={label as string}><Icon /><span>{label as string}</span><span className="chevron">›</span></button>)}</div></section> : active === 'streaming' ? <section className="screen streaming-screen"><h1>Streaming</h1><div className="top-tabs"><span className="active">Hot Chart</span><span>Soaring List</span><span>New List</span><span>Hot Search</span></div><div className="segmented"><button className="selected">All</button><button>Movies</button><button>Series</button></div><div className="poster-grid poster-grid-four">{items.slice(0, 16).map((movie, index) => <Card movie={movie} key={`${movie.id}-${index}`} />)}</div></section> : <section className="screen home-screen">
      <header className="search-header">{showSearch ? <div className="search-input-wrap"><Search /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search movies and series" /><button onClick={() => { setShowSearch(false); setSearch('') }}><X /></button></div> : <><button className="search-input-wrap fake" onClick={() => setShowSearch(true)}><Search /><span>{search || 'Black Clover - Season 5'}</span></button><button className="icon-button"><Clock3 /></button></>}</header>
      <div className="genre-tabs"><strong>Recommend</strong><span>Reality-TV</span><span>Movies</span><span>TV Shows</span></div>
      <section className="recommend-strip"><h2>Recommend</h2><div className="poster-grid poster-grid-three">{related.slice(0, 3).map((movie, index) => <Card movie={movie} key={`recommend-${movie.id}-${index}`} />)}</div><div className="action-row"><button><Grid2X2 /> More Wonderful</button><button><Menu /> Change</button></div></section>
      <section className="content-section"><h2>{episodePage ? 'Today\'s New Streaming' : 'JUSTWATCH TOP 100'}</h2><div className="poster-grid poster-grid-three">{items.slice(episodePage ? 3 : 0, episodePage ? 12 : 9).map((movie, index) => <Card movie={movie} key={`content-${movie.id}-${index}`} />)}</div></section>
      <section className="episode-section"><div className="detail-heading"><div><span className="eyebrow">Series</span><h2>Black Clover - Season 5</h2><p>2026&nbsp; | &nbsp;Animation / Action / Fantasy</p></div><button onClick={() => setShowPlayer(true)} className="play-button"><PlaySquare /> Watch now</button></div><div className="language-row"><button>Original</button><button className="selected">Dub</button></div><div className="season-row"><button>Season 1⌄</button><span>Update to 8 ›</span></div><div className="episode-window" onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)} onTouchEnd={(event) => { if (touchStartX === null) return; const distance = event.changedTouches[0].clientX - touchStartX; if (Math.abs(distance) > 40) setEpisodePage(distance < 0 ? 1 : 0); setTouchStartX(null) }} onWheel={(event) => { if (event.deltaY > 0) setEpisodePage(1); else setEpisodePage(0) }}><div className="episode-track" style={{ transform: `translateX(-${episodePage * 100}%)` }}>{[0, 1].map((page) => <div className="episode-page" key={page}>{episodes.map((number) => <button className={selectedEpisode === number + page * 6 ? 'episode selected' : 'episode'} onClick={() => { setSelectedEpisode(number + page * 6); setShowPlayer(true) }} key={number + page * 6}>{number + page * 6}</button>)}</div>)}</div></div><p className="swipe-hint">Swipe right to see more episodes</p></section>
      <section className="content-section more-like"><h2>More Like This</h2><div className="poster-grid poster-grid-two">{related.slice(3, 8).map((movie, index) => <Card movie={movie} wide key={`more-${movie.id}-${index}`} />)}</div></section>
    </section>}
    {showSearch && active !== 'home' && <div className="search-overlay"><div className="search-input-wrap"><Search /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" /><button onClick={() => setShowSearch(false)}><X /></button></div></div>}
    <BottomNav active={active} onChange={setActive} />
  </main>
}
