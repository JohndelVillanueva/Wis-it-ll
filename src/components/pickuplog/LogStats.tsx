import { Calendar, TrendingUp, Users as UsersIcon } from 'lucide-react';
import type { LogStats } from '../../pages/Users/PickUpLog/PickUpLogPage';

const INK = '#1B2130';
const PAPER_LINE = '#DDDFD5';
const BRASS = '#B08A3E';
const MUTED = '#6B7280';

interface Props {
  stats: LogStats;
}

export default function LogStats({ stats }: Props) {
  const items = [
    { label: 'Today',     value: stats.today, accent: BRASS,     icon: Calendar },
    { label: 'This Week', value: stats.week,  accent: '#2E5C8A', icon: TrendingUp },
    // { label: 'All Time',  value: stats.total, accent: '#5C6B2F', icon: UsersIcon },
  ];

  return (
    <div
      className="flex flex-col sm:flex-row rounded-sm mb-6 overflow-hidden"
      style={{ border: `1px solid ${PAPER_LINE}`, background: '#fff' }}
    >
      {items.map((s, i) => (
        <div
          key={s.label}
          className="flex-1 px-6 py-5"
          style={{ borderLeft: i === 0 ? 'none' : `1px solid ${PAPER_LINE}` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ width: 14, height: 2, background: s.accent, display: 'inline-block' }} />
            <span
              className="text-[11px] tracking-[0.14em] uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}
            >
              {s.label}
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: 30,
              color: INK,
              lineHeight: 1.05,
            }}
          >
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}