
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Users, 
  User,
  Users2,
  Table as TableIcon,
  CalendarCheck,
  BarChart3, 
  CalendarDays,
  Calendar,
  ChevronDown,
  Wallet
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
  Area
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
  selectedSession, 
  onSessionChange 
}) => {
  const availableSessions = ['2023-24', '2024-25', '2025-26'];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter data based on selected session
  const filteredStudents = useMemo(() => 
    students.filter(s => s.academicYear === selectedSession),
    [students, selectedSession]
  );

  const filteredPayments = useMemo(() => {
    const studentIdsInSession = new Set(filteredStudents.map(s => s.id));
    return payments.filter(p => studentIdsInSession.has(p.studentId));
  }, [payments, filteredStudents]);

  const filteredStructures = useMemo(() => 
    structures.filter(s => s.academicYear === selectedSession),
    [structures, selectedSession]
  );

  // Filter payments for current month
  const monthlyPayments = filteredPayments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyCollection = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
  const monthlyPaidCount = monthlyPayments.length;
  
  // Total Collection for the session (Amount in Hand)
  const totalCollectedSession = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalDues = filteredStudents.reduce((sum, s) => {
    const struct = filteredStructures.find(st => st.className === s.className);
    const expected = (struct?.total || 0) + s.previousYearDues - s.discount;
    return sum + (expected - s.totalPaid);
  }, 0);

  const stats = [
    { 
      label: 'Total Students', 
      value: filteredStudents.length, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      label: 'Monthly Collection', 
      value: `₹${monthlyCollection.toLocaleString('en-IN')}`, 
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100' 
    },
    { 
      label: 'Monthly Paid Count', 
      value: monthlyPaidCount, 
      icon: CalendarCheck, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-100' 
    },
    { 
      label: 'Pending Dues', 
      value: `₹${totalDues.toLocaleString('en-IN')}`, 
      icon: AlertCircle, 
      color: 'text-rose-600', 
      bg: 'bg-rose-100' 
    },
    ...(isAdmin ? [{ 
      label: 'Amount In Hand', 
      value: `₹${totalCollectedSession.toLocaleString('en-IN')}`, 
      icon: Wallet, 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-50 border border-emerald-100' 
    }] : []),
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dayWiseData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const amount = monthlyPayments
      .filter(p => new Date(p.date).getDate() === day)
      .reduce((s, p) => s + p.amount, 0);
    return { day, amount };
  });

  const academicMonths = [
    { name: 'Jun', month: 5, yearOffset: 0 },
    { name: 'Jul', month: 6, yearOffset: 0 },
    { name: 'Aug', month: 7, yearOffset: 0 },
    { name: 'Sep', month: 8, yearOffset: 0 },
    { name: 'Oct', month: 9, yearOffset: 0 },
    { name: 'Nov', month: 10, yearOffset: 0 },
    { name: 'Dec', month: 11, yearOffset: 0 },
    { name: 'Jan', month: 0, yearOffset: 1 },
    { name: 'Feb', month: 1, yearOffset: 1 },
    { name: 'Mar', month: 2, yearOffset: 1 },
    { name: 'Apr', month: 3, yearOffset: 1 },
    { name: 'May', month: 4, yearOffset: 1 },
  ];

  const sessionStartYear = parseInt(selectedSession.split('-')[0]) || 2024;

  const monthlyTrendData = academicMonths.map(({ name, month, yearOffset }) => {
    const targetYear = sessionStartYear + yearOffset;
    const amount = filteredPayments
      .filter(p => {
        const d = new Date(p.date);
        return d.getMonth() === month && d.getFullYear() === targetYear;
      })
      .reduce((s, p) => s + p.amount, 0);
    
    const isCurrent = now.getMonth() === month && now.getFullYear() === targetYear;
    return { name, amount, isCurrent };
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-visible">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Monitoring collection cycles and enrollment density.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:self-start mt-2 lg:mt-0">
          <div className="relative group">
            {isAdmin ? (
              <>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Set Global Session</span>
                </div>
                <div className="relative min-w-[160px]">
                  <select
                    value={selectedSession}
                    onChange={(e) => onSessionChange(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-xs font-black py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all hover:bg-slate-100 uppercase tracking-wider"
                  >
                    {availableSessions.map((session) => (
                      <option key={session} value={session} className="font-bold py-2">
                        Session {session}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Current Session</span>
                </div>
                <div className="bg-slate-100 text-slate-900 text-xs font-black py-2.5 px-4 rounded-xl uppercase tracking-wider border border-slate-200 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  {selectedSession}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center lg:items-start lg:text-left lg:flex-row lg:items-center gap-5 transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform flex-shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="overflow-hidden w-full">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{stat.label}</p>
              <p className="text-xl xl:text-2xl font-black text-slate-900 tracking-tight truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                Daily Collection Flow
              </h3>
              <p className="text-xs text-slate-400 font-medium">Current Month Performance</p>
            </div>
            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
              {monthNames[currentMonth]} {currentYear}
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dayWiseData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Received']}
                />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Annual Collection Trend
              </h3>
              <p className="text-xs text-slate-400 font-medium">Academic Cycle (Jun - May)</p>
            </div>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
              Session {selectedSession}
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {monthlyTrendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#10b981' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <TableIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Class Roll Particulars</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Enrolled session: {selectedSession}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Class</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Boys</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Girls</th>
                  <th className="px-10 py-6 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] text-right">Total Strength</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classEnrollment.length > 0 ? classEnrollment.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:scale-110 shadow-sm">
                          {(item.className as string).match(/\d+/)?.[0] || 'C'}
                        </div>
                        <span className="font-black text-slate-900 text-lg tracking-tight">{item.className}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[11px] font-black uppercase border border-blue-100/50">
                        <User className="w-3.5 h-3.5" /> {item.boys}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-700 rounded-xl text-[11px] font-black uppercase border border-rose-100/50">
                        <User className="w-3.5 h-3.5" /> {item.girls}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="text-2xl font-black text-slate-900 tracking-tighter">
                        {item.total}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-20 text-center">
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">No student data for session {selectedSession}</p>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-indigo-900 border-t border-indigo-800">
                <tr>
                  <td className="px-10 py-6 font-black text-indigo-200 text-xs uppercase tracking-[0.2em]">Consolidated Strength</td>
                  <td className="px-10 py-6 text-center font-black text-white text-lg">
                    {classEnrollment.reduce((acc, curr) => acc + curr.boys, 0)}
                  </td>
                  <td className="px-10 py-6 text-center font-black text-white text-lg">
                    {classEnrollment.reduce((acc, curr) => acc + curr.girls, 0)}
                  </td>
                  <td className="px-10 py-6 text-right font-black text-white text-3xl tracking-tighter">
                    {filteredStudents.length}
                  </td>
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
