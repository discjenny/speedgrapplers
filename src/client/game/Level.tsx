import React, { useEffect, useState, Fragment } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

type Vec3 = [number, number, number];
type Tile =
  | { type: 'box'; pos: Vec3; size: [number, number, number] }
  | { type: 'ramp'; pos: Vec3; size: [number, number, number]; angleDeg: number }
  | { type: 'ceil'; pos: Vec3; size: [number, number, number] };

type LevelJson = {
  version: number;
  meta: { id: string; difficulty: number };
  tiles: Tile[];
  anchors: { pos: Vec3; radius: number; coneDeg: number; autoRange: number }[];
  spawns: { pos: Vec3 }[];
  decor: unknown[];
};

async function loadLevelJson(levelId: string): Promise<LevelJson> {
  const mod = await import(`../assets/levels/${levelId}.json`);
  return mod.default as LevelJson;
}

export function Level({ levelId }: { levelId: string }): JSX.Element | null {
  const [level, setLevel] = useState<LevelJson | null>(null);

  useEffect(() => {
    let mounted = true;
    loadLevelJson(levelId).then((j) => mounted && setLevel(j));
    return () => {
      mounted = false;
    };
  }, [levelId]);

  if (!level) return null;

  return (
    <group>
      {/* Static colliders for tiles */}
      <RigidBody type="fixed" colliders={false}>
        {level.tiles.map((tile, i) => {
          if (tile.type === 'box' || tile.type === 'ceil') {
            const half: [number, number, number] = [tile.size[0] / 2, tile.size[1] / 2, tile.size[2] / 2];
            return <CuboidCollider key={i} args={half} position={tile.pos} />;
          }
          if (tile.type === 'ramp') {
            const half: [number, number, number] = [tile.size[0] / 2, tile.size[1] / 2, tile.size[2] / 2];
            const rot = [0, 0, (tile.angleDeg * Math.PI) / 180] as [number, number, number];
            return <CuboidCollider key={i} args={half} position={tile.pos} rotation={rot} />;
          }
          return null;
        })}
      </RigidBody>
      {/* simple visual meshes for tiles */}
      {level.tiles.map((tile, i) => {
        const color = tile.type === 'box' ? '#334155' : tile.type === 'ceil' ? '#475569' : '#64748b';
        if (tile.type === 'box' || tile.type === 'ceil') {
          return (
            <mesh key={`m${i}`} position={tile.pos}>
              <boxGeometry args={tile.size} />
              <meshStandardMaterial color={color} />
            </mesh>
          );
        }
        if (tile.type === 'ramp') {
          const rot = [0, 0, (tile.angleDeg * Math.PI) / 180] as [number, number, number];
          return (
            <mesh key={`m${i}`} position={tile.pos} rotation={rot}>
              <boxGeometry args={tile.size} />
              <meshStandardMaterial color={color} />
            </mesh>
          );
        }
        return <Fragment key={`m${i}`} />;
      })}
    </group>
  );
}


