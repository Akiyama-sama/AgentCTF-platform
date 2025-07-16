import { cn } from '@/lib/utils';
import  { useEffect, useRef } from 'react';

type LogProps = {
  logs: string[];
  className?: string;
};

const Log = ({ logs, className }: LogProps) => {
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div
      className={cn(
        'bg-card text-primary font-mono text-sm p-4 rounded-lg overflow-y-auto no-scrollbar',
        className
      )}
    >
      {logs.map((log, index) => (
        <div key={index} className="flex items-start">
          <span className="text-muted-foreground mr-2 select-none">{'>'}</span>
          <p className="whitespace-pre-wrap break-words flex-1 min-w-0">{log}</p>
        </div>
      ))}
      <div className="flex items-center">
        <span className="text-muted-foreground mr-2 select-none">{'>'}</span>
        <div className="w-2 h-4 bg-primary animate-pulse" />
      </div>
      <div ref={endOfLogsRef} />
    </div>
  );
};

Log.displayName = 'Log';

export default Log;
