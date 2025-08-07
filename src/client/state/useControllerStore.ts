import { create } from 'zustand';

type ControllerPrefs = {
  displayName: string;
  southpaw: boolean;
  deadzone: number; // 0.08..0.2 default 0.12
  setPrefs: (p: Partial<ControllerPrefs>) => void;
};

const DEFAULTS = { displayName: '', southpaw: false, deadzone: 0.12 } as const;

export const useControllerStore = create<ControllerPrefs>((set) => ({
  ...DEFAULTS,
  setPrefs: (p) => set((s) => ({ ...s, ...p })),
}));



