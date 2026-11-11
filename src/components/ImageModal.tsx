import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Kural } from '../types/kural';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  kural: Kural | null;
  isDark: boolean;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  kural,
  isDark,
}) => {
  if (!isOpen || !kural || !kural.media?.imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark 
            ? 'bg-[#181614] border-[#38322A] text-[#EDE8DF]' 
            : 'bg-[#FFFDF9] border-[#E5DFD3] text-[#24211D]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between border-b ${
          isDark ? 'border-[#2E2821] bg-[#211D18]' : 'border-[#ECE4D6] bg-[#F7F2E9]'
        }`}>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#2563EB]" />
            <div className="text-xs font-semibold">
              <span>குறள் {kural.number}</span>
              <span className="mx-1.5 opacity-50">·</span>
              <span>{kural.athikaramTamil}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isDark 
                ? 'text-[#A89F91] hover:bg-[#2F2922] hover:text-white' 
                : 'text-[#6C6356] hover:bg-[#EAE2D3] hover:text-black'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div className="bg-black/95 flex items-center justify-center max-h-[70vh] p-2">
          <img
            src={kural.media.imageUrl}
            alt={kural.media.imageCaption || `Thirukkural ${kural.number}`}
            referrerPolicy="no-referrer"
            className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
          />
        </div>

        {/* Caption & Kural */}
        <div className="p-4 sm:p-5">
          {kural.media.imageCaption && (
            <p className="text-sm font-medium text-[#9A3412] dark:text-[#E0A96D] mb-2">
              {kural.media.imageCaption}
            </p>
          )}
          <p className="text-base font-tamil-serif font-semibold text-stone-900 dark:text-stone-100">
            {kural.line1}
          </p>
          <p className="text-base font-tamil-serif font-semibold text-stone-900 dark:text-stone-100">
            {kural.line2}
          </p>
        </div>
      </div>
    </div>
  );
};
