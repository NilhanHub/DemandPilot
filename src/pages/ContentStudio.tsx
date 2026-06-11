import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/InputLabel';
import { Select, Textarea } from '../components/ui/SelectTextarea';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';

export function ContentStudio() {
  const { keywords, addContent, connectors } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [brand, setBrand] = useState('ApexHRM');
  const [keywordId, setKeywordId] = useState('');
  const [geography, setGeography] = useState('Global');
  const [audience, setAudience] = useState('');
  const [contentType, setContentType] = useState('LinkedIn Post');
  const [tone, setTone] = useState('Professional');
  const [cta, setCta] = useState('Visit website');
  const [length, setLength] = useState('Medium');

  const [title, setTitle] = useState('');
  const [hook, setHook] = useState('');
  const [body, setBody] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (location.state?.selectedKeywordId) {
      setKeywordId(location.state.selectedKeywordId);
      const kw = keywords.find(k => k.id === location.state.selectedKeywordId);
      if (kw) {
        setBrand(kw.brand);
        if (kw.audience) setAudience(kw.audience);
      }
      // clear state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, keywords]);

  const wordCount = (hook + ' ' + body).trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = (hook + ' ' + body).length;

  const handleGenerate = () => {
    const kw = keywords.find(k => k.id === keywordId)?.text || 'General Topic';
    const draftTitle = `Draft: ${kw.substring(0,20)}...`;
    
    setTitle(draftTitle);
    setHook(`Does your business struggle with "${kw}"?`);
    setBody(`This is an AI draft from user-provided keyword: "${kw}".\n\n[Body paragraph 1]\n[Body paragraph 2]\n\n${cta}`);
    setHashtags(`#${brand.replace(/\s+/g,'')} #${kw.replace(/\s+/g,'')}`);
    toast.success('Draft generated based on requirements.');
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error('Draft title cannot be empty.');
      return;
    }
    await addContent({
      title,
      brand,
      keywordId,
      type: contentType,
      tone,
      cta,
      length,
      body: `[Hook]\n${hook}\n\n[Body]\n${body}`,
      hashtags,
      notes,
      platform: contentType.includes('LinkedIn') ? 'LinkedIn' : 'Unknown',
      status: 'Draft',
    });
    toast.success('Draft saved successfully to Firestore!');
  };

  const handleSendToReview = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Cannot send empty content to review.');
      return;
    }
    await addContent({
      title,
      brand,
      keywordId,
      type: contentType,
      tone,
      cta,
      length,
      body: `[Hook]\n${hook}\n\n[Body]\n${body}`,
      hashtags,
      notes,
      platform: contentType.includes('LinkedIn') ? 'LinkedIn' : 'Unknown',
      status: 'Needs Review',
    });
    toast.success('Draft saved and sent to Review!');
    navigate('/library');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${hook}\n\n${body}\n\n${hashtags}`);
      toast.success('Content copied to clipboard');
    } catch (err) {
      console.error('Clipboard write failed:', err);
      toast.error('Failed to copy to clipboard. Please copy manually.');
    }
  };

  const handleKeepExport = async () => {
    toast.error('Google Keep requires verified API access / Workspace admin setup.');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Content Studio</h1>
        <p className="text-slate-500 mt-1">Generate drafts based on manual input.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-4 space-y-6 sticky top-8">
          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select value={brand} onChange={e => setBrand(e.target.value)}>
                    <option value="ApexHRM">ApexHRM</option>
                    <option value="CV Pro">CV Pro</option>
                    <option value="1BT">1BT</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Keyword</Label>
                  <Select value={keywordId} onChange={e => setKeywordId(e.target.value)}>
                    <option value="">Select a keyword...</option>
                    {keywords.filter(k => k.brand === brand).map(k => (
                      <option key={k.id} value={k.id}>{k.text}</option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <Label>Content Type</Label>
                  <Select value={contentType} onChange={e => setContentType(e.target.value)}>
                    <option value="LinkedIn Post">LinkedIn Post</option>
                    <option value="SEO Article">SEO Article</option>
                    <option value="Google Ad Copy">Google Ad Copy</option>
                    <option value="LinkedIn Ad Copy">LinkedIn Ad Copy</option>
                    <option value="Podcast Script">Podcast Script</option>
                    <option value="YouTube Shorts Script">YouTube Shorts Script</option>
                    <option value="TikTok/Reels Script">TikTok/Reels Script</option>
                    <option value="Email Newsletter">Email Newsletter</option>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onChange={e => setTone(e.target.value)}>
                    <option value="Practical">Practical</option>
                    <option value="Inspirational">Inspirational</option>
                    <option value="Professional">Professional</option>
                    <option value="Founder voice">Founder voice</option>
                    <option value="Direct and punchy">Direct and punchy</option>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label>Length</Label>
                  <Select value={length} onChange={e => setLength(e.target.value)}>
                    <option value="Short">Short</option>
                    <option value="Medium">Medium</option>
                    <option value="Long">Long</option>
                  </Select>
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <Label>Call to Action (CTA)</Label>
                  <Select value={cta} onChange={e => setCta(e.target.value)}>
                    <option value="Visit website">Visit website</option>
                    <option value="Build CV">Build CV</option>
                    <option value="Contact ApexHRM">Contact ApexHRM</option>
                    <option value="Book consultation">Book consultation</option>
                    <option value="Read article">Read article</option>
                    <option value="Follow for more">Follow for more</option>
                  </Select>
                </div>
              </div>
               <div className="pt-4 border-t border-slate-100">
                 <Button onClick={handleGenerate} className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors">
                   Generate Draft
                 </Button>
                 <p className="text-xs font-medium text-slate-400 text-center mt-3 tracking-tight">AI draft from user-provided keyword.</p>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-8">
          <Card className="h-full min-h-[600px] flex flex-col shadow-sm border-slate-200">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 bg-slate-50 rounded-t-xl pb-4 gap-4">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">Draft Editor</CardTitle>
                {title && <Badge className="bg-indigo-100 text-indigo-700">Draft</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                 <div className="text-xs text-slate-500 font-medium mr-2 font-mono">
                   {wordCount} words / {charCount} chars
                 </div>
                 <Button variant="outline" size="sm" onClick={handleCopy} disabled={!body}>Copy Content</Button>
                 <Button variant="outline" size="sm" onClick={handleKeepExport} disabled={!body}>Export to Keep</Button>
                 <Button variant="outline" size="sm" onClick={handleSendToReview} disabled={!body}>Send to Review</Button>
                 <Button variant="default" size="sm" onClick={handleSaveDraft} className="bg-slate-900 border-slate-900 text-white hover:bg-slate-800">Save Draft</Button>
              </div>
            </CardHeader>
            
            {!title && !body ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">Your workspace is empty</p>
                  <p className="text-sm mt-1">Configure your content block and generate a draft to begin.</p>
                </div>
              </div>
            ) : (
              <CardContent className="flex-1 p-6 flex flex-col gap-6">
                 <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Draft Title" className="font-semibold text-lg py-6" />
                </div>
                <div className="space-y-2">
                  <Label>Hook</Label>
                  <Textarea 
                     value={hook} 
                     onChange={e => setHook(e.target.value)} 
                     placeholder="Catchy hook to grab attention..." 
                     className="w-full resize-none min-h-[80px]" 
                  />
                </div>
                <div className="space-y-2 flex-1 flex flex-col min-h-[300px]">
                  <Label>Body</Label>
                  <Textarea 
                     value={body} 
                     onChange={e => setBody(e.target.value)} 
                     placeholder="Your draft will appear here..." 
                     className="flex-1 min-h-[250px] resize-none leading-relaxed" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <Label>Hashtags</Label>
                    <Input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#tags" />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes..." />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
