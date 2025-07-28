import { useCallback, useState, useEffect } from 'react';
import { useScenario } from '@/hooks/use-scenario';
import { type ActionType } from '@/features/scenarios/data/data';
import { useScenariosDialog } from '../context/scenarios-context';
import { useNavigate } from '@tanstack/react-router';

/**
 * 一个专门用于处理单个场景操作逻辑的 Hook。
 * 它封装了所有 actionType 到具体 API 调用的映射关系。
 * @param scenarioId - 场景的 UUID
 * @param buildActions - 从父组件传入的构建操作
 * @returns 返回一个 handleAction 函数，用于处理所有来自 UI 的操作。
 */
export const useScenarioActions = (
  scenarioId: string,
  createBuildConnection: (scenarioId: string) => void,
  closeBuildConnection: () => void
) => {
  const { scenario, updateState, isUpdatingState } = useScenario(scenarioId);
  const { setOpen, setCurrentRow } = useScenariosDialog();
  const navigate = useNavigate();

  // 新增一个 state 来追踪正在进行中的 action
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

  useEffect(() => {
    if (!isUpdatingState) {
      
      setPendingAction(null);
    }
  }, [isUpdatingState]);
  
  const handleAction = useCallback((action: ActionType) => {
    if (!scenario) return
    switch (action) {
      case 'enter':
        navigate({
          to: '/scenarios/$scenarioId',
          params: { scenarioId },
        });
        break
      case 'build':
        setCurrentRow(scenario)
        setPendingAction('build'); 
        updateState({ modelId: scenarioId, data: { action } });
        createBuildConnection(scenarioId)
        break;
      case 'force_stop_build':
        setCurrentRow(scenario)
        setPendingAction('force_stop_build'); 
        updateState({ modelId: scenarioId, data: { action } });
        break;
      case 'start':
        setCurrentRow(scenario)
        setPendingAction('start'); 
        updateState({ modelId: scenarioId, data: { action } });
        break;
      case 'stop':
        setCurrentRow(scenario)
        setPendingAction('stop'); 
        updateState({ modelId: scenarioId, data: { action } });
        break;
      case 'delete':
        setCurrentRow(scenario)
        closeBuildConnection()
        setOpen('delete');
        break;
      case 'view_details':
        setCurrentRow(scenario)
        setOpen('update');
        break;
    }
  }, [scenarioId, updateState, setOpen, scenario, setCurrentRow, navigate,createBuildConnection,closeBuildConnection]);

  return { handleAction, pendingAction };
}; 
