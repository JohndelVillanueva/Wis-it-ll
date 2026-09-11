import { Eye, User, Clock } from 'lucide-react';
import { photoUrl } from '../../utils/photoUrl';
import { formatNaivePH } from '../../utils/formatTime';
import type { PickupLog } from '../../pages/Users/PickUpLog/PickUpLogPage';

const INK = '#1B2130';
const PAPER_LINE = '#DDDFD5';
const MUTED = '#6B7280';
const BRASS = '#B08A3E';

interface Props {
  logs: PickupLog[];
  loading: boolean;
  onViewDetails: (log: PickupLog) => void;
}

export default function LogTable({ logs, loading, onViewDetails }: Props) {
  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{ border: `1px solid ${PAPER_LINE}`, background: '#fff' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${PAPER_LINE}`, background: '#FAFAF7' }}>
              <th className="text-left py-3 px-4 text-[11px] tracking-[0.1em] uppercase"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED, fontWeight: 500 }}>
                Guardian
              </th>
              <th className="text-left py-3 px-4 text-[11px] tracking-[0.1em] uppercase"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED, fontWeight: 500 }}>
                Time
              </th>
              <th className="text-left py-3 px-4 text-[11px] tracking-[0.1em] uppercase"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED, fontWeight: 500 }}>
                Students
              </th>
              <th className="text-right py-3 px-4 text-[11px] tracking-[0.1em] uppercase w-20"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED, fontWeight: 500 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm" style={{ color: MUTED }}>
                  Loading logs…
                </td>
              </tr>
            )}

            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center" style={{ color: MUTED }}>
                  <Clock size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No pickup logs found</p>
                  <p className="text-xs mt-1">Try adjusting your filters</p>
                </td>
              </tr>
            )}

            {!loading && logs.map((log) => (
              <tr key={log.id}
                  style={{ borderBottom: `1px solid ${PAPER_LINE}` }}
                  className="hover:bg-[#F7F8F4] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {log.parentPhoto ? (
                      <img
                        src={photoUrl(log.parentPhoto)}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                        style={{ border: `2px solid ${BRASS}` }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                           style={{ background: '#E5E7EB', color: MUTED }}>
                        {log.parentName[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium" style={{ color: INK }}>
                        {log.parentName}
                      </p>
                      <p className="text-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                        ID: {log.parentId}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <p className="text-sm" style={{ color: INK }}>{formatNaivePH(log.tappedAt)}</p>
                </td>

                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1.5">
                    {log.children.slice(0, 3).map((c) => (
                      <span key={c.id}
                            className="text-[10px] px-2 py-1 rounded-sm"
                            style={{ background: '#F0F4F9', color: '#2E5C8A', fontFamily: "'IBM Plex Mono', monospace" }}>
                        {c.fname} {c.lname}
                      </span>
                    ))}
                    {log.children.length > 3 && (
                      <span className="text-[10px] px-2 py-1 rounded-sm"
                            style={{ background: '#F0F4F9', color: '#2E5C8A', fontFamily: "'IBM Plex Mono', monospace" }}>
                        +{log.children.length - 3} more
                      </span>
                    )}
                    {log.children.length === 0 && (
                      <span className="text-xs" style={{ color: MUTED }}>None</span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onViewDetails(log)}
                    className="p-1.5 rounded-sm transition"
                    style={{ color: INK }}
                    title="View details"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}