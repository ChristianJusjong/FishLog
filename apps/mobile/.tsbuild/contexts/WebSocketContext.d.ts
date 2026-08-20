import React from 'react';
interface WebSocketMessage {
    event: string;
    data: any;
    timestamp: string;
}
interface WebSocketContextType {
    connected: boolean;
    lastMessage: WebSocketMessage | null;
    sendMessage: (type: string, data: any) => void;
    addEventListener: (event: string, handler: (data: any) => void) => () => void;
}
export declare const useWebSocket: () => WebSocketContextType;
interface Props {
    children: React.ReactNode;
}
export declare function WebSocketProvider({ children }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=WebSocketContext.d.ts.map