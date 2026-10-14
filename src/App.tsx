import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { mockPatient } from './mockData';
import type { AISummary, ReviewStatus } from './types';
import SummaryCard from './components/SummaryCard';
import ReviewStatusBadge from './components/ReviewStatusBadge';
import './App.css';

const SYSTEM_PROMPT = `You are a clinical AI assistant. Given source documents from a patient's medical record, generate a concise clinical summary.

Return ONLY a JSON object — no markdown, no explanation — with this exact structure:
{
  "segments": [
    { "kind": "cited", "content": "...", "sourceId": "..." },
    { "kind": "text", "content": ". " }
  ]
}

Rules:
- Every factual claim must be a "cited" segment with the sourceId of the supporting document
- Use "kind": "text" segments only for punctuation/connectors (". ", ", ", " and ", etc.)
- sourceId must exactly match one of the provided document IDs
- Do not fabricate any information not found in the source documents
- Be concise and clinically precise`;

type SummaryState =
  | { status: 'loading' }
  | { status: 'success'; summary: AISummary }
  | { status: 'error'; message: string };

export default function App() {
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(mockPatient.reviewStatus);
  const [summaryState, setSummaryState] = useState<SummaryState>({ status: 'loading' });

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    if (!apiKey) {
      setSummaryState({ status: 'success', summary: mockPatient.summary });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const sourceContext = mockPatient.sources
      .map((s) => `Document ID: ${s.id}\nType: ${s.label}\nDate: ${s.date}\nAuthor: ${s.author}\nContent:\n${s.excerpt}`)
      .join('\n\n---\n\n');

    model
      .generateContent(`Patient: ${mockPatient.patientName}\n\nSource documents:\n\n${sourceContext}\n\nGenerate a clinical summary JSON.`)
      .then((result) => {
        const parsed = JSON.parse(result.response.text());
        setSummaryState({
          status: 'success',
          summary: { segments: parsed.segments, generatedAt: new Date().toISOString(), modelVersion: 'gemini-3.6-flash' },
        });
      })
      .catch(() => {
        setSummaryState({ status: 'success', summary: mockPatient.summary });
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
