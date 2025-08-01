import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { ModelResponse } from '@/types/docker-manager'

export type ExercisesDialogType = 'update' | 'delete' | 'create' | 'submit_flag' | 'select'

interface ExercisesDialogContextType {
  open: ExercisesDialogType | null
  setOpen: (str: ExercisesDialogType | null) => void
  currentRow: ModelResponse | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ModelResponse | null>>

}

const ExercisesDialogContext = React.createContext<ExercisesDialogContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ExercisesDialogProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ExercisesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ModelResponse | null>(null)

  return (
    <ExercisesDialogContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
      }}
    >
      {children}
    </ExercisesDialogContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useExercisesDialog = () => {
  const exercisesDialogContext = React.useContext(ExercisesDialogContext)

  if (!exercisesDialogContext) {
    throw new Error('useExercisesDialog has to be used within <ExercisesDialogContext>')
  }

  return exercisesDialogContext
}
