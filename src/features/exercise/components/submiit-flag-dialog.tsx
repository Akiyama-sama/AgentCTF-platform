import { ModelResponse } from '@/types/docker-manager'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  onOpenChange: () => void
  currentRow: ModelResponse
}

export function SubmitFlagDialog({
  open,
  onOpenChange,
  currentRow,
}:Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>练习：{currentRow.name}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <Label>flag</Label>
            <Input type='text' />
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button>提交</Button>
      </DialogFooter>
    </Dialog>
  )
}