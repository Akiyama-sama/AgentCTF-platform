
import Log from "@/components/log"
import { LogDisplayItem } from "@/types/sse"
import { IconTerminal2 } from "@tabler/icons-react"

export function BuildLog(
  {logs,isBuilding}:{logs:LogDisplayItem[],isBuilding:boolean},
){
    
    return(
        <div className='rounded-lg border bg-card p-4 shadow-sm'>
              <h3 className='mb-2 flex items-center text-lg font-semibold'>
                <IconTerminal2 className='mr-2' />
                构建日志
                {isBuilding && <span className='ml-3 animate-pulse text-sm text-primary'>正在构建场景镜像...</span>}
              </h3>
              <Log logs={logs} className='w-full h-64' />
         </div>
    )

}