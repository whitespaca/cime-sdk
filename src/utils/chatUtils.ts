import { CimeChatEventData } from '../types/chat';

/**
 * 채팅 메시지 내의 이모티콘 토큰을 <img> 태그로 변환합니다.
 * 따로 UI를 만드실 계획이 아니시라면, 별 쓸모는 없습니다.
 * @param data 채팅 이벤트 데이터 (content, emojis)
 * @param className <img> 태그에 부여할 CSS 클래스명 (기본값: 'cime-emoji')
 * @returns 변환된 HTML 문자열
 */
export function renderChatEmojisToHTML(
    data: Pick<CimeChatEventData, 'content' | 'emojis'>,
    className: string = 'cime-emoji'
): string {
    if (!data.emojis || Object.keys(data.emojis).length === 0) {
        return data.content;
    }

    let htmlMessage = data.content;

    for (const [token, imageUrl] of Object.entries(data.emojis)) {
        // 1. 토큰 내의 정규식 특수문자 안전하게 이스케이프 처리
        const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedToken, 'g');

        // 2. replace의 두 번째 인자로 문자열 대신 '콜백 함수'를 사용하여
        // '$$' 기호가 단일 '$'로 치환되는 JavaScript 고유의 버그를 방지합니다.
        htmlMessage = htmlMessage.replace(regex, () => {
            return `<img src="${imageUrl}" alt="${token}" class="${className}" />`;
        });
    }

    return htmlMessage;
}