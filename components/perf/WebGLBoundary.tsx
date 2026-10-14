"use client";

import { Component, useState, type ReactNode } from "react";

/** True when the browser can create a WebGL context at all (old or blocklisted GPUs may not). */
function hasWebGL() {
  if (supported !== undefined) return supported;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    // Free the probe context right away; browsers cap how many can be alive
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    supported = !!gl;
  } catch {
    supported = false;
  }
  return supported;
}
let supported: boolean | undefined;

class Boundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Renders a WebGL scene only where it can run. Without WebGL, or if the scene fails to start,
 * the fallback is shown and the rest of the page keeps working.
 */
export default function WebGLBoundary({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  // Only ever rendered on the client (the scenes load with ssr: false)
  const [ok] = useState(hasWebGL);
  if (!ok) return fallback;
  return <Boundary fallback={fallback}>{children}</Boundary>;
}
