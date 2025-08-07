### SpeedGrapplers – Progress Log

#### M0 Scaffold and Networking
- Vite + React + TypeScript app with Tailwind and React Router.
- Express + Socket.IO server (WebSocket-only), production static serving.
- Dev proxy for `/socket.io` via Vite.
- Shared TS event types in `src/shared/events.ts`.

#### Routes and Structure
- TV host at `/` renders R3F canvas and hosts authoritative sim.
- Controller PWA at `/controller` with virtual stick and buttons.
- File layout aligned with spec: `src/server`, `src/client/{routes,game,net,state,assets}`.

#### Controller (PWA)
- `ControllerPad`: virtual stick (deadzone, int8 quantization) + A/X/B/Y buttons.
- Emits `controller:input` at 60 Hz with bitmasks and timestamps.
- Join flow: `/controller?room=ABCD` → `controller:join` → ack → status UI.

#### Server (Authoritative host)
- `host:create` assigns a 4-char base32 room code; tracks host per room.
- Validates `controller:join` / `controller:input` with Zod; monotonic `t` guard.
- Keeps per-room player registry; emits `room:stats` on joins/leaves.
- Forwards inputs to host as `host:input`.

#### TV Host (R3F)
- `TVApp`: requests room from server; displays room code and controller count.
- `GameHost`: Rapier physics world; capsule per controller; ambient/directional light.
- Minimal movement: stick X → horizontal velocity; A → jump with crude ground check.

#### Levels and Assets
- Level JSON loader: `Level` builds fixed Rapier colliders from tiles.
- Seed `intro_01.json`; `assets.manifest.json` scaffold.
- Environment HDRI via dynamic import from `@pmndrs/assets` (string URL only).

#### DX & Misc
- ESLint config (TS + React), Tailwind setup.
- Inline SVG favicon to avoid 404 noise.
- PWA configured (scope `/controller/`, Socket.IO `NetworkOnly`).

#### Next Up
- Visual tile meshes for clarity; ground contact check via Rapier contacts.
- Follow camera rig with smoothing; elimination bounds.
- Input-to-motion refinement (acceleration, friction, jump buffers).


