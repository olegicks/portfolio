import type { SceneKey } from "../data";
import type { SceneDef } from "./types";
import { appsecScene } from "./AppSecScene";
import { graphScene } from "./GraphScene";
import { carScene } from "./CarScene";
import { cloudScene } from "./CloudScene";

export const scenes: Record<SceneKey, SceneDef> = {
  appsec: appsecScene,
  graph: graphScene,
  car: carScene,
  cloud: cloudScene,
};
