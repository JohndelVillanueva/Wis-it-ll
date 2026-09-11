import type { TapResponse, Parent } from '../../pages/RFID/RFIDTapPage';
import UserAvatar from '../UserAvatar';

interface Props {
  data: TapResponse;
  selectedParent: Parent | null;
}

const ChildrenGrid = ({ data, selectedParent }: Props) => {
  const { parents, allChildren } = data;

  const guardiansToShow = parents;
  const highlightedId = selectedParent?.id ?? null;
  const childrenToShow = allChildren;

  const count = childrenToShow.length;

  // ─── Decide split layout: only when 5+ children ───
  const useSplitLayout = count >= 5;

  // ─── Split children into left and right halves ───
  const midPoint = Math.ceil(count / 2);
  const leftChildren = childrenToShow.slice(0, midPoint);
  const rightChildren = childrenToShow.slice(midPoint);

  // ─── Compact sizing ───
  const isCompact = count >= 6;
  const avatarSize = isCompact ? 110 : 130;

  return (
    <div className="w-full max-w-[1600px] mx-auto text-center px-4">

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── GUARDIANS (always at top, centered) ─── */}
      {/* ═══════════════════════════════════════════════ */}
      {guardiansToShow.length > 0 && (
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-4">
            {guardiansToShow.length === 1 ? 'Guardian' : 'Guardians'}
          </p>

          <div className="flex justify-center gap-4 sm:gap-6 flex-wrap">
            {guardiansToShow.map((parent) => {
              const isConfirmed = parent.id === highlightedId;
              return (
                <div
                  key={parent.id}
                  className={`bg-white/5 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border-2 shadow-xl
                              transition-transform hover:scale-105 w-36 sm:w-44
                              flex flex-col items-center ${
                    isConfirmed
                      ? 'border-blue-400 shadow-blue-500/30'
                      : 'border-white/10'
                  }`}
                >
                  <UserAvatar
                    photo={parent.photo}
                    name={`${parent.fname} ${parent.lname}`}
                    size={isCompact ? 64 : 80}
                    borderColor={isConfirmed ? '#60A5FA' : 'rgba(255,255,255,0.2)'}
                  />
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight mt-3">
                    {parent.fname} {parent.lname}
                  </h3>
                  {parent.mname && (
                    <p className="text-xs text-slate-400 mt-0.5">{parent.mname}</p>
                  )}
                  {isConfirmed && (
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-blue-400">
                      Confirmed
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── CHILDREN ─── */}
      {/* ═══════════════════════════════════════════════ */}
      {count === 0 ? (
        <div className="text-slate-400 text-xl py-10">
          No students linked to this card
        </div>
      ) : useSplitLayout ? (
        /* ─── SPLIT LAYOUT (5+ children) ─── */
        <div className="grid grid-cols-2 gap-6 sm:gap-10">
          {/* LEFT half */}
          <div className="flex flex-wrap justify-center items-start gap-4 sm:gap-5">
            {leftChildren.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                avatarSize={avatarSize}
                isCompact={isCompact}
              />
            ))}
          </div>

          {/* RIGHT half */}
          <div className="flex flex-wrap justify-center items-start gap-4 sm:gap-5">
            {rightChildren.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                avatarSize={avatarSize}
                isCompact={isCompact}
              />
            ))}
          </div>
        </div>
      ) : (
        /* ─── CENTERED GRID (1-4 children) ─── */
        <div
          className={`grid gap-6 justify-items-center ${
            count === 1
              ? 'grid-cols-1'
              : count === 2
              ? 'grid-cols-2'
              : count === 3
              ? 'grid-cols-3'
              : 'grid-cols-4'
          }`}
        >
          {childrenToShow.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              avatarSize={160}
              isCompact={false}
            />
          ))}
        </div>
      )}

      <p className="text-sm text-slate-500 mt-10">
        Screen will reset in a few seconds…
      </p>
    </div>
  );
};

/* ═══════════════════════════════════════════════ */
/* ─── Reusable Child Card ─── */
/* ═══════════════════════════════════════════════ */
function ChildCard({
  child,
  avatarSize,
  isCompact,
}: {
  child: any;
  avatarSize: number;
  isCompact: boolean;
}) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10
                  shadow-2xl transition-transform hover:scale-105 ${
        isCompact ? 'p-4 w-[180px]' : 'p-6 w-full max-w-xs'
      }`}
    >
      <div className="relative mb-3 flex justify-center">
        <UserAvatar
          photo={child.photo}
          name={`${child.fname} ${child.lname}`}
          size={avatarSize}
          borderColor="#60A5FA"
        />
        <div
          className={`absolute bottom-1 rounded-full bg-green-500 border-2 border-white shadow-lg ${
            isCompact ? 'right-4 w-5 h-5' : 'right-1/2 translate-x-20 w-6 h-6'
          }`}
        />
      </div>

      <h2
        className={`font-bold text-white leading-tight ${
          isCompact ? 'text-base' : 'text-2xl'
        }`}
      >
        {child.fname}
      </h2>
      <h3
        className={`text-slate-300 mb-2 ${isCompact ? 'text-xs' : 'text-lg'}`}
      >
        {child.lname}
      </h3>

      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {child.grade && (
          <span
            className={`rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 ${
              isCompact ? 'text-[10px] px-2 py-0.5' : 'text-sm px-3 py-1'
            }`}
          >
            {child.grade}
          </span>
        )}
        {child.section && (
          <span
            className={`rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 ${
              isCompact ? 'text-[10px] px-2 py-0.5' : 'text-sm px-3 py-1'
            }`}
          >
            {child.section}
          </span>
        )}
      </div>
    </div>
  );
}

export default ChildrenGrid;