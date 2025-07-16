import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useScenariosDialog } from '../context/scenarios-context'

export function ScenariosPrimaryButtons() {
  const { setOpen } = useScenariosDialog()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建场景</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
