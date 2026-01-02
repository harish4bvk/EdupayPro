
// Add missing default export and close truncated JSX tags.
import React, { useMemo, useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Users, 
  User,
  Table as TableIcon,
  BarChart3, 
  CalendarDays, 
  Calendar,
  ChevronDown,
  Wallet,
  Smartphone,
  Banknote,
  GraduationCap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { Student, PaymentRecord, ClassFeeStructure } from '../types';

interface DashboardProps {
  students: Student[];
  payments: PaymentRecord[];
  structures: ClassFeeStructure[];
  isAdmin: boolean;
  selectedSession: string;
  onSessionChange: (session: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  students, 
  payments, 
  structures, 
  isAdmin, 
  selectedSession
}) => {
  // Local state for Dashboard viewing defaults to global session
  const [viewSession, setViewSession] = useState(selectedSession);
  const availableSessions = ['2023-24', '2024-25', '2025-26'];

  // Sync with global session if it changes externally
  useEffect(() => {
    setViewSession(selectedSession);
  }, [selectedSession]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filteredStudents = useMemo(() => 
    students.filter(s => s.academicYear === viewSession),
    [students, viewSession]
  );

  const filteredPayments = useMemo(() => {
    const studentIdsInSession = new Set(filteredStudents.map(s => s.id));
    return payments.filter(p => studentIdsInSession.has(p.studentId));
  }, [payments, filteredStudents]);

  const filteredStructures = useMemo(() => 
    structures.filter(s => s.academicYear === viewSession),
    [structures, viewSession]
  );

  const monthlyPayments = filteredPayments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyCollection = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
  const monthlyCashCount = monthlyPayments.filter(p => p.method === 'CASH').length;
  const monthlyOnlineCount = monthlyPayments.filter(p => p.method === 'ONLINE').length;
  const totalCollectedSession = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalDues = filteredStudents.reduce((sum, s) => {
    const struct = filteredStructures.find(st => st.className === s.className);
    const expected = (struct?.total || 0) + s.previousYearDues - s.discount;
    return sum + (expected - s.totalPaid);
  }, 0);

  const stats = [
    { label: 'Total Students', value: filteredStudents.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Monthly Collection', value: `₹${monthlyCollection.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Cash Payments', value: monthlyCashCount, icon: Banknote, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'UPI Payments', value: monthlyOnlineCount, icon: Smartphone, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Pending Dues', value: `₹${totalDues.toLocaleString('en-IN')}`, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
    ...(isAdmin ? [{ label: 'Amount In Hand', value: `₹${totalCollectedSession.toLocaleString('en-IN')}`, icon: Wallet, color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-100' }] : []),
  ];

  // Generate metrics for only the last 5 days
  const dailyMetrics = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - i)); // Go back 4 days, then 3, 2, 1, 0 (today)
    const dayDate = d.getDate();
    const dayMonth = d.getMonth();
    const dayYear = d.getFullYear();
    
    const dayPayments = filteredPayments.filter(p => {
      const pd = new Date(p.date);
      return pd.getDate() === dayDate && pd.getMonth() === dayMonth && pd.getFullYear() === dayYear;
    });

    const cashAmount = dayPayments.filter(p => p.method === 'CASH').reduce((s, p) => s + p.amount, 0);
    const onlineAmount = dayPayments.filter(p => p.method === 'ONLINE').reduce((s, p) => s + p.amount, 0);
    
    // Format label as "DD MMM"
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    
    return { day: label, cashAmount, onlineAmount, total: cashAmount + onlineAmount };
  });

  const academicMonths = [
    { name: 'Jun', month: 5, yearOffset: 0 }, { name: 'Jul', month: 6, yearOffset: 0 }, { name: 'Aug', month: 7, yearOffset: 0 },
    { name: 'Sep', month: 8, yearOffset: 0 }, { name: 'Oct', month: 9, yearOffset: 0 }, { name: 'Nov', month: 10, yearOffset: 0 },
    { name: 'Dec', month: 11, yearOffset: 0 }, { name: 'Jan', month: 0, yearOffset: 1 }, { name: 'Feb', month: 1, yearOffset: 1 },
    { name: 'Mar', month: 2, yearOffset: 1 }, { name: 'Apr', month: 3, yearOffset: 1 }, { name: 'May', month: 4, yearOffset: 1 },
  ];

  const sessionStartYear = parseInt(viewSession.split('-')[0]) || 2024;
  const monthlyTrendData = academicMonths.map(({ name, month, yearOffset }) => {
    const targetYear = sessionStartYear + yearOffset;
    const amount = filteredPayments.filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === month && d.getFullYear() === targetYear;
    }).reduce((s, p) => s + p.amount, 0);
    const isCurrent = now.getMonth() === month && now.getFullYear() === targetYear;
    return { name, amount, isCurrent };
  });

  const uniqueClasses = Array.from(new Set(filteredStudents.map(s => s.className))).sort();
  const classEnrollment = uniqueClasses.map(className => {
    const classStudents = filteredStudents.filter(s => s.className === className);
    return {
      className,
      total: classStudents.length,
      boys: classStudents.filter(s => s.gender === 'Male').length,
      girls: classStudents.filter(s => s.gender === 'Female').length
    };
  });

  const grandTotalStudents = classEnrollment.reduce((sum, item) => sum + item.total, 0);
  const grandTotalBoys = classEnrollment.reduce((sum, item) => sum + item.boys, 0);
  const grandTotalGirls = classEnrollment.reduce((sum, item) => sum + item.girls, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-visible">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white"><BarChart3 className="w-6 h-6" /></div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Analytics for the selected viewing session.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:self-start mt-2 lg:mt-0">
          <div className="relative group">
            <div className="flex items-center gap-2 mb-1.5 px-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Academic year</span>
            </div>
            <div className="relative min-w-[160px]">
              <select
                value={viewSession}
                onChange={(e) => setViewSession(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-black text-xs font-black py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-50/20 focus:border-indigo-500 cursor-pointer transition-all hover:bg-slate-50 uppercase tracking-wider"
              >
                {availableSessions.map((session) => (
                  <option key={session} value={session} className="font-bold py-2 text-black">Session {session}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400"><ChevronDown className="w-4 h-4" /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform mb-4`}><stat.icon className="w-5 h-5" /></div>
            <div className="overflow-hidden w-full">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 tracking-tight truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-8"><CalendarDays className="w-5 h-5 text-indigo-600" />Last 5 Days Collection Flow</h3>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyMetrics}>
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dx={-10} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`]} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
                <Area name="Cash" type="monotone" dataKey="cashAmount" stackId="1" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
                <Area name="UPI" type="monotone" dataKey="onlineAmount" stackId="1" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorOnline)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Strength Particulars Table */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <TableIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Student Strength</h3>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Boys</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Girls</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {classEnrollment.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        <span className="font-bold text-slate-700 text-sm">{item.className}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-xs font-medium text-slate-500">{item.boys}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-xs font-medium text-slate-500">{item.girls}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm font-black text-slate-900">{item.total}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-indigo-50/50 border-t-2 border-indigo-100">
                  <td className="py-4 font-black text-indigo-900 text-xs uppercase tracking-widest">Total Strength</td>
                  <td className="py-4 text-center font-black text-indigo-700 text-xs">{grandTotalBoys}</td>
                  <td className="py-4 text-center font-black text-indigo-700 text-xs">{grandTotalGirls}</td>
                  <td className="py-4 text-right font-black text-indigo-900 text-sm">{grandTotalStudents}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
