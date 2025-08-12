import { create } from 'zustand'

export interface ScenarioProcessState {
  attackAgentInitialized: boolean
  defenseAgentInitialized: boolean
  isAttackStarted: boolean
  isAttackFinished: boolean
  isReportGenerated: boolean
}

interface ProcessStore {
  step: number
  scenarioProcessState: ScenarioProcessState
  setScenarioProcessState: (
    updater: (state: ScenarioProcessState) => ScenarioProcessState,
  ) => void
}

const calculateStep = (scenarioProcessState: ScenarioProcessState): number => {
  if (
    scenarioProcessState.attackAgentInitialized &&
    scenarioProcessState.defenseAgentInitialized &&
    scenarioProcessState.isAttackStarted &&
    scenarioProcessState.isAttackFinished &&
    scenarioProcessState.isReportGenerated
  ) {
    return 4
  } else if (
    scenarioProcessState.attackAgentInitialized &&
    scenarioProcessState.defenseAgentInitialized &&
    scenarioProcessState.isAttackStarted &&
    scenarioProcessState.isAttackFinished
  ) {
    return 3
  } else if (
    scenarioProcessState.attackAgentInitialized &&
    scenarioProcessState.defenseAgentInitialized &&
    scenarioProcessState.isAttackStarted
  ) {
    return 2
  } else if (
    scenarioProcessState.attackAgentInitialized &&
    scenarioProcessState.defenseAgentInitialized
  ) {
    return 1
  } else {
    return 0
  }
}

const areStatesEqual = (
  a: ScenarioProcessState,
  b: ScenarioProcessState,
): boolean => {
  return (
    a.attackAgentInitialized === b.attackAgentInitialized &&
    a.defenseAgentInitialized === b.defenseAgentInitialized &&
    a.isAttackStarted === b.isAttackStarted &&
    a.isAttackFinished === b.isAttackFinished &&
    a.isReportGenerated === b.isReportGenerated
  )
}

export const useProcess = create<ProcessStore>((set, get) => ({
  step: 0,
  scenarioProcessState: {
    attackAgentInitialized: false,
    defenseAgentInitialized: false,
    isAttackStarted: false,
    isAttackFinished: false,
    isReportGenerated: false,
  },
  setScenarioProcessState: (updater) => {
    const currentProcessState = get().scenarioProcessState
    const newProcessState = updater(currentProcessState)

    if (areStatesEqual(currentProcessState, newProcessState)) {
      return
    }

    set(() => {
      const newStep = calculateStep(newProcessState)
      return {
        scenarioProcessState: newProcessState,
        step: newStep,
      }
    })
  },
}))