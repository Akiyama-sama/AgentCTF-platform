import { SSELogLevel } from "@/types/sse"


export function getLevelFromData(data: string): SSELogLevel | undefined {
   if(data.includes(SSELogLevel.DEBUG)){
    return SSELogLevel.DEBUG
   }
   if(data.includes(SSELogLevel.INFO)){
    return SSELogLevel.INFO
   }
   if(data.includes(SSELogLevel.WARNING)){
    return SSELogLevel.WARNING
   }
   if(data.includes(SSELogLevel.ERROR)){
    return SSELogLevel.ERROR
   }
   if(data.includes(SSELogLevel.CRITICAL)){
    return SSELogLevel.CRITICAL
   }

  return undefined
}