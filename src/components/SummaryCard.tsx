import { useState } from 'react';
import type { AISummary, SourceDocument, SummarySegment } from '../types';
import SourceCitation from './SourceCitation';

interface Props {
  summary: AISummary;
  sources: SourceDocument[];
}

export default function SummaryCard({ summary, sources }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const sourceIndex = Object.fromEntries(sources.map((s, i) => [s.id, i + 1]));

  const toggleSource = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const scrollToSource = (id: string) => {
    setExpandedIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      document.getElementById(`source-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      (document.getElementById(`source-${id}`)?.querySelector('button') as HTMLElement | null)?.focus();
    }, 50);
  };

  const renderSegment = (seg: SummarySegment, i: number) => {
    if (seg.kind === 'text') {
      return <span key={i}>{seg.content}</span>;
    }
    const num = sourceIndex[seg.sourceId];
    const sourceLabel = sources.find((s) => s.id === seg.sourceId)?.label ?? 'Unknown source';
    return (
      <span key={i} className="cited-span">
        {seg.content}
        <button
          className="citation-btn"
          onClick={() => scrollToSource(seg.sourceId)}
          aria-label={`Source ${num}: ${sourceLabel}`}
        >
          <sup aria-hidden="true">[{num}]</sup>
        </button>
      </span>
    );
  };

  const generatedDate = new Date(summary.generatedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <section className="summary-card" aria-labelledby="ai-summary-heading">
      <header className="summary-card__header">
        <div className="ai-badge" id="ai-summary-heading" role="heading" aria-level={3}>
          <svg
            className="ai-badge__icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>AI-Generated Summary</span>
        </div>
        <div className="summary-card__meta">
          <span className="summary-card__model">{summary.modelVersion}</span>
          <time className="summary-card__date" dateTime={summary.generatedAt}>
            Generated {generatedDate}
          </time>
        </div>
      </header>

      <div className="summary-card__warning" role="alert" aria-live="polite">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>
          This summary is AI-generated and <strong>must be verified</strong> against source documents before
          clinical use.
        </span>
      </div>

      <div className="summary-card__body">
        <p className="summary-text" lang="en">
          {summary.segments.map((seg, i) => renderSegment(seg, i))}
        </p>
      </div>

      <div className="sources-section">
        <h3 className="sources-section__heading" id="sources-heading">
          Source Documents
          <span className="sources-section__count">{sources.length}</span>
        </h3>
        <ul className="sources-list" aria-labelledby="sources-heading" role="list">
          {sources.map((doc) => (
            <SourceCitation
              key={doc.id}
              doc={doc}
              index={sourceIndex[doc.id]}
              isExpanded={expandedIds.has(doc.id)}
              onToggle={toggleSource}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
