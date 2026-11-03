import React from 'react';
import { SentenceItem } from '../types.ts';
import { Volume2 } from 'lucide-react';
import { speakText } from '../utils/speech.ts';

interface TranslationOverlayProps {
  items: SentenceItem[];
  selectedId: number | null;
  onSelectSentence: (id: number) => void;
  langCode: string;
}

export const TranslationOverlay: React.FC<TranslationOverlayProps> = ({
  items,
  selectedId,
  onSelectSentence,
  langCode,
}) => {
  // Filter items with valid coordinates
  const itemsWithBoxes = items.filter(
    (item) => item.box2d && item.box2d.length === 4 && (item.box2d[2] > item.box2d[0])
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {itemsWithBoxes.map((item) => {
        const [ymin, xmin, ymax, xmax] = item.box2d!;
        const top = Math.max(0, Math.min(95, (ymin / 1000) * 100));
        const left = Math.max(0, Math.min(95, (xmin / 1000) * 100));
        const width = Math.max(8, Math.min(100 - left, ((xmax - xmin) / 1000) * 100));
        const height = Math.max(5, Math.min(100 - top, ((ymax - ymin) / 1000) * 100));

        const isSelected = selectedId === item.id;

        return (
          <div
            key={item.id}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${Math.max(width, 18)}%`,
              minHeight: '28px',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectSentence(item.id);
            }}
            className={`absolute pointer-events-auto cursor-pointer transition-all duration-200 z-20 group ${
              isSelected ? 'scale-105 z-30' : 'hover:scale-102'
            }`}
          >
            {/* Highlight bounding frame */}
            <div
              className={`absolute inset-0 rounded-lg border-2 transition-colors duration-200 ${
                isSelected
                  ? 'border-emerald-400 bg-emerald-500/25 shadow-lg shadow-emerald-500/30'
                  : 'border-cyan-400/80 bg-slate-900/60 hover:border-cyan-300 hover:bg-slate-900/80 backdrop-blur-sm shadow-md'
              }`}
            />

            {/* Translation Content Pill */}
            <div className="relative p-1.5 flex items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-1 min-w-0">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-cyan-500/80 text-white flex items-center justify-center text-[10px] font-bold">
                  {item.id}
                </span>
                <span className="font-semibold text-white truncate drop-shadow text-[11px] sm:text-xs">
                  {item.koreanTranslation}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(item.koreanTranslation, 'ko');
                }}
                className="flex-shrink-0 p-0.5 rounded bg-black/40 text-cyan-200 hover:text-white hover:bg-cyan-600 transition"
                title="한국어 발음 듣기"
              >
                <Volume2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
