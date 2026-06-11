export type Brand = 'ApexHRM' | 'CV Pro' | '1BT';

export type KeywordStatus = 'New' | 'Shortlisted' | 'Used' | 'Rejected';

export interface Keyword {
  id: string;
  text: string;
  brand: Brand | '';
  geography: string;
  audience: string;
  intent: string;
  status: KeywordStatus;
  notes: string;
  dateAdded: string;
}

export type ContentStatus = 'Draft' | 'Needs Review' | 'Approved' | 'Scheduled' | 'Published Manually' | 'Copied for Posting' | 'Archived' | 'Rejected';

export type ContentType = 'LinkedIn Post' | 'SEO Article' | 'Google Ad Copy' | 'LinkedIn Ad Copy' | 'Podcast Script' | 'YouTube Shorts Script' | 'TikTok/Reels Script' | 'Email Newsletter';

export interface ContentItem {
  id: string;
  title: string;
  brand: Brand | '';
  keywordId?: string;
  type: ContentType | string;
  tone: string;
  cta: string;
  length: string;
  hook?: string;
  body: string;
  hashtags: string;
  notes: string;
  status: ContentStatus;
  createdDate: string;
  updatedAt?: string;
  platform: string;
  manualUrl?: string;
  plannedDate?: string;
  geography?: string;
  audience?: string;
  sourceMode?: "user_keyword_only";
  aiModel?: string;
}

export interface Connector {
  id: string;
  name: string;
  status: 'Disconnected' | 'Manual Export' | 'Manual Import' | 'Access Pending' | 'Live' | 'Error';
  description: string;
  lastSync?: string;
  direction?: 'Import' | 'Export' | 'Two-way';
  mode?: 'Manual' | 'Auto';
  notes?: string;
}

export interface BrandSettingsData {
  id: Brand;
  website: string;
  ctas: string;
  voice: string;
  audience: string;
  forbidden: string;
}
