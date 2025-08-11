import React, { useEffect, useState } from 'react'
export interface ScenarioProcessState {
  attackAgentInitialized: boolean;//攻击agent是否初始化
  defenseAgentInitialized: boolean;//防御agent是否初始化
  isAttackStarted: boolean; // 用户是否发起攻击
  isAttackFinished: boolean; // 确认攻击是否结束
  isReportReady: boolean;//报告是否生成
}

interface ProcessContextType {
  step: number
  setScenarioProcessState: React.Dispatch<React.SetStateAction<ScenarioProcessState>>
}

const ProcessContext = React.createContext<ProcessContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ProcessProvider({ children }: Props) {
  const [step, setStep] = useState<number>(0)
  const [scenarioProcessState, setScenarioProcessState] = useState<ScenarioProcessState>({
    attackAgentInitialized: false,
    defenseAgentInitialized: false,
    isAttackStarted: false,
    isAttackFinished: false,
    isReportReady: false,
  })
  useEffect(()=>{
    setStep(calcualteStep(scenarioProcessState))
  },[scenarioProcessState])

  return (
    <ProcessContext value={{ step,setScenarioProcessState }}>
      {children}
    </ProcessContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProcess = () => {
  const processContext = React.useContext(ProcessContext)

  if (!processContext) {
    throw new Error('useProcess has to be used within <ProcessContext>')
  }

  return processContext
}

function calcualteStep(scenarioProcessState: ScenarioProcessState):number{
  if(scenarioProcessState.attackAgentInitialized && scenarioProcessState.defenseAgentInitialized
   && scenarioProcessState.isAttackStarted
   && scenarioProcessState.isAttackFinished
   && scenarioProcessState.isReportReady
  ){
    return 4
  }
  else if(scenarioProcessState.attackAgentInitialized && scenarioProcessState.defenseAgentInitialized
    && scenarioProcessState.isAttackStarted
    && scenarioProcessState.isAttackFinished
  ){
    return 3
  }
    else if(scenarioProcessState.attackAgentInitialized && scenarioProcessState.defenseAgentInitialized
    && scenarioProcessState.isAttackStarted
  ){
      return 2
  }else if(scenarioProcessState.attackAgentInitialized && scenarioProcessState.defenseAgentInitialized){
    return 1
  }else{
    return 0
  }
}