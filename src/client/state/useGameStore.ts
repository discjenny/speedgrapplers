import { create } from 'zustand';
import type { ButtonsBitmask, InputPayload, PlayerId } from '../../shared/events';

type Phase = 'lobby' | 'countdown' | 'race' | 'results';

export type PlayerInput = InputPayload & { buttons: ButtonsBitmask };

type PlayerState = {
  id: PlayerId;
  color: string;
  input: PlayerInput | null;
};

type GameState = {
  phase: Phase;
  players: Map<PlayerId, PlayerState>;
  upsertPlayer: (player: PlayerState) => void;
  removePlayer: (id: PlayerId) => void;
  applyInput: (id: PlayerId, input: PlayerInput) => void;
  setPhase: (p: Phase) => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'lobby',
  players: new Map(),
  upsertPlayer: (player) => set((s) => {
    const next = new Map(s.players);
    next.set(player.id, player);
    return { players: next };
  }),
  removePlayer: (id) => set((s) => {
    const next = new Map(s.players);
    next.delete(id);
    return { players: next };
  }),
  applyInput: (id, input) => set((s) => {
    const next = new Map(s.players);
    const p = next.get(id);
    if (p) next.set(id, { ...p, input });
    return { players: next };
  }),
  setPhase: (phase) => set({ phase }),
}));



