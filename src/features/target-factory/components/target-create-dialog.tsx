import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAgentStream } from '@/hooks/use-compose-agent'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: string
}

const createSchema = z.object({
  model: z.string().min(1, '模型必填'),
  max_steps: z.number().min(1, '最大步数必填,且必须为数字'),
  description: z.string().min(1, '描述必填'),
})
type CreateForm = z.infer<typeof createSchema>

export function TargetCreateDialog({ open, onOpenChange }: Props) {
  const { startStream } = useAgentStream()

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      model: '',
      max_steps: 40,
      description: '',
    },
  })

  const onSubmit = (data: CreateForm) => {
    startStream({
      description: data.description,
      model: data.model,
      max_steps: data.max_steps,
    })
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='overflow-hidden'>
        <DialogHeader>
          <DialogTitle>创建动态靶机</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id='targets-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='min-h-0 space-y-5 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='model'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>模型选择</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder='请选择模型类别'/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='deepseek-reasoner'>
                          deepseek-reasoner
                        </SelectItem>
                        <SelectItem value='deepseek-chat'>
                          deepseek-chat
                        </SelectItem>
                        <div className='text-muted-foreground p-2 text-xs'>
                          <p>
                            reasoner模型大约需要10分钟，但靶机生成成功率较高
                          </p>
                          <p>chat模型大约需要3分钟，但靶机生成成功率较低</p>
                        </div>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='max_steps'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>最大步数</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='请输入最大步数'
                      type='number'
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='请输入描述'
                      className='h-40'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type='submit' form='targets-form'>
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
