import React, { useEffect, useRef } from 'react';
import { Color } from 'three';
import { RigidBody, CapsuleCollider, Physics, RigidBodyApi } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../state/useGameStore';
import { socket } from '../../../net/socketClient';
import type { RoomStats } from '../../../../shared/events';
import { PLAYER_HEIGHT, PLAYER_RADIUS } from '../../../game/constants';
import { BUTTON_JUMP, axisToUnit } from '../../../game/input';
import { Level } from '../../../game/Level';

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
  const bodiesRef = useRef(new Map<string, RigidBodyApi>());

  useFrame(() => {
    const map = useGameStore.getState().players;
    map.forEach((state, id) => {
      const api = bodiesRef.current.get(id);
      if (!api || !state.input) return;
      const vx = axisToUnit(state.input.ax) * 8;
      const lin = api.linvel();
      api.setLinvel({ x: vx, y: lin.y, z: 0 }, true);
      const y = api.translation().y;
      const onGround = y <= 1.8; // crude ground check against our ground collider
      if (onGround && (state.input.pressed ?? 0) & BUTTON_JUMP) {
        api.setLinvel({ x: vx, y: 10, z: 0 }, true);
      }
    });
  });

  return (
    <Physics gravity={[0, -35, 0]}>
      <group>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <gridHelper args={[40, 40, new Color('#334155'), new Color('#1f2937')]} />
        <Level levelId="intro_01" />

        {players.map((p, i) => (
          <RigidBody
            key={p.id}
            ref={(api) => {
              if (api) bodiesRef.current.set(p.id, api);
              else bodiesRef.current.delete(p.id);
            }}
            position={[i * 1.2, 2, 0]}
            colliders={false}
            enabledRotations={[false, false, false]}
          >
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



