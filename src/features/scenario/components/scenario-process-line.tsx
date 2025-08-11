import ProcessLine from "@/components/process-line";
import { useProcess } from "../context/process-context";
import { useScenarioReport } from "@/hooks/use-report";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

type ScenarioProcessLineProps = {
  scenarioId: string
}

export default function ScenarioProcessLine({scenarioId}:ScenarioProcessLineProps) {
  const navigate = useNavigate()
  const { step ,setScenarioProcessState} = useProcess()
  const {analyzeAsync,status:reportStatus}=useScenarioReport(scenarioId,{refetchStatus:true})
  useEffect(()=>{
    if(reportStatus?.status==='completed'){
      setScenarioProcessState((state) => ({
        ...state,
        isReportGenerated: true,
      }))
    }
  },[reportStatus?.status])
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
      purpose: '报告用于溯源进攻策略，防御手段，供指挥官进行学习复盘',
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
    <ProcessLine lineItems={items} currentStep={step} />
  )
}