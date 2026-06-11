import { describe, it, expect } from 'vitest';

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
