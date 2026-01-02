
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Search, 
  Download, 
  Calendar,
  CreditCard,
  LogIn,
  ShieldCheck,
  FileText,
  Printer,
  Users,
  Trophy,
  X,
  TrendingUp,
  ArrowDownToLine,
  Activity,
  History,
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
  PieChart, 
  Pie, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { PaymentRecord, ActivityLog, Student, User, ClassFeeStructure } from '../types';

interface ReportsProps {
  payments: PaymentRecord[];
  activityLogs: ActivityLog[];
  students: Student[];
  users: User[];
  isAdmin: boolean;
  structures: ClassFeeStructure[];
}

const Reports: React.FC<ReportsProps> = ({ payments, activityLogs, students, users, isAdmin, structures }) => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'COLLECTIONS' | 'LOGS' | 'CERTIFICATES'>('ANALYTICS');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<Student | null>(null);
  const [showCertPreview, setShowCertPreview] = useState(false);

  // Analytics: Monthly Collection
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ name: m, amount: 0 }));
    payments.forEach(p => {
      const monthIndex = new Date(p.date).getMonth();
      data[monthIndex].amount += p.amount;
    });
    return data;
  }, [payments]);

  // Analytics: Day-wise Collection (Last 30 Days)
  const dailyTrendData = useMemo(() => {
    const data: { date: string, amount: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dailyTotal = payments
        .filter(p => p.date.startsWith(dateStr))
        .reduce((sum, p) => sum + p.amount, 0);
      
      data.push({
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        amount: dailyTotal
      });
    }
    return data;
  }, [payments]);

  // Analytics: Class Strength
  const classStrengthData = useMemo(() => {
    const classes = Array.from(new Set(students.map(s => s.className))).sort();
    return classes.map(c => ({
      name: c,
      count: students.filter(s => s.className === c).length
    }));
  }, [students]);

  // Global Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const student = students.find(s => s.id === p.studentId);
      const matchesSearch = student?.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.receivedBy.toLowerCase().includes(search.toLowerCase()) ||
                            p.id.toLowerCase().includes(search.toLowerCase());
      const matchesDate = !dateFilter || p.date.startsWith(dateFilter);
      return matchesSearch && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, students, search, dateFilter]);

  // Global Filtered Logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const matchesSearch = log.userName.toLowerCase().includes(search.toLowerCase()) || 
                            log.details.toLowerCase().includes(search.toLowerCase());
      const matchesDate = !dateFilter || log.timestamp.startsWith(dateFilter);
      return matchesSearch && matchesDate;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activityLogs, search, dateFilter]);

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handlePrintCert = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 print:p-0">
      {/* Header section print:hidden */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Audit & Financial Hub</h2>
          <p className="text-slate-500 font-medium">Analytics, transaction history, and certificate generation.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
            { id: 'COLLECTIONS', label: 'Transaction Audit', icon: CreditCard },
            { id: 'CERTIFICATES', label: 'Certificates', icon: Trophy },
            ...(isAdmin ? [{ id: 'LOGS', label: 'System Logs', icon: History }] : [])
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'ANALYTICS' && (
        <div className="space-y-8 print:hidden">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><TrendingUp className="w-5 h-5" /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Collection</span>
              </div>
              <p className="text-2xl font-black text-slate-900">₹{totalCollected.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Users className="w-5 h-5" /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Strength</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{students.length} Students</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Activity className="w-5 h-5" /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Transaction</span>
              </div>
              <p className="text-2xl font-black text-slate-900">₹{payments.length ? Math.round(totalCollected / payments.length).toLocaleString('en-IN') : 0}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600"><ArrowDownToLine className="w-5 h-5" /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Payouts</span>
              </div>
              <p className="text-2xl font-black text-slate-900">₹0</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Trend */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Monthly Revenue
                </h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32}>
                      {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Day-wise Trend (Last 30 Days) */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Day-wise Collection Trend (30 Days)
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrendData}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Class Strength Pie Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Class-wise Enrollment
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classStrengthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {classStrengthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Class Strength Bar Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-rose-600" />
                Capacity Analysis
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={classStrengthData}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 800}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'CERTIFICATES' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-8 print:hidden">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="w-20 h-20 bg-amber-50 rounded-[2rem] mx-auto flex items-center justify-center text-amber-600 border border-amber-100">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Certificate Generation</h3>
            <p className="text-slate-500 font-medium">Generate formal Fee Clearance Certificates for students with settled accounts.</p>
            
            <div className="relative pt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search student name or roll no..."
                className="w-full pl-14 pr-4 py-5 rounded-[2rem] border-2 border-slate-100 bg-white text-black focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none font-bold transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students
              .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.includes(search))
              .slice(0, 9)
              .map(student => (
                <div key={student.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col justify-between group hover:border-indigo-200 hover:bg-white transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-indigo-600 shadow-sm">{student.name.charAt(0)}</div>
                      <div>
                        <h4 className="font-black text-slate-900 leading-tight">{student.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{student.className} • {student.rollNo}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${student.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {student.status}
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedStudentForCert(student); setShowCertPreview(true); }}
                    className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${student.status === 'PAID' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' : 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-50'}`}
                    disabled={student.status !== 'PAID'}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Generate Document
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {(activeTab === 'COLLECTIONS' || activeTab === 'LOGS') && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden print:hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={activeTab === 'COLLECTIONS' ? "Search transactions..." : "Search access logs..."}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-black focus:ring-4 focus:ring-indigo-50 outline-none font-bold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-black focus:ring-4 focus:ring-indigo-50 outline-none font-bold"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors text-slate-600">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'COLLECTIONS' ? (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-4">Transaction ID</th>
                    <th className="px-8 py-4">Student</th>
                    <th className="px-8 py-4">Operator</th>
                    <th className="px-8 py-4">Date & Time</th>
                    <th className="px-8 py-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map(p => {
                    const student = students.find(s => s.id === p.studentId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5 font-mono text-xs text-slate-400">#{p.id.slice(-8).toUpperCase()}</td>
                        <td className="px-8 py-5">
                          <div className="font-bold text-slate-900">{student?.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">{student?.className}</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium text-slate-600">{p.receivedBy}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-xs font-bold text-slate-900">{new Date(p.date).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">{new Date(p.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-indigo-600 text-lg">₹{p.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-4">System Event</th>
                    <th className="px-8 py-4">Personnel</th>
                    <th className="px-8 py-4">Description</th>
                    <th className="px-8 py-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className={`p-2 rounded-xl inline-flex ${log.action === 'LOGIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {log.action === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                        </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-900">{log.userName}</td>
                      <td className="px-8 py-5 text-slate-500 text-sm font-medium">{log.details}</td>
                      <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {showCertPreview && selectedStudentForCert && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:inset-auto">
          <div className="bg-white w-full max-w-[800px] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 print:shadow-none print:rounded-none">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="font-black text-slate-900 tracking-tight">Digital Clearance Artifact</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePrintCert}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  <Printer className="w-4 h-4" /> Print Document
                </button>
                <button onClick={() => setShowCertPreview(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-16 text-center space-y-12 relative overflow-hidden bg-white border-[16px] border-double border-indigo-50">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <GraduationCapIcon className="w-[500px] h-[500px]" />
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-indigo-900 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-xl">
                    <GraduationCapIcon className="w-10 h-10" />
                  </div>
                  <h1 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter">AKSHARA SCHOOL OF EXCELLENCE</h1>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Academic Financial Audit Office</p>
                </div>

                <div className="h-0.5 w-32 bg-indigo-100 mx-auto"></div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-serif italic text-slate-800">Fee Clearance Certificate</h2>
                  <p className="text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
                    This document serves as a formal attestation that the following student has fulfilled all financial obligations for the academic session <span className="font-black text-slate-900">{selectedStudentForCert.academicYear}</span>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-8 max-w-md mx-auto py-10 px-10 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100/50 text-left">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Student Name</p>
                    <p className="font-black text-indigo-900 text-lg">{selectedStudentForCert.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Number</p>
                    <p className="font-black text-indigo-900 text-lg">{selectedStudentForCert.rollNo}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade Level</p>
                    <p className="font-black text-indigo-900 text-lg">{selectedStudentForCert.className}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Verified On</p>
                    <p className="font-black text-indigo-900 text-lg">{new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                <div className="pt-16 flex justify-between items-end px-12">
                  <div className="text-left space-y-4">
                    <div className="w-32 h-px bg-slate-300"></div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">Controller of Accounts</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digital Verification ID: {selectedStudentForCert.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 border-[3px] border-emerald-500 rounded-full flex items-center justify-center text-emerald-500 rotate-[-12deg] opacity-70 bg-emerald-50/10">
                      <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-tighter">Verified</p>
                        <p className="font-black text-xl">SETTLED</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-4">
                    <div className="w-32 h-px bg-slate-300 ml-auto"></div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">School Principal</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Seal of Excellence</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-indigo-950 text-center print:hidden">
              <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.4em]">Official Institutional Record • EduPay Pro Blockchain Validated Document</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal icon helper to replace GraduationCap from lucide
const GraduationCapIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

export default Reports;
