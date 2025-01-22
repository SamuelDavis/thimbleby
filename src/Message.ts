import type { Tile, Vector2, VisionRange } from "./types";

interface Messages {
  noop: void;
  setMap: Tile[][];
  setPlayerPosition: Vector2;
  move: Vector2;
  updatePlayerVision: void;
  setPlayerVisionRange: VisionRange;
  openDoor: Vector2;
}

export type Message = {
  [Type in keyof Messages]: { type: Type; payload: Messages[Type] };
}[keyof Messages];

export const messages = new Proxy(
  {},
  {
    get<Type extends keyof Messages>(_: never, type: Type) {
      const factory = (payload: Messages[Type]) => ({ type, payload });
      factory.type = type;
      return factory;
    },
  },
) as {
  [Type in keyof Messages]: { type: Type } & ((payload: Messages[Type]) => {
    type: Type;
    payload: Messages[Type];
  });
};
