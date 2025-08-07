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

#### Camera, OOB, and Elimination (initial)
- `CameraRig`: follows pack centroid each frame (mild damping), keeps Z.
- Per-player transform snapshots recorded each physics tick; camera/OOB uses them.
- OOB detection moved to `useFrame`: world → NDC; safe padding starts at 20%, includes 12% outer margin; players eliminated after 0.8s OOB.
- Padding shrink: after 15 s without eliminations, safe padding reduces ~1%/s down to 8% minimum; resets to 20% on elimination.
- `HUD`: shows alive count.

#### Levels and Assets
- Level JSON loader: `Level` builds fixed Rapier colliders from tiles.
- Seed `intro_01.json`; `assets.manifest.json` scaffold.
- Environment HDRI via dynamic import from `@pmndrs/assets` (string URL only).
 - Visual tile meshes rendered (colored boxes) on top of colliders for clarity.

#### DX & Misc
- ESLint config (TS + React), Tailwind setup.
- Inline SVG favicon to avoid 404 noise.
- PWA configured (scope `/controller/`, Socket.IO `NetworkOnly`).

#### Physics stability (anti-fall)
- Enabled CCD for player bodies; corrected capsule collider half-height.
- Fail-safe: lift body to y=2 if it ever dips below y<-5.

#### Done (since last update)
- Visual tile meshes in `Level`.
- Camera/OOB logic in `useFrame` with padding shrink.
- Basic anti-fall and CCD.

#### Next Steps (resume plan)
- Camera & Safe Frame
  - Replace simple centroid with “front 50%” centroid and lead-bias +2m along X.
  - Implement critically damped spring (3 Hz position, 1.5 Hz zoom) for smoothness.
  - Render optional safe-frame overlay (debug UI) with current padding and shrink rate.

- OOB & Rounds
  - Show OOB warning per player (time left to elimination), add HUD indicators.
  - End round when only one remains; show simple results UI and quick rematch.
  - Reset padding to 20% at round start; clear eliminated and timers.

- Player Control/Feel
  - Add acceleration/friction tuning; coyote time and jump-buffer.
  - Grounded contact detection using Rapier contacts instead of height heuristic.
  - Clamp max horizontal speed; add small air control factor.

- Level/Visuals
  - Add ramp normals and distinct materials; optional grid toggle.
  - Implement simple start/finish markers; trigger finish win condition.

- Networking
  - Include player color/name in `room:stats` → TV HUD; add join/leave toasts.
  - Rate limit input on server (soft 120 msg/s, hard drop 200 msg/s).

- Controller UX
  - Haptics on join/ack, jump, eliminate; wake-lock on tap, migration prompt.
  - Deadzone slider + southpaw option persisted locally.

- Build & Perf
  - Lazy load heavy assets, `useGLTF.preload` where appropriate.
  - DPR clamp and dynamic drop if frame time >22ms for >1s (perf toggle).

- Testing
  - Unit tests for join/ack, input validation, padding shrink.
  - R3F smoke tests: mount scene, verify materials/geometry present.



