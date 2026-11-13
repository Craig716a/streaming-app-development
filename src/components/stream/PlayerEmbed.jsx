import { useState } from 'react';

export default function PlayerEmbed({ src, title, mediaType }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const retry = () => {
    setFailed(false);
    setAttempt((value) => value + 1);
  };

  return (
    <div className="player-embed">
      {failed ? (
        <div className="player-embed-error" role="alert">
          <p>{mediaType === 'movie' ? 'Movie not found' : 'Episode not found'}</p>
          <button type="button" onClick={retry}>Try again</button>
        </div>
      ) : (
        <iframe
          key={`${src}-${attempt}`}
          src={src}
          title={title}
          allow="autoplay *; fullscreen *; picture-in-picture *; encrypted-media *; payment *"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
