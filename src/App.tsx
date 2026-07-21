import Sidebar from './components/Sidebar';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AccountabilityFormPage from './pages/AccountabilityForm/AccountabilityFormPage';
import UsersPage from './pages/Users/UsersPage';
import { useLocalStorage } from '../src/hooks/userLocalStorage';

function App() {
  const [currentPage, setCurrentPage] = useLocalStorage('currentPage', 'dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage('isSidebarOpen', true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <DashboardPage toggleSidebar={toggleSidebar} />;
      case 'accountability':
        return <AccountabilityFormPage toggleSidebar={toggleSidebar} />;
      case 'rfid':
        return <UsersPage toggleSidebar={toggleSidebar} />;
      // default:
      //   return <DashboardPage toggleSidebar={toggleSidebar} />;
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