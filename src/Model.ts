import type { VisionRange, Tile, Vector2, Vision } from "./types";

type Model = {
  map: Tile[][];
  player: Vector2;
  vision: Vision[];
  visionRange: VisionRange;
};

export default Model;
