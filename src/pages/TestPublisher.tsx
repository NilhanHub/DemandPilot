import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/InputLabel';
import { Select, Textarea } from '../components/ui/SelectTextarea';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { useAppContext } from '../store/AppContext';
import { PublicationResult } from '../types';

export function TestPublisher() {
  const { addContent } = useAppContext();
  
  const [brand, setBrand] = useState('CV Pro');
  const [postText, setPostText] = useState("CV Pro is a 'for life' platform to manage and improve your CV with AI. Log in to cvpro.globalapps.world to get your free credits");
  const [destinations, setDestinations] = useState<string[]>(['linkedin', 'wordpress', 'x']);
  const [publishMode, setPublishMode] = useState<'draft' | 'publish_now'>('draft');
  const [results, setResults] = useState<Record<string, PublicationResult>>({});
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleDestination = (dest: string) => {
    setDestinations(prev => 
      prev.includes(dest) ? prev.filter(d => d !== dest) : [...prev, dest]
    );
  };

  const handlePublish = async () => {
    if (destinations.length === 0) {
      toast.error('Select at least one destination.');
      return;
    }

    setIsPublishing(true);
    const newResults: Record<string, PublicationResult> = { ...results };

    // Mark as publishing
    destinations.forEach(dest => {
      newResults[dest] = { destination: dest, status: 'publishing' };
    });
    setResults({ ...newResults });

    // Call APIs
    for (const dest of destinations) {
      try {
        const response = await fetch(`/api/publish/${dest}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentBody: postText,
            publishMode
          })
        });

        if (!response.ok) {
           newResults[dest] = {
             destination: dest,
             status: 'failed',
             errorMessage: `HTTP Error ${response.status}`
           };
        } else {
           const data = await response.json();
           newResults[dest] = data;
        }
      } catch (err: any) {
        newResults[dest] = {
          destination: dest,
          status: 'failed',
          errorMessage: err.message || 'Network error'
        };
      }
    }

    setResults({ ...newResults });
    setIsPublishing(false);

    // Show toast summary
    const successCount = Object.values(newResults).filter(r => r.status === 'published' || r.status === 'ready').length;
    const notConfiguredCount = Object.values(newResults).filter(r => r.status === 'not_configured').length;
    
    if (successCount > 0) toast.success(`Successfully published to ${successCount} destinations.`);
    if (notConfiguredCount > 0) toast.info(`${notConfiguredCount} destinations are not configured.`);

    // Save to Firestore
    await addContent({
      title: 'Generic Test Post',
      brand,
      type: 'Generic Text Post',
      tone: 'Professional',
      cta: 'Log in',
      length: 'Short',
      body: postText,
      hashtags: '',
      notes: 'Automated test publisher MVP run.',
      platform: 'Multiple',
      status: publishMode === 'publish_now' ? 'Published Manually' : 'Draft',
      destinations,
      publishMode,
      publicationResults: newResults
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Generic Test Publisher</h1>
        <p className="text-slate-500 mt-1">MVP test pipeline to verify API connectors without generating complex content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
            <CardTitle className="text-lg">Publishing Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select value={brand} onChange={e => setBrand(e.target.value)}>
                <option value="CV Pro">CV Pro</option>
                <option value="ApexHRM">ApexHRM</option>
                <option value="1BT">1BT</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Test Post Content</Label>
              <Textarea 
                value={postText}
                onChange={e => setPostText(e.target.value)}
                className="h-32"
              />
            </div>

            <div className="space-y-3">
              <Label>Destinations</Label>
              <div className="space-y-2">
                {['linkedin', 'wordpress', 'x'].map(dest => (
                  <label key={dest} className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                      checked={destinations.includes(dest)}
                      onChange={() => toggleDestination(dest)}
                    />
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {dest === 'x' ? 'X / Twitter' : dest === 'wordpress' ? 'ApexHRM Website (WordPress)' : dest}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Publish Mode</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="publishMode"
                    className="text-indigo-600 focus:ring-indigo-600"
                    checked={publishMode === 'draft'}
                    onChange={() => setPublishMode('draft')}
                  />
                  <span className="text-sm font-medium text-slate-700">Draft / Test</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="publishMode"
                    className="text-indigo-600 focus:ring-indigo-600"
                    checked={publishMode === 'publish_now'}
                    onChange={() => setPublishMode('publish_now')}
                  />
                  <span className="text-sm font-medium text-slate-700">Publish Now</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <Button onClick={handlePublish} disabled={isPublishing || destinations.length === 0} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {isPublishing ? 'Publishing...' : 'Publish to Selected'}
              </Button>
            </div>

          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">Destination Results</h3>
          {destinations.length === 0 && (
            <p className="text-sm text-slate-500">No destinations selected.</p>
          )}
          {destinations.map(dest => {
            const result = results[dest];
            const name = dest === 'x' ? 'X / Twitter' : dest === 'wordpress' ? 'WordPress' : 'LinkedIn';
            
            return (
              <Card key={dest} className="shadow-sm border-slate-200">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{name}</span>
                    <Badge className={
                      !result ? 'bg-slate-100 text-slate-600' :
                      result.status === 'publishing' ? 'bg-blue-100 text-blue-700' :
                      result.status === 'published' || result.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                      result.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }>
                      {result ? result.status.replace('_', ' ') : 'waiting'}
                    </Badge>
                  </div>
                  
                  {result?.errorMessage && (
                    <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">{result.errorMessage}</p>
                  )}
                  
                  {result?.externalUrl && (
                    <a href={result.externalUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline mt-1 truncate">
                      View Post
                    </a>
                  )}
                  
                  {result?.externalId && (
                    <p className="text-xs text-slate-400 font-mono mt-1">ID: {result.externalId}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
