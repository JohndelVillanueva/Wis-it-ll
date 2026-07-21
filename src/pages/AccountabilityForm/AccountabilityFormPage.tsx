import { Clipboard } from 'lucide-react';
import { PageLayout, PageHeader } from '../../components/ui/PageLayout';
import AccountabilityForm from '../../components/AccountabilityForm';

type AccountabilityFormPageProps = {
  toggleSidebar: () => void;
};

const AccountabilityFormPage = ({ toggleSidebar }: AccountabilityFormPageProps) => {
  return (
    <PageLayout maxWidth="full">
      <PageHeader
        toggleSidebar={toggleSidebar}
        icon={Clipboard}
        title="Accountability Form"
        subtitle="Assign and track equipment assignments"
        iconColor="from-emerald-500 to-teal-600"
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 w-full">
        <div className="xl:col-span-3">
          <AccountabilityForm />
        </div>

        <div className="xl:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 card-hover">
            <h3 className="font-semibold text-slate-900 mb-4">Assignment Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'Active', value: '156', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
                { label: 'Available', value: '42', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
                { label: 'This Month', value: '23', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${stat.dot}`} />
                    <span className="text-sm font-medium text-slate-600">{stat.label}</span>
                  </div>
                  <span className={`text-lg font-bold px-2.5 py-0.5 rounded-lg ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100/80 p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Quick Tips</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {[
                'Ensure serial numbers match physical equipment',
                'Verify employee details before submission',
                'Document equipment condition accurately',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AccountabilityFormPage;