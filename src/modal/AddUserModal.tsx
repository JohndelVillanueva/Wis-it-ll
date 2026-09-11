import { useState, useEffect } from 'react';
import { User, IdCard, GraduationCap, Home, Phone, MapPin, Loader2, X, ChevronDown } from 'lucide-react';

interface StudentRecord {
  id: number;
  studentNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gradeLevel: string;
  guardianName: string;
  guardianContactNo: string;
  address: string;
  house: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StudentRecord, 'id'>) => Promise<void>;
  editingRecord?: StudentRecord | null;
  isSubmitting?: boolean;
}

const emptyFormData = {
  studentNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  gradeLevel: '',
  guardianName: '',
  guardianContactNo: '',
  address: '',
  house: '',
};

const gradeLevelGroups = [
  { label: 'Early Years', options: ['Toddler', 'Nursery', 'Pre-Kinder'] },
  {
    label: 'Primary',
    options: [
      'Kinder - Year 1',
      'Grade 1 - Year 2',
      'Grade 2 - Year 3',
      'Grade 3 - Year 4',
      'Grade 4 - Year 5',
      'Grade 5 - Year 6',
      'Grade 6 - Year 7',
    ],
  },
  {
    label: 'Secondary',
    options: [
      'Grade 7 - Year 8',
      'Grade 8 - Year 9',
      'Grade 9 - Year 10',
      'Grade 10 - Year 11',
      'Grade 11 - Year 12',
      'Grade 12 - Year 13',
    ],
  },
];
const houses = ['Owl', 'Wolves', 'Bulls', 'Orcas'];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

const Field = ({
  label, icon: Icon, children,
}: { label: string; icon?: any; children: React.ReactNode }) => (
  <div>
    <label className="flex items-center gap-2 text-xs uppercase tracking-wide mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
      {Icon && <Icon size={13} style={{ color: MUTED }} />}
      {label}
    </label>
    {children}
  </div>
);

const AddUserModal = ({ isOpen, onClose, onSave, editingRecord = null, isSubmitting = false }: AddUserModalProps) => {
  const [formData, setFormData] = useState(() => {
    if (editingRecord) {
      const { id, ...rest } = editingRecord as any;
      return rest;
    }
    return emptyFormData;
  });

  const [generatedStudentNumber, setGeneratedStudentNumber] = useState<string>('');
  const [isLoadingStudentNumber, setIsLoadingStudentNumber] = useState(false);

  const [guardianSuggestions, setGuardianSuggestions] = useState<
    { guardianName: string; guardianContactNo: string; address: string }[]
  >([]);
  const [showGuardianDropdown, setShowGuardianDropdown] = useState(false);
  const [isSearchingGuardians, setIsSearchingGuardians] = useState(false);

  useEffect(() => {
    const query = formData.guardianName?.trim();
    if (!query) {
      setGuardianSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearchingGuardians(true);
        const response = await fetch(`${API_URL}/api/search-guardian-names?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to search guardians');
        const result = await response.json();
        if (result.success) {
          setGuardianSuggestions(result.data);
        }
      } catch (error) {
        console.error('Error searching guardian names:', error);
        setGuardianSuggestions([]);
      } finally {
        setIsSearchingGuardians(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.guardianName]);

  useEffect(() => {
    if (isOpen && !editingRecord) {
      fetchLatestStudentNumber();
    }
  }, [isOpen, editingRecord]);

  useEffect(() => {
    if (editingRecord) {
      const { id, ...rest } = editingRecord as any;
      setFormData(rest);
    } else {
      setFormData((prev: any) => ({ ...prev, studentNumber: generatedStudentNumber || emptyFormData.studentNumber }));
    }
  }, [editingRecord, generatedStudentNumber]);

  const fetchLatestStudentNumber = async () => {
    try {
      setIsLoadingStudentNumber(true);
      const response = await fetch(`${API_URL}/api/get-latest-student-number`);
      if (!response.ok) throw new Error('Failed to fetch latest student number');

      const result = await response.json();
      if (result.success) {
        const newNumber = result.data.studentNumber;
        setGeneratedStudentNumber(newNumber);
        setFormData((prev: any) => ({ ...prev, studentNumber: newNumber }));
      }
    } catch (error) {
      console.error('Error fetching latest student number:', error);
      const defaultNumber = 'S26000001';
      setGeneratedStudentNumber(defaultNumber);
      setFormData((prev: any) => ({ ...prev, studentNumber: defaultNumber }));
    } finally {
      setIsLoadingStudentNumber(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{FONTS}</style>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="rounded-sm p-6 max-w-lg w-full mx-auto max-h-[90vh] overflow-y-auto" style={{ background: '#fff', border: `1px solid ${PAPER_LINE}` }}>
          <div className="flex items-center justify-between mb-6" style={{ borderBottom: `2px solid ${INK}`, paddingBottom: 16 }}>
            <div>
              <p className="text-[11px] tracking-[0.14em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                {editingRecord ? 'Amend Record' : 'New Entry'}
              </p>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 19, color: INK }}>
                {editingRecord ? 'Edit Student Record' : 'Add New Student'}
              </h3>
            </div>
            <button onClick={onClose} style={{ color: MUTED }}><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <Field label="Student Number *" icon={IdCard}>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.studentNumber}
                    onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                    required
                    disabled={isLoadingStudentNumber || !editingRecord}
                    className="w-full pr-8 pb-2 text-sm focus:outline-none disabled:cursor-not-allowed"
                    style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono', monospace", color: !editingRecord ? MUTED : INK }}
                    placeholder={isLoadingStudentNumber ? 'Generating…' : 'Auto-generated'}
                  />
                  {isLoadingStudentNumber && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-y-2">
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: BRASS }} />
                    </div>
                  )}
                </div>
                <p className="text-xs mt-1.5" style={{ color: MUTED }}>
                  {editingRecord ? 'Student number cannot be changed' : 'Auto-generated (S26XXXXXX)'}
                </p>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="First name *">
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required
                    className="w-full pb-2 text-sm focus:outline-none" style={fieldStyle}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = BRASS)} onBlur={(e) => (e.currentTarget.style.borderBottomColor = PAPER_LINE)} />
                </Field>
                <Field label="Middle name">
                  <input type="text" value={formData.middleName} onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="w-full pb-2 text-sm focus:outline-none" style={fieldStyle}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = BRASS)} onBlur={(e) => (e.currentTarget.style.borderBottomColor = PAPER_LINE)} />
                </Field>
                <Field label="Last name *">
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required
                    className="w-full pb-2 text-sm focus:outline-none" style={fieldStyle}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = BRASS)} onBlur={(e) => (e.currentTarget.style.borderBottomColor = PAPER_LINE)} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Grade Level *" icon={GraduationCap}>
                  <div className="relative">
                    <select
                      value={formData.gradeLevel}
                      onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                      required
                      className="w-full pl-3 pr-9 py-2.5 text-sm rounded-sm cursor-pointer focus:outline-none appearance-none transition-colors"
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        background: '#fff',
                        border: `1px solid ${PAPER_LINE}`,
                        color: formData.gradeLevel ? INK : MUTED,
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = BRASS)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = PAPER_LINE)}
                    >
                      <option value="">Select grade level</option>
                      {gradeLevelGroups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
                  </div>
                </Field>
                <Field label="House *" icon={Home}>
                  <div className="relative">
                    <select
                      value={formData.house}
                      onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                      required
                      className="w-full pl-3 pr-9 py-2.5 text-sm rounded-sm cursor-pointer focus:outline-none appearance-none transition-colors"
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        background: '#fff',
                        border: `1px solid ${PAPER_LINE}`,
                        color: formData.house ? INK : MUTED,
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = BRASS)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = PAPER_LINE)}
                    >
                      <option value="">Select house</option>
                      {houses.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
                  </div>
                </Field>
              </div>

              <Field label="Guardian Name *" icon={User}>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => {
                      setFormData({ ...formData, guardianName: e.target.value });
                      setShowGuardianDropdown(true);
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderBottomColor = BRASS;
                      if (guardianSuggestions.length > 0) setShowGuardianDropdown(true);
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderBottomColor = PAPER_LINE;
                      // Delay so a click on a suggestion registers before the dropdown unmounts
                      setTimeout(() => setShowGuardianDropdown(false), 150);
                    }}
                    required
                    autoComplete="off"
                    className="w-full pb-2 text-sm focus:outline-none"
                    style={fieldStyle}
                    placeholder="e.g. Nene Santos"
                  />
                  {isSearchingGuardians && (
                    <div className="absolute right-0 top-0">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: BRASS }} />
                    </div>
                  )}

                  {showGuardianDropdown && guardianSuggestions.length > 0 && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1 z-10 rounded-sm overflow-hidden max-h-48 overflow-y-auto"
                      style={{ background: '#fff', border: `1px solid ${PAPER_LINE}`, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    >
                      {guardianSuggestions.map((g, i) => (
                        <button
                          key={`${g.guardianName}-${i}`}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              guardianName: g.guardianName,
                              guardianContactNo: g.guardianContactNo || formData.guardianContactNo,
                              address: g.address || formData.address,
                            });
                            setShowGuardianDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 block"
                          style={{ color: INK, borderBottom: `1px solid ${PAPER_LINE}` }}
                        >
                          <div style={{ fontWeight: 500 }}>{g.guardianName}</div>
                          {g.guardianContactNo && (
                            <div className="text-xs" style={{ color: MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>
                              {g.guardianContactNo}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              <Field label="Guardian Contact No. *" icon={Phone}>
                <input type="text" value={formData.guardianContactNo} onChange={(e) => setFormData({ ...formData, guardianContactNo: e.target.value })} required
                  className="w-full pb-2 text-sm focus:outline-none" style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono', monospace" }} placeholder="Enter contact number"
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = BRASS)} onBlur={(e) => (e.currentTarget.style.borderBottomColor = PAPER_LINE)} />
              </Field>

              <Field label="Address *" icon={MapPin}>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required rows={2}
                  className="w-full pb-2 text-sm focus:outline-none resize-none" style={fieldStyle} placeholder="Enter address"
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = BRASS)} onBlur={(e) => (e.currentTarget.style.borderBottomColor = PAPER_LINE)} />
              </Field>
            </div>

            <div className="flex gap-3 mt-7">
              <button type="submit" disabled={isSubmitting || isLoadingStudentNumber}
                className="flex-1 px-4 py-2.5 rounded-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: INK, color: PAPER, fontWeight: 500 }}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                  </span>
                ) : editingRecord ? 'Update' : 'Add Student'}
              </button>
              <button type="button" onClick={onClose} disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: `1px solid ${PAPER_LINE}`, color: INK }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddUserModal;