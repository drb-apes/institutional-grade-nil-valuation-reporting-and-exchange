import { useEffect, useState, useRef, useCallback } from 'react';

interface UseWebSocketOptions {
  retryAttempts?: number;
  retryDelay?: number;
}

export const useWebSocket = (
  url: string,
  options: UseWebSocketOptions = { retryAttempts: 3, retryDelay: 1000 }
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        retryCountRef.current = 0;
        console.log(`[WebSocket] Connected to ${url}`);
      };

      ws.onmessage = (event) => {
        setLastMessage(event.data);
      };

      ws.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('[WebSocket] Disconnected');

        // Retry logic
        if (retryCountRef.current < (options.retryAttempts || 3)) {
          retryCountRef.current++;
          retryTimeoutRef.current = setTimeout(
            () => connect(),
            (options.retryDelay || 1000) * retryCountRef.current
          );
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      setIsConnected(false);
    }
  }, [url, options]);

  useEffect(() => {
    connect();

    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { isConnected, lastMessage, ws: wsRef.current };
};
