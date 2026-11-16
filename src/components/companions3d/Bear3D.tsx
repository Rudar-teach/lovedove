'use client';

import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Companion3DProps } from './companion3d.types';

// R3F refs are typed as `any` to avoid THREE namespace typing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MutableRef<T> = React.MutableRefObject<T>;

// ---- Eyes -------------------------------------------------------------------
function Eyes({ blink, shy, surprised }: { blink: boolean; shy: boolean; surprised: boolean }) {
  const leftRef = useRef<any>(null);
  const rightRef = useRef<any>(null);
  const blinkStart = useRef(0);
  const isBlinking = useRef(false);

  useFrame(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;
    if (blink && !isBlinking.current) {
      isBlinking.current = true;
      blinkStart.current = performance.now();
    }
    if (!blink) isBlinking.current = false;
    const t = isBlinking.current ? Math.min((performance.now() - blinkStart.current) / 150, 1) : 0;
    const s = isBlinking.current ? (t < 0.5 ? 1 - t * 2 : (t - 0.5) * 2) : 1;
    const scaleY = surprised ? 1.3 : Math.max(0.05, s);
    const scaleX = surprised ? 1.2 : 1;
    left.scale.y = scaleY;
    left.scale.x = scaleX;
    right.scale.y = scaleY;
    right.scale.x = scaleX;
  });

  return (
    <group>
      <group ref={leftRef} position={[-0.14, 0.06, 0.32]}>
        <mesh>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshToonMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.015, 0.02, 0.07]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshToonMaterial color="#ffffff" />
        </mesh>
      </group>
      <group ref={rightRef} position={[0.14, 0.06, 0.32]}>
        <mesh>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshToonMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.015, 0.02, 0.07]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshToonMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

// ---- Blush ------------------------------------------------------------------
function BlushCheeks({ hovered }: { hovered: boolean }) {
  const leftOp = useRef(0.35);
  const rightOp = useRef(0.35);

  useFrame(() => {
    const t = hovered ? 0.75 : 0.35;
    leftOp.current += (t - leftOp.current) * 0.1;
    rightOp.current += (t - rightOp.current) * 0.1;
  });

  return (
    <group>
      <mesh position={[-0.22, -0.04, 0.3]}>
        <circleGeometry args={[0.055, 16]} />
        <meshBasicMaterial color="#f4a7b9" transparent opacity={leftOp.current} depthWrite={false} />
      </mesh>
      <mesh position={[0.22, -0.04, 0.3]}>
        <circleGeometry args={[0.055, 16]} />
        <meshBasicMaterial color="#f4a7b9" transparent opacity={rightOp.current} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ---- Mouth ------------------------------------------------------------------
function Mouth({ mood, surprised }: { mood: string; surprised: boolean }) {
  const smile = useRef<any>(null);
  const pout = useRef<any>(null);
  const openM = useRef<any>(null);
  const o = useRef<any>(null);

  const noSmile = ['pouting', 'surprised', 'cheering', 'celebrating', 'drowsy', 'shy'].includes(mood);
  const showPout = mood === 'pouting';
  const showOpen = ['cheering', 'celebrating', 'peeking'].includes(mood);
  const showO = surprised || mood === 'surprised';

  const darkMat = <meshToonMaterial color="#2c2416" />;

  useFrame(() => {
    if (smile.current) smile.current.visible = !noSmile && !showO;
    if (pout.current) pout.current.visible = showPout;
    if (openM.current) openM.current.visible = showOpen && !showO;
    if (o.current) o.current.visible = showO;
  });

  return (
    <group position={[0, -0.08, 0.34]}>
      <mesh ref={smile}>
        <torusGeometry args={[0.06, 0.012, 8, 12, Math.PI]} />
        {darkMat}
      </mesh>
      <group rotation={[0, 0, Math.PI]}>
        <mesh ref={pout}>
          <torusGeometry args={[0.05, 0.01, 8, 12, Math.PI]} />
          {darkMat}
        </mesh>
      </group>
      <mesh ref={openM}>
        <sphereGeometry args={[0.04, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {darkMat}
      </mesh>
      <mesh ref={o}>
        <circleGeometry args={[0.03, 16]} />
        {darkMat}
      </mesh>
    </group>
  );
}

// ---- TearDrops --------------------------------------------------------------
function TearDrops({ crying }: { crying: boolean }) {
  const refs = useRef<(any | null)[]>([]);
  const vels = useRef<{ vy: number }[]>([{ vy: 0.4 }, { vy: 0.3 }]);

  useFrame((_, dt) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      if (crying) {
        m.visible = true;
        m.position.y -= vels.current[i]!.vy * dt;
        vels.current[i]!.vy += 1.2 * dt;
        m.material.opacity = Math.max(0, 0.7 - m.position.y * 2);
      } else {
        m.visible = false;
        m.position.y = 0.15;
        vels.current[i]!.vy = 0.4;
      }
    });
  });

  return (
    <group>
      {[0, 1].map((i) => (
        <mesh
          key={i}
          ref={(el: any) => { refs.current[i] = el; }}
          visible={false}
          position={[i === 0 ? -0.12 : 0.12, 0.15, 0.35]}
        >
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshBasicMaterial color="#7ec8f8" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ---- HeartBurst -------------------------------------------------------------
function HeartBurst({ clickTick }: { clickTick: number }) {
  const COUNT = 6;
  const groupRef = useRef<any>(null);
  const meshRefs = useRef<(any | null)[]>([]);
  const lastTick = useRef(0);
  const vels = useRef<{ vx: number; vy: number; vz: number }[]>([]);

  if (vels.current.length !== COUNT) {
    vels.current = Array.from({ length: COUNT }, () => ({
      vx: (Math.random() - 0.5) * 1.6,
      vy: 0.6 + Math.random() * 1.4,
      vz: (Math.random() - 0.5) * 1.6,
    }));
  }

  useFrame((_, dt) => {
    if (clickTick !== lastTick.current && groupRef.current) {
      lastTick.current = clickTick;
      meshRefs.current.forEach((m) => {
        if (!m) return;
        m.visible = true;
        m.position.set((Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1);
        m.scale.setScalar(0.4 + Math.random() * 0.4);
        m.material.opacity = 0.9;
      });
    }

    meshRefs.current.forEach((m, i) => {
      if (!m || !m.visible) return;
      const v = vels.current[i]!;
      m.position.x += v.vx * dt;
      m.position.y += v.vy * dt;
      m.position.z += v.vz * dt;
      v.vy -= 2.5 * dt;
      m.material.opacity = Math.max(0, m.material.opacity - dt * 1.2);
      if (m.position.y < -0.5) m.visible = false;
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el: any) => { meshRefs.current[i] = el; }}
          visible={false}
          position={[0, 0, 0]}
        >
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#ff6b8a" transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ---- Confetti ---------------------------------------------------------------
function Confetti({ active }: { active: boolean }) {
  const COUNT = 10;
  const meshRefs = useRef<(any | null)[]>([]);
  const vels = useRef<{ vx: number; vy: number; vz: number; rot: number; color: string }[]>([]);
  const lastSpawn = useRef(0);

  const palette = ['#ff6b8a', '#ffdd57', '#7ec8f8', '#a78bfa', '#34d399'];
  if (vels.current.length !== COUNT) {
    vels.current = Array.from({ length: COUNT }, () => ({
      vx: (Math.random() - 0.5) * 2.2,
      vy: 1 + Math.random() * 2,
      vz: (Math.random() - 0.5) * 2.2,
      rot: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)]!,
    }));
  }

  useFrame((state, dt) => {
    if (active && state.clock.elapsedTime - lastSpawn.current > 2.5) {
      lastSpawn.current = state.clock.elapsedTime;
      meshRefs.current.forEach((m) => {
        if (!m) return;
        m.visible = true;
        m.position.set(0, 0.1, 0);
        m.scale.setScalar(0.3 + Math.random() * 0.3);
        m.material.opacity = 0.9;
      });
    }

    meshRefs.current.forEach((m, i) => {
      if (!m || !m.visible) return;
      const v = vels.current[i]!;
      m.position.x += v.vx * dt;
      m.position.y += v.vy * dt;
      m.position.z += v.vz * dt;
      v.vy -= 2 * dt;
      m.rotation.x += v.rot * dt;
      m.rotation.y += v.rot * 0.7 * dt;
      m.material.opacity = Math.max(0, 0.9 - (0.1 - m.position.y) * 1.5);
      if (m.position.y < -0.5) m.visible = false;
    });
  });

  return (
    <group>
      {Array.from({ length: COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el: any) => { meshRefs.current[i] = el; }}
          visible={false}
          position={[0, 0.1, 0]}
        >
          <octahedronGeometry args={[0.04, 0]} />
          <meshBasicMaterial color={vels.current[i]?.color ?? '#ff6b8a'} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ---- main Bear3D ------------------------------------------------------------
export default function Bear3D({ props }: { props: Companion3DProps }) {
  const groupRef = useRef<any>(null);
  const headRef = useRef<any>(null);
  const { action, gazeX, reduced } = props;

  const clock = useRef(0);
  useFrame((state) => {
    clock.current = state.clock.elapsedTime;
  });

  const breathe = useRef(0);
  const walkBobPhase = useRef(0);
  const actionStart = useRef(clock.current);
  const prevActionKey = useRef<string | null>(null);

  const actionKey = action ? `${action.kind}-${action.tick}` : null;
  if (actionKey !== prevActionKey.current && action) {
    actionStart.current = clock.current;
    prevActionKey.current = actionKey;
  }
  const ae = action ? clock.current - actionStart.current : 99;

  const jumpY = action?.kind === 'jump'
    ? Math.abs(Math.sin((ae / 0.9) * Math.PI)) * 0.4 * Math.max(0, 1 - ae / 0.9)
    : 0;
  const danceRot = action?.kind === 'dance' ? Math.sin(ae * 8) * 0.3 : 0;
  const waveRot = action?.kind === 'wave' ? Math.sin(ae * 6) * 0.6 * Math.max(0, 1 - ae / 2.3) : 0;
  const headbuttRot = action?.kind === 'headbutt'
    ? Math.sin((ae / 1.3) * Math.PI) * 0.4 * Math.max(0, 1 - ae / 1.3)
    : 0;

  const walking = props.walkDir !== 0;
  if (walking) walkBobPhase.current += 0.16;
  const walkBobY = walking ? Math.abs(Math.sin(walkBobPhase.current)) * 0.08 : 0;

  const nodAngle = props.nod ? Math.sin(clock.current * 20) * 0.2 : 0;
  const winBounce = props.winBounce ? Math.abs(Math.sin(clock.current * 12)) * 0.25 : 0;
  const dozyScale = props.mood === 'drowsy' ? 0.94 + Math.sin(clock.current * 0.8) * 0.03 : 1;
  const headTilt = props.tilt * (Math.PI / 180);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    breathe.current += 0.02;
    const breathScale = 1 + Math.sin(breathe.current) * 0.018;
    group.scale.setScalar(dozyScale * breathScale);
    group.position.y = jumpY + walkBobY + winBounce;
    group.rotation.y = gazeX * 0.3 + danceRot;
    group.rotation.z = headbuttRot;
    if (headRef.current) headRef.current.rotation.z = headTilt;
  });

  const geoQ = reduced ? 8 : 16;

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.32, 0.3, geoQ, geoQ * 2]} />
        <meshToonMaterial color="#a16b45" />
      </mesh>

      <mesh position={[0, -0.05, 0.22]}>
        <sphereGeometry args={[0.22, geoQ, geoQ]} />
        <meshToonMaterial color="#d9a878" />
      </mesh>

      <group ref={headRef} position={[0, 0.45 + nodAngle, 0.1]}>
        <mesh>
          <sphereGeometry args={[0.35, geoQ, geoQ]} />
          <meshToonMaterial color="#a16b45" />
        </mesh>

        <group position={[-0.22, 0.35, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshToonMaterial color="#a16b45" />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <circleGeometry args={[0.06, 12]} />
            <meshToonMaterial color="#e8c4a2" />
          </mesh>
        </group>
        <group position={[0.22, 0.35, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshToonMaterial color="#a16b45" />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <circleGeometry args={[0.06, 12]} />
            <meshToonMaterial color="#e8c4a2" />
          </mesh>
        </group>

        <Eyes blink={props.blink} shy={props.shy} surprised={props.surprised} />
        <BlushCheeks hovered={props.hovered} />
        <Mouth mood={props.mood} surprised={props.surprised} />
        <TearDrops crying={props.crying} />
      </group>

      <mesh position={[0, 0.38, 0.4]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshToonMaterial color="#3d2b1f" />
      </mesh>

      <group position={[-0.48, 0.02, 0.1]}>
        <mesh rotation={[0, 0, waveRot > 0 ? -0.9 : -0.2]}>
          <capsuleGeometry args={[0.09, 0.22, 8, 12]} />
          <meshToonMaterial color="#a16b45" />
        </mesh>
      </group>
      <group position={[0.48, 0.02, 0.1]}>
        <mesh rotation={[0, 0, waveRot > 0 ? 0.6 : 0.2]}>
          <capsuleGeometry args={[0.09, 0.22, 8, 12]} />
          <meshToonMaterial color="#a16b45" />
        </mesh>
      </group>

      <mesh position={[-0.18, -0.38, 0.05]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshToonMaterial color="#a16b45" />
      </mesh>
      <mesh position={[0.18, -0.38, 0.05]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshToonMaterial color="#a16b45" />
      </mesh>

      <mesh position={[0, 0.05, -0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial color="#a16b45" />
      </mesh>

      <HeartBurst clickTick={props.clickTick} />
      <Confetti active={props.winBounce} />
    </group>
  );
}
