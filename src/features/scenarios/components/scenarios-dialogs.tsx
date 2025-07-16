import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  useScenariosDialog,
} from '../context/scenarios-context'
import { ScenariosMutateDrawer } from './scenarios-mutate-drawer'
import { ScenarioResponse } from '@/types/docker-manager'
import { useScenario } from '@/hooks/use-scenario'

function ScenarioDialogsInner({
  currentRow,
  open
}: {
  currentRow: ScenarioResponse
  open: string | null
}) {
  const { setOpen, setCurrentRow } = useScenariosDialog()
  const { deleteScenarioAsync } = useScenario(currentRow.uuid)

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
          showSubmittedData(currentRow, '以下场景已删除:')
          deleteScenarioAsync({ scenarioId: currentRow.uuid })
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
