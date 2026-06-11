import { useState, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/InputLabel';
import { Select, Textarea } from '../components/ui/SelectTextarea';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import { Search, Filter, ExternalLink, Calendar as CalendarIcon, Edit3, X, Archive, Save, Send } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ContentItem, ContentStatus } from '../types';
import { toast } from 'sonner';

export function ContentLibrary() {
  const { contents, updateContent } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);

  useEffect(() => {
    if (location.state?.editContentId && contents.length > 0) {
      const c = contents.find(item => item.id === location.state.editContentId);
      if (c) {
        setEditingContent(c);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, contents]);

  const filteredContents = contents.filter(c => {
    if (filterBrand !== 'All' && c.brand !== filterBrand) return false;
    if (filterType !== 'All' && c.type !== filterType) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.body.toLowerCase().includes(search.toLowerCase())) return false;
    // Archive filter: 'All' hides archived; 'Archived' shows only archived; other values filter normally
    if (filterStatus === 'All') {
      if (c.status === 'Archived') return false;
    } else {
      if (c.status !== filterStatus) return false;
    }
    return true;
  });

  const handleSaveEdit = async () => {
    if (!editingContent) return;
    try {
      await updateContent(editingContent.id, {
        title: editingContent.title,
        body: editingContent.body,
        hashtags: editingContent.hashtags,
        notes: editingContent.notes,
        status: editingContent.status,
        manualUrl: editingContent.manualUrl
      });
      toast.success('Content updated successfully');
      setEditingContent(null);
    } catch (e: any) {
      toast.error('Failed to update content');
    }
  };

  const handleArchive = async () => {
    if (!editingContent) return;
    try {
      await updateContent(editingContent.id, { status: 'Archived' });
      toast.success('Content archived');
      setEditingContent(null);
    } catch (e: any) {
      toast.error('Failed to archive content');
    }
  };

  if (editingContent) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="sm" onClick={() => setEditingContent(null)}>
               <X className="w-4 h-4 mr-2" /> Back
             </Button>
             <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Content</h1>
          </div>
          <div className="flex items-center gap-3">
             {editingContent.platform === 'LinkedIn' && (
               <Button 
                 variant="outline" 
                 size="sm" 
                 className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 mr-2" 
                 onClick={() => navigate('/publish', { state: { editContentId: editingContent.id } })}
               >
                 <Send className="w-4 h-4 mr-2" /> Open in Publisher
               </Button>
             )}
             <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleArchive}>
               <Archive className="w-4 h-4 mr-2" /> Archive
             </Button>
             <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveEdit}>
               <Save className="w-4 h-4 mr-2" /> Save Changes
             </Button>
          </div>
        </div>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label>Status</Label>
                 <Select value={editingContent.status} onChange={e => setEditingContent({...editingContent, status: e.target.value as ContentStatus})}>
                   <option value="Draft">Draft</option>
                   <option value="Needs Review">Needs Review</option>
                   <option value="Approved">Approved</option>
                   <option value="Copied for Posting">Copied for Posting</option>
                   <option value="Published Manually">Published Manually</option>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Manual URL (if published)</Label>
                 <Input value={editingContent.manualUrl || ''} onChange={e => setEditingContent({...editingContent, manualUrl: e.target.value})} placeholder="https://..." />
               </div>
             </div>
             
             <div className="space-y-2 pt-4 border-t border-slate-100">
               <Label>Title</Label>
               <Input value={editingContent.title} onChange={e => setEditingContent({...editingContent, title: e.target.value})} className="font-semibold" />
             </div>
             
             <div className="space-y-2">
               <Label>Body Copy</Label>
               <Textarea 
                 value={editingContent.body} 
                 onChange={e => setEditingContent({...editingContent, body: e.target.value})} 
                 className="min-h-[300px] resize-y leading-relaxed" 
               />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
               <div className="space-y-2">
                 <Label>Hashtags</Label>
                 <Input value={editingContent.hashtags} onChange={e => setEditingContent({...editingContent, hashtags: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <Label>Internal Notes</Label>
                 <Input value={editingContent.notes} onChange={e => setEditingContent({...editingContent, notes: e.target.value})} />
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Content Library</h1>
          <p className="text-slate-500 mt-1 font-medium">All your generated drafts and published posts, stored securely.</p>
        </div>
        <Button onClick={() => navigate('/studio')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold">
          New Draft
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
             <div className="md:col-span-2 relative">
               <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
               <Input 
                 placeholder="Search titles or body copy..." 
                 value={search} 
                 onChange={e => setSearch(e.target.value)} 
                 className="pl-9 bg-white shadow-sm border-slate-200 focus:ring-indigo-500 w-full"
               />
             </div>
             <div>
                <Select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="bg-white shadow-sm font-medium text-slate-700 w-full">
                   <option value="All">All Brands</option>
                   <option value="ApexHRM">ApexHRM</option>
                   <option value="CV Pro">CV Pro</option>
                   <option value="1BT">1BT</option>
                </Select>
             </div>
             <div>
                <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white shadow-sm font-medium text-slate-700 w-full">
                   <option value="All">All Statuses</option>
                   <option value="Draft">Draft</option>
                   <option value="Needs Review">Needs Review</option>
                   <option value="Approved">Approved</option>
                   <option value="Copied for Posting">Copied</option>
                   <option value="Published Manually">Live</option>
                   <option value="Archived">Archived</option>
                </Select>
             </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           {filteredContents.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No content found</h3>
                <p className="text-slate-500 mt-2 max-w-sm text-sm">No drafts or published posts match your current filters. Adjust your search or create a new draft.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-b border-slate-100">
                      <TableHead className="font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-6">Title</TableHead>
                      <TableHead className="font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-4">Brand</TableHead>
                      <TableHead className="font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-4 hidden md:table-cell">Type</TableHead>
                      <TableHead className="font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-4">Status</TableHead>
                      <TableHead className="font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-4 hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-right font-semibold text-slate-600 tracking-wider text-xs uppercase h-10 px-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContents.map(c => (
                      <TableRow key={c.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                        <TableCell className="font-semibold text-slate-900 max-w-[250px] truncate px-6 py-4" title={c.title}>
                          {c.title}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
                              {c.brand.substring(0, 4)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell px-4 py-4">
                           <span className="text-sm text-slate-500">{c.type}</span>
                        </TableCell>
                         <TableCell className="px-4 py-4">
                          <Badge 
                            className={
                              c.status === 'Published Manually' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 
                              c.status === 'Approved' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 
                              c.status === 'Draft' || c.status === 'Needs Review' ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm':
                              'bg-slate-50 border-slate-200 text-slate-600'
                            }
                          >{c.status}</Badge>
                         </TableCell>
                         <TableCell className="text-slate-500 text-sm hidden sm:table-cell px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(c.createdDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                            </div>
                         </TableCell>
                         <TableCell className="text-right px-6 py-4">
                           <div className="flex justify-end items-center gap-3">
                             {c.manualUrl && (
                               <a href={c.manualUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors">
                                 View <ExternalLink className="w-3 h-3" />
                               </a>
                             )}
                             <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity font-medium h-8" onClick={() => setEditingContent(c)}>
                                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Open
                             </Button>
                           </div>
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
  );
}
