
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  Wallet, 
  BarChart3, 
  Settings, 
  LogOut, 
  GraduationCap
} from 'lucide-react';
import { AppView, UserRole, User } from '../types';

interface LayoutProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  currentUser: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeView, setActiveView, currentUser, onLogout, children }) => {
  const navItems = [
    { id: 'DASHBOARD' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'STUDENTS' as AppView, label: 'Students', icon: Users },
    ...(currentUser?.role === UserRole.ADMIN ? [
      { id: 'FEE_STRUCTURE' as AppView, label: 'Fee Structures', icon: FileSpreadsheet },
    ] : []),
    { id: 'REPORTS' as AppView, label: 'Reports', icon: BarChart3 },
    { id: 'COLLECTION' as AppView, label: 'Collect Fee', icon: Wallet },
    ...(currentUser?.role === UserRole.ADMIN ? [{ id: 'USERS' as AppView, label: 'Settings', icon: Settings }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-indigo-800">
          <div className="bg-white p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-indigo-900" />
          </div>
          <span className="font-bold text-xl tracking-tight">EduPay Pro</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === item.id 
                ? 'bg-indigo-700 text-white' 
                : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser?.name}</p>
              <p className="text-xs text-indigo-300 capitalize">{currentUser?.role.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-200 hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
