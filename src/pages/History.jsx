import { ArrowLeft, Clock3, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useLocalData from '@/hooks/useLocalData';
import EmptyState from '@/components/stream/EmptyState';
import MiniTitle from '@/components/stream/MiniTitle';

export default function History() {
  const navigate = useNavigate();
  const { history, setHistory } = useLocalData();

  return (
    <main className="history-page">
      <header className="history-header">
        <button type="button" className="icon-button" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={21} />
        </button>
        <div className="history-heading"><div className="history-heading-icon"><Clock3 size={18} /></div><div><p className="eyebrow">Your activity</p><h1>Watch history</h1></div></div>
        {history.length ? <button type="button" className="history-clear" onClick={() => setHistory([])}><Trash2 size={15} /> Clear</button> : <span className="history-spacer" />}
      </header>
      <p className="history-summary">{history.length ? `${history.length} ${history.length === 1 ? 'title' : 'titles'} watched recently` : 'Movies and series you open will appear here.'}</p>
      {history.length ? <div className="history-list">{history.map((item) => <MiniTitle item={item} key={`${item.mediaType}-${item.id}`} />)}</div> : <EmptyState title="Your history is clear" copy="Start watching something and it will show up here." />}
    </main>
  );
}
