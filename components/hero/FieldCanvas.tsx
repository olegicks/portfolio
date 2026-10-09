"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

type Props = { intro: RefObject<{ value: number }> };

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;
  uniform float uIntro;
  uniform float uScroll;
  uniform vec3 uBg;
  uniform vec3 uLine;
  uniform vec3 uAccent;
  varying vec2 vUv;

  // 2D simplex noise (Ashima Arts)
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float f = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      f += a * snoise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return f;
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.045;

    // Domain-warped terrain that slowly drifts and shifts with scroll
    vec2 q = p * 1.35 + vec2(0.0, uScroll * 0.5);
    vec2 warp = vec2(fbm(q + vec2(t, -t)), fbm(q + vec2(-t, t) + 4.7));
    float h = fbm(q + warp * 0.55 + t * 0.3);

    // The cursor raises a hill in the terrain
    float d = length(p - m);
    float hill = exp(-d * d * 7.0);
    h += 0.38 * hill;

    // Contour lines: thin every step, stronger every fifth
    float v = h * 13.0;
    float minor = 1.0 - smoothstep(0.0, fwidth(v) * 1.25, abs(fract(v + 0.5) - 0.5));
    float v5 = v / 5.0;
    float major = 1.0 - smoothstep(0.0, fwidth(v5) * 1.6, abs(fract(v5 + 0.5) - 0.5));

    // Intro: the map is surveyed outward from the centre, with a glowing front
    float r = length(p);
    float radius = uIntro * 1.9;
    float reveal = 1.0 - smoothstep(radius - 0.35, radius, r);
    float front = (1.0 - smoothstep(0.0, 0.3, abs(r - (radius - 0.18)))) * (1.0 - uIntro);

    vec3 col = uBg + h * 0.05 * uLine;
    float lineAmt = (minor * 0.2 + major * 0.5) * reveal;
    vec3 lineCol = mix(uLine, uAccent, clamp(hill * 1.2 + front * 1.6, 0.0, 1.0));
    col = mix(col, lineCol, clamp(lineAmt * (1.0 + hill * 0.9 + front), 0.0, 1.0));

    float vig = smoothstep(1.3, 0.2, length(p * vec2(0.9, 1.1)));
    col *= mix(0.7, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Field({ intro }: Props) {
  const size = useThree((s) => s.size);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const target = useRef(new THREE.Vector2(0.5, 0.5));
  const reduce = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uIntro: { value: 0 },
      uScroll: { value: 0 },
      uBg: { value: new THREE.Color("#0f1b2e") },
      uLine: { value: new THREE.Color("#7f98bc") },
      uAccent: { value: new THREE.Color("#f2b33d") },
    }),
    [],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) =>
      target.current.set(
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight,
      );
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    if (!reduce) uniforms.uTime.value += dt;
    // Frame-rate independent easing toward the cursor
    mouse.current.lerp(target.current, 1 - Math.pow(0.002, dt));
    uniforms.uMouse.value.copy(mouse.current);
    uniforms.uRes.value.set(size.width, size.height);
    uniforms.uIntro.value = intro.current?.value ?? 1;
    uniforms.uScroll.value = window.scrollY / window.innerHeight;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function FieldCanvas({ intro }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Stop rendering when the hero is scrolled out of view
  useEffect(() => {
    if (!wrap.current) return;
    const io = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Field intro={intro} />
      </Canvas>
    </div>
  );
}
