import { useCallback } from 'react';
import { useScenario } from '@/hooks/use-scenario';
import { type ActionType } from '@/features/scenarios/data/data';
import { useScenariosDialog } from '../context/scenarios-context';

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
  const { scenario, updateState } = useScenario(scenarioId);
  const { setOpen, setCurrentRow } = useScenariosDialog();
  const { startBuild, stopBuild } = buildActions;
  
  const handleAction = useCallback((action: ActionType) => {
    if (!scenario) return
    switch (action) {
      case 'build':
        updateState({ scenarioId, data: { action } });
        startBuild(scenarioId);
        break;
      case 'start':
        // `start` 动作也应该先停止当前的构建日志流
        stopBuild();
        updateState({ scenarioId, data: { action } });
        break;
      case 'stop':
        // `stop` 动作更新状态，但让 SSE 连接保持，直到新的构建或操作开始
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
  }, [scenarioId, updateState, setOpen, startBuild, stopBuild]);

  return { handleAction };
}; 