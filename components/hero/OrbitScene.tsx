"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { heroFocus, introState } from "@/components/background/state";
import { canvasDpr, useQualityScale } from "@/components/perf/quality";
import WebGLBoundary from "@/components/perf/WebGLBoundary";

// Each planet is one of the areas I work in
const ORBITS = [
  {
    r: 1.25,
    speed: 0.55,
    size: 0.075,
    label: "Backend",
    phase: 0.4,
    accent: false,
  },
  {
    r: 1.85,
    speed: 0.38,
    size: 0.1,
    label: "Security",
    phase: 2.1,
    accent: true,
  },
  {
    r: 2.75,
    speed: 0.24,
    size: 0.085,
    label: "Data",
    phase: 4.0,
    accent: false,
  },
  { r: 3.45, speed: 0.17, size: 0.11, label: "AI", phase: 5.3, accent: false },
];
const BELT = { inner: 2.2, outer: 2.45, count: 1400 };

const PAPER = new THREE.Color("#e9eef5");
const CONTOUR = new THREE.Color("#7f98bc");
const SIGNAL = new THREE.Color("#f2b33d");

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.2, "rgba(255,255,255,0.5)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function circleGeometry(r: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

function beltGeometry() {
  const pos = new Float32Array(BELT.count * 3);
  for (let i = 0; i < BELT.count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = BELT.inner + Math.random() * (BELT.outer - BELT.inner);
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.sin(a) * r;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return geo;
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

function System({ labels }: { labels: RefObject<(HTMLSpanElement | null)[]> }) {
  const { size, camera, viewport } = useThree();
  const root = useRef<THREE.Group>(null);
  const roll = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const belt = useRef<THREE.Points>(null);
  const glow = useRef<THREE.Sprite>(null);
  const planets = useRef<(THREE.Group | null)[]>([]);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const reduce = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const glowTex = useMemo(() => makeGlowTexture(), []);
  const orbitGeos = useMemo(() => ORBITS.map((o) => circleGeometry(o.r)), []);
  const beltGeo = useMemo(() => beltGeometry(), []);
  const world = useMemo(() => new THREE.Vector3(), []);
  const core = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    if (!root.current || !roll.current || !tilt.current) return;
    const dt = Math.min(delta, 0.1);
    const t = reduce ? 0 : state.clock.elapsedTime;

    // Place the system: right of the headline on desktop, above it on phones
    const desktop = size.width >= 768;
    const fx = desktop ? 0.72 : 0.5;
    const fyTop = desktop ? 0.42 : 0.3;
    heroFocus.x = fx;
    heroFocus.y = 1 - fyTop;
    const vp = viewport.getCurrentViewport(camera, [0, 0, 0]);
    root.current.position.set(
      (fx - 0.5) * vp.width,
      (0.5 - fyTop) * vp.height,
      0,
    );

    // Grows in with the intro
    const grow = easeOut(
      Math.min(1, Math.max(0, (introState.value - 0.15) / 0.85)),
    );
    const fit = desktop ? 0.85 : (vp.width * 0.95) / 7;
    root.current.scale.setScalar(fit * Math.max(grow, 0.0001));

    // Gentle parallax toward the cursor
    const m = mouse.current;
    const k = 1 - Math.pow(0.02, dt);
    m.x += (m.tx - m.x) * k;
    m.y += (m.ty - m.y) * k;
    roll.current.rotation.z = 0.32 + m.x * 0.08;
    tilt.current.rotation.x = -1.12 + m.y * 0.1;

    // Planets orbit, the belt drifts, the core breathes
    planets.current.forEach((p, i) => {
      if (!p) return;
      const o = ORBITS[i];
      const a = o.phase + t * o.speed;
      p.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r, 0);
    });
    if (belt.current) belt.current.rotation.z = t * 0.05;
    if (glow.current)
      glow.current.scale.setScalar(2.3 + Math.sin(t * 1.4) * 0.18);

    // Move the HTML labels with their planets; dim them when behind the core
    root.current.getWorldPosition(core);
    const coreDepth = core.z;
    planets.current.forEach((p, i) => {
      const el = labels.current?.[i];
      if (!p || !el) return;
      p.getWorldPosition(world);
      const behind = world.z < coreDepth;
      world.project(camera);
      const x = (world.x * 0.5 + 0.5) * size.width;
      const y = (-world.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x + 12}px, ${y - 7}px, 0)`;
      el.style.opacity = String((behind ? 0.3 : 0.9) * grow);
    });
  });

  return (
    <group ref={root}>
      <group ref={roll}>
        <group ref={tilt}>
          {/* Core */}
          <mesh>
            <sphereGeometry args={[0.3, 48, 48]} />
            <meshBasicMaterial color={SIGNAL} />
          </mesh>
          <sprite ref={glow} scale={2.3}>
            <spriteMaterial
              map={glowTex}
              color={SIGNAL}
              transparent
              opacity={0.7}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>

          {/* Orbits */}
          {orbitGeos.map((geo, i) => (
            <lineLoop key={i} geometry={geo}>
              <lineBasicMaterial
                color={CONTOUR}
                transparent
                opacity={0.28}
                depthWrite={false}
              />
            </lineLoop>
          ))}

          {/* Asteroid belt */}
          <points ref={belt} geometry={beltGeo}>
            <pointsMaterial
              color={CONTOUR}
              size={0.028}
              transparent
              opacity={0.75}
              depthWrite={false}
            />
          </points>

          {/* Planets */}
          {ORBITS.map((o, i) => (
            <group
              key={o.label}
              ref={(el) => {
                planets.current[i] = el;
              }}
            >
              <mesh>
                <sphereGeometry args={[o.size, 24, 24]} />
                <meshBasicMaterial color={o.accent ? SIGNAL : PAPER} />
              </mesh>
              <sprite scale={o.size * 7}>
                <spriteMaterial
                  map={glowTex}
                  color={o.accent ? SIGNAL : CONTOUR}
                  transparent
                  opacity={0.6}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </sprite>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

export default function OrbitScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const [visible, setVisible] = useState(true);
  const scale = useQualityScale();

  // Pause rendering once the hero is out of view
  useEffect(() => {
    if (!wrap.current) return;
    const io = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="relative h-full w-full">
      <WebGLBoundary>
        <Canvas
          frameloop={visible ? "always" : "never"}
          camera={{ position: [0, 0, 12], fov: 35 }}
          // Thin orbit lines need more pixels than the terrain, so this never drops below 1x
          dpr={canvasDpr(scale, 2, 1)}
          gl={{ antialias: true, alpha: true }}
        >
          <System labels={labels} />
        </Canvas>
      </WebGLBoundary>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {ORBITS.map((o, i) => (
          <span
            key={o.label}
            ref={(el) => {
              labels.current[i] = el;
            }}
            className="absolute left-0 top-0 whitespace-nowrap font-mono text-[11px] text-paper opacity-0 will-change-transform"
          >
            {o.label}
          </span>
        ))}
      </div>
    </div>
  );
}
