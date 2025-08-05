import { ModelResponse } from '@/types/docker-manager'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ModelResponse
}

export function SubmitFlagDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex flex-col gap-4'>
        <DialogHeader>
          <DialogTitle>练习：{currentRow.name}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <p className='text-muted-foreground text-sm'>
            题目描述：{currentRow.description}
          </p>
          <div className='flex items-center gap-2'>
            靶机入口URL：10.255.255.254:2222
            <button className='hover:bg-muted rounded-md p-2'>
              <Copy size={18} />
            </button>
          </div>
        </div>
        <Input type='text' placeholder='请输入 flag' className='w-full' />
        <DialogFooter>
          <Button>提交 flag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
