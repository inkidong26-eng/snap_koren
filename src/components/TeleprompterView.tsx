import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  FileText,
  Mic,
  Sliders,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { SentenceItem, ScrollReadingMode } from '../types.ts';
import { speakText, cancelSpeech } from '../utils/speech.ts';

interface TeleprompterViewProps {
  items: SentenceItem[];
  langCode: string;
  readingMode: ScrollReadingMode;
  onChangeReadingMode: (mode: ScrollReadingMode) => void;
  selectedSentenceId: number | null;
  onSelectSentence: (id: number) => void;
}

export const TeleprompterView: React.FC<TeleprompterViewProps> = ({
  items,
  langCode,
  readingMode,
  onChangeReadingMode,
  selectedSentenceId,
  onSelectSentence,
}) => {
  // Active sentence index (0 to items.length - 1)
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  // Default speed per line: 2.5s (2500ms) as requested (2~3초)
  const [speedMs, setSpeedMs] = useState<number>(2500);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<any>(null);

  // Sync with selectedSentenceId if clicked outside
  useEffect(() => {
    if (selectedSentenceId !== null) {
      const idx = items.findIndex((it) => it.id === selectedSentenceId);
      if (idx !== -1 && idx !== activeIndex) {
        setActiveIndex(idx);
      }
    }
  }, [selectedSentenceId, items]);

  // Keep parent in sync
  useEffect(() => {
    if (items[activeIndex]) {
      onSelectSentence(items[activeIndex].id);
    }
  }, [activeIndex, items, onSelectSentence]);

  // Auto-scroll active card into view smoothly
  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  // Teleprompter / TTS Sync Runner effect
  useEffect(() => {
    if (!isPlaying || items.length === 0) {
      cancelSpeech();
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const currentItem = items[activeIndex];
    if (!currentItem) return;

    if (readingMode === 'ttsSync') {
      // Option C: Voice Read-Along
      // Speak Korean translation, then automatically advance to the next line
      speakText(
        currentItem.koreanTranslation,
        'ko',
        () => {
          // After finishing speaking, add a comfortable 0.6s breath pause then advance
          timerRef.current = setTimeout(() => {
            if (activeIndex < items.length - 1) {
              setActiveIndex((prev) => prev + 1);
            } else {
              setIsPlaying(false); // Finished reading all lines
            }
          }, 600);
        },
        0.95
      );
    } else if (readingMode === 'teleprompter') {
      // Option A: Visual Teleprompter (2~3 seconds per line)
      cancelSpeech();
      timerRef.current = setTimeout(() => {
        if (activeIndex < items.length - 1) {
          setActiveIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, speedMs);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelSpeech();
    };
  }, [isPlaying, activeIndex, readingMode, speedMs, items]);

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < items.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setActiveIndex(0);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const progressPercent =
    items.length > 0 ? Math.round(((activeIndex + 1) / items.length) * 100) : 0;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Mode Selector Tabs (Option A vs Option C vs Cards) */}
      <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-1 shadow-md">
        <button
          type="button"
          onClick={() => {
            onChangeReadingMode('teleprompter');
            setIsPlaying(true);
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            readingMode === 'teleprompter'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>옵션 A. 자막 자동 롤링</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onChangeReadingMode('ttsSync');
            setIsPlaying(true);
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            readingMode === 'ttsSync'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>옵션 C. 음성 낭독 싱크</span>
        </button>

        <button
          type="button"
          onClick={() => {
            cancelSpeech();
            onChangeReadingMode('cards');
          }}
          className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition ${
            readingMode === 'cards'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
          title="전체 카드 목록 보기"
        >
          <span>전체 보기</span>
        </button>
      </div>

      {/* 2. Controller Dock (Play/Pause, Speed, Progress) */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-col gap-2.5 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          {/* Play / Pause / Nav Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition"
              title="이전 문장 (위로)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-md ${
                isPlaying
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>일시정지</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>재생하기</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex >= items.length - 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition"
              title="다음 문장 (아래로)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="처음부터 다시 읽기"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Selector (한줄당 2~3초 설정) */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">속도:</span>
            {[
              { label: '3.5초 (느리게)', ms: 3500 },
              { label: '2.5초 (보통)', ms: 2500 },
              { label: '1.8초 (빠르게)', ms: 1800 },
            ].map((spd) => (
              <button
                key={spd.ms}
                type="button"
                onClick={() => setSpeedMs(spd.ms)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                  speedMs === spd.ms
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {spd.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar & Status */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">
              {activeIndex + 1} / {items.length} 문장
            </span>
            <span className="text-slate-400 text-[11px]">
              {readingMode === 'ttsSync'
                ? '🎙️ 한국어 음성 낭독에 맞춰 한 줄씩 진행'
                : `📜 한 줄당 ${speedMs / 1000}초 간격으로 자동 스크롤`}
            </span>
          </div>

          <span className="font-mono text-cyan-400 text-xs font-semibold">
            {progressPercent}%
          </span>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Scrolling Sentence Stream */}
      <div
        ref={containerRef}
        className="relative max-h-[380px] overflow-y-auto pr-1 flex flex-col gap-3 scroll-smooth rounded-2xl p-2 bg-slate-950/40 border border-slate-800/60"
      >
        {items.map((item, idx) => {
          const isActive = idx === activeIndex;
          const isPassed = idx < activeIndex;

          return (
            <div
              key={item.id}
              ref={isActive ? activeItemRef : null}
              onClick={() => {
                setActiveIndex(idx);
                setIsPlaying(true);
              }}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative ${
                isActive
                  ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/60 border-cyan-400 shadow-xl shadow-cyan-500/15 scale-[1.01] z-10'
                  : isPassed
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60 hover:opacity-90'
                  : 'bg-slate-900/50 border-slate-800/80 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Active Glow Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition ${
                      isActive
                        ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/40'
                        : isPassed
                        ? 'bg-slate-800 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : item.id}
                  </span>

                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      현재 읽는 중
                    </span>
                  )}
                </div>

                {/* Speak button on demand */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(item.koreanTranslation, 'ko');
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition"
                  title="이 문장 음성 듣기"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Korean Translation (Highlighted Primary) */}
              <div
                className={`text-base font-bold leading-relaxed mb-2 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-300'
                }`}
              >
                {item.koreanTranslation}
              </div>

              {/* Foreign Original */}
              <div className="text-xs text-slate-400 flex items-baseline gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  원문:
                </span>
                <span className="font-medium text-slate-300">
                  {item.originalSentence}
                </span>
              </div>

              {/* Pronunciation phonetics */}
              {item.pronunciation && (
                <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                  [{item.pronunciation}]
                </div>
              )}

              {/* Nuance note */}
              {item.nuance && isActive && (
                <div className="mt-2.5 p-2 rounded-xl bg-slate-950/60 border border-cyan-500/20 text-xs text-cyan-200/90 flex items-start gap-1.5">
                  <span className="font-bold text-amber-400 flex-shrink-0">
                    💡 뉘앙스:
                  </span>
                  <span>{item.nuance}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
