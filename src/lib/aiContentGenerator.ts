import { GoogleGenAI } from '@google/genai';

export interface AIGenerationParams {
  keyword: string;
  brand: string;
  brandVoice: string;
  geography: string;
  audience: string;
  contentType: string;
  tone: string;
  cta: string;
  length: string;
}

export interface AIGeneratedContent {
  title: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  notes: string;
  platform: string;
  contentType: string;
  riskFlags: string[];
  sourceMode: "user_keyword_only";
  disclaimer: string;
}

export async function generateContent(params: AIGenerationParams): Promise<AIGeneratedContent> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI generation is not configured yet. Missing VITE_GEMINI_API_KEY.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Generate content based ONLY on the following parameters.
- Use only the user-provided keyword and brand profile.
- Do not claim live trend data.
- Do not claim search volume.
- Do not claim LinkedIn analytics.
- Do not invent statistics.
- Do not promise guaranteed results.
- Match the selected brand voice.
- Write practical, clear, publishable content.

Parameters:
Keyword: ${params.keyword}
Brand: ${params.brand}
Brand Voice: ${params.brandVoice}
Geography: ${params.geography}
Audience: ${params.audience}
Content Type: ${params.contentType}
Tone: ${params.tone}
CTA: ${params.cta}
Length: ${params.length}

Respond ONLY with a valid JSON object matching this schema:
{
  "title": "string",
  "hook": "string",
  "body": "string",
  "cta": "string",
  "hashtags": ["string"],
  "notes": "string",
  "platform": "string",
  "contentType": "string",
  "riskFlags": ["string"],
  "sourceMode": "user_keyword_only",
  "disclaimer": "string"
}
`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return parseAIResponse(text);
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    throw new Error(error.message || 'AI generation failed');
  }
}

export function parseAIResponse(text: string): AIGeneratedContent {
    try {
        return JSON.parse(text) as AIGeneratedContent;
    } catch (e) {
        // Attempt one safe repair
        try {
            const repaired = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(repaired) as AIGeneratedContent;
        } catch (repairError) {
            throw new Error("Invalid JSON returned from AI");
        }
    }
}

export function normalizeHashtags(hashtags: string[] | string): string {
    if (!hashtags) return '';
    if (Array.isArray(hashtags)) {
        return hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
    }
    return hashtags.split(' ').map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
}

export function formatCopiedContent(title: string, hook: string, body: string, cta: string, hashtags: string): string {
    return `Title: ${title}\n\nHook: ${hook}\n\nBody: ${body}\n\nCTA: ${cta}\n\nHashtags: ${hashtags}`;
}
