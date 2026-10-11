"use client";

import dynamic from "next/dynamic";

const FieldCanvas = dynamic(() => import("./FieldCanvas"), { ssr: false });

export default function Background() {
  return (
    <div
      className="bg-field pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    >
      <FieldCanvas />
    </div>
  );
}
