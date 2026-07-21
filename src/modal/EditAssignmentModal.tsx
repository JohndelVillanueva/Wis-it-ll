// EditAssignmentModal.tsx
import { useState, useEffect, useRef } from 'react';
import { X, User, Building, Monitor, Calendar, Clipboard, AlertCircle, Loader2, Plus, Save } from 'lucide-react';

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

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onUpdate: (updatedAssignment: Assignment) => void;
  API_BASE: string;
}

const EditAssignmentModal = ({ 
  isOpen, 
  onClose, 
  assignment, 
  onUpdate,
  API_BASE 
}: EditAssignmentModalProps) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeQuery: '',
    department: '',
    equipment: [''] as string[],
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

  // Initialize form with assignment data when it changes
  useEffect(() => {
    if (assignment) {
      setFormData({
        employeeId: String(assignment.employeeId),
        employeeQuery: assignment.employeeName || '',
        department: assignment.department,
        equipment: assignment.equipment.length > 0 ? assignment.equipment : [''],
        assignedDate: assignment.assignedDate,
        condition: assignment.condition,
        notes: assignment.notes || '',
      });
    }
  }, [assignment]);

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
  }, [formData.employeeQuery, formData.employeeId, API_BASE]);

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
    setFormData({ 
      ...formData, 
      employeeId: String(employee.id), 
      employeeQuery: `${employee.name} (${employee.employeeId})` 
    });
    setShowEmployeeDropdown(false);
    setEmployeeResults([]);
  };

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
    if (!validateForm() || !assignment) return;

    setIsSubmitting(true);
    try {
      const cleanedEquipment = formData.equipment.map((eq) => eq.trim()).filter(Boolean);

      const res = await fetch(`${API_BASE}/assignments/${assignment.id}`, {
        method: 'PUT',
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
        alert(json.error || 'Error updating assignment. Please try again.');
        return;
      }

      // Update the assignment in the parent component
      onUpdate({
        ...assignment,
        employeeId: Number(formData.employeeId),
        employeeName: formData.employeeQuery,
        department: formData.department,
        equipment: cleanedEquipment,
        assignedDate: formData.assignedDate,
        condition: formData.condition,
        notes: formData.notes.trim(),
      });

      onClose();
    } catch (error) {
      alert('Could not reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: HAIRLINE }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${AMBER}14`, color: AMBER }}>
              <Clipboard size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: INK }}>Edit Assignment</h2>
              <p className="text-sm" style={{ color: MUTED }}>Update equipment assignment details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            style={{ color: MUTED }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
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

            {/* Buttons */}
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Update Assignment
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                style={{ border: `1px solid ${HAIRLINE}`, color: INK }}
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAssignmentModal;