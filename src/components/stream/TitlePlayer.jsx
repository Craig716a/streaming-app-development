import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TitlePlayer({ mediaType, id, seasonNumber = 1, episodeNumber = 1, player = 'cinesrc' }) {
  const navigate = useNavigate();
  const src = player === 'cinesrc'
    ? mediaType === 'tv'
      ? `https://cinesrc.st/embed/tv/${id}?s=${seasonNumber}&e=${episodeNumber}`
      : `https://cinesrc.st/embed/movie/${id}`
    : player === 'vidspeed'
      ? mediaType === 'tv'
        ? `https://vidspeed.sbs/embed/tv/${id}/${seasonNumber}/${episodeNumber}`
        : `https://vidspeed.sbs/embed/movie/${id}`
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
          allow={player === 'cinesrc' ? 'autoplay; fullscreen; picture-in-picture' : 'encrypted-media; autoplay *; fullscreen *'}
          allowFullScreen
          sandbox={player === 'vidspeed' ? undefined : 'allow-scripts allow-same-origin allow-forms allow-presentation'}
          referrerPolicy="no-referrer"
      />
    </section>
  );
}
