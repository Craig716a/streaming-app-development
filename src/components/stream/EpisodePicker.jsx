import { ChevronDown, ChevronRight, Play } from 'lucide-react';
import EmptyState from '@/components/stream/EmptyState';
import LoadingGrid from '@/components/stream/LoadingGrid';
import QueryError from '@/components/stream/QueryError';

export default function EpisodePicker({ seasons = [], season, seasonNumber, onSeasonChange, selectedEpisode, onSelectEpisode, onPlay }) {
  const episodeCount = season.data
    ? Math.max(season.data.episodeCount, ...season.data.episodes.map((entry) => entry.episodeNumber), 0)
    : 0;
  const episode = season.data?.episodes?.find((entry) => entry.episodeNumber === selectedEpisode);

  return (
    <section className="episode-picker">
      <div className="episode-picker-head">
        <label className="season-picker">
          <select value={seasonNumber} onChange={(event) => onSeasonChange(Number(event.target.value))} aria-label="Select season">
            {seasons
              .filter((entry) => entry.seasonNumber > 0)
              .map((entry) => (
                <option key={entry.id} value={entry.seasonNumber}>
                  {`Season ${entry.seasonNumber}`}
                </option>
              ))}
          </select>
          <ChevronDown size={14} />
        </label>
        {episodeCount > 0 ? (
          <span className="update-count">
            Update to {episodeCount} <ChevronRight size={14} />
          </span>
        ) : null}
      </div>

      {season.isLoading ? (
        <LoadingGrid count={6} />
      ) : season.isError ? (
        <QueryError retry={season.refetch} />
      ) : season.data?.episodes?.length ? (
        <div className="episode-number-grid" aria-label="Episodes; swipe horizontally to see more">
          {season.data.episodes.map((entry) => (
            <button
              type="button"
              className={selectedEpisode === entry.episodeNumber ? 'episode-number-button selected' : 'episode-number-button'}
              key={entry.id}
              onClick={() => onSelectEpisode(entry.episodeNumber)}
              aria-label={`Episode ${entry.episodeNumber}: ${entry.name}`}
            >
              {entry.episodeNumber}
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="No episodes listed" copy="Episode details will appear when available." />
      )}

      {episode ? (
        <div className="selected-episode-detail">
          <strong>
            {episode.episodeNumber}. {episode.name}
          </strong>
          <button type="button" className="episode-detail-play" onClick={() => onPlay(selectedEpisode)}>
            <Play size={12} fill="currentColor" /> Play
          </button>
          <span>{episode.runtime ? `${episode.runtime} min` : `Season ${seasonNumber}`} {episode.airDate ? `· ${episode.airDate}` : ''}</span>
        </div>
      ) : null}
    </section>
  );
}
