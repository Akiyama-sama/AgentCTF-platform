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
  buildActions: {
    startBuild: (scenarioId: string) => void;
    stopBuild: () => void;
  },
) => {
  const { scenario, updateState, isUpdatingState } = useScenario(scenarioId);
  const { setOpen, setCurrentRow } = useScenariosDialog();
  const { startBuild, stopBuild } = buildActions;
  const navigate = useNavigate();

  // 新增一个 state 来追踪正在进行中的 action
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

  // 当 updateState 的 isPending 状态从未决（true）变到已决（false）时，
  // 我们知道异步操作已完成，可以清除 pendingAction 状态。
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
        setPendingAction('build'); 
        updateState({ scenarioId, data: { action } });
        startBuild(scenarioId);
        break;
      case 'start':
        setPendingAction('start'); 
        stopBuild();
        updateState({ scenarioId, data: { action } });
        break;
      case 'stop':
        setPendingAction('stop'); 
        updateState({ scenarioId, data: { action } });
        break;
      case 'delete':
        setCurrentRow(scenario)
        setOpen('delete');
        break;
      case 'view_details':
        setCurrentRow(scenario)
        setOpen('update');
        break;
    }
  }, [scenarioId, updateState, setOpen, startBuild, stopBuild, scenario, setCurrentRow, navigate]);

  return { handleAction, pendingAction };
}; 
