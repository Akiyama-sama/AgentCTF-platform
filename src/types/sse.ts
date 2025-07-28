/**
 * SSE相关类型定义
 */

// SSE消息类型枚举
export enum SSELogType {
  LOG = "log",
  HISTORY = "history",
  HEARTBEAT = "heartbeat",
  ERROR = "error",
  END = "end",
  HISTORY_END = "history_end"
}

// SSE日志级别枚举
export enum SSELogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL"
}

// SSE基础消息接口
export interface SSEBaseMessage {
  type: SSELogType;
  timestamp: string;
  message: string;
}

// SSE日志条目
export interface SSELogEntry extends SSEBaseMessage {
  type: SSELogType.LOG | SSELogType.HISTORY;
  level: SSELogLevel;
  logger_name: string;
  module?: string;
  line_no?: number;
  model_id?: string;
  container_name?: string;
}

// SSE心跳消息
export interface SSEHeartbeatMessage extends SSEBaseMessage {
  type: SSELogType.HEARTBEAT;
  connected_clients: number;
}

// SSE错误消息
export interface SSEErrorMessage extends SSEBaseMessage {
  type: SSELogType.ERROR;
  error_code?: string;
}

// SSE结束消息
export interface SSEEndMessage extends SSEBaseMessage {
  type: SSELogType.END;
  reason?: string;
}

// SSE历史结束消息
export interface SSEHistoryEndMessage extends SSEBaseMessage {
  type: SSELogType.HISTORY_END;
  history_count?: number;
}

// 联合类型
export type SSEMessage = 
  | SSELogEntry 
  | SSEHeartbeatMessage 
  | SSEErrorMessage 
  | SSEEndMessage 
  | SSEHistoryEndMessage;

// SSE连接状态
export enum SSEConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting", 
  CONNECTED = "connected",
  ERROR = "error",
  ENDED = "ended"
}

// SSE连接配置
export interface SSEConnectionConfig {
  url: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

// SSE连接统计信息
export interface SSEStreamStats {
  total_messages: number;
  log_messages: number;
  error_messages: number;
  heartbeat_count: number;
  last_message_at?: string;
  connection_duration: number;
  connected_at?: string;
}

// 日志显示项
export interface LogDisplayItem {
  id: string;
  timestamp: string;
  level: SSELogLevel;
  message: string;
  type: 'history' | 'live';
  logger_name?: string;
  model_id?: string;
  container_name?: string;
}

// 日志过滤器
export interface LogFilter {
  levels: SSELogLevel[];
  search?: string;
  showHistory?: boolean;
  showLive?: boolean;
  modelId?: string;
  containerName?: string;
}

// 日志源类型
export type LogSourceType = 'server' | 'model_build' | 'model_container';

// 日志源配置
export interface LogSource {
  id: string;
  type: LogSourceType;
  name: string;
  url: string;
  modelId?: string;
  containerName?: string;
  active: boolean;
}

export default {};
