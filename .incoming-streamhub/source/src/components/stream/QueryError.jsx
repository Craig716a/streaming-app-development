import { CircleHelp } from 'lucide-react';

export default function QueryError({ retry, title = 'Couldn’t load titles', copy = 'Check your connection and give it another try.' }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <CircleHelp />
      </span>
      <h3>{title}</h3>
      <p>{copy}</p>
      <button type="button" className="button-secondary" onClick={retry}>
        Try again
      </button>
    </div>
  );
}