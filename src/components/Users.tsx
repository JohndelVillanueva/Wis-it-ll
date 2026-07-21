import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, Users as UsersIcon, GraduationCap, Layers, Download, XCircle, AlertTriangle } from 'lucide-react';
import AddUserModal from '../modal/AddUserModal';

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

interface Stats {
  total: number;
  gradeLevels: number;
  houses: number;
}

const gradeLevels = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const houses = ['Phoenix', 'Griffin', 'Dragon', 'Unicorn'];

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

const fieldStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${PAPER_LINE}`,
  color: INK,
};

const Users = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, gradeLevels: 0, houses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [houseFilter, setHouseFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/students`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.success) {
        setStudents(result.data);
        setStats(result.stats);
      } else {
        setError(result.error || 'Failed to fetch students');
      }
    } catch (err) {
      setError('Error connecting to server. Please make sure the backend is running.');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = students.filter((record) => {
    const fullName = `${record.firstName} ${record.middleName} ${record.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      record.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || record.gradeLevel === gradeFilter;
    const matchesHouse = houseFilter === 'all' || record.house === houseFilter;
    return matchesSearch && matchesGrade && matchesHouse;
  });

  const handleEdit = (record: StudentRecord) => {
    setEditingId(record.id);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setShowModal(true);
  };

  const handleSave = async (formData: Omit<StudentRecord, 'id'>) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let response;
      const url = `${API_URL}/api/students`;

      if (editingId) {
        response = await fetch(`${url}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        const { studentNumber, ...createData } = formData;
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        });
      }

      const result = await response.json();
      if (result.success) {
        await fetchStudents();
        setShowModal(false);
        setSuccessMessage(editingId ? 'Student record updated successfully!' : 'Student record added successfully!');
      } else {
        setError(result.error || 'Failed to save student');
      }
    } catch (err) {
      console.error('Error saving student:', err);
      setError('Error saving record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await fetch(`${API_URL}/api/students/${deleteTargetId}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        await fetchStudents();
        setSuccessMessage(`Student "${deleteTargetName}" deleted successfully!`);
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
        setDeleteTargetName('');
      } else {
        setError(result.error || 'Failed to delete student');
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Error deleting student. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
    setDeleteTargetName('');
  };

  const editingRecord = editingId ? students.find((s) => s.id === editingId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ background: PAPER, fontFamily: "'Inter', sans-serif" }}>
        <style>{FONTS}</style>
        <span className="text-sm" style={{ color: MUTED }}>Loading roster…</span>
      </div>
    );
  }

  return (
    <div style={{ background: PAPER, fontFamily: "'Inter', sans-serif" }} className="p-6 sm:p-8 min-h-full">
      <style>{FONTS}</style>

      {successMessage && (
        <div className="mb-4 px-5 py-3 flex items-center justify-between rounded-sm" style={{ background: '#fff', borderLeft: `3px solid ${HOUSE_PALETTE.Dragon}`, border: `1px solid ${PAPER_LINE}` }}>
          <span className="text-sm" style={{ color: INK }}>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} style={{ color: MUTED }}><XCircle size={16} /></button>
        </div>
      )}

      {error && (
        <div className="mb-4 px-5 py-3 flex items-center justify-between rounded-sm" style={{ background: '#fff', borderLeft: `3px solid ${HOUSE_PALETTE.Phoenix}`, border: `1px solid ${PAPER_LINE}` }}>
          <span className="text-sm" style={{ color: INK }}>{error}</span>
          <button onClick={() => setError(null)} style={{ color: MUTED }}><XCircle size={16} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row rounded-sm mb-8 overflow-hidden" style={{ border: `1px solid ${PAPER_LINE}`, background: '#fff' }}>
        {[
          { label: 'Total Students', value: stats.total, accent: BRASS, icon: UsersIcon },
          { label: 'Grade Levels', value: stats.gradeLevels, accent: HOUSE_PALETTE.Griffin, icon: GraduationCap },
          { label: 'Houses', value: stats.houses, accent: HOUSE_PALETTE.Dragon, icon: Layers },
        ].map((s, i) => (
          <div key={s.label} className="flex-1 px-6 py-5" style={{ borderLeft: i === 0 ? 'none' : `1px solid ${PAPER_LINE}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ width: 14, height: 2, background: s.accent, display: 'inline-block' }} />
              <span className="text-[11px] tracking-[0.14em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>{s.label}</span>
            </div>
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 30, color: INK, lineHeight: 1.05 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${PAPER_LINE}`, background: '#fff' }}>
        <div className="px-6 py-5" style={{ borderBottom: `2px solid ${INK}` }}>
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2" style={{ color: MUTED }} size={16} />
              <input
                type="text"
                placeholder="Search name, student no., guardian, address…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-6 pr-2 py-2 text-sm focus:outline-none"
                style={fieldStyle}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = BRASS)}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = PAPER_LINE)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="pl-2 pr-6 py-2 text-sm focus:outline-none appearance-none" style={fieldStyle}>
                <option value="all">All Grade Levels</option>
                {gradeLevels.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={houseFilter} onChange={(e) => setHouseFilter(e.target.value)} className="pl-2 pr-6 py-2 text-sm focus:outline-none appearance-none" style={fieldStyle}>
                <option value="all">All Houses</option>
                {houses.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm focus:outline focus:outline-2 focus:outline-offset-2" style={{ background: INK, color: PAPER, fontWeight: 500, outlineColor: BRASS }}>
                <Plus size={16} /> Add Student
              </button>
              <button className="flex items-center gap-2 px-3 py-2.5 rounded-sm text-sm focus:outline focus:outline-2 focus:outline-offset-2" style={{ border: `1px solid ${PAPER_LINE}`, color: INK, outlineColor: BRASS }} title="Export">
                <Download size={16} />
              </button>
            </div>
          </div>

          {filteredRecords.length > 0 && (
            <p className="text-xs mt-4" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
              {filteredRecords.length} record{filteredRecords.length === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${PAPER_LINE}` }}>
                {['Student No.', 'First', 'Middle', 'Last', 'Grade', 'Guardian', 'Contact', 'Address', 'House', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-[11px] tracking-[0.1em] uppercase whitespace-nowrap" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} style={{ borderBottom: `1px solid ${PAPER_LINE}` }} className="hover:bg-[#F7F8F4] transition-colors">
                  <td className="py-3 px-4 text-sm whitespace-nowrap" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{record.studentNumber}</td>
                  <td className="py-3 px-4 text-sm whitespace-nowrap" style={{ color: INK }}>{record.firstName}</td>
                  <td className="py-3 px-4 text-sm whitespace-nowrap" style={{ color: INK }}>{record.middleName}</td>
                  <td className="py-3 px-4 text-sm whitespace-nowrap" style={{ color: INK }}>{record.lastName}</td>
                  <td className="py-3 px-4 text-sm whitespace-nowrap" style={{ color: INK }}>{record.gradeLevel}</td>
                  <td className="py-3 px-4 text-sm whitespace-nowrap" style={{ color: INK }}>{record.guardianName}</td>
                  <td className="py-3 px-4 text-sm whitespace-nowrap" style={{ fontFamily: "'IBM Plex Mono', monospace", color: INK }}>{record.guardianContactNo}</td>
                  <td className="py-3 px-4 text-sm max-w-[200px] truncate" style={{ color: MUTED }} title={record.address}>{record.address}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-[10px] px-2 py-1 rounded-sm uppercase tracking-wide" style={{ color: houseColor(record.house), border: `1px solid ${houseColor(record.house)}`, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {record.house}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(record)} className="p-1.5 rounded-sm transition-colors" style={{ color: MUTED }} title="Edit"><Edit size={15} /></button>
                      <button onClick={() => handleDeleteClick(record.id, `${record.firstName} ${record.lastName}`)} className="p-1.5 rounded-sm transition-colors" style={{ color: HOUSE_PALETTE.Phoenix }} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecords.length === 0 && (
            <div className="text-center py-14">
              <UsersIcon className="mx-auto mb-3" style={{ color: PAPER_LINE }} size={36} />
              <p className="text-sm" style={{ color: INK }}>No student records found</p>
              <p className="text-xs mt-1" style={{ color: MUTED }}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-sm p-6 max-w-md w-full" style={{ background: '#fff', border: `1px solid ${PAPER_LINE}` }}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle style={{ color: HOUSE_PALETTE.Phoenix }} size={22} />
              <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18, color: INK }}>Confirm Delete</h3>
            </div>
            <p className="text-sm mb-1" style={{ color: MUTED }}>Are you sure you want to delete the record for:</p>
            <p className="text-sm mb-4" style={{ fontWeight: 600, color: INK }}>"{deleteTargetName}"</p>
            <p className="text-xs mb-6" style={{ color: MUTED }}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 rounded-sm text-sm" style={{ background: HOUSE_PALETTE.Phoenix, color: '#fff', fontWeight: 500 }}>Delete</button>
              <button onClick={handleDeleteCancel} className="flex-1 py-2.5 rounded-sm text-sm" style={{ border: `1px solid ${PAPER_LINE}`, color: INK }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <AddUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        editingRecord={editingRecord}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Users;