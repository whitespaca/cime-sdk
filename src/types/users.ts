/**
 * 내 정보(채널) 조회 API의 응답 객체 인터페이스입니다.
 */
export interface CimeUser {
    /*
     * 채널의 고유 ID 
     */
    channelId: string;
    
    /*
     * 사용자의 채널 이름 (닉네임) 
     */
    channelName: string;
    
    /*
     * 채널 핸들 (고유 식별자 주소 등) 
     */
    channelHandle: string;
    
    /*
     * 채널 프로필 이미지 URL 
     */
    channelImageUrl: string;
}