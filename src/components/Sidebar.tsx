import { LayoutDashboard, FileText, Users, ChevronLeft, ChevronRight, Monitor } from 'lucide-react';

type SidebarProps = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

const Sidebar = ({ currentPage, setCurrentPage, isSidebarOpen, toggleSidebar }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'accountability', name: 'Accountability Form', icon: FileText },
    { id: 'rfid', name: 'Users', icon: Users }
  ];

  return (
    <aside
      className={`bg-slate-950 text-white flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
        isSidebarOpen ? 'w-64' : 'w-[72px]'
      }`}
    >
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
          aria-label="Toggle sidebar width"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
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
              title={!isSidebarOpen ? item.name : ''}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
            </button>
          );
        })}
      </nav>

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
