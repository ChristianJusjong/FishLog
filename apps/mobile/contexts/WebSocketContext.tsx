import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';

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

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  lastMessage: null,
  sendMessage: () => {},
  addEventListener: () => () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface Props {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: Props) {
  const { token, user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const eventHandlers = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Get WebSocket URL
  const getWsUrl = useCallback(() => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    return `${wsUrl}/ws?token=${token}`;
  }, [token]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!token || !user) {
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWsUrl();
      console.log('Connecting to WebSocket:', wsUrl.replace(token!, '[TOKEN]'));

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message.event);

          setLastMessage(message);

          // Call event-specific handlers
          const handlers = eventHandlers.current.get(message.event);
          if (handlers) {
            handlers.forEach((handler) => {
              try {
                handler(message.data);
              } catch (error) {
                console.error('Error in WebSocket event handler:', error);
              }
            });
          }

          // Call wildcard handlers
          const wildcardHandlers = eventHandlers.current.get('*');
          if (wildcardHandlers) {
            wildcardHandlers.forEach((handler) => {
              try {
                handler(message);
              } catch (error) {
                console.error('Error in WebSocket wildcard handler:', error);
              }
            });
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        ws.current = null;

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);

          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.log('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [token, user, getWsUrl]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setConnected(false);
  }, []);

  // Send message to server
  const sendMessage = useCallback((type: string, data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify({ type, data }));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Add event listener
  const addEventListener = useCallback((event: string, handler: (data: any) => void) => {
    if (!eventHandlers.current.has(event)) {
      eventHandlers.current.set(event, new Set());
    }

    eventHandlers.current.get(event)!.add(handler);

    // Return cleanup function
    return () => {
      const handlers = eventHandlers.current.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlers.current.delete(event);
        }
      }
    };
  }, []);

  // Connect on mount and when token changes
  useEffect(() => {
    if (token && user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, user, connect, disconnect]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, reconnect if needed
        if (!connected && token && user) {
          console.log('App foregrounded, reconnecting WebSocket');
          connect();
        }
      } else if (nextAppState === 'background') {
        // App went to background, keep connection alive
        // (You might want to disconnect here to save battery)
      }
    });

    return () => {
      subscription.remove();
    };
  }, [connected, token, user, connect]);

  // Ping/pong to keep connection alive
  useEffect(() => {
    if (!connected) return;

    const pingInterval = setInterval(() => {
      sendMessage('ping', {});
    }, 30000); // Ping every 30 seconds

    return () => {
      clearInterval(pingInterval);
    };
  }, [connected, sendMessage]);

  const value: WebSocketContextType = {
    connected,
    lastMessage,
    sendMessage,
    addEventListener,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
