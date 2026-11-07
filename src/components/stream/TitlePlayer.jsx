import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TitlePlayer({ mediaType, id, seasonNumber = 1, episodeNumber = 1 }) {
  const navigate = useNavigate();
  const src = mediaType === 'tv'
    ? `https://embedmaster.link/tv/${id}/${seasonNumber}/${episodeNumber}?skin=onyx&welcome_page=on&autoplay=off`
    : `https://embedmaster.link/movie/${id}?skin=onyx&welcome_page=on&autoplay=off`;

  return (
    <section className="title-trailer title-player">
      <button type="button" className="title-player-back" onClick={() => navigate(-1)} aria-label="Go back">
        <ArrowLeft size={20} />
      </button>
      <iframe
        key={src}
        src={src}
        title="Title player"
          allow="autoplay *; fullscreen *; picture-in-picture *; encrypted-media *; payment *"
          allowFullScreen
          referrerPolicy="no-referrer"
      />
    </section>
  );
}
