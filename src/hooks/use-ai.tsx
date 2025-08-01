import { google } from "@ai-sdk/google"
import { streamText } from 'ai';
import { useQueryClient } from "@tanstack/react-query";
import {
    // Queries
    useGetUserStatusV1UserStatusGet,
    getGetUserStatusV1UserStatusGetQueryKey,
  
    // Mutations
    useInitUserV1UserInitPost,
    useCleanupUserV1UserCleanupDelete,
    
    // Types
    type UserStatusResponse,
    type ChatRequest,
} from "@/types/attacker-agent";
import { useState, useRef, useCallback } from "react";
import {
    type Message,
} from 'ai';

const attackerAgentURL = import.meta.env.VITE_ATTACKER_URL;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function googleChatPost(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("models/gemini-2.0-flash-exp"),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}

/**
 * Hook to manage attacker agent session (status, init, cleanup).
 * @param userId The ID of the user.
 */
export const useAttackerAgentSession = (userId: string | null) => {
    const queryClient = useQueryClient();
    const isEnabled = !!userId;
  
    const { data: status, ...statusQuery } = useGetUserStatusV1UserStatusGet(
      { user_id: userId! },
      {
        query: {
          enabled: isEnabled,
          select: (response): UserStatusResponse | null => response.data ?? null,
          refetchInterval: 50000,
        },
      }
    );
  
    const invalidateUserStatus = useCallback(() => {
      if (!userId) return;
      queryClient.invalidateQueries({
        queryKey: getGetUserStatusV1UserStatusGetQueryKey({ user_id: userId }),
      });
    },[queryClient, userId]);
  
    const initUserMutation = useInitUserV1UserInitPost({
      mutation: {
        onSuccess: invalidateUserStatus,
      },
    });
  
    const cleanupUserMutation = useCleanupUserV1UserCleanupDelete({
      mutation: {
        onSuccess: invalidateUserStatus,
      },
    });
  
    if (!isEnabled) {
        const noOpAsync = async () => Promise.resolve(new Response());
        return {
            status: null,
            statusQuery: { isInitialLoading: false },
            isInitializing: false,
            initUser: noOpAsync,
            initUserAsync: noOpAsync,
            isCleaningUp: false,
            cleanupUser: noOpAsync,
            cleanupUserAsync: noOpAsync,
        };
    }
  
    return {
      status,
      statusQuery,
      isInitializing: initUserMutation.isPending,
      initUser: initUserMutation.mutate,
      initUserAsync: initUserMutation.mutateAsync,
      isCleaningUp: cleanupUserMutation.isPending,
      cleanupUser: cleanupUserMutation.mutate,
      cleanupUserAsync: cleanupUserMutation.mutateAsync,
    };
};

/**
 * Hook to handle streaming chat with the attacker agent.
 * @returns Functions and state for managing a chat stream.
 */
export const useAttackerAgentChat = ({
    user_id,
  }: {
    user_id: string | null;
  }) => {
    const initMessage=localStorage.getItem(`attacker-agent-${user_id}`)
    const [messages, setMessages] = useState<Message[]>(initMessage?JSON.parse(initMessage):[]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<{ message: string, code?: string } | null>(null);
    type ChatStatus = 'idle' | 'connecting' | 'streaming' | 'success' | 'error';
    const [status, setStatus] = useState<ChatStatus>('idle');
    const [customInfo, setCustomInfo] = useState<{[key:string]:unknown}>({});


    const statusRef = useRef(status);
    statusRef.current = status;
  
    const sendMessage = useCallback(async (message: string) => {
      if (!user_id) return;
      // 允许在有 customInfo 的情况下发送空消息
      if (!message.trim() && Object.keys(customInfo).length === 0) return;

      setIsLoading(true);
      setError(null);
      setStatus('connecting');

      // 只有当消息不为空时，才将其作为用户消息添加到对话中
      if (message.trim()) {
          const newUserMessage: Message = {
            id: Math.random().toString(),
            role: 'user',
            content: message,
            createdAt: new Date(),
          };
          setMessages(prev => [...prev, newUserMessage]);
      }

      const assistantMessageId = Math.random().toString();
      const assistantPlaceholder: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      };
      
      // 不论用户消息是否可见，都添加AI助手的占位消息
      setMessages(prev => [...prev, assistantPlaceholder]);
      
      try {
        const response = await fetch(`${attackerAgentURL}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            user_id: user_id,
            message: message, // 使用传入的消息
            custom_info: customInfo
          } as ChatRequest),
        });
  
        if (!response.ok || !response.body) {
          const errorData = await response.json().catch(() => ({ detail: [{msg: '请求失败，无法解析错误信息'}] }));
          throw new Error(errorData.detail?.[0]?.msg || `HTTP error! status: ${response.status}`);
        }
  
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
  
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (statusRef.current === 'streaming' || statusRef.current === 'connecting') {
                setStatus('success');
            }
            break;
          }
  
          buffer += decoder.decode(value, { stream: true });
          const boundary = '\n\n';
          
          while (buffer.includes(boundary)) {
            const eventEndIndex = buffer.indexOf(boundary);
            const eventString = buffer.substring(0, eventEndIndex);
            buffer = buffer.substring(eventEndIndex + boundary.length);
  
            let eventType = 'message';
            let dataJson = '';
  
            for (const line of eventString.split('\n')) {
              if (line.startsWith('event: ')) {
                eventType = line.substring(7).trim();
              } else if (line.startsWith('data: ')) {
                dataJson = line.substring(6).trim();
              }
            }
  
            if (!dataJson) continue;
            
            try {
              const data = JSON.parse(dataJson);
              
              switch (eventType) {
                case 'start':
                  // eslint-disable-next-line no-console
                  console.log('Stream started:', data);
                  setStatus('streaming');
                  break;
                
                case 'message':
                  if (data.message) {
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: msg.content + data.message }
                          : msg
                      )
                    );
                    localStorage.setItem(`attacker-agent-${user_id}`,JSON.stringify(messages))
                  }
                  break;
  
                case 'ping':
                  // eslint-disable-next-line no-console
                  console.log('Ping received:', data.timestamp);
                  break;
  
                case 'end':
                  // eslint-disable-next-line no-console
                  console.log('Stream ended:', data);
                  setStatus('success');
                  setIsLoading(false);
                  return; 
  
                case 'error': {
                  // eslint-disable-next-line no-console
                  console.error('API Error Event:', data);
                  const apiError = { code: data.code, message: data.message };
                  setError(apiError);
                  setStatus('error');
                  setIsLoading(false);
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: `API错误: ${apiError.message} (代码: ${apiError.code})` }
                        : msg
                    )
                  );
                  return;
                }
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('Failed to parse SSE data JSON:', dataJson, e);
            }
          }
        }
      } catch (err) {
        if (err instanceof Error) {
            // eslint-disable-next-line no-console
            console.error('Fetch request error:', err);
            setError({ message: err.message });
            setStatus('error');
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === assistantMessageId
                        ? { ...msg, content: `出现错误: ${err.message}` }
                        : msg
                )
            );
        }
      } finally {
        setIsLoading(false);
      }
    }, [user_id, customInfo]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    };
  
    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim()) return;
      
      await sendMessage(input);
      setInput('');

    }, [sendMessage, input]);
  
    return {
      messages,
      input,
      handleInputChange,
      handleSubmit,
      sendMessage, 
      setCustomInfo,
      isLoading,
      status,
      error,
    };
  };



