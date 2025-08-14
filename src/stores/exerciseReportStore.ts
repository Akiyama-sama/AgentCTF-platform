import { create } from 'zustand';

type ExerciseReportState = {
  isClickGenerateReport: boolean;
  setClickGenerateReport: (value: boolean) => void;
  triggerReportGeneration: () => void;
};

export const useExerciseReportStore = create<ExerciseReportState>((set) => ({
  isClickGenerateReport: false,
  setClickGenerateReport: (value) => set({ isClickGenerateReport: value }),
  triggerReportGeneration: () => {
    set({ isClickGenerateReport: false });
    // 5秒后设置为true
    setTimeout(() => {
      set({ isClickGenerateReport: true });
    }, 5000);
  },
})); 