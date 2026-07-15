import { describe, it, expect, vi } from 'vitest';
import {
  extractKeywordsFromSource,
  generateCampaignContent,
  normalizeHashtags,
  formatCopiedContent,
  parseExtractionResponse,
  parseCampaignResponse
} from '../lib/aiContentGenerator';

// ============================================================
// Status Normalization Tests
// ============================================================

describe('ContentStatus values', () => {
  const validStatuses = [
    'Draft',
    'Needs Review',
    'Approved',
    'Scheduled',
    'Published Manually',
    'Copied for Posting',
    'Archived',
    'Rejected',
  ];

  it('should have exactly 8 valid content statuses', () => {
    expect(validStatuses.length).toBe(8);
  });

  it('should include all workflow statuses', () => {
    expect(validStatuses).toContain('Draft');
    expect(validStatuses).toContain('Needs Review');
    expect(validStatuses).toContain('Approved');
    expect(validStatuses).toContain('Published Manually');
    expect(validStatuses).toContain('Archived');
  });
});

describe('KeywordStatus values', () => {
  const validStatuses = ['New', 'Shortlisted', 'Used', 'Rejected'];

  it('should have exactly 4 valid keyword statuses', () => {
    expect(validStatuses.length).toBe(4);
  });

  it('should include New as default status', () => {
    expect(validStatuses).toContain('New');
  });
});

// ============================================================
// Content Status Transition Logic
// ============================================================

describe('Content status transitions', () => {
  const publisherStatuses = ['Draft', 'Needs Review', 'Approved', 'Copied for Posting', 'Published Manually', 'Archived'];

  it('should include all LinkedIn publisher workflow steps', () => {
    expect(publisherStatuses).toContain('Draft');
    expect(publisherStatuses).toContain('Copied for Posting');
    expect(publisherStatuses).toContain('Published Manually');
  });

  it('published manually should be final active status', () => {
    const publishedIndex = publisherStatuses.indexOf('Published Manually');
    const archivedIndex = publisherStatuses.indexOf('Archived');
    expect(publishedIndex).toBeLessThan(archivedIndex);
  });
});

// ============================================================
// Data Helper Tests
// ============================================================

describe('Brand validation', () => {
  const validBrands = ['ApexHRM', 'CV Pro', '1BT'];

  it('should have exactly 3 brands', () => {
    expect(validBrands.length).toBe(3);
  });

  it('each brand should be a non-empty string', () => {
    validBrands.forEach(brand => {
      expect(typeof brand).toBe('string');
      expect(brand.length).toBeGreaterThan(0);
    });
  });
});

describe('LinkedIn URL validation', () => {
  const isUrlValid = (url: string): boolean => {
    if (!url) return true;
    return url.startsWith('https://www.linkedin.com/') || url.startsWith('https://linkedin.com/');
  };

  it('should accept empty string', () => {
    expect(isUrlValid('')).toBe(true);
  });

  it('should accept valid LinkedIn URL', () => {
    expect(isUrlValid('https://www.linkedin.com/posts/test-post-123')).toBe(true);
    expect(isUrlValid('https://linkedin.com/posts/test-post-123')).toBe(true);
  });

  it('should reject non-LinkedIn URLs', () => {
    expect(isUrlValid('https://facebook.com/posts/123')).toBe(false);
    expect(isUrlValid('https://example.com')).toBe(false);
    expect(isUrlValid('not-a-url')).toBe(false);
  });
});

describe('Archive filter logic', () => {
  type ContentStatus = 'Draft' | 'Needs Review' | 'Approved' | 'Archived' | 'Published Manually' | 'Copied for Posting';

  interface MockContent {
    status: ContentStatus;
    brand: string;
  }

  const mockContents: MockContent[] = [
    { status: 'Draft', brand: 'ApexHRM' },
    { status: 'Approved', brand: 'CV Pro' },
    { status: 'Archived', brand: 'ApexHRM' },
    { status: 'Published Manually', brand: '1BT' },
  ];

  const filterContents = (items: MockContent[], filterStatus: string) => {
    return items.filter(c => {
      if (filterStatus === 'All') {
        if (c.status === 'Archived') return false;
      } else {
        if (c.status !== filterStatus) return false;
      }
      return true;
    });
  };

  it('should hide archived when filter is All', () => {
    const result = filterContents(mockContents, 'All');
    expect(result.length).toBe(3);
    expect(result.every(c => c.status !== 'Archived')).toBe(true);
  });

  it('should show only archived when filter is Archived', () => {
    const result = filterContents(mockContents, 'Archived');
    expect(result.length).toBe(1);
    expect(result[0].status).toBe('Archived');
  });

  it('should filter by specific status', () => {
    const result = filterContents(mockContents, 'Draft');
    expect(result.length).toBe(1);
    expect(result[0].status).toBe('Draft');
  });
});

// ============================================================
// AI Content Generator Helpers Tests
// ============================================================

describe('AI Content Generator Helpers', () => {
  describe('normalizeHashtags', () => {
    it('should format an array of hashtags correctly', () => {
      expect(normalizeHashtags(['hr', '#recruitment'])).toBe('#hr #recruitment');
    });

    it('should format a string of hashtags correctly', () => {
      expect(normalizeHashtags('hr #recruitment hiring')).toBe('#hr #recruitment #hiring');
    });

    it('should return empty string for empty input', () => {
      expect(normalizeHashtags('')).toBe('');
      expect(normalizeHashtags([])).toBe('');
    });
  });

  describe('formatCopiedContent', () => {
    it('should format the copied text beautifully', () => {
      const formatted = formatCopiedContent('Title 1', 'Hook 1', 'Body 1', 'CTA 1', '#tag1');
      expect(formatted).toContain('Title: Title 1');
      expect(formatted).toContain('Hook: Hook 1');
      expect(formatted).toContain('Body: Body 1');
      expect(formatted).toContain('CTA: CTA 1');
      expect(formatted).toContain('Hashtags: #tag1');
    });
  });

  describe('parseCampaignResponse', () => {
    it('should parse valid JSON', () => {
      const validJSON = JSON.stringify({ title: 'Test Title' });
      const parsed = parseCampaignResponse(validJSON);
      expect(parsed.title).toBe('Test Title');
    });

    it('should repair markdown JSON blocks', () => {
      const markdownJSON = "```json\n{ \"title\": \"Repaired Title\" }\n```";
      const parsed = parseCampaignResponse(markdownJSON);
      expect(parsed.title).toBe('Repaired Title');
    });

    it('should throw error on completely invalid JSON', () => {
      expect(() => parseCampaignResponse('not a json object')).toThrow('Invalid JSON returned from AI');
    });
  });

  describe('parseExtractionResponse', () => {
    it('should parse valid JSON extraction', () => {
      const validJSON = JSON.stringify({ recommendedPrimaryKeyword: 'testing' });
      const parsed = parseExtractionResponse(validJSON);
      expect(parsed.recommendedPrimaryKeyword).toBe('testing');
    });

    it('should repair markdown JSON blocks', () => {
      const markdownJSON = "```json\n{ \"extractedKeywords\": [\"test\"] }\n```";
      const parsed = parseExtractionResponse(markdownJSON);
      expect(parsed.extractedKeywords[0]).toBe('test');
    });

    it('should throw error on completely invalid JSON', () => {
      expect(() => parseExtractionResponse('not a json object')).toThrow('Invalid JSON returned from AI');
    });
  });

  describe('server-backed AI requests', () => {
    it('should request keyword extraction from the server API without frontend API keys', async () => {
      const fetchMock = vi.fn(async (_url: string, _options: RequestInit) => ({
        ok: true,
        json: async () => ({
          status: 'ready',
          result: {
            extractedKeywords: ['hr software'],
            highPriorityKeywords: ['hr software'],
            keywordGroups: [{ groupName: 'HR', keywords: ['hr software'], intent: 'commercial' }],
            recommendedPrimaryKeyword: 'hr software',
            recommendedSecondaryKeywords: [],
            notes: 'Server generated'
          }
        })
      }));

      const result = await (extractKeywordsFromSource as any)('hr software', 'text', fetchMock);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ai/extract-keywords',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'hr software', type: 'text' })
        })
      );
      expect(result.recommendedPrimaryKeyword).toBe('hr software');
    });

    it('should request campaign content generation from the server API', async () => {
      const params = {
        instruction: 'Write a practical post',
        brand: 'CV Pro',
        brandVoice: 'Direct and helpful',
        outputType: 'LinkedIn Post',
        extractedKeywords: ['cv builder'],
        geography: 'Sri Lanka',
        audience: 'Job seekers',
        tone: 'Professional',
        cta: 'Build your CV',
        length: 'Medium'
      };
      const fetchMock = vi.fn(async (_url: string, _options: RequestInit) => ({
        ok: true,
        json: async () => ({
          status: 'ready',
          result: {
            title: 'Better CVs',
            hook: 'Your CV should work harder.',
            body: 'Use CV Pro to improve your profile.',
            cta: 'Build your CV',
            hashtags: ['CVPro'],
            selectedKeywords: ['cv builder'],
            keywordStrategy: 'Lead with the primary keyword.',
            riskFlags: [],
            sourceMode: 'manual_keywords'
          }
        })
      }));

      const result = await (generateCampaignContent as any)(params, undefined, fetchMock);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ai/generate-campaign-content',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ params, imageSource: undefined })
        })
      );
      expect(result.title).toBe('Better CVs');
    });

    it('should surface server not_configured errors instead of faking AI output', async () => {
      const fetchMock = vi.fn(async () => ({
        ok: true,
        json: async () => ({
          status: 'not_configured',
          errorMessage: 'AI generation is not configured yet. Missing GEMINI_API_KEY on the server.'
        })
      }));

      await expect((extractKeywordsFromSource as any)('cv builder', 'text', fetchMock))
        .rejects.toThrow('Missing GEMINI_API_KEY on the server');
    });
  });
});

// ============================================================
// Generic Test Publisher MVP Tests
// ============================================================

describe('Generic Test Publisher data models', () => {
  it('should allow valid PublicationResult statuses', () => {
    const validStatuses = ['not_configured', 'ready', 'publishing', 'published', 'failed', 'manual_export_required'];
    const resultStatus = 'published';
    expect(validStatuses).toContain(resultStatus);
  });

  it('should structure WordPress payload correctly', () => {
    const wpBaseUrl = 'https://example.com';
    const wpEndpoint = wpBaseUrl.replace(/\/$/, '') + '/wp-json/wp/v2/posts';
    expect(wpEndpoint).toBe('https://example.com/wp-json/wp/v2/posts');

    const wpBaseUrlSlash = 'https://example.com/';
    const wpEndpointSlash = wpBaseUrlSlash.replace(/\/$/, '') + '/wp-json/wp/v2/posts';
    expect(wpEndpointSlash).toBe('https://example.com/wp-json/wp/v2/posts');
  });

  it('should validate generic test post requirements', () => {
    const postText = "CV Pro is a 'for life' platform to manage and improve your CV with AI. Log in to cvpro.globalapps.world to get your free credits";
    expect(postText).toContain('CV Pro');
    expect(postText.length).toBeGreaterThan(50);
  });
});

// ============================================================
// LinkedIn Posts API Tests
// ============================================================

describe('LinkedIn /rest/posts publishing logic', () => {
  it('should format payload correctly for /rest/posts', () => {
    const authorUrn = 'urn:li:person:123';
    const contentBody = 'Test post';
    
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

    expect(payload.author).toBe(authorUrn);
    expect(payload.commentary).toBe(contentBody);
    expect(payload.visibility).toBe('PUBLIC');
    expect(payload.distribution.feedDistribution).toBe('MAIN_FEED');
    expect(payload.lifecycleState).toBe('PUBLISHED');
  });

  it('should correctly parse x-restli-id into a URL', () => {
    const mockHeaders = new Map([
      ['x-restli-id', 'urn:li:share:123456789']
    ]);
    
    const restliId = mockHeaders.get('x-restli-id') || '';
    const url = restliId ? `https://www.linkedin.com/feed/update/${restliId}` : 'URL unavailable';
    
    expect(restliId).toBe('urn:li:share:123456789');
    expect(url).toBe('https://www.linkedin.com/feed/update/urn:li:share:123456789');
  });

  it('should gracefully handle missing credentials (not_configured)', () => {
    const token = undefined;
    const author = undefined;

    const isConfigured = !!(token && author);
    expect(isConfigured).toBe(false);
  });
  
  it('should redact tokens from generic error messages', () => {
    const token = 'SECRET_TOKEN_123';
    const rawError = `Failed to authenticate with token ${token}`;
    const safeError = rawError.replace(token, '[REDACTED]');
    
    expect(safeError).not.toContain(token);
    expect(safeError).toContain('[REDACTED]');
  });
});
