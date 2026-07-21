import { Monitor, Users, HardDrive, AlertTriangle, FileBarChart, Plus, Download, Settings, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Total Devices', value: '248', change: '+12%', icon: Monitor, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { title: 'Active Users', value: '156', change: '+8%', icon: Users, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
    { title: 'Storage Used', value: '78%', change: '+3%', icon: HardDrive, gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50' },
    { title: 'Pending Issues', value: '12', change: '-4', icon: AlertTriangle, gradient: 'from-rose-500 to-orange-500', bg: 'bg-rose-50' }
  ];

  const recentActivity = [
    { user: 'John Doe', action: 'Requested new laptop', time: '2 hours ago', color: 'bg-blue-500' },
    { user: 'Jane Smith', action: 'RFID card updated', time: '4 hours ago', color: 'bg-emerald-500' },
    { user: 'Mike Johnson', action: 'Equipment returned', time: '5 hours ago', color: 'bg-violet-500' },
    { user: 'Sarah Wilson', action: 'New accountability form', time: '1 day ago', color: 'bg-amber-500' }
  ];

  const quickActions = [
    { label: 'Generate Report', icon: FileBarChart, gradient: 'from-indigo-600 to-blue-600' },
    { label: 'Add New Device', icon: Plus, gradient: 'from-emerald-600 to-teal-600' },
    { label: 'Export Data', icon: Download, gradient: 'from-violet-600 to-purple-600' },
    { label: 'System Settings', icon: Settings, gradient: 'from-slate-600 to-slate-700' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md`}>
                  <Icon className="text-white" size={20} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.bg} text-slate-600`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="p-4 space-y-1">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center shrink-0 shadow-sm`}>
                  <span className="text-xs font-bold text-white">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{activity.user}</p>
                  <p className="text-sm text-slate-500 truncate">{activity.action}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${action.gradient} text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
