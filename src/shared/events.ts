export type PlayerId = string;
export type RoomCode = string; // 4-char base32, e.g., "ABCD"

export type ControllerJoin = {
  roomCode: RoomCode;
  displayName?: string;
  reconnectionToken?: string;
};

export type JoinAck = {
  ok: boolean;
  reason?: string;
  playerId?: PlayerId;
  color?: string;
  reconnectionToken?: string;
};

export type ButtonsBitmask = number; // 1=jump,2=grapple,4=slide,8=item,16=pause

export type InputPayload = {
  t: number;
  ax: number; // int8 [-127..127]
  ay: number; // int8 [-127..127]
  buttons: ButtonsBitmask;
  pressed?: ButtonsBitmask;
  released?: ButtonsBitmask;
};

export type RoomStats = {
  roomCode: RoomCode;
  players: { id: PlayerId; name?: string; color?: string }[];
};


