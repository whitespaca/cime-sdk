import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { SessionsAPI } from '../api/sessions';
import { CimeEventClientOptions, CimeEventPayload } from '../types';
import { CimeChatEventData } from '../types/chat';
import { CimeDonationEventData } from '../types/donation';
import { CimeSubscriptionEventData } from '../types/subscription';

export type CimeLiveEventName = 'CHAT' | 'DONATION' | 'SUBSCRIPTION';

export declare interface CimeEventClient {
    on(event: 'CHAT', listener: (data: CimeChatEventData) => void): this;
    on(event: 'DONATION', listener: (data: CimeDonationEventData) => void): this;
    on(event: 'SUBSCRIPTION', listener: (data: CimeSubscriptionEventData) => void): this;
    
    on(event: 'connected', listener: () => void): this;
    on(event: 'disconnected', listener: () => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'reconnecting', listener: () => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;

    emit(event: 'CHAT', data: CimeChatEventData): boolean;
    emit(event: 'DONATION', data: CimeDonationEventData): boolean;
    emit(event: 'SUBSCRIPTION', data: CimeSubscriptionEventData): boolean;
    
    emit(event: 'connected'): boolean;
    emit(event: 'disconnected'): boolean;
    emit(event: 'error', error: Error): boolean;
    emit(event: 'reconnecting'): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;
}

/**
 * ci.me API의 실시간 이벤트를 수신하기 위한 WebSocket 클라이언트입니다.
 */
export class CimeEventClient extends EventEmitter {
    private ws: WebSocket | null = null;
    private sessionKey: string | null = null;
    private pingTimer: NodeJS.Timeout | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    
    private isConnecting = false;
    private isIntentionalClose = false;
    
    private readonly activeSubscriptions = new Set<CimeLiveEventName>();

    constructor(
        private readonly sessionsApi: SessionsAPI,
        private readonly options: CimeEventClientOptions
    ) {
        super();
    }

    public async connect(): Promise<void> {
        if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;
        this.isConnecting = true;
        this.isIntentionalClose = false;

        try {
            const { url } = await this.sessionsApi.createSession(this.options.type);
            
            const parsedUrl = new URL(url);
            this.sessionKey = parsedUrl.searchParams.get('sessionKey');
            
            if (!this.sessionKey) {
                throw new Error('[CimeEventClient] Failed to extract sessionKey from URL.');
            }

            this.ws = new WebSocket(url);

            this.ws.on('open', async () => {
                this.isConnecting = false;
                this.startPing();
                this.emit('connected');

                for (const event of this.activeSubscriptions) {
                    const apiEventName = event.toLowerCase() as 'chat' | 'donation' | 'subscription';
                    await this.sessionsApi.subscribeEvent(apiEventName, this.sessionKey!).catch(err => {
                        this.emit('error', new Error(`Failed to resubscribe ${event}: ${err.message}`));
                    });
                }
            });

            this.ws.on('message', (data: WebSocket.RawData) => {
                this.handleMessage(data.toString());
            });

            this.ws.on('close', () => {
                this.cleanup();
                this.emit('disconnected');
                this.handleReconnect();
            });

            this.ws.on('error', (error) => {
                this.emit('error', error);
            });

        } catch (error) {
            this.isConnecting = false;
            this.emit('error', error as Error);
            this.handleReconnect(); 
        }
    }

    /**
     * 실시간 이벤트를 구독합니다.
     * @param event - 'CHAT' | 'DONATION' | 'SUBSCRIPTION'
     */
    public async subscribe(event: CimeLiveEventName): Promise<void> {
        if (this.activeSubscriptions.size >= 30) {
            throw new Error('[CimeEventClient] Exceeded maximum 30 subscriptions per session.');
        }

        this.activeSubscriptions.add(event);
        
        // API 통신 시에는 소문자로 변환하여 전송합니다.
        const apiEventName = event.toLowerCase() as 'chat' | 'donation' | 'subscription';

        if (this.sessionKey && this.ws?.readyState === WebSocket.OPEN) {
            await this.sessionsApi.subscribeEvent(apiEventName, this.sessionKey);
        }
    }

    /**
     * 실시간 이벤트 구독을 해제합니다.
     * @param event - 'CHAT' | 'DONATION' | 'SUBSCRIPTION'
     */
    public async unsubscribe(event: CimeLiveEventName): Promise<void> {
        this.activeSubscriptions.delete(event);

        const apiEventName = event.toLowerCase() as 'chat' | 'donation' | 'subscription';

        if (this.sessionKey && this.ws?.readyState === WebSocket.OPEN) {
            await this.sessionsApi.unsubscribeEvent(apiEventName, this.sessionKey);
        }
    }

    public disconnect(): void {
        this.isIntentionalClose = true;
        this.activeSubscriptions.clear();
        this.cleanup();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    private handleMessage(message: string): void {
        try {
            const payload = JSON.parse(message);
            
            if (payload.action === 'PONG') return;

            if (payload.event && payload.data) {
                const typedPayload = payload as CimeEventPayload;
                this.emit(typedPayload.event as any, typedPayload.data);
            }
        } catch (error) {
            this.emit('error', new Error(`[CimeEventClient] Failed to parse message: ${message}`));
        }
    }

    private startPing(): void {
        const interval = this.options.pingInterval || 60000;
        this.pingTimer = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'PING' }));
            }
        }, interval);
    }

    private cleanup(): void {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.isConnecting = false;
    }

    private async handleReconnect(): Promise<void> {
        if (this.isIntentionalClose) return;

        if (this.options.onTokenRefresh) {
            try {
                await this.options.onTokenRefresh();
            } catch (err) {
                this.emit('error', new Error('[CimeEventClient] Token refresh failed during reconnect.'));
            }
        }

        this.reconnectTimer = setTimeout(() => {
            this.emit('reconnecting');
            this.connect();
        }, 5000);
    }
}