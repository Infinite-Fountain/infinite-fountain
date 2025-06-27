'use client';

interface TranscriptButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  size?: 'normal' | 'large';
}

export default function TranscriptButton({ isOpen, onToggle, size = 'normal' }: TranscriptButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all ${
        size === 'large' ? 'text-[36px] p-[18px]' : 'text-[24px] p-[12px]'
      }`}
      aria-label={isOpen ? 'Close transcript' : 'Open transcript'}
    >
      {isOpen ? '📄' : '🫥'}
    </button>
  );
} 