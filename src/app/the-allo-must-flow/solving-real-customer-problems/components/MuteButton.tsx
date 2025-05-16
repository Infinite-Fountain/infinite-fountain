'use client';

interface MuteButtonProps {
  muted: boolean;
  onToggle: () => void;
}

export default function MuteButton({ muted, onToggle }: MuteButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="absolute top-4 right-4 z-50 text-white text-xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
      aria-label={muted ? 'Unmute narration' : 'Mute narration'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
} 