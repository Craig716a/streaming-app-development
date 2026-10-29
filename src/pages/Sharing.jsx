import { useState } from 'react';
import { Check, ChevronRight, Film, Heart, Play, Share2 } from 'lucide-react';
import PageHeading from '@/components/stream/PageHeading';

export default function Sharing() {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window === 'undefined' ? '' : window.location.origin;

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'RebelStream', text: 'Find your next favorite story.', url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <div className="page-wrap">
      <PageHeading eyebrow="Stories travel further" title="Sharing" />

      <section className="share-hero">
        <div className="share-orbit orbit-one" />
        <div className="share-orbit orbit-two" />
        <div className="share-copy">
          <span className="eyebrow">Pass the popcorn</span>
          <h2>
            Good taste
            <br />
            is better shared.
          </h2>
          <p>Send RebelStream to someone who always asks, “what should we watch?”</p>
          <button type="button" className="button-primary" onClick={share}>
            {copied ? <Check size={17} /> : <Share2 size={17} />}
            {copied ? 'Link copied' : 'Share RebelStream'}
          </button>
        </div>
        <div className="share-art">
          <span className="share-card card-back">
            <Film />
          </span>
          <span className="share-card card-front">
            <Play fill="currentColor" />
          </span>
          <span className="share-line">WORLDWIDE / 001</span>
        </div>
      </section>

      <section className="share-options">
        <h2>Choose how to share</h2>
        <button type="button" onClick={share} className="share-option">
          <span className="option-icon">
            <Share2 size={18} />
          </span>
          <span>
            <strong>Share a link</strong>
            <small>Invite someone to explore with you</small>
          </span>
          <ChevronRight size={18} />
        </button>
        <div className="share-option static">
          <span className="option-icon">
            <Heart size={18} />
          </span>
          <span>
            <strong>Share a favorite</strong>
            <small>Open a title and tap the heart to save it first</small>
          </span>
          <ChevronRight size={18} />
        </div>
      </section>
    </div>
  );
}