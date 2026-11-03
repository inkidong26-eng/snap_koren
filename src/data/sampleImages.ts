// Generates high quality sample text card data URLs for testing camera translation
export interface SamplePreset {
  id: string;
  title: string;
  language: string;
  flag: string;
  description: string;
  generateDataUrl: () => string;
}

function createTextCanvas(
  bgGradient: [string, string],
  lines: { text: string; size: number; weight: string; color: string; y: number }[],
  badgeText: string
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  const grad = ctx.createLinearGradient(0, 0, 800, 600);
  grad.addColorStop(0, bgGradient[0]);
  grad.addColorStop(1, bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 600);

  // Subtle border & inner card
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.roundRect(30, 30, 740, 540, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.roundRect(50, 50, 200, 36, 18);
  ctx.fill();
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#60a5fa';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, 150, 74);

  // Render text lines
  ctx.textAlign = 'center';
  lines.forEach((line) => {
    ctx.font = `${line.weight} ${line.size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, 400, line.y);
  });

  return canvas.toDataURL('image/jpeg', 0.92);
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'jp-ramen',
    title: '일본 라멘집 안내문',
    language: '일본어 (Japanese)',
    flag: '🇯🇵',
    description: '도쿄 현지 식당의 면 삶기 강도 및 육수 취향 안내문',
    generateDataUrl: () => {
      return createTextCanvas(
        ['#18181b', '#27272a'],
        [
          { text: '麺のかたさをお選びください', size: 38, weight: 'bold', color: '#fef08a', y: 170 },
          { text: '「かため」「ふつう」「やわらかめ」', size: 28, weight: '600', color: '#ffffff', y: 230 },
          { text: 'スープの濃さ：こってり / あっさり', size: 26, weight: 'normal', color: '#e4e4e7', y: 300 },
          { text: '当店自慢の特製とんこ츠スープは、24時間じっくり煮込んでおります。', size: 22, weight: 'normal', color: '#a1a1aa', y: 370 },
          { text: '※ アレルギーをお持ちのお客様はスタッフまでお申し付けください。', size: 20, weight: 'normal', color: '#f87171', y: 450 },
        ],
        '🍜 TOKYO RAMEN SHOP'
      );
    },
  },
  {
    id: 'en-notice',
    title: '영문 공항 및 카페 주의문',
    language: '영어 (English)',
    flag: '🇺🇸',
    description: '국제공항 라운지 안내 및 Wi-Fi 이용 규정',
    generateDataUrl: () => {
      return createTextCanvas(
        ['#0f172a', '#1e293b'],
        [
          { text: 'Welcome to Terminal 3 Lounge', size: 36, weight: 'bold', color: '#38bdf8', y: 160 },
          { text: 'Complimentary high-speed Wi-Fi is available for all guests.', size: 24, weight: '500', color: '#ffffff', y: 230 },
          { text: 'Please keep personal belongings with you at all times.', size: 24, weight: '600', color: '#fde047', y: 290 },
          { text: 'Boarding announcements will begin 30 minutes prior to departure.', size: 22, weight: 'normal', color: '#cbd5e1', y: 360 },
          { text: 'For assistance or special dietary requests, please contact our concierge.', size: 20, weight: 'normal', color: '#94a3b8', y: 430 },
        ],
        '✈️ AIRPORT PASSENGER NOTICE'
      );
    },
  },
  {
    id: 'fr-cafe',
    title: '프랑스 파리 카페 간판',
    language: '프랑스어 (French)',
    flag: '🇫🇷',
    description: '파리 몽마르트르 카페의 오늘의 브런치 메뉴 및 인사말',
    generateDataUrl: () => {
      return createTextCanvas(
        ['#1c1917', '#292524'],
        [
          { text: 'Café de Flore - Menu du Jour', size: 36, weight: 'bold', color: '#fb923c', y: 160 },
          { text: 'Croissant frais au beurre d’Isigny servi avec confiture maison.', size: 24, weight: '500', color: '#ffffff', y: 230 },
          { text: 'Café au lait crémeux ou Chocolat chaud à l’ancienne.', size: 24, weight: 'normal', color: '#fdba74', y: 290 },
          { text: 'Service compris. Terrasse ensoleillée ouverte toute la journée.', size: 22, weight: 'normal', color: '#e7e5e4', y: 360 },
          { text: 'Merci de votre visite et bonne dégustation à tous !', size: 22, weight: '600', color: '#34d399', y: 430 },
        ],
        '☕ PARIS BISTRO'
      );
    },
  },
  {
    id: 'es-travel',
    title: '스페인 박물관 안내문',
    language: '스페인어 (Spanish)',
    flag: '🇪🇸',
    description: '바르셀로나 미술관 관람 수칙 및 사진 촬영 안내',
    generateDataUrl: () => {
      return createTextCanvas(
        ['#1e1b4b', '#312e81'],
        [
          { text: 'Museo Nacional de Arte', size: 36, weight: 'bold', color: '#f43f5e', y: 160 },
          { text: 'Bienvenidos a la exposición permanente de obras maestras.', size: 24, weight: '500', color: '#ffffff', y: 230 },
          { text: 'Se permite tomar fotografías sin flash en todas las salas.', size: 24, weight: '600', color: '#a7f3d0', y: 290 },
          { text: 'Por favor, mantenga los teléfonos móviles en modo silencio.', size: 22, weight: 'normal', color: '#c7d2fe', y: 360 },
          { text: 'Las audioguías están disponibles gratuitamente en la entrada.', size: 20, weight: 'normal', color: '#99f6e4', y: 430 },
        ],
        '🏛️ BARCELONA MUSEUM'
      );
    },
  },
];
