import React from 'react';
import { useGameStore } from '../../state/useGameStore';

export function HUD(): JSX.Element {
  const eliminated = useGameStore((s) => s.eliminated);
  const players = useGameStore((s) => s.players);
  const alive = Array.from(players.values()).filter((p) => !eliminated.has(p.id));
  return (
    <div className="absolute right-4 top-4 text-sm opacity-90 select-none">
      <div>Alive: {alive.length}</div>
    </div>
  );
}


