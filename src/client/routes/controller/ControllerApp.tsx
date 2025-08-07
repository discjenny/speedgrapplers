import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { socket } from '../../net/socketClient';
import type { JoinAck } from '../../../shared/events';
import { ControllerPad } from './ControllerPad';

export default function ControllerApp(): JSX.Element {
  const [params] = useSearchParams();
  const roomCode = useMemo(() => (params.get('room') || 'ABCD').toUpperCase().slice(0,4), [params]);
  const [status, setStatus] = useState<'disconnected'|'connecting'|'connected'|'error'>('connecting');
  const [color, setColor] = useState<string | undefined>();

  useEffect(() => {
    const onConnect = () => {
      setStatus('connecting');
      socket.emit('controller:join', { roomCode });
    };
    const onAck = (ack: JoinAck) => {
      if (ack.ok) {
        setStatus('connected');
        setColor(ack.color);
      } else {
        setStatus('error');
      }
    };
    socket.on('connect', onConnect);
    socket.on('controller:join:ack', onAck);
    if (socket.connected) onConnect();
    return () => {
      socket.off('connect', onConnect);
      socket.off('controller:join:ack', onAck);
    };
  }, [roomCode]);

  return (
    <div className="h-full w-full">
      <div className="absolute left-4 top-4 text-sm opacity-80">Room: <span className="font-mono">{roomCode}</span> — <span style={{ color }}>{status}</span></div>
      <ControllerPad />
    </div>
  );
}


