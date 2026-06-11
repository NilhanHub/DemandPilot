import React, { createContext, useContext, useState, useEffect } from 'react';
import { Keyword, ContentItem, Brand, Connector, BrandSettingsData } from '../types';
import { auth, db } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

interface AppContextState {
  keywords: Keyword[];
  addKeyword: (kw: Omit<Keyword, 'id' | 'dateAdded'>) => void;
  updateKeyword: (id: string, kw: Partial<Keyword>) => void;
  contents: ContentItem[];
  addContent: (content: Omit<ContentItem, 'id' | 'createdDate'>) => void;
  updateContent: (id: string, content: Partial<ContentItem>) => void;
  connectors: Connector[];
  updateConnector: (id: string, connector: Partial<Connector>) => void;
  brandSettings: BrandSettingsData[];
  updateBrandSettings: (id: Brand, settings: Partial<BrandSettingsData>) => void;
}

const defaultConnectors: Connector[] = [
  { id: 'firebase', name: 'Firebase', status: 'Live', description: 'Core application database, user authentication, and backend infrastructure.', direction: 'Two-way', mode: 'Auto', notes: 'Core dependency.' },
  { id: 'drive', name: 'Google Drive', status: 'Access Pending', description: 'Store generated content packs, article drafts, exports, evidence files, and campaign folders.', direction: 'Two-way', mode: 'Manual', notes: 'Requires OAuth.' },
  { id: 'sheets', name: 'Google Sheets', status: 'Access Pending', description: 'Import/export keyword lists, campaign calendars, performance reports, and manual trend data.', direction: 'Two-way', mode: 'Manual', notes: 'Requires OAuth.' },
  { id: 'docs', name: 'Google Docs', status: 'Access Pending', description: 'Create editable long-form article drafts, podcast scripts, and content briefs.', direction: 'Export', mode: 'Manual', notes: 'Requires OAuth.' },
  { id: 'gmail', name: 'Gmail', status: 'Access Pending', description: 'Future email newsletter drafts, approval notifications, and outreach copy workflows.', direction: 'Export', mode: 'Manual', notes: 'Requires OAuth.' },
  { id: 'calendar', name: 'Google Calendar', status: 'Access Pending', description: 'Future publishing calendar sync and campaign reminders.', direction: 'Two-way', mode: 'Manual', notes: 'Requires OAuth.' },
  { id: 'keep', name: 'Google Keep', status: 'Access Pending', description: 'Optional scratch-note export when Workspace API access is verified.', direction: 'Export', mode: 'Manual', notes: 'Workspace Admin Required.' },
  { id: 'linkedin', name: 'LinkedIn', status: 'Manual Export', description: 'Post directly to company or personal pages.', direction: 'Export', mode: 'Manual', notes: 'Standard workflow.' },
  { id: 'wordpress', name: 'WordPress', status: 'Disconnected', description: 'Publish articles to WordPress.', direction: 'Export', mode: 'Manual', notes: 'Requires webhook.' },
  { id: 'gsc', name: 'Google Search Console', status: 'Disconnected', description: 'Track search performance and queries.', direction: 'Import', mode: 'Manual', notes: 'Requires OAuth.' },
  { id: 'ga4', name: 'GA4', status: 'Disconnected', description: 'Website traffic tracking.', direction: 'Import', mode: 'Manual', notes: 'Requires property ID.' },
  { id: 'gads', name: 'Google Ads Keyword Planner', status: 'Disconnected', description: 'Search volume and CPC data.', direction: 'Import', mode: 'Manual', notes: 'Requires API access.' },
  { id: 'gtrends', name: 'Google Trends', status: 'Manual Import', description: 'Trend scoring and rising queries.', direction: 'Import', mode: 'Manual', notes: 'CSV / Manual input.' },
  { id: 'youtube', name: 'YouTube', status: 'Disconnected', description: 'Video descriptions and short uploads.', direction: 'Two-way', mode: 'Manual', notes: 'Requires OAuth.' },
  { id: 'meta', name: 'Meta/Facebook/Instagram', status: 'Disconnected', description: 'Social publishing and ad copy.', direction: 'Export', mode: 'Manual', notes: 'Requires Business access.' },
  { id: 'tiktok', name: 'TikTok', status: 'Disconnected', description: 'Short-form video publishing.', direction: 'Export', mode: 'Manual', notes: 'Requires Ads API access.' }
];

const defaultBrandSettings: BrandSettingsData[] = [
  {
    id: 'ApexHRM',
    website: 'https://apexhrm.com/',
    ctas: 'Contact ApexHRM, visit website, book consultation',
    voice: 'Professional, practical, authority-building, Sri Lankan business context.',
    audience: 'CEOs, HR managers, hiring managers, senior candidates.',
    forbidden: 'Fake hiring statistics, exaggerated promises.'
  },
  {
    id: 'CV Pro',
    website: 'https://cvpro.globalapps.world/',
    ctas: 'Build your CV, improve your CV, get more interview calls.',
    voice: 'Direct, friendly, encouraging, practical.',
    audience: 'Job seekers, graduates, mid-career professionals.',
    forbidden: 'Guaranteed jobs, fake success claims.'
  },
  {
    id: '1BT',
    website: 'https://1billiontech.com/',
    ctas: 'Book consultation, discuss support, explore AI apps.',
    voice: 'Expert, clear, enterprise-safe, practical.',
    audience: 'CEOs, IT heads, operations heads, Dynamics 365 users.',
    forbidden: 'Unsupported Microsoft claims, exaggerated security claims.'
  }
];

const AppContext = createContext<AppContextState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>(defaultConnectors);
  const [brandSettings, setBrandSettings] = useState<BrandSettingsData[]>(defaultBrandSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 4) setLoading(false);
    };

    const unsubKeywords = onSnapshot(collection(db, `users/${user.uid}/keywords`), (snap) => {
      setKeywords(snap.docs.map(d => d.data() as Keyword));
      checkLoaded();
    }, (err) => {
      console.error(err);
      checkLoaded();
    });

    const unsubContents = onSnapshot(collection(db, `users/${user.uid}/contents`), (snap) => {
      setContents(snap.docs.map(d => d.data() as ContentItem));
      checkLoaded();
    }, (err) => {
      console.error(err);
      checkLoaded();
    });

    const unsubConnectors = onSnapshot(collection(db, `users/${user.uid}/connectors`), (snap) => {
      if (!snap.empty) {
        setConnectors(snap.docs.map(d => d.data() as Connector));
      } else {
        // Init default connectors
        defaultConnectors.forEach(c => setDoc(doc(db, `users/${user.uid}/connectors`, c.id), c));
      }
      checkLoaded();
    }, (err) => {
      console.error(err);
      checkLoaded();
    });

    const unsubBrands = onSnapshot(collection(db, `users/${user.uid}/brandSettings`), (snap) => {
      if (!snap.empty) {
        setBrandSettings(snap.docs.map(d => d.data() as BrandSettingsData));
      } else {
        // Init default brand settings
        defaultBrandSettings.forEach(b => setDoc(doc(db, `users/${user.uid}/brandSettings`, b.id), b));
      }
      checkLoaded();
    }, (err) => {
      console.error(err);
      checkLoaded();
    });

    return () => {
      unsubKeywords();
      unsubContents();
      unsubConnectors();
      unsubBrands();
    };
  }, []);

  const addKeyword = async (kw: Omit<Keyword, 'id' | 'dateAdded'>) => {
    const user = auth.currentUser;
    if (!user) return;
    const newKw: Keyword = { ...kw, id: crypto.randomUUID(), dateAdded: new Date().toISOString() };
    await setDoc(doc(db, `users/${user.uid}/keywords`, newKw.id), newKw);
  };

  const updateKeyword = async (id: string, updates: Partial<Keyword>) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, `users/${user.uid}/keywords`, id), updates);
  };

  const addContent = async (content: Omit<ContentItem, 'id' | 'createdDate'>) => {
    const user = auth.currentUser;
    if (!user) return;
    const newC: ContentItem = { ...content, id: crypto.randomUUID(), createdDate: new Date().toISOString() };
    await setDoc(doc(db, `users/${user.uid}/contents`, newC.id), newC);
  };

  const updateContent = async (id: string, updates: Partial<ContentItem>) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, `users/${user.uid}/contents`, id), updates);
  };

  const updateConnector = async (id: string, updates: Partial<Connector>) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, `users/${user.uid}/connectors`, id), updates);
  };

  const updateBrandSettings = async (id: Brand, updates: Partial<BrandSettingsData>) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, `users/${user.uid}/brandSettings`, id), updates);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-slate-500 font-medium">Loading your pilot...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      keywords, addKeyword, updateKeyword,
      contents, addContent, updateContent,
      connectors, updateConnector,
      brandSettings, updateBrandSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}