import { Users } from 'lucide-react';
import { PageLayout, PageHeader } from '../../components/ui/PageLayout';
import UsersTable from '../../components/Users';

type UsersPageProps = {
  toggleSidebar?: () => void;
  type: 'Parent' | 'Student';
};

const UsersPage = ({ toggleSidebar, type }: UsersPageProps) => {
  const isParent = type === 'Parent';

  return (
    <PageLayout maxWidth="full">
      <PageHeader
        toggleSidebar={toggleSidebar || (() => {})}
        icon={Users}
        title={isParent ? 'Parents' : 'Students'}
        subtitle={
          isParent
            ? 'Manage parent records and linked students'
            : 'Manage student records and information'
        }
        iconColor={
          isParent
            ? 'from-indigo-500 to-blue-600'
            : 'from-blue-500 to-cyan-600'
        }
      />
      <UsersTable toggleSidebar={toggleSidebar || (() => {})} type={type} />
    </PageLayout>
  );
};

export default UsersPage;