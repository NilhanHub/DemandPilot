import { GoogleGenAI } from '@google/genai';

export interface ExtractionResponse {
  extractedKeywords: string[];
  highPriorityKeywords: string[];
  keywordGroups: {
    groupName: string;
    keywords: string[];
    intent: string;
  }[];
  recommendedPrimaryKeyword: string;
  recommendedSecondaryKeywords: string[];
  notes: string;
}

export interface CampaignContentParams {
  instruction: string;
  brand: string;
  brandVoice: string;
  outputType: string;
  extractedKeywords: string[];
  // Advanced fields that might have default/inferred values
  geography: string;
  audience: string;
  tone: string;
  cta: string;
  length: string;
}

export interface CampaignContentResponse {
  title: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  selectedKeywords: string[];
  keywordStrategy: string;
  riskFlags: string[];
  sourceMode: "keyword_screenshot" | "keyword_csv" | "manual_keywords";
}

export async function extractKeywordsFromSource(source: string, type: 'image' | 'text'): Promise<ExtractionResponse> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    if (type === 'image') {
      throw new Error('Screenshot parsing not configured yet. Please paste keywords manually as a fallback.');
    }
    throw new Error('AI generation is not configured yet. Missing VITE_GEMINI_API_KEY.');
  }

  // Not implemented fully yet because we enforce throwing the error for now as per instructions.
  throw new Error('Not implemented: AI key found but implementation pending');
}

export async function generateCampaignContent(params: CampaignContentParams, imageSource?: string): Promise<CampaignContentResponse> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI generation is not configured yet. Missing VITE_GEMINI_API_KEY.');
  }

  // Not implemented fully yet because we enforce throwing the error for now as per instructions.
  throw new Error('Not implemented: AI key found but implementation pending');
}

export function parseExtractionResponse(text: string): ExtractionResponse {
  try {
      return JSON.parse(text) as ExtractionResponse;
  } catch (e) {
      try {
          const repaired = text.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(repaired) as ExtractionResponse;
      } catch (repairError) {
          throw new Error("Invalid JSON returned from AI extraction");
      }
  }
}

export function parseCampaignResponse(text: string): CampaignContentResponse {
    try {
        return JSON.parse(text) as CampaignContentResponse;
    } catch (e) {
        try {
            const repaired = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(repaired) as CampaignContentResponse;
        } catch (repairError) {
            throw new Error("Invalid JSON returned from AI content generation");
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
