import React, { useEffect, useMemo, useRef, useState } from 'react';
import { socket } from '../../net/socketClient';

type StickSample = { ax: number; ay: number };

const STICK_RADIUS_PX = 90;
const DEADZONE = 0.12;

function quantizeToInt8(v: number): number {
  const clamped = Math.max(-1, Math.min(1, v));
  return Math.max(-127, Math.min(127, Math.round(clamped * 127)));
}

function applyDeadzone(x: number, y: number, dz = DEADZONE): [number, number] {
  const mag = Math.hypot(x, y);
  if (mag < dz) return [0, 0];
  const scaled = (mag - dz) / (1 - dz);
  return [((x / mag) * scaled) || 0, ((y / mag) * scaled) || 0];
}

export enum ButtonBit {
  Jump = 1,
  Grapple = 2,
  Slide = 4,
  Item = 8,
  Pause = 16,
}

export function ControllerPad(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [buttons, setButtons] = useState(0);
  const pressedRef = useRef(0);
  const releasedRef = useRef(0);
  const lastSentRef = useRef(0);
  const lastSampleRef = useRef<StickSample>({ ax: 0, ay: 0 });
  const activeIdRef = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);

  const leftAreaStyle = useMemo(
    () => ({ width: '45%', height: '100%', touchAction: 'none' as const }),
    []
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      activeIdRef.current = e.pointerId;
      originRef.current = { x, y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (activeIdRef.current !== e.pointerId) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const origin = originRef.current;
      if (!origin) return;
      const dx = x - origin.x;
      const dy = y - origin.y;
      const ang = Math.atan2(dy, dx);
      const mag = Math.min(STICK_RADIUS_PX, Math.hypot(dx, dy));
      const nx = (mag * Math.cos(ang)) / STICK_RADIUS_PX;
      const ny = (mag * Math.sin(ang)) / STICK_RADIUS_PX;
      const [fx, fy] = applyDeadzone(nx, ny);
      lastSampleRef.current = { ax: fx, ay: fy };
      e.preventDefault();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (activeIdRef.current !== e.pointerId) return;
      activeIdRef.current = null;
      originRef.current = null;
      lastSampleRef.current = { ax: 0, ay: 0 };
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      e.preventDefault();
    };

    const leftArea = el.querySelector('#stick-area') as HTMLElement;
    leftArea.addEventListener('pointerdown', onPointerDown, { passive: false });
    leftArea.addEventListener('pointermove', onPointerMove, { passive: false });
    leftArea.addEventListener('pointerup', onPointerUp, { passive: false });
    leftArea.addEventListener('pointercancel', onPointerUp, { passive: false });

    const loop = (t: number) => {
      const since = t - lastSentRef.current;
      if (since >= 1000 / 60) {
        lastSentRef.current = t;
        const { ax, ay } = lastSampleRef.current;
        const payload = {
          t: Date.now(),
          ax: quantizeToInt8(ax),
          ay: quantizeToInt8(-ay), // invert Y for up positive
          buttons,
          pressed: pressedRef.current || undefined,
          released: releasedRef.current || undefined,
        };
        socket.emit('controller:input', payload);
        pressedRef.current = 0;
        releasedRef.current = 0;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      leftArea.removeEventListener('pointerdown', onPointerDown);
      leftArea.removeEventListener('pointermove', onPointerMove);
      leftArea.removeEventListener('pointerup', onPointerUp);
      leftArea.removeEventListener('pointercancel', onPointerUp);
    };
  }, [buttons]);

  const toggleButton = (bit: number, down: boolean) => {
    setButtons((prev) => {
      const next = down ? prev | bit : prev & ~bit;
      if (down) pressedRef.current |= bit;
      else releasedRef.current |= bit;
      return next;
    });
  };

  return (
    <div ref={containerRef} className="h-full w-full flex select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      <div id="stick-area" className="relative" style={leftAreaStyle}>
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="rounded-full border-2 border-slate-400" style={{ width: STICK_RADIUS_PX * 2, height: STICK_RADIUS_PX * 2 }} />
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-6 content-center justify-items-center pr-6">
        <button className="w-24 h-24 rounded-full bg-emerald-600 active:scale-95" onPointerDown={(e)=>{e.preventDefault(); toggleButton(ButtonBit.Jump,true);}} onPointerUp={(e)=>{e.preventDefault(); toggleButton(ButtonBit.Jump,false);}}>A</button>
        <button className="w-24 h-24 rounded-full bg-sky-600 active:scale-95" onPointerDown={(e)=>{e.preventDefault(); toggleButton(ButtonBit.Grapple,true);}} onPointerUp={(e)=>{e.preventDefault(); toggleButton(ButtonBit.Grapple,false);}}>X</button>
        <button className="w-24 h-24 rounded-full bg-amber-600 active:scale-95" onPointerDown={(e)=>{e.preventDefault(); toggleButton(ButtonBit.Slide,true);}} onPointerUp={(e)=>{e.preventDefault(); toggleButton(ButtonBit.Slide,false);}}>B</button>
        <button className="w-24 h-24 rounded-full bg-fuchsia-600 active:scale-95" onPointerDown={(e)=>{e.preventDefault(); toggleButton(ButtonBit.Item,true);}} onPointerUp={(e)=>{e.preventDefault(); toggleButton(ButtonBit.Item,false);}}>Y</button>
      </div>
    </div>
  );
}



