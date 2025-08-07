import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from '../../../state/useGameStore';

export function CameraRig(): null {
  const { camera } = useThree();

  useFrame(() => {
    const transforms = useGameStore.getState().transforms;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const positions = Array.from(transforms.values()).map((t: any) => t.pos as [number, number, number]);
    if (positions.length === 0) return;
    let cx = 0, cy = 0;
    positions.forEach(([x, y]) => { cx += x; cy += y; });
    cx /= positions.length; cy /= positions.length;
    const targetZ = camera.position.z;
    camera.position.x += (cx - camera.position.x) * 0.1;
    camera.position.y += (cy + 4 - camera.position.y) * 0.1;
    camera.position.z = targetZ;
    camera.updateProjectionMatrix();
  });

  // OOB detection + padding shrink every frame
  useFrame(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = useGameStore.getState();
    const { transforms, eliminated, markOob, clearOob, eliminate, safePadding, lastEliminationMs, setSafePadding } = state;
    const now = Date.now();
    const sinceElim = now - lastEliminationMs;
    const minPad = 0.08;
    const newPad = sinceElim > 15000 ? Math.max(minPad, safePadding - 0.01 / 60) : 0.2;
    if (newPad !== safePadding) setSafePadding(newPad);

    const extra = 0.24;
    const limit = 1 - newPad + extra;
    const ids = Array.from(transforms.keys()) as string[];
    ids.forEach((id) => {
      if (eliminated.has(id)) return;
      const t = transforms.get(id);
      if (!t) return;
      const v = new Vector3(t.pos[0], t.pos[1], t.pos[2]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v as any).project(camera as any);
      const out = Math.abs(v.x) > limit || Math.abs(v.y) > limit;
      if (out) markOob(id, now);
      else clearOob(id);
    });
    const oobSince = state.oobSince as Map<string, number>;
    oobSince.forEach((since: number, id: string) => {
      if (now - since > 800) eliminate(id);
    });
  });

  return null;
}


