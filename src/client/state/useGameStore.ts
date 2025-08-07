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
  transforms: Map<PlayerId, { pos: [number, number, number] }>;
  upsertPlayer: (player: PlayerState) => void;
  removePlayer: (id: PlayerId) => void;
  applyInput: (id: PlayerId, input: PlayerInput) => void;
  setTransform: (id: PlayerId, pos: [number, number, number]) => void;
  setPhase: (p: Phase) => void;
};

export const useGameStore = create<GameState>((set) => ({
  phase: 'lobby',
  players: new Map(),
  transforms: new Map(),
  upsertPlayer: (player) => set((s) => {
    const next = new Map(s.players);
    next.set(player.id, player);
    return { players: next };
  }),
  removePlayer: (id) => set((s) => {
    const next = new Map(s.players);
    next.delete(id);
    const nextT = new Map(s.transforms);
    nextT.delete(id);
    return { players: next, transforms: nextT };
  }),
  applyInput: (id, input) => set((s) => {
    const next = new Map(s.players);
    const p = next.get(id);
    if (p) next.set(id, { ...p, input });
    return { players: next };
  }),
  setTransform: (id, pos) => set((s) => {
    const next = new Map(s.transforms);
    next.set(id, { pos });
    return { transforms: next };
  }),
  setPhase: (phase) => set({ phase }),
}));



