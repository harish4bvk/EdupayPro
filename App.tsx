
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import PaymentModule from './components/PaymentModule';
import UserManagement from './components/UserManagement';
import FeeStructureManagement from './components/FeeStructureManagement';
import { 
  User, 
  UserRole, 
  AppView, 
  Student, 
  PaymentRecord, 
  ClassFeeStructure 
} from './types';
import { MOCK_USERS, MOCK_STUDENTS, MOCK_STRUCTURES } from './services/mockData';
import { 
  LogIn, 
  GraduationCap, 
  ShieldCheck, 
  BarChart3, 
  Lock, 
  ArrowLeft,
  AlertCircle,
  ShieldAlert,
  User as UserIcon
} from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AppView>('DASHBOARD');
  const [globalSession, setGlobalSession] = useState('2024-25');
  
  // Login flow states
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Core App States
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [structures, setStructures] = useState<ClassFeeStructure[]>(MOCK_STRUCTURES);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [preSelectedStudentId, setPreSelectedStudentId] = useState<string | null>(null);

  const handleLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Search for a user with the matching role and credentials
    const foundUser = users.find(u => {
      const roleMatch = u.role === pendingRole;
      const passMatch = u.password === password;
      
      // For Admin, we don't need a specific username in this simplified mock
      if (pendingRole === UserRole.ADMIN) {
        return roleMatch && passMatch;
      } 
      
      // For Staff/Accounts, we check username (stored in email or name for now) 
      // or specifically 'accounts' for the mock user
      const userMatch = u.email.toLowerCase() === username.toLowerCase() || 
                        u.name.toLowerCase() === username.toLowerCase() ||
                        (u.role === UserRole.ACCOUNTS && username.toLowerCase() === 'accounts');
      
      return roleMatch && userMatch && passMatch;
    });

    if (foundUser) {
      const updatedUsers = users.map(u => 
        u.id === foundUser.id 
          ? { ...u, isOnline: true, lastLogin: new Date().toLocaleString() } 
          : u
      );
      setUsers(updatedUsers);
      const loggedInUser = updatedUsers.find(u => u.id === foundUser.id)!;
      setCurrentUser(loggedInUser);
      setIsLoggedIn(true);
      setPendingRole(null);
      setUsername('');
      setPassword('');
      setActiveView('DASHBOARD');
    } else {
      setLoginError(pendingRole === UserRole.ADMIN 
        ? 'Invalid administrator password.' 
        : 'Invalid username or password.');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, isOnline: false } : u));
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPendingRole(null);
    setUsername('');
    setPassword('');
  };

  const handleAddPayment = (payment: PaymentRecord) => {
    setPayments(prev => [payment, ...prev]);
    setStudents(prev => prev.map(s => {
      if (s.id === payment.studentId) {
        const newTotalPaid = s.totalPaid + payment.amount;
        const struct = structures.find(st => st.className === s.className && st.academicYear === globalSession);
        const expectedTotal = (struct?.total || 0) + s.previousYearDues - s.discount;
        let newStatus: Student['status'] = 'PARTIAL';
        if (newTotalPaid >= expectedTotal) newStatus = 'PAID';
        else if (newTotalPaid === 0) newStatus = 'UNPAID';
        return { ...s, totalPaid: newTotalPaid, status: newStatus };
      }
      return s;
    }));
  };

  const handleAddStudents = (newStudents: Student[]) => {
    // Force new students into the active global session
    const normalized = newStudents.map(s => ({ ...s, academicYear: globalSession }));
    setStudents(prev => [...prev, ...normalized]);
  };

  const handleUpdateDiscount = (studentId: string, discount: number) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, discount } : s));
  };

  const handleGoToPayment = (studentId: string) => {
    setPreSelectedStudentId(studentId);
    setActiveView('COLLECTION');
  };

  const handleAddUser = (newUser: User) => setUsers(prev => [...prev, newUser]);
  const handleUpdateUser = (updatedUser: User) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  const handleDeleteUser = (userId: string) => setUsers(prev => prev.filter(u => u.id !== userId));
  const handleAddStructure = (newStructure: ClassFeeStructure) => setStructures(prev => [...prev, newStructure]);
  const handleUpdateStructure = (updatedStructure: ClassFeeStructure) => setStructures(prev => prev.map(s => s.id === updatedStructure.id ? updatedStructure : s));
  const handleDeleteStructure = (structureId: string) => setStructures(prev => prev.filter(s => s.id !== structureId));

  useEffect(() => {
    if (activeView !== 'COLLECTION') setPreSelectedStudentId(null);
  }, [activeView]);

  // Filter Data for Operational Modules based on Global Session
  const filteredStudents = students.filter(s => s.academicYear === globalSession);
  const filteredStructures = structures.filter(s => s.academicYear === globalSession);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="p-8 text-center bg-indigo-900 text-white relative">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-black">EduPay Pro</h1>
              <p className="text-indigo-200 text-sm mt-1">Smart School Fee Management System</p>
            </div>
            <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full -mr-6 -mt-6"></div>
          </div>
          
          <div className="p-8">
            {!pendingRole ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                  <h2 className="text-slate-900 font-bold text-lg">Select Login Profile</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => setPendingRole(UserRole.ADMIN)} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"><ShieldCheck className="w-5 h-5" /></div>
                      <div>
                        <p className="font-bold text-slate-900">Administrator</p>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 rotate-180" />
                  </button>
                  <button onClick={() => setPendingRole(UserRole.ACCOUNTS)} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors"><LogIn className="w-5 h-5" /></div>
                      <div>
                        <p className="font-bold text-slate-900">Accounts & Billing</p>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 rotate-180" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLoginAttempt} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <button type="button" onClick={() => { setPendingRole(null); setPassword(''); setUsername(''); setLoginError(''); }} className="flex items-center gap-2 text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to profiles
                </button>
                <div>
                  <h2 className="text-slate-900 font-bold text-xl">{pendingRole === UserRole.ADMIN ? 'Admin Login' : 'Staff Login'}</h2>
                </div>
                <div className="space-y-4">
                  {pendingRole === UserRole.ACCOUNTS && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          autoFocus 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                          onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Please enter your username')}
                          onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                          placeholder="accounts" 
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-black focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-medium" 
                          required 
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        autoFocus={pendingRole === UserRole.ADMIN} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Please enter your password')}
                        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                        placeholder="••••••••" 
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${loginError ? 'border-rose-300 ring-rose-100' : 'border-slate-200 focus:ring-indigo-100'} bg-white text-black focus:ring-4 focus:border-indigo-600 outline-none transition-all font-medium`} 
                        required 
                      />
                    </div>
                    {loginError && <div className="flex items-center gap-2 text-rose-600 text-xs font-medium mt-2 p-2 bg-rose-50 rounded-lg"><AlertCircle className="w-4 h-4" />{loginError}</div>}
                  </div>
                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">Login</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'DASHBOARD':
        return (
          <Dashboard 
            students={students} 
            payments={payments} 
            structures={structures} 
            isAdmin={currentUser?.role === UserRole.ADMIN}
            selectedSession={globalSession}
            onSessionChange={setGlobalSession}
          />
        );
      case 'STUDENTS':
        return (
          <StudentManagement 
            students={filteredStudents} 
            structures={filteredStructures} 
            onAddStudents={handleAddStudents} 
            onApplyDiscount={handleUpdateDiscount}
            onCollectFee={handleGoToPayment}
            isAdmin={currentUser?.role === UserRole.ADMIN}
            currentSession={globalSession}
          />
        );
      case 'FEE_STRUCTURE':
        return (
          <FeeStructureManagement 
            structures={filteredStructures}
            onAddStructure={handleAddStructure}
            onUpdateStructure={handleUpdateStructure}
            onDeleteStructure={handleDeleteStructure}
            isAdmin={currentUser?.role === UserRole.ADMIN}
          />
        );
      case 'COLLECTION':
        return (
          <PaymentModule 
            students={filteredStudents} 
            structures={filteredStructures} 
            onAddPayment={handleAddPayment} 
            currentUser={currentUser} 
            initialStudentId={preSelectedStudentId || undefined}
            currentSession={globalSession}
          />
        );
      case 'USERS':
        return (
          <UserManagement 
            users={users} 
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            globalSession={globalSession}
            onSessionChange={setGlobalSession}
            isAdmin={currentUser?.role === UserRole.ADMIN}
          />
        );
      default:
        return <div>View under construction.</div>;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView} currentUser={currentUser} onLogout={handleLogout}>
      {renderView()}
    </Layout>
  );
};

export default App;
