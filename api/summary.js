import { GoogleGenerativeAI } from '@google/generative-ai';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sources, patientName } = req.body;
  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return res.status(400).json({ error: 'sources array is required' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: 'application/json' },
  });

  const sourceContext = sources
    .map((s) => `Document ID: ${s.id}\nType: ${s.label}\nDate: ${s.date}\nAuthor: ${s.author}\nContent:\n${s.excerpt}`)
    .join('\n\n---\n\n');

  try {
    const result = await model.generateContent(
      `Patient: ${patientName}\n\nSource documents:\n\n${sourceContext}\n\nGenerate a clinical summary JSON.`
    );
    const parsed = JSON.parse(result.response.text());
    return res.status(200).json({
      segments: parsed.segments,
      generatedAt: new Date().toISOString(),
      modelVersion: 'gemini-3.6-flash',
    });
  } catch (err) {
    console.error('Gemini error:', err);
    if (err.status === 429) return res.status(200).json({ rateLimited: true });
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
