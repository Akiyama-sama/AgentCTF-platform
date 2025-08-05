import {  showSuccessMessage } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  useScenariosDialog,
} from '../context/scenarios-context'
import { ScenariosMutateDrawer } from './scenarios-mutate-drawer'
import { ModelResponse } from '@/types/docker-manager'
import { useScenario } from '@/hooks/use-scenario'
import { useAttackerAgentSession } from '@/hooks/use-ai'

function ScenarioDialogsInner({
  currentRow,
  open
}: {
  currentRow: ModelResponse
  open: string | null
}) {
  const { setOpen, setCurrentRow } = useScenariosDialog()
  const { deleteScenarioAsync } = useScenario(currentRow.uuid)
  const { cleanupUserAsync } = useAttackerAgentSession(currentRow.uuid)
  return (
    <>
      <ScenariosMutateDrawer
        key={`scenario-update-${currentRow.name}`}
        open={open === 'update'}
        onOpenChange={() => {
          setOpen('update')
          setTimeout(() => {
            setCurrentRow(null)
          }, 500)
        }}
        currentRow={currentRow}
      />

      <ConfirmDialog
        key='scenario-delete'
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
          showSuccessMessage(`场景${currentRow.name}已删除`)
          deleteScenarioAsync({ modelId: currentRow.uuid })
          // 清理攻击Agent的会话
          localStorage.removeItem(`attacker-agent-${currentRow.uuid}`)
          cleanupUserAsync({ params: { user_id: currentRow.uuid } })
        }}
        className='max-w-md'
        title={`删除场景: ${currentRow.name} ?`}
        desc={
          <>
            你确定要删除场景: <strong>{currentRow.name}</strong> ?
            <br />
            此操作无法撤销.
          </>
        }
        confirmText='删除'
      />
    </>
  )
}

export function ScenariosDialogs() {
  const { open, setOpen, currentRow } = useScenariosDialog()

  return (
    <>
      <ScenariosMutateDrawer
        key='scenario-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && <ScenarioDialogsInner currentRow={currentRow} open={open} />}
    </>
  )
}
