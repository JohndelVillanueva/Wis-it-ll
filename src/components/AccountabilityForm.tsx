import { useState, useEffect, useRef } from 'react';
import { Save, X, User, Building, Monitor, Calendar, Clipboard, AlertCircle, Loader2, Plus, List, FilePlus, Trash2, Edit2 } from 'lucide-react';
import EditAssignmentModal from '../modal/EditAssignmentModal';

// Reads from your frontend .env (VITE_API_URL=http://localhost:3000)
// Your server mounts all route modules directly under /api (see routes.forEach in index.ts),
// so equipment's own paths (/assignments, /employees, etc.) live at /api/... with no extra prefix.
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const INK = '#23262B';
const MUTED = '#6B7280';
const HAIRLINE = '#E4E4E0';
const AMBER = '#B8792E';
const CRIMSON = '#B3324B';

const CONDITION_COLORS: Record<string, string> = {
  excellent: '#2F6D4F',
  good: '#2E5C8A',
  fair: AMBER,
  poor: CRIMSON,
};

type Employee = {
  id: number;
  name: string;
  employeeId: string;
  position: string;
};

type Assignment = {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  equipment: string[];
  assignedDate: string;
  condition: string;
  notes: string;
};

// ====================================================
// All Assignments (list) tab
// ====================================================
const AssignmentsList = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Search and Pagination state
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');

  // Edit modal state
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/assignments`);
      const json = await res.json();
      if (json.success) {
        setAssignments(json.data);
        setFilteredAssignments(json.data);
      } else {
        setError(json.error || 'Failed to load assignments');
      }
    } catch (err) {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Filter assignments based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAssignments(assignments);
      setCurrentPage(1);
      return;
    }

    const filtered = assignments.filter((a) => {
      const searchLower = searchTerm.toLowerCase().trim();
      return (
        (a.employeeName?.toLowerCase().includes(searchLower) || false) ||
        a.department.toLowerCase().includes(searchLower) ||
        (a.equipment || []).some(eq => eq.toLowerCase().includes(searchLower)) ||
        a.condition.toLowerCase().includes(searchLower) ||
        (a.notes?.toLowerCase().includes(searchLower) || false)
      );
    });
    setFilteredAssignments(filtered);
    setCurrentPage(1);
  }, [searchTerm, assignments]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this equipment assignment?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/assignments/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setAssignments((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(json.error || 'Failed to delete assignment');
      }
    } catch (err) {
      alert('Could not reach the server. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsEditModalOpen(true);
  };

  const handleUpdateAssignment = (updatedAssignment: Assignment) => {
    setAssignments((prev) => 
      prev.map((a) => a.id === updatedAssignment.id ? updatedAssignment : a)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="animate-spin" style={{ color: MUTED }} />
        <span className="ml-2 text-sm" style={{ color: MUTED }}>Loading assignments…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-5 py-4 rounded-lg" style={{ background: `${CRIMSON}08`, border: `1px solid ${CRIMSON}30` }}>
        <p className="text-sm font-semibold" style={{ color: INK }}>Couldn't load assignments</p>
        <p className="text-sm mt-1" style={{ color: MUTED }}>{error}</p>
        <button
          onClick={fetchAssignments}
          className="mt-3 px-4 py-2 rounded-lg text-sm"
          style={{ background: INK, color: '#fff', fontWeight: 500 }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-16">
        <Clipboard size={28} className="mx-auto mb-3" style={{ color: MUTED }} />
        <p className="text-sm font-medium" style={{ color: INK }}>No equipment assignments yet</p>
        <p className="text-sm mt-1" style={{ color: MUTED }}>Assignments you create will show up here.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearch}
            placeholder="Search assignments..."
            className="w-full px-3 py-2 pl-9 rounded-lg text-sm focus:outline-none transition-colors"
            style={{
              border: `1px solid ${HAIRLINE}`,
              background: '#fff',
              color: INK,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = AMBER)}
            onBlur={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={MUTED}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
              style={{ color: MUTED }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="text-sm" style={{ color: MUTED }}>
          {filteredAssignments.length} {filteredAssignments.length === 1 ? 'result' : 'results'}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: MUTED }}>Employee</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: MUTED }}>Department</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: MUTED }}>Equipment</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: MUTED }}>Assigned</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: MUTED }}>Condition</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: MUTED }}>Notes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <p className="text-sm" style={{ color: MUTED }}>No assignments match your search.</p>
                </td>
              </tr>
            ) : (
              currentItems.map((a) => (
                <tr key={a.id} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  <td className="px-4 py-3 font-medium" style={{ color: INK }}>{a.employeeName || '—'}</td>
                  <td className="px-4 py-3" style={{ color: INK }}>{a.department}</td>
                  <td className="px-4 py-3" style={{ color: INK }}>
                    <div className="flex flex-wrap gap-1.5">
                      {(a.equipment || []).map((eq, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: `${AMBER}14`, color: AMBER }}
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: INK }}>{a.assignedDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-sm"
                      style={{
                        color: CONDITION_COLORS[a.condition] || MUTED,
                        border: `1px solid ${CONDITION_COLORS[a.condition] || MUTED}`,
                      }}
                    >
                      {a.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" style={{ color: MUTED }} title={a.notes}>
                    {a.notes || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(a)}
                        className="p-1.5 rounded-md transition-colors hover:bg-slate-100"
                        style={{ color: MUTED }}
                        aria-label="Edit assignment"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="p-1.5 rounded-md transition-colors disabled:opacity-50 hover:bg-slate-100"
                        style={{ color: MUTED }}
                        aria-label="Delete assignment"
                      >
                        {deletingId === a.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredAssignments.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
          <div className="text-sm" style={{ color: MUTED }}>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAssignments.length)} of {filteredAssignments.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                border: `1px solid ${HAIRLINE}`,
                color: currentPage === 1 ? MUTED : INK,
                background: '#fff',
              }}
            >
              Previous
            </button>
            
            {currentPage > 3 && totalPages > 5 && (
              <>
                <button
                  onClick={() => paginate(1)}
                  className="px-3 py-1.5 rounded-md text-sm transition-colors"
                  style={{
                    border: `1px solid ${HAIRLINE}`,
                    color: INK,
                    background: '#fff',
                  }}
                >
                  1
                </button>
                {currentPage > 4 && (
                  <span className="px-2" style={{ color: MUTED }}>…</span>
                )}
              </>
            )}
            
            {getPageNumbers().map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => paginate(pageNumber)}
                className="px-3 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  background: currentPage === pageNumber ? AMBER : '#fff',
                  color: currentPage === pageNumber ? '#fff' : INK,
                  border: `1px solid ${currentPage === pageNumber ? AMBER : HAIRLINE}`,
                }}
              >
                {pageNumber}
              </button>
            ))}
            
            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                {currentPage < totalPages - 3 && (
                  <span className="px-2" style={{ color: MUTED }}>…</span>
                )}
                <button
                  onClick={() => paginate(totalPages)}
                  className="px-3 py-1.5 rounded-md text-sm transition-colors"
                  style={{
                    border: `1px solid ${HAIRLINE}`,
                    color: INK,
                    background: '#fff',
                  }}
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                border: `1px solid ${HAIRLINE}`,
                color: currentPage === totalPages ? MUTED : INK,
                background: '#fff',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditAssignmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAssignment(null);
        }}
        assignment={editingAssignment}
        onUpdate={handleUpdateAssignment}
        API_BASE={API_BASE}
      />
    </div>
  );
};

const AccountabilityForm = () => {
  // Initialize activeTab from localStorage or default to 'list'
  const [activeTab, setActiveTab] = useState<'new' | 'list'>(() => {
    const savedTab = localStorage.getItem('accountabilityTab');
    return (savedTab === 'new' || savedTab === 'list') ? savedTab : 'list';
  });

  const [formData, setFormData] = useState({
    employeeId: '',      // users24.id, sent to the API
    employeeQuery: '',   // what's typed/shown in the search box
    department: '',
    equipment: [''] as string[],   // array so multiple types can be added
    assignedDate: '',
    condition: 'good',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [employeeResults, setEmployeeResults] = useState<Employee[]>([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [isSearchingEmployees, setIsSearchingEmployees] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('accountabilityTab', activeTab);
  }, [activeTab]);

  // Debounced employee search as the user types
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    if (!formData.employeeQuery.trim() || formData.employeeId) {
      setEmployeeResults([]);
      return;
    }

    searchDebounce.current = setTimeout(async () => {
      setIsSearchingEmployees(true);
      try {
        const res = await fetch(`${API_BASE}/employees?search=${encodeURIComponent(formData.employeeQuery)}`);
        const json = await res.json();
        if (json.success) setEmployeeResults(json.data);
      } catch (err) {
        setEmployeeResults([]);
      } finally {
        setIsSearchingEmployees(false);
      }
    }, 300);

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [formData.employeeQuery, formData.employeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleEmployeeQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, employeeQuery: e.target.value, employeeId: '' });
    setShowEmployeeDropdown(true);
    if (errors.employeeId) setErrors({ ...errors, employeeId: '' });
  };

  const selectEmployee = (employee: Employee) => {
    setFormData({ ...formData, employeeId: String(employee.id), employeeQuery: `${employee.name} (${employee.employeeId})` });
    setShowEmployeeDropdown(false);
    setEmployeeResults([]);
  };

  // ---- Equipment type (multi-input) handlers ----
  const handleEquipmentChange = (index: number, value: string) => {
    const next = [...formData.equipment];
    next[index] = value;
    setFormData({ ...formData, equipment: next });
    if (errors.equipment) setErrors({ ...errors, equipment: '' });
  };

  const addEquipmentField = () => {
    setFormData({ ...formData, equipment: [...formData.equipment, ''] });
  };

  const removeEquipmentField = (index: number) => {
    const next = formData.equipment.filter((_, i) => i !== index);
    setFormData({ ...formData, equipment: next.length ? next : [''] });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.employeeId) newErrors.employeeId = 'Select an employee from the list';
    if (!formData.department) newErrors.department = 'Department is required';
    if (formData.equipment.every((eq) => !eq.trim())) newErrors.equipment = 'At least one equipment type is required';
    if (!formData.assignedDate) newErrors.assignedDate = 'Assigned date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const cleanedEquipment = formData.equipment.map((eq) => eq.trim()).filter(Boolean);

      const res = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: Number(formData.employeeId),
          department: formData.department,
          equipment: cleanedEquipment,
          assignedDate: formData.assignedDate,
          condition: formData.condition,
          notes: formData.notes.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.error || 'Error submitting form. Please try again.');
        return;
      }

      handleReset();
      alert('Accountability form submitted successfully!');
      setActiveTab('list');
    } catch (error) {
      alert('Could not reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      employeeId: '', employeeQuery: '', department: '', equipment: [''],
      assignedDate: '', condition: 'good', notes: '',
    });
    setErrors({});
    setEmployeeResults([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${AMBER}14`, color: AMBER }}>
          <Clipboard size={18} />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: INK }}>Equipment Assignment</h2>
          <p className="text-sm" style={{ color: MUTED }}>
            {activeTab === 'new' ? 'Fill in the equipment assignment details' : 'All equipment currently assigned'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex items-center gap-1" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <button
          type="button"
          onClick={() => setActiveTab('new')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors"
          style={{
            color: activeTab === 'new' ? AMBER : MUTED,
            borderBottom: activeTab === 'new' ? `2px solid ${AMBER}` : '2px solid transparent',
          }}
        >
          <FilePlus size={15} />
          New Assignment
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors"
          style={{
            color: activeTab === 'list' ? AMBER : MUTED,
            borderBottom: activeTab === 'list' ? `2px solid ${AMBER}` : '2px solid transparent',
          }}
        >
          <List size={15} />
          All Assignments
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="p-6">
          <AssignmentsList />
        </div>
      ) : (
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Employee search/select */}
              <div className="space-y-2 relative">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: INK }}>
                  <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${AMBER}14`, color: AMBER }}>
                    <User size={13} />
                  </span>
                  Employee
                  <span style={{ color: CRIMSON }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.employeeQuery}
                    onChange={handleEmployeeQueryChange}
                    onFocus={(e) => { setShowEmployeeDropdown(true); e.currentTarget.style.borderColor = AMBER; }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.employeeId ? CRIMSON : HAIRLINE;
                      setTimeout(() => setShowEmployeeDropdown(false), 150);
                    }}
                    placeholder="Search employee by name or ID"
                    className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                    style={{
                      border: `1px solid ${errors.employeeId ? CRIMSON : HAIRLINE}`,
                      background: errors.employeeId ? `${CRIMSON}08` : '#fff',
                      color: INK,
                    }}
                  />
                  {isSearchingEmployees && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: MUTED }} />
                  )}

                  {showEmployeeDropdown && employeeResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 rounded-lg bg-white shadow-lg overflow-hidden" style={{ border: `1px solid ${HAIRLINE}` }}>
                      {employeeResults.map((emp) => (
                        <button
                          type="button"
                          key={emp.id}
                          onMouseDown={() => selectEmployee(emp)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between"
                          style={{ color: INK }}
                        >
                          <span>{emp.name}</span>
                          <span style={{ color: MUTED }} className="text-xs">{emp.employeeId}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.employeeId && (
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: CRIMSON }}>
                    <AlertCircle size={14} />
                    {errors.employeeId}
                  </div>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: INK }}>
                  <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${AMBER}14`, color: AMBER }}>
                    <Building size={13} />
                  </span>
                  Department
                  <span style={{ color: CRIMSON }}>*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter department"
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{
                    border: `1px solid ${errors.department ? CRIMSON : HAIRLINE}`,
                    background: errors.department ? `${CRIMSON}08` : '#fff',
                    color: INK,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = AMBER)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.department ? CRIMSON : HAIRLINE)}
                />
                {errors.department && (
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: CRIMSON }}>
                    <AlertCircle size={14} />
                    {errors.department}
                  </div>
                )}
              </div>

              {/* Equipment type - supports multiple entries */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: INK }}>
                  <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${AMBER}14`, color: AMBER }}>
                    <Monitor size={13} />
                  </span>
                  Equipment Type
                  <span style={{ color: CRIMSON }}>*</span>
                </label>
                <div className="space-y-2">
                  {formData.equipment.map((eq, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={eq}
                        onChange={(e) => handleEquipmentChange(index, e.target.value)}
                        placeholder="Enter equipment type"
                        className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                        style={{
                          border: `1px solid ${errors.equipment ? CRIMSON : HAIRLINE}`,
                          background: errors.equipment ? `${CRIMSON}08` : '#fff',
                          color: INK,
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = AMBER)}
                        onBlur={(e) => (e.currentTarget.style.borderColor = errors.equipment ? CRIMSON : HAIRLINE)}
                      />
                      {formData.equipment.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEquipmentField(index)}
                          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-colors"
                          style={{ border: `1px solid ${HAIRLINE}`, color: MUTED }}
                          aria-label="Remove equipment type"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEquipmentField}
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                    style={{ color: AMBER }}
                  >
                    <Plus size={14} />
                    Add another equipment type
                  </button>
                </div>
                {errors.equipment && (
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: CRIMSON }}>
                    <AlertCircle size={14} />
                    {errors.equipment}
                  </div>
                )}
              </div>

              {/* Assigned date */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: INK }}>
                  <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${AMBER}14`, color: AMBER }}>
                    <Calendar size={13} />
                  </span>
                  Assigned Date
                  <span style={{ color: CRIMSON }}>*</span>
                </label>
                <input
                  type="date"
                  name="assignedDate"
                  value={formData.assignedDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{
                    border: `1px solid ${errors.assignedDate ? CRIMSON : HAIRLINE}`,
                    background: errors.assignedDate ? `${CRIMSON}08` : '#fff',
                    color: INK,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = AMBER)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.assignedDate ? CRIMSON : HAIRLINE)}
                />
                {errors.assignedDate && (
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: CRIMSON }}>
                    <AlertCircle size={14} />
                    {errors.assignedDate}
                  </div>
                )}
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: INK }}>
                  <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${AMBER}14`, color: AMBER }}>
                    <Clipboard size={13} />
                  </span>
                  Condition
                </label>
                <div className="relative">
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none appearance-none bg-white transition-colors"
                    style={{ border: `1px solid ${HAIRLINE}`, color: INK }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = AMBER)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
                  >
                    {['excellent', 'good', 'fair', 'poor'].map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span
                      className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-sm"
                      style={{
                        color: CONDITION_COLORS[formData.condition] || MUTED,
                        border: `1px solid ${CONDITION_COLORS[formData.condition] || MUTED}`,
                      }}
                    >
                      {formData.condition}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
              <label className="flex items-center gap-2 text-sm font-medium mb-3" style={{ color: INK }}>
                <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${AMBER}14`, color: AMBER }}>
                  <Clipboard size={13} />
                </span>
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors resize-none"
                style={{ border: `1px solid ${HAIRLINE}`, color: INK }}
                onFocus={(e) => (e.currentTarget.style.borderColor = AMBER)}
                onBlur={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
                placeholder="Enter any additional notes or comments..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                style={{ background: INK, color: '#fff', fontWeight: 500 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Submit Assignment
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                style={{ border: `1px solid ${HAIRLINE}`, color: INK }}
              >
                <X size={18} />
                Clear Form
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AccountabilityForm;