import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Download,
  Check,
  Search,
  BookOpen,
  Layers,
  Sparkles,
  Target,
  Shield,
  Milestone,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { PRD_SECTIONS, PRD_METADATA, PRD_MARKDOWN_RAW } from '../data/prdData.ts';

export const PRDViewer: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('overview');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(PRD_MARKDOWN_RAW);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([PRD_MARKDOWN_RAW], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SnapKorean_PRD_${PRD_METADATA.version}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredSections = PRD_SECTIONS.filter((sec) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(query) ||
      sec.description.toLowerCase().includes(query) ||
      sec.content.some((c) => c.toLowerCase().includes(query))
    );
  });

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'overview':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'problem':
        return <Target className="w-4 h-4 text-rose-400" />;
      case 'personas':
        return <BookOpen className="w-4 h-4 text-indigo-400" />;
      case 'functional_requirements':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'non_functional_requirements':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'system_architecture':
        return <Layers className="w-4 h-4 text-sky-400" />;
      case 'roadmap':
        return <Milestone className="w-4 h-4 text-purple-400" />;
      case 'kpis':
        return <BarChart3 className="w-4 h-4 text-lime-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-5xl mx-auto">
      {/* PRD Banner Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
                공식 제품 기획서
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                버전 {PRD_METADATA.version}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                {PRD_METADATA.status}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {PRD_METADATA.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              카메라 비전 기반 실시간 한국어 번역 및 심층 맥락 해석 앱의 제품 사양 명세서
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={copyMarkdown}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow"
              title="마크다운 전문 복사"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">복사 완료</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>마크다운 복사</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={downloadMarkdown}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-cyan-600/30"
              title="PRD 마크다운 파일 다운로드"
            >
              <Download className="w-4 h-4" />
              <span>.md 다운로드</span>
            </button>
          </div>
        </div>

        {/* Search bar inside PRD */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="PRD 항목, 요구사항, 기술스택 검색..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/60 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <span className="text-xs text-slate-400">
            총 {PRD_SECTIONS.length}개 주요 섹션
          </span>
        </div>
      </div>

      {/* Main Layout: Sidebar Navigation + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Nav */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <div className="sticky top-4 flex flex-col gap-1.5 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              목차 (Table of Contents)
            </span>
            {filteredSections.map((sec) => {
              const isActive = activeSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setActiveSectionId(sec.id);
                    const el = document.getElementById(`prd-sec-${sec.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                    isActive
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getSectionIcon(sec.id)}
                    <span className="truncate">
                      {sec.number}. {sec.title.split('(')[0].trim()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{sec.number}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {filteredSections.map((sec) => (
            <div
              key={sec.id}
              id={`prd-sec-${sec.id}`}
              className="p-5 sm:p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col gap-4 scroll-mt-6"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-cyan-400 font-mono text-xs font-bold border border-slate-700">
                    {sec.number}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{sec.description}</p>
                  </div>
                </div>
              </div>

              {/* Content items */}
              <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {sec.content.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60"
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Subsections if any */}
              {sec.subsections && sec.subsections.length > 0 && (
                <div className="mt-2 space-y-3 pt-3 border-t border-slate-800/60">
                  {sec.subsections.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20"
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-indigo-300 mb-2">
                        {sub.subtitle}
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {sub.details.map((d, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-1.5">
                            <span className="text-cyan-400">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
