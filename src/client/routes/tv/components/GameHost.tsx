import React from 'react';
import { Color } from 'three';

export function GameHost(): JSX.Element {
  return (
    <group>
      <gridHelper args={[40, 40, new Color('#334155'), new Color('#1f2937')]} />
    </group>
  );
}



