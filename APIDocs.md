# cime-sdk API Documents

이 문서는 `cime-sdk`에서 제공하는 TypeScript API 사용 방법을 정리합니다.

공식 OpenAPI 문서:

- https://developers.ci.me/docs/overview
- https://developers.ci.me/docs/updates

## Client

```ts
import { CimeClient } from 'cime-sdk';

const client = new CimeClient({
    clientId: process.env.CIME_CLIENT_ID,
    clientSecret: process.env.CIME_CLIENT_SECRET,
    accessToken: process.env.CIME_ACCESS_TOKEN,
    refreshToken: process.env.CIME_REFRESH_TOKEN,
    scopes: ['READ:USER', 'WRITE:LIVE_CHAT'],
});
```

`accessToken` 또는 `clientId`와 `clientSecret` 쌍이 필요합니다. OAuth 권한이 필요한 API는 `scopes` 배열에 해당 권한이 포함되어 있어야 SDK가 요청 전 검증을 통과합니다.

## auth

### `client.auth.get(code)`

Authorization Code로 토큰을 발급합니다.

```ts
const token = await client.auth.get('authorization-code');
```

반환값:

- `accessToken`
- `refreshToken`
- `expiresIn`
- `tokenType`
- `scope`

### `client.auth.refresh(refreshToken)`

Refresh Token으로 새 Access Token을 발급합니다.

```ts
const token = await client.auth.refresh('refresh-token');
```

### `client.authorize(code)`

Authorization Code로 토큰을 발급한 뒤, SDK 인스턴스의 `accessToken`, `refreshToken`, `scopes`를 갱신합니다.

```ts
const token = await client.authorize('authorization-code');
```

## users

### `client.users.get()`

필요 Scope: `READ:USER`

현재 Access Token에 연결된 사용자 채널 정보를 조회합니다.

```ts
const me = await client.users.get();
```

반환값:

- `channelId`
- `channelName`
- `channelHandle`
- `channelImageUrl`

## channels

### `client.channels.getChannels(channelIds)`

Public API. 채널 ID 목록으로 채널 정보를 조회합니다.

```ts
const channels = await client.channels.getChannels(['channel-id-1', 'channel-id-2']);
```

반환값: `CimeDataList<CimeChannelInfo>`

- `data[].channelId`
- `data[].channelName`
- `data[].channelHandle`
- `data[].channelImageUrl`
- `data[].channelDescription`
- `data[].followerCount`

### `client.channels.getFollowers(params)`

필요 Scope: `READ:CHANNEL`

인증된 사용자 채널의 팔로워 목록을 조회합니다.

```ts
const followers = await client.channels.getFollowers({ page: 0, size: 20 });
```

### `client.channels.getSubscribers(params)`

필요 Scope: `READ:SUBSCRIPTION`

인증된 사용자 채널의 구독자 목록을 조회합니다.

```ts
const subscribers = await client.channels.getSubscribers({
    page: 0,
    size: 30,
    sort: 'RECENT',
});
```

### `client.channels.getManagers()`

필요 Scope: `READ:CHANNEL`

인증된 사용자 채널의 관리자 목록을 조회합니다.

```ts
const managers = await client.channels.getManagers();
```

## live

### `client.live.getLives(params)`

Public API. 현재 진행 중인 라이브 목록을 조회합니다.

```ts
const lives = await client.live.getLives({ size: 20 });
```

반환값: `CimeCursorList<CimeLive>`

- `data[]`
- `page.next`

### `client.live.getSettings()`

필요 Scope: `READ:LIVE_STREAM_SETTINGS`

인증된 사용자 채널의 라이브 설정을 조회합니다.

```ts
const settings = await client.live.getSettings();
```

### `client.live.updateSettings(params)`

필요 Scope: `WRITE:LIVE_STREAM_SETTINGS`

라이브 설정을 변경합니다. 전달한 필드만 업데이트됩니다.

```ts
await client.live.updateSettings({
    defaultLiveTitle: '오늘의 방송',
    tags: ['game', 'live'],
    categoryId: 'category-id',
});
```

### `client.live.getStreamKey()`

필요 Scope: `READ:LIVE_STREAM_KEY`

스트림 키를 조회합니다.

```ts
const { streamKey } = await client.live.getStreamKey();
```

### `client.live.getLiveStatus(channelId)`

특정 채널의 라이브 상태를 조회합니다.

```ts
const status = await client.live.getLiveStatus('channel-id');
```

## chat

### `client.chat.getSettings()`

필요 Scope: `READ:LIVE_CHAT_SETTINGS`

채팅 설정을 조회합니다.

```ts
const settings = await client.chat.getSettings();
```

### `client.chat.updateSettings(params)`

필요 Scope: `WRITE:LIVE_CHAT_SETTINGS`

채팅 설정을 변경합니다.

```ts
await client.chat.updateSettings({
    chatEmojiMode: true,
    chatSlowModeSec: 10,
    chatAllowedGroup: 'ALL',
});
```

### `client.chat.sendMessage(params)`

필요 Scope: `WRITE:LIVE_CHAT`

라이브 채팅 메시지를 전송합니다. `senderType`은 2026-04-10 업데이트에서 추가된 필드입니다.

```ts
const message = await client.chat.sendMessage({
    message: '안녕하세요',
    senderType: 'APP',
});
```

`senderType`:

- `APP`: 애플리케이션 소유자 명의로 전송
- `USER`: 인증된 사용자 본인 명의로 전송

반환값:

- `messageId`

### `client.chat.registerNotice(params)`

필요 Scope: `WRITE:LIVE_CHAT_NOTICE`

채팅 공지를 등록합니다. `message` 또는 `messageId` 중 하나가 필요합니다.

```ts
await client.chat.registerNotice({ message: '방송 공지입니다.' });
await client.chat.registerNotice({ messageId: 'message-id' });
```

## categories

### `client.categories.searchCategories(params)`

Public API. 라이브 카테고리를 검색합니다.

```ts
const categories = await client.categories.searchCategories({
    keyword: 'game',
    size: 20,
});
```

반환값:

- `data[].categoryId`
- `data[].categoryType`
- `data[].categoryValue`
- `data[].posterImageUrl`

## restrict

### `client.restrict.restrictUser(params)`

필요 Scope: `WRITE:USER_BLOCK`

사용자를 추방합니다.

```ts
await client.restrict.restrictUser({ targetChannelId: 'target-channel-id' });
```

### `client.restrict.getRestrictedUsers(params)`

필요 Scope: `READ:USER_BLOCK`

추방 사용자 목록을 조회합니다.

```ts
const restrictedUsers = await client.restrict.getRestrictedUsers({
    size: 20,
});
```

### `client.restrict.unrestrictUser(params)`

필요 Scope: `WRITE:USER_BLOCK`

사용자 추방을 해제합니다.

```ts
await client.restrict.unrestrictUser({ targetChannelId: 'target-channel-id' });
```

## drops

드롭스 API는 2026-05-15 공식 업데이트에서 추가된 기능입니다.

### `client.drops.getCampaigns(params)`

본인 애플리케이션이 소유한 드롭스 캠페인 목록을 조회합니다.

```ts
const campaigns = await client.drops.getCampaigns({
    page: 0,
    size: 20,
    state: ['ACTIVE', 'CLAIMABLE'],
});
```

`state`는 문자열 또는 배열로 전달할 수 있습니다. 배열은 SDK가 `ACTIVE,CLAIMABLE` 형태로 변환합니다.

반환값:

- `data[].campaignId`
- `data[].state`
- `data[].title`
- `data[].description`
- `data[].imageUrl`
- `data[].externalUrl`
- `data[].startAt`
- `data[].endAt`
- `data[].claimAvailableAt`
- `data[].rewards[]`

캠페인 상태:

- `DRAFT`
- `PENDING`
- `APPROVED`
- `ACTIVE`
- `PAUSED`
- `CLAIMABLE`
- `COMPLETED`
- `CANCELLED`
- `REJECTED`

### `client.drops.getRewardClaims(params)`

드롭스 보상 지급 요청 내역을 조회합니다.

```ts
const claims = await client.drops.getRewardClaims({
    page: 0,
    size: 100,
    fulfillmentState: 'CLAIMED',
});
```

사용 가능한 필터:

- `page`
- `size`
- `claimId`
- `channelId`
- `campaignId`
- `categoryId`
- `fulfillmentState`

`claimId`는 문자열 또는 문자열 배열로 전달할 수 있습니다. 배열은 SDK가 쉼표 구분 문자열로 변환합니다.

반환값:

- `data[].claimId`
- `data[].campaignId`
- `data[].rewardId`
- `data[].categoryId`
- `data[].categoryName`
- `data[].channelId`
- `data[].fulfillmentState`
- `data[].claimedDate`
- `data[].updatedDate`

### `client.drops.updateRewardClaims(params)`

드롭스 보상 지급 상태를 변경합니다.

```ts
const result = await client.drops.updateRewardClaims({
    claimIds: ['claim-id-1', 'claim-id-2'],
    fulfillmentState: 'FULFILLED',
});
```

`fulfillmentState`:

- `CLAIMED`
- `FULFILLED`

반환 상태:

- `SUCCESS`
- `INVALID_ID`
- `NOT_FOUND`
- `UNAUTHORIZED`
- `UPDATE_FAILED`

## WebSocket Events

### `client.createEventClient(options)`

실시간 이벤트를 수신하는 WebSocket 클라이언트를 생성합니다.

```ts
const eventClient = client.createEventClient({
    type: 'USER',
    refreshToken: process.env.CIME_REFRESH_TOKEN,
});

eventClient.on('CHAT', (data) => {
    console.log(data.profile.nickname, data.content);
});

eventClient.on('DONATION', (data) => {
    console.log(data.donationType, data.payAmount);
});

eventClient.on('SUBSCRIPTION', (data) => {
    console.log(data);
});

await eventClient.connect();
await eventClient.subscribe('CHAT');
await eventClient.subscribe('DONATION');
await eventClient.subscribe('SUBSCRIPTION');
```

지원 이벤트:

- `CHAT`
- `DONATION`
- `SUBSCRIPTION`
- `connected`
- `disconnected`
- `error`
- `reconnecting`

### DONATION 이벤트

후원 이벤트는 `CHAT`, `VIDEO`, `CHEERING` 타입을 지원합니다. `CHEERING`은 2026-04-22 공식 업데이트에서 추가된 응원 후원 타입입니다.

```ts
eventClient.on('DONATION', (data) => {
    if (data.donationType === 'CHEERING') {
        for (const item of data.cheeringItems ?? []) {
            console.log(item.type, item.cnt, item.imageUrl);
        }
    }
});
```

공통 필드:

- `donationType`
- `channelId`
- `donatorChannelId`
- `donatorNickname`
- `donatorBadges`
- `payAmount`
- `donationText`
- `emojis`
- `cheeringItems`

`cheeringItems[]` 필드:

- `cnt`
- `type`
- `skinType`
- `amount`
- `imageUrl`
- `overlayImageUrl`

## Utility

### `renderChatEmojisToHTML(data, className?)`

채팅 메시지의 이모티콘 토큰을 `<img>` 태그로 변환합니다.

```ts
import { renderChatEmojisToHTML } from 'cime-sdk';

const html = renderChatEmojisToHTML({
    content: '안녕하세요 :smile:',
    emojis: {
        ':smile:': 'https://example.com/smile.webp',
    },
});
```
