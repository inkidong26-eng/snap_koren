export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface SentenceItem {
  id: number;
  originalSentence: string;
  koreanTranslation: string;
  pronunciation?: string;
  nuance?: string;
  box2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
}

export interface KeyVocabulary {
  word: string;
  pronunciation?: string;
  meaning: string;
  example?: string;
}

export interface TranslationData {
  detectedLanguage: string;
  languageCode: string;
  fullOriginalText: string;
  fullKoreanTranslation: string;
  summary: string;
  confidence?: string;
  items: SentenceItem[];
  keyVocabulary?: KeyVocabulary[];
  culturalTips?: string[];
}

export interface TranslationHistoryItem {
  id: string;
  timestamp: number;
  imageDataUrl: string;
  data: TranslationData;
  tone: TranslationTone;
  isBookmarked?: boolean;
}

export type TranslationTone = 'natural' | 'honorific' | 'casual' | 'literal';

export type ViewMode = 'scanner' | 'history' | 'prd';
