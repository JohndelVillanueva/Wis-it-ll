import { useState, useEffect, useRef } from 'react';
import {
  UserPlus, XCircle, Save, Upload, Image as ImageIcon, X,
  GraduationCap, Search, Check, ChevronLeft, ChevronRight,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://10.128.2.112:3000';

const INK = '#1B2130';
const PAPER = '#F2F3EE';
const PAPER_LINE = '#DDDFD5';
const BRASS = '#B08A3E';
const MUTED = '#6B7280';

const fieldStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${PAPER_LINE}`,
  color: INK,
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
`;

type FormData = {
  fname: string;
  mname: string;
  lname: string;
  gender: string;
  email: string;
  mobile: string;
  rfid: string;
  photo: string;
  username: string;
  password: string;
};

type Student = {
  id: number;
  fname: string;
  mname: string;
  lname: string;
  grade: string;
  section: string;
  photo: string;
};

const initialForm: FormData = {
  fname: '',
  mname: '',
  lname: '',
  gender: '',
  email: '',
  mobile: '',
  rfid: '',
  photo: '',
  username: '',
  password: '',
};

const CreateParentPage = () => {
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ─── Photo ───
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Students ───
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [relation, setRelation] = useState('father');
  const [canPickup, setCanPickup] = useState(true);

  // ─── Load students on mount ───
  useEffect(() => {
    (async () => {
      try {
        setLoadingStudents(true);
        const res = await fetch(`${API_URL}/api/users?type=Student`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Student[] = await res.json();
        setStudents(data);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoadingStudents(false);
      }
    })();
  }, []);

  // ─── Auto-clear success ───
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 6000);
      return () => clearTimeout(t);
    }
  }, [success]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large (max 5 MB).');
      return;
    }

    setPhotoFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setForm((prev) => ({ ...prev, photo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function uploadPhoto(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: fd,
    });

    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      throw new Error(`Upload endpoint not found (${res.status})`);
    }

    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed');
    return json.url;
  }

  // ─── Student picker helpers ───
  const filteredStudents = students.filter((s) => {
    const term = studentSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      s.fname.toLowerCase().includes(term) ||
      s.lname.toLowerCase().includes(term) ||
      `${s.fname} ${s.mname} ${s.lname}`.toLowerCase().includes(term) ||
      (s.grade || '').toLowerCase().includes(term) ||
      (s.section || '').toLowerCase().includes(term)
    );
  });

  function toggleStudent(id: number) {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const selectedStudents = students.filter((s) =>
    selectedStudentIds.includes(s.id)
  );

  // ─── Step 1 → Step 2 ───
  function goNext() {
    setError(null);

    if (!form.fname.trim()) { setError('First name is required.'); return; }
    if (!form.lname.trim()) { setError('Last name is required.'); return; }
    if (!form.rfid.trim())  { setError('RFID is required.'); return; }

    setStep(2);
  }

  function goBack() {
    setError(null);
    setStep(1);
  }

  function handleReset() {
    setForm(initialForm);
    handleRemovePhoto();
    setSelectedStudentIds([]);
    setStudentSearch('');
    setRelation('father');
    setCanPickup(true);
    setStep(1);
    setError(null);
    setSuccess(null);
  }

  // ─── Final submit (from step 2) ───
  async function handleCreate() {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // 1. Upload photo if provided
      let photoUrl = form.photo;
      if (photoFile) {
        setIsUploading(true);
        try { photoUrl = await uploadPhoto(photoFile); }
        finally { setIsUploading(false); }
      }

      // 2. Create parent
      const createRes = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          photo: photoUrl,
          type: 'Parent',
          rfid: form.rfid.trim(),
        }),
      });

      const ct = createRes.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        setError(`Create failed (${createRes.status})`);
        return;
      }

      const createJson = await createRes.json();
      if (!createRes.ok || !createJson.success) {
        setError(createJson.error || 'Failed to create parent.');
        return;
      }

      const newParentId = createJson.data?.id;
      if (!newParentId) {
        setError('Parent created but no ID returned.');
        return;
      }

      // 3. Link students (if any selected)
      if (selectedStudentIds.length > 0) {
        const linkRes = await fetch(`${API_URL}/api/parent_student`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentId: newParentId,
            studentIds: selectedStudentIds,
            relation,
            canPickup,
          }),
        });

        const linkJson = await linkRes.json();
        if (!linkRes.ok || !linkJson.success) {
          setError(
            `Parent created, but linking failed: ${linkJson.error || 'Unknown error'}`
          );
          return;
        }
      }

      // Success
      const count = selectedStudentIds.length;
      setSuccess(
        `Parent "${form.fname} ${form.lname}" created successfully${
          count > 0 ? ` with ${count} student${count === 1 ? '' : 's'} linked` : ''
        }!`
      );

      handleReset();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ background: PAPER, fontFamily: "'Inter', sans-serif" }} className="p-6 sm:p-8 min-h-full">
      <style>{FONTS}</style>

      {/* ALERTS */}
      {success && (
        <div className="mb-4 px-5 py-3 flex items-center justify-between rounded-sm max-w-4xl mx-auto"
             style={{ background: '#fff', borderLeft: `3px solid #5C6B2F`, border: `1px solid ${PAPER_LINE}` }}>
          <span className="text-sm" style={{ color: INK }}>{success}</span>
          <button onClick={() => setSuccess(null)} style={{ color: MUTED }}><XCircle size={16} /></button>
        </div>
      )}
      {error && (
        <div className="mb-4 px-5 py-3 flex items-center justify-between rounded-sm max-w-4xl mx-auto"
             style={{ background: '#fff', borderLeft: `3px solid #B3324B`, border: `1px solid ${PAPER_LINE}` }}>
          <span className="text-sm" style={{ color: INK }}>{error}</span>
          <button onClick={() => setError(null)} style={{ color: MUTED }}><XCircle size={16} /></button>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${PAPER_LINE}`, background: '#fff' }}>

          {/* HEADER */}
          <div className="px-6 py-5" style={{ borderBottom: `2px solid ${INK}` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <UserPlus className="text-white" size={20} />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: INK }}>
                  Create New Parent
                </h1>
                <p className="text-xs mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                  {step === 1 ? 'Step 1 of 2 — Parent Information' : 'Step 2 of 2 — Link Students'}
                </p>
              </div>
            </div>
          </div>

          {/* STEP INDICATOR */}
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${PAPER_LINE}`, background: '#FAFAF7' }}>
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: step >= 1 ? INK : '#E5E7EB',
                  color: step >= 1 ? '#fff' : MUTED,
                }}
              >
                1
              </div>
              <span className="text-sm font-medium" style={{ color: step >= 1 ? INK : MUTED }}>
                Parent Info
              </span>
            </div>

            {/* Connector */}
            <div className="flex-1 h-[2px] mx-2" style={{ background: step >= 2 ? INK : PAPER_LINE }} />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: step >= 2 ? INK : '#E5E7EB',
                  color: step >= 2 ? '#fff' : MUTED,
                }}
              >
                2
              </div>
              <span className="text-sm font-medium" style={{ color: step >= 2 ? INK : MUTED }}>
                Link Students
              </span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* ─── STEP 1: PARENT INFO ─── */}
          {/* ═══════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* PHOTO */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover border-4"
                        style={{ borderColor: BRASS }}
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600
                                   flex items-center justify-center text-white shadow-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full flex items-center justify-center"
                         style={{ background: '#F2F3EE', border: `2px dashed ${PAPER_LINE}` }}>
                      <ImageIcon size={36} style={{ color: MUTED }} />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    Parent Photo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm"
                    style={{ border: `1px solid ${INK}`, color: INK }}
                  >
                    <Upload size={16} />
                    {photoFile ? 'Change Photo' : 'Choose Photo'}
                  </button>
                  <p className="text-[10px] mt-2" style={{ color: MUTED }}>
                    JPG, PNG, or WEBP · Max 5 MB
                  </p>
                </div>
              </div>

              {/* NAME ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={form.fname}
                    onChange={(e) => update('fname', e.target.value)}
                    className="w-full py-2 text-sm focus:outline-none"
                    style={fieldStyle}
                    placeholder="e.g. Maria"
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={form.mname}
                    onChange={(e) => update('mname', e.target.value)}
                    className="w-full py-2 text-sm focus:outline-none"
                    style={fieldStyle}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={form.lname}
                    onChange={(e) => update('lname', e.target.value)}
                    className="w-full py-2 text-sm focus:outline-none"
                    style={fieldStyle}
                    placeholder="e.g. Santos"
                  />
                </div>
              </div>

              {/* GENDER + RFID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => update('gender', e.target.value)}
                    className="w-full py-2 text-sm focus:outline-none appearance-none"
                    style={fieldStyle}
                  >
                    <option value="">-- Select --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    RFID *
                  </label>
                  <input
                    type="text"
                    value={form.rfid}
                    onChange={(e) => update('rfid', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    autoFocus
                    className="w-full py-2 text-sm focus:outline-none"
                    style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono', monospace" }}
                    placeholder="Tap card or type number"
                  />
                  <p className="text-[10px] mt-1" style={{ color: MUTED }}>
                    Tap the card on the scanner — it will fill this field
                  </p>
                </div>
              </div>

              {/* CONTACT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full py-2 text-sm focus:outline-none"
                    style={fieldStyle}
                    placeholder="parent@email.com"
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    Mobile
                  </label>
                  <input
                    type="text"
                    value={form.mobile}
                    onChange={(e) => update('mobile', e.target.value)}
                    className="w-full py-2 text-sm focus:outline-none"
                    style={fieldStyle}
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>

              {/* ACCOUNT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => update('username', e.target.value)}
                    className="w-full py-2 text-sm focus:outline-none"
                    style={fieldStyle}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className="w-full py-2 text-sm focus:outline-none"
                    style={fieldStyle}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* ─── STEP 2: LINK STUDENTS ─── */}
          {/* ═══════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="p-6 sm:p-8 space-y-6">

              {/* Summary banner */}
              <div className="rounded-sm p-4" style={{ background: '#F7F8F4', border: `1px solid ${PAPER_LINE}` }}>
                <div className="flex items-center gap-3">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover"
                      style={{ border: `2px solid ${BRASS}` }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                         style={{ background: '#E5E7EB' }}>
                      <ImageIcon size={20} style={{ color: MUTED }} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold" style={{ color: INK }}>
                      {form.fname} {form.mname} {form.lname}
                    </p>
                    <p className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                      RFID: {form.rfid} {form.email ? `· ${form.email}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Relation + Pickup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    Relation to Students
                  </label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full py-2 text-sm focus:outline-none appearance-none"
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
                  <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                         style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                    Pickup Authorization
                  </label>
                  <label className="flex items-center gap-2 py-2 text-sm" style={{ color: INK }}>
                    <input
                      type="checkbox"
                      checked={canPickup}
                      onChange={(e) => setCanPickup(e.target.checked)}
                    />
                    Allowed to pick up
                  </label>
                </div>
              </div>

              {/* Student dropdown */}
              <div>
                <label className="text-[11px] tracking-[0.14em] uppercase block mb-2"
                       style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                  Select Students ({selectedStudentIds.length} selected)
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
                    <div className="absolute z-10 mt-1 w-full rounded-sm shadow-lg"
                         style={{ background: '#fff', border: `1px solid ${PAPER_LINE}`, maxHeight: 400 }}>
                      <div className="px-5 py-3 relative" style={{ borderBottom: `1px solid ${PAPER_LINE}` }}>
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} size={16} />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search students…"
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="w-full pl-7 pr-2 py-2 text-sm focus:outline-none"
                          style={fieldStyle}
                        />
                      </div>

                      <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
                        {loadingStudents && (
                          <p className="px-5 py-8 text-center text-sm" style={{ color: MUTED }}>
                            Loading students…
                          </p>
                        )}
                        {!loadingStudents && filteredStudents.length === 0 && (
                          <p className="px-5 py-8 text-center text-sm" style={{ color: MUTED }}>
                            {students.length === 0
                              ? 'No students found in the database.'
                              : 'No matches found.'}
                          </p>
                        )}
                        {!loadingStudents && filteredStudents.map((s) => {
                          const isSelected = selectedStudentIds.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => toggleStudent(s.id)}
                              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-left hover:bg-[#F7F8F4]"
                              style={{ borderBottom: `1px solid ${PAPER_LINE}` }}
                            >
                              <span className="w-5 h-5 flex items-center justify-center rounded-sm flex-shrink-0"
                                    style={{
                                      border: `1px solid ${isSelected ? INK : PAPER_LINE}`,
                                      background: isSelected ? INK : 'transparent',
                                    }}>
                                {isSelected && <Check size={14} style={{ color: '#fff' }} />}
                              </span>
                              <span className="flex-1" style={{ color: INK }}>
                                {s.lname}, {s.fname} {s.mname}
                              </span>
                              <span className="text-xs"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
                                {s.grade || '—'} — {s.section || '—'}
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
                        type="button"
                        onClick={() => toggleStudent(s.id)}
                        style={{ color: MUTED }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {selectedStudentIds.length === 0 && (
                <p className="text-xs text-center py-2" style={{ color: MUTED }}>
                  You can skip this step and link students later from the Parents page.
                </p>
              )}
            </div>
          )}

          {/* FOOTER */}
          <div className="px-6 py-4 flex items-center justify-between gap-3"
               style={{ borderTop: `1px solid ${PAPER_LINE}`, background: '#FAFAF7' }}>

            {/* Left side: Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="text-sm px-3 py-2 rounded-sm"
              style={{ color: MUTED }}
            >
              Reset
            </button>

            {/* Right side: Back / Next / Create */}
            <div className="flex items-center gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm disabled:opacity-40"
                  style={{ border: `1px solid ${PAPER_LINE}`, color: INK }}
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}

              {step === 1 && (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-sm text-sm"
                  style={{ background: INK, color: '#fff', fontWeight: 500 }}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isSubmitting || isUploading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-sm text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: INK, color: '#fff', fontWeight: 500 }}
                >
                  <Save size={16} />
                  {isUploading
                    ? 'Uploading photo…'
                    : isSubmitting
                    ? 'Creating…'
                    : selectedStudentIds.length > 0
                    ? `Create + Link ${selectedStudentIds.length}`
                    : 'Create Parent'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateParentPage;