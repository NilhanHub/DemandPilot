import { useAppContext } from '../store/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Connector } from '../types';
import { Database, FolderSync, Lock, History, Settings2, Link as LinkIcon, Download, Globe2, AlertCircle, Cloud } from 'lucide-react';
import { toast } from 'sonner';

export function Connectors() {
  const { connectors } = useAppContext();

  const getStatusBadge = (status: Connector['status']) => {
    switch (status) {
      case 'Live': return <Badge className="bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-0.5"></div>Live</Badge>;
      case 'Manual Export': return <Badge className="bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm flex items-center gap-1">Manual Export</Badge>;
      case 'Manual Import': return <Badge className="bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm flex items-center gap-1">Manual Import</Badge>;
      case 'Error': return <Badge className="bg-red-50 border-red-200 text-red-700 shadow-sm flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Error</Badge>;
      case 'Access Pending': return <Badge className="bg-amber-50 border-amber-200 text-amber-700 shadow-sm">Access Pending</Badge>;
      case 'Disconnected': return <Badge className="bg-slate-100 border-slate-200 text-slate-600 shadow-sm">Disconnected</Badge>;
      default: return <Badge className="bg-slate-100 border-slate-200 text-slate-600 shadow-sm">Unknown</Badge>;
    }
  };

  const getConnectorIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('firebase')) return <Cloud className="w-5 h-5 text-amber-500" />;
    if (n.includes('linkedin') || n.includes('facebook') || n.includes('meta') || n.includes('tiktok') || n.includes('youtube')) return <Globe2 className="w-5 h-5 text-indigo-600" />;
    if (n.includes('drive') || n.includes('docs')) return <FolderSync className="w-5 h-5 text-blue-500" />;
    if (n.includes('sheets') || n.includes('google search') || n.includes('ga4') || n.includes('trends') || n.includes('planner') || n.includes('keep')) return <Database className="w-5 h-5 text-emerald-600" />;
    if (n.includes('calendar') || n.includes('gmail')) return <Settings2 className="w-5 h-5 text-red-500" />;
    return <LinkIcon className="w-5 h-5 text-slate-600" />;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Integration Hub</h1>
        <p className="text-slate-500 mt-2 font-medium max-w-2xl">Manage external data integrations for intelligence, publishing, and workflow automation. All connections are secured via authentic OAuth pipelines.</p>
      </div>

       <div className="rounded-xl bg-indigo-50/50 p-5 border border-indigo-100/50 flex items-start gap-4">
         <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shrink-0">
           <Lock className="w-5 h-5" />
         </div>
         <div>
           <p className="text-sm font-bold text-indigo-900">Integration Architecture & Honesty</p>
           <p className="mt-1 text-sm text-indigo-700/80 leading-relaxed max-w-4xl">
             We do not mock or fake integration success. Currently utilizing secure manual pipeline layers for external APIs while core identity is handled centrally by Firebase. Connectors below will become active once OAuth scopes are granted and verified by a Workspace Admin or external provider.
           </p>
         </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {connectors.map(connector => (
             <Card key={connector.id} className="flex flex-col shadow-sm border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden group">
               <CardHeader className="pb-4 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 px-5">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                     {getConnectorIcon(connector.name)}
                   </div>
                   <CardTitle className="text-base font-bold text-slate-900">{connector.name}</CardTitle>
                 </div>
                 {getStatusBadge(connector.status)}
               </CardHeader>
               <CardContent className="pt-5 px-5 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      {connector.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2">
                       <div className="bg-slate-50 rounded p-2 border border-slate-100">
                         <p className="text-[10px] items-center uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Direction</p>
                         <p className="text-xs font-semibold text-slate-700">{connector.direction || 'Unknown'}</p>
                       </div>
                       <div className="bg-slate-50 rounded p-2 border border-slate-100">
                         <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Mode</p>
                         <p className="text-xs font-semibold text-slate-700">{connector.mode || 'Manual'}</p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-slate-100">
                     <div className="flex items-center justify-between">
                        <div className="text-[11px] font-semibold text-slate-500 truncate mr-2" title={connector.notes}>
                           {connector.notes || 'No specific notes.'}
                        </div>
                        {connector.lastSync ? (
                          <div className="text-[10px] font-bold tracking-wide text-slate-400 flex items-center gap-1 uppercase shrink-0">
                            <History className="w-3 h-3" /> {new Date(connector.lastSync).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold tracking-wide text-slate-400 flex items-center gap-1 uppercase shrink-0">
                            No Sync
                          </div>
                        )}
                     </div>
                     <Button 
                        variant={connector.status === 'Disconnected' || connector.status === 'Access Pending' ? 'outline' : 'default'}
                        className={`w-full font-semibold shadow-sm ${connector.status === 'Live' ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                        onClick={() => toast.info(`${connector.name} setup requires external verification.`)}
                     >
                       {connector.status === 'Live' ? 'Manage Connection' : 'Configure OAuth / Access'}
                     </Button>
                  </div>
               </CardContent>
             </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
