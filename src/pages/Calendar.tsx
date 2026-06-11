import { useState } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { useAppContext } from '../store/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Calendar() {
  const { contents } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();

  const onNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const onPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const getBrandColors = (brand: string) => {
    switch (brand) {
      case 'ApexHRM': return 'bg-blue-50 border-blue-100 text-blue-800';
      case 'CV Pro': return 'bg-emerald-50 border-emerald-100 text-emerald-800';
      case '1BT': return 'bg-purple-50 border-purple-100 text-purple-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      // Filter contents for this exact day by plannedDate or createdDate
      const dayContents = contents.filter(c => {
         const d = c.plannedDate ? new Date(c.plannedDate) : new Date(c.createdDate);
         return isSameDay(d, cloneDay);
      });

      const isToday = isSameDay(day, new Date());
      const isCurrentMonth = isSameMonth(day, monthStart);

      days.push(
        <div
          className={`min-h-[140px] p-2 border-r border-b border-slate-100 transition-colors group ${
            !isCurrentMonth
              ? "bg-slate-50/50 text-slate-400"
              : isToday 
                ? "bg-indigo-50/20" 
                : "bg-white hover:bg-slate-50/80"
          }`}
          key={day.toISOString()}
        >
          <div className="flex justify-between items-center pr-1 pt-1 mb-2">
             <div className="opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="w-5 h-5 rounded-md hover:bg-slate-200 flex items-center justify-center text-slate-400">
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
               </button>
             </div>
             <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
               isToday ? "bg-indigo-600 text-white shadow-sm" : isCurrentMonth ? "text-slate-700" : "text-slate-400"
             }`}>{formattedDate}</span>
          </div>
          <div className="space-y-1.5 px-0.5 max-h-[100px] overflow-y-auto no-scrollbar">
             {dayContents.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => navigate('/library', { state: { editContentId: c.id } })}
                  className={`text-[11px] p-1.5 rounded-md border flex items-center gap-1.5 truncate shadow-sm cursor-pointer hover:shadow transition-shadow ${
                  getBrandColors(c.brand)
                } ${c.status === 'Published Manually' ? 'opacity-70' : ''}`} title={c.title}>
                   {c.status === 'Published Manually' && <CheckCircle2 className={`w-3 h-3 shrink-0 ${c.brand === 'CV Pro' ? 'text-emerald-500' : c.brand === 'ApexHRM' ? 'text-blue-500' : c.brand === '1BT' ? 'text-purple-500' : 'text-slate-500'}`} />}
                   <span className="font-bold opacity-60 shrink-0">{c.brand.substring(0,3).toUpperCase()}</span>
                   <span className="truncate">{c.title}</span>
                </div>
             ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toISOString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
         <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Timeline</h1>
          <p className="text-slate-500 mt-1 font-medium">Plan and review your brand distribution visually.</p>
        </div>
        <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
           <Button variant="ghost" size="sm" className="bg-white shadow-sm font-semibold text-slate-900 py-1.5">Month</Button>
           <Button variant="ghost" size="sm" className="text-slate-500 font-medium py-1.5 hover:text-slate-900 focus:bg-white focus:text-slate-900 focus:shadow-sm">Week</Button>
           <Button variant="ghost" size="sm" className="text-slate-500 font-medium py-1.5 hover:text-slate-900 focus:bg-white focus:text-slate-900 focus:shadow-sm">List</Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm rounded-xl bg-white">
         <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h2>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onPrevMonth} className="h-9 w-9 p-0 border-slate-200 hover:bg-slate-100"><ChevronLeft className="h-4 w-4 text-slate-600" /></Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())} className="h-9 px-4 border-slate-200 hover:bg-slate-100 font-medium text-slate-600">Today</Button>
              <Button variant="outline" size="sm" onClick={onNextMonth} className="h-9 w-9 p-0 border-slate-200 hover:bg-slate-100"><ChevronRight className="h-4 w-4 text-slate-600" /></Button>
            </div>
         </CardHeader>
         <div className="flex-1 bg-slate-50/30 overflow-y-auto">
             <div className="grid grid-cols-7 border-b border-slate-100 bg-white">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                   <div key={d} className="py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 border-r border-slate-100 last:border-r-0">
                     {d}
                   </div>
                ))}
             </div>
             <div className="flex flex-col border-l border-slate-100">
                {rows}
             </div>
         </div>
      </Card>
    </div>
  );
}
