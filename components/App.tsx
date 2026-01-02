
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import PaymentModule from './components/PaymentModule';
import UserManagement from './components/UserManagement';
import FeeStructureManagement from './components/FeeStructureManagement';
import Reports from './components/Reports';
import { storageService } from '../services/storageService';
import { 
  User, 
  UserRole, 
  AppView, 
  Student, 
  PaymentRecord, 
  ClassFeeStructure,
  ActivityLog 
} from '../types';
import { 
  GraduationCap, 
  ShieldCheck, 
  Lock, 
  ArrowLeft,
  AlertCircle,
  User as UserIcon,
  TrendingUp,
  CreditCard
} from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AppView>('DASHBOARD');
  const [globalSession, setGlobalSession] = useState('2024-25');
  
  // App State from Service
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [structures, setStructures] = useState<ClassFeeStructure[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Auth flow states
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Connect to the "Mock Backend" Service
  useEffect(() => {
    const updateState = () => {
      setUsers(storageService.getUsers());
      setStudents(storageService.getStudents());
      setPayments(storageService.getPayments());
      setStructures(storageService.getStructures());
      setActivityLogs(storageService.getLogs());
    };

    updateState();
    return storageService.subscribe(updateState);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === username && u.password === password && (pendingRole ? u.role === pendingRole : true));
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials or role mismatch.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPendingRole(null);
  };

  const onAddPayment = async (payment: PaymentRecord) => {
    if (currentUser) {
      await storageService.addPayment(payment, currentUser);
    }
  };

  const onAddStudents = async (newStudents: Student[]) => {
    if (currentUser) {
      await storageService.addStudents(newStudents, currentUser);
    }
  };

  const onApplyDiscount = async (studentId: string, discount: number) => {
    if (currentUser) {
      await storageService.applyDiscount(studentId, discount, currentUser);
    }
  };

  const renderView = () => {
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    switch (activeView) {
      case 'DASHBOARD':
        return <Dashboard 
          students={students} 
          payments={payments} 
          structures={structures} 
          isAdmin={isAdmin}
          selectedSession={globalSession}
          onSessionChange={setGlobalSession}
        />;
      case 'STUDENTS':
        return <StudentManagement 
          students={students} 
          structures={structures}
          onAddStudents={onAddStudents}
          onApplyDiscount={onApplyDiscount}
          onCollectFee={() => setActiveView('COLLECTION')}
          isAdmin={isAdmin}
          currentSession={globalSession}
        />;
      case 'COLLECTION':
        return <PaymentModule 
          students={students} 
          structures={structures}
          onAddPayment={onAddPayment}
          currentUser={currentUser}
          currentSession={globalSession}
        />;
      case 'REPORTS':
        return <Reports 
          payments={payments} 
          activityLogs={activityLogs} 
          students={students}
          users={users}
          isAdmin={isAdmin}
          structures={structures}
        />;
      case 'FEE_STRUCTURE':
        return isAdmin ? <FeeStructureManagement 
          structures={structures}
          onAddStructure={(s) => {}} // Implement in StorageService if needed
          onUpdateStructure={(s) => {}}
          onDeleteStructure={(id) => {}}
          isAdmin={isAdmin}
        /> : null;
      case 'USERS':
        return isAdmin ? <UserManagement 
          users={users} 
          onAddUser={() => {}}
          onUpdateUser={() => {}}
          onDeleteUser={() => {}}
          globalSession={globalSession}
          onSessionChange={setGlobalSession}
          isAdmin={isAdmin}
          students={students}
          payments={payments}
          structures={structures}
        /> : null;
      default:
        return <Dashboard 
          students={students} 
          payments={payments} 
          structures={structures} 
          isAdmin={isAdmin}
          selectedSession={globalSession}
          onSessionChange={setGlobalSession}
        />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-[3rem] shadow-2xl shadow-indigo-200/50 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-indigo-900 p-12 lg:p-16 flex flex-col justify-between text-white relative">
            <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="bg-white p-2.5 rounded-2xl shadow-xl shadow-white/10">
                  <GraduationCap className="w-8 h-8 text-indigo-900" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white">EduPay Pro</h1>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
                AKSHARA SCHOOL <br />
                <span className="text-indigo-400">Financial Suite.</span>
              </h2>
              <p className="text-indigo-200 text-lg max-w-sm font-medium leading-relaxed">
                Streamlining fee collection, automated billing, and insightful financial reporting for modern institutions.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-300">Live Insights</p>
                  <p className="text-sm font-bold text-white">Cloud Service Active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-12 lg:p-16 flex flex-col justify-center bg-white">
            {!pendingRole ? (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h3>
                  <p className="text-slate-500 font-medium">Please select your operational portal to continue.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { role: UserRole.ADMIN, label: 'Administrator Portal', desc: 'System management & settings', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { role: UserRole.STAFF, label: 'Staff Portal', desc: 'Fee collection & student management', icon: UserIcon, color: 'text-slate-600', bg: 'bg-slate-50' }
                  ].map((portal) => (
                    <button
                      key={portal.role}
                      onClick={() => setPendingRole(portal.role)}
                      className="flex items-center gap-5 p-6 rounded-3xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left group"
                    >
                      <div className={`${portal.bg} ${portal.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                        <portal.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{portal.label}</p>
                        <p className="text-sm text-slate-500 font-medium">{portal.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <button 
                  onClick={() => setPendingRole(null)}
                  className="flex items-center gap-2 text-sm font-black text-indigo-600 uppercase tracking-widest hover:gap-3 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Portals
                </button>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-black font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                        placeholder="john@school.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-black font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {loginError}
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-5 bg-indigo-900 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-black transition-all"
                  >
                    Open Terminal
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeView={activeView} 
      setActiveView={setActiveView} 
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
