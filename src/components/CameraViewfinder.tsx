import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  RotateCcw,
  Sparkles,
  Upload,
  Zap,
  ZapOff,
  SwitchCamera,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SAMPLE_PRESETS, SamplePreset } from '../data/sampleImages.ts';
import { TranslationOverlay } from './TranslationOverlay.tsx';
import { SentenceItem } from '../types.ts';

interface CameraViewfinderProps {
  onCaptureImage: (base64: string, mimeType: string) => void;
  isLoading: boolean;
  frozenImage: string | null;
  onRetake: () => void;
  sentenceItems?: SentenceItem[];
  selectedSentenceId: number | null;
  onSelectSentence: (id: number) => void;
  langCode?: string;
  showOverlay: boolean;
  onToggleOverlay: () => void;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  onCaptureImage,
  isLoading,
  frozenImage,
  onRetake,
  sentenceItems = [],
  selectedSentenceId,
  onSelectSentence,
  langCode = 'en',
  showOverlay,
  onToggleOverlay,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [autoScan, setAutoScan] = useState<boolean>(false);
  const [showSampleModal, setShowSampleModal] = useState<boolean>(false);
  const [isCapturingFlash, setIsCapturingFlash] = useState<boolean>(false);

  // Initialize or re-initialize camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('이 브라우저는 카메라 접근 API를 지원하지 않습니다.');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      });

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Check for torch capability
      const track = newStream.getVideoTracks()[0];
      if (track && 'getCapabilities' in track) {
        const capabilities = (track as any).getCapabilities?.();
        setHasTorch(Boolean(capabilities?.torch));
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      let message = '카메라 연결을 확인할 수 없습니다.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = '카메라 권한이 차단되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = '사용 가능한 카메라 기기를 찾을 수 없습니다. 갤러리 업로드나 샘플 사진을 이용해주세요.';
      }
      setCameraError(message);
    }
  }, [facingMode]);

  useEffect(() => {
    if (!frozenImage) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, frozenImage]);

  // Handle Torch Toggle
  const toggleTorch = async () => {
    if (!stream || !hasTorch) return;
    try {
      const track = stream.getVideoTracks()[0];
      const nextState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setIsTorchOn(nextState);
    } catch (e) {
      console.warn('Failed to toggle torch:', e);
    }
  };

  // Flip Camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture current frame from video feed
  const captureFrame = useCallback(() => {
    if (!videoRef.current || isLoading) return;

    // Visual shutter flash
    setIsCapturingFlash(true);
    setTimeout(() => setIsCapturingFlash(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    let width = video.videoWidth || 1280;
    let height = video.videoHeight || 720;
    const maxDim = 1280;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    onCaptureImage(dataUrl, 'image/jpeg');
  }, [isLoading, onCaptureImage]);

  // Auto scan interval effect
  useEffect(() => {
    if (!autoScan || frozenImage || isLoading || cameraError) return;

    const timer = setInterval(() => {
      captureFrame();
    }, 6000);

    return () => clearInterval(timer);
  }, [autoScan, frozenImage, isLoading, cameraError, captureFrame]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onCaptureImage(dataUrl, file.type || 'image/jpeg');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Select Sample
  const handleSelectSample = (sample: SamplePreset) => {
    const dataUrl = sample.generateDataUrl();
    if (dataUrl) {
      onCaptureImage(dataUrl, 'image/jpeg');
      setShowSampleModal(false);
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Hidden elements for processing */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Main Viewfinder Box */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[520px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
        {/* Shutter flash animation */}
        {isCapturingFlash && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-ping opacity-80" />
        )}

        {/* 1. If Frozen Image (Result captured) */}
        {frozenImage ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={frozenImage}
              alt="캡처된 번역 대상 사진"
              className="w-full h-full object-contain"
            />
            {/* AR Overlays on top of the image */}
            {showOverlay && sentenceItems.length > 0 && (
              <TranslationOverlay
                items={sentenceItems}
                selectedId={selectedSentenceId}
                onSelectSentence={onSelectSentence}
                langCode={langCode}
              />
            )}

            {/* Frozen Top Bar Indicator */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-30 pointer-events-auto">
              <div className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-xs font-medium text-cyan-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>문장 분석 및 해석 완료</span>
              </div>

              <div className="flex items-center gap-2">
                {sentenceItems.length > 0 && (
                  <button
                    type="button"
                    onClick={onToggleOverlay}
                    className={`px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition ${
                      showOverlay
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{showOverlay ? 'AR 자막 켬' : 'AR 자막 끔'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onRetake}
                  className="px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>다시 촬영</span>
                </button>
              </div>
            </div>
          </div>
        ) : cameraError ? (
          /* 2. Camera Error or Permission Denied View */
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">카메라 피드를 불러올 수 없습니다</h4>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">{cameraError}</p>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                카메라 재시도
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-lg shadow-cyan-600/20"
              >
                <Upload className="w-3.5 h-3.5" />
                갤러리 사진 선택
              </button>
              <button
                type="button"
                onClick={() => setShowSampleModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                체험용 샘플 테스트
              </button>
            </div>
          </div>
        ) : (
          /* 3. Live Video Viewfinder */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Target Reticle & Corner Brackets */}
            <div className="absolute inset-8 sm:inset-12 pointer-events-none">
              {/* Corner 1 (Top-Left) */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              {/* Corner 2 (Top-Right) */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              {/* Corner 3 (Bottom-Left) */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              {/* Corner 4 (Bottom-Right) */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />

              {/* Center Crosshair Guide */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-6 h-6 border border-white/60 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                </div>
              </div>
            </div>

            {/* Animated Laser Scan Bar */}
            <div className="absolute inset-x-8 sm:inset-x-12 top-0 pointer-events-none">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-pulse" />
            </div>

            {/* HUD Status Bar at Top */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700/60 text-xs font-medium text-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>실시간 텍스트 포커싱 중</span>
                </div>

                {autoScan && (
                  <div className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-semibold text-cyan-300 animate-pulse">
                    자동 스캔 활성
                  </div>
                )}
              </div>

              {/* Viewfinder Controls (Flip, Torch) */}
              <div className="flex items-center gap-1.5">
                {hasTorch && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`p-2 rounded-full backdrop-blur-md transition ${
                      isTorchOn
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-700/60'
                    }`}
                    title="플래시 조명 켜기/끄기"
                  >
                    {isTorchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                  </button>
                )}

                <button
                  type="button"
                  onClick={flipCamera}
                  className="p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/60 transition"
                  title="전면/후면 카메라 전환"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Loading Indicator Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-indigo-500/20 border-b-indigo-400 animate-spin animate-reverse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                  </div>
                </div>
                <h4 className="text-base font-semibold text-white mb-1">
                  Gemini AI가 문장을 해석하는 중...
                </h4>
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  외국어 글자를 판독하여 자연스러운 한국어 문맥과 핵심 어휘를 분석하고 있습니다.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Viewfinder Action Control Dock */}
      {frozenImage ? (
        <div className="w-full mt-4 flex items-center justify-between px-4 py-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl max-w-xl shadow-lg">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>다른 사진 선택</span>
          </button>

          <button
            type="button"
            onClick={onRetake}
            className="flex items-center gap-2 text-xs font-bold text-slate-950 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 카메라 촬영</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSampleModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>샘플</span>
          </button>
        </div>
      ) : (
        <div className="w-full mt-4 flex items-center justify-between px-3 py-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl max-w-xl">
          {/* Gallery Picker */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition p-2 rounded-xl hover:bg-slate-800/60"
            title="기기 앨범에서 사진 불러오기"
          >
            <ImageIcon className="w-5 h-5 text-slate-300" />
            <span className="text-[11px] font-medium">갤러리</span>
          </button>

          {/* Big Center Shutter Button */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={isLoading || Boolean(cameraError)}
              onClick={captureFrame}
              className="relative group p-1 rounded-full transition transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              title="문장 번역 촬영"
            >
              {/* Outer glowing pulsing ring */}
              <div className="w-18 h-18 rounded-full border-4 border-cyan-400 flex items-center justify-center group-hover:border-cyan-300 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                {/* Inner shutter disc */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 group-hover:from-cyan-400 group-hover:to-emerald-300 flex items-center justify-center shadow-inner">
                  <Camera className="w-7 h-7 text-slate-950" />
                </div>
              </div>
            </button>
          </div>

          {/* Preset Sample Picker for instant test */}
          <button
            type="button"
            onClick={() => setShowSampleModal(true)}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-300 transition p-2 rounded-xl hover:bg-slate-800/60"
            title="외국어 샘플 이미지로 바로 테스트"
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-[11px] font-medium">샘플 테스트</span>
          </button>
        </div>
      )}

      {/* Sample Modal Sheet */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">외국어 샘플 문장 선택</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSampleModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                닫기
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              실제 주변에 외국어 문장이 없거나 PC에서 테스트 중인 경우, 아래 샘플을 선택하면 즉시 카메라 번역을 체험할 수 있습니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {SAMPLE_PRESETS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="p-3.5 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 cursor-pointer transition flex flex-col justify-between group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{sample.flag}</span>
                    <div className="font-semibold text-white text-sm group-hover:text-cyan-300 transition">
                      {sample.title}
                    </div>
                  </div>
                  <div className="text-[11px] text-cyan-400 font-medium mb-1">
                    {sample.language}
                  </div>
                  <div className="text-xs text-slate-400 line-clamp-2">
                    {sample.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
