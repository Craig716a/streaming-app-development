import { vidlyMovieUrl, vidlyTvUrl } from '@/lib/vidly';

export default function TitlePlayer({ mediaType, id, seasonNumber = 1, episodeNumber = 1 }) {
  const src = mediaType === 'tv' ? vidlyTvUrl(id, seasonNumber, episodeNumber) : vidlyMovieUrl(id);

  return (
    <section className="title-trailer title-player">
      <iframe
        key={src}
        src={src}
        title="Title player"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="origin"
      />
    </section>
  );
}