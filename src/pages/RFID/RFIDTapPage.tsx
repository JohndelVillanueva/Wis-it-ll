import { useState, useEffect, useRef } from 'react';
import IdleScreen from '../../components/rfid/IdleScreen';
import LoadingScreen from '../../components/rfid/LoadingScreen';
import ErrorScreen from '../../components/rfid/ErrorScreen';
import GuardianSelectScreen from '../../components/rfid/GuardianSelectScreen';
import ChildrenGrid from '../../components/rfid/ChildrenGrid';

const API_URL = import.meta.env.VITE_API_URL || 'http://10.128.2.112:3000';

export interface Child {
  id: number;
  fname: string;
  mname: string;
  lname: string;
  grade: string;
  section: string;
  photo: string;
  relation?: string;
}

export interface Parent {
  id: number;
  fname: string;
  mname: string;
  lname: string;
  photo: string;
  children: Child[];
}

export interface TapResponse {
  success: boolean;
  parents: Parent[];
  allChildren: Child[];
  parentCount: number;
  error?: string;
}

const RESET_AFTER_MS = 12000;

const RFIDTapPage = () => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'select' | 'success' | 'error'
  >('idle');
  const [data, setData] = useState<TapResponse | null>(null);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastTap, setLastTap] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef<string>('');

  // Focus the hidden input so the scanner can type into it
  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    focus();
    const interval = setInterval(focus, 800);
    return () => clearInterval(interval);
  }, []);

  // Auto-reset
  useEffect(() => {
    if (status === 'success' || status === 'error' || status === 'select') {
      const timer = setTimeout(() => {
        setStatus('idle');
        setData(null);
        setSelectedParent(null);
        setErrorMessage('');
      }, RESET_AFTER_MS);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // ─── Helper: log a pickup ───
  function logPickup(parent: Parent) {
    fetch(`${API_URL}/api/pickup_log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentId: parent.id,
        childIds: parent.children.map((c) => c.id),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) console.warn('[pickup_log] failed:', json.error);
      })
      .catch((err) => console.error('[pickup_log] network error:', err));
  }

  async function handleTap(rfid: string) {
    if (rfid === lastTap && (status === 'success' || status === 'select')) return;

    setStatus('loading');
    setErrorMessage('');
    setSelectedParent(null);
    setLastTap(rfid);

    try {
      const res = await fetch(
        `${API_URL}/api/tap?rfid=${encodeURIComponent(rfid)}`
      );

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setStatus('error');
        setErrorMessage(`Server error ${res.status}`);
        return;
      }

      const json: TapResponse = await res.json();

      if (!res.ok || !json.success) {
        setStatus('error');
        setErrorMessage(json.error || 'Card not recognized');
        return;
      }

      setData(json);

      if (json.parents.length > 1) {
        // Multiple guardians → ask who is visiting
        setStatus('select');
      } else if (json.parents.length === 1) {
        // Single guardian → skip select, log directly
        const soloParent = json.parents[0];
        setSelectedParent(soloParent);
        setStatus('success');
        logPickup(soloParent);
      } else {
        // No guardian matched
        setStatus('success');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Connection error. Please try again.');
    }
  }

  function handleGuardianConfirm(parent: Parent) {
    setSelectedParent(parent);
    setStatus('success');
    logPickup(parent);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const rfid = bufferRef.current.trim();
      bufferRef.current = '';
      (e.target as HTMLInputElement).value = '';
      if (rfid) handleTap(rfid);
    } else if (e.key.length === 1) {
      bufferRef.current += e.key;
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <input
        ref={inputRef}
        onKeyDown={onKeyDown}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        autoFocus
        aria-hidden="true"
      />

      <div className="relative z-10 w-full h-full flex items-center justify-center px-8">
        {status === 'idle' && <IdleScreen />}
        {status === 'loading' && <LoadingScreen />}
        {status === 'error' && <ErrorScreen message={errorMessage} />}

        {status === 'select' && data && (
          <GuardianSelectScreen
            parents={data.parents}
            onConfirm={handleGuardianConfirm}
          />
        )}

        {status === 'success' && data && (
          <ChildrenGrid data={data} selectedParent={selectedParent} />
        )}
      </div>

      {lastTap && (
        <div className="absolute bottom-4 left-4 text-xs text-slate-600 font-mono pointer-events-none">
          Last tap: {lastTap}
        </div>
      )}
    </div>
  );
};

export default RFIDTapPage;