import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Video } from 'lucide-react';
import QueryError from '@/components/stream/QueryError';
import { useAnimeLookup, useSeason, useTitle } from '@/hooks/useTmdb';
import { isAnimeTitle } from '@/lib/media';
import { absoluteEpisodeNumber, vidlyAnimeUrl, vidlyMovieUrl, vidlyTvUrl } from '@/lib/vidly';
import useWatchProgress from '@/hooks/useWatchProgress';

export default function Player() {
  const params = useParams();
  const mediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const id = Number(params.id);
  const seasonNumber = Number(params.season) || 1;
  const episodeNumber = Number(params.episode) || 1;

  const [searchParams, setSearchParams] = useSearchParams();
  const track = searchParams.get('track') === 'dub' ? 'dub' : 'sub';
  const [source, setSource] = useState('auto');
  const { progress, saveProgress } = useWatchProgress(mediaType, id);

  useEffect(() => {
    saveProgress({ seasonNumber, episodeNumber, seconds: progress?.seconds || 0 });
  }, [episodeNumber, mediaType, id, seasonNumber]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin.includes('vidly.pro')) return;
      const payload = typeof event.data === 'string' ? (() => { try { return JSON.parse(event.data); } catch { return null; } })() : event.data;
      const seconds = Number(payload?.currentTime ?? payload?.position ?? payload?.seconds);
      if (Number.isFinite(seconds) && seconds >= 0) saveProgress({ seasonNumber, episodeNumber, seconds });
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [episodeNumber, saveProgress, seasonNumber]);

  const details = useTitle(mediaType, id, { enabled: Number.isFinite(id) && id > 0 });
  const title = details.data;
  const anime = isAnimeTitle(title);
  const animeLookup = useAnimeLookup(title?.title, Boolean(title) && anime);
  const season = useSeason('tv', id, seasonNumber, { enabled: mediaType === 'tv' && Number.isFinite(id) && id > 0 });
  const episode = season.data?.episodes?.find((entry) => entry.episodeNumber === episodeNumber);

  const malId = animeLookup.data?.malId;
  const sourceMode = source === 'auto' ? (anime && malId ? 'anime' : 'standard') : source;
  const absoluteEpisode = absoluteEpisodeNumber(title?.seasons || [], seasonNumber, episodeNumber);

  const embedUrl =
    sourceMode === 'anime' && malId
      ? vidlyAnimeUrl(malId, absoluteEpisode, track)
      : mediaType === 'tv'
        ? vidlyTvUrl(id, seasonNumber, episodeNumber)
        : vidlyMovieUrl(id);

  const needsAnimeLookup = anime && animeLookup.isLoading && source === 'auto';
  const resumeStart = Number(progress?.seconds) > 0 && progress?.seasonNumber === seasonNumber && progress?.episodeNumber === episodeNumber ? `?start=${Math.floor(progress.seconds)}` : '';
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
        {details.isLoading || needsAnimeLookup ? (
          <div className="player-loading">
            <div className="player-play">
              <Play size={26} fill="currentColor" />
            </div>
            <span className="eyebrow">{needsAnimeLookup ? 'FINDING ANIME SOURCE' : 'LOADING TITLE'}</span>
          </div>
        ) : details.isError ? (
          <div className="player-empty">
            <QueryError retry={details.refetch} />
          </div>
        ) : (
          <iframe
            key={playbackUrl}
            src={playbackUrl}
            title={`${title?.title || 'Title'} player`}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      <div className="player-caption">
        <div>
          <span className="eyebrow">{mediaType === 'tv' ? `SEASON ${seasonNumber} · EPISODE ${episodeNumber}` : 'FEATURE'}</span>
          <h1>{episode?.name || title?.title || 'Loading…'}</h1>
          <p>
            {title?.title}
            {sourceMode === 'anime' && malId ? ` · Anime source · ${track === 'dub' ? 'Dub' : 'Sub'}` : ''}
          </p>

          <div className="source-switch">
            {anime ? (
              <>
                <button type="button" className={sourceMode === 'anime' ? 'button-primary' : 'button-secondary'} onClick={() => setSource('anime')} disabled={!malId}>
                  Anime source
                </button>
                <button type="button" className={sourceMode === 'standard' ? 'button-primary' : 'button-secondary'} onClick={() => setSource('standard')}>
                  Standard source
                </button>
                <button
                  type="button"
                  className={track === 'sub' ? 'button-primary' : 'button-secondary'}
                  onClick={() => setSearchParams({ track: 'sub' })}
                >
                  Sub
                </button>
                <button
                  type="button"
                  className={track === 'dub' ? 'button-primary' : 'button-secondary'}
                  onClick={() => setSearchParams({ track: 'dub' })}
                >
                  Dub
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="player-notice">
          <Video size={16} />
          <span>
            Playback is delivered by Vidly. If a source stalls, switch to the other source or open the title again.
            {anime && !malId && !animeLookup.isLoading ? ' No matching anime entry was found for this title, so the standard source is used.' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
