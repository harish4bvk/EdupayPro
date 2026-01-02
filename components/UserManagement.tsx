
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
  RefreshCw
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  globalSession?: string;
  onSessionChange?: (session: string) => void;
  isAdmin?: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser,
  globalSession,
  onSessionChange,
  isAdmin
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local state for the session selector before applying it
  const [localSession, setLocalSession] = useState(globalSession || '2024-25');

  // Sync local session if global session changes from elsewhere
  useEffect(() => {
    if (globalSession) {
      setLocalSession(globalSession);
    }
  }, [globalSession]);

  // Form states
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
        password: 'staff123' // default initial password
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

  const isSessionChanged = localSession !== globalSession;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Controls</h2>
          <p className="text-slate-500 font-medium">Manage personnel access and global school settings.</p>
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
        {/* User Roster */}
        <div className="lg:col-span-2 space-y-6">
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
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-medium"
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
                            : user.role === UserRole.ACCOUNTS 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => handleOpenModal(user)}
                                title="Edit Profile & Password"
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => onDeleteUser(user.id)}
                                title="Revoke Access"
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              >
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
        </div>

        {/* Global Configuration Sidebar */}
        {isAdmin && onSessionChange && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <Settings2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Global Config</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Globe className="w-3 h-3 text-indigo-500" />
                    System Academic Session
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none"
                      value={localSession}
                      onChange={(e) => setLocalSession(e.target.value)}
                    >
                      <option value="2023-24">Session 2023-24</option>
                      <option value="2024-25">Session 2024-25</option>
                      <option value="2025-26">Session 2025-26</option>
                    </select>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      onClick={handleApplySession}
                      disabled={!isSessionChanged}
                      className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                        isSessionChanged 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98]' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {isSessionChanged ? <CheckCircle2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      Set as Active Session
                    </button>
                  </div>

                  {!isSessionChanged && (
                    <div className="flex items-center justify-center gap-2 mt-2 px-2 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Currently Operational</span>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed px-1 mt-4">
                    Confirming will update visibility for all operational modules across the entire school management system.
                  </p>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                  <Info className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-700 font-bold leading-normal">
                    Changing the active session will immediately update the collection terminal for all staff accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {editingUser ? 'Modify Access' : 'Create Access'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none focus:border-indigo-600 transition-all font-bold"
                    placeholder="e.g. Michael Scott"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none focus:border-indigo-600 transition-all font-bold"
                  placeholder="name@school.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">System Role</label>
                <select 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none focus:border-indigo-600 transition-all font-bold appearance-none bg-white"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.STAFF}>General Staff</option>
                  <option value={UserRole.ACCOUNTS}>Accounts & Billing</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">
                  {editingUser ? 'Reset Password' : 'Initial Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none focus:border-indigo-600 transition-all font-bold"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                {editingUser && (
                  <p className="text-[10px] text-indigo-600 font-bold mt-1 px-1">
                    Updating this field will reset the user's login credentials.
                  </p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  {editingUser ? <RefreshCw className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {editingUser ? 'Update' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
