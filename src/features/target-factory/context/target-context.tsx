import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'


type Target=string | null

export type TargetDialogType =  'delete' | 'create' 

interface TargetDialogContextType {
  open: TargetDialogType | null
  setOpen: (str: TargetDialogType | null) => void
  currentRow: Target | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Target | null>>

}

const TargetDialogContext = React.createContext<TargetDialogContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TargetDialogProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TargetDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Target | null>(null)

  return (
    <TargetDialogContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
      }}
    >
      {children}
    </TargetDialogContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTargetDialog = () => {
  const targetDialogContext = React.useContext(TargetDialogContext)

  if (!targetDialogContext) {
    throw new Error('useTargetDialog has to be used within <TargetDialogContext>')
  }

    return targetDialogContext
}
