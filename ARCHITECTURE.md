# PomoFarm 아키텍처 설계

## 1. 시스템 개요

PomoFarm은 포모도로 타이머와 농장 시뮬레이션을 결합한 웹 기반 생산성 애플리케이션입니다. React + TypeScript로 프론트엔드를, Node.js + Express로 백엔드를 구축하며, MongoDB를 데이터베이스로 사용합니다.

## 2. 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                      클라이언트 (React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   타이머    │  │    농장     │  │      상점       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│           │              │                  │             │
└───────────┼──────────────┼──────────────────┼─────────────┘
            │              │                  │
            ▼              ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  상태 관리 (Redux Toolkit)                  │
└───────────────────────────────┬────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     API 클라이언트 (Axios)                   │
└───────────────────────────────┬────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      백엔드 (Node.js)                       │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │  인증/인가  │  │   비즈니스 로직  │  │  데이터 액세스 │  │
│  └─────────────┘  └─────────────────┘  └──────┬───────┘  │
│                               │                 │          │
└───────────────────────────────┼─────────────────┼──────────┘
                                ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                       MongoDB Atlas                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐  │
│  │  사용자 데이터  │  │   농장 상태    │  │  상점 데이터 │  │
│  └─────────────────┘  └─────────────────┘  └──────────┘  │
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

### 3.2 백엔드

#### 3.2.1 API 엔드포인트
- **/api/auth**: 인증 관련 엔드포인트
- **/api/timer**: 타이머 관련 엔드포인트
- **/api/farm**: 농장 관리 엔드포인트
- **/api/shop**: 상점 및 가챠 엔드포인트
- **/api/user**: 사용자 데이터 엔드포인트

#### 3.2.2 서비스 레이어
- **TimerService**: 타이머 로직 처리
- **FarmService**: 농장 로직 처리
- **GachaService**: 가챠 로직 처리
- **UserService**: 사용자 데이터 처리

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
  type: 'crop' | 'animal' | 'decoration';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
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
  mode: 'focus' | 'shortBreak' | 'longBreak';
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

## 6. API 설계

### 6.1 인증 API
- `POST /api/auth/register`: 회원가입
- `POST /api/auth/login`: 로그인
- `GET /api/auth/me`: 현재 사용자 정보 조회

### 6.2 타이머 API
- `POST /api/timer/start`: 타이머 시작
- `POST /api/timer/pause`: 타이머 일시정지
- `POST /api/timer/complete`: 타이머 완료 (보상 지급)

### 6.3 농장 API
- `GET /api/farm`: 농장 상태 조회
- `POST /api/farm/plant`: 작물 심기
- `POST /api/farm/harvest`: 작물 수확
- `POST /api/farm/feed`: 동물에게 먹이주기

### 6.4 상점 API
- `GET /api/shop/items`: 상점 아이템 목록 조회
- `POST /api/shop/buy`: 아이템 구매
- `POST /api/shop/gacha`: 가챠 돌리기

## 7. 보안 고려사항

1. **인증/인가**
   - JWT 기반 인증
   - HTTPS 통신
   - 비밀번호 해싱 (bcrypt)

2. **데이터 검증**
   - 입력값 검증 (express-validator)
   - NoSQL 인젝션 방지

3. **보안 헤더**
   - Helmet.js 미들웨어 사용
   - CORS 정책 설정

## 8. 확장성 고려사항

1. **캐싱 전략**
   - Redis를 사용한 세션 관리
   - 자주 접근하는 데이터 캐싱

2. **배치 처리**
   - 농장 자동화를 위한 배치 작업
   - 오프라인 동기화 지원

3. **모니터링**
   - 로깅 시스템
   - 성능 모니터링 (Prometheus + Grafana)

## 9. 배포 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      클라이언트 (Vercel)                    │
└───────────────────────────────┬────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (Nginx)                    │
└───────────────────────────────┬────────────────────────────┘
                                │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌────────────────┐    ┌────────────────┐
│  API 서버     │    │  인증 서버     │    │  웹소켓 서버   │
│  (Node.js)    │    │  (Node.js)     │    │  (Socket.io)   │
└───────┬───────┘    └────────┬───────┘    └────────┬───────┘
        │                      │                      │
        └──────────┬───────────┼──────────────────────┘
                   │           │
                   ▼           ▼
          ┌───────────────────────────────────┐
          │            MongoDB               │
          │  ┌─────────┐      ┌─────────┐   │
          │  │  User   │      │  Farm   │   │
          │  └─────────┘      └─────────┘   │
          └───────────────────────────────────┘
```

## 10. 기술 스택

### 프론트엔드
- React 18
- TypeScript
- Redux Toolkit
- Tailwind CSS
- React Router
- Axios
- Framer Motion (애니메이션)

### 백엔드
- Node.js
- Express
- MongoDB + Mongoose
- Socket.io
- JWT
- Bcrypt

### 개발 도구
- ESLint + Prettier
- Jest + React Testing Library
- GitHub Actions (CI/CD)
- Docker

### 인프라
- Vercel (프론트엔드 호스팅)
- AWS EC2 (백엔드 호스팅)
- MongoDB Atlas (데이터베이스)
- Redis (캐싱)

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
