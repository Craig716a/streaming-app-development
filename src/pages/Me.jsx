import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Check, ChevronRight, CircleHelp, Clock3, Languages, Send, Share2, UserRound, X } from 'lucide-react';
import useLocalData from '@/hooks/useLocalData';
import EmptyState from '@/components/stream/EmptyState';
import MiniTitle from '@/components/stream/MiniTitle';

const languages = ['English', 'Español', 'Français', '日本語'];

export default function Me() {
  const navigate = useNavigate();
  const { favorites, setFavorites, history, setHistory, language, setLanguage } = useLocalData();
  const [panel, setPanel] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('panel') === 'history' ? 'history' : '';
  });
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const togglePanel = (name) => setPanel((current) => (current === name ? '' : name));

  return (
    <div className="profile-page">
      <section className="profile-top">
        <div className="profile-avatar">
          <UserRound size={35} />
        </div>
        <button type="button" className="vip-mini" onClick={() => togglePanel('vip')}>
          <span>VIP</span>
          <small>VIP has expired</small>
          <ChevronRight size={15} />
        </button>
      </section>

      <button type="button" className="vip-promo" onClick={() => togglePanel('vip')}>
        <span>
          <strong>Join VIP skip the ads</strong>
          <small>40%+ discount currently!</small>
        </span>
        <b>
          Subscribe <ChevronRight size={16} />
        </b>
      </button>

      <section className="profile-menu">
        <button type="button" className="profile-row" onClick={() => navigate('/sharing')}>
          <span className="menu-icon accent">
            <Share2 />
          </span>
          <span>
            <strong>Share</strong>
            <small>Tell someone about RebelStream</small>
          </span>
          <ChevronRight />
        </button>
        <button type="button" className="profile-row" onClick={() => togglePanel('language')}>
          <span className="menu-icon">
            <Languages />
          </span>
          <span>
            <strong>Language Switching</strong>
            <small>{language}</small>
          </span>
          <ChevronRight />
        </button>
        <button type="button" className="profile-row" onClick={() => togglePanel('history')}>
          <span className="menu-icon">
            <Clock3 />
          </span>
          <span>
            <strong>History</strong>
            <small>{history.length} titles recently opened</small>
          </span>
          <ChevronRight />
        </button>
        <button type="button" className="profile-row" onClick={() => togglePanel('favorites')}>
          <span className="menu-icon">
            <Bookmark />
          </span>
          <span>
            <strong>My favorites</strong>
            <small>{favorites.length} titles saved</small>
          </span>
          <ChevronRight />
        </button>
        <button type="button" className="profile-row" onClick={() => togglePanel('support')}>
          <span className="menu-icon">
            <CircleHelp />
          </span>
          <span>
            <strong>Feedback</strong>
            <small>Tell us what you think</small>
          </span>
          <ChevronRight />
        </button>
        <button type="button" className="profile-row" onClick={() => togglePanel('customer')}>
          <span className="menu-icon">
            <Send />
          </span>
          <span>
            <strong>Official customer service</strong>
            <small>Contact and support</small>
          </span>
          <ChevronRight />
        </button>
      </section>

      {panel === 'vip' ? (
        <section className="inline-panel vip-panel">
          <h2>VIP membership</h2>
          <p className="muted">Subscriptions are not open yet. Everything in RebelStream is free to explore while we finish the VIP tier.</p>
        </section>
      ) : null}

      {panel === 'language' ? (
        <section className="inline-panel">
          <h2>Choose your language</h2>
          {languages.map((label) => (
            <button type="button" className={`language-choice ${language === label ? 'chosen' : ''}`} onClick={() => setLanguage(label)} key={label}>
              {label}
              {language === label ? <Check size={16} /> : null}
            </button>
          ))}
        </section>
      ) : null}

      {panel === 'history' ? (
        <section className="inline-panel">
          <div className="panel-heading">
            <h2>Recently opened</h2>
            {history.length ? (
              <button type="button" className="text-button" onClick={() => setHistory([])}>
                Clear history
              </button>
            ) : null}
          </div>
          {history.length ? (
            <div className="mini-title-list">
              {history.map((item) => (
                <MiniTitle item={item} key={`${item.mediaType}-${item.id}`} />
              ))}
            </div>
          ) : (
            <EmptyState title="Your history is clear" copy="Titles you visit will appear here." />
          )}
        </section>
      ) : null}

      {panel === 'favorites' ? (
        <section className="inline-panel">
          <div className="panel-heading">
            <h2>My favorites</h2>
            {favorites.length ? (
              <button type="button" className="text-button" onClick={() => setFavorites([])}>
                Clear favorites
              </button>
            ) : null}
          </div>
          {favorites.length ? (
            <div className="mini-title-list">
              {favorites.map((item) => (
                <div className="favorite-list-row" key={`${item.mediaType}-${item.id}`}>
                  <MiniTitle item={item} />
                  <button
                    type="button"
                    className="remove-favorite"
                    onClick={() => setFavorites((current) => current.filter((entry) => !(entry.id === item.id && entry.mediaType === item.mediaType)))}
                    aria-label={`Remove ${item.title} from favorites`}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Save a story for later" copy="Tap the heart on a title to keep it here." />
          )}
        </section>
      ) : null}

      {panel === 'support' ? (
        <section className="inline-panel">
          <h2>Send us a note</h2>
          <p className="muted">Your note is kept on this device until you clear it.</p>
          <form
            className="feedback-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!message.trim()) return;
              setSent(true);
            }}
          >
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What would make discovery better?" aria-label="Feedback message" />
            <button type="submit" className="button-primary">
              <Send size={15} /> {sent ? 'Thanks — noted' : 'Send feedback'}
            </button>
          </form>
        </section>
      ) : null}

      {panel === 'customer' ? (
        <section className="inline-panel">
          <h2>Official customer service</h2>
          <p className="muted">Customer service contact is not configured yet. Use Feedback to leave a note for the team.</p>
          <button type="button" className="button-secondary" onClick={() => setPanel('support')}>
            Open feedback
          </button>
        </section>
      ) : null}
    </div>
  );
}