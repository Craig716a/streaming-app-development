import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TitlePlayer({ mediaType, id, seasonNumber = 1, episodeNumber = 1, player = 'vidspark' }) {
  const navigate = useNavigate();
  const src = player === 'yapgrid'
    ? mediaType === 'tv'
      ? `https://yapgrid.com/embed/tv/${id}/${seasonNumber}/${episodeNumber}?autoplay=1`
      : `https://yapgrid.com/embed/movie/${id}?autoplay=1`
    : player === 'server3'
      ? mediaType === 'tv'
        ? `https://viduki.net/1/tv/${id}/${seasonNumber}/${episodeNumber}?color=DC2626`
        : `https://viduki.net/1/movie/${id}?color=DC2626`
      : mediaType === 'tv'
        ? `https://vidspark.to/tv/${id}/${seasonNumber}/${episodeNumber}`
        : `https://vidspark.to/movie/${id}`;

  return (
    <section className="title-trailer title-player">
      <button type="button" className="title-player-back" onClick={() => navigate(-1)} aria-label="Go back">
        <ArrowLeft size={20} />
      </button>
      <iframe
        key={src}
        src={src}
        title="Title player"
          allow="encrypted-media; autoplay *; fullscreen *"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          referrerPolicy="no-referrer"
      />
    </section>
  );
}
