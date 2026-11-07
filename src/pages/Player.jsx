import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Video } from 'lucide-react';
import { useSeason, useTitle } from '@/hooks/useTmdb';
import useWatchProgress from '@/hooks/useWatchProgress';
import { trackEvent } from '@/lib/analytics';

export default function Player() {
  const params = useParams();
  const mediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const id = Number(params.id);
  const seasonNumber = Number(params.season) || 1;
  const episodeNumber = Number(params.episode) || 1;

  const { progress, saveProgress } = useWatchProgress(mediaType, id);

  useEffect(() => {
    saveProgress({ seasonNumber, episodeNumber, seconds: progress?.seconds || 0 });
  }, [episodeNumber, mediaType, id, seasonNumber]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin.includes('embedmaster.link')) return;
      const payload = typeof event.data === 'string' ? (() => { try { return JSON.parse(event.data); } catch { return null; } })() : event.data;
      const seconds = Number(payload?.currentTime ?? payload?.position ?? payload?.seconds);
      if (Number.isFinite(seconds) && seconds >= 0) {
        saveProgress({ seasonNumber, episodeNumber, seconds });
        trackEvent({ eventType: 'progress', titleId: id, mediaType, seasonNumber, episodeNumber, seconds });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [episodeNumber, saveProgress, seasonNumber]);

  const details = useTitle(mediaType, id, { enabled: Number.isFinite(id) && id > 0 });
  const title = details.data;
  useEffect(() => {
    if (title) trackEvent({ eventType: 'watch', titleId: id, titleName: title.title || title.name, mediaType, seasonNumber, episodeNumber });
  }, [episodeNumber, id, mediaType, seasonNumber, title?.title, title?.name]);
  const season = useSeason('tv', id, seasonNumber, { enabled: mediaType === 'tv' && Number.isFinite(id) && id > 0 });
  const episode = season.data?.episodes?.find((entry) => entry.episodeNumber === episodeNumber);
  const embedUrl = mediaType === 'tv'
    ? `https://embedmaster.link/tv/${id}/${seasonNumber}/${episodeNumber}?skin=onyx&welcome_page=on&autoplay=off`
    : `https://embedmaster.link/movie/${id}?skin=onyx&welcome_page=on&autoplay=off`;
  const resumeStart = Number(progress?.seconds) > 0 && progress?.seasonNumber === seasonNumber && progress?.episodeNumber === episodeNumber ? `&start=${Math.floor(progress.seconds)}` : '';
  const playbackUrl = `${embedUrl}${resumeStart}`;

  return (
    <div className="player-page">
      <div className="player-top">
        <Link to={`/title/${mediaType}/${id}`} className="player-back">
          <ArrowLeft size={18} /> Back to title
        </Link>
        <span>REBELSTREAM / PLAYER</span>
      </div>

      <div className="player-frame">
        <iframe
          key={playbackUrl}
          src={playbackUrl}
          title={`${title?.title || 'Title'} player`}
          allow="autoplay *; fullscreen *; picture-in-picture *; encrypted-media *; payment *"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="player-caption">
        <div>
          <span className="eyebrow">{mediaType === 'tv' ? `SEASON ${seasonNumber} · EPISODE ${episodeNumber}` : 'FEATURE'}</span>
          <h1>{episode?.name || title?.title || 'Loading…'}</h1>
          <p>
            {title?.title}
          </p>
        </div>

        <div className="player-notice">
          <Video size={16} />
          <span>
            Playback is delivered by Embedmaster in a sandboxed player.
          </span>
        </div>
      </div>
    </div>
  );
}
