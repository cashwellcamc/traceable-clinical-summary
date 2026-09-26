import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

app.post('/api/summary', async (req, res) => {
  const { sources, patientName } = req.body;

  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return res.status(400).json({ error: 'sources array is required' });
  }

  const sourceContext = sources
    .map((s) => `Document ID: ${s.id}\nType: ${s.label}\nDate: ${s.date}\nAuthor: ${s.author}\nContent:\n${s.excerpt}`)
    .join('\n\n---\n\n');

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(
      `Patient: ${patientName}\n\nSource documents:\n\n${sourceContext}\n\nGenerate a clinical summary JSON.`
    );

    const parsed = JSON.parse(result.response.text());

    res.json({
      segments: parsed.segments,
      generatedAt: new Date().toISOString(),
      modelVersion: 'gemini-3.6-flash',
    });
  } catch (err) {
    console.error('Gemini API error:', err);
    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. The free tier allows 20 requests/day. Try again tomorrow or upgrade your API plan.' });
    }
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
