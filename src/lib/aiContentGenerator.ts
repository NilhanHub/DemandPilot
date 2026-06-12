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

interface AiApiResponse<T> {
  status: 'ready' | 'not_configured' | 'failed';
  result?: T;
  errorMessage?: string;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<{
  ok: boolean;
  status?: number;
  json: () => Promise<AiApiResponse<unknown>>;
}>;

async function postAiRequest<T>(path: string, body: unknown, fetchImpl: FetchLike = fetch): Promise<T> {
  const response = await fetchImpl(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`AI server request failed with HTTP ${response.status || 'error'}.`);
  }

  const data = await response.json() as AiApiResponse<T>;
  if (data.status !== 'ready' || !data.result) {
    throw new Error(data.errorMessage || 'AI generation failed on the server.');
  }

  return data.result;
}

export async function extractKeywordsFromSource(
  source: string,
  type: 'image' | 'text',
  fetchImpl?: FetchLike
): Promise<ExtractionResponse> {
  return postAiRequest<ExtractionResponse>('/api/ai/extract-keywords', { source, type }, fetchImpl);
}

export async function generateCampaignContent(
  params: CampaignContentParams,
  imageSource?: string,
  fetchImpl?: FetchLike
): Promise<CampaignContentResponse> {
  return postAiRequest<CampaignContentResponse>(
    '/api/ai/generate-campaign-content',
    { params, imageSource },
    fetchImpl
  );
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
