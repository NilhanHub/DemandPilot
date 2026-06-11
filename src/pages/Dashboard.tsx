import { useAppContext } from '../store/AppContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { FileText, Send, Activity, Layers, ArrowRight, CheckCircle2, ChevronRight, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { keywords, contents, connectors } = useAppContext();
  const navigate = useNavigate();

  const activeKeywords = keywords.filter(k => k.status !== 'Rejected');
  const drafts = contents.filter(c => c.status === 'Draft');
  const ready = contents.filter(c => c.status === 'Needs Review' || c.status === 'Approved');
  const posted = contents.filter(c => c.status === 'Published Manually');

  const recentActivity = [...contents].sort((a,b) => b.createdDate.localeCompare(a.createdDate)).slice(0, 5);

  const topContentType = contents.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topType = Object.keys(topContentType).length > 0 ? Object.keys(topContentType).sort((a, b) => topContentType[b] - topContentType[a])[0] : 'None yet';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium">Find demand. Create content. Track what wins.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Keywords Bank</p>
                <h3 className="text-3xl font-bold text-slate-900">{activeKeywords.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Saved target keywords</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Active Drafts</p>
                <h3 className="text-3xl font-bold text-slate-900">{drafts.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <PenTool className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Work in progress</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Ready for Review</p>
                <h3 className="text-3xl font-bold text-slate-900">{ready.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Needs approval</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Published</p>
                <h3 className="text-3xl font-bold text-slate-900">{posted.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Manually posted</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight">Next Best Action</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Card className="shadow-sm hover:border-indigo-200 transition-colors cursor-pointer group" onClick={() => navigate('/keywords')}>
               <CardContent className="p-5">
                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                   1
                 </div>
                 <h3 className="font-semibold text-slate-900 mb-1">Add Keywords</h3>
                 <p className="text-xs text-slate-500 h-10">Expand your content targets in the Keyword Lab.</p>
                 <div className="mt-4 flex items-center text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                   Open Lab <ArrowRight className="w-3 h-3 ml-1" />
                 </div>
               </CardContent>
             </Card>

             <Card className="shadow-sm hover:border-blue-200 transition-colors cursor-pointer group" onClick={() => navigate('/studio')}>
               <CardContent className="p-5">
                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                   2
                 </div>
                 <h3 className="font-semibold text-slate-900 mb-1">Generate Draft</h3>
                 <p className="text-xs text-slate-500 h-10">Turn a keyword into a fresh content draft.</p>
                 <div className="mt-4 flex items-center text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                   Open Studio <ArrowRight className="w-3 h-3 ml-1" />
                 </div>
               </CardContent>
             </Card>

             <Card className="shadow-sm hover:border-emerald-200 transition-colors cursor-pointer group" onClick={() => navigate('/publish')}>
               <CardContent className="p-5">
                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                   3
                 </div>
                 <h3 className="font-semibold text-slate-900 mb-1">Publish</h3>
                 <p className="text-xs text-slate-500 h-10">Review and copy drafts to LinkedIn.</p>
                 <div className="mt-4 flex items-center text-xs font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                   Open Publisher <ArrowRight className="w-3 h-3 ml-1" />
                 </div>
               </CardContent>
             </Card>
          </div>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Content Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentActivity.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <Activity className="w-8 h-8 text-slate-300 mb-3" />
                   <p className="text-sm font-medium text-slate-700">No activity yet</p>
                   <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Save content to see your timeline here.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentActivity.map(c => (
                    <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/library')}>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shadow-sm">
                           {c.brand.substring(0,2)}
                         </div>
                         <div>
                           <div className="font-medium text-sm text-slate-900">{c.title}</div>
                           <div className="text-xs text-slate-500 mt-0.5">{c.type} • {new Date(c.createdDate).toLocaleDateString()}</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={
                          c.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                          c.status === 'Published Manually' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }>{c.status}</Badge>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-slate-200 bg-slate-50">
            <CardHeader className="pb-3 border-b border-slate-100 bg-white rounded-t-xl">
               <CardTitle className="text-base items-center flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 Data Status
               </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-sm text-slate-600">
               <div>
                  <div className="font-medium text-slate-900 mb-1">Persistence</div>
                  <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-none font-semibold shadow-sm">Cloud Beta — Firebase Active</Badge>
               </div>
               <div className="pt-3 border-t border-slate-200">
                 <div className="font-medium text-slate-900 mb-1">Search Analytics</div>
                 <div className="text-slate-500 text-xs leading-relaxed">
                   Live search data is disabled. Keywords are managed manually.
                 </div>
               </div>
               <div className="pt-3 border-t border-slate-200">
                 <div className="font-medium text-slate-900 mb-1">Top Format</div>
                 <div className="font-medium text-indigo-600">{topType}</div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
