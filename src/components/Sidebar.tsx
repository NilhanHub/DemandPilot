import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Edit3, Send, Calendar, Settings, Activity, Layers, LogOut, Cloud, PenTool, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, logout } from '../lib/firebase';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Keyword Lab', href: '/keywords', icon: Layers },
  { name: 'Campaign Builder', href: '/studio', icon: PenTool },
  { name: 'Test Publisher', href: '/test-publisher', icon: PenTool },
  { name: 'LinkedIn Post', href: '/linkedin', icon: Share2 },
  { name: 'Content Library', href: '/library', icon: FileText },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Brand Settings', href: '/settings', icon: Settings },
  { name: 'Connectors', href: '/connectors', icon: Activity },
];

export function Sidebar() {
  const location = useLocation();
  const user = auth.currentUser;

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-slate-50 px-4 py-6">
      <div className="mb-8 flex items-center px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
          <Activity className="h-5 w-5" />
        </div>
        <span className="ml-3 text-lg font-bold text-slate-900 tracking-tight">DemandPilot</span>
      </div>
      <nav className="flex-1 space-y-1 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-slate-700 transition-all",
                isActive ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "hover:bg-slate-200/50 hover:text-slate-900 transparent border border-transparent"
              )}
            >
              <item.icon className={cn("mr-3 h-4 w-4 flex-shrink-0", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2 space-y-4">
        <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-100 flex items-start gap-3 shadow-sm">
          <Cloud className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[13px] font-semibold text-emerald-900">Cloud Beta</h4>
            <p className="mt-0.5 text-[11px] font-medium text-emerald-700">Saved to Firebase</p>
          </div>
        </div>
        
        {user && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3 px-2 mb-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full shadow-sm" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-[13px] font-medium text-slate-900 truncate">
                  {user.displayName || 'Pilot User'}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 transition-colors border border-transparent"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out securely
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
