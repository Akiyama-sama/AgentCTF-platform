import { ModelResponse } from '@/types/docker-manager'
import { Copy, Info } from 'lucide-react'
import { useScenarioContainers } from '@/hooks/use-scenario'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Loading from '@/components/Loading'
import { showSuccessMessage } from '@/utils/show-submitted-data'
import { useEffect, useState } from 'react'
import { useExerciseReport } from '@/hooks/use-report'
import { useDind } from '@/hooks/use-dind'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ModelResponse
}

export function SubmitFlagDialog({ open, onOpenChange, currentRow }: Props) {
  const modelId=currentRow.uuid
  const [isDataReady, setIsDataReady] = useState(false)
  const {dindPackageInfoList}=useDind(modelId)
  const [isClickGenerateReport,setIsClickGenerateReport]=useState(false)
  const {analyzeAsync}=useExerciseReport(modelId,{refetchStatus:isClickGenerateReport})
  
  const { targetContainerName, portMap } = useScenarioContainers(
    modelId
  )
  const targetPort = targetContainerName ? portMap.get(targetContainerName)?.targetEntrancePort : undefined
  const target_entrance_url = targetPort
    ? `http://localhost:${targetPort}`
    : undefined
  useEffect(() => {
    if (target_entrance_url) {
      setIsDataReady(true)
    }
  }, [target_entrance_url])

  const handleSubmit=()=>{
    setIsClickGenerateReport(true)
    analyzeAsync({
      pcap_paths:dindPackageInfoList
    }).then(()=>{
      showSuccessMessage('正在生成报告，请稍后')
    })
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex flex-col gap-4'>
        <DialogHeader>
          <DialogTitle>练习：{currentRow.name}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <p className='text-muted-foreground text-sm'>
            题目描述：
            <span className='line-clamp-3' title={currentRow.description}>
              {currentRow.description}
            </span>
          </p>
          <div className='flex items-center gap-2'>
            {isDataReady ? (
              target_entrance_url ? (
                `靶机入口URL：${target_entrance_url}`
              ) : (
                '抱歉，靶机入口URL获取失败'
              )
            ) : (
              <Loading />
            )}
            <button className='hover:bg-muted rounded-md p-2' onClick={()=>{
              if(target_entrance_url){
                navigator.clipboard.writeText(target_entrance_url)
                showSuccessMessage('靶机入口URL已复制到剪贴板')
              }
            }}>
              <Copy size={18} />
            </button>
          </div>
        </div>
        <div className='flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
          <Info className='w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
          <p className='text-sm text-blue-800 dark:text-blue-200 leading-relaxed'>
            后端服务会自动监听指挥官的进攻指令，指挥官进攻完毕过后，就可以开始点击进行分析了
          </p>
        </div>
        <DialogFooter>
          <Button type='submit' onClick={()=>handleSubmit()}>开始分析</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
