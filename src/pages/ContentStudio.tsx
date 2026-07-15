import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/InputLabel';
import { Select, Textarea } from '../components/ui/SelectTextarea';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { generateCampaignContent, extractKeywordsFromSource, formatCopiedContent, normalizeHashtags } from '../lib/aiContentGenerator';

export function ContentStudio() {
  const { keywords, addContent, brandSettings } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Primary MVP Fields
  const [brand, setBrand] = useState('ApexHRM');
  const [contentType, setContentType] = useState('LinkedIn Post');
  const [keywordSourceMode, setKeywordSourceMode] = useState<'manual' | 'screenshot' | 'csv'>('manual');
  const [keywordText, setKeywordText] = useState('');
  const [keywordFile, setKeywordFile] = useState<File | null>(null);
  const [optionalImage, setOptionalImage] = useState<File | null>(null);
  const [instruction, setInstruction] = useState('');

  // Advanced Fields (collapsed by default)
  const [geography, setGeography] = useState('Global');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('Professional');
  const [cta, setCta] = useState('Visit website');
  const [length, setLength] = useState('Medium');
  const [hashtagStyle, setHashtagStyle] = useState('Standard');
  const [seoDepth, setSeoDepth] = useState('Standard');

  // Draft Editor State
  const [title, setTitle] = useState('');
  const [hook, setHook] = useState('');
  const [body, setBody] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywordStrategy, setKeywordStrategy] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (location.state?.selectedKeywordId) {
      setKeywordSourceMode('manual');
      const kw = keywords.find(k => k.id === location.state.selectedKeywordId);
      if (kw) {
        setBrand(kw.brand);
        setKeywordText(kw.text);
        if (kw.audience) setAudience(kw.audience);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, keywords]);

  const wordCount = (hook + ' ' + body).trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = (hook + ' ' + body).length;

  const handleGenerate = async () => {
    setIsGenerating(true);
    const brandData = brandSettings.find(b => b.id === brand);
    
    try {
      // Step 1: Extraction
      let extractionSource = keywordText;
      let extractionType: 'text' | 'image' = 'text';
      
      if (keywordSourceMode === 'screenshot' && keywordFile) {
        extractionType = 'image';
        extractionSource = 'dummy_image_data';
      } else if (keywordSourceMode === 'csv' && keywordFile) {
        extractionSource = await keywordFile.text();
      }

      const extraction = await extractKeywordsFromSource(extractionSource, extractionType);
      
      // Step 2: Generation (if extraction somehow worked)
      const generated = await generateCampaignContent({
        instruction,
        brand,
        brandVoice: brandData?.voice || '',
        outputType: contentType,
        extractedKeywords: extraction.extractedKeywords,
        geography,
        audience: audience || brandData?.audience || '',
        tone,
        cta,
        length
      });

      setTitle(generated.title);
      setHook(generated.hook);
      setBody(generated.body);
      setCta(generated.cta);
      setHashtags(normalizeHashtags(generated.hashtags));
      setSelectedKeywords(generated.selectedKeywords || []);
      setKeywordStrategy(generated.keywordStrategy || '');
      toast.success('Campaign draft generated successfully.');

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'AI generation failed');
      
      // Fallback: keep existing manual draft editor working
      setTitle(`Draft: ${brand} Campaign`);
      setHook(`Does your business struggle with...?`);
      setBody(`[Manual draft space - AI not configured]\n\nInstruction: ${instruction}\nKeywords: ${keywordText}\n\n${cta}`);
      setHashtags(normalizeHashtags([brand.replace(/\s+/g,'')]));
      toast.info('Using manual editor instead.');
      
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error('Draft title cannot be empty.');
      return;
    }
    await addContent({
      title,
      brand,
      type: contentType,
      tone,
      cta,
      length,
      hook,
      body,
      hashtags,
      notes,
      platform: contentType.includes('LinkedIn') ? 'LinkedIn' : 'Unknown',
      status: 'Draft',
      geography,
      audience,
      sourceMode: keywordSourceMode === 'screenshot' ? 'keyword_screenshot' : keywordSourceMode === 'csv' ? 'keyword_csv' : 'manual_keywords',
      selectedKeywords,
      keywordStrategy
    });
    toast.success('Draft saved successfully!');
  };

  const handleSendToReview = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Cannot send empty content to review.');
      return;
    }
    await addContent({
      title,
      brand,
      type: contentType,
      tone,
      cta,
      length,
      hook,
      body,
      hashtags,
      notes,
      platform: contentType.includes('LinkedIn') ? 'LinkedIn' : 'Unknown',
      status: 'Needs Review',
      geography,
      audience,
      sourceMode: keywordSourceMode === 'screenshot' ? 'keyword_screenshot' : keywordSourceMode === 'csv' ? 'keyword_csv' : 'manual_keywords',
      selectedKeywords,
      keywordStrategy
    });
    toast.success('Draft saved and sent to Review!');
    navigate('/library');
  };

  const handleCopy = async () => {
    try {
      const formatted = formatCopiedContent(title, hook, body, cta, hashtags);
      await navigator.clipboard.writeText(formatted);
      toast.success('Content copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Campaign Builder</h1>
        <p className="text-slate-500 mt-1">Generate multi-channel campaigns from keyword sources.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-4 space-y-6 sticky top-8">
          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
              <CardTitle className="text-lg">Campaign Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select value={brand} onChange={e => setBrand(e.target.value)}>
                  <option value="ApexHRM">ApexHRM</option>
                  <option value="CV Pro">CV Pro</option>
                  <option value="1BT">1BT</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Output Type</Label>
                <Select value={contentType} onChange={e => setContentType(e.target.value)}>
                  <option value="SEO Article">SEO Article</option>
                  <option value="LinkedIn Post">LinkedIn Post</option>
                  <option value="LinkedIn Image Post">LinkedIn Image Post</option>
                  <option value="Short Video Script">Short Video Script</option>
                  <option value="Podcast Script">Podcast Script</option>
                  <option value="Google Ad Copy">Google Ad Copy</option>
                  <option value="LinkedIn Ad Copy">LinkedIn Ad Copy</option>
                  <option value="Email Newsletter">Email Newsletter</option>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Keyword Source</Label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${keywordSourceMode === 'manual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setKeywordSourceMode('manual')}
                  >Paste</button>
                  <button 
                    className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${keywordSourceMode === 'screenshot' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setKeywordSourceMode('screenshot')}
                  >Screenshot</button>
                  <button 
                    className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${keywordSourceMode === 'csv' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setKeywordSourceMode('csv')}
                  >CSV</button>
                </div>

                {keywordSourceMode === 'manual' && (
                  <Textarea 
                    placeholder="Paste keywords here (comma or newline separated)..." 
                    value={keywordText}
                    onChange={e => setKeywordText(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                )}
                {keywordSourceMode === 'screenshot' && (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                    <Input type="file" accept="image/*" onChange={e => setKeywordFile(e.target.files?.[0] || null)} className="text-sm" />
                    <p className="text-xs text-slate-500 mt-2">Upload Keyword Planner screenshot</p>
                  </div>
                )}
                {keywordSourceMode === 'csv' && (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                    <Input type="file" accept=".csv" onChange={e => setKeywordFile(e.target.files?.[0] || null)} className="text-sm" />
                    <p className="text-xs text-slate-500 mt-2">Upload Keyword Planner export</p>
                  </div>
                )}
              </div>

              {contentType === 'LinkedIn Image Post' && (
                <div className="space-y-2 pt-2">
                  <Label>Optional Post Image</Label>
                  <Input type="file" accept="image/*" onChange={e => setOptionalImage(e.target.files?.[0] || null)} className="text-sm" />
                </div>
              )}

              <div className="space-y-2 pt-2">
                <Label>Instruction (Optional)</Label>
                <Textarea 
                  placeholder="e.g., Write an inspiring article for CV Pro using the strongest Sri Lanka job seeker keywords." 
                  value={instruction}
                  onChange={e => setInstruction(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <details className="group border border-slate-200 rounded-lg overflow-hidden mt-4">
                <summary className="bg-slate-50 px-4 py-3 cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors list-none flex justify-between items-center">
                  Advanced Settings
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="16" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="16"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="p-4 space-y-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Audience</Label>
                      <Input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Inferred from Brand" className="text-sm h-8" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Geography</Label>
                      <Input value={geography} onChange={e => setGeography(e.target.value)} className="text-sm h-8" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Tone</Label>
                      <Select value={tone} onChange={e => setTone(e.target.value)} className="text-sm h-8 py-1">
                        <option value="Practical">Practical</option>
                        <option value="Inspirational">Inspirational</option>
                        <option value="Professional">Professional</option>
                        <option value="Founder voice">Founder voice</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Length</Label>
                      <Select value={length} onChange={e => setLength(e.target.value)} className="text-sm h-8 py-1">
                        <option value="Short">Short</option>
                        <option value="Medium">Medium</option>
                        <option value="Long">Long</option>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label className="text-xs">Call to Action (CTA)</Label>
                      <Input value={cta} onChange={e => setCta(e.target.value)} className="text-sm h-8" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Hashtags</Label>
                      <Select value={hashtagStyle} onChange={e => setHashtagStyle(e.target.value)} className="text-sm h-8 py-1">
                        <option value="Standard">Standard</option>
                        <option value="Minimal">Minimal</option>
                        <option value="Aggressive">Aggressive</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">SEO Depth</Label>
                      <Select value={seoDepth} onChange={e => setSeoDepth(e.target.value)} className="text-sm h-8 py-1">
                        <option value="Standard">Standard</option>
                        <option value="Deep">Deep</option>
                        <option value="Light">Light</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </details>

              <div className="pt-4 border-t border-slate-100">
                <Button onClick={handleGenerate} disabled={isGenerating || (keywordSourceMode !== 'manual' && !keywordFile && !keywordText)} className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors">
                  {isGenerating ? 'Generating Draft...' : 'Generate Campaign Draft'}
                </Button>
                <p className="text-xs font-medium text-slate-400 text-center mt-3 tracking-tight">AI extracts best keywords and writes copy.</p>
              </div>

            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-8">
          <Card className="h-full min-h-[600px] flex flex-col shadow-sm border-slate-200">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 bg-slate-50 rounded-t-xl pb-4 gap-4">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">Campaign Draft Editor</CardTitle>
                {title && <Badge className="bg-indigo-100 text-indigo-700">Campaign Draft</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                 <div className="text-xs text-slate-500 font-medium mr-2 font-mono">
                   {wordCount} words / {charCount} chars
                 </div>
                 <Button variant="outline" size="sm" onClick={handleCopy} disabled={!body}>Copy Content</Button>
                 <Button variant="outline" size="sm" onClick={handleSendToReview} disabled={!body}>Send to Review</Button>
                 <Button variant="default" size="sm" onClick={handleSaveDraft} className="bg-slate-900 border-slate-900 text-white hover:bg-slate-800">Save Draft</Button>
              </div>
            </CardHeader>
            
            {!title && !body ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">Start a Campaign</p>
                  <p className="text-sm mt-1">Upload keyword sources or provide instructions to build your campaign.</p>
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
