/**
 * SSE连接管理器
 */

import {
  SSEMessage,
  SSEConnectionState,
  SSEConnectionConfig,
  SSELogType,
  LogDisplayItem,
  SSELogLevel
} from '../types/sse';

export interface SSEConnectionEvents {
  onMessage: (message: SSEMessage) => void;
  onStateChange: (state: SSEConnectionState) => void;
  onError: (error: Error) => void;
  onHistoryEnd: (historyCount: number) => void;
}

export class SSEConnection {
  private eventSource: EventSource | null = null;
  private config: SSEConnectionConfig;
  private events: SSEConnectionEvents;
  private state: SSEConnectionState = SSEConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: SSEConnectionConfig, events: SSEConnectionEvents) {
    this.config = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...config
    };
    this.events = events;
  }

  connect(): void {
    if (this.state === SSEConnectionState.CONNECTED || 
        this.state === SSEConnectionState.CONNECTING) {
      return;
    }

    this.setState(SSEConnectionState.CONNECTING);
    
    try {
      this.eventSource = new EventSource(this.config.url);
      
      this.eventSource.onopen = () => {
        // eslint-disable-next-line no-console
        console.log(`SSE连接已建立: ${this.config.url}`);
        this.setState(SSEConnectionState.CONNECTED);
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
           // eslint-disable-next-line no-console
          console.error('解析SSE消息失败:', error, event.data);
          this.events.onError(new Error(`消息解析失败: ${error}`));
        }
      };

      this.eventSource.onerror = (event) => {
         // eslint-disable-next-line no-console
        console.error('SSE连接错误:', event);
        this.setState(SSEConnectionState.ERROR);
        
        if (this.config.autoReconnect && 
            this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)) {
          this.scheduleReconnect();
        }
      };

    } catch (error) {
       // eslint-disable-next-line no-console
      console.error('创建SSE连接失败:', error);
      this.setState(SSEConnectionState.ERROR);
      this.events.onError(error as Error);
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      // eslint-disable-next-line no-console
      console.log('SSE连接已关闭');
      this.eventSource = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.setState(SSEConnectionState.DISCONNECTED);
  }

  getState(): SSEConnectionState {
    return this.state;
  }

  private setState(newState: SSEConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.events.onStateChange(newState);
    }
  }

  private handleMessage(message: SSEMessage): void {
    switch (message.type) {
      case SSELogType.HISTORY_END:
        this.events.onHistoryEnd(message.history_count || 0);
        break;
      case SSELogType.END:
        this.setState(SSEConnectionState.ENDED);
        break;
      case SSELogType.ERROR:
        this.events.onError(new Error(message.message));
        break;
    }
    
    this.events.onMessage(message);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval || 3000;
     // eslint-disable-next-line no-console
    console.log(`SSE重连 (${this.reconnectAttempts}/${this.config.maxReconnectAttempts}) 将在 ${delay}ms 后开始`);
    
    this.reconnectTimer = setTimeout(() => {
      this.disconnect();
      this.connect();
    }, delay);
  }
}

/**
 * SSE连接管理器 - 管理多个SSE连接
 */
export class SSEConnectionManager {
  private connections = new Map<string, SSEConnection>();
  private messageCallbacks = new Map<string, (message: SSEMessage) => void>();
  private stateCallbacks = new Map<string, (state: SSEConnectionState) => void>();

  createConnection(
    id: string, 
    config: SSEConnectionConfig,
    onMessage: (message: SSEMessage) => void,
    onStateChange: (state: SSEConnectionState) => void
  ): SSEConnection {
    // 关闭已存在的连接
    this.closeConnection(id);

    const connection = new SSEConnection(config, {
      onMessage,
      onStateChange,
      onError: (error) => {
         // eslint-disable-next-line no-console
        console.error(`SSE连接 ${id} 错误:`, error);
      },
      onHistoryEnd: (historyCount) => {
         // eslint-disable-next-line no-console
        console.log(`SSE连接 ${id} 历史日志结束，共 ${historyCount} 条`);
      }
    });

    this.connections.set(id, connection);
    this.messageCallbacks.set(id, onMessage);
    this.stateCallbacks.set(id, onStateChange);

    return connection;
  }

  getConnection(id: string): SSEConnection | undefined {
    return this.connections.get(id);
  }

  closeConnection(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      connection.disconnect();
      this.connections.delete(id);
      this.messageCallbacks.delete(id);
      this.stateCallbacks.delete(id);
    }
  }

  closeAllConnections(): void {
    for (const id of this.connections.keys()) {
      this.closeConnection(id);
    }
  }

  getConnectionStates(): Record<string, SSEConnectionState> {
    const states: Record<string, SSEConnectionState> = {};
    for (const [id, connection] of this.connections) {
      states[id] = connection.getState();
    }
    return states;
  }
}

// 全局连接管理器实例
export const sseConnectionManager = new SSEConnectionManager();

/**
 * 辅助函数：将SSE消息转换为显示项
 */
export function convertSSEMessageToLogItem(
  message: SSEMessage, 
  index: number
): LogDisplayItem | null {
  if (message.type !== SSELogType.LOG && message.type !== SSELogType.HISTORY) {
    return null;
  }

  return {
    id: `${message.timestamp}-${index}`,
    timestamp: message.timestamp,
    level: message.level || SSELogLevel.INFO,
    message: message.message,
    type: message.type === SSELogType.HISTORY ? 'history' : 'live',
    logger_name: message.logger_name,
    model_id: message.model_id,
    container_name: message.container_name
  };
}

export default SSEConnection;
