import { Users } from 'lucide-react';
import { PageLayout, PageHeader } from '../../components/ui/PageLayout';
import UsersTable from '../../components/Users';

type UsersPageProps = {
  toggleSidebar: () => void;
};

const UsersPage = ({ toggleSidebar }: UsersPageProps) => {
  return (
    <PageLayout maxWidth="full">
      <PageHeader
        toggleSidebar={toggleSidebar}
        icon={Users}
        title="Users"
        subtitle="Manage student records and information"
        iconColor="from-blue-500 to-cyan-600"
      />
      <UsersTable />
    </PageLayout>
  );
};

export default UsersPage;
