import { useEffect, useState } from 'react';
import { X, Search, Check, Users } from 'lucide-react';

interface Student {
  id: number;
  fname: string;
  mname: string;
  lname: string;
  grade: string;
  section: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentIds: number[], relation: string, canPickup: boolean) => void;
  isSubmitting: boolean;
  parentName: string;
  alreadyLinkedIds: number[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://10.128.2.112:3000';

const INK = '#1B2130';
const PAPER_LINE = '#DDDFD5';
const MUTED = '#6B7280';
const BRASS = '#B08A3E';

const fieldStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${PAPER_LINE}`,
  color: INK,
};

const AddStudentToParentModal = ({
  isOpen, onClose, onSave, isSubmitting, parentName, alreadyLinkedIds,
}: Props) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [relation, setRelation] = useState('father');
  const [canPickup, setCanPickup] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds([]);
    setSearch('');
    setRelation('father');
    setCanPickup(true);
    setDropdownOpen(true);
    fetchStudents();
  }, [isOpen]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/users?type=Student`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
      setError('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const available = students.filter((s) => !alreadyLinkedIds.includes(s.id));

  const filtered = available.filter((s) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      s.fname.toLowerCase().includes(term) ||
      s.lname.toLowerCase().includes(term) ||
      `${s.fname} ${s.mname} ${s.lname}`.toLowerCase().includes(term) ||
      s.grade.toLowerCase().includes(term) ||
      s.section.toLowerCase().includes(term)
    );
  });

  const toggleStudent = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;
    onSave(selectedIds, relation, canPickup);
  };

  if (!isOpen) return null;

  const selectedStudents = students.filter((s) => selectedIds.includes(s.id));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* ─── TALLER MODAL ─── */}
      <div
        className="rounded-sm w-full max-w-4xl h-[90vh] flex flex-col"
        style={{ background: '#fff', border: `1px solid ${PAPER_LINE}` }}
      >
        {/* HEADER */}
        <div
          className="px-8 py-5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: `2px solid ${INK}` }}
        >
          <div>
            <h3
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                fontSize: 22,
                color: INK,
              }}
            >
              Link Students to Parent
            </h3>
            <p className="text-sm mt-1" style={{ color: MUTED }}>
              Parent: <strong style={{ color: INK }}>{parentName}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ color: MUTED }} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        {/* BODY (scrollable) */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          {/* Relation + Pickup */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}
              >
                Relation
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full pl-2 pr-6 py-2.5 text-sm focus:outline-none appearance-none"
                style={fieldStyle}
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="driver">Driver</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label
                className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}
              >
                Pickup Authorization
              </label>
              <label
                className="flex items-center gap-2 py-2.5 text-sm"
                style={{ color: INK }}
              >
                <input
                  type="checkbox"
                  checked={canPickup}
                  onChange={(e) => setCanPickup(e.target.checked)}
                />
                Allowed to pick up
              </label>
            </div>
          </div>

          {/* Multi-select dropdown */}
          <div>
            <label
              className="text-[11px] tracking-[0.14em] uppercase block mb-2"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}
            >
              Select Students ({selectedIds.length} selected)
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-full text-left pl-6 pr-4 py-3 text-sm flex items-center justify-between"
                style={{ ...fieldStyle, borderBottom: `2px solid ${INK}` }}
              >
                <span style={{ color: selectedStudents.length ? INK : MUTED }}>
                  {selectedStudents.length === 0
                    ? '-- Click to select students --'
                    : `${selectedStudents.length} student${selectedStudents.length === 1 ? '' : 's'} selected`}
                </span>
                <Search size={16} style={{ color: MUTED }} />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute z-10 mt-1 w-full rounded-sm shadow-lg"
                  style={{
                    background: '#fff',
                    border: `1px solid ${PAPER_LINE}`,
                    maxHeight: 600,
                  }}
                >
                  {/* Search */}
                  <div
                    className="px-5 py-3 relative"
                    style={{ borderBottom: `1px solid ${PAPER_LINE}` }}
                  >
                    <Search
                      className="absolute left-5 top-1/2 -translate-y-1/2"
                      style={{ color: MUTED }}
                      size={16}
                    />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search students…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 text-sm focus:outline-none"
                      style={fieldStyle}
                    />
                  </div>

                  {/* Options (scrollable) */}
                  <div className="overflow-y-auto" style={{ maxHeight: 520 }}>
                    {loading && (
                      <p
                        className="px-5 py-8 text-center text-sm"
                        style={{ color: MUTED }}
                      >
                        Loading students…
                      </p>
                    )}
                    {!loading && filtered.length === 0 && (
                      <p
                        className="px-5 py-8 text-center text-sm"
                        style={{ color: MUTED }}
                      >
                        {students.length === 0
                          ? 'No students found in the database.'
                          : available.length === 0
                          ? 'All students are already linked.'
                          : 'No matches found.'}
                      </p>
                    )}
                    {!loading &&
                      filtered.map((s) => {
                        const isSelected = selectedIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleStudent(s.id)}
                            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-left hover:bg-[#F7F8F4]"
                            style={{ borderBottom: `1px solid ${PAPER_LINE}` }}
                          >
                            <span
                              className="w-5 h-5 flex items-center justify-center rounded-sm flex-shrink-0"
                              style={{
                                border: `1px solid ${isSelected ? INK : PAPER_LINE}`,
                                background: isSelected ? INK : 'transparent',
                              }}
                            >
                              {isSelected && (
                                <Check size={14} style={{ color: '#fff' }} />
                              )}
                            </span>
                            <span className="flex-1" style={{ color: INK }}>
                              {s.lname}, {s.fname} {s.mname}
                            </span>
                            <span
                              className="text-xs"
                              style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                color: MUTED,
                              }}
                            >
                              {s.grade} — {s.section}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected chips */}
          {selectedStudents.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedStudents.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-sm"
                  style={{
                    border: `1px solid ${PAPER_LINE}`,
                    color: INK,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {s.fname} {s.lname}
                  <button
                    onClick={() => toggleStudent(s.id)}
                    style={{ color: MUTED }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {error && (
            <p
              className="text-sm px-4 py-3 rounded-sm"
              style={{
                background: '#fff',
                borderLeft: `3px solid #B3324B`,
                color: INK,
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="px-8 py-5 flex gap-3 justify-end flex-shrink-0"
          style={{ borderTop: `1px solid ${PAPER_LINE}` }}
        >
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-sm text-sm"
            style={{ border: `1px solid ${PAPER_LINE}`, color: INK }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || isSubmitting}
            className="px-6 py-3 rounded-sm text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ background: INK, color: '#fff', fontWeight: 500 }}
          >
            <Users size={16} />
            {isSubmitting
              ? 'Linking…'
              : `Link ${selectedIds.length || ''} Student${selectedIds.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentToParentModal;