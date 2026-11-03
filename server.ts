import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support base64 image payloads from camera scans
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Translation API endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', tone = 'natural', contextHint = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: '이미지 데이터가 누락되었습니다.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY가 설정되지 않았습니다. AI Studio Secrets 패널을 확인해주세요.',
      });
    }

    // Clean base64 if it has prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const toneInstructions = {
      natural: '한국인이 일상에서 읽기 가장 편안하고 자연스러운 대화체/서술체로 매끄럽게 번역하세요.',
      honorific: '정중하고 격식 있는 존댓말(~하십시오, ~합니다)로 번역하세요.',
      casual: '친근한 반말이나 편안한 말투(~해, ~야)로 번역하세요.',
      literal: '원문의 단어와 문장 구조를 최대한 1:1로 직역하여 학습하기 용이하게 번역하세요.',
    }[tone as 'natural' | 'honorific' | 'casual' | 'literal'] || '자연스럽고 명확한 한국어로 번역하세요.';

    const systemInstruction = `
당신은 전 세계 모든 언어(영어, 일본어, 중국어, 프랑스어, 스페인어, 독일어, 베트남어 등)의 텍스트가 담긴 사진/카메라 스캔 이미지를 즉각 판독(OCR)하고 한국어로 완벽하게 해석해주는 '실시간 카메라 비전 번역 AI'입니다.

[핵심 목표]
1. 이미지에 찍힌 모든 외국어 문장, 간판, 메뉴판, 안내문, 서적 등을 누락 없이 정확하게 인식(OCR)합니다.
2. 인식된 문장을 한국어 화자가 즉각 이해할 수 있도록 ${toneInstructions}
3. 각 문장별로 원문, 한국어 번역, 원문 발음(한글 표기 및 로마자), 그리고 문맥/뉘앙스 설명을 제공하세요.
4. 이미지에서 해당 문장이 위치한 대략적인 영역 [ymin, xmin, ymax, xmax] (0~1000 범위 정규화 좌표)을 찾아 바운딩 박스를 제공하세요.
5. 학습과 실생활 활용을 위해 핵심 단어/표현 및 문화적 맥락(팁)을 함께 정리하세요.
6. 문맥 힌트: ${contextHint || '일반적인 카메라 스캔'}

반드시 지정된 JSON 스키마 규격으로만 응답하세요.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: '이 이미지 속 문장과 글자들을 모두 인식하여 한국어로 상세하게 해석 및 번역해 주세요. 각 문장의 위치 바운딩 박스(0-1000 정규화)와 핵심 어휘, 뉘앙스 해설도 포함해 주세요.',
          },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: {
              type: Type.STRING,
              description: '감지된 주요 원문 언어 이름 (예: 영어, 일본어, 중국어 등)',
            },
            languageCode: {
              type: Type.STRING,
              description: '언어 코드 (예: en, ja, zh, fr, es, de 등)',
            },
            fullOriginalText: {
              type: Type.STRING,
              description: '이미지에서 추출된 전체 원문 텍스트',
            },
            fullKoreanTranslation: {
              type: Type.STRING,
              description: '전체 문맥을 살린 종합 한국어 해석/번역문',
            },
            summary: {
              type: Type.STRING,
              description: '이 텍스트가 의미하는 바에 대한 한 줄 요약',
            },
            confidence: {
              type: Type.STRING,
              description: '인식 신뢰도 (높음, 보통, 주의 필요 등)',
            },
            items: {
              type: Type.ARRAY,
              description: '문장 단위 또는 주요 텍스트 블록별 상세 번역 목록',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  originalSentence: { type: Type.STRING, description: '원문 문장' },
                  koreanTranslation: { type: Type.STRING, description: '한국어 번역' },
                  pronunciation: { type: Type.STRING, description: '원어 발음 (한글 발음 표기)' },
                  nuance: { type: Type.STRING, description: '이 문장의 어조, 문맥적 의미 또는 주의점' },
                  box2d: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: '이미지 상 위치 [ymin, xmin, ymax, xmax] 0~1000',
                  },
                },
                required: ['id', 'originalSentence', 'koreanTranslation'],
              },
            },
            keyVocabulary: {
              type: Type.ARRAY,
              description: '본문에 나온 유용한 핵심 단어/숙어',
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING, description: '원문 단어' },
                  pronunciation: { type: Type.STRING, description: '발음 표기' },
                  meaning: { type: Type.STRING, description: '한국어 뜻' },
                  example: { type: Type.STRING, description: '해당 문맥에서의 쓰임새' },
                },
                required: ['word', 'meaning'],
              },
            },
            culturalTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '문화적 배경 지식, 현지 뉘앙스, 여행/비즈니스 활용 팁',
            },
          },
          required: [
            'detectedLanguage',
            'languageCode',
            'fullOriginalText',
            'fullKoreanTranslation',
            'items',
          ],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Gemini로부터 비어있는 응답이 반환되었습니다.');
    }

    const parsed = JSON.parse(textOutput);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Translation error:', error);
    return res.status(500).json({
      error: error?.message || '이미지 분석 및 번역 중 오류가 발생했습니다.',
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SnapKorean] Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
