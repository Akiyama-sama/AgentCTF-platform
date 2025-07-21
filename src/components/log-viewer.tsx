
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LogEntry } from '@/types/api';

export interface LogViewerProps {
    logs: LogEntry[];
    title?: string;
    height?: number;
    autoScroll?: boolean;
    showTimestamp?: boolean;
}

const LogViewer: React.FC<LogViewerProps> = ({ 
    logs, 
    title = '日志', 
    height = 400, 
    autoScroll = true,
    showTimestamp = true 
}) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoScroll && logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    const getLevelColor = (level: string): string => {
        switch (level.toLowerCase()) {
            case 'error': return 'text-destructive';
            case 'warning': return 'text-yellow-500';
            case 'info': return 'text-blue-400';
            case 'debug': return 'text-green-500';
            default: return 'text-muted-foreground';
        }
    };

    const formatTimestamp = (timestamp: string): string => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('zh-CN', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            return timestamp;
        }
    };

    return (
        <Card>
            {title && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className={cn('p-6', { 'pt-0': title })}>
                <div
                    ref={logContainerRef}
                    style={{ height: `${height}px` }}
                    className="bg-black text-white font-mono text-xs p-4 rounded-md overflow-y-auto"
                >
                    {logs.length === 0 ? (
                        <p className="text-muted-foreground">暂无日志...</p>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className="flex flex-wrap items-baseline mb-1 last:mb-0">
                                {showTimestamp && (
                                    <span className="text-gray-500 mr-3 shrink-0">
                                        {formatTimestamp(log.timestamp)}
                                    </span>
                                )}
                                <span className={cn('font-bold mr-3 shrink-0', getLevelColor(log.level))}>
                                    [{log.level.toUpperCase()}]
                                </span>
                                <p className="whitespace-pre-wrap break-words flex-1 min-w-0">
                                    {log.message}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

LogViewer.displayName = 'LogViewer';

export default LogViewer;

