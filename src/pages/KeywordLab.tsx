import { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/InputLabel';
import { Select, Textarea } from '../components/ui/SelectTextarea';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import { Keyword, Brand } from '../types';
import { Layers, Plus, Upload, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function KeywordLab() {
  const { keywords, addKeyword } = useAppContext();
  const navigate = useNavigate();
  
  const [text, setText] = useState('');
  const [brand, setBrand] = useState<Brand>('ApexHRM');
  const [geography, setGeography] = useState('Global');
  const [audience, setAudience] = useState('');
  const [intent, setIntent] = useState('General professional audience');
  const [goal, setGoal] = useState('Brand authority');

  const handleAdd = () => {
    if (!text.trim()) {
      toast.error('Keyword cannot be empty');
      return;
    }
    addKeyword({
      text,
      brand,
      geography,
      audience,
      intent,
      status: 'New',
      notes: `Goal: ${goal}`
    });
    setText('');
    setAudience('');
    toast.success('Keyword added securely to Firebase');
  };

  const handleCreateContent = (kw: Keyword) => {
    navigate('/studio', { state: { selectedKeywordId: kw.id } });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Keyword Lab</h1>
        <p className="text-slate-500 mt-1 font-medium">Build your content strategy foundation manually.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4 bg-slate-50 border-b border-slate-100 rounded-t-xl">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Add Keyword Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
               <div className="space-y-2">
                 <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Keyword / Topic</Label>
                 <Input value={text} onChange={e => setText(e.target.value)} placeholder="e.g. AI tools for HR" className="bg-slate-50 focus:bg-white" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Brand</Label>
                   <Select value={brand} onChange={e => setBrand(e.target.value)} className="bg-slate-50 focus:bg-white">
                     <option value="ApexHRM">ApexHRM</option>
                     <option value="CV Pro">CV Pro</option>
                     <option value="1BT">1BT</option>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Geography</Label>
                   <Select value={geography} onChange={e => setGeography(e.target.value)} className="bg-slate-50 focus:bg-white">
                     <option value="Global">Global</option>
                     <option value="Sri Lanka">Sri Lanka</option>
                     <option value="Colombo">Colombo</option>
                   </Select>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Audience</Label>
                 <Input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. HR Directors" className="bg-slate-50 focus:bg-white" />
               </div>
               
               <div className="space-y-2">
                 <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Intent</Label>
                 <Select value={intent} onChange={e => setIntent(e.target.value)} className="bg-slate-50 focus:bg-white">
                   <option value="Job seeker">Job seeker</option>
                   <option value="Hiring manager">Hiring manager</option>
                   <option value="HR manager">HR manager</option>
                   <option value="CEO / business owner">CEO / business</option>
                   <option value="General professional">General professional</option>
                 </Select>
               </div>
               
               <div className="space-y-2">
                 <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Goal</Label>
                  <Select value={goal} onChange={e => setGoal(e.target.value)} className="bg-slate-50 focus:bg-white">
                   <option value="LinkedIn traffic">LinkedIn traffic</option>
                   <option value="Google traffic">Google traffic</option>
                   <option value="Lead generation">Lead generation</option>
                   <option value="Brand authority">Brand authority</option>
                 </Select>
               </div>

              <div className="pt-2">
                <Button onClick={handleAdd} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold">Store Target Securely</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
              <CardTitle className="text-sm">Bulk Operations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Textarea placeholder="Paste comma-separated keywords here for future bulk import styling..." className="min-h-[80px] text-xs resize-none bg-slate-50 focus:bg-white" />
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full bg-white shadow-sm text-xs" size="sm">Pasted Bulk</Button>
                <Button variant="outline" className="w-full bg-white shadow-sm text-xs flex gap-1" size="sm" disabled>
                   <Upload className="w-3 h-3" /> CSV Upload 
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="shadow-sm border-slate-200 h-full overflow-hidden flex flex-col">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                   <Layers className="w-4 h-4" />
                 </div>
                 <div>
                   <CardTitle className="text-lg">Database</CardTitle>
                   <p className="text-xs text-slate-500 font-medium tracking-wide">FIRESTORE SYNCED</p>
                 </div>
               </div>
               <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 border-none font-semibold shadow-inner">Manual Input</Badge>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {keywords.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No targets stored</h3>
                  <p className="text-slate-500 mt-2 max-w-sm text-sm">Add your first keyword target on the left to start building your managed database.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-b border-slate-100">
                        <TableHead className="font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-4">Keyword</TableHead>
                        <TableHead className="font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-4">Brand</TableHead>
                        <TableHead className="font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-4 hidden md:table-cell">Geography</TableHead>
                        <TableHead className="font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-4 hidden sm:table-cell">Audience</TableHead>
                        <TableHead className="font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-4">Status</TableHead>
                        <TableHead className="text-right font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-4">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keywords.map(kw => (
                        <TableRow key={kw.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                          <TableCell className="font-semibold text-slate-900 px-4 py-3">{kw.text}</TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
                              {kw.brand.substring(0, 4)}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm hidden md:table-cell px-4 py-3">{kw.geography}</TableCell>
                          <TableCell className="text-slate-500 text-sm hidden sm:table-cell truncate max-w-[120px] px-4 py-3">{kw.audience || '-'}</TableCell>
                           <TableCell className="px-4 py-3">
                            <Badge className={
                              kw.status === 'New' 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-50 leading-tight shadow-sm' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 leading-tight shadow-sm'
                            }>{kw.status}</Badge>
                           </TableCell>
                           <TableCell className="text-right px-4 py-3">
                             <Button variant="ghost" size="sm" onClick={() => handleCreateContent(kw)} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium transition-all h-8 px-2">
                               <PenTool className="w-3.5 h-3.5 mr-1.5" />
                               Draft
                             </Button>
                           </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
