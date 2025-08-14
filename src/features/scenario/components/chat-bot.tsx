import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ApiResponseUserCleanupResponse,
  ApiResponseUserInitResponse,
} from '@/types/attacker-agent'
import { ChevronDown, SendHorizonal, Bot, Shield, CheckCircle, XCircle } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
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
    isPending: isContainersPending,
    isSuccess: isContainersSuccess,
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
  const { setScenarioProcessState, scenarioProcessState } = useProcess()
  const { readmeContent } = useScenarioFile(scenarioId)
  const navigate = useNavigate()
  const [isOptionVisible, setIsOptionVisible] = useState(false)

  // --- 智能滚动逻辑 ---
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const idleTimerRef = useRef<number | null>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
  }, [messages, autoScroll, scrollToBottom])

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current)
      }

      const isAtBottom =
        scrollElement.scrollHeight -
          scrollElement.scrollTop -
          scrollElement.clientHeight <
        10

      if (isAtBottom) {
        setAutoScroll(true)
      } else {
        setAutoScroll(false)
        idleTimerRef.current = window.setTimeout(() => {
          setAutoScroll(true)
        }, 5000)
      }
    }

    scrollElement.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current)
      }
    }
  }, [scrollToBottom])
  // --- 智能滚动逻辑结束 ---

  const defender_mcp_url = portMap.get(defenderContainerName!)
    ? `http://localhost:${portMap.get(defenderContainerName!)?.mcpPort}/sse`
    : undefined
  const attacker_mcp_url = portMap.get(attackerContainerName!)
    ? `http://localhost:${portMap.get(attackerContainerName!)?.mcpPort}/sse`
    : undefined
  const target_entrance_url =
    portMap.get(targetContainerName!) && ipAddressMap.get(targetContainerName!)
      ? `http://${ipAddressMap.get(targetContainerName!)}:8080`
      : undefined

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

  const handleOptionClick = (
    message: string,
    whitebox_description?: string,
  ) => {
    sendMessage(message, whitebox_description)
    setIsOptionVisible(false)
    setScenarioProcessState((state: ScenarioProcessState) => ({
      ...state,
      isAttackStarted: true,
    }))
  }

  // 1. 当状态加载完毕数据准备完毕时候，且攻击agent未初始化时，执行初始化
  useEffect(() => {
    if (
      status &&
      !status.initialized &&
      attacker_mcp_url &&
      target_entrance_url &&
      isContainersSuccess &&
      !scenarioProcessState.isAttackFinished
    ) {
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
    } else if (status && status.initialized) {
      setScenarioProcessState((state: ScenarioProcessState) => ({
        ...state,
        attackAgentInitialized: true,
      }))
    }
  }, [
    status?.initialized,
    scenarioId,
    attacker_mcp_url,
    target_entrance_url,
    isContainersSuccess,
    scenarioProcessState.isAttackFinished,
  ])

  // 2. 当状态加载完毕且防御agent未初始化，且dind包信息存在时，执行初始化
  useEffect(() => {
    if (
      defenseAgentStatus &&
      !defenseAgentStatus.initialized &&
      dindPackageInfo &&
      defender_mcp_url &&
      isContainersSuccess &&
      !scenarioProcessState.isAttackFinished
    ) {
      initDefenderAgentAsync({
        model_id: scenarioId,
        container_pcap_mapping: dindPackageInfo,
        mcp_server_url: defender_mcp_url,
      }).then((res: ApiResponseInstanceInitResponse) => {
        if (res.code == 200) {
          showSuccessMessage(res.message || '防御Agent初始化成功')
          setScenarioProcessState((state: ScenarioProcessState) => ({
            ...state,
            defenseAgentInitialized: true,
          }))
        }
        if (res && res.code === 1001) {
          showErrorMessage(res.message || '防御Agent初始化失败')
        }
      })
    } else if (defenseAgentStatus && defenseAgentStatus.initialized) {
      setScenarioProcessState((state: ScenarioProcessState) => ({
        ...state,
        defenseAgentInitialized: true,
      }))
    }
  }, [
    defenseAgentStatus?.initialized,
    scenarioId,
    dindPackageInfo,
    defender_mcp_url,
    isContainersSuccess,
    scenarioProcessState.isAttackFinished,
  ])

  // 3. 当用户初始化成功后，如果还没有消息，则渲染选项，让用户选择进行黑盒还是白盒攻击
  useEffect(() => {
    if (messages.length > 0) {
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

  if (isContainersPending) {
    return (
      <div className='flex h-full w-full items-center justify-center p-4 shadow-xs'>
        <Loading />
      </div>
    )
  }

  return (
    <Card className={cn('flex flex-col pt-2', className)}>
      <CardHeader className='flex flex-col gap-3 pt-3 pb-2'>
        <div className='flex items-center justify-between gap-3'>
          <CardTitle className='text-base font-semibold text-foreground'>
            Agent 状态监控
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='h-7 w-7 p-0'>
                <ChevronDown className='h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full justify-start'
                  onClick={() => {
                    localStorage.removeItem(`attacker-agent-${scenarioId}`)
                    setMessages([])
                  }}
                >
                  清除本地消息
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full justify-start'
                  onClick={() => {
                    cleanupAttackerAgent({ params: { user_id: scenarioId } })
                      .then((res: ApiResponseUserCleanupResponse) => {
                        if (res.code == 200) {
                          showSuccessMessage(res.message || '攻击Agent实例清除成功')
                        }
                        if (res && res.code === 1001) {
                          showErrorMessage(res.message || '攻击Agent实例清除失败')
                        }
                      })
                      .catch((err: Error) => {
                        showErrorMessage(err?.message || '攻击Agent初始化失败')
                      })
                    cleanupDefenderAgentAsync().then(
                      (res: ApiResponseInstanceCleanupResponse) => {
                        if (res.code == 200) {
                          showSuccessMessage(res.message || '防御Agent实例清除成功')
                        }
                        if (res && res.code === 1001) {
                          showErrorMessage(res.message || '防御Agent实例清除失败')
                        }
                      },
                    )
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
        </div>
        
        {/* Agent 状态指示器 - 水平排列，占满宽度 */}
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-2'>
            <Bot className='h-4 w-4 text-primary' />
            <Badge 
              variant={status?.initialized ? 'default' : 'secondary'}
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-xs',
                status?.initialized 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {status?.initialized ? (
                <>
                  <CheckCircle className='h-3 w-3' />
                  已初始化
                </>
              ) : (
                <>
                  <XCircle className='h-3 w-3' />
                  未初始化
                </>
              )}
            </Badge>
          </div>
          
          <div className='flex items-center gap-2'>
            <Shield className='h-4 w-4 text-secondary' />
            <Badge 
              variant={defenseAgentStatus?.initialized ? 'default' : 'secondary'}
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-xs',
                defenseAgentStatus?.initialized 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {defenseAgentStatus?.initialized ? (
                <>
                  <CheckCircle className='h-3 w-3' />
                  已初始化
                </>
              ) : (
                <>
                  <XCircle className='h-3 w-3' />
                  未初始化
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className='flex min-h-0 flex-1 flex-col px-4'>
        <div ref={scrollRef} className='flex-1 overflow-y-auto min-h-0'>
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
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {message.role !== 'user' && (
                  <Avatar className='h-8 w-8 bg-primary/10 border border-primary/20'>
                    <AvatarFallback className='text-primary text-sm font-medium'>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground border border-border',
                  )}
                >
                  <p className='break-words whitespace-pre-wrap'>
                    {message.content}
                  </p>
                </div>
                {message.role === 'user' && (
                  <Avatar className='h-8 w-8 bg-accent/10 border border-accent/20'>
                    <AvatarFallback className='text-accent text-sm font-medium'>我</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {isOptionVisible && (
          <div className='mt-4 p-4 bg-muted/30 rounded-lg border border-border'>
            <p className='text-foreground mb-3 text-center text-sm font-medium'>
              选择一个模式开始：
            </p>
            <div className='flex justify-center gap-3'>
              <Button
                variant='outline'
                size='sm'
                className='flex-1 max-w-32'
                onClick={() => {
                  setBoxType('black')
                  handleOptionClick(blackBoxMessage)
                }}
              >
                黑盒攻击
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='flex-1 max-w-32'
                onClick={() => {
                  setBoxType('white')
                  handleOptionClick(
                    whiteBoxMessage,
                    readmeContent ?? JSON.stringify(targetContainer),
                  )
                }}
              >
                白盒攻击
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className='border-t bg-muted/20'>
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
            className='flex-1'
          />
          <Button 
            type='submit' 
            disabled={isLoading || !input.trim()}
            size='sm'
            className='px-3'
          >
            <SendHorizonal className='h-4 w-4' />
            <span className='sr-only'>发送</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
