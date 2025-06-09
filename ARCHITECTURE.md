# PomoFarm 아키텍처 설계 (초기 버전 - 로컬 스토리지 기반)

## 1. 시스템 개요

PomoFarm은 포모도로 타이머와 농장 시뮬레이션을 결합한 웹 기반 생산성 애플리케이션입니다. 초기 버전에서는 클라이언트 사이드에서만 동작하도록 구현하며, 모든 데이터는 브라우저의 로컬 스토리지를 사용하여 저장됩니다.

## 2. 아키텍처 다이어그램 (초기 버전)

```
┌─────────────────────────────────────────────────────────────┐
│                      클라이언트 (React)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 상태 관리 (Redux Toolkit)             │  │
│  └───────────────────────────┬─────────────────────────┘  │
│                              │                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   타이머    │  │    농장     │  │      상점       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                              │                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 로컬 스토리지 어댑터                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │  사용자 데이터  │  │  농장 상태  │  │  상점 데이터  │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 3. 핵심 컴포넌트

### 3.1 프론트엔드

#### 3.1.1 페이지 컴포넌트

- **HomePage**: 타이머와 대시보드
- **FarmPage**: 농장 관리 인터페이스
- **ShopPage**: 가챠 및 아이템 구매

#### 3.1.2 공통 컴포넌트

- **Timer**: 포모도로 타이머
- **FarmGrid**: 3x3 농장 그리드
- **GachaMachine**: 가챠 머신 UI
- **Inventory**: 인벤토리 관리
- **Notification**: 알림 시스템

#### 3.1.3 상태 관리

- **Timer Slice**: 타이머 상태 관리
- **Farm Slice**: 농장 상태 관리
- **User Slice**: 사용자 데이터 및 통화 관리
- **Shop Slice**: 상점 및 가챠 상태 관리

### 3.2 데이터 관리 (로컬 스토리지)

#### 3.2.1 저장소 인터페이스

```typescript
interface StorageAdapter {
  // 사용자 데이터
  getUser(): Promise<User | null>;
  saveUser(user: User): Promise<void>;

  // 농장 데이터
  getFarm(): Promise<Farm>;
  saveFarm(farm: Farm): Promise<void>;

  // 상점 데이터 (초기 데이터)
  getShopItems(): Promise<ShopItem[]>;

  // 초기 데이터 로드
  initialize(): Promise<void>;
}
```

#### 3.2.2 서비스 레이어

- **TimerService**: 타이머 로직 처리
- **FarmService**: 농장 로직 처리
- **GachaService**: 가챠 로직 처리
- **UserService**: 사용자 데이터 처리

> **참고**: 백엔드 API는 추후 확장을 위해 인터페이스를 유지하되, 초기 버전에서는 로컬 스토리지 기반으로 구현됩니다.

## 4. 데이터 모델

### 4.1 사용자 모델

```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  password: string; // 해시된 비밀번호
  diamonds: number;
  experience: number;
  level: number;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 농장 모델

```typescript
interface Farm {
  _id: string;
  userId: string;
  plots: FarmPlot[];
  animals: Animal[];
  inventory: InventoryItem[];
  lastHarvest: Date;
  lastUpdated: Date;
}

interface FarmPlot {
  id: string;
  cropId: string | null;
  plantedAt: Date | null;
  growthProgress: number; // 0-100
  isWatered: boolean;
}

interface Animal {
  id: string;
  type: string;
  happiness: number; // 0-100
  lastFed: Date;
  productReady: boolean;
}
```

### 4.3 상점 및 아이템 모델

```typescript
interface ShopItem {
  id: string;
  name: string;
  type: "crop" | "animal" | "decoration";
  rarity: "common" | "rare" | "epic" | "legendary";
  price: number;
  imageUrl: string;
  description: string;
  growthTime?: number; // for crops (in minutes)
  produceTime?: number; // for animals (in minutes)
}

interface GachaPool {
  id: string;
  name: string;
  cost: number;
  items: {
    itemId: string;
    weight: number;
  }[];
}
```

## 5. 상태 관리 전략

### 5.1 Redux Toolkit Slices

#### 5.1.1 타이머 슬라이스

```typescript
interface TimerState {
  isRunning: boolean;
  mode: "focus" | "shortBreak" | "longBreak";
  timeLeft: number; // in seconds
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  completedPomodoros: number;
}
```

#### 5.1.2 농장 슬라이스

```typescript
interface FarmState {
  plots: FarmPlot[];
  animals: Animal[];
  inventory: InventoryItem[];
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
}
```

## 6. 데이터 흐름 (로컬 스토리지 기반)

### 6.1 초기 데이터 로드

1. 앱 시작 시 로컬 스토리지에서 사용자 데이터 로드
2. 데이터가 없을 경우 초기 데이터 생성
3. 타이머, 농장, 상점 상태 초기화

### 6.2 데이터 저장 흐름

1. 사용자 상호작용 발생 (예: 타이머 시작, 작물 심기 등)
2. Redux 액션 디스패치
3. Redux 리듀서에서 상태 업데이트
4. 상태 변경 감지하여 로컬 스토리지에 자동 저장
5. UI 업데이트

### 6.3 오프라인 지원

- 서비스 워커를 통한 오프라인 캐싱
- 오프라인 작업 큐 (온라인 시 자동 동기화)
- 충돌 해결 전략 (마지막 쓰기 우선)

## 7. 성능 최적화

### 7.1 코드 분할

- React.lazy와 Suspense를 사용한 코드 스플리팅
- 라우트 기반 코드 분할
- 컴포넌트 레벨 지연 로딩

### 7.2 메모이제이션

- React.memo를 통한 불필요한 리렌더링 방지
- useMemo/useCallback 훅 활용
- Reselect를 통한 선택자 최적화

### 7.3 가상화

- react-window를 활용한 긴 목록 최적화
- 화면 밖의 컴포넌트는 렌더링하지 않음

## 8. 테스트 전략

### 8.1 단위 테스트 (Jest)

- 유틸리티 함수
- Redux 리듀서
- 순수 컴포넌트

### 8.2 통합 테스트 (React Testing Library)

- 컴포넌트 통합 테스트
- 사용자 상호작용 테스트
- Redux 통합 테스트

### 8.3 E2E 테스트 (Cypress)

- 사용자 시나리오 테스트
- 크로스 브라우저 테스트
- 성능 테스트

## 9. 보안 고려사항

### 9.1 클라이언트 측 보안

- XSS 방지를 위한 입력값 검증
- CSRF 토큰 사용 (추후 백엔드 연동 시)
- 민감한 정보는 클라이언트에 저장하지 않음

### 9.2 데이터 무결성

- 로컬 스토리지 데이터 유효성 검사
- 데이터 백업 및 복구 메커니즘
- 버전 관리 및 마이그레이션 전략

## 10. 배포 전략

### 10.1 CI/CD 파이프라인

- GitHub Actions를 통한 자동화된 배포
- 테스트 자동화
- 코드 품질 검사

### 10.2 호스팅

- Vercel/Netlify를 통한 정적 호스팅
- CDN을 통한 자산 최적화
- 환경 변수를 통한 설정 관리

## 11. 모니터링 및 분석

### 11.1 에러 추적

- Sentry를 통한 에러 모니터링
- 사용자 피드백 시스템

### 11.2 분석

- Google Analytics 통합
- 사용자 행동 추적
- 성능 메트릭 수집

## 12. 확장성 계획

### 12.1 백엔드 통신

- RESTful API 설계
- WebSocket을 통한 실시간 업데이트
- 인증/인가 시스템

### 12.2 멀티플레이어 기능

- 친구 시스템
- 경쟁/협업 모드
- 리더보드

### 12.3 모바일 앱

- React Native로의 마이그레이션
- 푸시 알림
- 오프라인 우선 경험

## 13. 유지보수 계획

### 13.1 문서화

- 컴포넌트 문서 (Storybook)
- API 문서 (Swagger/OpenAPI)
- 아키텍처 의사결정 기록 (ADR)

### 13.2 코드 품질

- ESLint/Prettier 통합
- 정적 코드 분석
- 정기적인 의존성 업데이트

## 14. 결론

이 아키텍처는 초기 버전의 PomoFarm을 위한 기반을 제공하며, 향후 확장성을 고려하여 설계되었습니다. 로컬 스토리지 기반으로 시작하여 점진적으로 백엔드 통합이 가능하도록 구성되어 있습니다. 사용자 피드백과 요구사항에 따라 지속적으로 개선하고 최적화할 예정입니다.
2. Redux 액션 디스패치
3. 리듀서에서 상태 업데이트
4. 상태 변경 감지 시 로컬 스토리지에 자동 저장

### 6.3 데이터 구조 (예시)

```typescript
// 로컬 스토리지 키
const STORAGE_KEYS = {
  USER: "pomofarm_user",
  FARM: "pomofarm_farm",
  SHOP: "pomofarm_shop",
};

// 초기 데이터
const INITIAL_DATA = {
  user: {
    diamonds: 100, // 초기 재화
    experience: 0,
    level: 1,
    settings: {
      /* 사용자 설정 */
    },
  },
  farm: {
    plots: Array(9)
      .fill(null)
      .map((_, i) => ({
        id: `plot-${i}`,
        cropId: null,
        plantedAt: null,
        growthProgress: 0,
        isWatered: false,
      })),
    animals: [],
    inventory: [],
  },
  shop: {
    // 상점 초기 아이템 목록
  },
};
```

## 7. 보안 및 데이터 고려사항

1. **데이터 지속성**

   - 로컬 스토리지는 브라우저에 종속적이므로 데이터 백업 메커니즘 필요
   - 사용자에게 데이터 내보내기/가져오기 기능 제공

2. **보안**

   - 민감한 정보는 로컬 스토리지에 저장하지 않음
   - XSS 공격 방지를 위한 입력값 검증

3. **저장소 한계**
   - 로컬 스토리지는 도메인당 약 5-10MB 제한
   - 대용량 데이터 처리 방안 필요 시 IndexedDB로 확장 고려

## 8. 확장성 및 향후 계획

1. **오프라인 우선 전략**

   - Service Worker를 이용한 오프라인 지원
   - 오프라인 상태에서의 데이터 변경 사항 추적

2. **향후 백엔드 연동**

   - API 호출을 위한 추상화 레이어 유지
   - 백엔드 연동 시 마이그레이션 경로 확보

3. **데이터 동기화**
   - 향후 백엔드 연동 시 충돌 해결 전략
   - 낙관적 업데이트 구현

## 9. 배포 아키텍처 (초기 버전)

```
┌─────────────────────────────────────────────────────────────┐
│                      정적 파일 호스팅                       │
│  (GitHub Pages, Vercel, Netlify 등)                       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                   웹 애플리케이션                   │  │
│  │  (HTML, CSS, JavaScript, 에셋 파일)                 │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

```

### 9.1 배포 단계

1. 정적 파일 빌드 (`npm run build`)
2. 빌드 결과물을 정적 호스팅 서비스에 배포
3. (선택) 사용자 지정 도메인 연결

## 10. 기술 스택 (초기 버전)

### 프론트엔드

- React 18
- TypeScript
- Redux Toolkit (상태 관리)
- Tailwind CSS (스타일링)
- React Router (라우팅)
- Framer Motion (애니메이션)

### 데이터 관리

- 로컬 스토리지 (데이터 저장)
- IndexedDB (필요 시 대용량 데이터)
- Redux Persist (상태 유지)

### 개발 도구

- Vite (번들링 및 개발 서버)
- ESLint + Prettier (코드 품질)
- Jest + React Testing Library (테스트)
- GitHub Pages (호스팅)

### 향후 확장을 위한 고려사항

- 백엔드 API 연동을 위한 추상화 레이어
- 오프라인 우선 아키텍처
- 서비스 워커를 통한 오프라인 지원

## 11. 성능 최적화 전략

1. **코드 분할**

   - React.lazy()와 Suspense를 사용한 라우트 기반 코드 분할
   - 필요한 컴포넌트만 동적으로 로드

2. **이미지 최적화**

   - WebP 포맷 사용
   - Lazy loading 적용
   - 이미지 CDN 활용

3. **번들 최적화**

   - Tree-shaking 적용
   - 번들 분석 도구로 불필요한 의존성 제거

4. **캐싱 전략**
   - Service Worker를 통한 오프라인 지원
   - HTTP 캐시 헤더 최적화
