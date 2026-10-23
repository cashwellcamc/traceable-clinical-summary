import type { PatientRecord } from './types';

export const mockPatient: PatientRecord = {
  patientId: 'MRN-00482913',
  patientName: 'John E. Doe',
  dob: '1958-03-14',
  summary: {
    generatedAt: '2026-09-08T08:15:00Z',
    modelVersion: 'ClinicalAI v2.1',
    segments: [
      {
        kind: 'cited',
        content:
          'Patient is a 68-year-old male with a history of Type 2 Diabetes Mellitus managed with metformin 1000 mg twice daily',
        sourceId: 'med-list-2026',
      },
      { kind: 'text', content: '. ' },
      {
        kind: 'cited',
        content:
          'His most recent HbA1c was 7.4%, representing improved glycemic control compared to prior readings',
        sourceId: 'progress-note-aug',
      },
      { kind: 'text', content: '. ' },
      {
        kind: 'cited',
        content:
          'He was hospitalized in July 2026 for an acute exacerbation of heart failure, requiring IV diuresis and optimization of his carvedilol dose to 25 mg twice daily',
        sourceId: 'discharge-summary-jul',
      },
      { kind: 'text', content: '. ' },
      {
        kind: 'cited',
        content:
          'Follow-up echocardiography confirmed an ejection fraction of 42%, consistent with mildly reduced systolic function',
        sourceId: 'echo-report-aug',
      },
      { kind: 'text', content: '. ' },
      {
        kind: 'cited',
        content:
          'Current medication reconciliation reflects no known drug allergies and no active contraindications to current regimen',
        sourceId: 'med-list-2026',
      },
      { kind: 'text', content: '.' },
    ],
  },
  sources: [
    {
      id: 'progress-note-aug',
      label: 'Progress Note',
      date: '2026-08-22',
      author: 'Dr. Sarah Chen, MD',
      excerpt:
        'Patient presents for routine diabetes follow-up. HbA1c returned at 7.4%, down from 8.1% six months ago. Patient reports improved dietary adherence and has been walking 30 minutes daily. Continue current metformin regimen. Next labs in 3 months.',
    },
    {
      id: 'discharge-summary-jul',
      label: 'Discharge Summary',
      date: '2026-07-14',
      author: 'Dr. Marcus Webb, MD',
      excerpt:
        'Patient admitted 07/08/2026 with acute decompensated heart failure, presenting with dyspnea on exertion and bilateral lower extremity edema (2+). Treated with IV furosemide with significant clinical improvement. Carvedilol uptitrated from 12.5 mg to 25 mg BID. Discharged on 07/14/2026 in stable condition with cardiology follow-up in 2 weeks.',
    },
    {
      id: 'echo-report-aug',
      label: 'Echocardiography Report',
      date: '2026-08-05',
      author: 'Dr. Priya Nair, MD (Cardiology)',
      excerpt:
        'Transthoracic echocardiogram performed on 08/05/2026. Left ventricular ejection fraction estimated at 42% (mildly reduced; prior study July 2026 EF 38%). Mild mitral regurgitation. No significant pericardial effusion. Findings suggest partial recovery of systolic function since last hospitalization.',
    },
    {
      id: 'med-list-2026',
      label: 'Medication Reconciliation',
      date: '2026-09-01',
      author: 'Clinical Pharmacy, Riverside Regional Medical Center',
      excerpt:
        'Active medications as of 09/01/2026: Metformin HCl 1000 mg PO BID, Carvedilol 25 mg PO BID, Lisinopril 10 mg PO daily, Atorvastatin 40 mg PO nightly, Furosemide 40 mg PO daily. Allergies: NKDA (No Known Drug Allergies). No contraindications identified in current formulary review.',
    },
  ],
  reviewStatus: { state: 'unreviewed' },
};
