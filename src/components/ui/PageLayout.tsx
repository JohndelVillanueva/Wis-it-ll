import { Menu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type PageLayoutProps = {
  children: React.ReactNode;
  maxWidth?: '6xl' | '7xl' | 'full';
};

const maxWidthClasses = {
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  'full': 'max-w-[1600px]',
};

const PageLayout = ({ children, maxWidth = '7xl' }: PageLayoutProps) => {
  return (
    <div className="min-h-full page-gradient p-4 sm:p-6 lg:p-8">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {children}
      </div>
    </div>
  );
};

type PageHeaderProps = {
  toggleSidebar: () => void;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconColor?: string;
};

const PageHeader = ({
  toggleSidebar,
  icon: Icon,
  title,
  subtitle,
  iconColor = 'from-indigo-500 to-blue-600',
}: PageHeaderProps) => {
  return (
    <div className="mb-8 flex items-start gap-4">
      <button
        onClick={toggleSidebar}
        className="lg:hidden mt-1 shrink-0 bg-white text-slate-600 p-2.5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow hover:border-slate-300 transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-4 flex-1">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${iconColor} shadow-lg shadow-indigo-500/20`}>
          <Icon className="text-white" size={26} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export { PageLayout, PageHeader };
