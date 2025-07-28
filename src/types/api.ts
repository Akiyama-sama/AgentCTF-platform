
export type User ={
    id: string
    username: string
    is_active: boolean
    is_verified: boolean
    created_time: string
    role: string
}

export interface FileNode {
    key: string;
    name: string;
    children?: FileNode[];
}

export interface FileTreeNode {
    type: 'file' | 'directory';
    size?: number;
    children?: Record<string, FileTreeNode>;
  };

// 日志相关类型
export interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    logger_name: string;
    type: 'log' | 'history' | 'heartbeat' | 'error' | 'end' | 'history_end';
}

export type GetModelAllContainerInspectResponseContainers = Record<string, ContainerInspect>;

export interface ContainerInspect {
  Id: string;
  Name: string;
  Config?: {
    Labels?: {
      [key: string]: string;
    };
  };
  // Add other properties as needed based on your usage
}