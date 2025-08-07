export const BUTTON_JUMP = 1;
export const BUTTON_GRAPPLE = 2;
export const BUTTON_SLIDE = 4;
export const BUTTON_ITEM = 8;
export const BUTTON_PAUSE = 16;

export function axisToUnit(ax: number): number {
  return Math.max(-1, Math.min(1, ax / 127));
}


