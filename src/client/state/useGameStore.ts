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
  oobSince: Map<PlayerId, number>; // ms timestamp when left safe frame
  eliminated: Set<PlayerId>;
  safePadding: number; // fraction (0..1), default 0.2
  lastEliminationMs: number;
  upsertPlayer: (player: PlayerState) => void;
  removePlayer: (id: PlayerId) => void;
  applyInput: (id: PlayerId, input: PlayerInput) => void;
  setTransform: (id: PlayerId, pos: [number, number, number]) => void;
  markOob: (id: PlayerId, nowMs: number) => void;
  clearOob: (id: PlayerId) => void;
  eliminate: (id: PlayerId) => void;
  setSafePadding: (p: number) => void;
  setPhase: (p: Phase) => void;
};

export const useGameStore = create<GameState>((set) => ({
  phase: 'lobby',
  players: new Map(),
  transforms: new Map(),
  oobSince: new Map(),
  eliminated: new Set(),
  safePadding: 0.2,
  lastEliminationMs: Date.now(),
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
    const nextO = new Map(s.oobSince);
    nextO.delete(id);
    const nextE = new Set(s.eliminated);
    nextE.delete(id);
    return { players: next, transforms: nextT, oobSince: nextO, eliminated: nextE };
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
  markOob: (id, nowMs) => set((s) => {
    const next = new Map(s.oobSince);
    if (!next.has(id)) next.set(id, nowMs);
    return { oobSince: next };
  }),
  clearOob: (id) => set((s) => {
    const next = new Map(s.oobSince);
    next.delete(id);
    return { oobSince: next };
  }),
  eliminate: (id) => set((s) => {
    const next = new Set(s.eliminated);
    next.add(id);
    return { eliminated: next, safePadding: 0.2, lastEliminationMs: Date.now() };
  }),
  setSafePadding: (p) => set({ safePadding: p }),
  setPhase: (phase) => set({ phase }),
}));



