'use client';

interface MuteButtonProps {
  muted: boolean;
  onToggle: () => void;
  size?: 'normal' | 'large';
}

export default function MuteButton({ muted, onToggle, size = 'normal' }: MuteButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all ${
        size === 'large' ? 'text-[36px] p-[18px]' : 'text-[24px] p-[12px]'
      }`}
      aria-label={muted ? 'Unmute narration' : 'Mute narration'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
} 