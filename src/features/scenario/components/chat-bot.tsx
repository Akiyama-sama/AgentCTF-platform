import { useEffect, useRef, useState } from 'react'
import { ChevronDown, SendHorizonal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAttackerAgentChat, useAttackerAgentSession } from '@/hooks/use-ai'
import { useScenarioContainers, useScenarioFile } from '@/hooks/use-scenario'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { showErrorMessage, showSuccessMessage } from '@/utils/show-submitted-data'
import { ApiResponseUserCleanupResponse, ApiResponseUserInitResponse } from '@/types/attacker-agent'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useNavigate } from '@tanstack/react-router'

const api_key = import.meta.env.VITE_DEEPSEEK_API_KEY

type ChatBotProps = {
  scenarioId: string
  className?: string
}

export function ChatBot({ className, scenarioId }: ChatBotProps) {
  const { portMap, attackerContainerName, targetContainerName } = useScenarioContainers(scenarioId)
  const {  messages, setMessages, input, handleInputChange, handleSubmit, isLoading, sendMessage } =
    useAttackerAgentChat({ user_id: scenarioId })
  const { status, initUserAsync, cleanupUserAsync } = useAttackerAgentSession(scenarioId)
  const { readmeContent } = useScenarioFile(scenarioId)
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const [isOptionVisible, setIsOptionVisible] = useState(false)
  
  const attacker_server_url = `http://${attackerContainerName}:${portMap.get(attackerContainerName!)?.mcpPort}/sse`
  const target_entrance_url = `http://${targetContainerName}:${portMap.get(targetContainerName!)?.targetEntrancePort}`


  const blackBoxMessage='当前靶机地址为:'+target_entrance_url+'请开始黑盒攻击'
  const whiteBoxMessage='当前靶机地址为:'+target_entrance_url+'\n'+'白盒信息为:'+readmeContent+'\n'+'请开始白盒攻击'

  const handleOptionClick = (message: string) => {
    sendMessage(message)
    setIsOptionVisible(false)
  }


  // 1. 当状态加载完毕且用户未初始化时，执行初始化
  useEffect(() => {
    if (status && !status.initialized) {
    initUserAsync({
        data: {
          api_key: api_key,
          user_id: scenarioId,
          attacker_server_url: attacker_server_url,
          target_entrance_url: target_entrance_url,
        },
      })
      .then((res:ApiResponseUserInitResponse) => {
        if(res.code==200){
          showSuccessMessage(res.message || '用户初始化成功')
        }
        if (res && res.code === 1001) {
          showErrorMessage(res.message || '用户初始化失败')
        }
      })
      .catch((err: Error) => {
        showErrorMessage(err?.message || '用户初始化失败')
      })
    }
  }, [status?.initialized, scenarioId])

  // 2. 当用户初始化成功后，如果还没有消息，则渲染选项，让用户选择进行黑盒还是白盒攻击
  useEffect(() => {
    // 确保已初始化、没有消息
    if (status?.initialized && messages.length === 0 ) {
      setIsOptionVisible(true)
    }
  }, [status?.initialized, messages.length])

  // 3. 消息列表更新时，自动滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className='flex flex-row items-center justify-center pt-2'>
        <CardTitle>Attacker Agent 初始化状态：{status?.initialized?'已初始化':'未初始化'}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <ChevronDown className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Button variant='outline' onClick={() => {
                localStorage.removeItem(`attacker-agent-${scenarioId}`)
                setMessages([])
              }}>清除本地消息</Button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button variant='outline' onClick={() => {
                cleanupUserAsync({params: {user_id: scenarioId}}).then((res:ApiResponseUserCleanupResponse) => {
                  if(res.code==200){
                    showSuccessMessage(res.message || 'Agent实例清除成功')
                  }
                  if (res && res.code === 1001) {
                    showErrorMessage(res.message || 'Agent实例清除失败')
                  }
                }).catch((err: Error) => {
                  showErrorMessage(err?.message || 'Agent实例清除失败')
                })
                localStorage.removeItem(`attacker-agent-${scenarioId}`)
                setMessages([])
                navigate({to: '/scenarios'})
              }}>清除Agent实例</Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className='flex flex-col flex-1 px-4 min-h-0'>
        <ScrollArea className='h-full '>
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
      </CardContent>
      {isOptionVisible && (
        <div className='border-t px-4 py-4'>
          <p className='mb-2 text-center text-sm text-muted-foreground'>选择一个模式开始：</p>
          <div className='flex justify-center gap-2'>
            <Button variant='outline' onClick={() => handleOptionClick(blackBoxMessage)}>
              进行黑盒攻击
            </Button>
            <Button variant='outline' onClick={() => handleOptionClick(whiteBoxMessage)}>
              进行白盒攻击
            </Button>
          </div>
        </div>
      )}
      <CardFooter className=''>
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
