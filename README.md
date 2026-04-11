# 🚀 cime-sdk

[![npm version](https://img.shields.io/npm/v/cime-sdk.svg)](https://www.npmjs.com/package/cime-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ci.me API를 위한 완벽한 객체 지향적 TypeScript SDK**입니다.
복잡한 REST API 호출과 WebSocket 연결, 그리고 번거로운 OAuth 토큰 관리를 매우 직관적이고 간단하게 해결해 줍니다.

---

## ✨ 주요 기능

* 🧱 **직관적인 객체 지향 설계**: `client.users.get()`, `client.chat.sendMessage()` 등 깔끔하게 구조화된 메서드를 제공합니다.
* 🔄 **자동 토큰 갱신 (Auto Refresh)**: 만료된 Access Token을 감지하고 Refresh Token을 사용해 백그라운드에서 자동으로 토큰을 갱신합니다.
* 📡 **강력한 실시간 이벤트 (WebSocket)**: 채팅, 후원, 구독 등의 실시간 이벤트를 완벽하게 타입핑된 상태로 손쉽게 수신할 수 있습니다.
* 🛡️ **100% TypeScript**: 모든 API 응답과 이벤트 페이로드에 대한 완벽한 타입 추론 및 자동 완성을 지원하여 런타임 에러를 방지합니다.

---

## 📦 설치

```bash
# npm
npm install cime-sdk

# yarn
yarn add cime-sdk

# pnpm
pnpm add cime-sdk
```

---

## 사용법

### CimeClient (초기화)

✅ 필수 설정

```javascript
const { CimeClient } = require('cime-sdk');
// ES Modules: import { CimeClient } from 'cime-sdk';

const client = new CimeClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    accessToken: process.env.ACCESS_TOKEN, // 선택 사항
});
```

[https://developers.ci.me](https://developers.ci.me)
cime 개발자 센터에서 발급받은 Client ID와 Secret으로 초기화합니다.

dotenv와 함께 사용하는 것을 매우 권장합니다.

---

## 🤝 기여하기

버그 리포트, 기능 제안, PR(Pull Request)은 언제나 환영합니다! 이슈 트래커를 통해 남겨주세요.

## 📄 라이선스

이 프로젝트는 **MIT 라이선스**에 따라 배포됩니다. 자유롭게 사용 및 수정할 수 있습니다.
