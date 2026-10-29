import { Film } from 'lucide-react';

export default function EmptyState({ title, copy, children }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Film />
      </span>
      <h3>{title}</h3>
      <p>{copy}</p>
      {children}
    </div>
  );
}