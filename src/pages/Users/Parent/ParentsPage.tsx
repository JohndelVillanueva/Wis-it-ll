import { useState, useEffect } from 'react';
import {
  Search, Plus, Users as UsersIcon, GraduationCap, Layers,
  XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  UserPlus, Trash2, Link2,
} from 'lucide-react';
import AddStudentToParentModal from '../../../modal/AddStudentToParentModal';

// ─── TYPES ───
interface ParentOption {
  id: number;
  fname: string;
  mname: string;
  lname: string;
  rfid: string | number | null;
  photo: string;
}

interface LinkedStudent {
  linkId: number;
  studentId: number;
  fname: string;
  mname: string;
  lname: string;
  grade: string;
  section: string;
  photo: string;
  relation: string;
  isPrimary: boolean;
  canPickup: boolean;
}

interface Stats {
  totalParents: number;
  totalLinkedStudents: number;
  totalUnlinked: number;
}

// ─── BASE URL: no /api here ───
const API_URL = import.meta.env.VITE_API_URL || 'http://10.128.2.112:3000';

const INK = '#1B2130';
const PAPER = '#F2F3EE';
const PAPER_LINE = '#DDDFD5';
const BRASS = '#B08A3E';
const MUTED = '#6B7280';

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
`;

const fieldStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${PAPER_LINE}`,
  color: INK,
};

const HEADERS = [
  { label: 'RFID',       width: 'w-32' },
  { label: 'First Name', width: 'w-32' },
  { label: 'Middle Name',width: 'w-32' },
  { label: 'Last Name',  width: 'w-32' },
  { label: 'Grade',      width: 'w-24' },
  { label: 'Section',    width: 'w-24' },
  { label: 'Relation',   width: 'w-24' },
  { label: 'Pickup',     width: 'w-20' },
  { label: 'Actions',    width: 'w-20' },
];

const ParentPage = () => {
  // ─── STATE ───
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | ''>('');
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [stats, setStats] = useState<Stats>({ totalParents: 0, totalLinkedStudents: 0, totalUnlinked: 0 });

  const [loadingParents, setLoadingParents] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<LinkedStudent | null>(null);

  // ─── EFFECTS ───
  useEffect(() => { fetchParents(); }, []);

  useEffect(() => {
    if (selectedParentId) fetchLinkedStudents(Number(selectedParentId));
    else setLinkedStudents([]);
  }, [selectedParentId]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, itemsPerPage, selectedParentId]);

  // ─── API ───
  const fetchParents = async () => {
    try {
      setLoadingParents(true);
      setError(null);
      // ─── /api included here ───
      const res = await fetch(`${API_URL}/api/users?type=Parent`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ParentOption[] = await res.json();
      setParents(data);
      setStats((s) => ({ ...s, totalParents: data.length }));
    } catch (err) {
      console.error(err);
      setError('Error loading parents. Check the backend.');
    } finally {
      setLoadingParents(false);
    }
  };

  const fetchLinkedStudents = async (parentId: number) => {
    try {
      setLoadingLinks(true);
      setError(null);
      // ─── /api included here ───
      const res = await fetch(`${API_URL}/api/parent_student?parentId=${parentId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LinkedStudent[] = await res.json();
      setLinkedStudents(data);
    } catch (err) {
      console.error(err);
      setError('Error loading linked students.');
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleLinkStudents = async (studentIds: number[], relation: string, canPickup: boolean) => {
    if (!selectedParentId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // ─── /api included here ───
      const res = await fetch(`${API_URL}/api/parent_student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: Number(selectedParentId),
          studentIds,
          relation,
          canPickup,
        }),
      });
      const result = await res.json();
      if (result.success) {
        await fetchLinkedStudents(Number(selectedParentId));
        setShowAddModal(false);
        setSuccessMessage(`${studentIds.length} student${studentIds.length === 1 ? '' : 's'} linked successfully!`);
      } else {
        setError(result.error || 'Failed to link students');
      }
    } catch (err) {
      console.error(err);
      setError('Error linking students.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlinkClick = (student: LinkedStudent) => {
    setUnlinkTarget(student);
    setShowUnlinkConfirm(true);
  };

  const handleUnlinkConfirm = async () => {
    if (!unlinkTarget) return;
    try {
      // ─── /api included here ───
      const res = await fetch(`${API_URL}/api/parent_student?linkId=${unlinkTarget.linkId}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        await fetchLinkedStudents(Number(selectedParentId));
        setSuccessMessage(`Unlinked ${unlinkTarget.fname} ${unlinkTarget.lname}.`);
        setShowUnlinkConfirm(false);
        setUnlinkTarget(null);
      } else {
        setError(result.error || 'Failed to unlink');
        setShowUnlinkConfirm(false);
      }
    } catch (err) {
      console.error(err);
      setError('Error unlinking.');
      setShowUnlinkConfirm(false);
    }
  };

  // ─── FILTER + PAGINATE ───
  const filtered = linkedStudents.filter((s) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      s.fname.toLowerCase().includes(term) ||
      s.lname.toLowerCase().includes(term) ||
      `${s.fname} ${s.mname} ${s.lname}`.toLowerCase().includes(term) ||
      s.grade.toLowerCase().includes(term) ||
      s.section.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const selectedParent = parents.find((p) => p.id === Number(selectedParentId));

  // ─── RENDER ───
  return (
    <div style={{ background: PAPER, fontFamily: "'Inter', sans-serif" }} className="p-6 sm:p-8 min-h-full">
      <style>{FONTS}</style>

      {/* ALERTS */}
      {successMessage && (
        <div className="mb-4 px-5 py-3 flex items-center justify-between rounded-sm"
             style={{ background: '#fff', borderLeft: `3px solid #5C6B2F`, border: `1px solid ${PAPER_LINE}` }}>
          <span className="text-sm" style={{ color: INK }}>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} style={{ color: MUTED }}><XCircle size={16} /></button>
        </div>
      )}
      {error && (
        <div className="mb-4 px-5 py-3 flex items-center justify-between rounded-sm"
             style={{ background: '#fff', borderLeft: `3px solid #B3324B`, border: `1px solid ${PAPER_LINE}` }}>
          <span className="text-sm" style={{ color: INK }}>{error}</span>
          <button onClick={() => setError(null)} style={{ color: MUTED }}><XCircle size={16} /></button>
        </div>
      )}

      {/* STATS */}
      <div className="flex flex-col sm:flex-row rounded-sm mb-8 overflow-hidden"
           style={{ border: `1px solid ${PAPER_LINE}`, background: '#fff' }}>
        {[
          { label: 'Total Parents',      value: stats.totalParents,        accent: BRASS,          icon: UsersIcon },
          { label: 'Linked Students',    value: linkedStudents.length,      accent: '#2E5C8A',      icon: Link2 },
          { label: 'Selected Parent',    value: selectedParent ? 1 : 0,     accent: '#5C6B2F',      icon: GraduationCap },
        ].map((s, i) => (
          <div key={s.label} className="flex-1 px-6 py-5"
               style={{ borderLeft: i === 0 ? 'none' : `1px solid ${PAPER_LINE}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ width: 14, height: 2, background: s.accent, display: 'inline-block' }} />
              <span className="text-[11px] tracking-[0.14em] uppercase"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>{s.label}</span>
            </div>
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 30, color: INK, lineHeight: 1.05 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* PARENT SELECTOR + ADD BUTTON */}
      <div className="rounded-sm mb-6 px-6 py-5"
           style={{ border: `1px solid ${PAPER_LINE}`, background: '#fff' }}>
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          <div className="flex-1">
            <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                   style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
              Select Parent
            </label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value ? Number(e.target.value) : '')}
              className="w-full pl-2 pr-6 py-2.5 text-sm focus:outline-none"
              style={{ ...fieldStyle, borderBottom: `2px solid ${INK}` }}
              disabled={loadingParents}
            >
              <option value="">
                {loadingParents ? 'Loading parents…' : '-- Choose a parent --'}
              </option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lname}, {p.fname} {p.mname} {p.rfid ? `(RFID: ${p.rfid})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={!selectedParentId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: INK, color: PAPER, fontWeight: 500 }}
          >
            <Plus size={16} /> Add Student
          </button>
        </div>

        {selectedParent && (
          <div className="mt-4 flex items-center gap-3 text-xs"
               style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
            <span>Linked to: <strong style={{ color: INK }}>{selectedParent.fname} {selectedParent.lname}</strong></span>
            <span>•</span>
            <span>{linkedStudents.length} student{linkedStudents.length === 1 ? '' : 's'}</span>
          </div>
        )}
      </div>

      {/* STUDENTS TABLE */}
      <div className="rounded-sm overflow-hidden"
           style={{ border: `1px solid ${PAPER_LINE}`, background: '#fff' }}>
        <div className="px-6 py-5" style={{ borderBottom: `2px solid ${INK}` }}>
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2" style={{ color: MUTED }} size={16} />
              <input
                type="text"
                placeholder="Search linked students…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-6 pr-2 py-2 text-sm focus:outline-none"
                style={fieldStyle}
                disabled={!selectedParentId}
              />
            </div>

            {filtered.length > 0 && (
              <p className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                {filtered.length} record{filtered.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[1000px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${PAPER_LINE}` }}>
                {HEADERS.map((h) => (
                  <th key={h.label}
                      className={`text-left py-3 px-4 text-[11px] tracking-[0.1em] uppercase ${h.width}`}
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED, fontWeight: 500 }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => (
                <tr key={s.linkId} style={{ borderBottom: `1px solid ${PAPER_LINE}` }} className="hover:bg-[#F7F8F4] transition-colors">
                  <td className="py-3 px-4 text-sm truncate" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    {s.studentId}
                  </td>
                  <td className="py-3 px-4 text-sm truncate" style={{ color: INK }}>{s.fname}</td>
                  <td className="py-3 px-4 text-sm truncate" style={{ color: INK }}>{s.mname}</td>
                  <td className="py-3 px-4 text-sm truncate" style={{ color: INK }}>{s.lname}</td>
                  <td className="py-3 px-4 text-sm truncate" style={{ color: INK }}>{s.grade || '—'}</td>
                  <td className="py-3 px-4 text-sm truncate" style={{ color: INK }}>{s.section || '—'}</td>
                  <td className="py-3 px-4 text-sm truncate" style={{ color: MUTED }}>{s.relation}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] px-2 py-1 rounded-sm uppercase tracking-wide inline-block"
                          style={{
                            color: s.canPickup ? '#2E5C8A' : '#B3324B',
                            border: `1px solid ${s.canPickup ? '#2E5C8A' : '#B3324B'}`,
                            fontFamily: "'IBM Plex Mono', monospace",
                          }}>
                      {s.canPickup ? 'Allowed' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleUnlinkClick(s)}
                      className="p-1.5 rounded-sm"
                      style={{ color: '#B3324B' }}
                      title="Unlink student"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!selectedParentId && (
            <div className="text-center py-14">
              <UsersIcon className="mx-auto mb-3" style={{ color: PAPER_LINE }} size={36} />
              <p className="text-sm" style={{ color: INK }}>Select a parent to view linked students</p>
              <p className="text-xs mt-1" style={{ color: MUTED }}>Use the dropdown above to begin</p>
            </div>
          )}

          {selectedParentId && !loadingLinks && filtered.length === 0 && (
            <div className="text-center py-14">
              <UserPlus className="mx-auto mb-3" style={{ color: PAPER_LINE }} size={36} />
              <p className="text-sm" style={{ color: INK }}>No students linked yet</p>
              <p className="text-xs mt-1" style={{ color: MUTED }}>Click "Add Student" above to link students</p>
            </div>
          )}

          {selectedParentId && loadingLinks && (
            <div className="text-center py-14 text-sm" style={{ color: MUTED }}>Loading linked students…</div>
          )}
        </div>

        {/* PAGINATION */}
        {selectedParentId && filtered.length > 0 && (
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
               style={{ borderTop: `1px solid ${PAPER_LINE}` }}>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}
              </span>
              <select value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="text-xs py-1 px-2 focus:outline-none border-b"
                      style={fieldStyle}>
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-sm border disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ borderColor: PAPER_LINE, color: INK }}>
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs px-2" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>
                Page {currentPage} of {totalPages || 1}
              </span>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage >= totalPages}
                      className="p-1.5 rounded-sm border disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ borderColor: PAPER_LINE, color: INK }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* UNLINK CONFIRM */}
      {showUnlinkConfirm && unlinkTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-sm p-6 max-w-md w-full" style={{ background: '#fff', border: `1px solid ${PAPER_LINE}` }}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle style={{ color: '#B3324B' }} size={22} />
              <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, color: INK }}>Unlink Student</h3>
            </div>
            <p className="text-sm mb-1" style={{ color: MUTED }}>Remove link for:</p>
            <p className="text-sm mb-4" style={{ fontWeight: 600, color: INK }}>
              "{unlinkTarget.fname} {unlinkTarget.lname}"
            </p>
            <p className="text-xs mb-6" style={{ color: MUTED }}>The student record itself will not be deleted.</p>
            <div className="flex gap-3">
              <button onClick={handleUnlinkConfirm}
                      className="flex-1 py-2.5 rounded-sm text-sm"
                      style={{ background: '#B3324B', color: '#fff', fontWeight: 500 }}>
                Unlink
              </button>
              <button onClick={() => { setShowUnlinkConfirm(false); setUnlinkTarget(null); }}
                      className="flex-1 py-2.5 rounded-sm text-sm"
                      style={{ border: `1px solid ${PAPER_LINE}`, color: INK }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      <AddStudentToParentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleLinkStudents}
        isSubmitting={isSubmitting}
        parentName={selectedParent ? `${selectedParent.fname} ${selectedParent.lname}` : ''}
        alreadyLinkedIds={linkedStudents.map((s) => s.studentId)}
      />
    </div>
  );
};

export default ParentPage;