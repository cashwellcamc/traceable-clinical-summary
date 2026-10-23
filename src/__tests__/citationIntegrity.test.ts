import { describe, it, expect } from 'vitest';
import { mockPatient } from '../mockData';

describe('citation integrity', () => {
  const sourceIds = new Set(mockPatient.sources.map((s) => s.id));
  const citedSegments = mockPatient.summary.segments.filter((s) => s.kind === 'cited');
  const citedIds = new Set(citedSegments.map((s) => s.sourceId));

  it('every citation resolves to an existing source document', () => {
    for (const seg of citedSegments) {
      expect(sourceIds.has(seg.sourceId), `sourceId "${seg.sourceId}" not found in sources`).toBe(true);
    }
  });

  it('every source document is cited at least once', () => {
    for (const source of mockPatient.sources) {
      expect(citedIds.has(source.id), `source "${source.id}" (${source.label}) is never cited`).toBe(true);
    }
  });
});
