# cime-sdk

![npm version](https://img.shields.io/npm/v/cime-sdk?color=blue&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)
![License](https://img.shields.io/npm/l/cime-sdk?style=flat-square)

ci.me OpenAPI를 위한 강력하고 직관적인 비공식 Node.js/TypeScript SDK입니다.
REST API 호출부터 실시간 WebSocket 이벤트(채팅, 후원, 구독) 처리까지, 복잡한 통신 과정을 완벽하게 추상화하여 개발자 경험(DX)을 극대화했습니다.

## ✨ 주요 기능 (Features)

- **🚀 완벽한 TypeScript 지원**: 100% TypeScript로 작성되어 IDE에서 모든 API 응답과 WebSocket 이벤트 페이로드에 대한 완벽한 자동완성을 제공합니다.
- **📡 견고한 WebSocket 클라이언트**: 세션 생성, PING 유지, 10분 유휴 타임아웃 방지, 예기치 않은 끊김 시 **자동 재연결 및 구독 복구** 로직이 내장되어 있습니다.
- **🛡️ 안정적인 HTTP 통신**: `axios-retry` 기반으로 일시적인 네트워크 오류 및 서버(5xx) 에러 발생 시 지수 백오프(Exponential Backoff) 전략으로 자동 재시도합니다.
- **⚡ Fail-fast 에러 핸들링**: 런타임 이전에 파라미터 누락 등을 검사하고, 직관적인 커스텀 에러(`CimeAPIError`)를 던져 디버깅을 돕습니다.
- **🛠️ 편의성 유틸리티**: 이모티콘 토큰을 렌더링 가능한 HTML(`<img>` 태그)로 즉시 치환해 주는 유틸리티 함수를 제공합니다.

---

## 📦 설치 (Installation)

```bash
npm install cime-sdk
yarn add cime-sdk
pnpm add cime-sdk
````

---

## 🚀 빠른 시작 (Quick Start)

### 1\. REST API 사용하기

발급받은 `Access Token` 또는 `Client ID/Secret`을 사용하여 클라이언트를 초기화합니다.

```typescript
import { CimeClient } from 'cime-sdk';

// 클라이언트 초기화
const client = new CimeClient({
  accessToken: 'YOUR_ACCESS_TOKEN', // 인증이 필요한 API 호출 시 필수
  clientId: 'YOUR_CLIENT_ID',       // 공개 API 호출 시 사용
  clientSecret: 'YOUR_CLIENT_SECRET'
});

async function run() {
  try {
    // 내 채널 정보 조회
    const me = await client.users.getMe();
    console.log(`안녕하세요, ${me.channelName}님!`);

    // 현재 진행 중인 라이브 목록 조회 (커서 페이지네이션)
    const lives = await client.live.getLives({ size: 10 });
    lives.data.forEach(live => console.log(live.liveTitle));

  } catch (error) {
    console.error('API 호출 실패:', error);
  }
}

run();
```

### 2\. 실시간 이벤트 수신 (WebSocket)

채팅, 후원, 구독 이벤트를 실시간으로 수신할 수 있습니다. `CimeEventClient`는 세션 발급, 소켓 연결, 주기적인 PING 전송을 자동으로 관리합니다.

```typescript
import { CimeClient, renderChatEmojisToHTML } from 'cime-sdk';

const client = new CimeClient({ accessToken: 'YOUR_ACCESS_TOKEN' });

async function startBot() {
  // 이벤트 클라이언트 생성 (USER 또는 CLIENT 세션 선택)
  const eventClient = client.createEventClient({
    type: 'USER',
    // (선택) 재연결 시 토큰이 만료되었다면 자동으로 갱신하는 훅
    onTokenRefresh: async () => {
      // 예: DB에서 새 토큰을 가져오거나 auth API로 갱신 후 세팅
      // client.setAccessToken('NEW_TOKEN');
    }
  });

  // 이벤트 핸들러 등록 (IDE에서 data 타입이 완벽하게 자동 추론됩니다!)
  eventClient.on('CHAT', (data) => {
    // 내장 유틸리티를 사용하여 이모티콘 토큰(:token:)을 <img> 태그로 변환
    const htmlMessage = renderChatEmojisToHTML(data);
    console.log(`[채팅] ${data.profile.nickname}: ${htmlMessage}`);
  });

  eventClient.on('DONATION', (data) => {
    console.log(`[후원] ${data.donatorNickname}님이 ${data.payAmount}빔을 후원하셨습니다!`);
  });

  // WebSocket 연결 시작 및 이벤트 구독
  await eventClient.connect();
  await eventClient.subscribe('CHAT');
  await eventClient.subscribe('DONATION');
  
  console.log('실시간 이벤트 구독이 시작되었습니다.');
}

startBot();
```

---

## 📚 API 레퍼런스

`CimeClient` 인스턴스는 도메인별로 분리된 하위 API 모듈을 제공합니다.

- `client.auth`: 토큰 발급, 갱신, 취소 (`getToken`, `revokeToken`)
- `client.users`: 사용자 정보 조회 (`getMe`)
- `client.channels`: 채널 정보, 팔로워, 구독자, 관리자 목록 조회
- `client.live`: 라이브 목록 조회, 설정, 스트림 키 조회, 라이브 상태 확인
- `client.chat`: 채팅 설정 조회/변경, 메시지 전송, 공지 등록
- `client.categories`: 카테고리 검색
- `client.restrict`: 사용자 추방, 추방 해제, 추방자 목록 조회
- `client.sessions`: 세션 수동 관리 및 구독 제어

---

## 🛠️ 에러 핸들링

API 요청 실패 시 라이브러리는 `CimeAPIError` 객체를 던집니다. 이를 통해 서버에서 응답한 정확한 상태 코드와 메시지를 확인할 수 있습니다.

```typescript
import { CimeAPIError } from 'cime-sdk';

try {
  await client.chat.sendMessage({ message: 'Hello' });
} catch (error) {
  if (error instanceof CimeAPIError) {
    console.error(`API 에러 발생 [${error.statusCode}]: ${error.message}`);
    // 예: API 에러 발생 [401]: Insufficient scope: WRITE:LIVE_CHAT required
  } else {
    console.error('알 수 없는 네트워크 오류:', error);
  }
}
```

---

## 📜 라이선스 (License)

이 프로젝트는 [MIT License](LICENSE)를 따릅니다.
