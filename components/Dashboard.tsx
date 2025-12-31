
import React from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  User,
  Users2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Student, PaymentRecord, ClassFeeStructure } from '../types';

interface DashboardProps {
  students: Student[];
  payments: PaymentRecord[];
  structures: ClassFeeStructure[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, payments, structures }) => {
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDues = students.reduce((sum, s) => {
    const struct = structures.find(st => st.className === s.className);
    const expected = (struct?.total || 0) + s.previousYearDues - s.discount;
    return sum + (expected - s.totalPaid);
  }, 0);

  const stats = [
    { label: 'Total Students', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Collected', value: `₹${totalCollected.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Pending Dues', value: `₹${totalDues.toLocaleString('en-IN')}`, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Full Paid Students', value: students.filter(s => s.status === 'PAID').length, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  // Chart Data: Collection by Payment Type
  const chartData = [
    { name: 'Monthly', value: payments.filter(p => p.paymentType === 'MONTHLY').reduce((s, p) => s + p.amount, 0) },
    { name: 'Term', value: payments.filter(p => p.paymentType === 'TERM').reduce((s, p) => s + p.amount, 0) },
    { name: 'Yearly', value: payments.filter(p => p.paymentType === 'YEARLY').reduce((s, p) => s + p.amount, 0) },
    { name: 'Partial', value: payments.filter(p => p.paymentType === 'PART').reduce((s, p) => s + p.amount, 0) },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  // Calculate Class-wise Particulars
  const uniqueClasses = Array.from(new Set(students.map(s => s.className))).sort();
  const classEnrollment = uniqueClasses.map(className => {
    const classStudents = students.filter(s => s.className === className);
    return {
      className,
      total: classStudents.length,
      boys: classStudents.filter(s => s.gender === 'Male').length,
      girls: classStudents.filter(s => s.gender === 'Female').length
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Overview</h1>
          <p className="text-slate-500 mt-1">Real-time status of fee collections and enrollment.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm text-slate-600">
          Academic Year: <span className="font-bold text-slate-900">2024-25</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Collections by Type</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users2 className="w-5 h-5 text-indigo-600" />
            School Strength
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Total Active Students</p>
                <p className="text-3xl font-black text-indigo-900">{students.length}</p>
              </div>
              <Users className="w-10 h-10 text-indigo-200" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase">Boys</p>
                <p className="text-xl font-black text-blue-900">{students.filter(s => s.gender === 'Male').length}</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-[10px] font-bold text-rose-600 uppercase">Girls</p>
                <p className="text-xl font-black text-rose-900">{students.filter(s => s.gender === 'Female').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class-wise Roll Particulars Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900">Class-wise Roll Particulars</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classEnrollment.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-bold text-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {item.className}
                </span>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Strength</p>
                  <p className="text-lg font-black text-slate-900">{item.total}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Boys</p>
                    <p className="text-sm font-bold text-slate-700">{item.boys}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Girls</p>
                    <p className="text-sm font-bold text-slate-700">{item.girls}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
