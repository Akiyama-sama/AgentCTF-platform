import { useEffect, useRef } from 'react'
import { SendHorizonal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAttackerAgentChat, useAttackerAgentSession } from '@/hooks/use-ai'
import { useScenarioContainers } from '@/hooks/use-scenario'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { showErrorMessage, showSuccessMessage } from '@/utils/show-submitted-data'
import { ApiResponseUserInitResponse } from '@/types/attacker-agent'

const api_key = import.meta.env.VITE_DEEPSEEK_API_KEY

type ChatBotProps = {
  scenarioId: string
  className?: string
}

export function ChatBot({ className, scenarioId }: ChatBotProps) {
  const { portMap, attackerContainerName } = useScenarioContainers(scenarioId)
  const { messages, input, handleInputChange, handleSubmit, isLoading, setCustomInfo, sendMessage } =
    useAttackerAgentChat({ user_id: scenarioId })
  const { status, initUserAsync } = useAttackerAgentSession(scenarioId)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 1. 当状态加载完毕且用户未初始化时，执行初始化
  useEffect(() => {
    if (status && !status.initialized) {
    initUserAsync({
        data: {
          api_key: api_key,
          user_id: scenarioId,
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
  }, [status, initUserAsync, scenarioId])

  // 2. 当用户初始化成功后，如果还没有消息，则自动发送第一条消息
  useEffect(() => {
    const MCPPort = portMap.get(attackerContainerName!)
    // 确保已初始化、没有消息、并且端口已就绪
    if (status?.initialized && messages.length === 0 && MCPPort) {
      const info = {
        flag: 2,
        url: `localhost:${MCPPort}`,
      };
      setCustomInfo(info);
      sendMessage(`当前攻击机MCP地址为:${info.url}，目标靶场flag为:${info.flag}`); 
    }
  }, [status?.initialized, messages.length, portMap, attackerContainerName, setCustomInfo, sendMessage])

  // 3. 消息列表更新时，自动滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className='items-center justify-center pt-2'>
        <CardTitle>Attacker Agent 初始化状态：{status?.initialized?'已初始化':'未初始化'}</CardTitle>
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
