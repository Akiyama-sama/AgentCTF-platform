import ProcessLine from "@/components/process-line";
import { useProcess } from "../store/process-store";
import { useScenarioReport } from "@/hooks/use-report";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAttackerAgentLogs, useDefenderAgentLogs } from "@/hooks/use-log";
import { useDefenderAgentSession } from "@/hooks/use-ai";

type ScenarioProcessLineProps = {
  scenarioId: string
  className?: string
}

export default function ScenarioProcessLine({scenarioId,className}:ScenarioProcessLineProps) {
  const navigate = useNavigate()
  const { step ,setScenarioProcessState,scenarioProcessState} = useProcess()
  const {analyzeAsync,status:reportStatus}=useScenarioReport(scenarioId,{refetchStatus:scenarioProcessState.isAttackFinished})
  const {stopLogs:stopAttackerLogs}=useAttackerAgentLogs(scenarioId)
  const {stopLogs:stopDefenderLogs}=useDefenderAgentLogs(scenarioId)
  const {cleanupInstanceAsync:clearDefenderAgent}=useDefenderAgentSession(scenarioId)
  useEffect(()=>{
    if(scenarioProcessState.isAttackFinished&&reportStatus?.status==='completed'){
      setScenarioProcessState((state) => ({
        ...state,
        isReportGenerated: true,
      }))
    }
  },[reportStatus?.status,scenarioProcessState.isAttackFinished])
  const items = [
    {
      id: 1,
      title: '实例化agent',
      purpose: '初始化攻击/防御agent',
      description: '攻击/防御agent实例化完成',
    },
    {
      id: 2,
      title: '开始攻击',
      purpose: '指挥官下达攻击指令',
      description: '指挥官指示Agent进行黑盒/白盒攻击,攻击一段时间后,Agent会自行判断是否攻击完毕，指挥官也可以自行手动停止攻击->',
      action:{
        label:'停止攻击',
        onClick:()=>{
          clearDefenderAgent().then(()=>{
            stopAttackerLogs()
            stopDefenderLogs()
          })
          
          
          setScenarioProcessState((state) => ({
            ...state,
            isAttackFinished: true,
          }))
        }
      }
    },
    {
      id: 3,
      title: '演练周期结束',
      purpose: 'Agent攻防演练周期结束',
      description: '攻击/防御agent结束，指挥官可以与攻击Agent进行对话，但不会对靶机进行攻击,或者可以直接开始生成演练报告->',
      action:{
        label:'生成演练报告',
        onClick:()=>{
          analyzeAsync()
        }
      }
    },
    {
      id: 4,
      title: '演练报告生成',
      purpose: '用于溯源、复盘',
      description: '防御演练报告已生成，演练结束->',
      action:{
        label:'查看演练报告',
        onClick:()=>{
          navigate({to:'/scenarios/$scenarioId/report',params:{scenarioId}})
        }
      }
    },
  ]
  return (
    <ProcessLine lineItems={items} currentStep={step} className={cn(className,'overflow-y-auto no-scrollbar')} />
  )
}