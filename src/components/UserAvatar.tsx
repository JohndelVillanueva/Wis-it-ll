import { useState } from 'react';
import { photoUrl } from '../utils/photoUrl';

interface Props {
  photo?: string | null;
  name?: string;
  size?: number;        // px, default 40
  className?: string;
  borderColor?: string;
}

/**
 * Displays a user's photo. Falls back to a colored circle with the
 * first letter of their name if the photo is missing or fails to load.
 */
export default function UserAvatar({
  photo,
  name = '',
  size = 40,
  className = '',
  borderColor,
}: Props) {
  const [failed, setFailed] = useState(false);
  const url = photoUrl(photo);
  const initial = (name.trim()[0] || '?').toUpperCase();

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    background: '#E5E7EB',
    ...(borderColor ? { border: `2px solid ${borderColor}` } : {}),
  };

  // No URL → initial circle
  if (!url || failed) {
    return (
      <div
        className={`flex items-center justify-center text-slate-500 font-bold flex-shrink-0 ${className}`}
        style={{
          ...style,
          fontSize: size * 0.4,
        }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      className={`flex-shrink-0 ${className}`}
      style={style}
      onError={() => {
        setFailed(true);         // ← prevents infinite loop
      }}
    />
  );
}