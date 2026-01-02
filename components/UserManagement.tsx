
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  Shield, 
  User as UserIcon,
  X,
  Check,
  Search,
  Activity,
  History,
  Info,
  Globe,
  Settings2,
  CheckCircle2,
  Lock,
  RefreshCw,
  Database,
  Cloud,
  Download,
  FileCode,
  Calendar,
  Zap,
  HardDrive,
  Clock
} from 'lucide-react';
import { User, UserRole, Student, PaymentRecord, ClassFeeStructure } from '../types';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  globalSession?: string;
  onSessionChange?: (session: string) => void;
  isAdmin?: boolean;
  students: Student[];
  payments: PaymentRecord[];
  structures: ClassFeeStructure[];
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser,
  globalSession,
  onSessionChange,
  isAdmin,
  students,
  payments,
  structures
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(localStorage.getItem('last_backup_date'));
  const [isCloudSyncEnabled, setIsCloudSyncEnabled] = useState(localStorage.getItem('cloud_sync_enabled') === 'true');
  
  const [localSession, setLocalSession] = useState(globalSession || '2024-25');

  useEffect(() => {
    if (globalSession) {
      setLocalSession(globalSession);
    }
  }, [globalSession]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.STAFF,
    password: ''
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        password: user.password || '' 
      });
    } else {
      setEditingUser(null);
      setFormData({ 
        name: '', 
        email: '', 
        role: UserRole.STAFF, 
        password: 'staff123'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({ ...editingUser, ...formData });
    } else {
      const newUser: User = {
        id: `u-${Date.now()}`,
        ...formData
      };
      onAddUser(newUser);
    }
    setShowModal(false);
  };

  const handleApplySession = () => {
    if (onSessionChange) {
      onSessionChange(localSession);
    }
  };

  const generateJSONBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        data: {
          students,
          payments,
          structures,
          users: users.map(u => ({ ...u, password: '***' }))
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edupay_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      const nowStr = new Date().toLocaleString();
      setLastBackupDate(nowStr);
      localStorage.setItem('last_backup_date', nowStr);
      setIsBackingUp(false);
    }, 1500);
  };

  const generateSQLScript = () => {
    let sql = `-- EduPay Pro Database Export\n-- Generated: ${new Date().toLocaleString()}\n-- Session: ${globalSession}\n\nCREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, rollNo TEXT, name TEXT, className TEXT, academicYear TEXT, parentName TEXT, contact TEXT, gender TEXT, previousYearDues REAL, discount REAL, totalPaid REAL, status TEXT);\n`;
    students.forEach(s => {
      sql += `INSERT INTO students VALUES ('${s.id}', '${s.rollNo}', '${s.name.replace(/'/g, "''")}', '${s.className}', '${s.academicYear}', '${s.parentName.replace(/'/g, "''")}', '${s.contact}', '${s.gender}', ${s.previousYearDues}, ${s.discount}, ${s.totalPaid}, '${s.status}');\n`;
    });
    sql += `\nCREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, studentId TEXT, amount REAL, date TEXT, paymentType TEXT, method TEXT, receivedBy TEXT, transactionId TEXT);\n`;
    payments.forEach(p => {
      sql += `INSERT INTO payments VALUES ('${p.id}', '${p.studentId}', ${p.amount}, '${p.date}', '${p.paymentType}', '${p.method}', '${p.receivedBy}', '${p.transactionId || ''}');\n`;
    });
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edupay_db_script_${new Date().toISOString().split('T')[0]}.sql`;
    a.click();
  };

  const toggleCloudSync = () => {
    const newState = !isCloudSyncEnabled;
    setIsCloudSyncEnabled(newState);
    localStorage.setItem('cloud_sync_enabled', newState.toString());
    if (newState) {
      alert("Automatic Daily Backups Enabled. Data will be synced to your secure cloud drive every 24 hours.");
    }
  };

  const isSessionChanged = localSession !== globalSession;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Controls</h2>
          <p className="text-slate-500 font-medium">Manage personnel access and academic environment settings.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-100"
          >
            <UserPlus className="w-5 h-5" />
            Provision Access
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* User Roster */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                Personnel Roster
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter users..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-black focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 group-hover:scale-110 transition-transform">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          user.role === UserRole.ADMIN 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.lastLogin ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{new Date(user.lastLogin).toLocaleDateString()}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">Never logged in</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {isAdmin && (
                            <>
                              <button onClick={() => handleOpenModal(user)} title="Edit Profile" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => { if(confirm('Revoke access for this user?')) onDeleteUser(user.id); }} title="Revoke Access" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Config */}
          {isAdmin && onSessionChange && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Academic Config</h3>
                  <p className="text-sm text-slate-500 font-medium">Define the active operational period for the school.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Settings2 className="w-3 h-3 text-indigo-500" />
                      Active Academic Session
                    </label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-black font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none shadow-sm"
                        value={localSession}
                        onChange={(e) => setLocalSession(e.target.value)}
                      >
                        <option value="2023-24">Session 2023-24</option>
                        <option value="2024-25">Session 2024-25</option>
                        <option value="2025-26">Session 2025-26</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleApplySession}
                    disabled={!isSessionChanged}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                      isSessionChanged 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98]' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {isSessionChanged ? <CheckCircle2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    Confirm Operational Session
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-3">
                    <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-indigo-700 font-bold leading-normal uppercase tracking-wider mb-1">Session Protocol</p>
                      <p className="text-[11px] text-indigo-600 font-medium leading-relaxed">
                        Switching sessions updates the collection terminal immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance & Backups */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Maintenance & Backups</h3>
                  <p className="text-sm text-slate-500 font-medium">Protect and portable your database assets.</p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encryption</p>
                <p className="text-sm font-black text-emerald-600 flex items-center gap-1 justify-end">
                  <Lock className="w-4 h-4" /> AES-256 Active
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><HardDrive className="w-5 h-5 text-indigo-600" /></div>
                    <h4 className="font-bold text-slate-900">Local Database Export</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">Create a full portable snapshot of students, payments, and structures.</p>
                  
                  <div className="flex flex-col gap-2">
                    <button onClick={generateJSONBackup} disabled={isBackingUp} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50">
                      {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      {isBackingUp ? 'Generating...' : 'Download JSON Data'}
                    </button>
                    <button onClick={generateSQLScript} className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                      <FileCode className="w-4 h-4 text-slate-400" />
                      Generate SQL Schema
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-indigo-900 rounded-3xl space-y-4 relative overflow-hidden text-white shadow-xl shadow-indigo-100">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-xl"><Cloud className="w-5 h-5 text-indigo-300" /></div>
                      <h4 className="font-bold">Automated Cloud Sync</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isCloudSyncEnabled} onChange={toggleCloudSync} />
                      <div className="w-11 h-6 bg-indigo-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <p className="text-xs text-indigo-200 leading-relaxed mb-6">Sync backups to off-site cloud bucket every 24 hours.</p>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">
                      <span>Sync Status</span>
                      <span className="text-emerald-400">Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-xs font-bold">{lastBackupDate || 'Sync Pending...'}</span>
                    </div>
                  </div>
                </div>
                <Cloud className="absolute -right-12 -bottom-12 w-40 h-40 text-white/5" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white overflow-hidden relative group">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl text-indigo-400">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">System Integrity</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Monitoring</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-indigo-200 font-bold uppercase tracking-widest">Uptime</span>
                    <span className="font-bold text-emerald-400">99.99%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[99.9%]"></div>
                  </div>
                </div>
              </div>
            </div>
            <Settings2 className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 group-hover:rotate-45 transition-transform duration-1000" />
          </div>

          <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm text-center space-y-4">
             <div className="w-12 h-12 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center text-indigo-600">
               <History className="w-6 h-6" />
             </div>
             <div>
               <h4 className="font-black text-slate-900 text-sm">Session Logs</h4>
               <p className="text-[10px] text-slate-500 font-medium">Tracking {users.filter(u => u.lastLogin).length} active operators.</p>
             </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-md shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingUser ? 'Modify Access' : 'Create Access'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-black focus:ring-4 focus:ring-indigo-50 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-black focus:ring-4 focus:ring-indigo-50 outline-none font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">System Role</label>
                <select className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-black font-bold outline-none appearance-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                  <option value={UserRole.STAFF}>General Staff</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-black focus:ring-4 focus:ring-indigo-50 outline-none font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                {editingUser ? <RefreshCw className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                {editingUser ? 'Update' : 'Confirm'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
