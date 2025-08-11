import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useTargetDialog } from '../context/target-context'

export function TargetPrimaryButtons() {
  const { setOpen } = useTargetDialog()
  return (
    <Button className='flex gap-2' size='sm' onClick={() => setOpen('create')}>
      <IconPlus size={16} />
      <span>创建动态靶机</span>
    </Button>
  )
}
