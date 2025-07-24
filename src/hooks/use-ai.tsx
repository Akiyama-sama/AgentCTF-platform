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
    type LogRequest,
} from "@/types/attacker-agent";
import { useState, useRef, useCallback } from "react";


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
          refetchInterval: 5000,
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
export const useAttackerAgentChat = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const streamControllerRef = useRef<AbortController | null>(null);

    const startChat = useCallback(async (params: ChatRequest) => {
        if (streamControllerRef.current) {
            streamControllerRef.current.abort();
        }
        streamControllerRef.current = new AbortController();

        setMessages([]);
        setIsStreaming(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_ATTACKER_AGENT_BASE_URL}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: streamControllerRef.current.signal,
            });

            if (!response.body) {
                throw new Error('Response body is empty');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setMessages(prev => [...prev, chunk]);
            }

        } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
                setError(e.message);
            }
        } finally {
            setIsStreaming(false);
            streamControllerRef.current = null;
        }
    }, []);

    const stopChat = useCallback(() => {
        if (streamControllerRef.current) {
            streamControllerRef.current.abort();
            streamControllerRef.current = null;
        }
        setIsStreaming(false);
    }, []);

    return {
        messages,
        isStreaming,
        error,
        startChat,
        stopChat,
    };
};

/**
 * Hook to handle streaming logs from the attacker agent.
 * @returns Functions and state for managing a log stream.
 */
export const useAttackerAgentLogs = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const streamControllerRef = useRef<AbortController | null>(null);

    const startLogs = useCallback(async (params: LogRequest) => {
        if (streamControllerRef.current) {
            streamControllerRef.current.abort();
        }
        streamControllerRef.current = new AbortController();
        
        setLogs([]);
        setIsStreaming(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_ATTACKER_AGENT_BASE_URL}/v1/logs/log/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
                signal: streamControllerRef.current.signal,
            });

            if (!response.body) {
                throw new Error('Response body is empty');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setLogs(prev => [...prev, chunk]);
            }

        } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
                setError(e.message);
            }
        } finally {
            setIsStreaming(false);
            streamControllerRef.current = null;
        }
    }, []);

    const stopLogs = useCallback(() => {
        if (streamControllerRef.current) {
            streamControllerRef.current.abort();
            streamControllerRef.current = null;
        }
        setIsStreaming(false);
    }, []);

    return {
        logs,
        isStreaming,
        error,
        startLogs,
        stopLogs,
    };
};

