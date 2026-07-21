import { useState, useEffect } from 'react';
import { Users, GraduationCap, Layers, ShieldCheck, FileBarChart, Plus, Download, Settings, ArrowRight } from 'lucide-react';

interface DashboardStats {
  total: number;
  gradeLevels: number;
  houses: number;
  gradeCounts: Record<string, number>;
  houseCounts: Record<string, number>;
}

interface RecentStudent {
  id: number;
  studentNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gradeLevel: string;
  house: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const HOUSE_PALETTE: Record<string, string> = {
  Phoenix: '#B3324B',
  Griffin: '#2E5C8A',
  Dragon: '#5C6B2F',
  Unicorn: '#7B5EA7',
};
const houseColor = (house: string) => HOUSE_PALETTE[house] || '#5B6472';

const INK = '#1B2130';
const PAPER = '#F2F3EE';
const PAPER_LINE = '#DDDFD5';
const BRASS = '#B08A3E';
const MUTED = '#6B7280';

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
`;

const Seal = ({ name, house, size = 40 }: { name: string; house: string; size?: number }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const color = houseColor(house);
  return (
    <div
      className="shrink-0 rounded-full flex items-center justify-center"
      style={{ width: size, height: size, border: `1.5px solid ${color}`, boxShadow: `inset 0 0 0 3px ${PAPER}`, background: `${color}1a` }}
    >
      <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color, fontSize: size * 0.34 }}>{initials}</span>
    </div>
  );
};

const StatCell = ({ eyebrow, value, note, accent, first }: { eyebrow: string; value: string | number; note: string; accent: string; first?: boolean }) => (
  <div className="flex-1 px-6 py-5" style={{ borderLeft: first ? 'none' : `1px solid ${PAPER_LINE}` }}>
    <div className="flex items-center gap-2 mb-2">
      <span style={{ width: 14, height: 2, background: accent, display: 'inline-block' }} />
      <span className="text-[11px] tracking-[0.14em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>{eyebrow}</span>
    </div>
    <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 34, color: INK, lineHeight: 1.05 }} className="tracking-tight">{value}</p>
    <p className="text-xs mt-1" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>{note}</p>
  </div>
);

const QuickAction = ({ label, icon: Icon, primary, onClick }: { label: string; icon: any; primary?: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center gap-2 px-4 py-3 rounded-sm text-sm transition-colors focus:outline focus:outline-2 focus:outline-offset-2"
    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, background: primary ? INK : 'transparent', color: primary ? PAPER : INK, border: `1px solid ${primary ? INK : PAPER_LINE}`, outlineColor: BRASS }}
    onMouseEnter={(e) => { if (!primary) e.currentTarget.style.borderColor = BRASS; }}
    onMouseLeave={(e) => { if (!primary) e.currentTarget.style.borderColor = PAPER_LINE; }}
  >
    <Icon size={16} />
    {label}
  </button>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, gradeLevels: 0, houses: 0, gradeCounts: {}, houseCounts: {} });
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/students`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        const latestStudents = result.data.slice(0, 4).map((student: any) => ({
          id: student.id,
          studentNumber: student.studentNumber,
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          gradeLevel: student.gradeLevel,
          house: student.house,
        }));
        setRecentStudents(latestStudents);

        const allStudents = result.data;
        const gradeCounts: Record<string, number> = {};
        const houseCounts: Record<string, number> = {};
        allStudents.forEach((student: any) => {
          if (student.gradeLevel) gradeCounts[student.gradeLevel] = (gradeCounts[student.gradeLevel] || 0) + 1;
          if (student.house) houseCounts[student.house] = (houseCounts[student.house] || 0) + 1;
        });

        // Prefer the backend's own stats block when present (it already excludes inactive students)
        setStats({
          total: result.stats?.total ?? allStudents.length,
          gradeLevels: result.stats?.gradeLevels ?? Object.keys(gradeCounts).length,
          houses: result.stats?.houses ?? Object.keys(houseCounts).length,
          gradeCounts,
          houseCounts,
        });
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Error connecting to server. Please make sure the backend is running.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ background: PAPER, fontFamily: "'Inter', sans-serif" }}>
        <style>{FONTS}</style>
        <span className="text-sm" style={{ color: MUTED }}>Loading dashboard…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 min-h-full" style={{ background: PAPER, fontFamily: "'Inter', sans-serif" }}>
        <style>{FONTS}</style>
        <div className="px-5 py-4 rounded-sm" style={{ background: '#fff', borderLeft: `3px solid #B3324B`, border: `1px solid ${PAPER_LINE}` }}>
          <p className="text-sm font-semibold" style={{ color: INK }}>Couldn't load the dashboard</p>
          <p className="text-sm mt-1" style={{ color: MUTED }}>{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 rounded-sm text-sm"
            style={{ background: INK, color: PAPER, fontWeight: 500 }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCells = [
    { eyebrow: 'Enrolled', value: stats.total.toLocaleString(), note: `${stats.gradeLevels} grade levels on roll`, accent: BRASS },
    { eyebrow: 'Grade Levels', value: stats.gradeLevels, note: Object.keys(stats.gradeCounts).sort().join(' · ') || '—', accent: houseColor('Griffin') },
    { eyebrow: 'Houses', value: stats.houses, note: Object.keys(stats.houseCounts).join(' · ') || '—', accent: houseColor('Dragon') },
    { eyebrow: 'Standing', value: 'Active', note: 'No outstanding flags', accent: houseColor('Phoenix') },
  ];

  const displayActivity = recentStudents.length > 0 ? recentStudents : null;

  return (
    <div style={{ background: PAPER, fontFamily: "'Inter', sans-serif" }} className="p-6 sm:p-8 min-h-full">
      <style>{FONTS}</style>

      <div className="flex flex-col sm:flex-row rounded-sm mb-8 overflow-hidden" style={{ border: `1px solid ${PAPER_LINE}`, background: '#FFFFFF' }}>
        {statCells.map((s, i) => (
          <StatCell key={s.eyebrow} {...s} first={i === 0} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-sm overflow-hidden" style={{ border: `1px solid ${PAPER_LINE}`, background: '#FFFFFF' }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `2px solid ${INK}` }}>
            <div>
              <p className="text-[11px] tracking-[0.14em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>Register</p>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 19, color: INK }}>Recent Enrollments</h3>
            </div>
            <button
              onClick={() => (window.location.href = '/users')}
              className="text-xs flex items-center gap-1 focus:outline focus:outline-2 focus:outline-offset-2 rounded-sm px-1"
              style={{ color: INK, fontFamily: "'Inter', sans-serif", fontWeight: 500, outlineColor: BRASS }}
            >
              View roster <ArrowRight size={13} />
            </button>
          </div>

          {displayActivity ? (
            <div>
              {displayActivity.map((student, i) => (
                <div key={student.id} className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: i === displayActivity.length - 1 ? 'none' : `1px solid ${PAPER_LINE}` }}>
                  <Seal name={`${student.firstName} ${student.lastName}`} house={student.house} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: INK }}>{student.firstName} {student.lastName}</p>
                    <p className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>{student.studentNumber} · Grade {student.gradeLevel} · {student.house}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-sm uppercase tracking-wide shrink-0" style={{ color: houseColor(student.house), border: `1px solid ${houseColor(student.house)}`, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {student.house}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm" style={{ color: INK }}>No students yet</p>
              <p className="text-xs mt-1" style={{ color: MUTED }}>Add your first student to see them here.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-sm overflow-hidden" style={{ border: `1px solid ${PAPER_LINE}`, background: '#FFFFFF' }}>
          <div className="px-6 py-4" style={{ borderBottom: `2px solid ${INK}` }}>
            <p className="text-[11px] tracking-[0.14em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>Desk</p>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 19, color: INK }}>Quick Actions</h3>
          </div>
          <div className="p-6 flex flex-col gap-3">
            <QuickAction label="Add New Student" icon={Plus} primary onClick={() => (window.location.href = '/users')} />
            <QuickAction label="Generate Report" icon={FileBarChart} onClick={() => alert('Report generation will be available soon!')} />
            <QuickAction label="Export Data" icon={Download} onClick={() => alert('Data export will be available soon!')} />
            <QuickAction label="System Settings" icon={Settings} onClick={() => (window.location.href = '/settings')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;