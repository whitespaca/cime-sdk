import { CimeClient } from 'cime-sdk';

/**
 * [초기 설정]
 * 발급받은 Client ID와 Secret, 그리고 이미 가지고 있는 Access Token으로 초기화합니다.
 */
const client = new CimeClient({
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    accessToken: 'YOUR_ACCESS_TOKEN', // 이미 발급된 토큰이 있다면 바로 사용
});

async function runBot() {
    try {
        // ====================================================================
        // 1. REST API 사용 예시 (내 채널 정보 조회)
        // ====================================================================
        const me = await client.users.get();
        console.log(`\n✅ [봇 시작] ${me.channelName}님의 채널에 연결되었습니다! (ID: ${me.channelId})\n`);

        const liveStatus = await client.live.getLiveStatus(me.channelId);
        console.log(`📺 현재 라이브 상태: ${liveStatus.isLive ? '방송 중 🟢' : '오프라인 🔴'}`);

        // ====================================================================
        // 2. 실시간 이벤트 수신 (WebSocket)
        // ====================================================================
        
        // 이벤트 클라이언트를 생성합니다. 
        // refreshToken을 넘겨주면 SDK가 소켓 재연결 시 알아서 토큰을 갱신합니다!
        const eventClient = client.createEventClient({
            type: 'USER',
            refreshToken: 'YOUR_REFRESH_TOKEN', 
        });

        // 라이프사이클 이벤트 리스너 등록
        eventClient.on('connected', () => console.log('📡 웹소켓 서버에 연결되었습니다.'));
        eventClient.on('disconnected', () => console.log('🔌 웹소켓 연결이 종료되었습니다.'));
        eventClient.on('error', (err) => console.error('❌ 웹소켓 에러:', err));

        // [실시간 채팅 수신] 
        // IDE에서 data 파라미터에 마우스를 올리면 CimeChatEventData 타입이 완벽히 자동 추론됩니다.
        eventClient.on('CHAT', async (data) => {
            console.log(`💬 [채팅] ${data.profile.nickname}: ${data.content}`);

            // [간단한 챗봇 기능] 특정 명령어에 반응하기
            if (data.content === '!ping') {
                await client.chat.sendMessage({ message: 'pong! 🏓' });
                console.log('🤖 [봇 응답] pong! 을 전송했습니다.');
            }
        });

        // [실시간 후원 수신]
        eventClient.on('DONATION', (data) => {
            const donator = data.donatorNickname || '익명의 천사';
            console.log(`\n🎉 [후원] ${donator}님이 ${data.payAmount}빔을 후원하셨습니다!`);
            console.log(`   📝 메시지: ${data.donationText}\n`);
        });

        // 연결 및 이벤트 구독 시작
        await eventClient.connect();
        await eventClient.subscribe('CHAT');
        await eventClient.subscribe('DONATION');
        
        console.log('👀 채팅 및 후원 이벤트 구독 중...');

    } catch (error) {
        console.error('🚨 봇 실행 중 치명적 오류 발생:', error);
    }
}

// 봇 실행
runBot();

// ============================================================================
// 💡 [참고] OAuth 콜백 라우트 예시 (Express.js 등 웹 서버 환경)
// 개발자가 복잡한 토큰 발급 로직을 구현할 필요 없이 `authorize` 하나로 끝납니다.
// ============================================================================
/*
app.get('/oauth/callback', async (req, res) => {
    const code = req.query.code as string;
    try {
        // 인가 코드로 Access / Refresh Token을 발급받고 자동으로 client에 적용합니다.
        const tokenResponse = await client.authorize(code);
        
        // 발급된 리프레시 토큰은 DB 등에 저장하여 추후 자동 갱신에 사용하세요!
        // db.save('user_refresh_token', tokenResponse.refreshToken);
        
        res.send('인증 성공! 이제 봇이 동작합니다.');
    } catch (error) {
        res.status(500).send('인증 실패');
    }
});
*/