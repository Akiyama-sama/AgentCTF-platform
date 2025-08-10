import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useExercisesDialog } from '../context/exercises-context'

export function ExercisesPrimaryButtons() {
  const { setOpen } = useExercisesDialog()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建演练</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
