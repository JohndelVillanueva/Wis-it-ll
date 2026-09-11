import { useState } from 'react';
import type { Parent } from '../../pages/RFID/RFIDTapPage';
import UserAvatar from '../UserAvatar';

interface Props {
  parents: Parent[];
  onConfirm: (parent: Parent) => void;
}

const GuardianSelectScreen = ({ parents, onConfirm }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = parents.find((p) => p.id === selectedId) || null;

  return (
    <div className="w-full max-w-3xl mx-auto text-center select-none">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
          Who is visiting?
        </h1>
        <p className="text-lg text-slate-400">
          Please select your name and confirm
        </p>
      </div>

      {/* GUARDIAN LIST */}
      <div className="space-y-4 mb-10">
        {parents.map((parent) => {
          const isSelected = selectedId === parent.id;

          return (
            <button
              key={parent.id}
              type="button"
              onClick={() => setSelectedId(parent.id)}
              className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl text-left transition-all border-2 ${
                isSelected
                  ? 'bg-blue-500/20 border-blue-400 shadow-2xl shadow-blue-500/30 scale-[1.02]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              {/* Checkbox */}
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 flex-shrink-0 ${
                  isSelected
                    ? 'bg-blue-500 border-blue-400'
                    : 'bg-transparent border-slate-600'
                }`}
              >
                {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>

              {/* Photo — replaces the plain <img> */}
              <UserAvatar
                photo={parent.photo}
                name={`${parent.fname} ${parent.lname}`}
                size={64}
                borderColor="rgba(255,255,255,0.2)"
              />

              {/* Name */}
              <div className="flex-1">
                <p className="text-xl font-bold text-white">
                  {parent.fname} {parent.lname}
                </p>
                {parent.mname && (
                  <p className="text-sm text-slate-400 mt-0.5">{parent.mname}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* CONFIRM BUTTON */}
      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && onConfirm(selected)}
        className={`px-12 py-5 rounded-2xl text-lg font-bold transition-all ${
          selected
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/40 hover:scale-105'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        Confirm
      </button>

      {!selected && (
        <p className="text-sm text-slate-500 mt-4">
          Please select your name above
        </p>
      )}
    </div>
  );
};

export default GuardianSelectScreen;