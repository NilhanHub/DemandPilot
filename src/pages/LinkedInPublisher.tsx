import { useState, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/InputLabel';
import { Select, Textarea } from '../components/ui/SelectTextarea';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { ContentStatus } from '../types';

export function LinkedInPublisher() {
  const { keywords, contents, addContent, updateContent } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [editId, setEditId] = useState<string | null>(null);
  const [brand, setBrand] = useState('ApexHRM');
  const [keywordId, setKeywordId] = useState('');
  const [body, setBody] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [cta, setCta] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [status, setStatus] = useState<ContentStatus>('Draft');

  useEffect(() => {
    if (location.state?.editContentId && contents.length > 0) {
      const c = contents.find(item => item.id === location.state.editContentId);
      if (c && c.platform === 'LinkedIn') {
        setEditId(c.id);
        setBrand(c.brand || 'ApexHRM');
        setKeywordId(c.keywordId || '');
        setBody(c.body || '');
        setHashtags(c.hashtags || '');
        setCta(c.cta || '');
        setManualUrl(c.manualUrl || '');
        setStatus(c.status || 'Draft');
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, contents]);

  const handleCopy = () => {
    if (!body) {
      toast.error('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(`${body}\n\n${cta}\n\n${hashtags}`);
    setStatus('Copied for Posting');
    toast.success('Post copied to clipboard');
  };

  const isUrlValid = (url: string) => {
    if (!url) return true;
    return url.startsWith('https://www.linkedin.com/') || url.startsWith('https://linkedin.com/');
  };

  useEffect(() => {
    if (manualUrl && isUrlValid(manualUrl)) {
       setStatus('Published Manually');
    }
  }, [manualUrl]);

  const handleSave = async () => {
    if (!body.trim()) {
      toast.error('Post body cannot be empty.');
      return;
    }
    const finalStatus: ContentStatus = manualUrl && isUrlValid(manualUrl) ? 'Published Manually' : status;
    
    try {
      if (editId) {
        await updateContent({
          id: editId,
          title: `LinkedIn Post: ${body.substring(0, 20)}...`,
          brand,
          keywordId,
          type: 'LinkedIn Post',
          tone: 'Manual',
          cta,
          length: 'Manual',
          body,
          hashtags,
          notes: '',
          platform: 'LinkedIn',
          status: finalStatus,
          manualUrl,
        });
        toast.success('LinkedIn record updated securely');
      } else {
        await addContent({
          title: `LinkedIn Post: ${body.substring(0, 20)}...`,
          brand,
          keywordId,
          type: 'LinkedIn Post',
          tone: 'Manual',
          cta,
          length: 'Manual',
          body,
          hashtags,
          notes: '',
          platform: 'LinkedIn',
          status: finalStatus,
          manualUrl,
        });
        toast.success('LinkedIn record saved securely');
        // Clear form after successful creation
        setBody('');
        setHashtags('');
        setCta('');
        setManualUrl('');
        setStatus('Draft');
      }
      setStatus(finalStatus);
    } catch (e) {
      // Error handled by context
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">LinkedIn Publisher</h1>
        <p className="text-slate-500 mt-1">Write, format, preview, and manually publish your content securely.</p>
      </div>
      
      <Card className="bg-amber-50 border-amber-200">
         <CardContent className="p-4 flex items-center justify-between">
           <div className="text-sm text-amber-800 font-medium flex items-center gap-2">
             <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             LinkedIn API posting is not enabled yet. Copy the post, publish manually on LinkedIn, then paste the final LinkedIn URL below.
           </div>
         </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Post Content</CardTitle>
                <div className="text-xs font-mono text-slate-500 font-medium">
                  {body.length} / 3000 chars
                </div>
              </div>
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
                  <Label>Linked Keyword (Optional)</Label>
                  <Select value={keywordId} onChange={e => setKeywordId(e.target.value)}>
                    <option value="">None</option>
                    {keywords.filter(k => k.brand === brand).map(k => (
                      <option key={k.id} value={k.id}>{k.text}</option>
                    ))}
                  </Select>
                </div>
              </div>
               <div className="space-y-2">
                <Label>Post Body</Label>
                <Textarea 
                   value={body} 
                   onChange={e => setBody(e.target.value)} 
                   placeholder="What do you want to share with your professional network?" 
                   className="min-h-[220px] resize-y leading-relaxed" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div className="space-y-2">
                  <Label>Call to Action (CTA)</Label>
                  <Input value={cta} onChange={e => setCta(e.target.value)} placeholder="e.g. Discuss in the comments below..." />
                </div>
                 <div className="space-y-2">
                  <Label>Hashtags</Label>
                  <Input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#growth #leadership" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-4">
               <CardTitle className="text-lg">Publishing Record</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400">
                <div className={`flex items-center gap-1 ${status !== 'Draft' ? 'text-indigo-600' : ''}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${status !== 'Draft' ? 'bg-indigo-100' : 'bg-slate-100'}`}>1</div>
                  Draft
                </div>
                <div className="flex-1 max-w-[16px] h-px bg-slate-200"></div>
                <div className={`flex items-center gap-1 ${['Approved', 'Copied for Posting', 'Published Manually'].includes(status) ? 'text-indigo-600' : ''}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${['Approved', 'Copied for Posting', 'Published Manually'].includes(status) ? 'bg-indigo-100' : 'bg-slate-100'}`}>2</div>
                  Approved
                </div>
                <div className="flex-1 max-w-[16px] h-px bg-slate-200"></div>
                <div className={`flex items-center gap-1 ${['Copied for Posting', 'Published Manually'].includes(status) ? 'text-indigo-600' : ''}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${['Copied for Posting', 'Published Manually'].includes(status) ? 'bg-indigo-100' : 'bg-slate-100'}`}>3</div>
                  Copied
                </div>
                <div className="flex-1 max-w-[16px] h-px bg-slate-200"></div>
                <div className={`flex items-center gap-1 ${status === 'Published Manually' ? 'text-indigo-600' : ''}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${status === 'Published Manually' ? 'bg-indigo-100' : 'bg-slate-100'}`}>4</div>
                  Posted
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
                 <div className="space-y-2">
                  <Label>Final Status</Label>
                  <Select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Draft">Draft</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Copied for Posting">Copied for Posting</option>
                    <option value="Published Manually">Published Manually</option>
                     <option value="Archived">Archived</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Live LinkedIn URL</Label>
                  <Input 
                     value={manualUrl} 
                     onChange={e => setManualUrl(e.target.value)} 
                     placeholder="https://www.linkedin.com/posts/..." 
                     className={manualUrl && !isUrlValid(manualUrl) ? "border-red-300 focus:ring-red-500" : ""}
                  />
                  {manualUrl && !isUrlValid(manualUrl) && (
                    <p className="text-xs text-red-500 mt-1">Must be a valid LinkedIn post URL.</p>
                  )}
                </div>
              </div>
               <div className="pt-2 border-t border-slate-100">
                 <Button className="w-full sm:w-auto bg-slate-900 border-slate-900 text-white hover:bg-slate-800" onClick={handleSave}>Save Publishing Record</Button>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-8 overflow-hidden bg-white shadow-md border-slate-200">
             <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    <CardTitle className="text-sm font-semibold text-slate-700">Preview</CardTitle>
                  </div>
                  <Button size="sm" onClick={handleCopy} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none">Copy to Clipboard</Button>
                </div>
             </CardHeader>
             <CardContent className="p-0">
                <div className="bg-white p-5 font-sans text-sm text-[#000000e6]">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 shadow-inner flex items-center justify-center font-bold text-slate-400 text-lg">
                      {brand.charAt(0)}
                    </div>
                    <div className="leading-tight mt-1">
                      <div className="font-semibold hover:underline cursor-pointer">{brand}</div>
                      <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis w-48">Company page placeholder</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        Just now • <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.83 5H9.6a11.23 11.23 0 00-.81-3.32A5.51 5.51 0 0111.83 6zM8 14.49a9.75 9.75 0 01-1.39-3.49h2.78A9.75 9.75 0 018 14.49zM6.17 9.5H4.07a5.52 5.52 0 010-3h2.1a11.53 11.53 0 000 3zm1.61 0H6.61a9.75 9.75 0 010-3h1.17a9.75 9.75 0 010 3zm2.44 0H9.06a9.75 9.75 0 010-3h1.16a9.75 9.75 0 010 3zm.18-5H7.22A9.75 9.75 0 018 1.51 9.75 9.75 0 0110.4 4.5zM4.17 6h2.23A11.23 11.23 0 005.59 2.68 5.51 5.51 0 014.17 6zM5.59 13.32A11.23 11.23 0 006.4 10H4.17a5.51 5.51 0 011.42 3.32zM11.83 10H9.6a11.23 11.23 0 00.81 3.32A5.51 5.51 0 0111.83 10z"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap break-words mb-4" style={{lineHeight: '1.5'}}>
                    {body || <span className="text-slate-400">Start typing to see your live preview...</span>}
                    {cta && <div className="mt-4">{cta}</div>}
                    {hashtags && <div className="mt-4 text-[#0a66c2] hover:underline cursor-pointer font-medium">{hashtags}</div>}
                  </div>
                  <div className="h-64 bg-slate-50 flex flex-col items-center justify-center text-slate-400 border border-slate-200 group overflow-hidden">
                     <svg className="w-10 h-10 text-slate-300 mb-2 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                     <span className="text-xs font-medium">Image / Video Preview Space</span>
                  </div>
                  <div className="flex justify-between items-center px-2 py-3 mt-1 border-t border-slate-100 text-slate-500">
                    <div className="flex items-center gap-1.5 hover:bg-slate-100 px-2 py-1 rounded cursor-pointer transition-colors text-xs font-semibold">
                      <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                      Like
                    </div>
                    <div className="flex items-center gap-1.5 hover:bg-slate-100 px-2 py-1 rounded cursor-pointer transition-colors text-xs font-semibold">
                      <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      Comment
                    </div>
                    <div className="flex items-center gap-1.5 hover:bg-slate-100 px-2 py-1 rounded cursor-pointer transition-colors text-xs font-semibold">
                      <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      Share
                    </div>
                  </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
