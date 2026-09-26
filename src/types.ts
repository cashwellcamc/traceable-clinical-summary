export interface SourceDocument {
  id: string;
  label: string;
  date: string;
  author: string;
  excerpt: string;
}

export interface CitationSpan {
  text: string;
  sourceId: string;
}

export type SummarySegment =
  | { kind: 'text'; content: string }
  | { kind: 'cited'; content: string; sourceId: string };

export interface AISummary {
  segments: SummarySegment[];
  generatedAt: string;
  modelVersion: string;
}

export type ReviewStatus =
  | { state: 'unreviewed' }
  | { state: 'reviewed'; reviewerName: string; reviewerRole: string; reviewedAt: string };

export interface PatientRecord {
  patientId: string;
  patientName: string;
  dob: string;
  summary: AISummary;
  sources: SourceDocument[];
  reviewStatus: ReviewStatus;
}
