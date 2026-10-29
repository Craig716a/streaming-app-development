import PosterCard from '@/components/stream/PosterCard';
import EmptyState from '@/components/stream/EmptyState';

export default function PosterGrid({
  items = [],
  favorites,
  toggleFavorite,
  emptyTitle = 'Nothing here yet',
  emptyCopy = 'Try changing your filters.',
  className = 'poster-grid',
  ranked = true,
}) {
  if (!items.length) return <EmptyState title={emptyTitle} copy={emptyCopy} />;
  return (
    <div className={className}>
      {items.map((item, index) => (
        <PosterCard
          key={`${item.mediaType}-${item.id}`}
          item={item}
          rank={ranked && index < 10 ? index + 1 : undefined}
          favorite={favorites?.some((entry) => entry.id === item.id && entry.mediaType === item.mediaType)}
          onFavorite={
            toggleFavorite ? () => toggleFavorite(item) : undefined
          }
        />
      ))}
    </div>
  );
}