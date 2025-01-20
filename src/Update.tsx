import { FOV } from "rot-js";
import { type Message, messages } from "./Message";
import type Model from "./Model";
import { Tile, Vector2, Visibility, VisionRange } from "./types";

export default function Update(model: Model, message: Message): Model {
  switch (message.type) {
    case messages.setMap.type: {
      model.map = message.payload;
      break;
    }
    case messages.setPlayerPosition.type:
      model.player = message.payload;
      break;
    case messages.move.type: {
      model.player = model.player.add(message.payload);
      break;
    }
    case messages.updatePlayerVision.type: {
      const fov = new FOV.PreciseShadowcasting(
        (x, y) => model.map[y]?.[x] !== Tile.Wall,
      );
      model.vision = [];
      fov.compute(
        model.player.x,
        model.player.y,
        model.visionRange,
        (x, y, r, v = 1) => {
          const range: VisionRange = 1 - r / model.visionRange;
          const visibility: Visibility = (v + range) / 2;
          model.vision.push({ p: new Vector2(x, y), v: visibility });
        },
      );
      break;
    }
    case messages.setPlayerVisionRange.type: {
      model.visionRange = message.payload;
      break;
    }
  }
  return model;
}
