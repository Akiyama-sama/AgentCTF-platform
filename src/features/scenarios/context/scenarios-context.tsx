import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { ScenarioResponse } from '@/types/docker-manager'

export type ScenariosDialogType = 'update' | 'delete' | 'create'

interface ScenariosDialogContextType {
  open: ScenariosDialogType | null
  setOpen: (str: ScenariosDialogType | null) => void
  currentRow: ScenarioResponse | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ScenarioResponse | null>>
}

const ScenariosDialogContext = React.createContext<ScenariosDialogContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ScenariosDialogProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ScenariosDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ScenarioResponse | null>(null)

  return (
    <ScenariosDialogContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
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
