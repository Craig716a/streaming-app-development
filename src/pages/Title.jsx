import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bookmark, CircleHelp, Share2 } from 'lucide-react';
import LoadingGrid from '@/components/stream/LoadingGrid';
import QueryError from '@/components/stream/QueryError';
import EmptyState from '@/components/stream/EmptyState';
import PosterCard from '@/components/stream/PosterCard';
import TitlePlayer from '@/components/stream/TitlePlayer';
import EpisodePicker from '@/components/stream/EpisodePicker';
import TitleProviders from '@/components/stream/TitleProviders';
import CastRow from '@/components/stream/CastRow';
import { useRecommendations, useSeason, useTitle, useTitleProviders } from '@/hooks/useTmdb';
import useLocalData from '@/hooks/useLocalData';
import useWatchProgress from '@/hooks/useWatchProgress';
import { yearOf } from '@/lib/media';

const toCard = (title) => ({
  id: title.id,
  mediaType: title.mediaType,
  title: title.title,
  overview: title.overview,
  posterPath: title.posterPath,
  backdropPath: title.backdropPath,
  voteAverage: title.voteAverage,
  releaseDate: title.releaseDate,
  genreIds: (title.genres || []).map((genre) => genre.id),
  originalLanguage: title.originalLanguage || '',
});

export default function Title() {
  const params = useParams();
  const mediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const id = Number(params.id);
  const validId = Number.isInteger(id) && id > 0;
  const navigate = useNavigate();

  const [seasonNumber, setSeasonNumber] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [track, setTrack] = useState('cinesrc');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [regionCode, setRegionCode] = useState('WW');

  const details = useTitle(mediaType, id, { enabled: validId });
  const title = details.data;
  const firstSeason = title?.seasons?.find((season) => season.seasonNumber > 0)?.seasonNumber || 1;
  const selectedSeason = title?.seasons?.some((season) => season.seasonNumber === seasonNumber) ? seasonNumber : firstSeason;

  const season = useSeason('tv', id, selectedSeason, { enabled: mediaType === 'tv' && validId });
  const providers = useTitleProviders(mediaType, id, { enabled: validId });
  const recommendations = useRecommendations(mediaType, id, { enabled: validId });
  const { favorites, toggleFavorite, addHistory } = useLocalData();
  const { progress } = useWatchProgress(mediaType, id);

  useEffect(() => {
    if (!progress) return;
    if (mediaType === 'tv') {
      if (progress.seasonNumber) setSeasonNumber(progress.seasonNumber);
      if (progress.episodeNumber) setSelectedEpisode(progress.episodeNumber);
    }
  }, [mediaType, progress?.seasonNumber, progress?.episodeNumber]);

  useEffect(() => {
    if (!title) return;
    addHistory(toCard(title));
  }, [title?.id, mediaType]);

  if (!validId) {
    return (
      <div className="page-wrap">
        <EmptyState title="Title unavailable" copy="This title link is not valid." />
      </div>
    );
  }

  if (details.isLoading) {
    return (
      <div className="title-page title-loading">
        <div className="hero-skeleton" />
        <div className="page-wrap">
          <LoadingGrid count={6} />
        </div>
      </div>
    );
  }

  if (details.isError || !title) {
    return (
      <div className="page-wrap">
        <QueryError retry={details.refetch} />
      </div>
    );
  }

  const favorite = favorites.some((item) => item.id === title.id && item.mediaType === title.mediaType);
  const activePlayer = track;
  const play = (episodeNumber = selectedEpisode) =>
    navigate(`/player/${mediaType}/${id}/${selectedSeason}/${episodeNumber}?player=${activePlayer}`);

  const shareTitle = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: title.title, text: `Watch ${title.title} on RebelStream`, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <div className="title-page title-detail-page">
      <TitlePlayer mediaType={mediaType} id={id} seasonNumber={selectedSeason} episodeNumber={selectedEpisode} player={activePlayer} />

      <div className="title-detail-body">
        <div className="title-intro-label">
          <span>{mediaType === 'tv' ? 'TV SERIES' : 'MOVIE'}</span>
        </div>
        <h1 className="title-detail-name">
          {title.title}
          {mediaType === 'tv' ? <span> - Season {selectedSeason}</span> : null}
        </h1>
        <p className="title-detail-meta">
          {yearOf(title.releaseDate)} <i /> TMDb {title.id} <i /> {title.genres.map((genre) => genre.name).join('/') || (mediaType === 'tv' ? 'Series' : 'Movie')}
        </p>

        <div className="title-quick-actions">
          <button type="button" className={favorite ? 'quick-action selected' : 'quick-action'} onClick={() => toggleFavorite(toCard(title))}>
            <Bookmark size={19} fill={favorite ? 'currentColor' : 'none'} />
            <span>Favorite</span>
          </button>
          <button type="button" className="quick-action" onClick={() => setFeedbackOpen((open) => !open)}>
            <CircleHelp size={19} />
            <span>Feedback</span>
          </button>
          <button type="button" className="quick-action" onClick={shareTitle}>
            <Share2 size={19} />
            <span>Share</span>
          </button>
        </div>

        {feedbackOpen ? (
          <form
            className="title-feedback"
            onSubmit={(event) => {
              event.preventDefault();
              if (!feedback.trim()) return;
              setFeedbackSent(true);
              setFeedback('');
            }}
          >
            <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Tell us what you think…" aria-label="Title feedback" />
            <button type="submit" className="button-secondary">
              {feedbackSent ? 'Sent' : 'Send feedback'}
            </button>
          </form>
        ) : null}

        <div className="audio-track-row">
          <span>Servers</span>
          <div className="track-switch">
            {[
              { value: 'cinesrc', label: 'Server 1' },
              { value: 'vidspeed', label: 'Server 2' },
              { value: 'vidspark', label: 'Server 3' },
            ].map(({ value, label }) => (
              <button key={value} type="button" className={track === value ? 'selected' : ''} onClick={() => setTrack(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {mediaType === 'tv' ? (
          <EpisodePicker
            seasons={title.seasons || []}
            season={season}
            seasonNumber={selectedSeason}
            onSeasonChange={(value) => {
              setSeasonNumber(value);
              setSelectedEpisode(1);
            }}
            selectedEpisode={selectedEpisode}
            onSelectEpisode={setSelectedEpisode}
            onPlay={play}
          />
        ) : null}

        <section className="similar-section title-more-like">
          <div className="section-toolbar">
            <h2>More Like This</h2>
          </div>
          {recommendations.isLoading ? (
            <LoadingGrid count={6} />
          ) : recommendations.isError ? (
            <QueryError retry={recommendations.refetch} />
          ) : (
            <div className="horizontal-posters title-similar-row">
              {(recommendations.data?.results || [])
                .filter((item) => !(item.id === id && item.mediaType === mediaType))
                .slice(0, 8)
                .map((item) => (
                  <PosterCard key={`${item.mediaType}-${item.id}`} item={item} />
                ))}
            </div>
          )}
        </section>

        <TitleProviders regions={providers.data} loading={providers.isLoading} regionCode={regionCode} onRegionChange={setRegionCode} />

        <CastRow cast={title.cast} />
      </div>
    </div>
  );
}
