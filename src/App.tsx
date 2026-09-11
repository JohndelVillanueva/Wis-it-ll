import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AccountabilityFormPage from './pages/AccountabilityForm/AccountabilityFormPage';
import UsersPage from './pages/Users/UsersPage';
import ParentsPage from './pages/Users/Parent/ParentsPage';
import RFIDTapPage from './pages/RFID/RFIDTapPage';
import CreateParentPage from './pages/Users/Parent/CreateParentPage';
import PickupLogPage from './pages/Users/PickUpLog/PickUpLogPage';

// ─── Valid routes ───
const VALID_PAGES = ['dashboard', 'accountability', 'users-parent', 'users-student', 'rfid-tap', 'users-create-parent', 'pickup-log'];
const DEFAULT_PAGE = 'dashboard';

// ─── Read the page name from the URL ───
function pageFromPath(): string {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!path) return DEFAULT_PAGE;
  return VALID_PAGES.includes(path) ? path : DEFAULT_PAGE;
}

function App() {
  const [currentPage, setCurrentPage] = useState<string>(pageFromPath());
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem('isSidebarOpen');
    return stored ? stored === 'true' : true;
  });

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem('isSidebarOpen', String(isSidebarOpen));
  }, [isSidebarOpen]);

  // Listen for browser back/forward
  useEffect(() => {
    const onPop = () => setCurrentPage(pageFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Navigate: update URL + state
  const handleSetCurrentPage = (page: string) => {
    if (!VALID_PAGES.includes(page)) return;
    const newPath = page === DEFAULT_PAGE ? '/dashboard' : `/${page}`;
    window.history.pushState({}, '', newPath);
    setCurrentPage(page);
  };

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  // ─── KIOSK MODE via URL param ───
  const params = new URLSearchParams(window.location.search);
  const kioskParam = params.get('kiosk');
  const isKioskMode =
    kioskParam !== null && kioskParam !== '0' && kioskParam !== 'false';

  // Kiosk via ?kiosk=1 param
  if (isKioskMode) {
    return <RFIDTapPage />;
  }

  // Kiosk via /rfid-tap path — also full-screen, no sidebar
  if (currentPage === 'rfid-tap') {
    return <RFIDTapPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
  
      case 'accountability':
        return <AccountabilityFormPage toggleSidebar={toggleSidebar} />;
  
      case 'users-create-parent':
        return <CreateParentPage />;
  
      case 'users-parent':
        return <ParentsPage />;
  
      case 'users-student':
        return <UsersPage toggleSidebar={toggleSidebar} type="Student" />;
  
      case 'pickup-log':
        return <PickupLogPage />;
  
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={handleSetCurrentPage}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;