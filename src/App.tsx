import { useState, useEffect } from 'react';
import { mockPatient } from './mockData';
import type { AISummary, ReviewStatus } from './types';
import SummaryCard from './components/SummaryCard';
import ReviewStatusBadge from './components/ReviewStatusBadge';
import './App.css';


type SummaryState =
  | { status: 'loading' }
  | { status: 'success'; summary: AISummary; mock?: boolean }
  | { status: 'error'; message: string };

export default function App() {
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(mockPatient.reviewStatus);
  const [summaryState, setSummaryState] = useState<SummaryState>({ status: 'loading' });
  const [reviewAnnouncement, setReviewAnnouncement] = useState('');

  const handleReviewChange = (status: ReviewStatus) => {
    setReviewStatus(status);
    setReviewAnnouncement(
      status.state === 'reviewed'
        ? `Summary marked as reviewed by ${(status as Extract<ReviewStatus, { state: 'reviewed' }>).reviewerName}`
        : 'Summary marked as unreviewed'
    );
  };

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL as string;

    fetch(apiUrl || 'https://traceable-clinical-summary.vercel.app/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: mockPatient.patientName,
        sources: mockPatient.sources,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((data: AISummary & { rateLimited?: boolean }) => {
        if (data.rateLimited) {
          setSummaryState({ status: 'success', summary: mockPatient.summary, mock: true });
        } else {
          setSummaryState({ status: 'success', summary: data });
        }
      })
      .catch(() => {
        setSummaryState({ status: 'success', summary: mockPatient.summary, mock: true });
      });
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
          <span className="app-header__subtitle">Clinical Data Viewer — Demo</span>
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
          <ReviewStatusBadge status={reviewStatus} onStatusChange={handleReviewChange} />
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

        {summaryState.status === 'success' && summaryState.mock && (
          <div className="ai-unavailable" role="note" aria-label="AI model status">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span><strong>Demo mode:</strong> Showing pre-generated example summary. AI model not connected.</span>
          </div>
        )}

        {summaryState.status === 'success' && (
          <SummaryCard summary={summaryState.summary} sources={mockPatient.sources} />
        )}
      </main>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {reviewAnnouncement}
      </div>

      <footer className="app-footer" role="contentinfo">
        <p>
          <strong>Prototype only.</strong> Not for clinical use. Patient data is fictional.
        </p>
      </footer>
    </div>
  );
}
