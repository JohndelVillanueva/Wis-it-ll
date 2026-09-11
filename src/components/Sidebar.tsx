import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Monitor,
  UserCog,
  GraduationCap,
  ScanLine,
  UserPlus,
  History,        // ← NEW
} from 'lucide-react';

type SidebarProps = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

const Sidebar = ({
  currentPage,
  setCurrentPage,
  isSidebarOpen,
  toggleSidebar,
}: SidebarProps) => {
  const [usersOpen, setUsersOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard',      name: 'Dashboard',           icon: LayoutDashboard },
    { id: 'accountability', name: 'Accountability Form', icon: FileText },
    { id: 'rfid-tap',       name: 'RFID Kiosk',          icon: ScanLine },
    { id: 'pickup-log',     name: 'Pickup Log',          icon: History },   // ← NEW
  ];

  // ─── Sub-items under "Users" ───
  const userSubItems = [
    { id: 'users-create-parent',  name: 'Create Parent', icon: UserPlus },
    { id: 'users-parent',         name: 'Parent',        icon: UserCog },
    { id: 'users-student',        name: 'Student',       icon: GraduationCap },
  ];

  const isUsersActive = currentPage.startsWith('users-');

  return (
    <aside
      className={`bg-slate-950 text-white flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
        isSidebarOpen ? 'w-64' : 'w-[72px]'
      }`}
    >
      {/* HEADER */}
      <div className="p-5 border-b border-slate-800/80 relative">
        <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <Monitor className="text-white" size={20} />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold tracking-tight">IT Department</h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-7 bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-full border border-slate-700 shadow-md transition-all duration-200 hover:scale-105"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

        {/* Regular items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              } ${!isSidebarOpen ? 'justify-center' : ''}`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
            </button>
          );
        })}

        {/* USERS GROUP */}
        <div>
          <button
            onClick={() => {
              if (isSidebarOpen) setUsersOpen((p) => !p);
              else setCurrentPage('users-parent');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              isUsersActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
            } ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <Users size={20} className={isUsersActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
            {isSidebarOpen && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Users</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${usersOpen ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>

          {isSidebarOpen && usersOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-slate-700/70 space-y-1">
              {userSubItems.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = currentPage === sub.id;

                return (
                  <button
                    key={sub.id}
                    onClick={() => setCurrentPage(sub.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-left ${
                      isSubActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <SubIcon size={16} className={isSubActive ? 'text-indigo-400' : 'text-slate-500'} />
                    <span className="text-sm">{sub.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-800/80">
        <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shrink-0 ring-2 ring-slate-800">
            <span className="text-xs font-bold">AU</span>
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@itdept.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;