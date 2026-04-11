# 📚 API Documents

---

## auth

✅ Public API

    let token = await client.auth.get("인가 코드(Code) 값");
    console.log(token);

**Return**

- accessToken
- refreshToken
- expiresIn
- tokenType

✅ Public API

    let token = await client.auth.refresh("refreshToken 값");
    console.log(token);

**Return**

- accessToken
- refreshToken
- expiresIn
- tokenType

---

## users

✅ Scope: READ:USER

    let me = await client.users.get();
    console.log(me);

**Return**

- channelId
- channelName
- channelImageUrl
- verifiedMark
- followerCount

---

## channels

✅ Public API

    let channels = await client.channels.getChannels(["channelID1", "channelID2"]);
    console.log(channels);

**Return**

- data
  - 0
    - channelId
    - channelName
    - followerCount
    - channelDescription
  - 1
  - 2
- page

✅ Scope: READ:SUBSCRIPTION

    let subscribers = await client.channels.getSubscribers({ size: 50 });
    console.log(subscribers);

**Return**

- data
  - 0
    - user
      - channelId
      - channelName
    - subscribedAt
  - 1
- page

---

## live

✅ Public API

    let lives = await client.live.getLives();
    console.log(lives);

**Return**

- data
  - 0
    - liveId
    - liveTitle
    - concurrentViewers
    - category
  - 1
- next

✅ Scope: READ:LIVE_STREAM_KEY

    let streamKey = await client.live.getStreamKey();
    console.log(streamKey);

**Return**

- streamKey

---

## chat

✅ Scope: WRITE:LIVE_CHAT

    let msg = await client.chat.sendMessage({ message: "안녕하세요!" });
    console.log(msg);

**Return**

- messageId

✅ Scope: WRITE:LIVE_CHAT_NOTICE

    await client.chat.registerNotice({ notice: "방송 공지사항입니다." });

---

## restrict

✅ Scope: READ:USER_BLOCK

    let restrictedUsers = await client.restrict.getRestrictedUsers();
    console.log(restrictedUsers);

**Return**

- data
  - 0
    - targetId
    - targetName
    - restrictedAt
  - 1
- next

✅ Scope: WRITE:USER_BLOCK

    await client.restrict.restrictUser({ targetId: "차단할_channelID" });

    await client.restrict.unrestrictUser({ targetId: "차단해제할_channelID" });

---

## Websocket (CimeEventClient)

✅ Access Token

    let eventClient = client.createEventClient({ 
        type: "USER",
        refreshToken: process.env.REFRESH_TOKEN // 토큰 자동 갱신용 (권장)
    });

    eventClient.on("CHAT", (data) => {
        console.log(`[${data.profile.nickname}]: ${data.content}`);
    });

    await eventClient.connect();
    await eventClient.subscribe("CHAT");
    await eventClient.subscribe("DONATION");

**Supported Events**

- CHAT
- DONATION
- SUBSCRIPTION
- connected
- disconnected
- error
- reconnecting
