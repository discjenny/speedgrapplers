import React, { useEffect } from 'react';
import { Color } from 'three';
import { RigidBody, CapsuleCollider, Physics } from '@react-three/rapier';
import { useGameStore } from '../../../state/useGameStore';
import { socket } from '../../../net/socketClient';
import type { RoomStats } from '../../../../shared/events';
import { PLAYER_HEIGHT, PLAYER_RADIUS } from '../../../game/constants';

export function GameHost(): JSX.Element {
  useEffect(() => {
    const upsertFromStats = (stats: RoomStats) => {
      stats.players.forEach((p) =>
        useGameStore.getState().upsertPlayer({ id: p.id, color: p.color ?? '#fff', input: null })
      );
    };
    const onInput = ({ playerId, input }: { playerId: string; input: any }) => {
      useGameStore.getState().applyInput(playerId, input);
    };
    socket.on('room:stats', upsertFromStats);
    socket.on('host:input', onInput);
    return () => {
      socket.off('room:stats', upsertFromStats);
      socket.off('host:input', onInput);
    };
  }, []);

  const players = Array.from(useGameStore((s) => s.players).values());

  return (
    <Physics gravity={[0, -35, 0]}>
      <group>
        <gridHelper args={[40, 40, new Color('#334155'), new Color('#1f2937')]} />
        {players.map((p, i) => (
          <RigidBody key={p.id} position={[i * 1.2, 2, 0]} colliders={false} enabledRotations={[false, false, false]}>
            <CapsuleCollider args={[PLAYER_HEIGHT / 2, PLAYER_RADIUS]} />
            <mesh>
              <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_HEIGHT - 2 * PLAYER_RADIUS, 8, 16]} />
              <meshStandardMaterial color={p.color} />
            </mesh>
          </RigidBody>
        ))}
      </group>
    </Physics>
  );
}



