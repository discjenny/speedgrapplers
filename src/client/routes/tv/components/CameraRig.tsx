import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { useGameStore } from '../../../state/useGameStore';

export function CameraRig(): null {
  const { camera } = useThree();

  useEffect(() => {
    const unsub = useGameStore.subscribe((s) => s.transforms);
    const update = () => {
      const transforms = useGameStore.getState().transforms;
      const positions = Array.from(transforms.values()).map((t) => t.pos as [number, number, number]);
      if (positions.length === 0) return;
      let cx = 0, cy = 0;
      positions.forEach(([x, y]) => { cx += x; cy += y; });
      cx /= positions.length; cy /= positions.length;
      const targetZ = camera.position.z;
      camera.position.x += (cx - camera.position.x) * 0.1;
      camera.position.y += (cy + 4 - camera.position.y) * 0.1;
      camera.position.z = targetZ;
      camera.updateProjectionMatrix();
    };
    const id = setInterval(update, 16);
    return () => { clearInterval(id); unsub(); };
  }, [camera]);

  return null;
}


