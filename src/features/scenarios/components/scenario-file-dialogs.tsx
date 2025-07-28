import { showSubmittedData } from "@/utils/show-submitted-data"
import { useScenariosDialog } from "../context/scenarios-context"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useScenarioFile } from "@/hooks/use-scenario"
import { CreateDirectoryDialog, CreateFileDialog, UploadFileDialog } from "./file-dialog"
import EditFileDialog from "./edit-file-dialog"


export function ScenarioFileDialogs() {
  const { currentRow,filePath, setFilePath,open, setOpen ,isFile} = useScenariosDialog()
  const { deleteFile } = useScenarioFile(currentRow?.uuid ?? '')
  const scenarioId=currentRow?.uuid ?? ''
  if(!scenarioId) return null
  if(!filePath) return null
 
  return (
    
    <>
    <EditFileDialog
        open={open === 'update_file'}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
          }
        }}
        scenarioId={scenarioId}
        basePath={filePath}
    />
    <UploadFileDialog
        open={open === 'upload_file'}
        onOpenChange={() => {
          setOpen('upload_file')
        }}
        scenarioId={scenarioId}
        basePath={filePath}
        isFileNode={isFile}
    />
    <CreateDirectoryDialog
        open={open === 'create_directory'}
        onOpenChange={() => {
          setOpen('create_directory')
        }}
        scenarioId={scenarioId}
        basePath={filePath}
        isFileNode={isFile}
    />
    <CreateFileDialog
        open={open === 'create_file'}
        onOpenChange={() => {
          setOpen('create_file')
        }}
        scenarioId={scenarioId}
        basePath={filePath}
        isFileNode={isFile}
    />
    <ConfirmDialog
        key={`scenario-${filePath}-delete`}
        destructive
        open={open === 'delete_file'}
        onOpenChange={() => {
          setOpen('delete_file')
        }}
        handleConfirm={() => {
          setOpen(null)
          setTimeout(() => {
            setFilePath(null)
          }, 500)
          showSubmittedData(filePath, '以下文件已删除:')
          deleteFile({ 
            modelId: scenarioId,
            data: {
              file_path: filePath
            }
        })
        }}
        className='max-w-md'
        title={`删除文件: ${filePath} ?`}
        desc={
          <>
            你确定要删除文件: <strong>{filePath}</strong> ?
            <br />
            此操作无法撤销.
          </>
        }
        confirmText='删除'
      />
    </>
    
  )
}

