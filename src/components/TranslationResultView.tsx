import React, { useState } from 'react';
import {
  Volume2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TranslationData, TranslationTone, ScrollReadingMode } from '../types.ts';
import { speakText } from '../utils/speech.ts';
import { TeleprompterView } from './TeleprompterView.tsx';

interface TranslationResultViewProps {
  data: TranslationData;
  tone: TranslationTone;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  selectedSentenceId: number | null;
  onSelectSentence: (id: number) => void;
}

export const TranslationResultView: React.FC<TranslationResultViewProps> = ({
  data,
  tone,
  isBookmarked = false,
  onToggleBookmark,
  selectedSentenceId,
  onSelectSentence,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedVocab, setExpandedVocab] = useState<boolean>(true);
  // Default to teleprompter if multiple lines, else cards
  const [readingMode, setReadingMode] = useState<ScrollReadingMode>(
    data.items.length > 1 ? 'teleprompter' : 'cards'
  );

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const toneLabel = {
    natural: '자연스러운 일상체',
    honorific: '정중한 존댓말',
    casual: '친근한 반말',
    literal: '학습용 직역',
  }[tone];

  return (
    <div className="w-full flex flex-col gap-4 mt-2">
      {/* 1. Header Badges & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            {data.detectedLanguage} 감지됨
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
            어조: {toneLabel}
          </span>
          {data.confidence && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              신뢰도 {data.confidence}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleBookmark && (
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
                isBookmarked
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title={isBookmarked ? '북마크 해제' : '히스토리 북마크 저장'}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">저장됨</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">북마크</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => copyToClipboard(data.fullKoreanTranslation, 'full_ko')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
            title="한국어 전체 번역 복사"
          >
            {copiedKey === 'full_ko' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">전체 복사</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Hero Summary Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Sparkles className="w-32 h-32 text-cyan-400" />
        </div>

        {data.summary && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 text-xs font-semibold mb-2.5">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>핵심 요약: {data.summary}</span>
          </div>
        )}

        <div className="relative">
          <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed tracking-tight">
            {data.fullKoreanTranslation}
          </h3>
        </div>

        {/* Audio speech and original preview */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => speakText(data.fullKoreanTranslation, 'ko')}
            className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/30 text-cyan-200 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>한국어 음성 듣기</span>
          </button>

          <span className="text-[11px] text-slate-400 truncate max-w-sm">
            원문: {data.fullOriginalText.slice(0, 80)}
            {data.fullOriginalText.length > 80 ? '...' : ''}
          </span>
        </div>
      </div>

      {/* 3. Sentence-by-Sentence Detailed Mapping or Teleprompter */}
      {data.items && data.items.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {readingMode === 'teleprompter' || readingMode === 'ttsSync' ? (
            <TeleprompterView
              items={data.items}
              langCode={data.languageCode}
              readingMode={readingMode}
              onChangeReadingMode={setReadingMode}
              selectedSentenceId={selectedSentenceId}
              onSelectSentence={onSelectSentence}
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-200">
                    전체 문장 카드 목록
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                    {data.items.length}개 문장
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReadingMode('teleprompter')}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 transition"
                  >
                    📜 자막 자동 롤링 (A)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingMode('ttsSync')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition"
                  >
                    🎙️ 낭독 싱크 (C)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {data.items.map((item) => {
                  const isSelected = selectedSentenceId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectSentence(item.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition cursor-pointer relative group ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Foreign Original */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {item.id}
                            </span>
                            <p className="text-sm font-semibold text-slate-200 break-words">
                              {item.originalSentence}
                            </p>
                          </div>

                          {/* Pronunciation phonetics */}
                          {item.pronunciation && (
                            <div className="text-xs text-cyan-400/90 ml-7 mb-1.5 font-mono">
                              [{item.pronunciation}]
                            </div>
                          )}

                          {/* Korean Translation */}
                          <div className="ml-7 text-sm font-medium text-emerald-300">
                            → {item.koreanTranslation}
                          </div>

                          {/* Nuance or grammar note */}
                          {item.nuance && (
                            <div className="mt-2 ml-7 px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold">💡 뉘앙스:</span>
                              <span>{item.nuance}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons per sentence */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Speak Original */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(item.originalSentence, data.languageCode);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition"
                            title="원어민 발음 듣기"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Copy Sentence */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(
                                `${item.originalSentence}\n${item.koreanTranslation}`,
                                `item_${item.id}`
                              );
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                            title="문장 복사"
                          >
                            {copiedKey === `item_${item.id}` ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Key Vocabulary Section */}
      {data.keyVocabulary && data.keyVocabulary.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <button
            type="button"
            onClick={() => setExpandedVocab(!expandedVocab)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">핵심 어휘 단어장</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-medium border border-indigo-500/20">
                {data.keyVocabulary.length}개
              </span>
            </div>
            {expandedVocab ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {expandedVocab && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-slate-800/80">
              {data.keyVocabulary.map((vocab, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-white text-sm">{vocab.word}</span>
                      {vocab.pronunciation && (
                        <span className="text-[11px] text-cyan-400 font-mono">
                          [{vocab.pronunciation}]
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-emerald-300 font-medium mt-0.5">
                      {vocab.meaning}
                    </div>
                    {vocab.example && (
                      <div className="text-[11px] text-slate-400 mt-1">
                        예문: {vocab.example}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => speakText(vocab.word, data.languageCode)}
                    className="p-1 text-slate-400 hover:text-cyan-300 rounded"
                    title="단어 발음"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Cultural Tips & Context */}
      {data.culturalTips && data.culturalTips.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-amber-300">현지 문화 & 문맥 활용 팁</h4>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            {data.culturalTips.map((tip, idx) => (
              <li key={idx} className="leading-relaxed">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
