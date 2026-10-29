import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { vidlyMovieUrl, vidlyTvUrl } from '@/lib/vidly';

export default function TitlePlayer({ mediaType, id, seasonNumber = 1, episodeNumber = 1 }) {
  const navigate = useNavigate();
  const src = mediaType === 'tv' ? vidlyTvUrl(id, seasonNumber, episodeNumber) : vidlyMovieUrl(id);

  return (
    <section className="title-trailer title-player">
      <button type="button" className="title-player-back" onClick={() => navigate(-1)} aria-label="Go back">
        <ArrowLeft size={20} />
      </button>
      <iframe
        key={src}
        src={src}
        title="Title player"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          referrerPolicy="origin"
      />
    </section>
  );
}
