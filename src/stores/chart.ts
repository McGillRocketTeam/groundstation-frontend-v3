import { create } from "zustand";

interface ChartStore {
  resetSignal: Date | null;
  triggerReset: () => void;
}

export const chartStore = create<ChartStore>((set) => ({
  resetSignal: null, // This will be used to trigger the reset
  triggerReset: () => set({ resetSignal: new Date() }), // Update the signal to trigger the reset
}));
