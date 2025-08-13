import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ApiResponseUserCleanupResponse,
  ApiResponseUserInitResponse,
} from '@/types/attacker-agent'
import { ChevronDown, SendHorizonal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  showErrorMessage,
  showSuccessMessage,
} from '@/utils/show-submitted-data'
import {
  useAttackerAgentChat,
  useAttackerAgentSession,
  useDefenderAgentSession,
} from '@/hooks/use-ai'
import { useDind } from '@/hooks/use-dind'
import { useScenarioContainers, useScenarioFile } from '@/hooks/use-scenario'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ScenarioProcessState, useProcess } from '../store/process-store'
import {
  ApiResponseInstanceCleanupResponse,
  ApiResponseInstanceInitResponse,
} from '@/types/defender-agent'
import Loading from '@/components/Loading'


const api_key = import.meta.env.VITE_DEEPSEEK_API_KEY

type ChatBotProps = {
  scenarioId: string
  className?: string
}

export function ChatBot({ className, scenarioId }: ChatBotProps) {
  const {
    portMap,
    attackerContainerName,
    targetContainerName,
    defenderContainerName,
    targetContainer,
    ipAddressMap,
    isPending:isContainersPending,
    isSuccess:isContainersSuccess,
  } = useScenarioContainers(scenarioId)
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    sendMessage,
    setBoxType,
    
  } = useAttackerAgentChat({ user_id: scenarioId })
  const {
    status,
    initUserAsync: initeAttackerAgent,
    cleanupUserAsync: cleanupAttackerAgent,
  } = useAttackerAgentSession(scenarioId)
  const {
    status: defenseAgentStatus,
    initInstanceAsync: initDefenderAgentAsync,
    cleanupInstanceAsync: cleanupDefenderAgentAsync,
  } = useDefenderAgentSession(scenarioId)
  const { dindPackageInfo } = useDind(scenarioId)
  const { setScenarioProcessState,scenarioProcessState} = useProcess()
  const { readmeContent } = useScenarioFile(scenarioId)
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isOptionVisible, setIsOptionVisible] = useState(false)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  
  const defender_mcp_url = portMap.get(defenderContainerName!)?`http://localhost:${portMap.get(defenderContainerName!)?.mcpPort}/sse`:undefined
  const attacker_mcp_url = portMap.get(attackerContainerName!)?`http://localhost:${portMap.get(attackerContainerName!)?.mcpPort}/sse`:undefined
  const target_entrance_url = (portMap.get(targetContainerName!)&&ipAddressMap.get(targetContainerName!))?`http://${ipAddressMap.get(targetContainerName!)}:${portMap.get(targetContainerName!)?.targetEntrancePort}`:undefined

  const blackBoxMessage =
    '当前靶机地址为:' + target_entrance_url + '请开始黑盒攻击'
  const whiteBoxMessage =
    '当前靶机地址为:' +
    target_entrance_url +
    '\n' +
    '白盒信息为:' +
    readmeContent +
    '\n' +
    '请开始白盒攻击'

  const handleOptionClick = (message: string,whitebox_description?:string) => {
    sendMessage(message,whitebox_description)
    setIsOptionVisible(false)
    setScenarioProcessState((state: ScenarioProcessState) => ({
      ...state,
      isAttackStarted: true,
    }))
  }

  // 1. 当状态加载完毕数据准备完毕时候，且攻击agent未初始化时，执行初始化
  useEffect(() => {
    if (status && !status.initialized&&attacker_mcp_url&&target_entrance_url&&isContainersSuccess&&!scenarioProcessState.isAttackFinished) {
      initeAttackerAgent({
        data: {
          api_key: api_key,
          user_id: scenarioId,
          attacker_server_url: attacker_mcp_url,
          target_entrance_url: target_entrance_url,
        },
      })
        .then((res: ApiResponseUserInitResponse) => {
          if (res.code == 200) {
            showSuccessMessage(res.message || '攻击Agent初始化成功')
            setScenarioProcessState((state: ScenarioProcessState) => ({
              ...state,
              attackAgentInitialized: true,
            }))
          }
          if (res && res.code === 1001) {
            showErrorMessage(res.message || '攻击Agent初始化失败')
          }
        })
        .catch((err: Error) => {
          showErrorMessage(err?.message || '攻击Agent初始化失败')
        })
    }else if(status && status.initialized){
      setScenarioProcessState((state: ScenarioProcessState) => ({
        ...state,
        attackAgentInitialized: true,
      }))
    }
  }, [status?.initialized, scenarioId,attacker_mcp_url,target_entrance_url,isContainersSuccess,scenarioProcessState.isAttackFinished])

  // 2. 当状态加载完毕且防御agent未初始化，且dind包信息存在时，执行初始化
  useEffect(() => {
    if (defenseAgentStatus && !defenseAgentStatus.initialized&&dindPackageInfo&&defender_mcp_url&&isContainersSuccess&&!scenarioProcessState.isAttackFinished) {
      initDefenderAgentAsync({
        model_id: scenarioId,
        container_pcap_mapping: dindPackageInfo,
        mcp_server_url: defender_mcp_url,
      }).then((res:ApiResponseInstanceInitResponse)=>{
        if(res.code==200){
          showSuccessMessage(res.message || '防御Agent初始化成功')
          setScenarioProcessState((state: ScenarioProcessState) => ({
            ...state,
            defenseAgentInitialized: true,
          }))
        }
        if(res && res.code === 1001) {
          showErrorMessage(res.message || '防御Agent初始化失败')
        }
      })
    }else if(defenseAgentStatus && defenseAgentStatus.initialized){
      setScenarioProcessState((state: ScenarioProcessState) => ({
        ...state,
        defenseAgentInitialized: true,
      }))
    }
  }, [defenseAgentStatus?.initialized, scenarioId, dindPackageInfo, defender_mcp_url, isContainersSuccess, scenarioProcessState.isAttackFinished])

  // 3. 当用户初始化成功后，如果还没有消息，则渲染选项，让用户选择进行黑盒还是白盒攻击
  useEffect(() => {
    if(messages.length>0){
      setScenarioProcessState((state: ScenarioProcessState) => ({
        ...state,
        isAttackStarted: true,
      }))
    }
    // 确保已初始化、没有消息
    if (status?.initialized && messages.length === 0) {
      setIsOptionVisible(true)
    }
  }, [status?.initialized, messages.length])

  // 3. 消息列表更新时，自动滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])


  if(isContainersPending){
    return <div className='flex h-full w-full items-center justify-center p-4 shadow-xs'>
      <Loading />
    </div>
  }
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className='flex flex-row items-center justify-center pt-2'>
        <CardTitle>
          Attacker Agent 初始化状态：
          {status?.initialized ? '已初始化' : '未初始化'}
          Defense Agent 初始化状态：
          {defenseAgentStatus?.initialized ? '已初始化' : '未初始化'}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <ChevronDown className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Button
                variant='outline'
                onClick={() => {
                  localStorage.removeItem(`attacker-agent-${scenarioId}`)
                  setMessages([])
                }}
              >
                清除本地消息
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button
                variant='outline'
                onClick={() => {
                  cleanupAttackerAgent({ params: { user_id: scenarioId } })
                    .then((res: ApiResponseUserCleanupResponse) => {
                      if (res.code == 200) {
                        showSuccessMessage(res.message || 'Agent实例清除成功')
                      }
                      if (res && res.code === 1001) {
                        showErrorMessage(res.message || 'Agent实例清除失败')
                      }
                    })
                    .catch((err: Error) => {
                      showErrorMessage(err?.message || 'Agent实例清除失败')
                    })
                  cleanupDefenderAgentAsync().then((res:ApiResponseInstanceCleanupResponse)=>{
                    if(res.code==200){
                      showSuccessMessage(res.message || '防御Agent实例清除成功')
                    }
                    if(res && res.code === 1001) {
                      showErrorMessage(res.message || '防御Agent实例清除失败')
                    }
                  })
                  localStorage.removeItem(`attacker-agent-${scenarioId}`)
                  setMessages([])
                  navigate({ to: '/scenarios' })
                }}
              >
                清除Agent实例
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className='flex min-h-0 flex-1 flex-col px-4'>
        <ScrollArea className='h-full'>
          <div className='space-y-4'>
            {messages.length === 0 && (
              <div className='text-muted-foreground flex h-full items-center justify-center'>
                开始与 Attacker Agent 对话
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role !== 'user' && (
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className='break-words whitespace-pre-wrap'>
                    {message.content}
                  </p>
                </div>
                {message.role === 'user' && (
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback>我</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        {isOptionVisible && (
        <div className=' px-4 py-4'>
          <p className='text-muted-foreground mb-2 text-center text-sm'>
            选择一个模式开始：
          </p>
          <div className='flex justify-center gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setBoxType('black')
                handleOptionClick(blackBoxMessage)
              }}
            >
              进行黑盒攻击
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                setBoxType('white')
                handleOptionClick(whiteBoxMessage,readmeContent??JSON.stringify(targetContainer))
              }}
            >
              进行白盒攻击
            </Button>
          </div>
        </div>
      )}
      </CardContent>
      
      <CardFooter className='border-t'>
        <form
          onSubmit={handleSubmit}
          className='flex w-full items-center gap-2'
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder='与智能体对话...'
            disabled={isLoading}
            autoFocus
          />
          <Button type='submit' disabled={isLoading || !input.trim()}>
            <SendHorizonal className='h-4 w-4' />
            <span className='sr-only'>发送</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
