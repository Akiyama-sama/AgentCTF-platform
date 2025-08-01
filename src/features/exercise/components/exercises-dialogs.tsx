import { ModelResponse } from '@/types/docker-manager'
import { showSuccessMessage } from '@/utils/show-submitted-data'
import { useExercise } from '@/hooks/use-exercise'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useExercisesDialog } from '../context/exercises-context'
import { ExercisesMutateDrawer } from './exercises-mutate-drawer'
import { SubmitFlagDialog } from './submiit-flag-dialog'

function ExercisesDialogsInner({
  currentRow,
  open,
}: {
  currentRow: ModelResponse
  open: string | null
}) {
  const { setOpen, setCurrentRow } = useExercisesDialog()
  const { deleteExerciseAsync } = useExercise(currentRow.uuid)

  return (
    <>
      <ExercisesMutateDrawer
        key={`exercise-update-${currentRow.name}`}
        open={open === 'update'}
        onOpenChange={() => {
          setOpen('update')
          setTimeout(() => {
            setCurrentRow(null)
          }, 500)
        }}
        currentRow={currentRow}
      />

      <SubmitFlagDialog
        key='exercise-submit-flag'
        open={open === 'submit_flag'}
        onOpenChange={() => {
          setOpen('submit_flag')
          setTimeout(() => {
            setCurrentRow(null)
          }, 500)
        }}
        currentRow={currentRow}
      />

      <ConfirmDialog
        key='exercise-delete'
        destructive
        open={open === 'delete'}
        onOpenChange={() => {
          setOpen('delete')
        }}
        handleConfirm={() => {
          setOpen(null)
          setTimeout(() => {
            setCurrentRow(null)
          }, 500)
          showSuccessMessage(`演练${currentRow.name}已删除`)
          deleteExerciseAsync({ modelId: currentRow.uuid })
        }}
        className='max-w-md'
        title={`删除场景: ${currentRow.name} ?`}
        desc={
          <>
            你确定要删除演练: <strong>{currentRow.name}</strong> ?
            <br />
            此操作无法撤销.
          </>
        }
        confirmText='删除'
      />
    </>
  )
}

export function ExercisesDialogs() {
  const { open, setOpen, currentRow } = useExercisesDialog()

  return (
    <>
      <ExercisesMutateDrawer
        key='exercise-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <ExercisesDialogsInner currentRow={currentRow} open={open} />
      )}
    </>
  )
}
