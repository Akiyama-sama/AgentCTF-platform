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
    ChatRequestBoxType,
    // type SSEChatResponse,
} from "@/types/attacker-agent";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
    type Message,
} from 'ai';
import { agentSSEManager } from "@/utils/agent-sse-connections";
import { showErrorMessage } from "@/utils/show-submitted-data";
import {
  useGetInstanceStatusApiInstanceStatusModelIdGet,
  getGetInstanceStatusApiInstanceStatusModelIdGetQueryKey,
  useInitDefenderInstanceApiInstanceInitPost,
  useCleanupDefenderInstanceApiInstanceCleanupModelIdDelete,
  type InstanceStatusResponse,
  type InstanceInitRequest,
  type InitDefenderInstanceApiInstanceInitPostMutationResult,
  type CleanupDefenderInstanceApiInstanceCleanupModelIdDeleteMutationResult,
} from '@/types/defender-agent'
import { useProcess } from "@/features/scenario/store/process-store";

// const attackerAgentURL = import.meta.env.VITE_ATTACKER_URL;

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
  
    const queryKey = getGetUserStatusV1UserStatusGetQueryKey({ user_id: userId! });
    const cachedStatus = queryClient.getQueryData<UserStatusResponse>(queryKey);

    const { data: status, ...statusQuery } = useGetUserStatusV1UserStatusGet(
      { user_id: userId! },
      {
        query: {
          enabled: isEnabled && (!cachedStatus || !cachedStatus.initialized),
          select: (response): UserStatusResponse | null => response.data ?? null,
          retry:3
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
            statusQuery,
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

export const useDefenderAgentSession = (modelId: string | null) => {
  const queryClient = useQueryClient()
  const isEnabled = !!modelId

  const queryKey = getGetInstanceStatusApiInstanceStatusModelIdGetQueryKey(modelId!);
  const cachedStatus = queryClient.getQueryData<InstanceStatusResponse>(queryKey);

  const { data: status, ...statusQuery } =
    useGetInstanceStatusApiInstanceStatusModelIdGet(modelId!, {
      query: {
        enabled: isEnabled && (!cachedStatus || !cachedStatus.initialized),
        select: (response): InstanceStatusResponse | null =>
          response.data ?? null,
      },
    })

  const invalidateInstanceStatus = useCallback(() => {
    if (!modelId) return
    queryClient.invalidateQueries({
      queryKey: getGetInstanceStatusApiInstanceStatusModelIdGetQueryKey(modelId),
    })
  }, [queryClient, modelId])

  const initInstanceMutation = useInitDefenderInstanceApiInstanceInitPost({
    mutation: {
      onSuccess: invalidateInstanceStatus,
    },
  })

  const cleanupInstanceMutation =
    useCleanupDefenderInstanceApiInstanceCleanupModelIdDelete({
      mutation: {
        onSuccess: invalidateInstanceStatus,
      },
    })

  if (!isEnabled) {
    const noOp = () => {}
    const noOpAsyncInit = async () =>
      Promise.resolve({} as InitDefenderInstanceApiInstanceInitPostMutationResult)
    const noOpAsyncCleanup = async () =>
      Promise.resolve(
        {} as CleanupDefenderInstanceApiInstanceCleanupModelIdDeleteMutationResult,
      )
    return {
      status: null,
      statusQuery,
      isInitializing: false,
      initInstance: noOp,
      initInstanceAsync: noOpAsyncInit,
      isCleaningUp: false,
      cleanupInstance: noOp,
      cleanupInstanceAsync: noOpAsyncCleanup,
    }
  }

  return {
    status,
    statusQuery,
    isInitializing: initInstanceMutation.isPending,
    initInstance: (variables: InstanceInitRequest) => {
      initInstanceMutation.mutate({ data: { ...variables, model_id: modelId } })
    },
    initInstanceAsync: (variables: InstanceInitRequest) => {
      return initInstanceMutation.mutateAsync({
        data: { ...variables, model_id: modelId },
      })
    },
    isCleaningUp: cleanupInstanceMutation.isPending,
    cleanupInstance: () => {
      cleanupInstanceMutation.mutate({ modelId })
    },
    cleanupInstanceAsync: () => {
      return cleanupInstanceMutation.mutateAsync({ modelId })
    },
  }
}

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
    const [box_type,setBoxType] = useState<ChatRequestBoxType>('white')
    const {scenarioProcessState} = useProcess()
    


    const streamControllerRef = useRef<AbortController | null>(null);
  
    // 当消息列表更新时，自动持久化到 localStorage
    useEffect(() => {
        if (user_id) {
          localStorage.setItem(`attacker-agent-${user_id}`, JSON.stringify(messages));
        }
    }, [messages, user_id]);

    const sendMessage = useCallback(async (message: string,whitebox_description?:string) => {
      if (!user_id) return;

      setIsLoading(true);
      setError(null);
      setStatus('connecting');

      const newUserMessage: Message = {
        id: Math.random().toString(),
        role: 'user',
        content: message,
        createdAt: new Date(),
      };
      // Optimistically add user message
      if (message.trim()) {
        setMessages(prev => [...prev, newUserMessage]);
      }

      const assistantMessageId = Math.random().toString();
      const assistantPlaceholder: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, assistantPlaceholder]);

      const request: ChatRequest = {
        user_id: user_id,
        message: message,
        box_type: box_type,
        is_attacke: !scenarioProcessState.isAttackFinished,
        whitebox_description: whitebox_description,
      };
      
      const callbacks = {
        onStart: () => {
            setStatus('streaming');
            // eslint-disable-next-line no-console
            console.log('用户:', user_id, 'Chat Stream started:', message)
        },
        onMessage: (data: unknown) => {
            const { message: chunk } = data as { message: string };
            if (chunk) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === assistantMessageId
                            ? { ...msg, content: msg.content + chunk }
                            : msg
                    )
                );
            }
        },
        onEnd: () => {
            setStatus('success');
            // eslint-disable-next-line no-console
            console.log('用户:', user_id, 'Chat Stream ended:', message)

        },
        onError: (err: { code?: string | number, message: string }) => {
            const error = {
                message: err.message,
                code: err.code?.toString()
            }
            setError(error);
            setStatus('error');
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === assistantMessageId
                        ? { ...msg, content: `错误: ${err.message} (代码: ${err.code || 'N/A'})` }
                        : msg
                )
            );
            // eslint-disable-next-line no-console
            console.error("Agent聊天发生错误",err)
            showErrorMessage(err.message || 'Agent聊天发生错误')
        },
        onFinally: () => {
            setIsLoading(false);
            streamControllerRef.current = null;
        }
      };

      streamControllerRef.current = agentSSEManager.createChatStream(user_id, request, callbacks);

    }, [user_id, box_type, scenarioProcessState.isAttackFinished]);

  

    const stop = useCallback(() => {
        if(user_id) {
          agentSSEManager.closeStream(`chat-${user_id}`);
        }
    }, [user_id]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stop();
        }
    }, [stop]);

    const clearMessages = useCallback(() => {
      localStorage.removeItem(`attacker-agent-${user_id}`)
      setMessages([]);
    }, [user_id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    };
  
    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim()) return;
      
      await sendMessage(input);
      setInput('');

    }, [sendMessage, input]);
  
    return useMemo(() =>({
      messages,
      setMessages,
      input,
      handleInputChange,
      handleSubmit,
      sendMessage,
      setBoxType,
      box_type,
      clearMessages,
      isLoading,
      status,
      error,


    }),[messages, setMessages, input, handleInputChange, handleSubmit, sendMessage, setBoxType, box_type, clearMessages, isLoading, status, error]);
  };



