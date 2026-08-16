# cime-sdk 업데이트 기록

## 1.2.0 - 2026-08-16

### 추가

- `client.auth.getAuthorizationUrl()`을 추가해 최초 인증과 Scope 변경 후 재인증에 사용할 OAuth 동의 URL을 생성할 수 있습니다.
- `client.refresh()`를 추가해 Access Token, 교체된 Refresh Token, Scope를 SDK 상태에 함께 반영할 수 있습니다.
- `client.auth.revoke()`를 추가해 Access Token 또는 Refresh Token을 취소할 수 있습니다.
- OAuth 인증 URL, 토큰 갱신, 토큰 취소 동작을 검증하는 테스트를 추가했습니다.

### 변경

- 2026-08-13 씨미 OpenAPI 업데이트에 맞춰, 개발자 포탈에서 Scope를 변경한 경우 기존 사용자의 재동의가 필요하다는 내용을 문서화했습니다.
- Refresh Token이 갱신마다 교체되는 일회성 토큰임을 README와 API 문서에 명시했습니다.
- 공식 응답과 기존 호환성을 모두 지원하도록 `expiresIn` 타입을 `string | number`로 조정했습니다.
- 패키지 `exports`에서 `types` 조건을 우선하도록 순서를 조정했습니다.

### 수정

- WebSocket 자동 재연결에서 이미 사용된 Refresh Token을 다시 사용할 수 있던 문제를 수정했습니다.
- 토큰 취소 API처럼 성공 응답 본문이 없는 요청도 정상 처리하도록 HTTP 응답 처리를 보완했습니다.

## 1.1.1 - 2026-06-07

- 공개 API, 타입, WebSocket 클라이언트에 JSDoc을 보강했습니다.
- API 문서와 테스트 범위를 확장했습니다.
- GitHub 태그 기반 릴리스 워크플로를 추가했습니다.

## 1.1.0 - 2026-06-06

- Drops 캠페인 목록 조회 API를 추가했습니다.
- Drops 보상 청구 목록 조회 및 지급 상태 변경 API를 추가했습니다.
- 응원 후원(`CHEERING`) 이벤트와 `cheeringItems` 타입을 추가했습니다.
- Drops와 응원 후원에 대한 타입, 테스트, API 문서를 추가했습니다.

## 1.0.x - 2026-04-11 ~ 2026-04-13

- ci.me OpenAPI용 TypeScript SDK의 초기 버전을 공개했습니다.
- 사용자, 채널, 라이브, 채팅, 카테고리, 차단/추방, 세션 API 래퍼를 제공했습니다.
- WebSocket 기반 채팅, 후원, 구독 이벤트 클라이언트를 제공했습니다.
- CommonJS와 ES Modules 빌드, 타입 선언, 예제 코드를 제공했습니다.
- 인증 엔드포인트와 클라이언트 초기화 동작을 점진적으로 수정했습니다.
