import { useCallback, useState, useEffect } from 'react';
import { useExercise } from '@/hooks/use-exercise';
import { type ActionType } from '@/features/exercise/data/data';
import { useExercisesDialog } from '../context/exercises-context';
import { useNavigate } from '@tanstack/react-router';

/**
 * 一个专门用于处理单个场景操作逻辑的 Hook。
 * 它封装了所有 actionType 到具体 API 调用的映射关系。
 * @param scenarioId - 场景的 UUID
 * @param buildActions - 从父组件传入的构建操作
 * @returns 返回一个 handleAction 函数，用于处理所有来自 UI 的操作。
 */
export const useExerciseActions = (
  exerciseId: string,
  createBuildConnection: (exerciseId: string) => void,
  closeBuildConnection: () => void
) => {
  const { exercise, updateState,isUpdatingState  } = useExercise(exerciseId);
  const { setOpen, setCurrentRow } = useExercisesDialog();
  const navigate = useNavigate();

  // 新增一个 state 来追踪正在进行中的 action
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

  useEffect(() => {
    if (!isUpdatingState) {
      
      setPendingAction(null);
    }
  }, [isUpdatingState]);
  
  const handleAction = useCallback((action: ActionType) => {
    if (!exercise) return
    switch (action) {
      case 'submit_flag':
        break;
      case 'build':
        setCurrentRow(exercise)
        setPendingAction('build'); 
        updateState({ modelId: exerciseId, data: { action } });
        createBuildConnection(exerciseId)
        break;
      case 'force_stop_build':
        setCurrentRow(exercise)
        setPendingAction('force_stop_build'); 
        updateState({ modelId: exerciseId, data: { action } });
        break;
      case 'start':
        setCurrentRow(exercise)
        setPendingAction('start'); 
        updateState({ modelId: exerciseId, data: { action } });
        break;
      case 'stop':
        setCurrentRow(exercise)
        setPendingAction('stop'); 
        updateState({ modelId: exerciseId, data: { action } });
        break;
      case 'delete':
        setCurrentRow(exercise)
        closeBuildConnection()
        setOpen('delete');
        break;
      case 'view_details':
        setCurrentRow(exercise)
        setOpen('update');
        break;
    }
  }, [exerciseId, updateState, setOpen, exercise, setCurrentRow, navigate,createBuildConnection,closeBuildConnection]);

  return { handleAction, pendingAction };
}; 
