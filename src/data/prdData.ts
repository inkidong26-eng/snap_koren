export interface PRDSection {
  id: string;
  number: string;
  title: string;
  description: string;
  content: string[];
  subsections?: {
    subtitle: string;
    details: string[];
  }[];
}

export const PRD_METADATA = {
  title: "스마트 카메라 실시간 문장 번역 및 심층 해석 앱 (SnapKorean)",
  version: "v1.0.0 (MVP)",
  date: "2026-11-03",
  author: "Product Lead & Lead AI Engineer",
  status: "Approved for Implementation / MVP Active",
};

export const PRD_SECTIONS: PRDSection[] = [
  {
    id: "overview",
    number: "01",
    title: "제품 개요 및 비전 (Product Vision)",
    description: "카메라를 비추는 순간 언어 장벽이 사라지는 직관적인 시각 번역 경험",
    content: [
      "제품명: SnapKorean (스냅코리안) - 실시간 시각 문장 통번역 및 맥락 해석기",
      "비전: 사용자가 스마트폰 카메라를 외국어 텍스트에 비추기만 하면, 단순 기계 번역을 넘어 한국인 정서에 꼭 맞는 자연스러운 문맥 해석, 문장별 정밀 해설, 발음, 핵심 어휘까지 1초 만에 제공하는 지능형 통번역 솔루션.",
      "핵심 철학: '타이핑 없는 번역(Zero-Typing)', '맥락이 살아있는 번역(Context-Aware)', '화면 위에 직접 뜨는 직관성(In-Situ AR)'."
    ]
  },
  {
    id: "problem",
    number: "02",
    title: "문제 정의 및 해결 기회 (Problem Statement)",
    description: "기존 번역 서비스의 한계와 사용자가 겪는 주요 페인포인트",
    content: [
      "1. 텍스트 입력의 불편함: 외국어(특히 한자, 일본어 가나, 아랍어, 특수 기호 등)는 키보드로 직접 입력하기가 매우 어렵거나 불가능함.",
      "2. 기존 OCR 앱의 어색한 직역: 구글 렌즈나 파파고 이미지 번역은 단어 단위로 쪼개져 문맥이 끊기거나 직역 투의 어색한 문장('이것은 당신에게 금지된다' 등)으로 출력되는 경우가 잦음.",
      "3. 뉘앙스와 문화적 맥락 부재: 해외 여행지 식당 메뉴판, 경고문, 계약서, 안내 방송 문구 등은 단순 단어 번역만으로는 현지 뉘앙스나 주문 팁을 알 수 없음.",
      "4. 학습 연계의 단절: 번역 결과를 본 뒤 '어떤 단어가 쓰였는지', '어떻게 발음하는지' 다시 사전 앱을 켜야 하는 번거로움 존재."
    ]
  },
  {
    id: "personas",
    number: "03",
    title: "타겟 사용자 페르소나 (Target Personas)",
    description: "본 제품의 핵심 고객군 정의 및 주요 사용 시나리오",
    content: [
      "페르소나 A: 해외 자유 여행자 (20~40대)",
      "- 상황: 일본, 베트남, 유럽 등의 현지 로컬 식당에서 외국어 메뉴판이나 지하철 환승 표지판을 만났을 때 즉시 무엇인지 알고 싶음.",
      "- 니즈: 카메라로 슥 비추면 즉시 자연스러운 한국어로 뜻이 나오고, 매운맛 여부나 주문 시 주의사항 같은 팁이 필요함.",
      "페르소나 B: 원서 및 외국어 학습자 (학생 및 직장인)",
      "- 상황: 영어 원서, 일본어 라이트노벨, 전공 서적을 읽다가 복잡한 구문에서 막힘.",
      "- 니즈: 문장 단위로 직역과 의역을 비교해 보고, 원문 발음과 함께 포함된 핵심 숙어/단어장을 즉시 확인하여 복습하고 싶음.",
      "페르소나 C: 해외 직구 및 비즈니스 실무자",
      "- 상황: 해외 수입 제품의 설명서, 성분표, 계약 문서의 중요 조항을 스마트폰으로 빠르게 검토해야 함.",
      "- 니즈: 오역 없는 정확한 한국어 번역과 전체 내용의 명쾌한 한 줄 요약."
    ]
  },
  {
    id: "functional_requirements",
    number: "04",
    title: "기능적 요구사항 (Functional Requirements)",
    description: "MVP 및 핵심 기능 명세 (FR-01 ~ FR-09)",
    content: [
      "FR-01 [실시간 카메라 뷰파인더]: 기기 후면/전면 카메라 스트림 연동, 실시간 스캔 애니메이션 HUD, 플래시/토치 제어, 전/후면 전환.",
      "FR-02 [투웨이 스캔 모드]: 사용자가 원할 때 셔터를 누르는 '수동 스냅 캡처'와 비추기만 해도 일정 주기로 인식하는 '스마트 자동 스캔(Live Auto-Scan)' 제공.",
      "FR-03 [멀티모달 AI 비전 번역]: 차세대 Gemini 3.8 Flash 모델을 연동하여 이미지 내 텍스트 정밀 감지(OCR) 및 한국어 심층 번역 수행.",
      "FR-04 [AR 오버레이 뷰]: 캡처된 사진 상의 텍스트 좌표([ymin, xmin, ymax, xmax])를 기반으로 원문 위치 위에 한국어 번역 자막을 직관적으로 증강 표시.",
      "FR-05 [문장별 정밀 매핑 & 뉘앙스 해설]: 문장 단위로 원문-번역문 매핑, 발음 표기(한글 음차), 어조 및 문맥 뉘앙스 팁 제공.",
      "FR-06 [원어민 음성 TTS]: Web Speech Synthesis API를 활용하여 원어 문장 및 한국어 번역문의 실시간 음성 듣기 기능.",
      "FR-07 [핵심 어휘 자동 추출]: 캡처된 문장에 사용된 중요 단어, 뜻, 예문을 자동 정리하여 미니 단어장 생성.",
      "FR-08 [번역 톤 커스텀]: 사용 목적에 맞춰 '자연스러운 일상체', '격식있는 존댓말', '친근한 반말', '학습용 직역' 4가지 어조 선택 지원.",
      "FR-09 [로컬 히스토리 & 갤러리 업로드]: 과거 번역 내역 로컬 저장, 북마크 즐겨찾기, 갤러리 사진 파일 업로드 및 데스크톱 테스트용 샘플 이미지 제공.",
      "FR-10 [스마트 순차 읽기 모드 (Auto-Scroll Teleprompter & TTS Sync)]: 여러 줄의 긴 문장을 스캔했을 때, 위에서부터 한 줄당 2~3초 간격으로 자동 스크롤(옵션 A. 자막 롤링)하거나 한국어 음성 낭독 속도에 맞춰 동기화 스크롤(옵션 C. 음성 싱크)할 수 있는 듀얼 리딩 모드 제공."
    ],
    subsections: [
      {
        subtitle: "FR-03 AI 비전 파이프라인 상세",
        details: [
          "입력: 카메라 비디오 프레임 캡처 이미지 (JPEG Base64, 최적 해상도 1280x720/1920x1080 리사이징으로 대역폭 절감)",
          "엔진: Google GenAI SDK (Gemini 3.8 Flash Multimodal)",
          "출력 포맷: JSON 스키마를 통한 구조화된 객체 (언어코드, 전체 원문, 종합 번역, 요약, 문장별 항목, 핵심 어휘, 문화 팁)",
          "처리 시간: 평균 1.0~1.8초 내 완결"
        ]
      },
      {
        subtitle: "FR-04 AR 뷰 & 카드 뷰 모드 전환",
        details: [
          "AR 모드: 캡처된 이미지 위에 반투명 글래스모피즘 오버레이 뱃지 배치, 터치 시 해당 문장 하이라이트",
          "카드 뷰: 문장별 상세 대역(Side-by-Side), 원어 발음, 뉘앙스 해설, 복사 및 TTS 버튼 제공",
          "뷰 토글: 한 번의 탭으로 AR 뷰와 카드 뷰를 자유롭게 오갈 수 있음"
        ]
      }
    ]
  },
  {
    id: "non_functional_requirements",
    number: "05",
    title: "비기능적 요구사항 (Non-Functional Requirements)",
    description: "성능, 보안, 가용성 및 사용자 경험 기준",
    content: [
      "NFR-01 [지연 시간 (Latency)]: 셔터 클릭 또는 스캔 트리거 후 번역 결과 렌더링까지 최대 2.5초 이내 (P95 < 2.0s 목표).",
      "NFR-02 [모바일 반응형 & 한 손 조작성]: 모바일 뷰포트에서 한 손 엄지손가락으로 셔터, 렌즈 전환, 히스토리 접근이 가능하도록 하단 플로팅 컨트롤 바 설계.",
      "NFR-03 [프라이버시 & 데이터 보안]: 사용자의 카메라 프레임은 번역 목적 외에 서버 디스크에 영구 저장하지 않으며, 메모리 상에서 처리 후 즉시 해제.",
      "NFR-04 [오프라인 및 네트워크 탄력성]: 네트워크 일시 불안정 시 재시도 안내 및 로컬 저장소(LocalStorage)를 활용한 오프라인 히스토리 보존.",
      "NFR-05 [접근성 & 다국어 지원]: 고대비 텍스트 표시, 음성 읽기(TTS), 스크린 리더 호환 ARIA 레이블링 제공."
    ]
  },
  {
    id: "system_architecture",
    number: "06",
    title: "시스템 아키텍처 및 기술 스택 (System Architecture)",
    description: "프론트엔드, 백엔드 프록시 및 AI 비전 파이프라인",
    content: [
      "Frontend: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion",
      "Camera Capture: HTML5 MediaDevices API (`navigator.mediaDevices.getUserMedia`) + Canvas 2D 하드웨어 가속 스냅샷",
      "Audio Engine: Web Speech Synthesis API (`window.speechSynthesis`)",
      "Backend Proxy: Express.js (Node.js/TSX) - API 키를 클라이언트에 노출하지 않고 안전하게 관리",
      "AI Model: Google @google/genai SDK (Gemini 3.8 Flash) - Vision OCR + Contextual Translation Engine",
      "Storage: 브라우저 LocalStorage (번역 히스토리, 북마크, 사용자 번역 톤 설정)"
    ]
  },
  {
    id: "roadmap",
    number: "07",
    title: "단계별 출시 로드맵 (Release Roadmap)",
    description: "MVP 론칭부터 글로벌 확장까지의 마일스톤",
    content: [
      "Phase 1 (현 단계 - MVP 출시): 카메라 실시간 뷰파인더, 원클릭 AI 번역, AR 오버레이 및 카드 뷰, 문장별 뉘앙스 해설, TTS 음성 듣기, 히스토리 저장.",
      "Phase 2 (v1.2 기능 강화): 오프라인 모드(경량 온디바이스 OCR 캐시), 실시간 연속 자막(연속 비디오 프레임 트래킹), 다국어 사전 위젯 연동.",
      "Phase 3 (v2.0 글로벌 확장): 양방향 음성+카메라 실시간 동시 통역, 여행 가이드북 자동 생성, PDF/문서 다중 페이지 일괄 스캔 번역."
    ]
  },
  {
    id: "kpis",
    number: "08",
    title: "핵심 성과 지표 (KPIs & Metrics)",
    description: "제품의 성공 여부를 측정하는 정량적/정성적 지표",
    content: [
      "1. 인식 번역 성공률 (OCR & Translation Success Rate): 98% 이상",
      "2. 평균 번역 대기 시간 (End-to-End Latency): 1.8초 이하",
      "3. 1인당 일일 평균 스캔 횟수 (Daily Scans per Active User): 5회 이상",
      "4. 북마크 및 단어 저장 전환율: 번역 완료 건의 25% 이상",
      "5. 사용자 만족도 (CSAT): 4.6 / 5.0 점 이상"
    ]
  }
];

export const PRD_MARKDOWN_RAW = `# [PRD] 스마트 카메라 실시간 문장 번역 및 심층 해석 앱 (SnapKorean)
**문서 버전:** v1.0.0 (MVP)  
**작성일:** 2026-11-03  
**작성자:** Product Lead & Lead AI Engineer  
**상태:** 승인 완료 (Approved for MVP)

---

## 1. 제품 개요 (Product Overview & Vision)
- **제품명:** SnapKorean (스냅코리안)
- **한 줄 요약:** 카메라로 외국어 문장이나 표지판을 비추기만 하면 실시간으로 자연스러운 한국어로 해석하고 문맥 뉘앙스와 핵심 어휘까지 분석해주는 인공지능 시각 번역기.
- **핵심 목표:** 
  1. 외국어를 키보드로 타이핑할 필요 없는 **Zero-Typing** 경험 제공.
  2. 기계적인 어색한 직역을 벗어나 한국인이 일상에서 쓰는 **자연스러운 맥락 기반 해석**.
  3. 사진 위 원문 위치에 실시간 번역 자막을 띄워주는 **증강현실(AR) 시각화**.

---

## 2. 해결하고자 하는 문제 (Problem Statement)
1. **타이핑 불가:** 일본어 한자나 프랑스어 악센트 기호 등은 일반 사용자가 입력하기가 거의 불가능함.
2. **어색한 기계 번역:** 기존 이미지 번역은 문맥을 무시하고 단어 단위로 쪼개어 번역하여 의미 왜곡 발생.
3. **뉘앙스 부재:** 식당 메뉴판, 경고문, 계약서의 현지 문화적 의미나 주의사항을 알 수 없음.
4. **학습과의 단절:** 번역을 보고도 단어나 발음을 따로 검색해야 하는 번거로움.

---

## 3. 타겟 사용자 및 주요 시나리오 (Target Personas)
- **해외 여행자:** 로컬 식당 메뉴판, 지하철 노선표, 관광지 안내문 즉시 확인.
- **외국어 학습자:** 영어/일본어 원서, 논문 독해 시 문장 구조 분석과 단어장 정리.
- **직구 및 업무 실무자:** 수입 제품 라벨, 설명서, 비즈니스 문서를 즉시 한국어로 요약 파악.

---

## 4. 기능적 요구사항 (Functional Requirements)
- **FR-01 [실시간 뷰파인더]:** 모바일/데스크톱 WebRTC 카메라 연동, 전/후면 전환, 플래시 토치 제어.
- **FR-02 [원터치 스냅 & 자동 스캔]:** 수동 셔터 촬영 및 자동 스캔 모드 지원.
- **FR-03 [AI 멀티모달 비전 엔진]:** Gemini 3.8 Flash 기반 정밀 OCR 및 문맥 기반 한국어 번역.
- **FR-04 [AR 오버레이 뷰]:** 이미지 내 텍스트 좌표에 맞춰 한국어 번역 박스를 덧씌워 표시.
- **FR-05 [문장별 대역 & 뉘앙스]:** 문장 단위 원문-한글 대조, 발음 음차 표기, 문화적 뉘앙스 팁.
- **FR-06 [원어민 TTS 음성]:** Web Speech Synthesis 기반 원문 및 한국어 음성 재생.
- **FR-07 [핵심 어휘 단어장]:** 문장에 나온 주요 어휘, 뜻, 예문 자동 추출.
- **FR-08 [번역 톤 커스텀]:** 자연스러운 일상체, 정중한 존댓말, 친근한 반말, 학습용 직역 선택.
- **FR-09 [로컬 히스토리 & 갤러리 업로드]:** 갤러리 이미지 선택, 로컬 저장소 히스토리 관리.
- **FR-10 [스마트 순차 읽기 (텔레프롬프터 & 낭독 싱크)]:** 여러 줄의 긴 문장을 스캔했을 때 한 줄당 2~3초 간격으로 자동 스크롤(옵션 A)하거나 한국어 음성 낭독에 맞춰 동기화 스크롤(옵션 C) 선택 지원.

---

## 5. 비기능적 요구사항 (Non-Functional Requirements)
- **응답 속도:** 셔터 클릭 후 번역 완료까지 평균 1.5~2.0초 이내 (P95 < 2.5s).
- **프라이버시:** 이미지는 번역용 메모리에서 처리 후 즉시 휘발, 서버에 보관하지 않음.
- **모바일 최적화:** 한 손 조작 가능한 하단 컨트롤 바, PWA 웹 표준 준수.

---

## 6. 시스템 구조 (Tech Stack)
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion.
- **Backend:** Express.js API Server (Google GenAI SDK Proxy).
- **AI Model:** Gemini 3.8 Flash (Multimodal Vision OCR & Reasoning).
- **Local Cache:** 브라우저 LocalStorage.

---

## 7. 향후 로드맵 (Roadmap)
- **Phase 1 (MVP):** 카메라 스캔, AR 오버레이, 문장별 해설, TTS, PRD 뷰어 내장.
- **Phase 2:** 온디바이스 경량 OCR 캐시, 연속 비디오 실시간 자막 트래킹.
- **Phase 3:** 양방향 음성 대화 동시 통역, 다중 문서 일괄 스캔.
`;
