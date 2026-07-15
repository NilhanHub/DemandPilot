import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to determine base URL safely
const getReqBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const aiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const extractionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    extractedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    highPriorityKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    keywordGroups: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          groupName: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          intent: { type: Type.STRING }
        },
        propertyOrdering: ['groupName', 'keywords', 'intent']
      }
    },
    recommendedPrimaryKeyword: { type: Type.STRING },
    recommendedSecondaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    notes: { type: Type.STRING }
  },
  propertyOrdering: [
    'extractedKeywords',
    'highPriorityKeywords',
    'keywordGroups',
    'recommendedPrimaryKeyword',
    'recommendedSecondaryKeywords',
    'notes'
  ]
};

const campaignContentResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    hook: { type: Type.STRING },
    body: { type: Type.STRING },
    cta: { type: Type.STRING },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
    selectedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    keywordStrategy: { type: Type.STRING },
    riskFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
    sourceMode: { type: Type.STRING }
  },
  propertyOrdering: [
    'title',
    'hook',
    'body',
    'cta',
    'hashtags',
    'selectedKeywords',
    'keywordStrategy',
    'riskFlags',
    'sourceMode'
  ]
};

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const parseStructuredJson = (text, context) => {
  try {
    return JSON.parse(text);
  } catch {
    const repaired = String(text || '').replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(repaired);
    } catch {
      throw new Error(`Invalid JSON returned from ${context}`);
    }
  }
};

const getResponseText = (response) => {
  if (typeof response.text === 'function') return response.text();
  return response.text;
};

const notConfigured = (res, errorMessage) => res.status(200).json({
  status: 'not_configured',
  errorMessage
});

// ==========================================
// SERVER-SIDE AI GENERATION
// ==========================================
app.post('/api/ai/extract-keywords', async (req, res) => {
  const { source, type } = req.body;

  if (type === 'image') {
    return res.status(200).json({
      status: 'failed',
      errorMessage: 'Screenshot parsing is not configured yet. Please paste keywords manually as a fallback.'
    });
  }

  if (!source || typeof source !== 'string' || source.trim().length === 0) {
    return res.status(400).json({
      status: 'failed',
      errorMessage: 'Keyword source text is required.'
    });
  }

  const ai = getAiClient();
  if (!ai) {
    return notConfigured(res, 'AI generation is not configured yet. Missing GEMINI_API_KEY on the server.');
  }

  try {
    const prompt = [
      'Extract and prioritize demand generation keywords from the user-provided source text.',
      'Use only the supplied source text. Do not invent search volume, analytics, or live trend data.',
      'Group related keywords and infer intent only from the wording.',
      '',
      `Source text:\n${source.trim()}`
    ].join('\n');

    const response = await ai.models.generateContent({
      model: aiModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: extractionResponseSchema
      }
    });

    return res.status(200).json({
      status: 'ready',
      result: parseStructuredJson(getResponseText(response), 'AI keyword extraction')
    });
  } catch (error) {
    return res.status(200).json({
      status: 'failed',
      errorMessage: `AI keyword extraction failed: ${error.message}`
    });
  }
});

app.post('/api/ai/generate-campaign-content', async (req, res) => {
  const { params } = req.body;

  if (!params || !Array.isArray(params.extractedKeywords) || params.extractedKeywords.length === 0) {
    return res.status(400).json({
      status: 'failed',
      errorMessage: 'At least one extracted keyword is required.'
    });
  }

  const ai = getAiClient();
  if (!ai) {
    return notConfigured(res, 'AI generation is not configured yet. Missing GEMINI_API_KEY on the server.');
  }

  try {
    const prompt = [
      'Create one structured campaign content draft for DemandPilot.',
      'Use only the supplied keywords, brand context, audience, and instruction.',
      'Do not claim live analytics, search volume, rankings, guaranteed jobs, or unsupported product facts.',
      'Return concise, practical copy that still requires human approval before publishing.',
      '',
      `Brand: ${params.brand}`,
      `Brand voice: ${params.brandVoice || 'Not provided'}`,
      `Output type: ${params.outputType}`,
      `Geography: ${params.geography || 'Not provided'}`,
      `Audience: ${params.audience || 'Not provided'}`,
      `Tone: ${params.tone || 'Professional'}`,
      `Length: ${params.length || 'Medium'}`,
      `CTA: ${params.cta || 'Not provided'}`,
      `Instruction: ${params.instruction || 'No extra instruction provided'}`,
      `Keywords: ${params.extractedKeywords.join(', ')}`
    ].join('\n');

    const response = await ai.models.generateContent({
      model: aiModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: campaignContentResponseSchema
      }
    });

    return res.status(200).json({
      status: 'ready',
      result: parseStructuredJson(getResponseText(response), 'AI campaign content generation')
    });
  } catch (error) {
    return res.status(200).json({
      status: 'failed',
      errorMessage: `AI campaign content generation failed: ${error.message}`
    });
  }
});

// ==========================================
// LINKEDIN PUBLISHING
// ==========================================
app.post('/api/publish/linkedin', async (req, res) => {
  const { contentBody, publishMode } = req.body;
  
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN;

  if (!token || !authorUrn) {
    return res.status(200).json({
      destination: 'linkedin',
      status: 'not_configured',
      errorMessage: 'LinkedIn API credentials (LINKEDIN_ACCESS_TOKEN, LINKEDIN_AUTHOR_URN) are missing in the server environment.',
    });
  }

  // Real API call logic
  try {
    // For Drafts, we might not want to actually post. LinkedIn doesn't have a "draft" state via API easily.
    // If publishMode === 'draft', we just simulate success if configured, or post privately. 
    // The prompt says "Do not fake posting success". If it's a draft, we can skip the real API or return 'not_configured' for drafts.
    // Actually, "draft for Draft/Test" is for WordPress. For LinkedIn, we can just say "LinkedIn doesn't support API drafts" or post with visibility: CONNECTIONS.
    // Let's just post it with appropriate visibility.
    
    if (publishMode === 'draft') {
       return res.status(200).json({
         destination: 'linkedin',
         status: 'failed',
         errorMessage: 'LinkedIn API does not support draft mode posting. Please select Publish Now.'
       });
    }

    const payload = {
      author: authorUrn,
      commentary: contentBody,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false
    };

    const apiVersion = process.env.LINKEDIN_API_VERSION || '202505';

    const response = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': apiVersion,
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(200).json({
        destination: 'linkedin',
        status: 'failed',
        errorMessage: `LinkedIn API error: ${response.status} ${errText}`
      });
    }

    const restliId = response.headers.get('x-restli-id') || '';
    // The response body might be empty for a successful 201 Created on the rest API.
    const url = restliId ? `https://www.linkedin.com/feed/update/${restliId}` : 'URL unavailable';

    return res.status(200).json({
      destination: 'linkedin',
      status: 'published',
      externalId: restliId,
      externalUrl: url,
      publishedAt: new Date().toISOString()
    });

  } catch (error) {
    return res.status(200).json({
      destination: 'linkedin',
      status: 'failed',
      errorMessage: `Server error: ${error.message}`
    });
  }
});

// ==========================================
// WORDPRESS PUBLISHING
// ==========================================
app.post('/api/publish/wordpress', async (req, res) => {
  const { contentBody, publishMode } = req.body;
  
  const wpBaseUrl = process.env.WORDPRESS_BASE_URL;
  const wpUsername = process.env.WORDPRESS_USERNAME;
  const wpPassword = process.env.WORDPRESS_APP_PASSWORD;

  if (!wpBaseUrl || !wpUsername || !wpPassword) {
    return res.status(200).json({
      destination: 'wordpress',
      status: 'not_configured',
      errorMessage: 'WordPress API credentials (WORDPRESS_BASE_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD) are missing in the server environment.',
    });
  }

  try {
    const wpStatus = publishMode === 'publish_now' ? 'publish' : 'draft';
    const authHeader = 'Basic ' + Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    
    // As per instruction: title can be "CV Pro — AI CV Platform for Life"
    const payload = {
      title: 'CV Pro — AI CV Platform for Life',
      content: contentBody,
      status: wpStatus
    };

    const wpEndpoint = wpBaseUrl.replace(/\/$/, '') + '/wp-json/wp/v2/posts';
    
    const response = await fetch(wpEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(200).json({
        destination: 'wordpress',
        status: 'failed',
        errorMessage: `WordPress API error: ${response.status} ${errText}`
      });
    }

    const data = await response.json();
    
    return res.status(200).json({
      destination: 'wordpress',
      status: wpStatus === 'publish' ? 'published' : 'ready', // 'ready' implies draft is ready
      externalId: String(data.id),
      externalUrl: data.link,
      publishedAt: new Date().toISOString()
    });

  } catch (error) {
    return res.status(200).json({
      destination: 'wordpress',
      status: 'failed',
      errorMessage: `Server error: ${error.message}`
    });
  }
});

// ==========================================
// X / TWITTER PUBLISHING
// ==========================================
app.post('/api/publish/x', async (req, res) => {
  const { contentBody, publishMode } = req.body;
  
  // X OAuth 2.0 or 1.0a is normally required to post tweets. 
  // Let's assume a Bearer token or appropriate tokens exist.
  // Actually, standard V2 posting requires user context (OAuth 1.0a or OAuth 2.0 user context).
  const bearerToken = process.env.X_BEARER_TOKEN;

  if (!bearerToken) {
    return res.status(200).json({
      destination: 'x',
      status: 'not_configured',
      errorMessage: 'X API credentials (X_BEARER_TOKEN) are missing in the server environment.',
    });
  }

  try {
    if (publishMode === 'draft') {
      return res.status(200).json({
        destination: 'x',
        status: 'failed',
        errorMessage: 'X API does not support draft mode. Please select Publish Now.'
      });
    }

    const payload = {
      text: contentBody
    };

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(200).json({
        destination: 'x',
        status: 'failed',
        errorMessage: `X API error: ${response.status} ${errText}`
      });
    }

    const data = await response.json();
    
    return res.status(200).json({
      destination: 'x',
      status: 'published',
      externalId: data.data.id,
      externalUrl: `https://x.com/user/status/${data.data.id}`,
      publishedAt: new Date().toISOString()
    });

  } catch (error) {
    return res.status(200).json({
      destination: 'x',
      status: 'failed',
      errorMessage: `Server error: ${error.message}`
    });
  }
});

app.listen(port, () => {
  console.log(`DemandPilot backend listening on port ${port}`);
});
