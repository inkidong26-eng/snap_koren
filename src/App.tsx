import React, { useState, useEffect } from 'react';
import {
  Camera,
  FileText,
  Clock,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  Eye,
  Info,
} from 'lucide-react';
import { CameraViewfinder } from './components/CameraViewfinder.tsx';
import { TranslationResultView } from './components/TranslationResultView.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { PRDViewer } from './components/PRDViewer.tsx';
import {
  TranslationData,
  TranslationHistoryItem,
  TranslationTone,
  ViewMode,
} from './types.ts';

const STORAGE_KEY = 'snapkorean_history_v1';
const TONE_KEY = 'snapkorean_tone_v1';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('scanner');
  const [tone, setTone] = useState<TranslationTone>('natural');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [frozenImage, setFrozenImage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<TranslationData | null>(null);
  const [selectedSentenceId, setSelectedSentenceId] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);

  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  // Load history & tone preference from localStorage
  useEffect(() => {
    try {
      const savedTone = localStorage.getItem(TONE_KEY) as TranslationTone;
      if (savedTone) setTone(savedTone);

      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.warn('Failed to load local storage:', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (items: TranslationHistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save history:', e);
    }
  };

  const handleToneChange = (newTone: TranslationTone) => {
    setTone(newTone);
    try {
      localStorage.setItem(TONE_KEY, newTone);
    } catch (e) {
      console.warn('Failed to save tone:', e);
    }
  };

  // Perform translation via backend proxy
  const handleCaptureImage = async (base64: string, mimeType: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setFrozenImage(base64);
    setSelectedSentenceId(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          tone,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || '번역 요청이 실패했습니다.');
      }

      const result: TranslationData = json.data;
      setCurrentResult(result);

      // Create new history entry
      const newEntry: TranslationHistoryItem = {
        id: `scan_${Date.now()}`,
        timestamp: Date.now(),
        imageDataUrl: base64,
        data: result,
        tone,
        isBookmarked: false,
      };

      setCurrentHistoryId(newEntry.id);
      saveHistory([newEntry, ...history.slice(0, 49)]); // keep latest 50
    } catch (err: any) {
      console.error('Translation error:', err);
      setErrorMessage(
        err.message || '사진 속 문장을 해석하지 못했습니다. 다시 시도해 주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = () => {
    setFrozenImage(null);
    setCurrentResult(null);
    setSelectedSentenceId(null);
    setErrorMessage(null);
    setCurrentHistoryId(null);
  };

  const handleToggleBookmark = (id?: string) => {
    const targetId = id || currentHistoryId;
    if (!targetId) return;

    const updated = history.map((item) =>
      item.id === targetId ? { ...item, isBookmarked: !item.isBookmarked } : item
    );
    saveHistory(updated);
  };

  const handleSelectHistoryItem = (item: TranslationHistoryItem) => {
    setFrozenImage(item.imageDataUrl);
    setCurrentResult(item.data);
    setTone(item.tone);
    setCurrentHistoryId(item.id);
    setSelectedSentenceId(null);
    setViewMode('scanner');
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
    if (currentHistoryId === id) {
      setCurrentHistoryId(null);
    }
  };

  const handleClearAllHistory = () => {
    if (confirm('저장된 모든 번역 기록을 삭제하시겠습니까?')) {
      saveHistory([]);
      setCurrentHistoryId(null);
    }
  };

  const isCurrentBookmarked = Boolean(
    currentHistoryId && history.find((h) => h.id === currentHistoryId)?.isBookmarked
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Slogan */}
          <div
            onClick={() => {
              setViewMode('scanner');
              handleRetake();
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition transform">
              <Camera className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Snap<span className="text-cyan-400">Korean</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  AI VISION
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                비추면 즉시 한국어로 해석되는 카메라 번역기
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode('scanner')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'scanner'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>카메라 번역</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('prd')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'prd'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>PRD 기획서</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('history')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'history'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">보관함</span>
              {history.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-700 text-cyan-300 text-[10px] flex items-center justify-center font-bold">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* Tone Selector Dropdown */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">번역 톤:</span>
            <select
              value={tone}
              onChange={(e) => handleToneChange(e.target.value as TranslationTone)}
              className="bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
            >
              <option value="natural">자연스러운 일상체</option>
              <option value="honorific">정중한 존댓말</option>
              <option value="casual">친근한 반말</option>
              <option value="literal">학습용 1:1 직역</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center">
        {/* Error Toast */}
        {errorMessage && (
          <div className="w-full max-w-2xl mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold px-2 py-1 text-slate-400 hover:text-white"
            >
              닫기
            </button>
          </div>
        )}

        {/* VIEW 1: SCANNER & TRANSLATION VIEW */}
        {viewMode === 'scanner' && (
          <div className="w-full flex flex-col lg:flex-row gap-6 items-start justify-center">
            {/* Left: Camera Viewfinder */}
            <div className="w-full lg:w-7/12 flex flex-col items-center">
              <CameraViewfinder
                onCaptureImage={handleCaptureImage}
                isLoading={isLoading}
                frozenImage={frozenImage}
                onRetake={handleRetake}
                sentenceItems={currentResult?.items || []}
                selectedSentenceId={selectedSentenceId}
                onSelectSentence={(id) => setSelectedSentenceId(id)}
                langCode={currentResult?.languageCode || 'en'}
                showOverlay={showOverlay}
                onToggleOverlay={() => setShowOverlay(!showOverlay)}
              />

              {/* Mobile Tone Selector */}
              <div className="flex md:hidden w-full items-center justify-between mt-3 px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">번역 어조:</span>
                <select
                  value={tone}
                  onChange={(e) => handleToneChange(e.target.value as TranslationTone)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-xs"
                >
                  <option value="natural">자연스러운 일상체</option>
                  <option value="honorific">정중한 존댓말</option>
                  <option value="casual">친근한 반말</option>
                  <option value="literal">학습용 1:1 직역</option>
                </select>
              </div>

              {/* Quick Guide Pill */}
              {!frozenImage && (
                <div className="mt-4 px-4 py-2 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>
                    외국어 간판, 메뉴판, 책, 포장지를 카메라로 비추고 셔터를 누르면 즉시 한국어로 풀이해 드립니다.
                  </span>
                </div>
              )}
            </div>

            {/* Right: Translation Interpretation Result */}
            <div className="w-full lg:w-5/12 flex flex-col">
              {currentResult ? (
                <TranslationResultView
                  data={currentResult}
                  tone={tone}
                  isBookmarked={isCurrentBookmarked}
                  onToggleBookmark={() => handleToggleBookmark()}
                  selectedSentenceId={selectedSentenceId}
                  onSelectSentence={(id) => setSelectedSentenceId(id)}
                />
              ) : (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1.5">
                    즉시 해석 준비 완료
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
                    카메라를 외국어 텍스트에 맞추고 셔터를 누르면, 문장 단위의 자연스러운 한국어 해석과 핵심 단어장, 뉘앙스 해설이 이곳에 나타납니다.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 text-left max-w-xs">
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                      ✓ Zero-Typing 자동 인식
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                      ✓ 사진 위 AR 자막 오버레이
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                      ✓ 원어민 발음 & 음성 TTS
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                      ✓ 현지 문화 & 뉘앙스 팁
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: PRD VIEWER */}
        {viewMode === 'prd' && <PRDViewer />}

        {/* VIEW 3: HISTORY DRAWER */}
        {viewMode === 'history' && (
          <HistoryDrawer
            history={history}
            onSelectHistory={handleSelectHistoryItem}
            onToggleBookmark={handleToggleBookmark}
            onDeleteHistory={handleDeleteHistory}
            onClearAll={handleClearAllHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          SnapKorean — 실시간 카메라 외국어 비전 번역기 & 심층 문맥 해석 솔루션 | Powered by Gemini 3.8 Flash
        </p>
      </footer>
    </div>
  );
}
