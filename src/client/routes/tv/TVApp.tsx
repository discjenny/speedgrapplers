import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { GameHost } from './components/GameHost';
import { socket } from '../../net/socketClient';
import type { RoomStats } from '../../../shared/events';

export default function TVApp(): JSX.Element {
  const [roomCode, setRoomCode] = useState<string>('----');
  const roomRef = useRef<string>('----');
  const [players, setPlayers] = useState<RoomStats['players']>([]);
  const [exrUrl, setExrUrl] = useState<string | null>(null);

  useEffect(() => {
    const onConnect = () => {
      if (roomRef.current === '----') socket.emit('host:create');
    };
    const onHostAck = (ack: { ok: boolean; roomCode?: string }) => {
      if (ack.ok && ack.roomCode && roomRef.current === '----') {
        roomRef.current = ack.roomCode;
        setRoomCode(ack.roomCode);
      }
    };
    const onStats = (stats: RoomStats) => {
      if (stats.roomCode === roomRef.current) setPlayers(stats.players);
    };
    socket.on('connect', onConnect);
    socket.on('host:create:ack', onHostAck);
    socket.on('room:stats', onStats);
    if (socket.connected) onConnect();
    return () => {
      socket.off('connect', onConnect);
      socket.off('host:create:ack', onHostAck);
      socket.off('room:stats', onStats);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import('@pmndrs/assets/hdri/city.exr');
      if (mounted) setExrUrl(mod.default as unknown as string);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 6, 16], fov: 50 }} dpr={[1, 1.5]}>
        {exrUrl && (
          <Suspense fallback={null}>
            <Environment files={exrUrl} />
          </Suspense>
        )}
        <GameHost />
      </Canvas>
      <div className="absolute left-4 top-4 text-sm opacity-90 select-none">
        <div className="font-semibold">SpeedGrapplers</div>
        <div>Room: <span className="font-mono">{roomCode}</span></div>
        <div>Controllers: {players.length}</div>
      </div>
    </div>
  );
}


