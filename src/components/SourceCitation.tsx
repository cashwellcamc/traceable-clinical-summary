import { useRef, useEffect } from 'react';
import type { SourceDocument } from '../types';

interface Props {
  doc: SourceDocument;
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export default function SourceCitation({ doc, index, isExpanded, onToggle }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isExpanded]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(doc.id);
    }
  };

  return (
    <li
      id={`source-${doc.id}`}
      className={`source-item ${isExpanded ? 'source-item--expanded' : ''}`}
    >
      <button
        className="source-item__header"
        aria-expanded={isExpanded}
        aria-controls={`source-content-${doc.id}`}
        onClick={() => onToggle(doc.id)}
        onKeyDown={handleKeyDown}
      >
        <span className="source-item__num" aria-hidden="true">[{index}]</span>
        <span className="source-item__label">{doc.label}</span>
        <span className="source-item__author">{doc.author}</span>
        <time className="source-item__date" dateTime={doc.date}>
          {new Date(doc.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </time>
        <span className="source-item__chevron" aria-hidden="true">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      <div
        id={`source-content-${doc.id}`}
        ref={contentRef}
        className="source-item__content"
        hidden={!isExpanded}
        role="region"
        aria-label={`Excerpt from ${doc.label} by ${doc.author}`}
      >
        <blockquote className="source-item__excerpt">{doc.excerpt}</blockquote>
      </div>
    </li>
  );
}
