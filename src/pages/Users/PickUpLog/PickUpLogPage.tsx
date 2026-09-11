import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Search, Filter, RefreshCw, Users as UsersIcon,
  TrendingUp, Clock, X, ChevronLeft, ChevronRight, Eye,
} from 'lucide-react';
import { photoUrl } from '../../../utils/photoUrl';
import { formatNaivePH } from '../../../utils/formatTime.ts';
import LogStats from '../../../components/pickuplog/LogStats';
import LogFilters from '../../../components/pickuplog/LogFilters';
import LogTable from '../../../components/pickuplog/LogTable';

const API_URL = import.meta.env.VITE_API_URL || 'http://10.128.2.112:3000';

const INK = '#1B2130';
const PAPER = '#F2F3EE';
const PAPER_LINE = '#DDDFD5';
const BRASS = '#B08A3E';
const MUTED = '#6B7280';

export interface PickupLog {
  id: number;
  parentId: number;
  parentName: string;
  parentPhoto: string;
  tappedAt: string;
  childCount: number;
  note: string | null;
  children: {
    id: number;
    fname: string;
    mname: string;
    lname: string;
    grade: string;
    section: string;
    photo: string;
  }[];
}

export interface LogStats {
  today: number;
  week: number;
  total: number;
}

const PickupLogPage = () => {
  const [logs, setLogs] = useState<PickupLog[]>([]);
  const [stats, setStats] = useState<LogStats>({ today: 0, week: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Detail modal
  const [selectedLog, setSelectedLog] = useState<PickupLog | null>(null);

  // ─── Fetch logs ───
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      if (appliedSearch) params.set('search', appliedSearch);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(
        `${API_URL}/api/pickup_logs?${params.toString()}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');

      setLogs(json.data);
      setTotal(json.pagination.total);
      setTotalPages(json.pagination.totalPages);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading pickup logs.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, appliedSearch, page, limit]);

  // ─── Fetch stats ───
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pickup_logs/stats`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, []);

  // ─── Reset to page 1 when filters change ───
  useEffect(() => {
    setPage(1);
  }, [fromDate, toDate, appliedSearch, limit]);

  function applySearch() {
    setAppliedSearch(search.trim());
  }

  function clearFilters() {
    setFromDate('');
    setToDate('');
    setSearch('');
    setAppliedSearch('');
    setPage(1);
  }

  return (
    <div style={{ background: PAPER, fontFamily: "'Inter', sans-serif" }} className="p-6 sm:p-8 min-h-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
      `}</style>

      {/* ALERTS */}
      {success && (
        <div className="mb-4 px-5 py-3 flex items-center justify-between rounded-sm"
             style={{ background: '#fff', borderLeft: `3px solid #5C6B2F`, border: `1px solid ${PAPER_LINE}` }}>
          <span className="text-sm" style={{ color: INK }}>{success}</span> 
          <button onClick={() => setSuccess(null)} style={{ color: MUTED }}><X size={16} /></button>
        </div>
      )}
      {error && (
        <div className="mb-4 px-5 py-3 flex items-center justify-between rounded-sm"
             style={{ background: '#fff', borderLeft: `3px solid #B3324B`, border: `1px solid ${PAPER_LINE}` }}>
          <span className="text-sm" style={{ color: INK }}>{error}</span>
          <button onClick={() => setError(null)} style={{ color: MUTED }}><X size={16} /></button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 28, color: INK }}>
            Pickup Log
          </h1>
          <p className="text-xs mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
            Audit trail of every RFID tap
          </p>
        </div>

        <button
          onClick={() => { fetchLogs(); fetchStats(); }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm disabled:opacity-40"
          style={{ border: `1px solid ${PAPER_LINE}`, color: INK, background: '#fff' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* STATS */}
      <LogStats stats={stats} />

      {/* FILTERS */}
      <LogFilters
        fromDate={fromDate}
        toDate={toDate}
        search={search}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onSearchChange={setSearch}
        onApply={applySearch}
        onClear={clearFilters}
      />

      {/* TABLE */}
      <LogTable
        logs={logs}
        loading={loading}
        onViewDetails={setSelectedLog}
      />

      {/* PAGINATION */}
      {!loading && total > 0 && (
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-sm mt-4"
             style={{ border: `1px solid ${PAPER_LINE}`, background: '#fff' }}>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="text-xs py-1 px-2 rounded border"
              style={{ borderColor: PAPER_LINE, color: INK }}
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-sm border disabled:opacity-40"
              style={{ borderColor: PAPER_LINE, color: INK }}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs px-3" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-sm border disabled:opacity-40"
              style={{ borderColor: PAPER_LINE, color: INK }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
             onClick={() => setSelectedLog(null)}>
          <div className="rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto"
               style={{ background: '#fff', border: `1px solid ${PAPER_LINE}` }}
               onClick={(e) => e.stopPropagation()}>

            <div className="px-6 py-5 flex items-center justify-between"
                 style={{ borderBottom: `2px solid ${INK}` }}>
              <div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, color: INK }}>
                  History Details
                </h3>
                <p className="text-xs mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                  Log #{selectedLog.id}
                </p>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ color: MUTED }}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Guardian */}
              <div className="flex items-center gap-4 p-4 rounded-lg"
                   style={{ background: '#FAFAF7', border: `1px solid ${PAPER_LINE}` }}>
                {selectedLog.parentPhoto ? (
                  <img src={photoUrl(selectedLog.parentPhoto)} alt=""
                       className="w-16 h-16 rounded-full object-cover border-2"
                       style={{ borderColor: BRASS }} />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold"
                       style={{ background: '#E5E7EB', color: MUTED }}>
                    {selectedLog.parentName[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-widest" style={{ color: MUTED }}>
                    Guardian
                  </p>
                  <p className="text-lg font-bold" style={{ color: INK }}>
                    {selectedLog.parentName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    {formatNaivePH(selectedLog.tappedAt)}
                  </p>
                </div>
              </div>

              {/* Children */}
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: MUTED }}>
                  Students ({selectedLog.children.length})
                </p>
                <div className="space-y-2">
                  {selectedLog.children.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg"
                         style={{ background: '#F7F8F4', border: `1px solid ${PAPER_LINE}` }}>
                      {c.photo ? (
                        <img src={photoUrl(c.photo)} alt=""
                             className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                             style={{ background: '#E5E7EB', color: MUTED }}>
                          {c.fname[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: INK }}>
                          {c.fname} {c.lname}
                        </p>
                        <p className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                          {c.grade || '—'} · {c.section || '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {selectedLog.children.length === 0 && (
                    <p className="text-sm text-center py-4" style={{ color: MUTED }}>
                      No students linked
                    </p>
                  )}
                </div>
              </div>

              {selectedLog.note && (
                <div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: MUTED }}>Note</p>
                  <p className="text-sm p-3 rounded-lg" style={{ background: '#F7F8F4', color: INK }}>
                    {selectedLog.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupLogPage;