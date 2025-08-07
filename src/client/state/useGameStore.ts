import { create } from 'zustand';

type Phase = 'lobby' | 'countdown' | 'race' | 'results';

type GameState = {
  phase: Phase;
  setPhase: (p: Phase) => void;
};

export const useGameStore = create<GameState>((set) => ({
  phase: 'lobby',
  setPhase: (phase) => set({ phase }),
}));



