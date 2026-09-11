import { Search, X, Filter } from 'lucide-react';

const INK = '#1B2130';
const PAPER_LINE = '#DDDFD5';
const MUTED = '#6B7280';

const fieldStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${PAPER_LINE}`,
  color: INK,
};

interface Props {
  fromDate: string;
  toDate: string;
  search: string;
  onFromDateChange: (v: string) => void;
  onToDateChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function LogFilters({
  fromDate, toDate, search,
  onFromDateChange, onToDateChange, onSearchChange,
  onApply, onClear,
}: Props) {
  const hasFilters = fromDate || toDate || search;

  return (
    <div
      className="rounded-sm px-6 py-5 mb-4"
      style={{ border: `1px solid ${PAPER_LINE}`, background: '#fff' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Filter size={14} style={{ color: MUTED }} />
        <span
          className="text-[11px] tracking-[0.14em] uppercase"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}
        >
          Filters
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* From */}
        <div>
          <label className="text-[10px] tracking-[0.14em] uppercase block mb-1.5"
                 style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="w-full py-2 text-sm focus:outline-none"
            style={fieldStyle}
          />
        </div>

        {/* To */}
        <div>
          <label className="text-[10px] tracking-[0.14em] uppercase block mb-1.5"
                 style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="w-full py-2 text-sm focus:outline-none"
            style={fieldStyle}
          />
        </div>

        {/* Search */}
        <div className="lg:col-span-2">
          <label className="text-[10px] tracking-[0.14em] uppercase block mb-1.5"
                 style={{ fontFamily: "'IBM Plex Mono', monospace", color: MUTED }}>
            Search guardian name / email
          </label>
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2" style={{ color: MUTED }} size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onApply(); }}
              placeholder="Type to search…"
              className="w-full pl-6 py-2 text-sm focus:outline-none"
              style={fieldStyle}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={onApply}
          className="px-5 py-2 rounded-sm text-sm"
          style={{ background: INK, color: '#fff', fontWeight: 500 }}
        >
          Apply Filters
        </button>

        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm"
            style={{ border: `1px solid ${PAPER_LINE}`, color: MUTED }}
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}