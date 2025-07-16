// src/stores/logStore.ts
import { create } from 'zustand';

type LogStreamState = {
  logs: string[];
  status: 'idle' | 'streaming' | 'success' | 'error'; // 流的状态
  error: string | null;
  appendLogs: (newLogs: string) => void;
  setStatus: (status: LogStreamState['status']) => void;
  setError: (error: string | null) => void;
  clearLogs: () => void;
};

export const useLogStore = create<LogStreamState>((set) => ({
  logs: [],
  status: 'idle',
  error: null,
  appendLogs: (newLogChunk) => {
    // 按换行符分割，并处理不完整的行
    const lines = newLogChunk.split('\n');
    set((state) => ({ logs: [...state.logs, ...lines].filter(line => line) }));
  },
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  clearLogs: () => set({ logs: [], status: 'idle', error: null }),
}));