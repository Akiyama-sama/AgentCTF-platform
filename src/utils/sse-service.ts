/**
 * @file sseService.ts
 * @description A reusable service for handling Server-Sent Events (SSE) using the native EventSource API.
 */

/**
 * Callbacks for handling the lifecycle of an SSE connection.
 */
export interface SseCallbacks {
  /** Called when a message (from a "data:" field) is received. */
  onData: (data: string) => void;
  /** Called when a fatal error occurs and the connection is closed. */
  onError: (error: Event) => void;
  /** Called when the connection is opened successfully. Optional. */
  onOpen?: () => void;
}

/**
 * Starts an SSE connection and returns a function to close it.
 *
 * @param url The URL of the SSE endpoint.
 * @param callbacks The callback handlers for SSE events.
 * @returns A function that, when called, closes the SSE connection.
 */
export function connectToSse(url: string, callbacks: SseCallbacks): () => void {
  // 1. 创建一个 EventSource 实例，连接立即开始
  const eventSource = new EventSource(url);

  // 2. 监听 open 事件（可选）
  eventSource.onopen = () => {
    callbacks.onOpen?.();
  };

  // 3. 监听 message 事件，这是接收数据的主要方式
  // 浏览器会自动解析 "data:" 字段后的内容
  eventSource.onmessage = (event) => {
    callbacks.onData(event.data);
  };

  // 4. 监听 error 事件
  // 注意：这通常在连接中断时触发，浏览器会在此之后尝试自动重连。
  // 只有在发生致命错误导致无法重连时，我们才真正关闭它。
  eventSource.onerror = (error) => {
    callbacks.onError(error);
    // 发生错误后，EventSource 会自动关闭，无需手动调用 close
    // 如果需要强制关闭，可以在 onError 回调中调用 eventSource.close()
  };
  
  // 5. 返回一个清理函数，供外部调用以主动断开连接
  return () => {
    eventSource.close();
  };
}