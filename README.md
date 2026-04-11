# 🚀 cime-sdk

[![npm version](https://img.shields.io/npm/v/cime-sdk.svg)](https://www.npmjs.com/package/cime-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![npm](https://img.shields.io/npm/dt/cime-sdk)

**ci.me API를 위한 TypeScript SDK**입니다.
Node.js 환경만을 지원합니다.

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

이외 API에 대한 사용법은 [APIDocs](APIDocs.md)를 참고해주세요.

---

## 🤝 기여하기

버그 리포트, 기능 제안, PR(Pull Request)은 언제나 환영합니다! Issue Tracker를 통해 남겨주세요.

## 📄 라이선스

이 프로젝트는 [MIT LICENSE](LICENSE)에 따라 배포됩니다. 자유롭게 사용 및 수정할 수 있습니다.
