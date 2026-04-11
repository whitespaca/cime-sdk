import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { CimeClient } from 'cime-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const DOMAIN = process.env.DOMAIN || 'localhost';

// db.json 파일 경로
const DB_FILE_PATH = path.join(process.cwd(), 'db.json');

// 클라이언트 자격 증명 (환경 변수로 관리하는 것을 권장합니다)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// 초기 CimeClient 인스턴스 생성
let client = new CimeClient({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
});

// DB 데이터를 읽어오는 헬퍼 함수
async function getDbData() {
    try {
        const fileContent = await fs.readFile(DB_FILE_PATH, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error: any) {
        if (error.code !== 'ENOENT') throw error;
        return {}; // 파일이 없으면 빈 객체 반환
    }
}

// ====================================================================
// 🤖 봇 실행 함수
// ====================================================================
async function runBot(tokenData: any) {
    try {
        // "이미 가지고 있는 Access Token으로 초기화"
        // 서버 재시작 시 저장된 토큰을 활용해 클라이언트를 다시 셋업
        /*client = new CimeClient({
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            accessToken: tokenData.accessToken, 
            scopes: tokenData.scope.split(' '),
        });*/

        const me = await client.users.get();
        console.log(`\n✅ [봇 시작] ${me.channelName}님의 채널에 연결되었습니다! (ID: ${me.channelId})\n`);

        const liveStatus = await client.live.getLiveStatus(me.channelId);
        console.log(`📺 현재 라이브 상태: ${liveStatus.isLive ? '방송 중 🟢' : '오프라인 🔴'}`);

        // db에서 불러온 refreshToken을 연결해 소켓 갱신 기능을 활성화합니다.
        const eventClient = client.createEventClient({
            type: 'USER',
            // refreshToken: tokenData.refreshToken, 
        });

        // 라이프사이클 이벤트 리스너 등록
        eventClient.on('connected', () => console.log('📡 웹소켓 서버에 연결되었습니다.'));
        eventClient.on('disconnected', () => console.log('🔌 웹소켓 연결이 종료되었습니다.'));
        eventClient.on('error', (err) => console.error('❌ 웹소켓 에러:', err));

        // [실시간 채팅 수신]
        eventClient.on('CHAT', async (data: any) => {
            console.log(`💬 [채팅] ${data.profile.nickname}: ${data.content}`);

            // [간단한 챗봇 기능]
            if (data.content === '!ping') {
                await client.chat.sendMessage({ message: 'pong! 🏓' });
                console.log('🤖 [봇 응답] pong! 을 전송했습니다.');
            }
        });

        // [실시간 후원 수신]
        eventClient.on('DONATION', (data: any) => {
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
        console.error('🚨 봇 실행 중 오류 발생 (토큰이 만료되었을 수 있습니다):', error);
    }
}

// ====================================================================
// 🌐 Express 라우터 및 서버 설정
// ====================================================================

// OAuth 콜백 라우트
app.get('/oauth/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;
    
    if (!code) {
        return res.status(400).send('인증 코드가 없습니다.');
    }

    try {
        // SDK를 사용해 code로 토큰 정보 발급받기
        const tokenResponse = await client.authorize(code);
        
        // db.json 읽고 쓰기
        let dbData = {
            botToken: tokenResponse,
            updatedAt: new Date().toISOString()
        };

        await fs.writeFile(DB_FILE_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
        console.log('💾 새로운 인증 토큰이 db.json에 저장되었습니다.');
        
        res.send('인증 성공! 창을 닫아도 됩니다. 서버 콘솔을 확인해주세요.');

        // 인증 성공 후 즉시 봇 실행
        runBot(tokenResponse);
    } catch (error) {
        console.error('❌ OAuth 인증 또는 DB 저장 중 오류 발생:', error);
        res.status(500).send('인증 실패');
    }
});

// 서버 시작
app.listen(PORT, async () => {
    console.log(`🚀 Server is running on http://${DOMAIN}:${PORT}`);
    console.log(`🔑 OAuth 인증을 위해 브라우저에서 다음 URL로 이동하세요:`);
    console.log(`👉 https://ci.me/auth/openapi/account-interlock?clientId=${CLIENT_ID}&redirectUri=http://${DOMAIN}:${PORT}/oauth/callback&state=${rand(100000, 999999)}`)
    
    // 서버가 켜질 때 db.json에 기존 토큰이 있는지 확인
    /*const dbData = await getDbData();
    
    if (dbData && dbData.botToken) {
        console.log('📂 db.json에서 기존 토큰을 발견했습니다. 봇을 자동으로 시작합니다...');
        runBot(dbData.botToken);
    } else {
        console.log(`⚠️ 저장된 봇 토큰이 없습니다. 브라우저에서 인증을 진행해주세요.`);
        console.log(`👉 https://ci.me/auth/openapi/account-interlock?clientId=${CLIENT_ID}&redirectUri=http://${DOMAIN}:${PORT}/oauth/callback&state=${rand(100000, 999999)}`);
    }*/
});

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}