import { useState, useEffect } from 'react';
import { mockPatient } from './mockData';
import type { AISummary, ReviewStatus } from './types';
import SummaryCard from './components/SummaryCard';
import ReviewStatusBadge from './components/ReviewStatusBadge';
import './App.css';

type SummaryState =
  | { status: 'loading' }
  | { status: 'success'; summary: AISummary }
  | { status: 'error'; message: string };

export default function App() {
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(mockPatient.reviewStatus);
  const [summaryState, setSummaryState] = useState<SummaryState>({ status: 'loading' });

  useEffect(() => {
    fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: mockPatient.patientName,
        sources: mockPatient.sources,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (res.status === 429) {
            setSummaryState({ status: 'success', summary: mockPatient.summary });
            return null;
          }
          throw new Error(body.error ?? `Server error ${res.status}`);
        }
        return res.json();
      })
      .then((summary: AISummary | null) => {
        if (summary) setSummaryState({ status: 'success', summary });
      })
      .catch((err) => setSummaryState({ status: 'error', message: err.message }));
  }, []);

  const dob = new Date(mockPatient.dob).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="app-header" role="banner">
        <div className="app-header__icon" aria-hidden="true">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div className="app-header__title">
          <h1>Clinical Data Viewer</h1>
          <span className="app-header__subtitle">Federal Health System — EHR Prototype</span>
        </div>
      </header>

      <main id="main-content" className="app-main" role="main">
        <div className="patient-header" role="region" aria-label="Patient identification">
          <div className="patient-header__info">
            <h2 className="patient-header__name">{mockPatient.patientName}</h2>
            <dl className="patient-header__meta">
              <div>
                <dt>DOB</dt>
                <dd>
                  <time dateTime={mockPatient.dob}>{dob}</time>
                </dd>
              </div>
              <div>
                <dt>Patient ID</dt>
                <dd>{mockPatient.patientId}</dd>
              </div>
            </dl>
          </div>
          <ReviewStatusBadge status={reviewStatus} onStatusChange={setReviewStatus} />
        </div>

        {summaryState.status === 'loading' && (
          <div className="summary-loading" role="status" aria-live="polite">
            <span>Generating AI summary…</span>
          </div>
        )}

        {summaryState.status === 'error' && (
          <div className="summary-error" role="alert">
            <strong>Failed to generate summary:</strong> {summaryState.message}
          </div>
        )}

        {summaryState.status === 'success' && (
          <SummaryCard summary={summaryState.summary} sources={mockPatient.sources} />
        )}
      </main>

      <footer className="app-footer" role="contentinfo">
        <p>
          <strong>Prototype only.</strong> Not for clinical use. Patient data is fictional.
        </p>
      </footer>
    </div>
  );
}
