import React, { useState } from 'react';
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  Trash2,
  ExternalLink,
  Search,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { TranslationHistoryItem } from '../types.ts';

interface HistoryDrawerProps {
  history: TranslationHistoryItem[];
  onSelectHistory: (item: TranslationHistoryItem) => void;
  onToggleBookmark: (id: string) => void;
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectHistory,
  onToggleBookmark,
  onDeleteHistory,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'bookmarked'>('all');
  const [search, setSearch] = useState<string>('');

  const filteredHistory = history.filter((item) => {
    if (filter === 'bookmarked' && !item.isBookmarked) return false;
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      item.data.fullKoreanTranslation.toLowerCase().includes(query) ||
      item.data.fullOriginalText.toLowerCase().includes(query) ||
      item.data.detectedLanguage.toLowerCase().includes(query)
    );
  });

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col gap-4 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">번역 기록 보관함</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            총 {history.length}건
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Tab Filter */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                filter === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              전체 내역
            </button>
            <button
              type="button"
              onClick={() => setFilter('bookmarked')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition ${
                filter === 'bookmarked'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>북마크만</span>
            </button>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
              title="전체 기록 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="기록 검색 (원문, 한국어 번역, 언어)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* List Content */}
      {filteredHistory.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/80 text-center flex flex-col items-center justify-center">
          <AlertCircle className="w-10 h-10 text-slate-500 mb-2" />
          <p className="text-sm font-semibold text-slate-300">
            {filter === 'bookmarked'
              ? '북마크된 번역 내역이 없습니다.'
              : '저장된 번역 기록이 없습니다.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            카메라로 외국어 문장을 스캔하면 자동으로 이곳에 보관됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistory(item)}
              className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                      {item.data.detectedLanguage}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(item.id);
                      }}
                      className={`p-1 rounded-md transition ${
                        item.isBookmarked
                          ? 'text-amber-400'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title="북마크"
                    >
                      {item.isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistory(item.id);
                      }}
                      className="p-1 rounded-md text-slate-500 hover:text-rose-400 transition"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Korean Translation */}
                <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition mb-1.5">
                  {item.data.fullKoreanTranslation}
                </h4>

                {/* Original snippet */}
                <p className="text-xs text-slate-400 line-clamp-1">
                  원문: {item.data.fullOriginalText}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-cyan-400 transition">
                <span>상세 해설 및 문장 보기</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
