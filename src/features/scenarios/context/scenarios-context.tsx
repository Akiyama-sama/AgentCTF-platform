import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { ModelResponse } from '@/types/docker-manager'

export type ScenariosDialogType = 'update' | 'delete' | 'create' |
'create_directory'|'create_file'|'update_file'|'delete_file'|'upload_file'|'get_file_content'

interface ScenariosDialogContextType {
  open: ScenariosDialogType | null
  setOpen: (str: ScenariosDialogType | null) => void
  currentRow: ModelResponse | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ModelResponse | null>>
  filePath: string | null
  setFilePath: React.Dispatch<React.SetStateAction<string | null>>
  isFile: boolean
  setIsFile: React.Dispatch<React.SetStateAction<boolean>>
}

const ScenariosDialogContext = React.createContext<ScenariosDialogContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ScenariosDialogProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ScenariosDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ModelResponse | null>(null)
  const [filePath, setFilePath] = useState<string | null>(null)
  const [isFile, setIsFile] = useState<boolean>(false)

  return (
    <ScenariosDialogContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        filePath,
        setFilePath,
        isFile,
        setIsFile,
      }}
    >
      {children}
    </ScenariosDialogContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useScenariosDialog = () => {
  const scenariosDialogContext = React.useContext(ScenariosDialogContext)

  if (!scenariosDialogContext) {
    throw new Error('useScenariosDialog has to be used within <ScenariosDialogContext>')
  }

  return scenariosDialogContext
}
