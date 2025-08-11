import { ConfirmDialog } from '@/components/confirm-dialog'
import { useTargetDialog } from '../context/target-context'
import { TargetCreateDialog } from './target-create-dialog'
import { useWorkspace } from '@/hooks/use-compose-agent'

export function TargetDialog() {
  const { open, setOpen, currentRow, setCurrentRow } = useTargetDialog()
  const { deleteWorkspaceAsync } = useWorkspace(currentRow)
  return (
    <>
      <TargetCreateDialog
        key='target-create-dialog'
        open={open === 'create'}
        onOpenChange={() => {
          setOpen('create')
          setTimeout(() => {
            setCurrentRow(null)
          }, 500)
        }}
      />

      {currentRow && (
        <>
          <ConfirmDialog
            key='target-delete'
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
              deleteWorkspaceAsync({ name: currentRow })
            }}
            className='max-w-md'
            title={`删除动态靶机: ${currentRow} ?`}
            desc={
              <>
                你确定要删除动态靶机: <strong>{currentRow}</strong> ?
                <br />
                此操作无法撤销.
              </>
            }
            confirmText='删除'
          />
        </>
      )}
    </>
  )
}
