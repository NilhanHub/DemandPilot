import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Input, Label } from '../components/ui/InputLabel';
import { Textarea } from '../components/ui/SelectTextarea';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../store/AppContext';
import { BrandSettingsData, Brand } from '../types';
import { toast } from 'sonner';

const brandDescriptions: Record<string, string> = {
  'ApexHRM': 'Recruitment, HR, executive search, hiring, Sri Lanka employment market.',
  'CV Pro': 'AI CV builder, CV writing, job applications, career growth.',
  '1BT': 'Microsoft Dynamics 365, AI app development, automation, CRM.'
};

export function BrandSettings() {
  const { brandSettings, updateBrandSettings } = useAppContext();
  const [activeBrand, setActiveBrand] = useState<string>('ApexHRM');
  const [formData, setFormData] = useState<BrandSettingsData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const data = brandSettings.find(b => b.id === activeBrand);
    if (data) setFormData(data);
  }, [activeBrand, brandSettings]);

  const handleChange = (field: keyof BrandSettingsData, value: string) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    await updateBrandSettings(formData.id, formData);
    setIsSaving(false);
    toast.success(`${formData.id} settings saved securely.`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Brand Settings</h1>
        <p className="text-slate-500 mt-1">Configure voice, audience, and constraints for your profiles.</p>
      </div>

      <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-sm">
        {['ApexHRM', 'CV Pro', '1BT'].map(id => (
          <button
            key={id}
            onClick={() => setActiveBrand(id)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeBrand === id 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      {formData && (
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl py-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-sm border border-indigo-200">
                 {formData.id.substring(0,2).toUpperCase()}
               </div>
               <div>
                  <CardTitle className="text-xl">{formData.id} Profile</CardTitle>
                  <CardDescription className="mt-1 max-w-2xl">{brandDescriptions[formData.id] || ''}</CardDescription>
               </div>
             </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <Label className="text-sm font-semibold">Website</Label>
                 <Input 
                    value={formData.website} 
                    onChange={e => handleChange('website', e.target.value)} 
                    placeholder="https://"
                    className="bg-slate-50 focus:bg-white transition-colors"
                 />
               </div>
               <div className="space-y-2">
                 <Label className="text-sm font-semibold">Primary CTAs</Label>
                 <Input 
                    value={formData.ctas} 
                    onChange={e => handleChange('ctas', e.target.value)} 
                    placeholder="e.g. Schedule Call, Join Beta"
                    className="bg-slate-50 focus:bg-white transition-colors"
                 />
               </div>
             </div>
             
             <div className="space-y-2">
               <Label className="text-sm font-semibold">Brand Voice Definition</Label>
               <Textarea 
                  value={formData.voice} 
                  onChange={e => handleChange('voice', e.target.value)} 
                  className="min-h-[120px] resize-y bg-slate-50 focus:bg-white transition-colors"
                  placeholder="How does this brand speak?"
               />
             </div>
             
             <div className="space-y-2">
               <Label className="text-sm font-semibold">Target Audience</Label>
               <Input 
                  value={formData.audience} 
                  onChange={e => handleChange('audience', e.target.value)} 
                  className="bg-slate-50 focus:bg-white transition-colors"
                  placeholder="Who are we talking to?"
               />
             </div>
             
             <div className="space-y-3 p-5 rounded-xl border border-red-100 bg-red-50/50">
               <Label className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Forbidden / Constraints
               </Label>
               <Input 
                  value={formData.forbidden} 
                  onChange={e => handleChange('forbidden', e.target.value)} 
                  className="border-red-200 focus:ring-red-500 bg-white" 
                  placeholder="Words or concepts to completely avoid"
               />
             </div>
             
             <div className="pt-4 border-t border-slate-100 flex justify-end">
               <Button onClick={handleSave} disabled={isSaving} className="bg-slate-900 border-slate-900 text-white hover:bg-slate-800">
                  {isSaving ? 'Saving...' : `Save ${formData.id} Settings`}
               </Button>
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
